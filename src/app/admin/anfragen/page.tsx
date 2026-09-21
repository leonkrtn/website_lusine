import Link from "next/link";
import { Leer } from "@/components/admin/Bausteine";
import { setzeAnfragestatus } from "@/app/admin/aktionen";
import { holeAnfragen } from "@/lib/daten";
import { ANFRAGE_STATUS, ANFRAGE_STATUS_BESCHRIFTUNG } from "@/lib/typen";

function datum(wert: string): string {
  if (!wert) return "";
  const zeit = new Date(wert);
  if (Number.isNaN(zeit.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(zeit);
}

export default async function AdminAnfragen() {
  const anfragen = await holeAnfragen();

  return (
    <div>
      <h1 className="text-titel leading-tight">Anfragen</h1>

      {anfragen.length === 0 ? (
        <Leer>
          Noch keine Anfragen. Nachrichten über das Kontaktformular und über den
          Anfrage-Knopf eines Werks erscheinen hier.
        </Leer>
      ) : (
        <ul className="mt-12">
          {anfragen.map((anfrage) => (
            <li key={anfrage.id} className="border-t border-linie py-8">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <p className="text-basis">
                    {anfrage.name}{" "}
                    <a
                      href={`mailto:${anfrage.email}?subject=${encodeURIComponent(
                        anfrage.werkTitel ? `Ihre Anfrage zu „${anfrage.werkTitel}“` : "Ihre Anfrage",
                      )}`}
                      className="text-klein text-tinte-leise"
                    >
                      {anfrage.email}
                    </a>
                  </p>
                  <p className="beschriftung mt-2">
                    {[datum(anfrage.erstelltAm), anfrage.werkTitel]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>

                <form action={setzeAnfragestatus} className="flex items-start gap-3">
                  <input type="hidden" name="id" value={anfrage.id} />
                  <label htmlFor={`anfrage-${anfrage.id}`} className="sr-only">
                    Status der Anfrage von {anfrage.name}
                  </label>
                  <select
                    id={`anfrage-${anfrage.id}`}
                    name="status"
                    defaultValue={anfrage.status}
                    className="border-0 border-b border-feldlinie bg-papier pb-1 text-klein outline-none focus:border-tinte"
                  >
                    {ANFRAGE_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {ANFRAGE_STATUS_BESCHRIFTUNG[status]}
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

              <p className="mt-6 max-w-2xl whitespace-pre-wrap text-basis leading-relaxed">
                {anfrage.nachricht}
              </p>

              {anfrage.werkId && (
                <Link
                  href={`/admin/werke/${anfrage.werkId}`}
                  className="mt-4 inline-block text-klein text-tinte-leise transition-colors duration-300 hover:text-tinte"
                >
                  Zum Werk
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
