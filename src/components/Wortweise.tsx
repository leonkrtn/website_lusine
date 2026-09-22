"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type Props = {
  text: string;
  /** Abstand zwischen zwei Woertern in Millisekunden. */
  takt?: number;
  /** Wie weit das Element im Bild sein muss, bevor es erscheint. */
  schwelle?: number;
  className?: string;
};

/**
 * Laesst einen Satz Wort fuer Wort erscheinen.
 *
 * Gedacht fuer die wenigen Saetze, die auf der Startseite fuer sich
 * allein stehen — den Auftakt und das Zitat. Fuer Fliesstext ist der
 * Effekt falsch: was gelesen werden soll, muss sofort ganz dastehen.
 *
 * Der vollstaendige Satz steht immer im HTML. Ohne JavaScript oder bei
 * eingeschalteter Bewegungsreduktion ist er unveraendert da, nur ohne
 * Aufbau.
 */
export function Wortweise({
  text,
  takt = 55,
  schwelle = 0.2,
  className = "",
}: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [sichtbar, setSichtbar] = useState(false);

  useEffect(() => {
    const knoten = ref.current;
    if (!knoten) return;

    // Kein IntersectionObserver (sehr alte Browser): sofort zeigen.
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setSichtbar(true));
      return;
    }

    const beobachter = new IntersectionObserver(
      ([eintrag]) => {
        if (eintrag.isIntersecting) {
          setSichtbar(true);
          beobachter.disconnect();
        }
      },
      { threshold: schwelle, rootMargin: "0px 0px -8% 0px" },
    );

    beobachter.observe(knoten);
    return () => beobachter.disconnect();
  }, [schwelle]);

  const woerter = text.split(/\s+/).filter(Boolean);

  return (
    <p
      ref={ref}
      className={`wortweise ${className}`}
      data-sichtbar={sichtbar ? "true" : "false"}
      style={{ "--wort-takt": `${takt}ms` } as CSSProperties}
    >
      {woerter.map((wort, nummer) => (
        <Fragment key={nummer}>
          {nummer > 0 ? " " : null}
          {/* Nach dreissig Woertern laeuft die Staffelung nicht weiter
              auf: ein langer Satz soll sich aufbauen, nicht kriechen. */}
          <span style={{ "--wort": Math.min(nummer, 30) } as CSSProperties}>
            {wort}
          </span>
        </Fragment>
      ))}
    </p>
  );
}
