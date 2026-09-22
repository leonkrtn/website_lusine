import { getImageProps } from "next/image";
import { bildQuelle, istLokalesBild } from "@/lib/bilder";

/**
 * Wie breit das Werk auf seiner Werkseite steht — als `sizes`.
 *
 * Steht hier und nicht in der Seite, weil zwei Stellen es genau gleich
 * wissen müssen: die Werkseite, die das Bild zeigt, und jeder Verweis
 * auf sie, der es vorab lädt (`WerkVerweis.tsx`). Weicht eines ab,
 * wählt der Browser eine andere Fassung aus dem `srcset`, und das
 * Vorladen war umsonst.
 */
export const WERKSEITE_SIZES =
  "(max-width: 640px) 92vw, (max-width: 1024px) 78vw, 64rem";

/** Die Qualitätsstufe für Gemälde, wie in `Werkbild.tsx`. */
const QUALITAET = 88;

/** Was ein Browser braucht, um dieselbe Fassung zu wählen. */
export type Bildquelle = {
  src: string;
  srcSet?: string;
  sizes?: string;
};

/**
 * Die Quelle des Hauptbilds, wie die Werkseite es anfordert.
 *
 * Für ein Bild aus dem Speicher ist das schlicht die Datei — es gibt
 * nur eine Fassung. Für ein Demo-Bild rechnet `getImageProps` denselben
 * `srcset` aus, den `next/image` auf der Werkseite schreibt.
 */
export function werkseitenQuelle(
  bild: { schluessel: string; breitePx: number; hoehePx: number } | null,
): Bildquelle | null {
  if (!bild?.schluessel) return null;

  if (!istLokalesBild(bild.schluessel)) {
    const src = bildQuelle(bild.schluessel);
    return src ? { src } : null;
  }

  const { props } = getImageProps({
    src: bild.schluessel,
    alt: "",
    width: bild.breitePx || 1600,
    height: bild.hoehePx || 2000,
    sizes: WERKSEITE_SIZES,
    quality: QUALITAET,
  });

  return { src: props.src, srcSet: props.srcSet, sizes: props.sizes };
}
