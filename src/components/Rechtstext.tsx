import { Einblenden } from "@/components/Einblenden";

type Props = {
  titel: string;
  stand?: string;
  children: React.ReactNode;
};

/**
 * Rahmen fuer die rechtlichen Seiten.
 *
 * Sie sollen sauber lesbar sein und zur Seite passen, aber sich nicht
 * in den Vordergrund draengen: schmale Spalte, kleinere Schrift,
 * ruhige Zwischenueberschriften.
 */
export function Rechtstext({ titel, stand, children }: Props) {
  return (
    <div className="mx-auto max-w-[110rem] px-4 pt-16 sm:px-10 lg:px-16">
      <Einblenden als="article" className="mx-auto max-w-[42rem]">
        <h1 className="text-titel leading-tight">{titel}</h1>
        {stand && <p className="beschriftung mt-4">Stand: {stand}</p>}

        <div className="rechtstext mt-16">{children}</div>
      </Einblenden>
    </div>
  );
}

/** Ein Abschnitt innerhalb eines Rechtstextes. */
export function Abschnitt({
  ueberschrift,
  children,
}: {
  ueberschrift: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-14">
      <h2 className="text-lead leading-snug">{ueberschrift}</h2>
      <div className="mt-5 space-y-4 text-basis leading-relaxed">{children}</div>
    </section>
  );
}

/**
 * Deutlich sichtbarer Hinweis auf eine Stelle, die noch ausgefuellt
 * werden muss. Bewusst auffaellig: ein Impressum mit Platzhaltern, das
 * versehentlich online geht, ist abmahnfaehig.
 */
export function Auszufuellen({ children }: { children: React.ReactNode }) {
  return (
    <mark className="bg-[#fdf4d8] px-1 font-medium text-tinte">
      {children}
    </mark>
  );
}
