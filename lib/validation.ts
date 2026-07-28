import { z } from "zod";

const normalizedEmail = z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin.").max(254);
const slugSchema = z.string().trim().toLowerCase()
  .min(3, "Slug en az 3 karakter olmalıdır.")
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug yalnızca küçük harf, sayı ve tire içerebilir.");
const strongPassword = z.string()
  .min(12, "Parola en az 12 karakter olmalıdır.")
  .max(128, "Parola en fazla 128 karakter olabilir.")
  .regex(/[a-zçğıöşü]/, "Parola en az bir küçük harf içermelidir.")
  .regex(/[A-ZÇĞİÖŞÜ]/, "Parola en az bir büyük harf içermelidir.")
  .regex(/[0-9]/, "Parola en az bir sayı içermelidir.");

export const loginSchema = z.object({
  email: normalizedEmail,
  password: z.string().min(1, "Parolanızı girin.").max(128),
});

export const registrationSchema = z.object({
  name: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalıdır.").max(100),
  company: z.string().trim().min(2, "Şirket adı en az 2 karakter olmalıdır.").max(120),
  email: normalizedEmail,
  password: strongPassword,
  consent: z.literal("on", { message: "Gizlilik ve kullanım koşullarını kabul etmelisiniz." }),
});

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  company: z.string().trim().max(120).optional().default(""),
  email: normalizedEmail,
  phone: z.string().trim().max(30).optional().default(""),
  service: z.string().trim().max(100).optional().default(""),
  budget: z.coerce.number().int().min(0).max(100_000_000).optional(),
  description: z.string().trim().min(20, "Proje açıklaması en az 20 karakter olmalıdır.").max(5_000),
  consent: z.literal(true),
});

export const supportTicketSchema = z.object({
  title: z.string().trim().min(5).max(160),
  description: z.string().trim().min(20).max(5_000),
  projectId: z.string().trim().max(100).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});

export const chatMessageSchema = z.object({
  message: z.string().trim().min(1, "Mesaj boş olamaz.").max(2_000, "Mesaj çok uzun."),
  conversationId: z.string().trim().max(100).optional(),
});

export const knowledgeDocumentSchema = z.object({
  title: z.string().trim().min(4, "Başlık en az 4 karakter olmalıdır.").max(160),
  slug: slugSchema,
  content: z.string().trim().min(40, "Bilgi içeriği en az 40 karakter olmalıdır.").max(30_000),
  visibility: z.enum(["PUBLIC", "CUSTOMER", "PROJECT_PRIVATE", "INTERNAL"]),
  projectId: z.string().trim().max(100).optional(),
});

export const projectCreateSchema = z.object({
  organizationId: z.string().trim().min(1, "Müşteri kuruluşu seçilmelidir.").max(100),
  name: z.string().trim().min(3, "Proje adı en az 3 karakter olmalıdır.").max(160),
  slug: slugSchema,
  description: z.string().trim().max(5_000).optional().default(""),
  targetDate: z.string().trim().optional().default("").refine((value) => !value || !Number.isNaN(Date.parse(value)), "Geçerli bir hedef tarih girin."),
});

export const projectUpdateSchema = z.object({
  projectId: z.string().trim().min(1).max(100),
  status: z.enum(["DISCOVERY", "PLANNING", "DESIGN", "DEVELOPMENT", "VALIDATION", "LIVE", "PAUSED", "COMPLETED"]),
  progress: z.coerce.number().int().min(0).max(100),
  targetDate: z.string().trim().optional().default("").refine((value) => !value || !Number.isNaN(Date.parse(value)), "Geçerli bir hedef tarih girin."),
});

export const leadStatusSchema = z.object({
  leadId: z.string().trim().min(1).max(100),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"]),
});

export const ticketManagementSchema = z.object({
  ticketId: z.string().trim().min(1).max(100),
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"]),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
});

export function firstValidationError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Gönderilen bilgiler geçerli değil.";
}
