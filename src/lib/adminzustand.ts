/**
 * Rueckmeldungen der Admin-Formulare.
 *
 * Steht ausserhalb der Server Actions, weil eine Datei mit "use server"
 * nur asynchrone Funktionen exportieren darf.
 */

export type FormZustand = {
  erfolg: boolean;
  meldung: string | null;
  fehler: string | null;
};

export const FORM_START: FormZustand = {
  erfolg: false,
  meldung: null,
  fehler: null,
};

/** Erzeugt aus einem Titel eine Adresse. */
export function zuSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Eine Eingabe wie "3.400" oder "3400,50" in Cent. */
export function zuCent(eingabe: string): number | null {
  const sauber = eingabe.trim().replace(/\./g, "").replace(",", ".");
  if (!sauber) return null;

  const zahl = Number(sauber);
  if (!Number.isFinite(zahl) || zahl < 0) return null;

  return Math.round(zahl * 100);
}

/** Cent als Eingabewert, also "3400" oder "3400,50". */
export function centZuEingabe(cent: number | null): string {
  if (cent === null || cent === undefined) return "";
  return cent % 100 === 0
    ? String(cent / 100)
    : (cent / 100).toFixed(2).replace(".", ",");
}
