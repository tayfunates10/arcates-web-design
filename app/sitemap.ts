import type { MetadataRoute } from "next";
import { getPublishedBlogPosts, getPublishedCaseStudies } from "@/lib/cms/content";
import { services } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, blogPosts] = await Promise.all([
    getPublishedCaseStudies(),
    getPublishedBlogPosts(),
  ]);
  const staticRoutes = ["", "/web-cozumleri", "/projelerimiz", "/hakkimizda", "/nasil-calisiyoruz", "/teknolojiler", "/blog", "/destek", "/sss", "/teklif-al", "/iletisim"];
  const routes = [
    ...staticRoutes.map((route) => ({ route, updatedAt: new Date() })),
    ...services.map((service) => ({ route: `/web-cozumleri/${service.slug}`, updatedAt: new Date() })),
    ...projects.map((project) => ({ route: `/projelerimiz/${project.slug}`, updatedAt: project.updatedAt })),
    ...blogPosts.map((post) => ({ route: `/blog/${post.slug}`, updatedAt: post.updatedAt })),
  ];

  return routes.map(({ route, updatedAt }) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: updatedAt,
    changeFrequency: route.startsWith("/blog") ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.split("/").length <= 2 ? 0.8 : 0.7,
  }));
}
