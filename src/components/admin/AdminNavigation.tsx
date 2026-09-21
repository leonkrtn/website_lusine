"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { abmelden } from "@/app/admin/aktionen";

const eintraege = [
  { pfad: "/admin", name: "Übersicht", genau: true },
  { pfad: "/admin/werke", name: "Werke" },
  { pfad: "/admin/serien", name: "Serien" },
  { pfad: "/admin/bestellungen", name: "Bestellungen" },
  { pfad: "/admin/anfragen", name: "Anfragen" },
  { pfad: "/admin/texte", name: "Texte" },
];

export function AdminNavigation() {
  const pfad = usePathname();

  // Auf der Anmeldeseite gibt es nichts zu navigieren.
  if (pfad === "/admin/login") return null;

  const istAktiv = (ziel: string, genau?: boolean) =>
    genau ? pfad === ziel : pfad === ziel || pfad.startsWith(`${ziel}/`);

  return (
    <nav aria-label="Verwaltung">
      <ul className="flex flex-wrap items-baseline gap-x-7 gap-y-2">
        {eintraege.map((eintrag) => (
          <li key={eintrag.pfad}>
            <Link
              href={eintrag.pfad}
              aria-current={istAktiv(eintrag.pfad, eintrag.genau) ? "page" : undefined}
              className={`text-klein transition-colors duration-300 hover:text-tinte ${
                istAktiv(eintrag.pfad, eintrag.genau)
                  ? "text-tinte"
                  : "text-tinte-leise"
              }`}
            >
              {eintrag.name}
            </Link>
          </li>
        ))}

        <li>
          <Link
            href="/"
            target="_blank"
            className="text-klein text-tinte-leise transition-colors duration-300 hover:text-tinte"
          >
            Seite ansehen ↗
          </Link>
        </li>

        <li>
          <form action={abmelden}>
            <button
              type="submit"
              className="text-klein text-tinte-still transition-colors duration-300 hover:text-tinte"
            >
              Abmelden
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
