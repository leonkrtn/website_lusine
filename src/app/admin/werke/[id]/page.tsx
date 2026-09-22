import Link from "next/link";
import { notFound } from "next/navigation";
import { Werkformular } from "@/components/admin/Werkformular";
import { Bilderverwaltung } from "@/components/admin/Bilderverwaltung";
import { Weitergabe } from "@/components/admin/Weitergabe";
import { holeSerien, holeWerkNachId } from "@/lib/daten";
import { demoModus } from "@/lib/umgebung";
import { Zeichen } from "@/components/admin/Zeichen";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ neu?: string }>;
};

export default async function WerkBearbeiten({ params, searchParams }: Props) {
  const { id } = await params;
  const { neu } = await searchParams;

  const [werk, serien] = await Promise.all([holeWerkNachId(id), holeSerien()]);

  if (!werk) notFound();

  const gesperrt = demoModus();

  return (
    <div>
      <Link href="/admin/werke" className="beschriftung inline-flex items-center gap-1.5">
        <Zeichen name="zurueck" /> Werke
      </Link>

      <h1 className="mt-6 text-titel leading-tight">{werk.titel}</h1>

      {neu && (
        <p className="mt-6 max-w-xl bg-[#fdf4d8] px-4 py-3 text-klein">
          Das Werk ist angelegt. Jetzt fehlen noch die Bilder — mindestens ein
          Hauptbild, damit es auf der Seite erscheint.
        </p>
      )}

      {/* --- Bilder zuerst ------------------------------------------------
          Sie sind der Grund, warum es diese Seite gibt. Ein Formular mit
          zwanzig Textfeldern ueber den Bildern wuerde den eigentlichen
          Arbeitsschritt verstecken. */}
      <section className="mt-12 border-t border-linie pt-10">
        <h2 className="text-lead leading-snug">Bilder</h2>

        <div className="mt-8">
          <Bilderverwaltung werk={werk} gesperrt={gesperrt} />
        </div>
      </section>

      <div className="mt-16">
        <Werkformular werk={werk} serien={serien} gesperrt={gesperrt} />
      </div>

      <div className="mt-16">
        <Weitergabe werk={werk} />
      </div>
    </div>
  );
}
