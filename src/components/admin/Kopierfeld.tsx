"use client";

import { useState } from "react";

/**
 * Ein Text zum Mitnehmen: lesbar, markierbar, mit einem Knopf, der ihn
 * in die Zwischenablage legt. Für alles, was Lusine anderswo einfügt —
 * eine Bildunterschrift, einen Link, eine Pin-Beschreibung.
 */
export function Kopierfeld({
  beschriftung,
  text,
  zeilen = 1,
}: {
  beschriftung: string;
  text: string;
  zeilen?: number;
}) {
  const [kopiert, setKopiert] = useState(false);

  async function kopieren() {
    try {
      await navigator.clipboard.writeText(text);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    } catch {
      /* Ohne Erlaubnis zur Zwischenablage bleibt das Markieren von
         Hand; der Text steht ja da. */
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-6">
        <span className="beschriftung">{beschriftung}</span>
        <button
          type="button"
          onClick={kopieren}
          className="text-klein text-tinte-leise transition-colors duration-300 hover:text-tinte"
          aria-live="polite"
        >
          {kopiert ? "Kopiert" : "Kopieren"}
        </button>
      </div>
      <textarea
        readOnly
        rows={zeilen}
        value={text}
        aria-label={beschriftung}
        onFocus={(ereignis) => ereignis.currentTarget.select()}
        className="mt-2 w-full resize-none border-0 border-b border-feldlinie bg-papier pb-2 text-basis leading-relaxed outline-none"
      />
    </div>
  );
}
