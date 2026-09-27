import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aimetra.institution.edu";

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/about",
        "/people",
        "/programs",
        "/courses",
        "/research",
        "/events",
        "/opportunities",
        "/contact",
        "/privacy",
        "/terms",
        "/security",
        "/login",
        "/signup",
      ],
      disallow: [
        "/dashboard/",
        "/attendance/",
        "/ranking/",
        "/approvals/",
        "/tests/",
        "/ai-usage/",
        "/api/",
        "/leadership/hod",
        "/leadership/cos",
        "/leadership/hos",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
