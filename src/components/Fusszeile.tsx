import Link from "next/link";

const rechtliches = [
  { pfad: "/impressum", name: "Impressum" },
  { pfad: "/datenschutz", name: "Datenschutz" },
  { pfad: "/agb", name: "AGB" },
  { pfad: "/widerruf", name: "Widerruf" },
];

export function Fusszeile() {
  return (
    <footer className="nicht-drucken mt-stille border-t border-linie">
      <div className="mx-auto max-w-[110rem] px-4 py-16 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-12 sm:flex-row sm:justify-between">
          <div>
            <p className="text-[1.25rem] tracking-[0.2em] uppercase">Lusine</p>
            <p className="mt-3 max-w-xs text-klein text-tinte-leise">
              Originale Malerei. Jedes Werk ein Unikat.
            </p>
          </div>

          <nav aria-label="Rechtliches">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {rechtliches.map((eintrag) => (
                <li key={eintrag.pfad}>
                  <Link
                    href={eintrag.pfad}
                    className="text-klein text-tinte-leise transition-colors duration-500 hover:text-tinte"
                  >
                    {eintrag.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-16 text-fluestern text-tinte-still">
          © {new Date().getFullYear()} Lusine. Alle Werke urheberrechtlich geschützt.
        </p>
      </div>
    </footer>
  );
}
