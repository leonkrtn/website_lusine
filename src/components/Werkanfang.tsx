"use client";

import { useState, ViewTransition, type ReactNode } from "react";
import { Auftakt } from "@/components/Auftakt";
import { Saalschild } from "@/components/Saalschild";
import { WerkMitZoom } from "@/components/WerkMitZoom";
import { kommtVonDraussen } from "@/lib/ankunft";
import { werkBreiteStil, type PinAngaben } from "@/lib/darstellung";
import { WERKSEITE_SIZES } from "@/lib/werkseitenbild";
import type { Werk, WerkBild } from "@/lib/typen";

type Props = {
  werk: Werk;
  bild: WerkBild;
  pin: PinAngaben;
  /** Wird ins Schild unter die Angaben gehängt. */
  children?: ReactNode;
};

/** Wie breit das Werk auf der Werkseite höchstens steht. */
const BREITE_REM = 64;

/**
 * Der Kopf der Werkseite: das Werk und sein Schild.
 *
 * Es gibt zwei Wege hierher, und jeder bekommt genau eine Bewegung.
 *
 * **Aus der Galerie.** Wer im Katalog oder auf der Startseite auf ein
 * Werk tippt, sieht es an diesen Platz wandern (View Transition).
 * Nichts blendet darunter, nichts schneidet gleichzeitig hinein.
 *
 * **Von draußen.** Wer über einen Link kommt — aus einer Instagram-
 * Story, von einem Pin, aus einer Nachricht —, hat das Werk gerade als
 * Ausschnitt gesehen, auf eine Handbreite zusammengedrückt, zwischen
 * fremden Bildern. Für ihn gibt es nichts, von dem aus das Werk
 * wandern könnte. Er tritt darum ein wie durch die Startseite: am
 * Pinselstrich, bildschirmfüllend, und tritt beim Scrollen zurück,
 * bis das ganze Werk dasteht (`Auftakt.tsx`). Das ist genau das, was
 * der Beitrag draußen nicht zeigen konnte.
 *
 * Welcher Weg vorliegt, weiß `src/lib/ankunft.ts`. Der Wert wird
 * einmal beim Aufbau gelesen und bleibt dann stehen — sonst stünde
 * nach einer Anfrage aus dem Formular plötzlich der andere Kopf da.
 */
export function Werkanfang({ werk, bild, pin, children }: Props) {
  const [vonDraussen] = useState(kommtVonDraussen);
  const wanderung = `werk-${werk.id}`;

  if (vonDraussen) {
    return (
      <Auftakt
        werk={werk}
        bild={bild}
        breiteRem={BREITE_REM}
        als="h1"
        verlinkt={false}
        wanderung={wanderung}
        pin={pin}
      >
        {children}
      </Auftakt>
    );
  }

  return (
    <section className="werkanfang mx-auto max-w-[110rem] px-4 sm:px-10 lg:px-16">
      <div className="werkreihe werkreihe--mitte">
        <div
          className="werkflaeche"
          /* Der Abzug deckt Kopfzeile, Verlauf und den Rand darunter
             ab — siehe `.werkanfang` in globals.css. Ohne ihn stünde
             das Werk unter der Falz. */
          style={werkBreiteStil(bild.breitePx, bild.hoehePx, 100, BREITE_REM, 88, 10)}
        >
          <ViewTransition name={wanderung} share="wanderung" default="none">
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

        <Saalschild werk={werk} als="h1" verlinkt={false}>
          {children}
        </Saalschild>
      </div>
    </section>
  );
}
