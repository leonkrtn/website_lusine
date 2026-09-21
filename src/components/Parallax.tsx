"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /**
   * Wie stark der Inhalt gegenueber dem Scrollen zurueckbleibt.
   * 0.08 heisst: acht Prozent langsamer. Bewusst klein gehalten —
   * spuerbar, aber nicht auffaellig.
   */
  staerke?: number;
  className?: string;
};

/**
 * Bewegt seinen Inhalt beim Scrollen leicht langsamer als die Seite.
 *
 * Die Berechnung laeuft in requestAnimationFrame und schreibt nur eine
 * CSS-Variable, damit kein Layout neu berechnet wird.
 */
export function Parallax({ children, staerke = 0.08, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const knoten = ref.current;
    if (!knoten) return;

    // Wer ruhige Darstellung eingestellt hat, bekommt keinen Parallax.
    const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (ruhig.matches) return;

    let angefordert = false;

    const berechnen = () => {
      angefordert = false;
      const kasten = knoten.getBoundingClientRect();
      const fensterHoehe = window.innerHeight;

      // Ausserhalb des Blickfelds nichts rechnen.
      if (kasten.bottom < 0 || kasten.top > fensterHoehe) return;

      // -1 (Element verlaesst oben) bis +1 (Element kommt von unten)
      const mitte = kasten.top + kasten.height / 2;
      const fortschritt = (mitte - fensterHoehe / 2) / fensterHoehe;
      const versatz = fortschritt * fensterHoehe * staerke;

      knoten.style.setProperty("--parallax-versatz", `${versatz.toFixed(2)}px`);
    };

    const beiScroll = () => {
      if (angefordert) return;
      angefordert = true;
      requestAnimationFrame(berechnen);
    };

    berechnen();
    window.addEventListener("scroll", beiScroll, { passive: true });
    window.addEventListener("resize", beiScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", beiScroll);
      window.removeEventListener("resize", beiScroll);
    };
  }, [staerke]);

  return (
    <div ref={ref} className={`parallax ${className}`}>
      {children}
    </div>
  );
}
