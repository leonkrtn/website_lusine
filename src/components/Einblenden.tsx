"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

type Props = {
  children: ReactNode;
  /** Verzoegerung in Millisekunden, um mehrere Elemente gestaffelt
   *  erscheinen zu lassen. Sparsam einsetzen. */
  verzoegerung?: number;
  /** Wie weit das Element im Bild sein muss, bevor es erscheint. */
  schwelle?: number;
  als?: ElementType;
  className?: string;
  /** Wird mit der Verzoegerung zusammengefuehrt, nicht ersetzt. */
  style?: CSSProperties;
};

/**
 * Laesst seinen Inhalt sanft erscheinen, sobald er in den Blick kommt.
 *
 * Der Inhalt ist im HTML immer vorhanden; nur die Sichtbarkeit wird
 * animiert. Ohne JavaScript oder bei eingeschalteter Bewegungsreduktion
 * ist alles sofort da — darum greift hier kein `display: none`.
 */
export function Einblenden({
  children,
  verzoegerung = 0,
  schwelle = 0.12,
  als: Element = "div",
  className = "",
  style,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [sichtbar, setSichtbar] = useState(false);

  useEffect(() => {
    const knoten = ref.current;
    if (!knoten) return;

    // Kein IntersectionObserver (sehr alte Browser): sofort zeigen.
    // Ueber queueMicrotask, damit der Zustandswechsel nicht noch im
    // laufenden Effekt passiert und eine zweite Renderrunde ausloest.
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setSichtbar(true));
      return;
    }

    const beobachter = new IntersectionObserver(
      ([eintrag]) => {
        if (eintrag.isIntersecting) {
          setSichtbar(true);
          // Einmal erschienen bleibt erschienen. Ein erneutes Ausblenden
          // beim Zurueckscrollen wirkt unruhig.
          beobachter.disconnect();
        }
      },
      { threshold: schwelle, rootMargin: "0px 0px -8% 0px" },
    );

    beobachter.observe(knoten);
    return () => beobachter.disconnect();
  }, [schwelle]);

  return (
    <Element
      ref={ref}
      className={`einblenden ${className}`}
      data-sichtbar={sichtbar ? "true" : "false"}
      style={
        verzoegerung ? { ...style, transitionDelay: `${verzoegerung}ms` } : style
      }
    >
      {children}
    </Element>
  );
}
