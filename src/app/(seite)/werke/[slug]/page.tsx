import type { CSSProperties } from "react";
import { ViewTransition } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Einblenden } from "@/components/Einblenden";
import { WerkMitZoom } from "@/components/WerkMitZoom";
import { Werkbild } from "@/components/Werkbild";
import { Signatur } from "@/components/Signatur";
import { Werkkachel } from "@/components/Werkkachel";
import { Erwerb } from "@/components/Erwerb";
import {
  holeWerk,
  holeWerkeFuerStatischePfade,
  holeVerwandteWerke,
} from "@/lib/daten";
import { absaetze, detailbilder, hauptbild, werkBreiteStil } from "@/lib/darstellung";
import { bildQuelle, masseText } from "@/lib/bilder";
import { STATUS_BESCHRIFTUNG } from "@/lib/typen";

type Props = { params: Promise<{ slug: string }> };

/** Alle Werke vorab erzeugen — es sind wenige, und sie aendern sich selten. */
export async function generateStaticParams() {
  const slugs = await holeWerkeFuerStatischePfade();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const werk = await holeWerk(slug);

  if (!werk) return { title: "Werk nicht gefunden" };

  const bild = hauptbild(werk.bilder);
  const beschreibung =
    absaetze(werk.geschichte)[0]?.slice(0, 180) ??
    `${werk.titel} — ${werk.technik}`;

  return {
    title: werk.titel,
    description: beschreibung,
    openGraph: {
      title: `${werk.titel} — LUART`,
      description: beschreibung,
      images: bild ? [{ url: bildQuelle(bild.schluessel) }] : undefined,
    },
  };
}

/**
 * Die Werkseite.
 *
 * Reihenfolge ist hier Gestaltung: erst das Werk allein, ohne jede
 * Beschriftung im ersten Blickfeld. Dann die Signatur als Beglaubigung.
 * Dann die Geschichte. Der Preis kommt zuletzt — wer bis dorthin
 * gescrollt hat, hat sich bereits entschieden, ob ihn das Bild angeht.
 */
export default async function WerkSeite({ params }: Props) {
  const { slug } = await params;
  const werk = await holeWerk(slug);

  if (!werk) notFound();

  const bild = hauptbild(werk.bilder);
  const details = detailbilder(werk.bilder);
  const verwandte = await holeVerwandteWerke(werk, 2);
  const masse = masseText(werk.breiteCm, werk.hoeheCm, werk.tiefeCm);
  const geschichte = absaetze(werk.geschichte);

  const datenblatt = [
    werk.jahr ? { feld: "Jahr", wert: String(werk.jahr) } : null,
    werk.technik ? { feld: "Technik", wert: werk.technik } : null,
    werk.material ? { feld: "Material", wert: werk.material } : null,
    masse ? { feld: "Maße", wert: masse } : null,
    {
      feld: "Ausführung",
      wert: werk.istUnikat ? "Unikat" : (werk.editionInfo ?? "Edition"),
    },
    werk.serie ? { feld: "Serie", wert: werk.serie.titel } : null,
    { feld: "Status", wert: STATUS_BESCHRIFTUNG[werk.status] },
  ].filter((eintrag): eintrag is { feld: string; wert: string } => Boolean(eintrag));

  return (
    <article
      /* Die Leitfarbe gilt nur innerhalb dieses Werks. Sie faerbt die
         Auswahlmarkierung und die Linie ueber dem Datenblatt — nie
         eine Flaeche, damit das Papier reinweiss bleibt. Steht keine
         da, greifen ueberall die Standardwerte. */
      style={
        werk.leitfarbe ? ({ "--leitfarbe": werk.leitfarbe } as CSSProperties) : undefined
      }
      data-leitfarbe={werk.leitfarbe ? "ja" : undefined}
    >
      {/* --- 1. Das Werk, groß und allein ---------------------------------
          Genau eine Bewegung beim Ankommen: wer aus dem Katalog kommt,
          sieht sein Werk an diesen Platz wandern. Sonst steht es
          einfach da. Nichts blendet darunter, nichts schneidet
          gleichzeitig hinein — beides gab es hier einmal, und zu
          dritt ergab das kein Ankommen, sondern ein Zucken. */}
      {bild && (
        <section className="flex justify-center px-4 pt-8">
          <div
            className="werkflaeche w-full"
            style={werkBreiteStil(bild.breitePx, bild.hoehePx, 86, 64)}
          >
            <ViewTransition name={`werk-${werk.id}`} share="wanderung" default="none">
              <div>
                <WerkMitZoom
                  schluessel={bild.schluessel}
                  alt={bild.altText || werk.titel}
                  breitePx={bild.breitePx}
                  hoehePx={bild.hoehePx}
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 78vw, 64rem"
                  vorrang
                />
              </div>
            </ViewTransition>
          </div>
        </section>
      )}

      {/* --- 2. Signatur und Titel ----------------------------------------
          Die Signatur steht dort, wo bei einem gerahmten Bild das
          Schildchen haengt — nur dass sie zu diesem einen Werk gehoert
          und zu keinem anderen. */}
      <Einblenden als="header" className="mt-16 px-4 text-center">
        <Signatur
          schluessel={werk.signaturSchluessel}
          werkTitel={werk.titel}
          breite={220}
          className="mx-auto"
        />

        <h1 className="mt-8 text-titel leading-tight text-balance">{werk.titel}</h1>

        <p className="beschriftung mt-4">
          {[werk.jahr, werk.technik].filter(Boolean).join(" · ")}
        </p>

        {werk.serie && (
          <p className="mt-6 text-klein">
            <Link
              href={`/serien/${werk.serie.slug}`}
              className="text-tinte-leise transition-colors duration-500 hover:text-tinte"
            >
              aus der Serie „{werk.serie.titel}“
            </Link>
          </p>
        )}
      </Einblenden>

      {/* --- 3. Die Geschichte --------------------------------------------
          Das Herzstueck. Schmale Spalte, viel Zeilenabstand, am Ende die
          Signatur wie unter einem Brief. */}
      {geschichte.length > 0 && (
        <section className="mt-stille px-4">
          <Einblenden className="mx-auto max-w-[34rem]">
            <div className="erzaehlung">
              {geschichte.map((absatz, nummer) => (
                <p key={nummer}>{absatz}</p>
              ))}
            </div>

            <Signatur
              schluessel={werk.signaturSchluessel}
              werkTitel={werk.titel}
              breite={170}
              className="mt-14"
            />
          </Einblenden>
        </section>
      )}

      {/* --- 4. Das Zitat -------------------------------------------------- */}
      {werk.zitat && (
        <section className="mt-stille px-4">
          <Einblenden>
            <blockquote className="mx-auto max-w-3xl text-center">
              <p className="zitat text-balance">„{werk.zitat}“</p>
            </blockquote>
          </Einblenden>
        </section>
      )}

      {/* --- 5. Detailaufnahmen -------------------------------------------
          Die Nahaufnahmen zeigen, was ein Katalogbild nie zeigen kann:
          wie die Farbe steht. Bei einem Original ist das der
          eigentliche Gegenstand des Kaufs. */}
      {details.length > 0 && (
        <section className="mt-stille px-4" aria-label="Detailaufnahmen">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-16 sm:grid-cols-2">
            {details.map((detail) => (
              /* Der Ausschnitt oeffnet sich beim Scrollen aus der Mitte
                 heraus — hier ist ein Rechteck aus Farbe die Sache
                 selbst, nicht ein zugeschnittenes Werk. */
              <div key={detail.id} className="naharbeit">
                <Werkbild
                  schluessel={detail.schluessel}
                  alt={detail.altText || `${werk.titel} — Detail`}
                  breitePx={detail.breitePx}
                  hoehePx={detail.hoehePx}
                  sizes="(max-width: 640px) 92vw, 34rem"
                />
              </div>
            ))}
          </div>
          <p className="beschriftung mt-10 text-center">
            Detailaufnahmen der Oberfläche
          </p>
        </section>
      )}

      {/* --- 6. Datenblatt und 7. Erwerb ----------------------------------- */}
      <section className="mt-stille px-4">
        <div className="leitlinie mx-auto grid max-w-5xl grid-cols-1 gap-16 pt-16 md:grid-cols-2 md:gap-24">
          <Einblenden>
            <h2 className="beschriftung">Das Werk</h2>
            <dl className="mt-8">
              {datenblatt.map((eintrag) => (
                <div
                  key={eintrag.feld}
                  className="flex justify-between gap-6 border-b border-linie py-3 text-klein"
                >
                  <dt className="text-tinte-leise">{eintrag.feld}</dt>
                  <dd className="zahlenspalte text-right">{eintrag.wert}</dd>
                </div>
              ))}
            </dl>
          </Einblenden>

          <Einblenden verzoegerung={120}>
            <h2 className="beschriftung">Erwerb</h2>
            <div className="mt-8">
              <Erwerb werk={werk} />
            </div>
          </Einblenden>
        </div>
      </section>

      {/* --- 8. Weiter ----------------------------------------------------- */}
      {verwandte.length > 0 && (
        <section className="mt-stille px-4">
          <div className="mx-auto max-w-5xl border-t border-linie pt-16">
            <Einblenden>
              <h2 className="beschriftung">
                {werk.serie
                  ? `Weitere Werke aus „${werk.serie.titel}“`
                  : "Weitere Werke"}
              </h2>
            </Einblenden>

            <div className="mt-atem grid grid-cols-1 gap-y-atem sm:grid-cols-2 sm:gap-x-16">
              {verwandte.map((anderes, nummer) => (
                <Werkkachel
                  key={anderes.id}
                  werk={anderes}
                  verzoegerung={nummer * 120}
                  maxHoeheVh={46}
                  sizes="(max-width: 640px) 88vw, 24rem"
                />
              ))}
            </div>

            <Einblenden className="mt-atem text-center">
              <Link
                href="/werke"
                className="border-b border-tinte pb-1 text-klein transition-opacity duration-500 hover:opacity-60"
              >
                Alle Werke ansehen
              </Link>
            </Einblenden>
          </div>
        </section>
      )}
    </article>
  );
}
