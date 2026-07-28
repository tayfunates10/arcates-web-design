"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { firstValidationError, projectCreateSchema, projectUpdateSchema } from "@/lib/validation";

function projectRedirect(type: "success" | "error", message: string): never {
  redirect(`/admin/projeler?${type}=${encodeURIComponent(message)}`);
}

export async function createProjectAction(formData: FormData) {
  const user = await requireRole(["ADMIN", "OWNER"]);
  const parsed = projectCreateSchema.safeParse({
    organizationId: formData.get("organizationId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    targetDate: formData.get("targetDate"),
  });

  if (!parsed.success) projectRedirect("error", firstValidationError(parsed.error));

  const organization = await db.organization.findUnique({
    where: { id: parsed.data.organizationId },
    include: { members: { select: { userId: true, role: true } } },
  });
  if (!organization) projectRedirect("error", "Seçilen müşteri kuruluşu bulunamadı.");

  try {
    const project = await db.$transaction(async (transaction) => {
      const created = await transaction.project.create({
        data: {
          organizationId: organization.id,
          name: parsed.data.name,
          slug: parsed.data.slug,
          description: parsed.data.description || null,
          targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
          status: "DISCOVERY",
          progress: 0,
        },
      });

      if (organization.members.length) {
        await transaction.projectMember.createMany({
          data: organization.members.map((member) => ({
            projectId: created.id,
            userId: member.userId,
            role: member.role,
          })),
          skipDuplicates: true,
        });
      }

      await transaction.auditLog.create({
        data: {
          actorId: user.id,
          action: "PROJECT_CREATE",
          entityType: "Project",
          entityId: created.id,
          metadata: { organizationId: organization.id, slug: created.slug },
        },
      });

      return created;
    });

    revalidatePath("/admin");
    revalidatePath("/admin/projeler");
    projectRedirect("success", `${project.name} projesi oluşturuldu.`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      projectRedirect("error", "Bu proje slug değeri daha önce kullanılmış.");
    }
    throw error;
  }
}

export async function updateProjectAction(formData: FormData) {
  const user = await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const parsed = projectUpdateSchema.safeParse({
    projectId: formData.get("projectId"),
    status: formData.get("status"),
    progress: formData.get("progress"),
    targetDate: formData.get("targetDate"),
  });

  if (!parsed.success) projectRedirect("error", firstValidationError(parsed.error));

  const project = await db.project.findUnique({ where: { id: parsed.data.projectId } });
  if (!project) projectRedirect("error", "Proje bulunamadı.");

  const progress = parsed.data.status === "COMPLETED" ? 100 : parsed.data.progress;
  const updated = await db.project.update({
    where: { id: project.id },
    data: {
      status: parsed.data.status,
      progress,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
      startedAt: project.startedAt ?? (parsed.data.status !== "DISCOVERY" ? new Date() : null),
    },
  });

  await db.auditLog.create({
    data: {
      actorId: user.id,
      action: "PROJECT_UPDATE",
      entityType: "Project",
      entityId: updated.id,
      metadata: {
        previousStatus: project.status,
        status: updated.status,
        previousProgress: project.progress,
        progress: updated.progress,
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/projeler");
  revalidatePath("/hesabim");
  projectRedirect("success", `${updated.name} projesi güncellendi.`);
}
