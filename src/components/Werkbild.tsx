import Image from "next/image";
import { bildQuelle, istLokalesBild, variantenSatz } from "@/lib/bilder";
import { VARIANTEN_BREITEN } from "@/lib/bildformate";

type Props = {
  schluessel: string;
  alt: string;
  breitePx: number;
  hoehePx: number;
  /** Wie breit das Bild im Layout wird — bestimmt, welche Fassung laedt. */
  sizes: string;
  /** Nur fuer das erste Bild der Startseite setzen. */
  vorrang?: boolean;
  className?: string;
};

/**
 * Ein Gemaelde auf der Seite.
 *
 * Die Klasse `.werkbild` setzt die Verbotsliste aus globals.css durch:
 * kein Rahmen, kein Schatten, keine abgerundete Ecke, kein grauer
 * Ladezustand. Nur so steht ein auf Reinweiss freigestelltes Werk ohne
 * sichtbare Kante auf der Seite.
 *
 * Zwei Auslieferungswege, je nachdem woher das Bild kommt:
 *
 *   lokal     — eine Datei unter /public, die Next.js selbst optimiert.
 *   Speicher  — alle Groessen liegen fertig im Speicher. Statt sie von
 *               einem Dienst aussuchen zu lassen, bekommt der Browser
 *               die ganze Liste: `picture` waehlt das beste Format, das
 *               er versteht, `srcset` die passende Groesse fuer seinen
 *               Bildschirm. Diese Wahl faellt damit erst im Moment der
 *               Darstellung — genauer, als ein Server sie treffen
 *               koennte, und ohne einen einzigen Dienst dazwischen.
 */
export function Werkbild({
  schluessel,
  alt,
  breitePx,
  hoehePx,
  sizes,
  vorrang = false,
  className = "",
}: Props) {
  if (!schluessel) return null;

  if (istLokalesBild(schluessel)) {
    return (
      <Image
        src={schluessel}
        alt={alt}
        width={breitePx || 1600}
        height={hoehePx || 2000}
        sizes={sizes}
        priority={vorrang}
        quality={88}
        className={`werkbild h-auto w-full ${className}`}
      />
    );
  }

  const groesste =
    VARIANTEN_BREITEN.filter(
      (breite) => !breitePx || breite <= breitePx * 1.05,
    ).at(-1) ?? VARIANTEN_BREITEN[0];

  const seitenverhaeltnis =
    breitePx > 0 && hoehePx > 0 ? `${breitePx} / ${hoehePx}` : undefined;

  return (
    <picture>
      <source
        type="image/avif"
        srcSet={variantenSatz(schluessel, "avif", breitePx)}
        sizes={sizes}
      />
      <source
        type="image/webp"
        srcSet={variantenSatz(schluessel, "webp", breitePx)}
        sizes={sizes}
      />
      {/* Die Varianten liegen fertig im Speicher; next/image wuerde sie ein
          zweites Mal verkleinern und dabei Schaerfe kosten. */}
      <img
        src={bildQuelle(schluessel, groesste, "jpg")}
        srcSet={variantenSatz(schluessel, "jpg", breitePx)}
        sizes={sizes}
        alt={alt}
        width={breitePx || undefined}
        height={hoehePx || undefined}
        loading={vorrang ? "eager" : "lazy"}
        fetchPriority={vorrang ? "high" : "auto"}
        decoding="async"
        style={seitenverhaeltnis ? { aspectRatio: seitenverhaeltnis } : undefined}
        className={`werkbild h-auto w-full ${className}`}
      />
    </picture>
  );
}
