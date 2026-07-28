"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { readCmsEnvelope, type CmsEnvelope, type CmsKind } from "@/lib/cms/content";
import { db } from "@/lib/db";
import { cmsBlogSchema, cmsCaseStudySchema, cmsDeleteSchema, cmsFaqSchema, firstValidationError } from "@/lib/validation";

function cmsError(message: string): never {
  redirect(`/admin/icerik?error=${encodeURIComponent(message)}`);
}

function cmsSuccess(message: string): never {
  redirect(`/admin/icerik?success=${encodeURIComponent(message)}`);
}

export async function saveBlogAction(formData: FormData) {
  const user = await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const parsed = cmsBlogSchema.safeParse(formObject(formData, ["id", "slug", "title", "status", "category", "excerpt", "readingTime", "content", "seoTitle", "seoDescription"]));
  if (!parsed.success) cmsError(firstValidationError(parsed.error));

  const data = parsed.data;
  await saveDocument(user.id, "BLOG", data.id, data.slug, data.title, data.content, {
    kind: "BLOG",
    status: data.status,
    category: data.category,
    excerpt: data.excerpt,
    readingTime: data.readingTime,
    seoTitle: data.seoTitle || undefined,
    seoDescription: data.seoDescription || undefined,
    ...(data.status === "PUBLISHED" ? { publishedAt: new Date().toISOString() } : {}),
  });
  refreshCmsPaths(data.slug, "BLOG");
  cmsSuccess(data.id ? "Blog yazısı güncellendi." : "Blog yazısı oluşturuldu.");
}

export async function saveCaseStudyAction(formData: FormData) {
  const user = await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const parsed = cmsCaseStudySchema.safeParse(formObject(formData, ["id", "slug", "title", "status", "category", "excerpt", "problem", "solution", "technical", "result", "metrics", "seoTitle", "seoDescription"]));
  if (!parsed.success) cmsError(firstValidationError(parsed.error));

  const data = parsed.data;
  const metrics = data.metrics.split("\n").map((item) => item.trim()).filter(Boolean).slice(0, 12);
  await saveDocument(user.id, "CASE_STUDY", data.id, data.slug, data.title, data.technical, {
    kind: "CASE_STUDY",
    status: data.status,
    category: data.category,
    excerpt: data.excerpt,
    problem: data.problem,
    solution: data.solution,
    technical: data.technical,
    result: data.result,
    metrics,
    seoTitle: data.seoTitle || undefined,
    seoDescription: data.seoDescription || undefined,
    ...(data.status === "PUBLISHED" ? { publishedAt: new Date().toISOString() } : {}),
  });
  refreshCmsPaths(data.slug, "CASE_STUDY");
  cmsSuccess(data.id ? "Vaka çalışması güncellendi." : "Vaka çalışması oluşturuldu.");
}

export async function saveFaqAction(formData: FormData) {
  const user = await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const parsed = cmsFaqSchema.safeParse(formObject(formData, ["id", "slug", "title", "status", "content", "sortOrder", "seoTitle", "seoDescription"]));
  if (!parsed.success) cmsError(firstValidationError(parsed.error));

  const data = parsed.data;
  await saveDocument(user.id, "FAQ", data.id, data.slug, data.title, data.content, {
    kind: "FAQ",
    status: data.status,
    sortOrder: data.sortOrder,
    seoTitle: data.seoTitle || undefined,
    seoDescription: data.seoDescription || undefined,
    ...(data.status === "PUBLISHED" ? { publishedAt: new Date().toISOString() } : {}),
  });
  refreshCmsPaths(data.slug, "FAQ");
  cmsSuccess(data.id ? "SSS kaydı güncellendi." : "SSS kaydı oluşturuldu.");
}

export async function deleteCmsContentAction(formData: FormData) {
  const user = await requireRole(["ADMIN", "OWNER"]);
  const parsed = cmsDeleteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) cmsError(firstValidationError(parsed.error));

  const document = await db.knowledgeDocument.findUnique({ where: { id: parsed.data.id }, select: { id: true, slug: true, metadata: true } });
  const cms = document ? readCmsEnvelope(document.metadata) : null;
  if (!document || !cms) cmsError("Silinecek CMS içeriği bulunamadı.");

  await db.$transaction([
    db.knowledgeDocument.delete({ where: { id: document.id } }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        action: "CMS_CONTENT_DELETE",
        entityType: "KnowledgeDocument",
        entityId: document.id,
        metadata: { slug: document.slug, kind: cms.kind },
      },
    }),
  ]);
  refreshCmsPaths(document.slug, cms.kind);
  cmsSuccess("İçerik kalıcı olarak silindi.");
}

async function saveDocument(userId: string, kind: CmsKind, id: string, slug: string, title: string, content: string, metadata: CmsEnvelope) {
  try {
    if (id) {
      const current = await db.knowledgeDocument.findUnique({ where: { id }, select: { id: true, metadata: true } });
      const currentCms = current ? readCmsEnvelope(current.metadata) : null;
      if (!current || currentCms?.kind !== kind) cmsError("Güncellenecek içerik bulunamadı veya içerik türü uyuşmuyor.");

      await db.$transaction([
        db.knowledgeDocument.update({
          where: { id },
          data: { slug, title, content, visibility: "PUBLIC", metadata: metadata as Prisma.InputJsonValue },
        }),
        db.auditLog.create({
          data: { actorId: userId, action: "CMS_CONTENT_UPDATE", entityType: "KnowledgeDocument", entityId: id, metadata: { slug, kind, status: metadata.status } },
        }),
      ]);
      return;
    }

    const created = await db.knowledgeDocument.create({
      data: { slug, title, content, visibility: "PUBLIC", metadata: metadata as Prisma.InputJsonValue },
    });
    await db.auditLog.create({
      data: { actorId: userId, action: "CMS_CONTENT_CREATE", entityType: "KnowledgeDocument", entityId: created.id, metadata: { slug, kind, status: metadata.status } },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") cmsError("Bu slug başka bir içerik tarafından kullanılıyor.");
    throw error;
  }
}

function refreshCmsPaths(slug: string, kind: CmsKind) {
  revalidatePath("/admin/icerik");
  revalidatePath("/sitemap.xml");
  if (kind === "BLOG") {
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
  } else if (kind === "CASE_STUDY") {
    revalidatePath("/projelerimiz");
    revalidatePath(`/projelerimiz/${slug}`);
  } else {
    revalidatePath("/sss");
  }
}

function formObject(formData: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((key) => [key, formData.get(key)]));
}
