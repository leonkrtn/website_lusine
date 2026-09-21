"use client";

import { useState } from "react";
import { Werkbild } from "@/components/Werkbild";
import { Zoomansicht } from "@/components/Zoomansicht";

type Props = {
  schluessel: string;
  alt: string;
  breitePx: number;
  hoehePx: number;
  sizes: string;
  vorrang?: boolean;
};

/**
 * Ein Werk, das sich auf Klick formatfuellend oeffnet.
 *
 * Die Zoomansicht wird erst gebaut, wenn sie gebraucht wird — solange
 * sie geschlossen ist, kostet sie nichts.
 */
export function WerkMitZoom({
  schluessel,
  alt,
  breitePx,
  hoehePx,
  sizes,
  vorrang = false,
}: Props) {
  const [offen, setOffen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOffen(true)}
        aria-label={`${alt} vergrößert ansehen`}
        className="block w-full cursor-zoom-in"
      >
        <Werkbild
          schluessel={schluessel}
          alt={alt}
          breitePx={breitePx}
          hoehePx={hoehePx}
          sizes={sizes}
          vorrang={vorrang}
        />
      </button>

      <Zoomansicht
        schluessel={schluessel}
        alt={alt}
        offen={offen}
        beimSchliessen={() => setOffen(false)}
      />
    </>
  );
}
