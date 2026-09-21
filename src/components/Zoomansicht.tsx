"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { bildQuelle, istLokalesBild } from "@/lib/bilder";

type Props = {
  schluessel: string;
  alt: string;
  offen: boolean;
  beimSchliessen: () => void;
};

const ZOOM = 2.6;

/**
 * Das Werk formatfuellend, mit Zoom in die Pinselstruktur.
 *
 * Bei einem Original ist die Oberflaeche das Verkaufsargument: ob die
 * Farbe steht oder lasiert ist, wie die Kanten laufen, wo der Pinsel
 * abgesetzt hat. Das laesst sich in einer Katalogansicht nicht zeigen.
 *
 * Der Grund ist auch hier reinweiss. Ein abgedunkelter Hintergrund,
 * wie ihn die meisten Bildbetrachter verwenden, wuerde dem
 * freigestellten Gemaelde sofort eine Kante geben.
 */
export function Zoomansicht({ schluessel, alt, offen, beimSchliessen }: Props) {
  const [vergroessert, setVergroessert] = useState(false);
  const [versatz, setVersatz] = useState({ x: 0, y: 0 });
  const behaelter = useRef<HTMLDivElement>(null);
  const schliessenKnopf = useRef<HTMLButtonElement>(null);
  const vorherigerFokus = useRef<HTMLElement | null>(null);

  const schliessen = useCallback(() => {
    setVergroessert(false);
    setVersatz({ x: 0, y: 0 });
    beimSchliessen();
  }, [beimSchliessen]);

  // Tastatur: Escape schliesst, Tab bleibt in der Ansicht gefangen.
  useEffect(() => {
    if (!offen) return;

    vorherigerFokus.current = document.activeElement as HTMLElement | null;
    schliessenKnopf.current?.focus();

    const beiTaste = (ereignis: KeyboardEvent) => {
      if (ereignis.key === "Escape") {
        ereignis.preventDefault();
        schliessen();
        return;
      }

      if (ereignis.key !== "Tab") return;

      // Nur zwei bedienbare Elemente: Schliessen und das Bild selbst.
      const bedienbar = behaelter.current?.querySelectorAll<HTMLElement>(
        "button, [href], [tabindex]:not([tabindex='-1'])",
      );
      if (!bedienbar || bedienbar.length === 0) return;

      const erstes = bedienbar[0];
      const letztes = bedienbar[bedienbar.length - 1];

      if (ereignis.shiftKey && document.activeElement === erstes) {
        ereignis.preventDefault();
        letztes.focus();
      } else if (!ereignis.shiftKey && document.activeElement === letztes) {
        ereignis.preventDefault();
        erstes.focus();
      }
    };

    document.addEventListener("keydown", beiTaste);
    const vorherigeUeberlauf = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", beiTaste);
      document.body.style.overflow = vorherigeUeberlauf;
      vorherigerFokus.current?.focus();
    };
  }, [offen, schliessen]);

  if (!offen) return null;

  const quelle = bildQuelle(schluessel);
  if (!quelle) return null;

  // In der Zoomansicht immer die groesste verfuegbare Variante: hier
  // geht es ausschliesslich um Schaerfe.
  const adresse = istLokalesBild(schluessel) ? quelle : `${quelle}?b=3840`;

  /** Beim Hineinzoomen auf die angeklickte Stelle ausrichten. */
  const beiKlick = (ereignis: React.MouseEvent<HTMLElement>) => {
    if (vergroessert) {
      setVergroessert(false);
      setVersatz({ x: 0, y: 0 });
      return;
    }

    const kasten = ereignis.currentTarget.getBoundingClientRect();
    const anteilX = (ereignis.clientX - kasten.left) / kasten.width - 0.5;
    const anteilY = (ereignis.clientY - kasten.top) / kasten.height - 0.5;

    setVersatz({
      x: -anteilX * kasten.width * (ZOOM - 1),
      y: -anteilY * kasten.height * (ZOOM - 1),
    });
    setVergroessert(true);
  };

  /** Im vergroesserten Zustand folgt der Ausschnitt der Maus. */
  const beiBewegung = (ereignis: React.MouseEvent<HTMLElement>) => {
    if (!vergroessert) return;

    const kasten = ereignis.currentTarget.getBoundingClientRect();
    const anteilX = (ereignis.clientX - kasten.left) / kasten.width - 0.5;
    const anteilY = (ereignis.clientY - kasten.top) / kasten.height - 0.5;

    setVersatz({
      x: -anteilX * kasten.width * (ZOOM - 1),
      y: -anteilY * kasten.height * (ZOOM - 1),
    });
  };

  return (
    <div
      ref={behaelter}
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} — vergrößerte Ansicht`}
      className="fixed inset-0 z-50 bg-papier"
    >
      <button
        ref={schliessenKnopf}
        type="button"
        onClick={schliessen}
        className="absolute top-6 right-6 z-10 text-klein text-tinte-leise transition-colors duration-300 hover:text-tinte sm:top-8 sm:right-10"
      >
        Schließen
      </button>

      <div
        className="flex h-full w-full items-center justify-center overflow-hidden p-4 sm:p-10"
        onMouseMove={beiBewegung}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- volle
            Aufloesung ohne Zwischenschritt, siehe Werkbild.tsx */}
        <img
          src={adresse}
          alt={alt}
          onClick={beiKlick}
          style={{
            transform: vergroessert
              ? `scale(${ZOOM}) translate(${versatz.x / ZOOM}px, ${versatz.y / ZOOM}px)`
              : "none",
            transition: "transform 600ms cubic-bezier(0.22, 0.61, 0.36, 1)",
          }}
          className={`werkbild max-h-full max-w-full object-contain ${
            vergroessert ? "cursor-zoom-out" : "cursor-zoom-in"
          }`}
        />
      </div>

      <p className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-fluestern text-tinte-still sm:bottom-8">
        {vergroessert ? "Klicken zum Verkleinern" : "Klicken für die Pinselstruktur"}
      </p>
    </div>
  );
}
