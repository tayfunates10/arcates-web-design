"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { firstValidationError, leadStatusSchema } from "@/lib/validation";

function leadRedirect(type: "success" | "error", message: string): never {
  redirect(`/admin/talepler?${type}=${encodeURIComponent(message)}`);
}

export async function updateLeadStatusAction(formData: FormData) {
  const user = await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const parsed = leadStatusSchema.safeParse({
    leadId: formData.get("leadId"),
    status: formData.get("status"),
  });

  if (!parsed.success) leadRedirect("error", firstValidationError(parsed.error));

  const lead = await db.lead.findUnique({ where: { id: parsed.data.leadId } });
  if (!lead) leadRedirect("error", "Proje talebi bulunamadı.");

  const updated = await db.lead.update({
    where: { id: lead.id },
    data: { status: parsed.data.status },
  });

  await db.auditLog.create({
    data: {
      actorId: user.id,
      action: "LEAD_STATUS_UPDATE",
      entityType: "Lead",
      entityId: updated.id,
      metadata: { previousStatus: lead.status, status: updated.status },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/talepler");
  leadRedirect("success", "Proje talebinin satış aşaması güncellendi.");
}
