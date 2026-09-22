"use client";

import { useState, type ReactNode } from "react";

const ANSICHTEN = [
  {
    wert: "wand",
    name: "Wand",
    hinweis: "Alle Werke gleich groß — zum Vergleichen",
  },
  {
    wert: "massstab",
    name: "Maßstab",
    hinweis: "Im wahren Größenverhältnis zueinander",
  },
  {
    wert: "verzeichnis",
    name: "Verzeichnis",
    hinweis: "Als Liste, ohne Bilder",
  },
] as const;

type Ansicht = (typeof ANSICHTEN)[number]["wert"];

/**
 * Der Katalog in drei Ansichten.
 *
 * **Wand** haengt alle Werke gleich gross — so laesst sich die Malerei
 * vergleichen, unabhaengig vom Format. **Maßstab** gibt jedem Werk
 * seine wahre Groesse im Verhaeltnis zu den anderen; erst dort sieht
 * man, dass eine Studie eine Studie ist und eine grosse Leinwand den
 * Raum nimmt. **Verzeichnis** laesst die Bilder ganz weg und setzt
 * das Werk als gedruckte Liste.
 *
 * Alle drei Ansichten stehen fertig im HTML; dieser Baustein legt nur
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

        {/* Der Hinweis erklaert die gewaehlte Ansicht, statt drei
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
