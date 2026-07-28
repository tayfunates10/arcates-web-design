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

  if (path === "web-cozumleri") return <main><SolutionsPage /></main>;
  if (path.startsWith("web-cozumleri/")) {
    const service = services.find((item) => item.slug === slug[1]);
    return service ? <main><ServiceDetail service={service} /></main> : notFound();
  }
  if (path === "projelerimiz") return <main><ProjectsPage projects={await getPublishedCaseStudies()} /></main>;
  if (path.startsWith("projelerimiz/")) {
    const project = await getPublishedCaseStudy(slug[1]);
    return project ? <main><ProjectDetail project={project} /></main> : notFound();
  }
  if (path === "blog") return <main><BlogPage posts={await getPublishedBlogPosts()} /></main>;
  if (path.startsWith("blog/")) {
    const post = await getPublishedBlogPost(slug[1]);
    return post ? <main><BlogDetail post={post} /></main> : notFound();
  }
  if (path === "sss") return <main><FaqPage items={await getPublishedFaqItems()} /></main>;
  if (path === "hesabim") return <main><AccountPreview /></main>;
  if (path === "admin") return <main><AdminPreview /></main>;
  if (["destek/bilgi-merkezi", "destek/destek-talebi", "destek/sistem-durumu", "destek/uzaktan-destek"].includes(path)) {
    return <main><SupportSubPage path={path} /></main>;
  }
  if (["gizlilik-politikasi", "cerez-politikasi", "kullanim-kosullari", "kvkk"].includes(path)) return <main><LegalPage path={path} /></main>;

  const generic = genericPages[path] ?? genericPages[slug[0]];
  return generic ? <main><GenericPage page={generic} path={path} /></main> : notFound();
}

function pageTitle(path: string) {
  return path.split("/").at(-1)?.split("-").map((word) => word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1)).join(" ") ?? "Arcates";
}
