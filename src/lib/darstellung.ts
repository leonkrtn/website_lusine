/**
 * Berechnet die Breite, mit der ein Werk auf der Seite steht.
 *
 * Ein Gemaelde soll nie beschnitten und nie verzerrt werden. Gleichzeitig
 * darf ein Hochformat nicht ueber den Bildschirm hinauslaufen, waehrend
 * ein Querformat die volle Breite verdient.
 *
 * Die Loesung ist eine reine CSS-Berechnung: die Breite ist der kleinste
 * der drei Werte — was der Bildschirm hergibt, was die Gestaltung
 * zulaesst, und was bei gegebener Hoehe noch hineinpasst. Ohne
 * JavaScript, ohne Nachladen, ohne Springen des Layouts.
 */
export function werkBreiteStil(
  breitePx: number,
  hoehePx: number,
  maxHoeheVh: number,
  maxBreiteRem: number,
  seitenrandVw = 88,
): { width: string } {
  if (!breitePx || !hoehePx) {
    return { width: `min(${seitenrandVw}vw, ${maxBreiteRem}rem)` };
  }

  const verhaeltnis = (breitePx / hoehePx).toFixed(4);

  return {
    width: `min(${seitenrandVw}vw, ${maxBreiteRem}rem, calc(${maxHoeheVh}vh * ${verhaeltnis}))`,
  };
}

/** Das Hauptbild eines Werks, oder das erste verfuegbare. */
export function hauptbild<T extends { art: string }>(bilder: T[]): T | null {
  return bilder.find((bild) => bild.art === "haupt") ?? bilder[0] ?? null;
}

/** Die Detailaufnahmen eines Werks. */
export function detailbilder<T extends { art: string }>(bilder: T[]): T[] {
  return bilder.filter((bild) => bild.art === "detail");
}

/**
 * Teilt einen Text an Leerzeilen in Absaetze.
 * Die Geschichten werden als einfacher Text gepflegt, nicht als HTML —
 * das haelt das Admin-Panel schlicht und schliesst aus, dass beim
 * Einfuegen aus einem Textprogramm fremde Auszeichnung mitkommt.
 */
export function absaetze(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((absatz) => absatz.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
//  Der wahre Maßstab
// ---------------------------------------------------------------------------

/**
 * Die Breite eines Werks im **echten Größenverhältnis** zu den anderen.
 *
 * Im gewohnten Raster steht jedes Werk gleich groß — eine Studie von
 * 30 × 40 cm wirkt dort wie eine Leinwand von 180 × 200 cm. Bei Malerei
 * ist die Größe aber Inhalt: sie entscheidet, ob man vor einem Bild
 * steht oder es in die Hand nimmt.
 *
 * Die Rechnung nimmt das höchste Werk der Auswahl als Maß. Es bekommt
 * die volle Höhe der Zeile, alle anderen ihren Anteil davon. Die Breite
 * folgt aus dem Seitenverhältnis der Aufnahme, nicht aus den
 * Zentimetern — so bleibt das Bild unverzerrt, auch wenn die Maße im
 * Datenblatt einmal grob gerundet sind.
 *
 * Fehlen die Zentimeter, gibt es kein Verhältnis: dann steht das Werk
 * wie zuvor.
 */
export function wahreBreiteStil(
  breitePx: number,
  hoehePx: number,
  hoeheCm: number | null,
  hoechsteCm: number,
  zeilenHoeheVh: number,
  maxBreiteRem: number,
  seitenrandVw = 88,
): { width: string } {
  if (!hoeheCm || hoechsteCm <= 0) {
    return werkBreiteStil(breitePx, hoehePx, zeilenHoeheVh, maxBreiteRem, seitenrandVw);
  }

  const anteil = Math.min(hoeheCm / hoechsteCm, 1);
  const hoeheVh = (zeilenHoeheVh * anteil).toFixed(3);

  if (!breitePx || !hoehePx) {
    return { width: `min(${seitenrandVw}vw, calc(${hoeheVh}vh * 0.8))` };
  }

  const verhaeltnis = (breitePx / hoehePx).toFixed(4);

  return {
    width: `min(${seitenrandVw}vw, ${maxBreiteRem}rem, calc(${hoeheVh}vh * ${verhaeltnis}))`,
  };
}

/** Die größte Werkhöhe einer Auswahl, in Zentimetern. */
export function hoechsteHoeheCm(werke: { hoeheCm: number | null }[]): number {
  return werke.reduce((groesste, werk) => Math.max(groesste, werk.hoeheCm ?? 0), 0);
}

// ---------------------------------------------------------------------------
//  Die Hängung
// ---------------------------------------------------------------------------

/** Wo ein Werk an der Wand hängt und wie groß es dort steht. */
export type Haengung = {
  achse: "links" | "mitte" | "rechts";
  /** Anteil der vollen Höhe. 1 ist das größte Format der Wand. */
  groesse: number;
};

/**
 * Die Hängung der Startseite.
 *
 * Fünf Werke mittig untereinander sind eine Liste, keine Wand. Wer
 * Bilder hängt, arbeitet mit Wechsel: ein großes zur Begrüßung, dann
 * ein kleineres abseits, dann wieder eines, das den Raum nimmt. Erst
 * dieser Wechsel macht den Weißraum zu einer Komposition statt zu
 * bloßem Abstand.
 *
 * Die Folge ist fest und nicht zufällig — eine Wand, die sich bei
 * jedem Aufruf neu ordnet, ist keine Hängung, sondern ein Generator.
 * Das erste Werk hängt immer mittig und immer groß: es ist der
 * Auftakt, und ein Auftakt steht nicht abseits.
 */
const HAENGUNG: Haengung[] = [
  { achse: "mitte", groesse: 1 },
  { achse: "links", groesse: 0.78 },
  { achse: "rechts", groesse: 0.62 },
  { achse: "mitte", groesse: 0.92 },
  { achse: "links", groesse: 0.7 },
  { achse: "rechts", groesse: 0.85 },
];

export function haengung(nummer: number): Haengung {
  if (nummer === 0) return HAENGUNG[0];
  return HAENGUNG[nummer % HAENGUNG.length];
}

/** Die Tailwind-Klasse, die ein Werk an seine Achse rückt. */
export function haengungKlasse(achse: Haengung["achse"]): string {
  if (achse === "links") return "lg:mr-auto lg:ml-0 lg:text-left";
  if (achse === "rechts") return "lg:mr-0 lg:ml-auto lg:text-right";
  return "";
}
