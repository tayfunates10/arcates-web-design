"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { firstValidationError, ticketManagementSchema } from "@/lib/validation";

function ticketRedirect(type: "success" | "error", message: string): never {
  redirect(`/admin/destek?${type}=${encodeURIComponent(message)}`);
}

export async function updateSupportTicketAction(formData: FormData) {
  const user = await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const parsed = ticketManagementSchema.safeParse({
    ticketId: formData.get("ticketId"),
    status: formData.get("status"),
    priority: formData.get("priority"),
  });

  if (!parsed.success) ticketRedirect("error", firstValidationError(parsed.error));

  const ticket = await db.supportTicket.findUnique({ where: { id: parsed.data.ticketId } });
  if (!ticket) ticketRedirect("error", "Destek kaydı bulunamadı.");

  const resolved = ["RESOLVED", "CLOSED"].includes(parsed.data.status);
  const updated = await db.supportTicket.update({
    where: { id: ticket.id },
    data: {
      status: parsed.data.status,
      priority: parsed.data.priority,
      resolvedAt: resolved ? ticket.resolvedAt ?? new Date() : null,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: user.id,
      action: "SUPPORT_TICKET_UPDATE",
      entityType: "SupportTicket",
      entityId: updated.id,
      metadata: {
        previousStatus: ticket.status,
        status: updated.status,
        previousPriority: ticket.priority,
        priority: updated.priority,
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/destek");
  revalidatePath("/hesabim");
  ticketRedirect("success", "Destek kaydı güncellendi.");
}
