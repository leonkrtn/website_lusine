/**
 * Ob diese Seite die erste ist, die jemand in diesem Besuch sieht.
 *
 * Wer innerhalb der Galerie auf ein Werk tippt, sieht es an seinen
 * Platz wandern (View Transition). Wer von draußen kommt — aus einer
 * Story, von einem Pin, aus einer Nachricht —, hat nichts, von dem
 * aus es wandern könnte. Er hat gerade einen Ausschnitt gesehen,
 * klein, zusammengedrückt, zwischen fremden Bildern. Für ihn beginnt
 * die Werkseite darum am Pinselstrich, wie die Startseite, und tritt
 * zurück, bis das ganze Werk dasteht (siehe `Werkanfang.tsx`).
 *
 * Unterschieden wird ohne Referrer und ohne Abfrageparameter: der
 * Server rendert immer die Ankunft, denn eine vorgerenderte Seite
 * wird nur beim ersten Aufruf ausgeliefert. Jeder spätere
 * Seitenwechsel rendert im Browser, und dort ist dieser Schalter
 * dann umgelegt — von `Schwelle.tsx`, sobald die erste Seite steht.
 */
let ersteSeite = true;

export function kommtVonDraussen(): boolean {
  return ersteSeite;
}

export function eingetreten(): void {
  ersteSeite = false;
}
