import { ViewTransition } from "react";
import { WerkVerweis } from "@/components/WerkVerweis";
import { Werkbild } from "@/components/Werkbild";
import { Saalschild } from "@/components/Saalschild";
import { Signatur } from "@/components/Signatur";
import { Einblenden } from "@/components/Einblenden";
import { werkseitenQuelle } from "@/lib/werkseitenbild";
import { hauptbild, pinFuer, werkBreiteStil } from "@/lib/darstellung";
import { type Werk } from "@/lib/typen";

type Props = {
  werk: Werk;
  verzoegerung?: number;
  /** Maximale Bildhoehe in Prozent der Fensterhoehe. */
  maxHoeheVh?: number;
  sizes?: string;
};

/**
 * Ein Werk in der Uebersicht.
 *
 * Beim Darueberfahren erscheint die Signatur dieses Werks zart unter dem
 * Bild — eine kleine Belohnung fuer Neugier, die die Ruhe der Seite
 * nicht stoert. Auf Geraeten ohne Zeigegeraet bleibt sie aus: ein
 * Effekt, der sich auf dem Handy nie ausloesen laesst, wuerde dort nur
 * unerklaerlichen Leerraum hinterlassen.
 *
 * Beim Klick bleibt das Bild stehen und wandert an seinen Platz auf
 * der Werkseite, waehrend alles andere wechselt. Dafuer traegt es
 * denselben `ViewTransition`-Namen wie das grosse Bild dort. Auf
 * reinweissem Grund ohne Rahmen sieht das nicht nach Seitenwechsel
 * aus, sondern nach einer Kamerafahrt — man verliert das Werk nie aus
 * dem Blick. Wo der Browser das nicht kann, wechselt die Seite wie
 * bisher.
 */
export function Werkkachel({
  werk,
  verzoegerung = 0,
  maxHoeheVh = 62,
  sizes = "(max-width: 768px) 88vw, 40vw",
}: Props) {
  const bild = hauptbild(werk.bilder);
  if (!bild) return null;

  const breite = werkBreiteStil(bild.breitePx, bild.hoehePx, maxHoeheVh, 34);

  return (
    <Einblenden verzoegerung={verzoegerung} als="article">
      {/* Museale Hängung: alle Werke einer Zeile teilen sich dieselbe
          Mittelachse, unabhängig von Hoch- oder Querformat. Genau so
          hängt man Bilder an eine Wand.

          Werk und Schild bilden darin eine Reihe: das Schild hängt an
          der Unterkante des Werks, nicht am Boden der Zeile — sonst
          hinge es bei einem Querformat weit unter dem Bild in der
          Luft.

          Mindesthöhe, keine feste Höhe: auf dem Handy steht das
          Schild unter dem Werk, und beides zusammen ist höher als
          das Werk allein. Bei fester Höhe liefe das Schild in die
          nächste Kachel und das folgende Werk läge darüber. */}
      <div
        className="flex items-center justify-center"
        style={{ minHeight: `${maxHoeheVh}vh` }}
      >
        <div className="werkreihe werkreihe--eng group">
          {/* `tabIndex={-1}`, weil der Titel auf dem Schild zum selben
              Werk führt: mit der Tastatur soll man nicht zweimal
              dieselbe Station anfahren. Nicht `aria-hidden` — der
              Alternativtext beschreibt das Gemälde und ist für
              jemanden, der die Seite vorgelesen bekommt, das
              Einzige, was vom Bild übrig bleibt. */}
          <WerkVerweis
            href={`/werke/${werk.slug}`}
            quelle={werkseitenQuelle(bild)}
            className="block"
            tabIndex={-1}
          >
            <div className="werkflaeche" style={breite}>
              <ViewTransition name={`werk-${werk.id}`} share="wanderung" default="none">
                <Werkbild
                  schluessel={bild.schluessel}
                  alt={bild.altText || werk.titel}
                  breitePx={bild.breitePx}
                  hoehePx={bild.hoehePx}
                  sizes={sizes}
                  className="transition-opacity duration-700 group-hover:opacity-90"
                  pin={pinFuer(werk)}
                />
              </ViewTransition>
            </div>
          </WerkVerweis>

          <Saalschild werk={werk} knapp>
            {/* Die Signatur nimmt immer ihren Platz ein, auch
                unsichtbar — sonst spränge das Schild beim
                Darüberfahren. */}
            <div className="mt-5 flex h-10 items-center opacity-0 transition-opacity duration-700 [@media(hover:hover)]:group-hover:opacity-100">
              <Signatur
                schluessel={werk.signaturSchluessel}
                werkTitel={werk.titel}
                breite={130}
              />
            </div>
          </Saalschild>
        </div>
      </div>
    </Einblenden>
  );
}
