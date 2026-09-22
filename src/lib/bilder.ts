import { VARIANTEN_BREITEN, SIGNATUR_BREITEN } from "@/lib/bildformate";
import { supabaseAdresse } from "@/lib/umgebung";

/**
 * Wo ein Bild herkommt und in welchen Fassungen es vorliegt.
 *
 * Es gibt zwei Faelle, und der Schluessel selbst sagt, welcher vorliegt:
 *
 *   "/werke/titel.jpg"   — beginnt mit einem Schraegstrich: eine Datei
 *                          unter /public. Das ist der Demo-Modus, hier
 *                          gibt es nur diese eine Fassung.
 *   "werke/abc123"       — ohne Schraegstrich: ein Ordner im Speicher.
 *                          Darunter liegen alle Groessen in allen
 *                          Formaten.
 *
 * Dadurch koennen beide Faelle nebeneinander bestehen, und der Umstieg
 * auf echte Bilder braucht keine Umstellung im Code.
 */

/**
 * Der Behaelter im Speicher. Heisst bewusst nicht wie die Bereiche
 * darin ("werke", "signaturen") — sonst stuende in jeder Bildadresse
 * "werke/werke", und Adressen aendert man spaeter nicht mehr ohne Umzug.
 */
export const BEHAELTER = "bilder";

export function istLokalesBild(schluessel: string): boolean {
  return schluessel.startsWith("/");
}

/** Die oeffentliche Adresse einer Datei im Speicher. */
export function speicherUrl(pfad: string): string {
  const basis = supabaseAdresse();
  if (!basis) return "";

  return `${basis}/storage/v1/object/public/${BEHAELTER}/${pfad}`;
}

/**
 * Die Adresse, unter der ein Bild in einer bestimmten Fassung liegt.
 *
 * Im Demo-Modus gibt es nur die eine Datei; Groesse und Format werden
 * dort ignoriert.
 */
export function bildQuelle(
  schluessel: string,
  breite?: number,
  format: "avif" | "webp" | "jpg" | "png" = "jpg",
): string {
  if (!schluessel) return "";
  if (istLokalesBild(schluessel)) return schluessel;

  if (!breite) return speicherUrl(`${schluessel}/original.jpg`);

  return speicherUrl(
    `${schluessel}/${String(breite).padStart(4, "0")}.${format}`,
  );
}

/**
 * Ein srcset fuer ein Format.
 *
 * Frueher hat ein eigener Dienst die passende Fassung herausgesucht.
 * Das ist nicht noetig: der Browser weiss selbst am besten, wie breit
 * er das Bild darstellt und welche Formate er versteht. Er bekommt die
 * Liste und waehlt — das spart einen ganzen Dienst und ist obendrein
 * genauer, weil die Wahl erst im Moment der Darstellung faellt.
 */
export function variantenSatz(
  schluessel: string,
  format: "avif" | "webp" | "jpg" | "png",
  hoechsteBreite = 0,
  breiten: readonly number[] = VARIANTEN_BREITEN,
): string {
  if (istLokalesBild(schluessel)) return "";

  // Keine Fassung anbieten, die es nicht gibt: beim Hochladen wird nicht
  // hochgerechnet, ein kleines Ausgangsbild hat also keine grossen
  // Varianten.
  const verfuegbar = hoechsteBreite
    ? breiten.filter((breite) => breite <= hoechsteBreite * 1.05)
    : breiten;

  const liste = verfuegbar.length > 0 ? verfuegbar : [breiten[0]];

  return liste
    .map((breite) => `${bildQuelle(schluessel, breite, format)} ${breite}w`)
    .join(", ");
}

/** Dasselbe fuer Signaturen, die eigene, kleinere Groessen haben. */
export function signaturSatz(
  schluessel: string,
  format: "webp" | "png",
): string {
  return variantenSatz(schluessel, format, 0, SIGNATUR_BREITEN);
}

/**
 * Erzeugt aus einem Dateinamen einen Speicherschluessel.
 * Umlaute und Sonderzeichen fliegen raus — ein Schluessel soll sich in
 * einer Adresszeile ohne Kodierung lesen lassen.
 */
export function speicherSchluessel(
  bereich: "werke" | "signaturen" | "seite",
  dateiname: string,
): string {
  const basis = dateiname
    .slice(
      0,
      dateiname.lastIndexOf(".") === -1 ? undefined : dateiname.lastIndexOf("."),
    )
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  // Zufallsanteil, damit eine erneut hochgeladene Datei gleichen Namens
  // die alte nicht ueberschreibt und Zwischenspeicher nicht veralten.
  const kennung = Math.random().toString(36).slice(2, 8);

  return `${bereich}/${basis || "bild"}-${kennung}`;
}

/** Aus Cent eine lesbare Preisangabe. */
export function preisText(cent: number | null, waehrung = "eur"): string {
  if (cent === null || cent === undefined) return "Preis auf Anfrage";

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: waehrung.toUpperCase(),
    minimumFractionDigits: cent % 100 === 0 ? 0 : 2,
    maximumFractionDigits: cent % 100 === 0 ? 0 : 2,
  }).format(cent / 100);
}

/** Die Masse eines Werks als eine Zeile. */
export function masseText(
  breiteCm: number | null,
  hoeheCm: number | null,
  tiefeCm: number | null,
): string | null {
  if (!breiteCm || !hoeheCm) return null;

  const zahl = (wert: number) =>
    Number.isInteger(wert) ? String(wert) : wert.toFixed(1).replace(".", ",");

  const grund = `${zahl(hoeheCm)} × ${zahl(breiteCm)} cm`;
  return tiefeCm ? `${grund}, ${zahl(tiefeCm)} cm tief` : grund;
}
