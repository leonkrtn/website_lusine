import { bildWorkerKonfiguriert } from "@/lib/umgebung";

/**
 * Wo ein Bild herkommt.
 *
 * Es gibt zwei Faelle, und der Schluessel selbst sagt, welcher vorliegt:
 *
 *   "/werke/titel.jpg"  — beginnt mit einem Schraegstrich: eine Datei
 *                         unter /public. Das ist der Demo-Modus.
 *   "werke/abc123.jpg"  — ohne Schraegstrich: ein Objekt im
 *                         R2-Speicher, ausgeliefert vom Worker.
 *
 * Dadurch koennen beide Faelle nebeneinander bestehen, und der Umstieg
 * auf echte Bilder braucht keine Umstellung im Code.
 */

export function istLokalesBild(schluessel: string): boolean {
  return schluessel.startsWith("/");
}

/** Die Basisadresse des Bild-Workers, ohne abschliessenden Schraegstrich. */
export function bildBasisUrl(): string {
  return (process.env.NEXT_PUBLIC_BILD_BASIS_URL ?? "").replace(/\/$/, "");
}

/**
 * Die Adresse, unter der ein Bild erreichbar ist.
 *
 * Bei lokalen Dateien der Pfad selbst — Next.js optimiert sie dann mit
 * seiner eingebauten Bildverarbeitung. Bei R2-Objekten die Adresse des
 * Workers, der die passende Variante erzeugt.
 */
export function bildQuelle(schluessel: string): string {
  if (!schluessel) return "";
  if (istLokalesBild(schluessel)) return schluessel;

  const basis = bildBasisUrl();
  if (!basis) {
    // R2-Schluessel ohne Worker: es gibt nichts auszuliefern.
    return "";
  }

  return `${basis}/${schluessel.replace(/^\//, "")}`;
}

/**
 * Bildlader fuer next/image bei Bildern aus dem Worker.
 *
 * Der Worker erzeugt die Variante selbst, darum wird Next.js' eigene
 * Optimierung hier umgangen — sonst wuerde dasselbe Bild zweimal
 * verkleinert, was sichtbar Schaerfe kostet.
 *
 * Wichtig: Diese Funktion darf keine Werte von aussen einfangen, weil
 * sie als Eigenschaft an eine Client Component gereicht wird.
 */
export function workerLader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const trenner = src.includes("?") ? "&" : "?";
  return `${src}${trenner}b=${width}&q=${quality ?? 82}`;
}

/**
 * Ob fuer dieses Bild der Worker-Lader zu verwenden ist.
 * Lokale Dateien laufen weiter ueber die eingebaute Optimierung.
 */
export function brauchtWorkerLader(schluessel: string): boolean {
  return !istLokalesBild(schluessel) && bildWorkerKonfiguriert();
}

/**
 * Erzeugt aus einem Dateinamen einen Speicherschluessel.
 * Umlaute und Sonderzeichen fliegen raus — R2-Schluessel sollen sich
 * in einer Adresszeile ohne Kodierung lesen lassen.
 */
export function speicherSchluessel(
  bereich: "werke" | "signaturen" | "seite",
  dateiname: string,
): string {
  const endung = dateiname.includes(".")
    ? dateiname.slice(dateiname.lastIndexOf(".")).toLowerCase()
    : ".jpg";

  const basis = dateiname
    .slice(0, dateiname.lastIndexOf(".") === -1 ? undefined : dateiname.lastIndexOf("."))
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

  return `${bereich}/${basis || "bild"}-${kennung}${endung}`;
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
