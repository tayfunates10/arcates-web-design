import { randomBytes, scrypt } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const KEY_LENGTH = 64;

function deriveKey(password, salt) {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString("base64url");
  const key = await deriveKey(password, salt);
  return `scrypt$16384$8$1$${salt}$${key.toString("base64url")}`;
}

async function main() {
  const email = process.env.ARCATES_OWNER_EMAIL?.trim().toLowerCase();
  const password = process.env.ARCATES_OWNER_PASSWORD;
  const name = process.env.ARCATES_OWNER_NAME?.trim() || "Arcates Owner";

  if (!email || !password) {
    throw new Error("ARCATES_OWNER_EMAIL ve ARCATES_OWNER_PASSWORD ortam değişkenleri zorunludur.");
  }
  if (password.length < 12 || !/[a-zçğıöşü]/.test(password) || !/[A-ZÇĞİÖŞÜ]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error("Owner parolası en az 12 karakter, büyük harf, küçük harf ve sayı içermelidir.");
  }

  const passwordHash = await hashPassword(password);
  const owner = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "OWNER" },
    create: { name, email, passwordHash, role: "OWNER", emailVerifiedAt: new Date() },
  });

  console.log(`Arcates owner hesabı hazır: ${owner.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
