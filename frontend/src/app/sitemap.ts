import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aimetra.institution.edu";
  const now = new Date();

  const publicRoutes = [
    { path: "", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/people", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/programs", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/courses", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/research", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/events", changeFrequency: "daily" as const, priority: 0.8 },
    { path: "/opportunities", changeFrequency: "daily" as const, priority: 0.8 },
    { path: "/contact", changeFrequency: "yearly" as const, priority: 0.7 },
    { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.5 },
    { path: "/terms", changeFrequency: "yearly" as const, priority: 0.5 },
    { path: "/security", changeFrequency: "yearly" as const, priority: 0.5 },
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
