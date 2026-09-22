import { ViewTransition, type ReactNode } from "react";
import { Saalschild } from "@/components/Saalschild";
import { WerkMitZoom } from "@/components/WerkMitZoom";
import { werkBreiteStil, type PinAngaben } from "@/lib/darstellung";
import { WERKSEITE_SIZES } from "@/lib/werkseitenbild";
import type { Werk, WerkBild } from "@/lib/typen";

type Props = {
  werk: Werk;
  bild: WerkBild;
  pin: PinAngaben;
  /**
   * Wie breit das Werk höchstens steht. Die Startseite hängt es
   * breiter als die Werkseite, auf der das Schild mehr Platz braucht.
   */
  breiteRem?: number;
  /** Auf der Werkseite ist der Titel die Überschrift der Seite. */
  als?: "h1" | "h2";
  /** Ob der Titel zum Werk führt — auf der Werkseite selbst nicht. */
  verlinkt?: boolean;
  /** Das Schild in der Fassung der Startseite, siehe `Saalschild.tsx`. */
  schlicht?: { serie: string | null };
  /** Wird ins Schild unter die Angaben gehängt. */
  children?: ReactNode;
};

/**
 * Ein Werk am Seitenanfang, daneben sein Schild: der Kopf der
 * Werkseite und das erste Werk der Startseite.
 *
 * Es steht einfach da, in voller Größe, ohne eigene Bewegung. Wer aus
 * der Galerie kommt, sieht es an diesen Platz wandern (View
 * Transition) — das ist die einzige.
 */
export function Werkanfang({
  werk,
  bild,
  pin,
  breiteRem = 64,
  als = "h1",
  verlinkt = false,
  schlicht,
  children,
}: Props) {
  return (
    <section
      className="werkanfang mx-auto max-w-[110rem] px-4 sm:px-10 lg:px-16"
      aria-labelledby={`werk-${werk.id}`}
    >
      <div className="werkreihe werkreihe--mitte">
        <div
          className="werkflaeche"
          /* Der Abzug deckt Kopfzeile, Verlauf und den Rand darunter
             ab — siehe `.werkanfang` in globals.css. Ohne ihn stünde
             das Werk unter der Falz. */
          style={werkBreiteStil(bild.breitePx, bild.hoehePx, 100, breiteRem, 88, 10)}
        >
          <ViewTransition name={`werk-${werk.id}`} share="wanderung" default="none">
            <div>
              <WerkMitZoom
                schluessel={bild.schluessel}
                alt={bild.altText || werk.titel}
                breitePx={bild.breitePx}
                hoehePx={bild.hoehePx}
                sizes={WERKSEITE_SIZES}
                vorrang
                pin={pin}
              />
            </div>
          </ViewTransition>
        </div>

        <Saalschild
          werk={werk}
          titelId={`werk-${werk.id}`}
          als={als}
          verlinkt={verlinkt}
          schlicht={schlicht}
        >
          {children}
        </Saalschild>
      </div>
    </section>
  );
}
