import type { Metadata } from "next";
import Link from "next/link";
import { Einblenden } from "@/components/Einblenden";
import { Saalschild } from "@/components/Saalschild";
import { Werkbild } from "@/components/Werkbild";
import { holeSerien, holeWerkeDerSerie } from "@/lib/daten";
import {
  haengungKlasse,
  hauptbild,
  werkBreiteStil,
} from "@/lib/darstellung";

export const metadata: Metadata = {
  title: "Serien",
  description:
    "Die Werkgruppen von Lusine — jede mit eigener Entstehungsgeschichte.",
};

/**
 * Die Serienuebersicht.
 *
 * Jede Serie zeigt ihre Einleitung und ein einzelnes Werk als
 * Stellvertreter. Wer mehr sehen will, geht in die Serie hinein — die
 * Uebersicht soll neugierig machen, nicht alles vorwegnehmen.
 */
export default async function SerienSeite() {
  const serien = await holeSerien();

  const mitWerken = await Promise.all(
    serien.map(async (serie) => ({
      serie,
      werke: await holeWerkeDerSerie(serie.id),
    })),
  );

  return (
    <div className="seitenanfang mx-auto max-w-[110rem] px-4 sm:px-10 lg:px-16">
      <Einblenden als="header">
        <h1 className="text-gross leading-tight">Serien</h1>
        <p className="erzaehlung mt-8">
          Werke entstehen selten einzeln. Meist gehören sie zu einer Gruppe,
          die über Monate wächst und einem gemeinsamen Gedanken folgt.
        </p>
      </Einblenden>

      {mitWerken.length === 0 ? (
        <p className="mt-atem text-tinte-leise">Noch keine Serien angelegt.</p>
      ) : (
        <div className="mt-stille">
          {mitWerken.map(({ serie, werke }, nummer) => {
            const stellvertreter = werke[0];
            const bild = stellvertreter ? hauptbild(stellvertreter.bilder) : null;

            return (
              /* Der Serientext steht **über** dem Werk, nicht daneben.
                 Er gehört zu keinem einzelnen Gemälde, sondern zur
                 Gruppe — neben einem Werk steht nur dessen Saalschild.
                 Stünde er in einer Reihe damit, läse man „Stille
                 Räume" als Titel genau des Bildes, das daneben hängt.

                 So gelesen ist die Seite auch stimmig mit der einzelnen
                 Serienseite: erst der Wandtext, dann die Werke. */
              <section key={serie.id} className="mb-stille">
                <Einblenden className="max-w-[38rem]">
                  <h2 className="text-titel leading-tight">
                    <Link
                      href={`/serien/${serie.slug}`}
                      className="unterstrich"
                    >
                      {serie.titel}
                    </Link>
                  </h2>

                  <p className="beschriftung mt-4">
                    {[
                      serie.jahr,
                      werke.length === 1 ? "1 Werk" : `${werke.length} Werke`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>

                  <p className="saaltext mt-8">{serie.einleitung}</p>
                </Einblenden>

                {bild && stellvertreter && (
                  /* Ein Werk der Serie, stellvertretend — und darum
                     mit seinem eigenen Schild daneben, damit klar
                     bleibt, welches Bild man sieht. Die Seite, an der
                     es hängt, wechselt von Serie zu Serie, damit die
                     Übersicht beim Scrollen nicht zur Liste erstarrt. */
                  <div
                    className={`mt-atem ${haengungKlasse(
                      nummer % 2 === 1 ? "rechts" : "links",
                    )}`}
                  >
                    <div
                      className="werkflaeche heranruecken"
                      style={werkBreiteStil(bild.breitePx, bild.hoehePx, 62, 34)}
                    >
                      <Werkbild
                        schluessel={bild.schluessel}
                        alt={bild.altText || stellvertreter.titel}
                        breitePx={bild.breitePx}
                        hoehePx={bild.hoehePx}
                        sizes="(max-width: 768px) 88vw, 34rem"
                      />
                    </div>

                    <Saalschild werk={stellvertreter} knapp />
                  </div>
                )}

                <Einblenden className="mt-atem">
                  <Link
                    href={`/serien/${serie.slug}`}
                    className="border-b border-tinte pb-1 text-klein transition-opacity duration-500 hover:opacity-60"
                  >
                    Serie ansehen
                  </Link>
                </Einblenden>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
