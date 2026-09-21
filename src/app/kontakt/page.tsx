import type { Metadata } from "next";
import { Einblenden } from "@/components/Einblenden";
import { Anfrageformular } from "@/components/Anfrageformular";
import { holeTexte } from "@/lib/daten";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Fragen zu einem Werk, zu Technik, Format oder Versand? Schreiben Sie Lusine direkt.",
};

export default async function KontaktSeite() {
  const texte = await holeTexte();

  return (
    <div className="mx-auto max-w-[110rem] px-4 pt-16 sm:px-10 lg:px-16">
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
