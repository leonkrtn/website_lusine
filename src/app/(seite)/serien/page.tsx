import type { Metadata } from "next";
import Link from "next/link";
import { Einblenden } from "@/components/Einblenden";
import { Werkbild } from "@/components/Werkbild";
import { holeSerien, holeWerkeDerSerie } from "@/lib/daten";
import { hauptbild, werkBreiteStil } from "@/lib/darstellung";

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
    <div className="mx-auto max-w-[110rem] px-4 pt-16 sm:px-10 lg:px-16">
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
              <section
                key={serie.id}
                className="mb-stille grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-24"
              >
                {/* Die Bildspalte wechselt die Seite, damit die Uebersicht
                    beim Scrollen nicht zur Liste erstarrt. */}
                <Einblenden
                  className={nummer % 2 === 1 ? "md:order-2" : undefined}
                >
                  {bild && (
                    <Link href={`/serien/${serie.slug}`} className="block">
                      <div
                        className="mx-auto"
                        style={werkBreiteStil(bild.breitePx, bild.hoehePx, 58, 30)}
                      >
                        <Werkbild
                          schluessel={bild.schluessel}
                          alt={bild.altText || serie.titel}
                          breitePx={bild.breitePx}
                          hoehePx={bild.hoehePx}
                          sizes="(max-width: 768px) 88vw, 30rem"
                          className="transition-opacity duration-700 hover:opacity-90"
                        />
                      </div>
                    </Link>
                  )}
                </Einblenden>

                <Einblenden verzoegerung={120}>
                  <h2 className="text-titel leading-tight">
                    <Link
                      href={`/serien/${serie.slug}`}
                      className="transition-opacity duration-500 hover:opacity-60"
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

                  <p className="erzaehlung mt-8">{serie.einleitung}</p>

                  <Link
                    href={`/serien/${serie.slug}`}
                    className="mt-10 inline-block border-b border-tinte pb-1 text-klein transition-opacity duration-500 hover:opacity-60"
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
