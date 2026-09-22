import { supabaseAdresse } from "@/lib/umgebung";

/**
 * Wo ein Bild herkommt.
 *
 * Es gibt zwei Faelle, und der Schluessel selbst sagt, welcher vorliegt:
 *
 *   "/werke/titel.jpg"      — beginnt mit einem Schraegstrich: eine
 *                             Datei unter /public. Das ist der
 *                             Demo-Modus.
 *   "werke/titel-ab12cd.jpg" — ohne Schraegstrich: eine Datei im
 *                             Speicher.
 *
 * Bilder werden weder verkleinert noch umgerechnet: was hochgeladen
 * wurde, wird ausgeliefert. Es gibt darum genau eine Fassung je Bild.
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

/** Die Adresse, unter der ein Bild erreichbar ist. */
export function bildQuelle(schluessel: string): string {
  if (!schluessel) return "";
  if (istLokalesBild(schluessel)) return schluessel;

  return speicherUrl(schluessel);
}

/**
 * Erzeugt aus einem Dateinamen einen Speicherschluessel.
 *
 * Umlaute und Sonderzeichen fliegen raus — ein Schluessel soll sich in
 * einer Adresszeile ohne Kodierung lesen lassen. Die Endung bleibt
 * erhalten, weil die Datei unveraendert abgelegt wird.
 */
export function speicherSchluessel(
  bereich: "werke" | "signaturen" | "seite",
  dateiname: string,
): string {
  const punkt = dateiname.lastIndexOf(".");
  const endung =
    punkt === -1 ? "jpg" : dateiname.slice(punkt + 1).toLowerCase().slice(0, 5);

  const basis = dateiname
    .slice(0, punkt === -1 ? undefined : punkt)
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

  return `${bereich}/${basis || "bild"}-${kennung}.${endung}`;
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
