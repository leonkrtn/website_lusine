import Link from "next/link";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { demoModus } from "@/lib/umgebung";

export const metadata = {
  title: "Atelier",
  robots: { index: false, follow: false },
};

/**
 * Rahmen des Admin-Bereichs.
 *
 * Gleiche Schrift und dasselbe Weiss wie die Galerie, aber dichter
 * gesetzt: hier wird gearbeitet, nicht betrachtet. Trotzdem kein
 * Fremdkoerper — wer taeglich damit umgeht, soll sich nicht in einem
 * anderen Programm fuehlen.
 */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      {demoModus() && (
        <div className="bg-[#fdf4d8] px-4 py-3 text-center text-klein sm:px-10">
          <strong className="font-medium">Vorschau</strong> — es ist noch keine
          Datenbank angebunden. Sie sehen die Beispielwerke; Änderungen lassen
          sich nicht speichern.
        </div>
      )}

      <header className="border-b border-linie">
        <div className="mx-auto flex max-w-[86rem] flex-wrap items-baseline justify-between gap-4 px-4 py-6 sm:px-10">
          <Link
            href="/admin"
            className="text-[1.125rem] tracking-[0.2em] uppercase"
          >
            Atelier
          </Link>

          <AdminNavigation />
        </div>
      </header>

      <main className="mx-auto max-w-[86rem] px-4 py-12 sm:px-10">
        {children}
      </main>
    </div>
  );
}
