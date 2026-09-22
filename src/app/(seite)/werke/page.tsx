import type { Metadata } from "next";
import { Einblenden } from "@/components/Einblenden";
import { Katalog } from "@/components/Katalog";
import { Werkkachel } from "@/components/Werkkachel";
import { Werkverzeichnis } from "@/components/Werkverzeichnis";
import { holeWerke } from "@/lib/daten";
import { hoechsteHoeheCm } from "@/lib/darstellung";

export const metadata: Metadata = {
  title: "Werke",
  description:
    "Alle Originale von Lusine — Öl und Acryl auf Leinwand, jedes Werk ein Unikat.",
};

/**
 * Der Katalog, in drei Ansichten.
 *
 * Die **Wand** ist ein ruhiges Raster aus zwei Spalten mit viel
 * Abstand: alle Werke gleich gross, damit sich die Malerei
 * vergleichen laesst, unabhaengig vom Format.
 *
 * Der **Maßstab** nimmt das zurueck und gibt jedem Werk seine wahre
 * Groesse im Verhaeltnis zu den anderen. Bei Malerei ist die Groesse
 * Inhalt — sie entscheidet, ob man vor einem Bild steht oder es in
 * die Hand nimmt. Ein Katalog, der alles gleich gross zeigt,
 * unterschlaegt das.
 *
 * Das **Verzeichnis** laesst die Bilder weg und setzt die Werke als
 * Liste.
 *
 * Alle drei stehen fertig im HTML, umgeschaltet wird nur ein
 * data-Attribut. Ohne JavaScript bleibt die Wand stehen.
 */
export default async function WerkeSeite() {
  const werke = await holeWerke();
  const hoechsteCm = hoechsteHoeheCm(werke);

  return (
    <div className="mx-auto max-w-[110rem] px-4 pt-16 sm:px-10 lg:px-16">
      <Einblenden als="header">
        <h1 className="text-gross leading-tight">Werke</h1>
        <p className="erzaehlung mt-8">
          {werke.length === 1
            ? "Ein Werk."
            : `${werke.length} Werke.`}{" "}
          Alle Arbeiten sind Originale und existieren genau einmal.
        </p>
      </Einblenden>

      {werke.length === 0 ? (
        <p className="mt-atem text-tinte-leise">
          Zurzeit sind keine Werke eingestellt.
        </p>
      ) : (
        <Katalog
          wand={
            <div className="grid grid-cols-1 gap-y-atem sm:grid-cols-2 sm:gap-x-16 lg:gap-x-24">
              {werke.map((werk, nummer) => (
                <Werkkachel
                  key={werk.id}
                  werk={werk}
                  hoechsteCm={hoechsteCm}
                  // Die zweite Spalte erscheint einen Moment spaeter, damit
                  // eine Zeile nicht als Block aufpoppt.
                  verzoegerung={(nummer % 2) * 120}
                />
              ))}
            </div>
          }
          verzeichnis={<Werkverzeichnis werke={werke} />}
        />
      )}
    </div>
  );
}
