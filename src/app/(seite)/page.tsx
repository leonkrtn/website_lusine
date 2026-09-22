import Link from "next/link";
import { Einblenden } from "@/components/Einblenden";
import { Parallax } from "@/components/Parallax";
import { Wortweise } from "@/components/Wortweise";
import { WerkMitZoom } from "@/components/WerkMitZoom";
import { holeStartseitenWerke, holeTexte } from "@/lib/daten";
import {
  haengung,
  haengungKlasse,
  hauptbild,
  werkBreiteStil,
} from "@/lib/darstellung";
import { STATUS_BESCHRIFTUNG } from "@/lib/typen";

/**
 * Die Startseite ist kein Katalog, sondern eine Auswahl.
 *
 * Fuenf Werke, jedes fuer sich, jedes fast bildschirmfuellend. Wer
 * scrollt, sieht immer nur ein Bild — das ist die Uebersetzung eines
 * gut gehaengten Galerieraums in eine Website.
 *
 * Gehaengt wird wie an einer Wand, nicht wie in einer Liste: das
 * erste Werk gross und mittig als Auftakt, die folgenden im Wechsel
 * abseits und in wechselnder Groesse. Die Folge steht fest in
 * `haengung()`. Ab der grossen Breite wird sie sichtbar; darunter
 * steht jedes Werk mittig, weil eine Wand auf einem Handy keine
 * zweite Achse hat.
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
        <Wortweise
          text={texte.startseiteAuftakt}
          takt={45}
          className="erzaehlung max-w-2xl text-lead text-balance"
        />
        <div className="scrollhinweis mt-atem" aria-hidden="true" />
      </section>

      {/* --- Die Werke ---------------------------------------------------- */}
      {werke.map((werk, nummer) => {
        const bild = hauptbild(werk.bilder);
        if (!bild) return null;

        const istErstes = nummer === 0;
        const platz = haengung(nummer);
        const ruecken = haengungKlasse(platz.achse);

        return (
          <section
            key={werk.id}
            className="werkblock mb-stille px-4 sm:px-10 lg:px-16"
            aria-labelledby={`werk-${werk.id}`}
          >
            <div className="mx-auto max-w-[110rem]">
              <Einblenden
                className="w-full"
                schwelle={0.05}
                bewegung={istErstes ? "weich" : "tiefe"}
              >
                <Parallax staerke={istErstes ? 0 : 0.07}>
                  <div
                    className={`werkflaeche heranruecken mx-auto ${ruecken}`}
                    style={werkBreiteStil(
                      bild.breitePx,
                      bild.hoehePx,
                      82 * platz.groesse,
                      60 * platz.groesse,
                    )}
                  >
                    <WerkMitZoom
                      schluessel={bild.schluessel}
                      alt={bild.altText || werk.titel}
                      breitePx={bild.breitePx}
                      hoehePx={bild.hoehePx}
                      sizes="(max-width: 640px) 88vw, (max-width: 1024px) 76vw, 60rem"
                      vorrang={istErstes}
                    />
                  </div>
                </Parallax>
              </Einblenden>

              {/* Die Beschriftung folgt dem Werk an seine Achse — ein
                  Schildchen haengt neben dem Bild, nicht in der Mitte
                  der Wand. */}
              <Einblenden
                verzoegerung={140}
                className={`werkflaeche mx-auto mt-10 text-center ${ruecken}`}
                style={werkBreiteStil(
                  bild.breitePx,
                  bild.hoehePx,
                  82 * platz.groesse,
                  60 * platz.groesse,
                )}
              >
                <h2 id={`werk-${werk.id}`} className="text-titel leading-tight">
                  <Link href={`/werke/${werk.slug}`} className="unterstrich">
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
            </div>
          </section>
        );
      })}

      {/* --- Das Zitat ----------------------------------------------------
          Ein Satz, gross gesetzt, viel Raum darum — wie ein Wandtext
          zwischen zwei Saelen. */}
      {texte.startseiteZitat && (
        <section className="mx-auto max-w-[110rem] px-4 py-stille sm:px-10 lg:px-16">
          <Parallax staerke={0.05}>
            <blockquote className="mx-auto max-w-4xl text-center">
              <Wortweise
                text={`„${texte.startseiteZitat}“`}
                takt={80}
                className="zitat text-balance"
              />
              <Einblenden verzoegerung={260}>
                <footer className="beschriftung mt-10 not-italic">Lusine</footer>
              </Einblenden>
            </blockquote>
          </Parallax>
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
