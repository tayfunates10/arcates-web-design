import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const scryptAsync = promisify(scrypt);
const databaseUrl = process.env.DATABASE_URL ?? "";
const parsedUrl = new URL(databaseUrl);
const databaseName = parsedUrl.pathname.replace(/^\//, "");
const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

if (
  process.env.ARCATES_E2E !== "true"
  || !localHosts.has(parsedUrl.hostname)
  || databaseName !== "arcates_qa"
) {
  throw new Error("QA seed yalnızca ARCATES_E2E=true ve yerel arcates_qa veritabanında çalıştırılabilir.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function hashPassword(password) {
  const salt = randomBytes(16).toString("base64url");
  const key = await scryptAsync(password, salt, 64, {
    N: 16_384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  return `scrypt$16384$8$1$${salt}$${Buffer.from(key).toString("base64url")}`;
}

async function main() {
  const customerEmail = (process.env.ARCATES_QA_CUSTOMER_EMAIL ?? "customer-qa@arcates.local").trim().toLowerCase();
  const customerPassword = process.env.ARCATES_QA_CUSTOMER_PASSWORD ?? "ArcatesQaCustomer2026";
  const passwordHash = await hashPassword(customerPassword);

  const customer = await prisma.user.upsert({
    where: { email: customerEmail },
    update: {
      name: "Arcates QA Customer",
      passwordHash,
      role: "CUSTOMER",
      emailVerifiedAt: new Date(),
    },
    create: {
      name: "Arcates QA Customer",
      email: customerEmail,
      passwordHash,
      role: "CUSTOMER",
      emailVerifiedAt: new Date(),
    },
  });

  const organization = await prisma.organization.upsert({
    where: { slug: "arcates-qa-customer" },
    update: { name: "Arcates QA Customer" },
    create: { name: "Arcates QA Customer", slug: "arcates-qa-customer" },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: customer.id,
      },
    },
    update: { role: "CUSTOMER" },
    create: {
      organizationId: organization.id,
      userId: customer.id,
      role: "CUSTOMER",
    },
  });

  const project = await prisma.project.upsert({
    where: { slug: "arcates-qa-portal" },
    update: {
      name: "Arcates QA Portal",
      description: "Tarayıcı kullanım testleri için izole müşteri projesi.",
      status: "DEVELOPMENT",
      progress: 45,
      organizationId: organization.id,
    },
    create: {
      name: "Arcates QA Portal",
      slug: "arcates-qa-portal",
      description: "Tarayıcı kullanım testleri için izole müşteri projesi.",
      status: "DEVELOPMENT",
      progress: 45,
      organizationId: organization.id,
    },
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: customer.id,
      },
    },
    update: { role: "CUSTOMER" },
    create: {
      projectId: project.id,
      userId: customer.id,
      role: "CUSTOMER",
    },
  });

  const existingTicket = await prisma.supportTicket.findFirst({
    where: { requesterId: customer.id, title: "QA başlangıç destek kaydı" },
  });
  if (!existingTicket) {
    await prisma.supportTicket.create({
      data: {
        requesterId: customer.id,
        organizationId: organization.id,
        projectId: project.id,
        title: "QA başlangıç destek kaydı",
        description: "Müşteri panelinin destek kayıtlarını güvenli biçimde gösterebildiğini doğrulayan izole test kaydıdır.",
        priority: "NORMAL",
      },
    });
  }

  const conversation = await prisma.conversation.upsert({
    where: {
      channel_externalId: {
        channel: "WEB",
        externalId: `qa:user:${customer.id}`,
      },
    },
    update: { organizationId: organization.id, projectId: project.id, status: "AI_ACTIVE" },
    create: {
      channel: "WEB",
      externalId: `qa:user:${customer.id}`,
      organizationId: organization.id,
      projectId: project.id,
      status: "AI_ACTIVE",
    },
  });

  await prisma.conversationParticipant.upsert({
    where: {
      conversationId_userId: {
        conversationId: conversation.id,
        userId: customer.id,
      },
    },
    update: { leftAt: null },
    create: { conversationId: conversation.id, userId: customer.id },
  });

  const conversationMessageCount = await prisma.message.count({ where: { conversationId: conversation.id } });
  if (conversationMessageCount === 0) {
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "USER",
        content: "QA müşteri paneli konuşma görünümü doğrulaması",
        metadata: { source: "QA_SEED" },
      },
    });
  }

  const existingLead = await prisma.lead.findFirst({ where: { title: "QA kurumsal web proje talebi" } });
  if (!existingLead) {
    await prisma.$transaction(async (transaction) => {
      const contact = await transaction.contact.create({
        data: {
          name: "QA Lead",
          company: "Arcates QA",
          email: "lead-qa@arcates.local",
          source: "QA_SEED",
          consentAt: new Date(),
        },
      });
      await transaction.lead.create({
        data: {
          contactId: contact.id,
          title: "QA kurumsal web proje talebi",
          description: "Yönetim panelindeki talep listesinin dolu durumda doğru çalıştığını doğrulayan izole QA kaydı.",
          service: "Kurumsal web sitesi",
          source: "QA_SEED",
        },
      });
    });
  }

  console.log(`QA müşteri hesabı hazır: ${customer.email}`);
  console.log(`QA kuruluş ve proje hazır: ${organization.slug} / ${project.slug}`);
}

main()
  .finally(async () => prisma.$disconnect());
