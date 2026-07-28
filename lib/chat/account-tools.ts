import "server-only";

import { createHash, randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

const ACTION_TTL_MS = 10 * 60 * 1000;

type AccountToolRequest = {
  message: string;
  userId: string;
  conversationId: string;
};

type ToolReply = {
  text: string;
  source: string;
  knowledgeTitles: string[];
};

type SupportPayload = {
  title: string;
  description: string;
  priority: "NORMAL";
};

function hashActionCode(code: string) {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

export async function handleAccountChatAction(request: AccountToolRequest): Promise<ToolReply | null> {
  const message = request.message.trim();
  const upper = message.toLocaleUpperCase("tr-TR");
  const confirmationCode = upper.match(/\bONAYLA\s+(ACT-[0-9]{6})\b/)?.[1];
  const cancellationCode = upper.match(/\bİPTAL\s+(ACT-[0-9]{6})\b/)?.[1]
    ?? upper.match(/\bIPTAL\s+(ACT-[0-9]{6})\b/)?.[1];

  if (confirmationCode) return confirmPendingAction(request.userId, confirmationCode);
  if (cancellationCode) return cancelPendingAction(request.userId, cancellationCode);

  if (/\b(projelerim|proje durumum|proje durumları|projelerimin durumu)\b/i.test(message)) {
    return listProjects(request.userId);
  }

  if (/\b(destek taleplerim|açık destek|destek kayıtlarım|destek durumum)\b/i.test(message)) {
    return listSupportTickets(request.userId);
  }

  if (/\b(hesap bilgilerim|profilim|şirketim|firma bilgilerim)\b/i.test(message)) {
    return showAccountSummary(request.userId);
  }

  const supportRequest = message.match(/^destek(?: talebi)? oluştur\s*:\s*(.+)$/i);
  if (supportRequest) {
    const [rawTitle, ...descriptionParts] = supportRequest[1].split("|");
    const title = rawTitle?.trim() ?? "";
    const description = descriptionParts.join("|").trim();

    if (title.length < 5 || description.length < 20) {
      return reply(
        "Destek talebi için şu biçimi kullanın: Destek oluştur: Kısa başlık | Sorunu, beklenen sonucu ve tekrar adımlarını en az 20 karakterle açıklayın.",
        "ACCOUNT_TOOL_GUIDANCE",
      );
    }

    return createPendingSupportAction(request.userId, request.conversationId, {
      title: title.slice(0, 160),
      description: description.slice(0, 5_000),
      priority: "NORMAL",
    });
  }

  if (/\bdestek(?: talebi)? oluştur\b/i.test(message)) {
    return reply(
      "Güvenli destek kaydı başlatmak için şu biçimi kullanın: Destek oluştur: Kısa başlık | Sorunu, beklenen sonucu ve tekrar adımlarını yazın. Önce bir onay kodu üretilecek; açık onayınız olmadan kayıt oluşturulmayacak.",
      "ACCOUNT_TOOL_GUIDANCE",
    );
  }

  return null;
}

async function listProjects(userId: string): Promise<ToolReply> {
  const projects = await db.project.findMany({
    where: { members: { some: { userId } } },
    orderBy: { updatedAt: "desc" },
    take: 8,
    select: { name: true, status: true, progress: true, targetDate: true },
  });

  if (!projects.length) return reply("Hesabınıza bağlı bir proje bulunmuyor.", "ACCOUNT_TOOL_PROJECTS");

  const lines = projects.map((project, index) => {
    const target = project.targetDate
      ? `, hedef ${new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(project.targetDate)}`
      : "";
    return `${index + 1}. ${project.name}: ${project.status}, yüzde ${project.progress}${target}`;
  });

  return reply(`Hesabınıza bağlı projeler:\n${lines.join("\n")}`, "ACCOUNT_TOOL_PROJECTS");
}

async function listSupportTickets(userId: string): Promise<ToolReply> {
  const tickets = await db.supportTicket.findMany({
    where: { requesterId: userId },
    orderBy: { updatedAt: "desc" },
    take: 8,
    select: { id: true, title: true, status: true, priority: true, updatedAt: true },
  });

  if (!tickets.length) return reply("Hesabınızda destek kaydı bulunmuyor.", "ACCOUNT_TOOL_SUPPORT_LIST");

  const lines = tickets.map((ticket, index) => (
    `${index + 1}. ${ticket.title}: ${ticket.status}, öncelik ${ticket.priority}, güncelleme ${new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(ticket.updatedAt)}`
  ));

  return reply(`Son destek kayıtlarınız:\n${lines.join("\n")}`, "ACCOUNT_TOOL_SUPPORT_LIST");
}

async function showAccountSummary(userId: string): Promise<ToolReply> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      memberships: {
        take: 5,
        select: { organization: { select: { name: true } }, role: true },
      },
      channelConnections: {
        where: { verifiedAt: { not: null }, revokedAt: null },
        select: { channel: true },
      },
    },
  });

  if (!user) return reply("Hesap bilgileri bulunamadı.", "ACCOUNT_TOOL_PROFILE");

  const organizations = user.memberships.length
    ? user.memberships.map((membership) => `${membership.organization.name} (${membership.role})`).join(", ")
    : "Kuruluş üyeliği yok";
  const channels = user.channelConnections.length
    ? user.channelConnections.map((connection) => connection.channel).join(", ")
    : "Doğrulanmış ek kanal yok";

  return reply(
    `Hesap özeti:\nAd: ${user.name}\nE-posta: ${user.email}\nKuruluşlar: ${organizations}\nBağlı kanallar: ${channels}`,
    "ACCOUNT_TOOL_PROFILE",
  );
}

async function createPendingSupportAction(userId: string, conversationId: string, payload: SupportPayload): Promise<ToolReply> {
  await db.pendingAction.updateMany({
    where: {
      userId,
      actionType: "CREATE_SUPPORT_TICKET",
      confirmedAt: null,
      cancelledAt: null,
    },
    data: { cancelledAt: new Date() },
  });

  const code = `ACT-${randomInt(100_000, 1_000_000)}`;
  const expiresAt = new Date(Date.now() + ACTION_TTL_MS);
  const pending = await db.pendingAction.create({
    data: {
      userId,
      conversationId,
      actionType: "CREATE_SUPPORT_TICKET",
      tokenHash: hashActionCode(code),
      payload: payload as Prisma.InputJsonValue,
      expiresAt,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: userId,
      action: "CHAT_ACTION_PREPARE",
      entityType: "PendingAction",
      entityId: pending.id,
      metadata: { actionType: pending.actionType, title: payload.title },
    },
  });

  return reply(
    `Destek kaydı henüz oluşturulmadı.\nBaşlık: ${payload.title}\nAçıklama: ${payload.description}\n\nOnaylamak için 10 dakika içinde “ONAYLA ${code}” yazın. Vazgeçmek için “İPTAL ${code}” yazın.`,
    "ACCOUNT_TOOL_CONFIRMATION_REQUIRED",
  );
}

async function confirmPendingAction(userId: string, code: string): Promise<ToolReply> {
  const now = new Date();

  const result = await db.$transaction(async (transaction) => {
    const pending = await transaction.pendingAction.findUnique({
      where: { tokenHash: hashActionCode(code) },
    });

    if (
      !pending
      || pending.userId !== userId
      || pending.confirmedAt
      || pending.cancelledAt
      || pending.expiresAt <= now
    ) {
      return null;
    }

    const claimed = await transaction.pendingAction.updateMany({
      where: {
        id: pending.id,
        confirmedAt: null,
        cancelledAt: null,
        expiresAt: { gt: now },
      },
      data: { confirmedAt: now },
    });
    if (claimed.count !== 1) return null;

    if (pending.actionType === "CREATE_SUPPORT_TICKET") {
      const payload = pending.payload as unknown as SupportPayload;
      const membership = await transaction.organizationMember.findFirst({
        where: { userId },
        select: { organizationId: true },
      });
      const ticket = await transaction.supportTicket.create({
        data: {
          requesterId: userId,
          organizationId: membership?.organizationId,
          conversationId: pending.conversationId,
          title: payload.title,
          description: payload.description,
          priority: payload.priority,
        },
      });
      await transaction.auditLog.create({
        data: {
          actorId: userId,
          action: "CHAT_ACTION_EXECUTE",
          entityType: "SupportTicket",
          entityId: ticket.id,
          metadata: { pendingActionId: pending.id },
        },
      });
      return { ticketId: ticket.id, title: ticket.title };
    }

    return null;
  });

  if (!result) {
    return reply("Onay kodu geçersiz, kullanılmış, başka bir hesaba ait veya süresi dolmuş.", "ACCOUNT_TOOL_CONFIRMATION_REJECTED");
  }

  return reply(`Destek talebiniz oluşturuldu.\nBaşlık: ${result.title}\nReferans: ${result.ticketId}`, "ACCOUNT_TOOL_ACTION_EXECUTED");
}

async function cancelPendingAction(userId: string, code: string): Promise<ToolReply> {
  const pending = await db.pendingAction.findUnique({ where: { tokenHash: hashActionCode(code) } });
  if (!pending || pending.userId !== userId || pending.confirmedAt || pending.cancelledAt || pending.expiresAt <= new Date()) {
    return reply("İptal kodu geçersiz, kullanılmış veya süresi dolmuş.", "ACCOUNT_TOOL_CANCELLATION_REJECTED");
  }

  const cancelled = await db.pendingAction.updateMany({
    where: { id: pending.id, confirmedAt: null, cancelledAt: null },
    data: { cancelledAt: new Date() },
  });

  if (cancelled.count !== 1) return reply("İşlem daha önce sonuçlandırılmış.", "ACCOUNT_TOOL_CANCELLATION_REJECTED");

  await db.auditLog.create({
    data: {
      actorId: userId,
      action: "CHAT_ACTION_CANCEL",
      entityType: "PendingAction",
      entityId: pending.id,
    },
  });

  return reply("Bekleyen işlem iptal edildi. Herhangi bir destek kaydı oluşturulmadı.", "ACCOUNT_TOOL_ACTION_CANCELLED");
}

function reply(text: string, source: string): ToolReply {
  return { text, source, knowledgeTitles: [] };
}
