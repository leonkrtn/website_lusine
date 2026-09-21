import { Texteformular } from "@/components/admin/Texteformular";
import { holeTexte } from "@/lib/daten";
import { demoModus } from "@/lib/umgebung";

export default async function AdminTexte() {
  const texte = await holeTexte();

  return (
    <div>
      <h1 className="text-titel leading-tight">Texte</h1>
      <p className="mt-4 max-w-xl text-klein text-tinte-leise">
        Die freien Texte der Startseite, der Über-Seite und der Kontaktseite.
        Alles Übrige — Navigation, Werkangaben, rechtliche Seiten — steht fest
        im Programm.
      </p>

      <div className="mt-12">
        <Texteformular texte={texte} gesperrt={demoModus()} />
      </div>
    </div>
  );
}
