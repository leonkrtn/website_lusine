import type { Metadata } from "next";

/**
 * Was jede Seite den Suchmaschinen und Linkvorschauen über sich sagt.
 *
 * Next.js führt `openGraph` nicht zusammen, sondern ersetzt es: eine
 * Seite, die dort einen eigenen Titel setzt, verliert den Namen der
 * Seite und die Sprache aus dem Rahmen. Darum gehen alle Seiten über
 * diese eine Stelle.
 *
 * Die kanonische Adresse fasst zusammen, was Instagram, Pinterest und
 * Messenger an Anhängseln an einen Link hängen — gezählt wird dann
 * eine Seite, nicht zwanzig.
 *
 * Das Vorschaubild ist das allgemeine unter `/vorschaubild`. Werkseiten
 * und Serien haben ein eigenes `opengraph-image.tsx` und setzen
 * `eigenesBild` — sonst verdrängte die Angabe hier ihr Bild.
 */

export const SEITENNAME = "LUART";

export const OPEN_GRAPH_GRUND = {
  locale: "de_DE",
  siteName: SEITENNAME,
} as const;

const ALLGEMEINES_VORSCHAUBILD = {
  url: "/vorschaubild",
  // FORMATE.vorschau in sozialbild.tsx. Nicht von dort geholt: die
  // Datei liest beim Laden die Schriften, und das braucht der Rahmen
  // jeder Seite nicht.
  width: 1200,
  height: 630,
  alt: "Ein Werk von Lusine auf weißem Grund, daneben sein Saalschild",
};

export function seitenangaben({
  titel,
  beschreibung,
  pfad,
  art = "website",
  eigenesBild = false,
}: {
  /** Ohne Seitennamen; der kommt über die Vorlage im Rahmen dazu. */
  titel?: string;
  beschreibung: string;
  /** Die Adresse ohne Domain, etwa "/werke". */
  pfad: string;
  art?: "website" | "article";
  /** Ein `opengraph-image.tsx` liegt neben der Seite. */
  eigenesBild?: boolean;
}): Metadata {
  const vollerTitel = titel ? `${titel} — ${SEITENNAME}` : `${SEITENNAME} — Malerei`;

  return {
    ...(titel ? { title: titel } : {}),
    description: beschreibung,
    alternates: { canonical: pfad },
    openGraph: {
      ...OPEN_GRAPH_GRUND,
      type: art,
      title: vollerTitel,
      description: beschreibung,
      url: pfad,
      ...(eigenesBild ? {} : { images: [ALLGEMEINES_VORSCHAUBILD] }),
    },
  };
}
