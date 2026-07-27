import type { MetadataRoute } from "next";
import { blogPosts, projects, services } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/web-cozumleri", "/projelerimiz", "/hakkimizda", "/nasil-calisiyoruz", "/teknolojiler", "/blog", "/destek", "/sss", "/teklif-al", "/iletisim"];
  const routes = [
    ...staticRoutes,
    ...services.map((service) => `/web-cozumleri/${service.slug}`),
    ...projects.map((project) => `/projelerimiz/${project.slug}`),
    ...blogPosts.map((post) => `/blog/${post.slug}`),
  ];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route.startsWith("/blog") ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.split("/").length <= 2 ? 0.8 : 0.7,
  }));
}
