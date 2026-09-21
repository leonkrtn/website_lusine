import Link from "next/link";
import { Einblenden } from "@/components/Einblenden";
import { Parallax } from "@/components/Parallax";
import { WerkMitZoom } from "@/components/WerkMitZoom";
import { holeStartseitenWerke, holeTexte } from "@/lib/daten";
import { hauptbild, werkBreiteStil } from "@/lib/darstellung";
import { STATUS_BESCHRIFTUNG } from "@/lib/typen";

/**
 * Die Startseite ist kein Katalog, sondern eine Auswahl.
 *
 * Fuenf Werke, jedes fuer sich, jedes fast bildschirmfuellend. Wer
 * scrollt, sieht immer nur ein Bild — das ist die Uebersetzung eines
 * gut gehaengten Galerieraums in eine Website.
 */

export default async function Startseite() {
  const [werke, texte] = await Promise.all([
    holeStartseitenWerke(5),
    holeTexte(),
  ]);

  return (
    <div>
      {/* --- Auftakt ------------------------------------------------------
          Nur Schrift, sehr viel Luft. Der Blick soll zur Ruhe kommen,
          bevor das erste Werk erscheint. */}
      <section className="mx-auto max-w-[110rem] px-4 pt-16 pb-stille sm:px-10 lg:px-16">
        <Einblenden>
          <p className="erzaehlung max-w-2xl text-lead text-balance">
            {texte.startseiteAuftakt}
          </p>
        </Einblenden>
      </section>

      {/* --- Die Werke ---------------------------------------------------- */}
      {werke.map((werk, nummer) => {
        const bild = hauptbild(werk.bilder);
        if (!bild) return null;

        const istErstes = nummer === 0;

        return (
          <section
            key={werk.id}
            className="mb-stille flex flex-col items-center px-4"
            aria-labelledby={`werk-${werk.id}`}
          >
            <Einblenden className="w-full" schwelle={0.05}>
              <Parallax staerke={istErstes ? 0 : 0.06}>
                <div
                  className="mx-auto"
                  style={werkBreiteStil(bild.breitePx, bild.hoehePx, 76, 52)}
                >
                  <WerkMitZoom
                    schluessel={bild.schluessel}
                    alt={bild.altText || werk.titel}
                    breitePx={bild.breitePx}
                    hoehePx={bild.hoehePx}
                    sizes="(max-width: 640px) 88vw, (max-width: 1024px) 70vw, 52rem"
                    vorrang={istErstes}
                  />
                </div>
              </Parallax>
            </Einblenden>

            <Einblenden verzoegerung={140} className="mt-10 text-center">
              <h2 id={`werk-${werk.id}`} className="text-titel leading-tight">
                <Link
                  href={`/werke/${werk.slug}`}
                  className="transition-opacity duration-500 hover:opacity-60"
                >
                  {werk.titel}
                </Link>
              </h2>

              <p className="beschriftung mt-4">
                {[
                  werk.jahr,
                  werk.technik,
                  werk.status !== "verfuegbar"
                    ? STATUS_BESCHRIFTUNG[werk.status]
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </Einblenden>
          </section>
        );
      })}

      {/* --- Das Zitat ----------------------------------------------------
          Ein Satz, gross gesetzt, viel Raum darum — wie ein Wandtext
          zwischen zwei Saelen. */}
      {texte.startseiteZitat && (
        <section className="mx-auto max-w-[110rem] px-4 py-stille sm:px-10 lg:px-16">
          <Einblenden>
            <blockquote className="mx-auto max-w-4xl text-center">
              <p className="text-gross leading-[1.25] text-balance italic">
                „{texte.startseiteZitat}“
              </p>
              <footer className="beschriftung mt-10 not-italic">Lusine</footer>
            </blockquote>
          </Einblenden>
        </section>
      )}

      {/* --- Abschluss ---------------------------------------------------- */}
      <section className="mx-auto max-w-[110rem] px-4 pb-stille sm:px-10 lg:px-16">
        <Einblenden>
          <div className="max-w-xl">
            <p className="erzaehlung">{texte.startseiteAbschluss}</p>
            <Link
              href="/werke"
              className="mt-10 inline-block border-b border-tinte pb-1 text-klein transition-opacity duration-500 hover:opacity-60"
            >
              Alle Werke ansehen
            </Link>
          </div>
        </Einblenden>
      </section>
    </div>
  );
}
