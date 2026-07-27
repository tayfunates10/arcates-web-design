import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetail, BlogPage, ProjectDetail, ProjectsPage } from "@/components/page-content";
import { AccountPreview, AdminPreview, GenericPage, LegalPage, SupportSubPage } from "@/components/page-general";
import { ServiceDetail, SolutionsPage } from "@/components/page-solutions";
import { blogPosts, genericPages, projects, services } from "@/lib/content";
import { siteConfig } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string[] }> };

function cleanPath(slug: string[]) {
  return slug.map((part) => decodeURIComponent(part)).join("/");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = cleanPath(slug);
  const service = path.startsWith("web-cozumleri/") ? services.find((item) => item.slug === slug[1]) : undefined;
  const project = path.startsWith("projelerimiz/") ? projects.find((item) => item.slug === slug[1]) : undefined;
  const post = path.startsWith("blog/") ? blogPosts.find((item) => item.slug === slug[1]) : undefined;
  const generic = genericPages[path] ?? genericPages[slug[0]];

  const title = service?.title ?? project?.title ?? post?.title ?? generic?.eyebrow ?? pageTitle(path);
  const description = service?.description ?? project?.summary ?? post?.excerpt ?? generic?.description ?? siteConfig.description;

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
  if (path === "projelerimiz") return <ProjectsPage />;
  if (path.startsWith("projelerimiz/")) {
    const project = projects.find((item) => item.slug === slug[1]);
    return project ? <ProjectDetail project={project} /> : notFound();
  }
  if (path === "blog") return <BlogPage />;
  if (path.startsWith("blog/")) {
    const post = blogPosts.find((item) => item.slug === slug[1]);
    return post ? <BlogDetail post={post} /> : notFound();
  }
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
