import Link from "next/link";
import { Einblenden } from "@/components/Einblenden";
import { masseText, preisText } from "@/lib/bilder";
import { STATUS_BESCHRIFTUNG, type Werk } from "@/lib/typen";

/**
 * Das Werkverzeichnis.
 *
 * Dieselben Werke ohne ein einziges Bild — nur Nummer, Titel, Jahr,
 * Maße, Technik und Status, gesetzt wie ein gedrucktes Verzeichnis.
 *
 * Das ist keine Notloesung fuer schmale Bildschirme, sondern eine
 * eigene Art hinzusehen: eine Liste sagt auf einen Blick, was eine
 * Wand erst nach langem Scrollen preisgibt — wie viel es gibt, aus
 * welchen Jahren, in welchen Formaten. Und sie sagt: hier wird ein
 * Werk gefuehrt, kein Sortiment angeboten.
 *
 * Die laufende Nummer ist die Reihenfolge im Verzeichnis, keine
 * Inventarnummer. Sobald es eine echte gibt, gehoert sie ins
 * Datenmodell und an diese Stelle.
 */
export function Werkverzeichnis({ werke }: { werke: Werk[] }) {
  return (
    <div>
      {/* Die Kopfzeile nur dort, wo auch alle Spalten stehen. */}
      <div
        className="verzeichnis-zeile beschriftung hidden md:grid"
        aria-hidden="true"
      >
        <span>Nr.</span>
        <span>Titel</span>
        <span>Jahr</span>
        <span>Maße und Technik</span>
        <span className="text-right">Status</span>
      </div>

      <ol>
        {werke.map((werk, nummer) => {
          const masse = masseText(werk.breiteCm, werk.hoeheCm, werk.tiefeCm);

          return (
            <Einblenden
              key={werk.id}
              als="li"
              schwelle={0.05}
              verzoegerung={Math.min(nummer, 8) * 45}
              className="verzeichnis-zeile"
            >
              <span className="zahlenspalte text-klein text-tinte-still">
                {String(nummer + 1).padStart(2, "0")}
              </span>

              <span className="text-lead leading-snug">
                <Link href={`/werke/${werk.slug}`} className="unterstrich">
                  {werk.titel}
                </Link>
              </span>

              <span className="zahlenspalte text-klein text-tinte-leise">
                {werk.jahr ?? "—"}
              </span>

              <span className="text-klein text-tinte-leise">
                {[masse, werk.technik].filter(Boolean).join(" · ")}
              </span>

              <span className="text-klein md:text-right">
                {werk.status === "verfuegbar"
                  ? preisText(werk.preisCent, werk.waehrung)
                  : STATUS_BESCHRIFTUNG[werk.status]}
              </span>
            </Einblenden>
          );
        })}
      </ol>
    </div>
  );
}
