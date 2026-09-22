import { holeWerk, holeWerkeFuerStatischePfade } from "@/lib/daten";
import { FORMATE, sozialbild } from "@/lib/sozialbild";

/**
 * Das Bild, das erscheint, wenn jemand den Link zu einem Werk teilt —
 * in einer Nachricht, in einer Story, in einer Suche.
 *
 * Eine kleine Wand: das Werk auf Reinweiß, daneben sein Schild. Wer
 * den Link bekommt, sieht schon vor dem Öffnen, wie das Werk auf der
 * Seite hängt. Gesetzt wird in `src/lib/sozialbild.tsx`.
 */

export const size = { width: FORMATE.vorschau.breite, height: FORMATE.vorschau.hoehe };
export const contentType = "image/png";
export const alt = "Das Werk auf weißem Grund, daneben sein Saalschild";

export async function generateStaticParams() {
  const slugs = await holeWerkeFuerStatischePfade();
  return slugs.map((slug) => ({ slug }));
}

export default async function Vorschaubild({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const werk = await holeWerk(slug);
  const bild = werk ? await sozialbild(werk, "vorschau") : null;

  return bild ?? new Response("Kein Werk unter dieser Adresse.", { status: 404 });
}
