import { Anmeldeformular } from "@/components/admin/Anmeldeformular";
import { demoModus } from "@/lib/umgebung";

export const metadata = {
  title: "Anmelden",
  robots: { index: false, follow: false },
};

export default function AnmeldeSeite() {
  return (
    <div className="mx-auto max-w-sm pt-16">
      <h1 className="text-titel leading-tight">Anmelden</h1>

      {demoModus() ? (
        <div className="mt-10 text-klein text-tinte-leise">
          <p>
            Es ist noch keine Datenbank angebunden. Eine Anmeldung ist deshalb
            weder möglich noch nötig.
          </p>
          <p className="mt-4">
            Sobald Supabase eingerichtet ist, melden Sie sich hier mit der
            E-Mail-Adresse und dem Passwort an, die dort für Lusine angelegt
            wurden.
          </p>
          <a
            href="/admin"
            className="mt-8 inline-block border-b border-tinte pb-1 text-tinte"
          >
            Zur Vorschau
          </a>
        </div>
      ) : (
        <Anmeldeformular />
      )}
    </div>
  );
}
