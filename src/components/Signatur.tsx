import { bildQuelle } from "@/lib/bilder";

type Props = {
  schluessel: string | null;
  /** Fuer die Bildbeschreibung: "Signatur zu <Werktitel>". */
  werkTitel: string;
  /** Anzeigebreite in Pixeln. */
  breite?: number;
  className?: string;
};

/**
 * Die individuelle Signatur eines Werks.
 *
 * Sie ist kein Logo, sondern die handschriftliche Beglaubigung dieses
 * einen Bildes — jedes Werk hat seine eigene. Darum steht sie frei auf
 * dem Papier, ohne Flaeche und ohne Rahmen. Ein PNG mit durchsichtigem
 * Hintergrund ist hier das richtige Format.
 *
 * Fuer Vorlesegeraete ist sie Zierde und kein Inhalt: der Werktitel
 * steht ohnehin daneben, eine zweite Ansage waere nur Laerm. Deshalb
 * leeres alt und aria-hidden.
 */
export function Signatur({
  schluessel,
  werkTitel,
  breite = 260,
  className = "",
}: Props) {
  if (!schluessel) return null;

  const quelle = bildQuelle(schluessel);
  if (!quelle) return null;

  return (
    /* Kleine, transparente Grafik — die Bildverarbeitung von next/image
       braucht sie nicht und wuerde die Transparenz gefaehrden. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={quelle}
      alt=""
      aria-hidden="true"
      data-werk={werkTitel}
      loading="lazy"
      decoding="async"
      style={{ width: `${breite}px` }}
      className={`h-auto max-w-full select-none ${className}`}
    />
  );
}
