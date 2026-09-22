import Link from "next/link";
import { masseText, preisText } from "@/lib/bilder";
import { STATUS_BESCHRIFTUNG, type Werk } from "@/lib/typen";

type Props = {
  werk: Werk;
  /** Wird als `aria-labelledby`-Ziel gebraucht. */
  titelId?: string;
  /**
   * Die Überschriftenebene. Auf der Werkseite ist der Titel die
   * Überschrift der Seite, überall sonst eine unter vielen.
   */
  als?: "h1" | "h2";
  /**
   * Ob der Titel zum Werk führt. Auf der Werkseite selbst nicht —
   * ein Verweis auf die Seite, auf der man steht, ist keiner.
   */
  verlinkt?: boolean;
  /**
   * Die Kurzform: ohne den Bildträger. In der Übersicht hängen zwei
   * Werke nebeneinander, das Schild ist schmal, und „Baumwollgewebe
   * auf Keilrahmen, doppelt grundiert" bräche dort über drei Zeilen.
   * Woraus der Träger ist, gehört auf die Werkseite — dort steht das
   * Schild breit, und dort fragt man danach.
   */
  knapp?: boolean;
  /**
   * Ob das Schild beim Scrollen erscheint. Beim ersten Werk nicht: es
   * steht beim Laden schon im Bild und ist daher einfach da.
   */
  erscheint?: boolean;
  /** Zusätzliche Klassen für Ebene und Abstand. */
  className?: string;
  style?: React.CSSProperties;
  /** Wird unter den Angaben eingehängt — auf der Übersicht die Signatur. */
  children?: React.ReactNode;
};

/**
 * Das Schild neben einem Werk.
 *
 * Nach dem Vorbild eines Saalschilds, wie es in Ausstellungen neben
 * dem Bild an der Wand hängt: schmale Spalte, linksbündig, Flattersatz,
 * der Titel kursiv, darunter die Angaben in fester Reihenfolge — erst
 * was das Werk ist, dann wie groß, dann was es kostet.
 *
 * Diese Reihenfolge ist nicht beliebig. Sie folgt dem, was jemand vor
 * einem Bild wissen will, und in dieser Abfolge: Was ist das? Woraus?
 * Wie groß? Und erst zuletzt — zu haben?
 *
 * Der Titel steht kursiv, weil ein Werktitel kursiv steht. Das ist
 * keine Zierde, sondern die Regel, nach der Titel ausgezeichnet werden.
 *
 * Der Künstlername fehlt bewusst. Auf einem Saalschild im Museum steht
 * er, weil dort viele Hände nebeneinander hängen. Hier hängt nur eine,
 * und ihr Name steht über jeder Seite.
 */
export function Saalschild({
  werk,
  titelId,
  als: Ueberschrift = "h2",
  verlinkt = true,
  knapp = false,
  erscheint = true,
  className = "",
  style,
  children,
}: Props) {
  const masse = masseText(werk.breiteCm, werk.hoeheCm, werk.tiefeCm);

  const angaben = [
    werk.technik,
    knapp ? null : werk.material,
    masse,
    werk.istUnikat ? "Unikat" : werk.editionInfo,
  ].filter(Boolean);

  return (
    <div
      className={`saalschild ${className}`}
      style={style}
      data-erscheint={erscheint ? undefined : "nein"}
    >
      <Ueberschrift id={titelId} className="saalschild-titel">
        {verlinkt ? (
          <Link href={`/werke/${werk.slug}`} className="unterstrich">
            {werk.titel}
          </Link>
        ) : (
          werk.titel
        )}
        {werk.jahr && <span className="saalschild-jahr">, {werk.jahr}</span>}
      </Ueberschrift>

      {angaben.length > 0 && (
        <p className="saalschild-angaben">
          {angaben.map((zeile, nummer) => (
            <span key={nummer}>{zeile}</span>
          ))}
        </p>
      )}

      <p className="saalschild-preis">
        {werk.status === "verfuegbar"
          ? preisText(werk.preisCent, werk.waehrung)
          : STATUS_BESCHRIFTUNG[werk.status]}
      </p>

      {children}
    </div>
  );
}
