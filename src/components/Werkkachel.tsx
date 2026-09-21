import Link from "next/link";
import { Werkbild } from "@/components/Werkbild";
import { Signatur } from "@/components/Signatur";
import { Einblenden } from "@/components/Einblenden";
import { hauptbild, werkBreiteStil } from "@/lib/darstellung";
import { STATUS_BESCHRIFTUNG, type Werk } from "@/lib/typen";

type Props = {
  werk: Werk;
  verzoegerung?: number;
  /** Maximale Bildhoehe in Prozent der Fensterhoehe. */
  maxHoeheVh?: number;
  sizes?: string;
};

/**
 * Ein Werk in der Uebersicht.
 *
 * Beim Darueberfahren erscheint die Signatur dieses Werks zart unter dem
 * Bild — eine kleine Belohnung fuer Neugier, die die Ruhe der Seite
 * nicht stoert. Auf Geraeten ohne Zeigegeraet bleibt sie aus: ein
 * Effekt, der sich auf dem Handy nie ausloesen laesst, wuerde dort nur
 * unerklaerlichen Leerraum hinterlassen.
 */
export function Werkkachel({
  werk,
  verzoegerung = 0,
  maxHoeheVh = 62,
  sizes = "(max-width: 768px) 88vw, 40vw",
}: Props) {
  const bild = hauptbild(werk.bilder);
  if (!bild) return null;

  return (
    <Einblenden verzoegerung={verzoegerung} als="article">
      <Link href={`/werke/${werk.slug}`} className="group block">
        <div
          className="mx-auto"
          style={werkBreiteStil(bild.breitePx, bild.hoehePx, maxHoeheVh, 34)}
        >
          <Werkbild
            schluessel={bild.schluessel}
            alt={bild.altText || werk.titel}
            breitePx={bild.breitePx}
            hoehePx={bild.hoehePx}
            sizes={sizes}
            className="transition-opacity duration-700 group-hover:opacity-90"
          />
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-lead leading-snug">{werk.titel}</h2>

          <p className="beschriftung mt-3">
            {[
              werk.jahr,
              werk.technik,
              werk.status !== "verfuegbar"
                ? STATUS_BESCHRIFTUNG[werk.status]
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>

          {/* Die Signatur nimmt immer ihren Platz ein, auch unsichtbar —
              sonst wuerde die Zeile darunter beim Darueberfahren
              springen. */}
          <div className="mt-5 flex h-10 items-center justify-center opacity-0 transition-opacity duration-700 [@media(hover:hover)]:group-hover:opacity-100">
            <Signatur
              schluessel={werk.signaturSchluessel}
              werkTitel={werk.titel}
              breite={150}
            />
          </div>
        </div>
      </Link>
    </Einblenden>
  );
}
