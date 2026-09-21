import { Leer } from "@/components/admin/Bausteine";
import { setzeBestellstatus } from "@/app/admin/aktionen";
import { holeBestellungen } from "@/lib/daten";
import { preisText } from "@/lib/bilder";
import { BESTELL_STATUS, BESTELL_STATUS_BESCHRIFTUNG } from "@/lib/typen";

function datum(wert: string): string {
  if (!wert) return "";
  const zeit = new Date(wert);
  if (Number.isNaN(zeit.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(zeit);
}

/**
 * Die Bestellungen.
 *
 * Jede Zeile enthaelt alles, was fuer den Versand gebraucht wird —
 * Adresse, Betrag, Kontakt. Der Statuswechsel steht direkt daneben:
 * nach dem Verpacken einmal auf „Versandt“, fertig.
 */
export default async function AdminBestellungen() {
  const bestellungen = await holeBestellungen();

  return (
    <div>
      <h1 className="text-titel leading-tight">Bestellungen</h1>

      {bestellungen.length === 0 ? (
        <Leer>
          Noch keine Bestellungen. Sobald ein Werk über die Seite gekauft wird,
          erscheint es hier — angelegt von Stripe, nicht von Hand.
        </Leer>
      ) : (
        <ul className="mt-12">
          {bestellungen.map((bestellung) => (
            <li key={bestellung.id} className="border-t border-linie py-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr_auto]">
                <div>
                  <p className="text-basis">{bestellung.werkTitel}</p>
                  <p className="beschriftung mt-2">
                    {datum(bestellung.erstelltAm)}
                  </p>
                  <p className="mt-3 text-klein">
                    {preisText(bestellung.betragCent, bestellung.waehrung)}
                    {bestellung.versandCent > 0 && (
                      <span className="text-tinte-leise">
                        {" "}
                        (davon {preisText(bestellung.versandCent, bestellung.waehrung)} Versand)
                      </span>
                    )}
                  </p>
                </div>

                <div className="text-klein">
                  {bestellung.kaeuferName && <p>{bestellung.kaeuferName}</p>}
                  {bestellung.kaeuferEmail && (
                    <p>
                      <a
                        href={`mailto:${bestellung.kaeuferEmail}`}
                        className="border-b border-linie"
                      >
                        {bestellung.kaeuferEmail}
                      </a>
                    </p>
                  )}
                  {bestellung.lieferadresse && (
                    <address className="mt-3 not-italic text-tinte-leise">
                      {bestellung.lieferadresse.strasse}
                      <br />
                      {[bestellung.lieferadresse.plz, bestellung.lieferadresse.ort]
                        .filter(Boolean)
                        .join(" ")}
                      {bestellung.lieferadresse.land && (
                        <>
                          <br />
                          {bestellung.lieferadresse.land}
                        </>
                      )}
                    </address>
                  )}
                </div>

                <form action={setzeBestellstatus} className="flex items-start gap-3">
                  <input type="hidden" name="id" value={bestellung.id} />
                  <label htmlFor={`status-${bestellung.id}`} className="sr-only">
                    Status von {bestellung.werkTitel}
                  </label>
                  <select
                    id={`status-${bestellung.id}`}
                    name="status"
                    defaultValue={bestellung.status}
                    className="border-0 border-b border-feldlinie bg-papier pb-1 text-klein outline-none focus:border-tinte"
                  >
                    {BESTELL_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {BESTELL_STATUS_BESCHRIFTUNG[status]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="border-b border-tinte pb-1 text-klein transition-opacity duration-300 hover:opacity-60"
                  >
                    Setzen
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
