import { Serienverwaltung } from "@/components/admin/Serienverwaltung";
import { holeSerien, holeWerke } from "@/lib/daten";
import { demoModus } from "@/lib/umgebung";

export default async function AdminSerien() {
  const [serien, werke] = await Promise.all([holeSerien(), holeWerke()]);

  const anzahlProSerie = new Map<string, number>();
  for (const werk of werke) {
    if (!werk.serieId) continue;
    anzahlProSerie.set(werk.serieId, (anzahlProSerie.get(werk.serieId) ?? 0) + 1);
  }

  return (
    <div>
      <h1 className="text-titel leading-tight">Serien</h1>
      <p className="mt-4 max-w-xl text-klein text-tinte-leise">
        Werkgruppen mit eigenem Einleitungstext. Ein Werk gehört zu höchstens
        einer Serie; zugeordnet wird es beim Werk selbst.
      </p>

      <div className="mt-12">
        <Serienverwaltung
          serien={serien}
          anzahlProSerie={Object.fromEntries(anzahlProSerie)}
          gesperrt={demoModus()}
        />
      </div>
    </div>
  );
}
