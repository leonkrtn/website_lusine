import Image from "next/image";
import { bildQuelle, istLokalesBild } from "@/lib/bilder";
import { VARIANTEN_BREITEN } from "@/lib/bildformate";

type Props = {
  schluessel: string;
  alt: string;
  breitePx: number;
  hoehePx: number;
  /** Wie breit das Bild im Layout wird — bestimmt, welche Variante laedt. */
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
 *   lokal   — eine Datei unter /public, die Next.js selbst optimiert.
 *   Worker  — ein Bild aus dem R2-Speicher. Dort liegen die Varianten
 *             bereits fertig; ein zweiter Verkleinerungsschritt durch
 *             Next.js wuerde nur Schaerfe kosten. Darum hier ein
 *             einfaches img mit selbst gebautem srcset.
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
  const quelle = bildQuelle(schluessel);
  if (!quelle) return null;

  const seitenverhaeltnis =
    breitePx > 0 && hoehePx > 0 ? `${breitePx} / ${hoehePx}` : undefined;

  if (istLokalesBild(schluessel)) {
    return (
      <Image
        src={quelle}
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

  // Nur Varianten anbieten, die es auch gibt: der Worker legt keine
  // Groesse an, die ueber das Ausgangsbild hinausginge.
  const breiten = VARIANTEN_BREITEN.filter(
    (breite) => !breitePx || breite <= breitePx * 1.05,
  );
  const verfuegbar = breiten.length > 0 ? breiten : [VARIANTEN_BREITEN[0]];

  const srcSet = verfuegbar
    .map((breite) => `${quelle}?b=${breite} ${breite}w`)
    .join(", ");

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Die Varianten
    // liegen fertig im Speicher; next/image wuerde sie ein zweites Mal
    // verkleinern und dabei Schaerfe kosten.
    <img
      src={`${quelle}?b=${verfuegbar[verfuegbar.length - 1]}`}
      srcSet={srcSet}
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
  );
}
