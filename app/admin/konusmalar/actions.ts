"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { sendWhatsAppText, whatsappConfigured } from "@/lib/whatsapp/client";
import { agentMessageSchema, conversationOperationSchema, firstValidationError } from "@/lib/validation";

function conversationRedirect(conversationId: string, type: "success" | "error", message: string): never {
  redirect(`/admin/konusmalar?conversation=${encodeURIComponent(conversationId)}&${type}=${encodeURIComponent(message)}`);
}

export async function assignConversationAction(formData: FormData) {
  const user = await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const parsed = conversationOperationSchema.safeParse({ conversationId: formData.get("conversationId") });
  if (!parsed.success) conversationRedirect("", "error", firstValidationError(parsed.error));

  const conversation = await db.conversation.findUnique({ where: { id: parsed.data.conversationId } });
  if (!conversation) conversationRedirect(parsed.data.conversationId, "error", "Konuşma bulunamadı.");

  if (conversation.assignedUserId && conversation.assignedUserId !== user.id && user.role === "STAFF") {
    conversationRedirect(conversation.id, "error", "Bu konuşma başka bir temsilciye atanmış.");
  }

  await db.$transaction([
    db.conversation.update({
      where: { id: conversation.id },
      data: { status: "HUMAN_ACTIVE", assignedUserId: user.id, closedAt: null },
    }),
    db.message.create({
      data: {
        conversationId: conversation.id,
        role: "SYSTEM",
        content: `${user.name} görüşmeye katıldı.`,
        metadata: { source: "HUMAN_ASSIGNMENT", agentId: user.id },
      },
    }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        action: "CONVERSATION_ASSIGN",
        entityType: "Conversation",
        entityId: conversation.id,
      },
    }),
  ]);

  revalidateConversationPages();
  conversationRedirect(conversation.id, "success", "Konuşma size atandı.");
}

export async function sendAgentMessageAction(formData: FormData) {
  const user = await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const parsed = agentMessageSchema.safeParse({
    conversationId: formData.get("conversationId"),
    message: formData.get("message"),
  });
  if (!parsed.success) conversationRedirect(String(formData.get("conversationId") ?? ""), "error", firstValidationError(parsed.error));

  const conversation = await db.conversation.findUnique({
    where: { id: parsed.data.conversationId },
    include: { contact: { select: { phone: true } } },
  });
  if (!conversation) conversationRedirect(parsed.data.conversationId, "error", "Konuşma bulunamadı.");
  if (conversation.status === "CLOSED") conversationRedirect(conversation.id, "error", "Kapalı konuşmaya mesaj gönderilemez.");
  if (conversation.assignedUserId && conversation.assignedUserId !== user.id && user.role === "STAFF") {
    conversationRedirect(conversation.id, "error", "Bu konuşma başka bir temsilciye atanmış.");
  }

  let externalId: string | null = null;
  let delivery = "WEB_HISTORY";

  if (conversation.channel === "WHATSAPP") {
    const phone = conversation.contact?.phone;
    if (!phone) conversationRedirect(conversation.id, "error", "WhatsApp alıcısının telefon kimliği bulunamadı.");
    if (!whatsappConfigured()) conversationRedirect(conversation.id, "error", "WhatsApp gönderim ayarları henüz yapılandırılmadı.");
    externalId = await sendWhatsAppText({ to: phone, body: parsed.data.message });
    delivery = "SENT";
  }

  await db.$transaction([
    db.conversation.update({
      where: { id: conversation.id },
      data: { status: "HUMAN_ACTIVE", assignedUserId: user.id, closedAt: null },
    }),
    db.message.create({
      data: {
        conversationId: conversation.id,
        externalId,
        role: "AGENT",
        content: parsed.data.message,
        metadata: { source: "HUMAN_AGENT", agentId: user.id, agentName: user.name, delivery },
      },
    }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        action: "CONVERSATION_AGENT_MESSAGE",
        entityType: "Conversation",
        entityId: conversation.id,
        metadata: { channel: conversation.channel, delivery },
      },
    }),
  ]);

  revalidateConversationPages();
  conversationRedirect(conversation.id, "success", "Temsilci mesajı gönderildi.");
}

export async function closeConversationAction(formData: FormData) {
  const user = await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const parsed = conversationOperationSchema.safeParse({ conversationId: formData.get("conversationId") });
  if (!parsed.success) conversationRedirect("", "error", firstValidationError(parsed.error));

  const conversation = await db.conversation.findUnique({ where: { id: parsed.data.conversationId } });
  if (!conversation) conversationRedirect(parsed.data.conversationId, "error", "Konuşma bulunamadı.");

  await db.$transaction([
    db.conversation.update({
      where: { id: conversation.id },
      data: { status: "CLOSED", closedAt: new Date(), assignedUserId: null },
    }),
    db.message.create({
      data: {
        conversationId: conversation.id,
        role: "SYSTEM",
        content: "Görüşme temsilci tarafından kapatıldı. Yeni mesaj gönderildiğinde AI yönlendirmesiyle yeniden açılır.",
        metadata: { source: "HUMAN_CONVERSATION_CLOSED", agentId: user.id },
      },
    }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        action: "CONVERSATION_CLOSE",
        entityType: "Conversation",
        entityId: conversation.id,
      },
    }),
  ]);

  revalidateConversationPages();
  conversationRedirect(conversation.id, "success", "Konuşma kapatıldı.");
}

export async function resumeAiConversationAction(formData: FormData) {
  const user = await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const parsed = conversationOperationSchema.safeParse({ conversationId: formData.get("conversationId") });
  if (!parsed.success) conversationRedirect("", "error", firstValidationError(parsed.error));

  const conversation = await db.conversation.findUnique({ where: { id: parsed.data.conversationId } });
  if (!conversation) conversationRedirect(parsed.data.conversationId, "error", "Konuşma bulunamadı.");

  await db.$transaction([
    db.conversation.update({
      where: { id: conversation.id },
      data: { status: "AI_ACTIVE", assignedUserId: null, closedAt: null },
    }),
    db.message.create({
      data: {
        conversationId: conversation.id,
        role: "SYSTEM",
        content: "AI çözüm yönlendirmesi yeniden etkinleştirildi.",
        metadata: { source: "AI_RESUMED_BY_AGENT", agentId: user.id },
      },
    }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        action: "CONVERSATION_RESUME_AI",
        entityType: "Conversation",
        entityId: conversation.id,
      },
    }),
  ]);

  revalidateConversationPages();
  conversationRedirect(conversation.id, "success", "AI yönlendirmesi yeniden etkinleştirildi.");
}

function revalidateConversationPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/konusmalar");
  revalidatePath("/hesabim");
}
