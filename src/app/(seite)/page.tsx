import { ViewTransition } from "react";
import Link from "next/link";
import { Auftakt } from "@/components/Auftakt";
import { Einblenden } from "@/components/Einblenden";
import { Saalschild } from "@/components/Saalschild";
import { Wortweise } from "@/components/Wortweise";
import { WerkMitZoom } from "@/components/WerkMitZoom";
import { holeStartseitenWerke, holeTexte } from "@/lib/daten";
import {
  haengung,
  haengungKlasse,
  hauptbild,
  pinFuer,
  werkBreiteStil,
} from "@/lib/darstellung";

/**
 * Wie hoch und wie breit ein Werk auf der Startseite höchstens steht.
 *
 * Die volle Fensterhöhe, abzüglich dessen, was die stehende Kopfzeile
 * und der Rand darüber schon belegen. Ohne diesen Abzug stünde ein
 * Werk mit seinem unteren Rand unter der Falz — bei einem Gemälde ist
 * das kein Detail, sondern ein halbes Bild.
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
 * **Der Auftakt.** Das erste Werk steht vor allem anderen, und es
 * beginnt nicht als Bild, sondern als seine Oberfläche: so nah, dass
 * man den Pinselstrich sieht. Wer scrollt, tritt zurück, bis das Werk
 * ganz dasteht. Siehe `Auftakt.tsx`.
 *
 * **Neben einem Werk steht nur sein Saalschild.** Der Auftaktsatz
 * gehört zu keinem Gemälde, sondern zur ganzen Auswahl — er steht
 * darum für sich, wie der Saaltext am Eingang einer Ausstellung, und
 * nicht in einer Reihe mit einem Bild. Stünde er daneben, läse man
 * ihn als Beschriftung, und das wäre schlicht falsch.
 *
 * **Die Hängung.** Gehängt wird wie an einer Wand, nicht wie in einer
 * Liste: das erste Werk groß und mittig als Auftakt, die folgenden im
 * Wechsel abseits. Die Folge steht fest in `haengung()`. Ab der großen
 * Breite wird sie sichtbar; darunter steht jedes Werk mittig, weil
 * eine Wand auf einem Handy keine zweite Achse hat.
 *
 * **Die Ebenen.** Werk und Schild liegen verschieden tief und wandern
 * beim Scrollen verschieden weit — das Werk am tiefsten und
 * langsamsten. Daraus entsteht der Raum. Gesteuert über `--tiefe`,
 * gerechnet in `globals.css`.
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
      {/* --- Der Auftakt ---------------------------------------------------
          Vom Pinselstrich zum ganzen Werk. */}
      {erstes && erstesBild && (
        <Auftakt werk={erstes} bild={erstesBild} pin={pinFuer(erstes)} />
      )}

      {/* --- Der Saaltext --------------------------------------------------
          Für sich allein, nichts daneben. Er spricht von der ganzen
          Auswahl, nicht von einem Werk. Er steht nach dem Auftakt, mit
          Abstand zu beiden Seiten — nicht in einer Reihe mit einem Bild. */}
      <section
        className={`mx-auto max-w-[110rem] px-4 pb-atem sm:px-10 lg:px-16 ${
          erstesBild ? "pt-stille" : "seitenanfang"
        }`}
      >
        <Wortweise
          text={texte.startseiteAuftakt}
          takt={45}
          className="saaltext"
        />
      </section>

      {/* --- Die Werke ------------------------------------------------------ */}
      {weitere.map((werk, index) => {
        const bild = hauptbild(werk.bilder);
        if (!bild) return null;

        /* Die Hängung zählt weiter, als stünde der Auftakt noch in
           der Reihe — sonst verschöbe sich die ganze Wand um einen
           Platz. */
        const platz = haengung(index + 1);
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
            <div className={`mx-auto max-w-[110rem] ${haengungKlasse(platz.achse)}`}>
              <div
                className="auftritt werkflaeche heranruecken"
                style={{ ...flaeche, "--tiefe": 0.3 } as React.CSSProperties}
              >
                {/* Derselbe Name wie im Katalog und auf der Werkseite:
                    wer hier auf den Titel tippt, sieht das Werk an
                    seinen Platz wandern, statt dass zwei Seiten
                    ineinander blenden. */}
                <ViewTransition name={`werk-${werk.id}`} share="wanderung" default="none">
                  <div>
                    <WerkMitZoom
                      schluessel={bild.schluessel}
                      alt={bild.altText || werk.titel}
                      breitePx={bild.breitePx}
                      hoehePx={bild.hoehePx}
                      sizes="(max-width: 640px) 88vw, (max-width: 1024px) 82vw, 74rem"
                    />
                  </div>
                </ViewTransition>
                <WerkMitZoom
                  schluessel={bild.schluessel}
                  alt={bild.altText || werk.titel}
                  breitePx={bild.breitePx}
                  hoehePx={bild.hoehePx}
                  sizes="(max-width: 640px) 88vw, (max-width: 1024px) 82vw, 74rem"
                  pin={pinFuer(werk)}
                />
              </div>

              {/* Das Schild hängt neben dem Werk, auf der Seite, die
                  es frei lässt. Es liegt näher als das Werk und
                  wandert beim Scrollen darum weiter. */}
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
          Ein Satz, gesetzt wie ein Wandtext zwischen zwei Sälen — und
          ebenfalls für sich, nicht neben einem Werk. */}
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
