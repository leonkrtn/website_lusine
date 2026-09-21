import type { MetadataRoute } from "next";
import { seitenUrl } from "@/lib/umgebung";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Das Admin-Panel und die Schnittstellen gehoeren nicht in einen
      // Suchindex.
      disallow: ["/admin", "/admin/", "/api/"],
    },
    sitemap: `${seitenUrl()}/sitemap.xml`,
  };
}
