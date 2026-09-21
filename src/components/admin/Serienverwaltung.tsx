"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Feld, Leer, Meldung, Textfeld } from "@/components/admin/Bausteine";
import { speichereSerie, loescheSerie } from "@/app/admin/aktionen";
import { FORM_START } from "@/lib/adminzustand";
import type { Serie } from "@/lib/typen";

function Speichern() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="border-b border-tinte pb-1 text-klein transition-opacity duration-300 hover:opacity-60 disabled:opacity-40"
    >
      {pending ? "Wird gespeichert …" : "Speichern"}
    </button>
  );
}

function Serienformular({
  serie,
  gesperrt,
  beimFertig,
}: {
  serie?: Serie;
  gesperrt: boolean;
  beimFertig?: () => void;
}) {
  const [zustand, aktion] = useActionState(speichereSerie, FORM_START);

  // Nach erfolgreichem Anlegen das Formular wieder schliessen.
  if (zustand.erfolg && beimFertig) {
    queueMicrotask(beimFertig);
  }

  return (
    <form action={aktion} className="space-y-8">
      {serie && <input type="hidden" name="id" value={serie.id} />}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[2fr_1fr]">
        <Feld
          name="titel"
          beschriftung="Titel"
          standardwert={serie?.titel}
          pflicht
          gesperrt={gesperrt}
        />
        <Feld
          name="jahr"
          beschriftung="Jahr"
          standardwert={serie?.jahr}
          typ="number"
          gesperrt={gesperrt}
        />
      </div>

      <Feld
        name="slug"
        beschriftung="Adresse"
        hinweis={serie ? "Änderung macht geteilte Links ungültig." : "Leer lassen, dann aus dem Titel."}
        standardwert={serie?.slug}
        gesperrt={gesperrt}
      />

      <Textfeld
        name="einleitung"
        beschriftung="Einleitung"
        hinweis="Steht über den Werken der Serie und in der Serienübersicht."
        standardwert={serie?.einleitung}
        zeilen={6}
      />

      <Feld
        name="sortierung"
        beschriftung="Reihenfolge"
        hinweis="Kleinere Zahl steht weiter oben."
        standardwert={serie?.sortierung ?? 0}
        typ="number"
        gesperrt={gesperrt}
      />

      <div className="flex flex-wrap items-center gap-8">
        {!gesperrt && <Speichern />}
        <Meldung {...zustand} />
      </div>
    </form>
  );
}

export function Serienverwaltung({
  serien,
  anzahlProSerie,
  gesperrt,
}: {
  serien: Serie[];
  anzahlProSerie: Record<string, number>;
  gesperrt: boolean;
}) {
  const [neuOffen, setNeuOffen] = useState(false);
  const [offeneSerie, setOffeneSerie] = useState<string | null>(null);

  return (
    <div>
      {serien.length === 0 ? (
        <Leer>Noch keine Serien angelegt.</Leer>
      ) : (
        <ul>
          {serien.map((serie) => {
            const anzahl = anzahlProSerie[serie.id] ?? 0;
            const offen = offeneSerie === serie.id;

            return (
              <li key={serie.id} className="border-t border-linie py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setOffeneSerie(offen ? null : serie.id)}
                    aria-expanded={offen}
                    className="text-left"
                  >
                    <span className="text-basis">{serie.titel}</span>
                    <span className="beschriftung ml-4">
                      {[serie.jahr, anzahl === 1 ? "1 Werk" : `${anzahl} Werke`]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOffeneSerie(offen ? null : serie.id)}
                    className="text-klein text-tinte-leise"
                  >
                    {offen ? "Schließen" : "Bearbeiten"}
                  </button>
                </div>

                {offen && (
                  <div className="mt-8 max-w-2xl">
                    <Serienformular serie={serie} gesperrt={gesperrt} />

                    {!gesperrt && (
                      <details className="mt-10">
                        <summary className="cursor-pointer text-fluestern text-tinte-still">
                          Serie löschen
                        </summary>
                        <form action={loescheSerie} className="mt-4">
                          <input type="hidden" name="id" value={serie.id} />
                          <p className="max-w-lg text-klein text-tinte-leise">
                            Die Serie wird entfernt. Die {anzahl}{" "}
                            {anzahl === 1 ? "zugeordnete Arbeit bleibt" : "zugeordneten Werke bleiben"}{" "}
                            erhalten und {anzahl === 1 ? "verliert" : "verlieren"} nur die Zuordnung.
                          </p>
                          <button
                            type="submit"
                            className="mt-4 border-b border-[#a33] pb-1 text-klein text-[#a33] transition-opacity duration-300 hover:opacity-60"
                          >
                            Serie löschen
                          </button>
                        </form>
                      </details>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-12 border-t border-linie pt-10">
        {neuOffen ? (
          <div className="max-w-2xl">
            <h2 className="text-lead leading-snug">Neue Serie</h2>
            <div className="mt-8">
              <Serienformular gesperrt={gesperrt} beimFertig={() => setNeuOffen(false)} />
            </div>
            <button
              type="button"
              onClick={() => setNeuOffen(false)}
              className="mt-8 text-klein text-tinte-still"
            >
              Abbrechen
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setNeuOffen(true)}
            disabled={gesperrt}
            className="border-b border-tinte pb-1 text-klein transition-opacity duration-300 hover:opacity-60 disabled:opacity-40"
          >
            Neue Serie anlegen
          </button>
        )}
      </div>
    </div>
  );
}
