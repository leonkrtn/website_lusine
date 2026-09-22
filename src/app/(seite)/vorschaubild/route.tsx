import { holeStartseitenWerke } from "@/lib/daten";
import { vorschauAusWerken } from "@/lib/sozialbild";

/**
 * Die Linkvorschau für jede Seite, die kein eigenes Werk hat —
 * Startseite, Katalog, Über, Kontakt.
 *
 * Eine Galerie teilt man mit einem Bild, nicht mit einem Schriftzug.
 * Darum steht hier das erste Werk der Startseite, gesetzt wie die
 * Vorschau einer Werkseite.
 *
 * Eine feste Adresse statt `opengraph-image.tsx`: ein solches Bild
 * erbt nur, wer selbst kein `openGraph` setzt — und das tun alle
 * Seiten über `seitenangaben()`. Werkseiten und Serien haben ein
 * eigenes `opengraph-image.tsx`, das diese Angabe ersetzt.
 */

export const dynamic = "force-static";

export async function GET() {
  return vorschauAusWerken(await holeStartseitenWerke(5));
}
