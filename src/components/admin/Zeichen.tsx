/**
 * Kleine Zeichen des Admin-Bereichs als Linienzeichnung statt als
 * Schriftzeichen. Pfeile und Haken aus dem Zeichensatz sehen je nach
 * Geraet anders aus, manche werden gar bunt; eine eigene Zeichnung
 * steht ueberall gleich da, in der Farbe und Groesse der Schrift.
 */

type Name = "zurueck" | "extern" | "erledigt" | "offen";

const PFADE: Record<Name, React.ReactNode> = {
  zurueck: <path d="M13 8H3M7 4 3 8l4 4" />,
  extern: <path d="M6 4h6v6M12 4 4 12" />,
  erledigt: <path d="m3.5 8.5 3 3 6-7" />,
  offen: <circle cx="8" cy="8" r="4.5" />,
};

export function Zeichen({ name }: { name: Name }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="inline-block shrink-0 align-[-0.125em]"
    >
      {PFADE[name]}
    </svg>
  );
}
