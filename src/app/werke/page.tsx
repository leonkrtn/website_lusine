import type { Metadata } from "next";
import { Einblenden } from "@/components/Einblenden";
import { Werkkachel } from "@/components/Werkkachel";
import { holeWerke } from "@/lib/daten";

export const metadata: Metadata = {
  title: "Werke",
  description:
    "Alle Originale von Lusine — Öl und Acryl auf Leinwand, jedes Werk ein Unikat.",
};

/**
 * Der Katalog. Ein ruhiges Raster aus zwei Spalten, mit viel Abstand
 * dazwischen. Anders als auf der Startseite geht es hier um Uebersicht:
 * man soll vergleichen koennen, ohne zu blaettern.
 */
export default async function WerkeSeite() {
  const werke = await holeWerke();

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
        <div className="mt-stille grid grid-cols-1 items-center gap-y-stille sm:grid-cols-2 sm:gap-x-16 lg:gap-x-24">
          {werke.map((werk, nummer) => (
            <Werkkachel
              key={werk.id}
              werk={werk}
              // Die zweite Spalte erscheint einen Moment spaeter, damit
              // eine Zeile nicht als Block aufpoppt.
              verzoegerung={(nummer % 2) * 120}
            />
          ))}
        </div>
      )}
    </div>
  );
}
