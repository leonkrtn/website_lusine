import type { MetadataRoute } from "next";
import { bildAdresseVoll } from "@/lib/bilder";
import { holeSerien, holeWerke } from "@/lib/daten";
import { seitenUrl } from "@/lib/umgebung";

/**
 * Jedes Werk hat eine eigene Adresse und gehoert in die Sitemap.
 *
 * Fuer eine Galerie ist das der wichtigste Weg, gefunden zu werden:
 * Menschen suchen nach einem Bild, nicht nach einer Startseite. Darum
 * stehen bei jedem Werk auch seine Bilder mit in der Sitemap — so
 * findet die Bildersuche sie, ohne erst die Seite lesen zu muessen.
 *
 * Das Datum der letzten Aenderung kommt aus der Datenbank. Im
 * Demo-Modus gibt es keins, dann bleibt es weg.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const basis = seitenUrl();
  const [werke, serien] = await Promise.all([holeWerke(), holeSerien()]);

  const katalogGeaendert = juengstes(werke.map((werk) => werk.aktualisiertAm));
  const serienGeaendert = juengstes(serien.map((serie) => serie.aktualisiertAm));

  const feste: MetadataRoute.Sitemap = [
    { url: basis, lastModified: katalogGeaendert, changeFrequency: "monthly", priority: 1 },
    { url: `${basis}/werke`, lastModified: katalogGeaendert, changeFrequency: "weekly", priority: 0.9 },
    { url: `${basis}/serien`, lastModified: serienGeaendert, changeFrequency: "monthly", priority: 0.7 },
    { url: `${basis}/ueber`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${basis}/kontakt`, changeFrequency: "yearly", priority: 0.5 },
  ];

  return [
    ...feste,
    ...werke.map((werk) => ({
      url: `${basis}/werke/${werk.slug}`,
      lastModified: werk.aktualisiertAm,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: werk.bilder.map((bild) => bildAdresseVoll(bild.schluessel)).filter(Boolean),
    })),
    ...serien.map((serie) => ({
      url: `${basis}/serien/${serie.slug}`,
      lastModified: serie.aktualisiertAm,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}

/** Der spaeteste von mehreren Zeitpunkten, oder nichts. */
function juengstes(zeitpunkte: (string | undefined)[]): string | undefined {
  return zeitpunkte.filter(Boolean).sort().at(-1);
}
