import type { MetadataRoute } from "next";
import { seitenUrl } from "@/lib/umgebung";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Das Admin-Panel, die Schnittstellen und die Danke-Seite gehoeren
      // nicht in einen Suchindex.
      disallow: ["/admin", "/admin/", "/api/", "/kauf/"],
    },
    sitemap: `${seitenUrl()}/sitemap.xml`,
  };
}
