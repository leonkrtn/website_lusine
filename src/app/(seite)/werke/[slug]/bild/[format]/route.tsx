import { holeWerk, holeWerkeFuerStatischePfade } from "@/lib/daten";
import { FORMATE, istFormat, sozialbild } from "@/lib/sozialbild";

/**
 * Ein Werk im Format für draußen: `/werke/<slug>/bild/pinterest`,
 * `…/instagram`, `…/instagram-nah`.
 *
 * Zwei Wege führen hierher. Lusine lädt die Bilder im Admin herunter,
 * um sie selbst zu veröffentlichen. Und wer ein Werk von der Seite
 * aus auf Pinterest merkt, bekommt über `data-pin-media` dieses Bild
 * statt des nackten Fotos — mit Schild, Name und Adresse, die dem
 * Pin auf jede weitere Pinnwand folgen.
 */

type Kontext = { params: Promise<{ slug: string; format: string }> };

export async function generateStaticParams() {
  const slugs = await holeWerkeFuerStatischePfade();
  const formate = Object.keys(FORMATE).filter((format) => format !== "vorschau");
  return slugs.flatMap((slug) => formate.map((format) => ({ slug, format })));
}

export async function GET(_anfrage: Request, { params }: Kontext) {
  const { slug, format } = await params;
  if (!istFormat(format) || format === "vorschau") {
    return new Response("Dieses Format gibt es nicht.", { status: 404 });
  }

  const werk = await holeWerk(slug);
  const bild = werk ? await sozialbild(werk, format) : null;
  if (!werk || !bild) {
    return new Response("Für dieses Werk gibt es kein Bild in diesem Format.", {
      status: 404,
    });
  }

  /* Beim Herunterladen soll die Datei sagen, was sie ist. */
  bild.headers.set(
    "Content-Disposition",
    `inline; filename="${werk.slug}-${format}.png"`,
  );
  return bild;
}
