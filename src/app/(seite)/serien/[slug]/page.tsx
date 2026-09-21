import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Einblenden } from "@/components/Einblenden";
import { Werkkachel } from "@/components/Werkkachel";
import {
  holeSerie,
  holeSerienFuerStatischePfade,
  holeWerkeDerSerie,
} from "@/lib/daten";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await holeSerienFuerStatischePfade();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const serie = await holeSerie(slug);

  if (!serie) return { title: "Serie nicht gefunden" };

  return {
    title: serie.titel,
    description: serie.einleitung.slice(0, 180),
  };
}

/** Eine Serie: Einleitungstext, dann ihre Werke im ruhigen Raster. */
export default async function SerieSeite({ params }: Props) {
  const { slug } = await params;
  const serie = await holeSerie(slug);

  if (!serie) notFound();

  const werke = await holeWerkeDerSerie(serie.id);

  return (
    <div className="mx-auto max-w-[110rem] px-4 pt-16 sm:px-10 lg:px-16">
      <Einblenden als="header" className="mx-auto max-w-[34rem] text-center">
        <p className="beschriftung">Serie</p>
        <h1 className="mt-6 text-gross leading-tight text-balance">
          {serie.titel}
        </h1>
        <p className="beschriftung mt-4">
          {[serie.jahr, werke.length === 1 ? "1 Werk" : `${werke.length} Werke`]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="erzaehlung mt-12 text-left">{serie.einleitung}</p>
      </Einblenden>

      {werke.length > 0 && (
        <div className="mt-stille grid grid-cols-1 gap-y-atem sm:grid-cols-2 sm:gap-x-16 lg:gap-x-24">
          {werke.map((werk, nummer) => (
            <Werkkachel
              key={werk.id}
              werk={werk}
              verzoegerung={(nummer % 2) * 120}
            />
          ))}
        </div>
      )}

      <Einblenden className="mt-stille text-center">
        <Link
          href="/serien"
          className="border-b border-tinte pb-1 text-klein transition-opacity duration-500 hover:opacity-60"
        >
          Alle Serien
        </Link>
      </Einblenden>
    </div>
  );
}
