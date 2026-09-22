import Link from "next/link";
import { Einblenden } from "@/components/Einblenden";
import { Saalschild } from "@/components/Saalschild";
import { Wortweise } from "@/components/Wortweise";
import { WerkMitZoom } from "@/components/WerkMitZoom";
import { holeStartseitenWerke, holeTexte } from "@/lib/daten";
import {
  haengung,
  haengungKlasse,
  hauptbild,
  werkBreiteStil,
} from "@/lib/darstellung";

/**
 * Wie hoch und wie breit ein Werk auf der Startseite höchstens steht.
 *
 * Die volle Fensterhöhe, abzüglich dessen, was die stehende Kopfzeile
 * und der Rand darüber schon belegen. Ohne diesen Abzug stünde das
 * erste Werk mit seinem unteren Rand unter der Falz — bei einem
 * Gemälde ist das kein Detail, sondern ein halbes Bild.
 */
const HOEHE_VH = 100;
const HOEHE_ABZUG_REM = 6;
const BREITE_REM = 74;

/**
 * Die Startseite ist kein Katalog, sondern eine Auswahl.
 *
 * Fünf Werke, jedes für sich, jedes fast bildschirmfüllend. Wer
 * scrollt, sieht immer nur ein Bild — das ist die Übersetzung eines
 * gut gehängten Galerieraums in eine Website.
 *
 * **Die Hängung.** Gehängt wird wie an einer Wand, nicht wie in einer
 * Liste: das erste Werk groß und mittig als Auftakt, die folgenden im
 * Wechsel abseits. Die Folge steht fest in `haengung()`. Ab der großen
 * Breite wird sie sichtbar; darunter steht jedes Werk mittig, weil
 * eine Wand auf einem Handy keine zweite Achse hat.
 *
 * **Die Ebenen.** Drei Dinge liegen in jedem Block verschieden tief
 * und wandern beim Scrollen verschieden weit: das Werk am tiefsten
 * und langsamsten, die Beschriftung darüber, die Nummer an der Wand
 * am nächsten und schnellsten. Daraus entsteht der Raum. Gesteuert
 * über `--tiefe`, gerechnet in `globals.css`.
 *
 * **Der Auftakt** teilt sich einen Bildschirm mit dem ersten Werk,
 * statt allein einen zu belegen.
 */
export default async function Startseite() {
  const [werke, texte] = await Promise.all([
    holeStartseitenWerke(5),
    holeTexte(),
  ]);

  const [erstes, ...weitere] = werke;
  const erstesBild = erstes ? hauptbild(erstes.bilder) : null;

  return (
    <div>
      {/* --- Auftakt und erstes Werk --------------------------------------
          Eine Komposition, keine zwei Stationen. */}
      <section className="mx-auto max-w-[110rem] px-4 pt-2 sm:px-10 lg:px-16">
        <div className="auftakt-raster">
          <Wortweise
            text={texte.startseiteAuftakt}
            takt={45}
            className="auftakt-satz erzaehlung text-lead text-balance"
          />

          {erstes && erstesBild && (
            <div className="auftakt-bild werkreihe">
              <div
                className="werkflaeche heranruecken"
                style={werkBreiteStil(
                  erstesBild.breitePx,
                  erstesBild.hoehePx,
                  HOEHE_VH,
                  BREITE_REM,
                  88,
                  HOEHE_ABZUG_REM,
                )}
              >
                <WerkMitZoom
                  schluessel={erstesBild.schluessel}
                  alt={erstesBild.altText || erstes.titel}
                  breitePx={erstesBild.breitePx}
                  hoehePx={erstesBild.hoehePx}
                  sizes="(max-width: 640px) 88vw, (max-width: 1024px) 82vw, 74rem"
                  vorrang
                />
              </div>

              <Saalschild werk={erstes} />
            </div>
          )}
        </div>
      </section>

      {/* --- Die übrigen Werke --------------------------------------------- */}
      {weitere.map((werk, versatz) => {
        const bild = hauptbild(werk.bilder);
        if (!bild) return null;

        const nummer = versatz + 1;
        const platz = haengung(nummer);
        const ruecken = haengungKlasse(platz.achse);
        const flaeche = werkBreiteStil(
          bild.breitePx,
          bild.hoehePx,
          HOEHE_VH * platz.groesse,
          BREITE_REM * platz.groesse,
          88,
          HOEHE_ABZUG_REM,
        );

        return (
          <section
            key={werk.id}
            className="werkblock mt-stille px-4 sm:px-10 lg:px-16"
            aria-labelledby={`werk-${werk.id}`}
          >
            <div className={`mx-auto max-w-[110rem] ${ruecken}`}>
              <div
                className="auftritt werkflaeche heranruecken"
                style={{ ...flaeche, "--tiefe": 0.3 } as React.CSSProperties}
              >
                <WerkMitZoom
                  schluessel={bild.schluessel}
                  alt={bild.altText || werk.titel}
                  breitePx={bild.breitePx}
                  hoehePx={bild.hoehePx}
                  sizes="(max-width: 640px) 88vw, (max-width: 1024px) 82vw, 74rem"
                />
              </div>

              {/* Das Schild hängt neben dem Werk, auf der Seite, die
                  es frei lässt. Es liegt näher als das Werk und
                  wandert beim Scrollen darum weiter — daher der Raum
                  zwischen beiden. */}
              <Saalschild
                werk={werk}
                titelId={`werk-${werk.id}`}
                className="auftritt"
                style={{ "--tiefe": 1.1 } as React.CSSProperties}
              />
            </div>
          </section>
        );
      })}

      {/* --- Das Zitat ----------------------------------------------------
          Ein Satz, gesetzt wie ein Wandtext zwischen zwei Sälen. */}
      {texte.startseiteZitat && (
        <section className="mx-auto max-w-[110rem] px-4 py-stille sm:px-10 lg:px-16">
          <blockquote
            className="auftritt mx-auto max-w-4xl text-center"
            style={{ "--tiefe": 1.4 } as React.CSSProperties}
          >
            <Wortweise
              text={`„${texte.startseiteZitat}“`}
              takt={80}
              className="zitat text-balance"
            />
            <Einblenden verzoegerung={260}>
              <footer className="beschriftung mt-10 not-italic">Lusine</footer>
            </Einblenden>
          </blockquote>
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
