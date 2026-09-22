import Image from "next/image";
import { bildQuelle, istLokalesBild } from "@/lib/bilder";
import type { PinAngaben } from "@/lib/darstellung";

type Props = {
  schluessel: string;
  alt: string;
  breitePx: number;
  hoehePx: number;
  /** Wie breit das Bild im Layout wird. */
  sizes: string;
  /** Nur fuer das erste Bild der Startseite setzen. */
  vorrang?: boolean;
  className?: string;
  /**
   * Was Pinterest mitnimmt, wenn jemand dieses Bild merkt. Ein Objekt
   * lenkt den Pin auf das Bild mit Schild (siehe `lib/sozialbild.tsx`),
   * `false` schließt das Bild vom Merken aus — für alles, was zwar ein
   * Werk zeigt, aber nicht das Werk ist, etwa den Größenvergleich.
   */
  pin?: PinAngaben | false;
};


function pinAttribute(pin: PinAngaben | false | undefined) {
  if (pin === undefined) return {};
  if (pin === false) return { "data-pin-nopin": "true" };
  return {
    "data-pin-media": pin.bild,
    "data-pin-description": pin.beschreibung,
    "data-pin-url": pin.adresse,
  };
}

/**
 * Ein Gemaelde auf der Seite.
 *
 * Die Klasse `.werkbild` setzt die Verbotsliste aus globals.css durch:
 * kein Rahmen, kein Schatten, keine abgerundete Ecke, kein grauer
 * Ladezustand. Nur so steht ein auf Reinweiss freigestelltes Werk ohne
 * sichtbare Kante auf der Seite.
 *
 * Das Bild wird unveraendert ausgeliefert, genau so wie es hochgeladen
 * wurde. Breite und Hoehe stehen trotzdem im Markup: ohne sie kann der
 * Browser den Platz nicht reservieren, und die Seite springt beim Laden
 * — was in einer Galerie besonders stoert.
 */
export function Werkbild({
  schluessel,
  alt,
  breitePx,
  hoehePx,
  sizes,
  vorrang = false,
  className = "",
  pin,
}: Props) {
  if (!schluessel) return null;

  const pinAngaben = pinAttribute(pin);

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
        {...pinAngaben}
        className={`werkbild h-auto w-full ${className}`}
      />
    );
  }

  const seitenverhaeltnis =
    breitePx > 0 && hoehePx > 0 ? `${breitePx} / ${hoehePx}` : undefined;

  return (
    /* Die Datei wird unveraendert ausgeliefert; next/image wuerde sie
       umrechnen. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={bildQuelle(schluessel)}
      alt={alt}
      width={breitePx || undefined}
      height={hoehePx || undefined}
      loading={vorrang ? "eager" : "lazy"}
      fetchPriority={vorrang ? "high" : "auto"}
      decoding="async"
      style={seitenverhaeltnis ? { aspectRatio: seitenverhaeltnis } : undefined}
      {...pinAngaben}
      className={`werkbild h-auto w-full ${className}`}
    />
  );
}
