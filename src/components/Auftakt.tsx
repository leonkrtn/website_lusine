"use client";

import { useEffect, useRef, ViewTransition } from "react";
import { Saalschild } from "@/components/Saalschild";
import { WerkMitZoom } from "@/components/WerkMitZoom";
import { werkBreiteStil } from "@/lib/darstellung";
import type { Werk, WerkBild } from "@/lib/typen";

type Props = {
  werk: Werk;
  bild: WerkBild;
};

/**
 * Wie weit der Auftakt über das bloße Füllen des Bildschirms hinaus
 * hineingeht. Bei 1 stünde das ganze Werk formatfüllend da, nur an
 * den Rändern beschnitten — das ist noch kein Pinselstrich, sondern
 * ein großes Bild. Erst ab etwa dem Doppelten sieht man, wie die
 * Farbe liegt.
 */
const NAEHE = 2.2;

/**
 * Wie groß das Werk am Ende steht — wie auf der Werkseite: die volle
 * Höhe abzüglich Kopfzeile, Verlauf und Rand. Siehe `.auftakt-buehne`
 * in globals.css; wer dort den Abstand ändert, zieht ihn hier nach.
 */
const HOEHE_ABZUG_REM = 10;
const BREITE_REM = 74;

/**
 * Der Auftakt der Startseite: vom Pinselstrich zum ganzen Werk.
 *
 * Die Seite öffnet nicht mit einem Bild, sondern mit seiner
 * Oberfläche — bildschirmfüllend, so nah, dass man sieht, wie die
 * Farbe liegt. Das ist es, was ein Original von jedem Druck
 * unterscheidet, und darum steht es am Anfang.
 *
 * Wer scrollt, tritt zurück. Die Bühne bleibt dabei stehen, und das
 * Werk schrumpft aus der Nähe auf sein Maß, bis es ganz und frei auf
 * dem Papier steht. Erst dann tritt das Saalschild hinzu, und die
 * Seite läuft weiter.
 *
 * **Eine Bewegung.** Das Werk kennt hier nur das Zurücktreten — kein
 * Auftritt, kein Wandern, kein Heranrücken unter dem Zeiger. Die
 * Bewegung hängt am Scrollen, nicht an einer Uhr (siehe `.auftakt`
 * in globals.css).
 *
 * **Die Nähe wird gemessen.** Wie stark das Werk vergrößert sein muss,
 * um den Bildschirm zu füllen, hängt vom Format des Werks und vom
 * Fenster ab: ein Querformat auf einem hochkant gehaltenen Handy
 * braucht ein Vielfaches dessen, was ein Hochformat am Schreibtisch
 * braucht. Eine feste Zahl ließe entweder weiße Ränder stehen oder
 * ginge unnötig tief ins Korn. Gerechnet wird darum hier, geschrieben
 * wird nur `--auftakt-naehe`; den Rest macht das Stylesheet.
 *
 * **Ohne Scroll-Zeitachse oder bei reduzierter Bewegung** steht das
 * Werk einfach am Seitenanfang, wie jedes andere, mit seinem Schild.
 */
export function Auftakt({ werk, bild }: Props) {
  const abschnitt = useRef<HTMLElement>(null);
  const buehne = useRef<HTMLDivElement>(null);
  const flaeche = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const abschnittEl = abschnitt.current;
    const buehneEl = buehne.current;
    const flaecheEl = flaeche.current;
    if (!abschnittEl || !buehneEl || !flaecheEl) return;

    const messen = () => {
      /* Gemessen wird die Fläche, nicht das Bild darin: die Fläche
         bleibt unverwandelt, das Bild trägt die Vergrößerung. So
         misst man immer das Endmaß, gleich an welcher Stelle der
         Bewegung man gerade steht. */
      const b = buehneEl.getBoundingClientRect();
      const f = flaecheEl.getBoundingClientRect();
      if (!f.width || !f.height) return;

      const fensterBreite = document.documentElement.clientWidth;
      const fensterHoehe = window.innerHeight;
      const mitteX = f.left + f.width / 2 - b.left;
      const mitteY = f.top + f.height / 2 - b.top;

      /* Das Werk wird um seine Mitte vergrößert. Es deckt das Fenster,
         sobald es bis zur jeweils entfernteren Kante reicht — in
         beiden Richtungen. */
      const deckung = Math.max(
        Math.max(mitteX, fensterBreite - mitteX) / (f.width / 2),
        Math.max(mitteY, fensterHoehe - mitteY) / (f.height / 2),
      );

      abschnittEl.style.setProperty(
        "--auftakt-naehe",
        (deckung * NAEHE).toFixed(3),
      );
    };

    messen();
    const beobachter = new ResizeObserver(messen);
    beobachter.observe(buehneEl);
    beobachter.observe(flaecheEl);
    return () => beobachter.disconnect();
  }, []);

  return (
    <section
      ref={abschnitt}
      className="auftakt"
      aria-labelledby={`werk-${werk.id}`}
    >
      <div ref={buehne} className="auftakt-buehne px-4 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-[110rem] werkreihe werkreihe--mitte">
          <div
            ref={flaeche}
            className="werkflaeche"
            style={werkBreiteStil(
              bild.breitePx,
              bild.hoehePx,
              100,
              BREITE_REM,
              88,
              HOEHE_ABZUG_REM,
            )}
          >
            <div className="auftakt-bild">
              {/* Der Name gehört ins Innere der Vergrößerung, nicht an
                  sie: so nimmt die Wanderung zur Werkseite das Werk in
                  der Größe mit, in der es gerade steht. */}
              <ViewTransition name={`werk-${werk.id}`} share="wanderung" default="none">
                <div>
                  <WerkMitZoom
                    schluessel={bild.schluessel}
                    alt={bild.altText || werk.titel}
                    breitePx={bild.breitePx}
                    hoehePx={bild.hoehePx}
                    /* Groß angefordert, weil das Bild am Anfang um ein
                       Vielfaches vergrößert steht. Mit der üblichen
                       Größe wäre der Pinselstrich, um den es geht, ein
                       Brei. */
                    sizes="(max-width: 640px) 300vw, 200vw"
                    vorrang
                  />
                </div>
              </ViewTransition>
            </div>
          </div>

          <Saalschild
            werk={werk}
            titelId={`werk-${werk.id}`}
            className="auftakt-schild"
            erscheint={false}
          />
        </div>
      </div>

      {/* Die Strecke, über die das Zurücktreten läuft. Ohne
          Scroll-Zeitachse hat sie keine Höhe. */}
      <div className="auftakt-weg" aria-hidden="true" />
    </section>
  );
}
