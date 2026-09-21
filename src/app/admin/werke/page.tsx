import Link from "next/link";
import { Werkbild } from "@/components/Werkbild";
import { Leer } from "@/components/admin/Bausteine";
import { holeSerien, holeWerke } from "@/lib/daten";
import { hauptbild } from "@/lib/darstellung";
import { preisText } from "@/lib/bilder";
import { STATUS_BESCHRIFTUNG } from "@/lib/typen";

/**
 * Die Werkliste.
 *
 * Mit Vorschaubild — eine reine Textliste waere fuer eine Galerie
 * unbrauchbar: Lusine erkennt ihre Werke am Bild, nicht am Titel.
 */
export default async function AdminWerke() {
  const [werke, serien] = await Promise.all([holeWerke(), holeSerien()]);
  const serienNachId = new Map(serien.map((serie) => [serie.id, serie]));

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-titel leading-tight">Werke</h1>
        <Link
          href="/admin/werke/neu"
          className="border-b border-tinte pb-1 text-klein transition-opacity duration-300 hover:opacity-60"
        >
          Neues Werk anlegen
        </Link>
      </div>

      {werke.length === 0 ? (
        <Leer>
          Noch keine Werke angelegt. Legen Sie das erste an — Bilder kommen im
          zweiten Schritt dazu.
        </Leer>
      ) : (
        <ul className="mt-12">
          {werke.map((werk) => {
            const bild = hauptbild(werk.bilder);
            const serie = werk.serieId ? serienNachId.get(werk.serieId) : null;

            return (
              <li key={werk.id} className="border-t border-linie">
                <Link
                  href={`/admin/werke/${werk.id}`}
                  className="flex items-center gap-6 py-5 transition-opacity duration-300 hover:opacity-70"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center">
                    {bild ? (
                      <Werkbild
                        schluessel={bild.schluessel}
                        alt=""
                        breitePx={bild.breitePx}
                        hoehePx={bild.hoehePx}
                        sizes="64px"
                      />
                    ) : (
                      <span className="text-fluestern text-tinte-still">
                        kein Bild
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-basis">{werk.titel}</p>
                    <p className="beschriftung mt-1">
                      {[
                        werk.jahr,
                        serie?.titel,
                        werk.aufStartseite ? "Startseite" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-klein">
                      {preisText(werk.preisCent, werk.waehrung)}
                    </p>
                    <p
                      className={`beschriftung mt-1 ${
                        werk.status === "verkauft" ? "text-tinte-still" : ""
                      }`}
                    >
                      {STATUS_BESCHRIFTUNG[werk.status]}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
