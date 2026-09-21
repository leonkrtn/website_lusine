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
