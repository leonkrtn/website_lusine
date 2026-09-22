"use client";

import { useState, type ReactNode } from "react";

const ANSICHTEN = [
  {
    wert: "wand",
    name: "Wand",
    hinweis: "Alle Werke gleich groß — zum Vergleichen",
  },
  {
    wert: "verzeichnis",
    name: "Liste",
    hinweis: "Als Liste, ohne Bilder",
  },
] as const;

type Ansicht = (typeof ANSICHTEN)[number]["wert"];

/**
 * Der Katalog in zwei Ansichten.
 *
 * **Wand** haengt alle Werke gleich gross — so laesst sich die Malerei
 * vergleichen, unabhaengig vom Format. **Liste** laesst die Bilder
 * ganz weg und setzt das Werk als gedrucktes Verzeichnis. Wie gross
 * ein Werk wirklich ist, zeigt seine eigene Seite im Vergleich mit
 * einem Blatt DIN A4.
 *
 * Beide Ansichten stehen fertig im HTML; dieser Baustein legt nur
 * ein data-Attribut um, den Rest macht CSS. Dadurch bleibt die Seite
 * vollstaendig vorgerendert: kein Nachladen, keine zweite Runde
 * Bilder, und ohne JavaScript steht die Wand da wie zuvor.
 */
export function Katalog({
  wand,
  verzeichnis,
}: {
  wand: ReactNode;
  verzeichnis: ReactNode;
}) {
  const [ansicht, setAnsicht] = useState<Ansicht>("wand");
  const gewaehlt = ANSICHTEN.find((a) => a.wert === ansicht) ?? ANSICHTEN[0];

  return (
    <div className="katalog" data-ansicht={ansicht}>
      <div className="mt-atem">
        <div
          className="katalog-wahl text-klein"
          role="group"
          aria-label="Ansicht des Katalogs"
        >
          {ANSICHTEN.map((eintrag) => (
            <button
              key={eintrag.wert}
              type="button"
              aria-pressed={ansicht === eintrag.wert}
              onClick={() => setAnsicht(eintrag.wert)}
            >
              {eintrag.name}
            </button>
          ))}
        </div>

        {/* Der Hinweis erklaert die gewaehlte Ansicht, statt zwei
            Erklaerungen nebeneinanderzustellen. `aria-live` sagt sie
            auch dem an, der die Seite vorgelesen bekommt. */}
        <p className="mt-3 text-fluestern text-tinte-still" aria-live="polite">
          {gewaehlt.hinweis}
        </p>
      </div>

      <div className="katalog-wand mt-stille">{wand}</div>
      <div className="katalog-verzeichnis mt-atem">{verzeichnis}</div>
    </div>
  );
}
