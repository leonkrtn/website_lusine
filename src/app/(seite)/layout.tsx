import { Kopfzeile } from "@/components/Kopfzeile";
import { Fusszeile } from "@/components/Fusszeile";
import { Seitenwechsel } from "@/components/Seitenwechsel";

/**
 * Rahmen der oeffentlichen Seite.
 *
 * Der Admin-Bereich liegt bewusst ausserhalb dieser Gruppe: er
 * braucht weder die Galerie-Navigation noch die weichen
 * Seitenuebergaenge, sondern eine Oberflaeche, in der sich zuegig
 * arbeiten laesst.
 */
export default function SeitenLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-papier focus:px-4 focus:py-2 focus:text-klein"
      >
        Zum Inhalt springen
      </a>
      <Kopfzeile />
      <main id="inhalt">
        <Seitenwechsel>{children}</Seitenwechsel>
      </main>
      <Fusszeile />
    </>
  );
}
