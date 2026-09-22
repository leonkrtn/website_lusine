import { Werkbild } from "@/components/Werkbild";
import { masseText } from "@/lib/bilder";

/** Ein Blatt DIN A4 im Hochformat, in Zentimetern. */
const A4_BREITE_CM = 21;
const A4_HOEHE_CM = 29.7;

/** So hoch wird die Zeichnung höchstens, in rem. */
const HOEHE_REM = 18;

/** Der Abstand zwischen Werk und Blatt, in rem. */
const ABSTAND_REM = 1.5;

type Props = {
  breiteCm: number | null;
  hoeheCm: number | null;
  schluessel: string;
  alt: string;
  breitePx: number;
  hoehePx: number;
};

/**
 * Das Werk neben einem Blatt DIN A4, beide im selben Maßstab.
 *
 * Zentimeter im Datenblatt sagen wenig, solange man sie nicht vor
 * sich sieht. Ein Blatt Papier hat jeder schon in der Hand gehabt —
 * daneben wird aus „80 × 60 cm“ eine Größe.
 *
 * Beide stehen auf einer gemeinsamen Grundlinie, wie auf einem Bord.
 * Die Breiten verteilt `flex` im Verhältnis der Zentimeter, die
 * Höhen folgen aus dem Seitenverhältnis. So bleibt der Maßstab auf
 * jeder Bildschirmbreite derselbe, ohne dass gerechnet werden muss.
 * Die Breite des Ganzen ist so begrenzt, dass ein schmales Hochformat
 * nicht meterweit nach unten wächst.
 *
 * Aufgeklappt wird über `<details>` — das braucht kein JavaScript.
 * Das Blatt steht neben dem Werk, nie dahinter: sein Umriss darf
 * keine Kante des Gemäldes nachzeichnen.
 */
export function Groessenvergleich({
  breiteCm,
  hoeheCm,
  schluessel,
  alt,
  breitePx,
  hoehePx,
}: Props) {
  const masse = masseText(breiteCm, hoeheCm, null);
  if (!breiteCm || !hoeheCm || !masse || !schluessel) return null;

  const summeCm = breiteCm + A4_BREITE_CM;
  const hoechsteCm = Math.max(hoeheCm, A4_HOEHE_CM);
  const maxBreite = `calc(${HOEHE_REM}rem * ${(summeCm / hoechsteCm).toFixed(4)} + ${ABSTAND_REM}rem)`;

  return (
    <details className="groessenvergleich mt-8">
      <summary className="text-klein">Größe mit DIN A4 vergleichen</summary>

      <figure className="mt-8">
        <div
          className="groessenvergleich-bord"
          style={{ maxWidth: maxBreite, gap: `${ABSTAND_REM}rem` }}
        >
          <div style={{ flex: `${breiteCm} 1 0` }}>
            <Werkbild
              schluessel={schluessel}
              alt={alt}
              breitePx={breitePx}
              hoehePx={hoehePx}
              sizes="20rem"
              /* Das Werk im Vergleich ist verkleinert und steht neben
                 einem Blatt Papier — gemerkt werden soll das Werk
                 selbst, nicht diese Skizze. */
              pin={false}
            />
          </div>

          <div
            className="groessenvergleich-blatt text-fluestern"
            style={{
              flex: `${A4_BREITE_CM} 1 0`,
              aspectRatio: `${A4_BREITE_CM} / ${A4_HOEHE_CM}`,
            }}
            aria-hidden="true"
          >
            A4
          </div>
        </div>

        <figcaption className="mt-6 text-fluestern text-tinte-still">
          Das Werk misst {masse}, das Blatt DIN A4 29,7 × 21 cm. Beide im
          selben Maßstab.
        </figcaption>
      </figure>
    </details>
  );
}
