"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigation = [
  { pfad: "/werke", name: "Werke" },
  { pfad: "/serien", name: "Serien" },
  { pfad: "/ueber", name: "Über Lusine" },
  { pfad: "/kontakt", name: "Kontakt" },
];

/**
 * Die Kopfzeile bleibt beim Scrollen stehen, hat aber weder Linie noch
 * Schatten: Auf reinweissem Grund verschmilzt sie mit der Seite und
 * laeuft unsichtbar ueber ein Gemaelde hinweg. Genau das ist gewollt —
 * die Navigation soll nie mit dem Werk konkurrieren.
 */
export function Kopfzeile() {
  const pfad = usePathname();
  const [menueOffen, setMenueOffen] = useState(false);

  // Bei offenem Menue nicht im Hintergrund scrollen.
  useEffect(() => {
    document.body.style.overflow = menueOffen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menueOffen]);

  const istAktiv = (ziel: string) => pfad === ziel || pfad.startsWith(`${ziel}/`);

  return (
    <header className="kopfzeile nicht-drucken sticky top-0 z-40 bg-papier">
      <div className="mx-auto flex max-w-[110rem] items-baseline justify-between px-4 py-6 sm:px-10 lg:px-16">
        <Link
          href="/"
          className="text-[1.375rem] leading-none tracking-[0.2em] uppercase"
          aria-label="LUART — zur Startseite"
        >
          LUART
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden sm:block">
          <ul className="flex items-baseline gap-10">
            {navigation.map((eintrag) => (
              <li key={eintrag.pfad}>
                <Link
                  href={eintrag.pfad}
                  aria-current={istAktiv(eintrag.pfad) ? "page" : undefined}
                  className={`text-klein transition-colors duration-500 hover:text-tinte ${
                    istAktiv(eintrag.pfad) ? "text-tinte" : "text-tinte-leise"
                  }`}
                >
                  {eintrag.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Zwei Haarlinien, die sich beim Öffnen zum Kreuz drehen.
            Der Knopf trägt keinen Text, darum braucht er einen Namen
            — und der wechselt mit dem Zustand, damit ein Vorlesegerät
            sagt, was der nächste Druck bewirkt. Das Zeichen selbst
            bleibt außen vor: `aria-hidden` an den Strichen. */}
        <button
          type="button"
          onClick={() => setMenueOffen((offen) => !offen)}
          aria-expanded={menueOffen}
          aria-controls="mobile-navigation"
          aria-label={menueOffen ? "Menü schließen" : "Menü öffnen"}
          data-offen={menueOffen ? "ja" : "nein"}
          className="burger self-center sm:hidden"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      {menueOffen && (
        <nav
          id="mobile-navigation"
          aria-label="Hauptnavigation"
          className="fixed inset-0 top-[4.75rem] bg-papier px-4 sm:hidden"
        >
          <ul className="flex flex-col gap-8 pt-16">
            {navigation.map((eintrag) => (
              <li key={eintrag.pfad}>
                <Link
                  href={eintrag.pfad}
                  aria-current={istAktiv(eintrag.pfad) ? "page" : undefined}
                  // Direkt beim Klick schliessen statt ueber einen Effekt
                  // auf den Pfad: der Zielpfad kann derselbe sein, dann
                  // faende gar kein Wechsel statt und das Menue bliebe offen.
                  onClick={() => setMenueOffen(false)}
                  className="text-titel"
                >
                  {eintrag.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
