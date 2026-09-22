import type { Metadata } from "next";
import Link from "next/link";
import { Einblenden } from "@/components/Einblenden";
import { Parallax } from "@/components/Parallax";
import { Werkbild } from "@/components/Werkbild";
import { holeTexte } from "@/lib/daten";
import { absaetze } from "@/lib/darstellung";
import { demoModus } from "@/lib/umgebung";

export const metadata: Metadata = {
  title: "Über Lusine",
  description:
    "Lusine arbeitet in Öl und Acryl auf Leinwand. Über ihre Arbeitsweise und die Geschichten hinter den Bildern.",
};

export default async function UeberSeite() {
  const texte = await holeTexte();

  // Im Demo-Modus steht ein erzeugtes Platzhalterbild bereit.
  const portraet = texte.ueberPortraitSchluessel ?? (demoModus() ? "/portraet-lusine.jpg" : null);

  return (
    <div className="seitenanfang mx-auto max-w-[110rem] px-4 sm:px-10 lg:px-16">
      <div className="grid grid-cols-1 gap-16 md:grid-cols-[1fr_1.1fr] md:gap-24 lg:gap-32">
        <Einblenden>
          {portraet && (
            <Parallax staerke={0.05}>
              <Werkbild
                schluessel={portraet}
                alt="Lusine im Atelier"
                breitePx={1800}
                hoehePx={2250}
                sizes="(max-width: 768px) 88vw, 34rem"
              />
            </Parallax>
          )}
        </Einblenden>

        <Einblenden verzoegerung={120} als="article">
          <h1 className="text-gross leading-tight text-balance">
            {texte.ueberUeberschrift}
          </h1>

          <div className="erzaehlung mt-12">
            {absaetze(texte.ueberText).map((absatz, nummer) => (
              <p key={nummer}>{absatz}</p>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap gap-x-10 gap-y-4">
            <Link
              href="/werke"
              className="border-b border-tinte pb-1 text-klein transition-opacity duration-500 hover:opacity-60"
            >
              Werke ansehen
            </Link>
            <Link
              href="/kontakt"
              className="text-klein text-tinte-leise transition-colors duration-500 hover:text-tinte"
            >
              Kontakt aufnehmen
            </Link>
          </div>
        </Einblenden>
      </div>
    </div>
  );
}
