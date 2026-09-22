import { ViewTransition, type CSSProperties } from "react";
import Link from "next/link";
import { Werkbild } from "@/components/Werkbild";
import { Signatur } from "@/components/Signatur";
import { Einblenden } from "@/components/Einblenden";
import {
  hauptbild,
  wahreBreiteStil,
  werkBreiteStil,
} from "@/lib/darstellung";
import { STATUS_BESCHRIFTUNG, type Werk } from "@/lib/typen";

type Props = {
  werk: Werk;
  verzoegerung?: number;
  /** Maximale Bildhoehe in Prozent der Fensterhoehe. */
  maxHoeheVh?: number;
  sizes?: string;
  /**
   * Die groesste Werkhoehe der Auswahl in Zentimetern. Ist sie
   * gesetzt, traegt die Kachel zusaetzlich ihre Breite im wahren
   * Groessenverhaeltnis — welche der beiden gilt, entscheidet allein
   * das data-Attribut am Katalog, siehe globals.css.
   */
  hoechsteCm?: number;
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
  hoechsteCm = 0,
}: Props) {
  const bild = hauptbild(werk.bilder);
  if (!bild) return null;

  const wand = werkBreiteStil(bild.breitePx, bild.hoehePx, maxHoeheVh, 34);
  const wahr = hoechsteCm
    ? wahreBreiteStil(
        bild.breitePx,
        bild.hoehePx,
        werk.hoeheCm,
        hoechsteCm,
        maxHoeheVh,
        34,
      )
    : wand;

  return (
    <Einblenden verzoegerung={verzoegerung} als="article">
      <Link href={`/werke/${werk.slug}`} className="group block">
        {/* Museale Haengung: alle Werke einer Zeile teilen sich dieselbe
            Mittelachse, unabhaengig von Hoch- oder Querformat. Genau so
            haengt man Bilder an eine Wand — und nur so stehen die Titel
            darunter auf einer Linie, statt zu tanzen. */}
        <div
          className="flex items-center justify-center"
          style={{ height: `${maxHoeheVh}vh` }}
        >
          <div
            className="werkflaeche kachel-flaeche mx-auto"
            style={
              {
                "--breite-wand": wand.width,
                "--breite-wahr": wahr.width,
              } as CSSProperties
            }
          >
            <ViewTransition name={`werk-${werk.id}`} share="wanderung" default="none">
              <Werkbild
                schluessel={bild.schluessel}
                alt={bild.altText || werk.titel}
                breitePx={bild.breitePx}
                hoehePx={bild.hoehePx}
                sizes={sizes}
                className="transition-opacity duration-700 group-hover:opacity-90"
              />
            </ViewTransition>
          </div>
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-lead leading-snug">{werk.titel}</h2>

          <p className="beschriftung mt-3">
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

          {/* Die Signatur nimmt immer ihren Platz ein, auch unsichtbar —
              sonst wuerde die Zeile darunter beim Darueberfahren
              springen. */}
          <div className="mt-5 flex h-10 items-center justify-center opacity-0 transition-opacity duration-700 [@media(hover:hover)]:group-hover:opacity-100">
            <Signatur
              schluessel={werk.signaturSchluessel}
              werkTitel={werk.titel}
              breite={150}
            />
          </div>
        </div>
      </Link>
    </Einblenden>
  );
}
