import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetail, BlogPage, FaqPage, ProjectDetail, ProjectsPage } from "@/components/page-content";
import { AccountPreview, AdminPreview, GenericPage, LegalPage, SupportSubPage } from "@/components/page-general";
import { ServiceDetail, SolutionsPage } from "@/components/page-solutions";
import { getPublishedBlogPost, getPublishedBlogPosts, getPublishedCaseStudies, getPublishedCaseStudy, getPublishedFaqItems } from "@/lib/cms/content";
import { genericPages, services } from "@/lib/content";
import { siteConfig } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string[] }> };

function cleanPath(slug: string[]) {
  return slug.map((part) => decodeURIComponent(part)).join("/");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = cleanPath(slug);
  const service = path.startsWith("web-cozumleri/") ? services.find((item) => item.slug === slug[1]) : undefined;
  const project = path.startsWith("projelerimiz/") ? await getPublishedCaseStudy(slug[1]) : undefined;
  const post = path.startsWith("blog/") ? await getPublishedBlogPost(slug[1]) : undefined;
  const generic = genericPages[path] ?? genericPages[slug[0]];

  const title = service?.title ?? project?.seoTitle ?? project?.title ?? post?.seoTitle ?? post?.title ?? generic?.eyebrow ?? pageTitle(path);
  const description = service?.description ?? project?.seoDescription ?? project?.summary ?? post?.seoDescription ?? post?.excerpt ?? generic?.description ?? siteConfig.description;

  return {
    title,
    description,
    alternates: { canonical: `/${path}` },
    openGraph: { title, description, url: `/${path}`, type: post ? "article" : "website" },
  };
}

export default async function CatchAllPage({ params }: PageProps) {
  const { slug } = await params;
  const path = cleanPath(slug);

  if (path === "web-cozumleri") return <SolutionsPage />;
  if (path.startsWith("web-cozumleri/")) {
    const service = services.find((item) => item.slug === slug[1]);
    return service ? <ServiceDetail service={service} /> : notFound();
  }
  if (path === "projelerimiz") return <ProjectsPage projects={await getPublishedCaseStudies()} />;
  if (path.startsWith("projelerimiz/")) {
    const project = await getPublishedCaseStudy(slug[1]);
    return project ? <ProjectDetail project={project} /> : notFound();
  }
  if (path === "blog") return <BlogPage posts={await getPublishedBlogPosts()} />;
  if (path.startsWith("blog/")) {
    const post = await getPublishedBlogPost(slug[1]);
    return post ? <BlogDetail post={post} /> : notFound();
  }
  if (path === "sss") return <FaqPage items={await getPublishedFaqItems()} />;
  if (path === "hesabim") return <AccountPreview />;
  if (path === "admin") return <AdminPreview />;
  if (["destek/bilgi-merkezi", "destek/destek-talebi", "destek/sistem-durumu", "destek/uzaktan-destek"].includes(path)) {
    return <SupportSubPage path={path} />;
  }
  if (["gizlilik-politikasi", "cerez-politikasi", "kullanim-kosullari", "kvkk"].includes(path)) return <LegalPage path={path} />;

  const generic = genericPages[path] ?? genericPages[slug[0]];
  return generic ? <GenericPage page={generic} path={path} /> : notFound();
}

function pageTitle(path: string) {
  return path.split("/").at(-1)?.split("-").map((word) => word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1)).join(" ") ?? "Arcates";
}
