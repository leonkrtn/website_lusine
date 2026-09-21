import Link from "next/link";
import { holeAnfragen, holeBestellungen, holeWerke } from "@/lib/daten";
import { preisText } from "@/lib/bilder";
import { demoModus, r2Konfiguriert, resendKonfiguriert, stripeKonfiguriert } from "@/lib/umgebung";
import { STATUS_BESCHRIFTUNG } from "@/lib/typen";

/**
 * Die Uebersicht beantwortet drei Fragen auf einen Blick:
 * Ist etwas zu tun? Wie steht die Galerie da? Was fehlt noch technisch?
 */
export default async function AdminUebersicht() {
  const [werke, bestellungen, anfragen] = await Promise.all([
    holeWerke(),
    holeBestellungen(),
    holeAnfragen(),
  ]);

  const offeneAnfragen = anfragen.filter((a) => a.status === "neu");
  const offeneBestellungen = bestellungen.filter((b) => b.status === "bezahlt");
  const verfuegbar = werke.filter((w) => w.status === "verfuegbar");
  const verkauft = werke.filter((w) => w.status === "verkauft");
  const aufStartseite = werke.filter((w) => w.aufStartseite);
  const ohneBild = werke.filter((w) => w.bilder.length === 0);

  const einrichtung = [
    { name: "Datenbank (Supabase)", fertig: !demoModus() },
    { name: "Bildspeicher (Cloudflare R2)", fertig: r2Konfiguriert() },
    { name: "Zahlung (Stripe)", fertig: stripeKonfiguriert() },
    { name: "E-Mail (Resend)", fertig: resendKonfiguriert() },
  ];
  const offeneEinrichtung = einrichtung.filter((e) => !e.fertig);

  return (
    <div>
      <h1 className="text-titel leading-tight">Übersicht</h1>

      {/* --- Was zu tun ist ------------------------------------------------ */}
      {(offeneAnfragen.length > 0 || offeneBestellungen.length > 0) && (
        <section className="mt-12">
          <h2 className="beschriftung">Zu erledigen</h2>
          <ul className="mt-6 space-y-3">
            {offeneBestellungen.length > 0 && (
              <li>
                <Link href="/admin/bestellungen" className="border-b border-tinte pb-0.5">
                  {offeneBestellungen.length === 1
                    ? "1 bezahlte Bestellung wartet auf Versand"
                    : `${offeneBestellungen.length} bezahlte Bestellungen warten auf Versand`}
                </Link>
              </li>
            )}
            {offeneAnfragen.length > 0 && (
              <li>
                <Link href="/admin/anfragen" className="border-b border-tinte pb-0.5">
                  {offeneAnfragen.length === 1
                    ? "1 unbeantwortete Anfrage"
                    : `${offeneAnfragen.length} unbeantwortete Anfragen`}
                </Link>
              </li>
            )}
          </ul>
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
            {ohneBild.slice(0, 4).map((werk, i) => (
              <span key={werk.id}>
                {i > 0 && ", "}
                <Link href={`/admin/werke/${werk.id}`} className="border-b border-linie">
                  {werk.titel}
                </Link>
              </span>
            ))}
          </p>
        )}

        {aufStartseite.length === 0 && werke.length > 0 && (
          <p className="mt-4 text-klein text-tinte-leise">
            Für die Startseite ist noch kein Werk ausgewählt. Sie zeigt dann nur
            Text.
          </p>
        )}
      </section>

      {/* --- Letzte Bestellungen ------------------------------------------- */}
      {bestellungen.length > 0 && (
        <section className="mt-16">
          <h2 className="beschriftung">Zuletzt verkauft</h2>
          <ul className="mt-6 space-y-3">
            {bestellungen.slice(0, 5).map((bestellung) => (
              <li key={bestellung.id} className="flex justify-between gap-6 text-klein">
                <span>{bestellung.werkTitel}</span>
                <span className="text-tinte-leise">
                  {preisText(bestellung.betragCent, bestellung.waehrung)}
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
