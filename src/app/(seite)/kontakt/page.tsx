import type { Metadata } from "next";
import { Einblenden } from "@/components/Einblenden";
import { Anfrageformular } from "@/components/Anfrageformular";
import { holeTexte } from "@/lib/daten";
import { seitenangaben } from "@/lib/metadaten";

export const metadata: Metadata = seitenangaben({
  titel: "Kontakt",
  beschreibung:
    "Fragen zu einem Werk, zu Technik, Format oder Versand? Schreiben Sie Lusine direkt.",
  pfad: "/kontakt",
});

export default async function KontaktSeite() {
  const texte = await holeTexte();

  return (
    <div className="seitenanfang mx-auto max-w-[110rem] px-4 sm:px-10 lg:px-16">
      <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-24">
        <Einblenden als="header">
          <h1 className="text-gross leading-tight">Kontakt</h1>
          <p className="erzaehlung mt-10">{texte.kontaktText}</p>
        </Einblenden>

        <Einblenden verzoegerung={120}>
          <Anfrageformular />
        </Einblenden>
      </div>
    </div>
  );
}
