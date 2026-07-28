import "server-only";

import { blogPosts, faqItems, projects } from "@/lib/content";
import { databaseConfigured, db } from "@/lib/db";

export type CmsStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type CmsKind = "BLOG" | "CASE_STUDY" | "FAQ";

export type BlogEntry = {
  id?: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readingTime: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt: Date;
};

export type CaseStudyEntry = {
  id?: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  result: string;
  metrics: string[];
  problem: string;
  solution: string;
  technical: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt: Date;
};

export type FaqEntry = {
  id?: string;
  slug: string;
  question: string;
  answer: string;
  sortOrder: number;
  updatedAt: Date;
};

export type CmsEnvelope = {
  kind: CmsKind;
  status: CmsStatus;
  category?: string;
  excerpt?: string;
  readingTime?: string;
  metrics?: string[];
  problem?: string;
  solution?: string;
  technical?: string;
  result?: string;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
};

type CmsDocument = {
  id: string;
  slug: string;
  title: string;
  content: string;
  metadata: unknown;
  updatedAt: Date;
};

const fallbackArticle = [
  "Başarılı bir dijital sistem, görünüm ile teknik altyapının aynı hedef doğrultusunda planlanmasıyla oluşur.",
  "## Hedefi ve başarı ölçütünü tanımlayın",
  "Sistem kim için, hangi problemi çözüyor ve başarısı hangi ölçümle doğrulanacak? İçerik, kullanıcı akışı ve teknik kapsam bu cevaplara göre kurulmalıdır.",
  "## Bilgi mimarisini kullanıcı niyetine göre kurun",
  "Menü listesinden önce kullanıcının hangi bilgiye hangi sırayla ihtiyaç duyduğunu belirleyin. Ana görevler kısa ve kesintisiz akışlar hâlinde sunulmalıdır.",
  "## Performans, SEO ve güvenliği başlangıca taşıyın",
  "Semantik HTML, doğru metadata, düşük istemci JavaScript'i, yetkilendirme ve ölçüm sistemi sonradan eklenen iyileştirmeler değil temel mimari kararlarıdır.",
].join("\n\n");

const fallbackBlogs: BlogEntry[] = blogPosts.map((post) => ({
  slug: post.slug,
  title: post.title,
  category: post.category,
  excerpt: post.excerpt,
  readingTime: post.readingTime,
  content: fallbackArticle,
  updatedAt: new Date(0),
}));

const fallbackCases: CaseStudyEntry[] = projects.map((project) => ({
  slug: project.slug,
  title: project.title,
  category: project.category,
  summary: project.summary,
  result: project.result,
  metrics: [...project.metrics],
  problem: "Kullanıcı ihtiyacını, operasyon kısıtlarını ve kalite beklentisini tek ürün akışında birleştiren sürdürülebilir bir sistem gereksinimi.",
  solution: "Modüler mimari, doğrulama katmanları, yönetilebilir arayüz ve ölçülebilir performans hedefleriyle aşamalı geliştirme.",
  technical: "Web uygulaması, görev akışları, veri modeli, güvenli servisler, raporlama ve üretim sonrası izleme birlikte tasarlandı.",
  updatedAt: new Date(0),
}));

const fallbackFaqs: FaqEntry[] = faqItems.map((item, index) => ({
  slug: `faq-${index + 1}`,
  question: item.question,
  answer: item.answer,
  sortOrder: index,
  updatedAt: new Date(0),
}));

export function readCmsEnvelope(metadata: unknown): CmsEnvelope | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const cms = (metadata as Record<string, unknown>).cms;
  if (!cms || typeof cms !== "object" || Array.isArray(cms)) return null;
  const value = cms as Record<string, unknown>;
  if (!isCmsKind(value.kind) || !isCmsStatus(value.status)) return null;

  return {
    kind: value.kind,
    status: value.status,
    category: stringValue(value.category),
    excerpt: stringValue(value.excerpt),
    readingTime: stringValue(value.readingTime),
    metrics: stringArray(value.metrics),
    problem: stringValue(value.problem),
    solution: stringValue(value.solution),
    technical: stringValue(value.technical),
    result: stringValue(value.result),
    sortOrder: numberValue(value.sortOrder),
    seoTitle: stringValue(value.seoTitle),
    seoDescription: stringValue(value.seoDescription),
    publishedAt: stringValue(value.publishedAt),
  };
}

export async function getPublishedBlogPosts(): Promise<BlogEntry[]> {
  const documents = await cmsDocuments();
  const entries = documents.flatMap((document) => {
    const cms = readCmsEnvelope(document.metadata);
    return cms?.kind === "BLOG" && cms.status === "PUBLISHED" ? [toBlog(document, cms)] : [];
  });
  return entries.length ? entries.sort(byNewest) : fallbackBlogs;
}

export async function getPublishedBlogPost(slug: string): Promise<BlogEntry | null> {
  const documents = await cmsDocuments();
  const document = documents.find((item) => item.slug === slug);
  const cms = document ? readCmsEnvelope(document.metadata) : null;
  if (document && cms?.kind === "BLOG" && cms.status === "PUBLISHED") return toBlog(document, cms);
  return fallbackBlogs.find((item) => item.slug === slug) ?? null;
}

export async function getPublishedCaseStudies(): Promise<CaseStudyEntry[]> {
  const documents = await cmsDocuments();
  const entries = documents.flatMap((document) => {
    const cms = readCmsEnvelope(document.metadata);
    return cms?.kind === "CASE_STUDY" && cms.status === "PUBLISHED" ? [toCase(document, cms)] : [];
  });
  return entries.length ? entries.sort(byNewest) : fallbackCases;
}

export async function getPublishedCaseStudy(slug: string): Promise<CaseStudyEntry | null> {
  const documents = await cmsDocuments();
  const document = documents.find((item) => item.slug === slug);
  const cms = document ? readCmsEnvelope(document.metadata) : null;
  if (document && cms?.kind === "CASE_STUDY" && cms.status === "PUBLISHED") return toCase(document, cms);
  return fallbackCases.find((item) => item.slug === slug) ?? null;
}

export async function getPublishedFaqItems(): Promise<FaqEntry[]> {
  const documents = await cmsDocuments();
  const entries = documents.flatMap((document) => {
    const cms = readCmsEnvelope(document.metadata);
    return cms?.kind === "FAQ" && cms.status === "PUBLISHED" ? [toFaq(document, cms)] : [];
  });
  return entries.length ? entries.sort((left, right) => left.sortOrder - right.sortOrder) : fallbackFaqs;
}

async function cmsDocuments(): Promise<CmsDocument[]> {
  if (!databaseConfigured()) return [];
  try {
    return await db.knowledgeDocument.findMany({
      where: { visibility: "PUBLIC" },
      select: { id: true, slug: true, title: true, content: true, metadata: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 500,
    });
  } catch (error) {
    console.error("CMS content query failed", error);
    return [];
  }
}

function toBlog(document: CmsDocument, cms: CmsEnvelope): BlogEntry {
  return {
    id: document.id,
    slug: document.slug,
    title: document.title,
    category: cms.category || "Rehber",
    excerpt: cms.excerpt || document.content.slice(0, 180),
    readingTime: cms.readingTime || "6 dakika",
    content: document.content,
    seoTitle: cms.seoTitle,
    seoDescription: cms.seoDescription,
    updatedAt: document.updatedAt,
  };
}

function toCase(document: CmsDocument, cms: CmsEnvelope): CaseStudyEntry {
  return {
    id: document.id,
    slug: document.slug,
    title: document.title,
    category: cms.category || "Dijital Ürün",
    summary: cms.excerpt || document.content.slice(0, 180),
    result: cms.result || "Ölçülebilir, yönetilebilir ve sürdürülebilir dijital sistem.",
    metrics: cms.metrics?.length ? cms.metrics : ["Modüler mimari", "Güvenli operasyon", "Ölçülebilir sonuç"],
    problem: cms.problem || "Başlangıç problemi doğrulanmış proje kapsamına dönüştürüldü.",
    solution: cms.solution || "Kullanıcı akışları ve teknik gereksinimler aşamalı bir çözüm planında birleştirildi.",
    technical: cms.technical || document.content,
    seoTitle: cms.seoTitle,
    seoDescription: cms.seoDescription,
    updatedAt: document.updatedAt,
  };
}

function toFaq(document: CmsDocument, cms: CmsEnvelope): FaqEntry {
  return {
    id: document.id,
    slug: document.slug,
    question: document.title,
    answer: document.content,
    sortOrder: cms.sortOrder ?? 0,
    updatedAt: document.updatedAt,
  };
}

function isCmsKind(value: unknown): value is CmsKind {
  return value === "BLOG" || value === "CASE_STUDY" || value === "FAQ";
}

function isCmsStatus(value: unknown): value is CmsStatus {
  return value === "DRAFT" || value === "PUBLISHED" || value === "ARCHIVED";
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim()) : undefined;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function byNewest(left: { updatedAt: Date }, right: { updatedAt: Date }) {
  return right.updatedAt.getTime() - left.updatedAt.getTime();
}
