"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { firstValidationError, knowledgeDocumentSchema } from "@/lib/validation";

function knowledgeRedirect(type: "success" | "error", message: string): never {
  redirect(`/admin/bilgi-tabani?${type}=${encodeURIComponent(message)}`);
}

export async function createKnowledgeDocumentAction(formData: FormData) {
  const user = await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const projectId = String(formData.get("projectId") ?? "").trim();
  const parsed = knowledgeDocumentSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content"),
    visibility: formData.get("visibility"),
    projectId: projectId || undefined,
  });

  if (!parsed.success) knowledgeRedirect("error", firstValidationError(parsed.error));
  if (parsed.data.visibility === "PROJECT_PRIVATE" && !parsed.data.projectId) {
    knowledgeRedirect("error", "Projeye özel içerikte proje seçilmelidir.");
  }

  if (parsed.data.projectId) {
    const projectExists = await db.project.count({ where: { id: parsed.data.projectId } });
    if (!projectExists) knowledgeRedirect("error", "Seçilen proje bulunamadı.");
  }

  try {
    const document = await db.knowledgeDocument.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        content: parsed.data.content,
        visibility: parsed.data.visibility,
        projectId: parsed.data.projectId || null,
        metadata: { createdFrom: "ADMIN_PANEL" },
      },
    });

    await db.auditLog.create({
      data: {
        actorId: user.id,
        action: "KNOWLEDGE_DOCUMENT_CREATE",
        entityType: "KnowledgeDocument",
        entityId: document.id,
        metadata: { visibility: document.visibility, slug: document.slug },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      knowledgeRedirect("error", "Bu slug daha önce kullanılmış.");
    }
    throw error;
  }

  revalidatePath("/admin/bilgi-tabani");
  knowledgeRedirect("success", "Bilgi belgesi oluşturuldu.");
}

export async function deleteKnowledgeDocumentAction(formData: FormData) {
  const user = await requireRole(["ADMIN", "OWNER"]);
  const documentId = String(formData.get("documentId") ?? "").trim();
  if (!documentId) knowledgeRedirect("error", "Silinecek belge belirtilmedi.");

  const document = await db.knowledgeDocument.findUnique({ where: { id: documentId } });
  if (!document) knowledgeRedirect("error", "Bilgi belgesi bulunamadı.");

  await db.$transaction([
    db.knowledgeDocument.delete({ where: { id: document.id } }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        action: "KNOWLEDGE_DOCUMENT_DELETE",
        entityType: "KnowledgeDocument",
        entityId: document.id,
        metadata: { slug: document.slug, visibility: document.visibility },
      },
    }),
  ]);

  revalidatePath("/admin/bilgi-tabani");
  knowledgeRedirect("success", "Bilgi belgesi silindi.");
}
