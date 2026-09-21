import Link from "next/link";
import { Werkformular } from "@/components/admin/Werkformular";
import { holeSerien } from "@/lib/daten";
import { demoModus } from "@/lib/umgebung";

export default async function NeuesWerk() {
  const serien = await holeSerien();

  return (
    <div>
      <Link href="/admin/werke" className="beschriftung">
        ← Werke
      </Link>

      <h1 className="mt-6 text-titel leading-tight">Neues Werk</h1>
      <p className="mt-4 max-w-xl text-klein text-tinte-leise">
        Zuerst Titel und Geschichte. Die Bilder kommen im nächsten Schritt dazu,
        sobald das Werk angelegt ist.
      </p>

      <div className="mt-12">
        <Werkformular serien={serien} gesperrt={demoModus()} />
      </div>
    </div>
  );
}
