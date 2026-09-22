import {
  holeSerie,
  holeSerienFuerStatischePfade,
  holeWerkeDerSerie,
} from "@/lib/daten";
import { FORMATE, vorschauAusWerken } from "@/lib/sozialbild";

/**
 * Die Linkvorschau einer Serie: ihr erstes Werk, gesetzt wie auf
 * der Werkseite. Sonst zeigte ein geteilter Serienlink ein Werk der
 * Startseite, das womöglich gar nicht dazugehört.
 */

export const size = { width: FORMATE.vorschau.breite, height: FORMATE.vorschau.hoehe };
export const contentType = "image/png";
export const alt = "Ein Werk der Serie auf weißem Grund, daneben sein Saalschild";

export async function generateStaticParams() {
  const slugs = await holeSerienFuerStatischePfade();
  return slugs.map((slug) => ({ slug }));
}

export default async function Vorschaubild({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const serie = await holeSerie(slug);

  return serie
    ? vorschauAusWerken(await holeWerkeDerSerie(serie.id))
    : new Response("Keine Serie unter dieser Adresse.", { status: 404 });
}
