import Link from "next/link";
import { holeAnfragen, holeWerke } from "@/lib/daten";
import { demoModus } from "@/lib/umgebung";
import { STATUS_BESCHRIFTUNG } from "@/lib/typen";

/**
 * Die Uebersicht beantwortet drei Fragen auf einen Blick:
 * Ist etwas zu tun? Wie steht die Galerie da? Was fehlt noch technisch?
 */
export default async function AdminUebersicht() {
  const [werke, anfragen] = await Promise.all([holeWerke(), holeAnfragen()]);

  const offeneAnfragen = anfragen.filter((anfrage) => anfrage.status === "neu");
  const verfuegbar = werke.filter((werk) => werk.status === "verfuegbar");
  const verkauft = werke.filter((werk) => werk.status === "verkauft");
  const aufStartseite = werke.filter((werk) => werk.aufStartseite);
  const ohneBild = werke.filter((werk) => werk.bilder.length === 0);
  const ohnePreis = verfuegbar.filter((werk) => werk.preisCent === null);

  const einrichtung = [
    { name: "Datenbank und Bildspeicher (Supabase)", fertig: !demoModus() },
  ];
  const offeneEinrichtung = einrichtung.filter((eintrag) => !eintrag.fertig);

  return (
    <div>
      <h1 className="text-titel leading-tight">Übersicht</h1>

      {/* --- Der wichtigste Hinweis ----------------------------------------
          Es gibt keinen E-Mail-Versand. Eine Kaufanfrage, die niemand
          liest, ist ein verlorener Verkauf — darum steht das hier oben
          und nicht als Fussnote. */}
      <p className="mt-8 max-w-xl bg-[#fdf4d8] px-4 py-3 text-klein">
        <strong className="font-medium">Keine Benachrichtigung per E-Mail.</strong>{" "}
        Neue Anfragen erscheinen ausschließlich hier. Bitte regelmäßig
        hereinschauen — am besten täglich.
      </p>

      {/* --- Was zu tun ist ------------------------------------------------ */}
      {offeneAnfragen.length > 0 && (
        <section className="mt-12">
          <h2 className="beschriftung">Zu erledigen</h2>
          <p className="mt-6">
            <Link href="/admin/anfragen" className="border-b border-tinte pb-0.5">
              {offeneAnfragen.length === 1
                ? "1 unbeantwortete Anfrage"
                : `${offeneAnfragen.length} unbeantwortete Anfragen`}
            </Link>
          </p>
        </section>
      )}

      {/* --- Zahlen -------------------------------------------------------- */}
      <section className="mt-16">
        <h2 className="beschriftung">Werkverzeichnis</h2>
        <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
          {[
            { feld: "Werke insgesamt", wert: werke.length },
            { feld: STATUS_BESCHRIFTUNG.verfuegbar, wert: verfuegbar.length },
            { feld: STATUS_BESCHRIFTUNG.verkauft, wert: verkauft.length },
            { feld: "Auf der Startseite", wert: `${aufStartseite.length} von 5` },
          ].map((eintrag) => (
            <div key={eintrag.feld}>
              <dt className="beschriftung">{eintrag.feld}</dt>
              <dd className="mt-2 text-titel leading-none">{eintrag.wert}</dd>
            </div>
          ))}
        </dl>

        {ohneBild.length > 0 && (
          <p className="mt-8 text-klein text-tinte-leise">
            {ohneBild.length === 1
              ? "Ein Werk hat noch kein Bild: "
              : `${ohneBild.length} Werke haben noch kein Bild: `}
            {ohneBild.slice(0, 4).map((werk, nummer) => (
              <span key={werk.id}>
                {nummer > 0 && ", "}
                <Link href={`/admin/werke/${werk.id}`} className="border-b border-linie">
                  {werk.titel}
                </Link>
              </span>
            ))}
          </p>
        )}

        {ohnePreis.length > 0 && (
          <p className="mt-4 text-klein text-tinte-leise">
            {ohnePreis.length === 1
              ? "Bei einem verfügbaren Werk steht kein Preis"
              : `Bei ${ohnePreis.length} verfügbaren Werken steht kein Preis`}{" "}
            — dort erscheint „Preis auf Anfrage“.
          </p>
        )}

        {aufStartseite.length === 0 && werke.length > 0 && (
          <p className="mt-4 text-klein text-tinte-leise">
            Für die Startseite ist noch kein Werk ausgewählt. Sie zeigt dann nur
            Text.
          </p>
        )}
      </section>

      {/* --- Letzte Anfragen ----------------------------------------------- */}
      {anfragen.length > 0 && (
        <section className="mt-16">
          <h2 className="beschriftung">Zuletzt eingegangen</h2>
          <ul className="mt-6 space-y-3">
            {anfragen.slice(0, 5).map((anfrage) => (
              <li key={anfrage.id} className="flex justify-between gap-6 text-klein">
                <span>
                  {anfrage.name}
                  {anfrage.werkTitel && (
                    <span className="text-tinte-leise"> · {anfrage.werkTitel}</span>
                  )}
                </span>
                <span className="text-tinte-leise">
                  {anfrage.status === "neu" ? "offen" : "erledigt"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* --- Einrichtung ---------------------------------------------------
          Ehrlich auflisten, was noch fehlt. Eine Oberflaeche, die
          vollstaendig aussieht, aber halb angeschlossen ist, kostet
          spaeter mehr Zeit als dieser Kasten. */}
      {offeneEinrichtung.length > 0 && (
        <section className="mt-16 border-t border-linie pt-10">
          <h2 className="beschriftung">Noch einzurichten</h2>
          <ul className="mt-6 space-y-2">
            {einrichtung.map((eintrag) => (
              <li key={eintrag.name} className="text-klein">
                <span className={eintrag.fertig ? "text-tinte-still" : ""}>
                  {eintrag.fertig ? "✓" : "○"} {eintrag.name}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-xl text-fluestern text-tinte-still">
            Die Zugangsdaten gehören in die Umgebungsvariablen. Die Namen aller
            Variablen stehen in der Datei <code>.env.example</code> im Projekt,
            die Einrichtungsschritte in <code>README.md</code>.
          </p>
        </section>
      )}
    </div>
  );
}
