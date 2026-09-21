import type { MetadataRoute } from "next";
import { holeSerien, holeWerke } from "@/lib/daten";
import { seitenUrl } from "@/lib/umgebung";

/**
 * Jedes Werk hat eine eigene Adresse und gehoert in die Sitemap.
 *
 * Fuer eine Galerie ist das der wichtigste Weg, gefunden zu werden:
 * Menschen suchen nach einem Bild, nicht nach einer Startseite.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const basis = seitenUrl();
  const [werke, serien] = await Promise.all([holeWerke(), holeSerien()]);

  const feste: MetadataRoute.Sitemap = [
    { url: basis, changeFrequency: "monthly", priority: 1 },
    { url: `${basis}/werke`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${basis}/serien`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${basis}/ueber`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${basis}/kontakt`, changeFrequency: "yearly", priority: 0.5 },
  ];

  return [
    ...feste,
    ...werke.map((werk) => ({
      url: `${basis}/werke/${werk.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...serien.map((serie) => ({
      url: `${basis}/serien/${serie.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
