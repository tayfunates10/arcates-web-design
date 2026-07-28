import "server-only";

import { cookies } from "next/headers";
import { db } from "@/lib/db";

const GUEST_COOKIE = "arcates_guest";

export async function mergeGuestWebConversation(userId: string) {
  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_COOKIE)?.value;
  if (!guestId) return null;

  const guestExternalId = `web:guest:${guestId}`;
  const userExternalId = `web:user:${userId}`;

  const [guestConversation, userConversation] = await Promise.all([
    db.conversation.findUnique({
      where: { channel_externalId: { channel: "WEB", externalId: guestExternalId } },
    }),
    db.conversation.findUnique({
      where: { channel_externalId: { channel: "WEB", externalId: userExternalId } },
    }),
  ]);

  if (!guestConversation) {
    cookieStore.delete(GUEST_COOKIE);
    return null;
  }

  const mergedConversation = await db.$transaction(async (transaction) => {
    if (!userConversation) {
      const updated = await transaction.conversation.update({
        where: { id: guestConversation.id },
        data: { externalId: userExternalId },
      });

      await transaction.conversationParticipant.upsert({
        where: { conversationId_userId: { conversationId: updated.id, userId } },
        update: { leftAt: null },
        create: { conversationId: updated.id, userId },
      });

      await transaction.auditLog.create({
        data: {
          actorId: userId,
          action: "GUEST_CONVERSATION_CLAIM",
          entityType: "Conversation",
          entityId: updated.id,
        },
      });

      return updated;
    }

    if (userConversation.id === guestConversation.id) return userConversation;

    await transaction.message.updateMany({
      where: { conversationId: guestConversation.id },
      data: { conversationId: userConversation.id },
    });

    await transaction.supportTicket.updateMany({
      where: { conversationId: guestConversation.id },
      data: { conversationId: userConversation.id },
    });

    const guestNeedsHuman = ["WAITING", "HUMAN_ACTIVE"].includes(guestConversation.status);
    const updated = await transaction.conversation.update({
      where: { id: userConversation.id },
      data: guestNeedsHuman
        ? {
            status: guestConversation.status,
            assignedUserId: guestConversation.assignedUserId,
            closedAt: null,
          }
        : {},
    });

    await transaction.conversationParticipant.upsert({
      where: { conversationId_userId: { conversationId: updated.id, userId } },
      update: { leftAt: null },
      create: { conversationId: updated.id, userId },
    });

    await transaction.conversation.delete({ where: { id: guestConversation.id } });
    await transaction.auditLog.create({
      data: {
        actorId: userId,
        action: "GUEST_CONVERSATION_MERGE",
        entityType: "Conversation",
        entityId: updated.id,
        metadata: { sourceConversationId: guestConversation.id },
      },
    });

    return updated;
  });

  cookieStore.delete(GUEST_COOKIE);
  return mergedConversation;
}
