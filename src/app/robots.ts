import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/provider", "/dashboard", "/api"],
    },
    sitemap: `${env.appUrl}/sitemap.xml`,
  };
}
