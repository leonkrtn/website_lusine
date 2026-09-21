import type { ReactNode } from "react";

/**
 * Formularbausteine des Admin-Bereichs.
 *
 * Bewusst schlicht und einheitlich. Wer damit taeglich arbeitet, soll
 * nicht jedes Mal ueberlegen muessen, wo ein Feld anfaengt und wo es
 * aufhoert — und ein Hinweistext unter dem Feld ist mehr wert als eine
 * schoene Umrandung.
 */

const EINGABE =
  "mt-2 w-full border-0 border-b border-feldlinie bg-papier pb-2 text-basis " +
  "outline-none transition-colors duration-300 focus:border-tinte " +
  "disabled:text-tinte-still";

type FeldProps = {
  name: string;
  beschriftung: string;
  hinweis?: string;
  standardwert?: string | number | null;
  typ?: string;
  pflicht?: boolean;
  platzhalter?: string;
  gesperrt?: boolean;
};

export function Feld({
  name,
  beschriftung,
  hinweis,
  standardwert,
  typ = "text",
  pflicht = false,
  platzhalter,
  gesperrt = false,
}: FeldProps) {
  return (
    <div>
      <label htmlFor={name} className="beschriftung">
        {beschriftung}
      </label>
      <input
        id={name}
        name={name}
        type={typ}
        required={pflicht}
        disabled={gesperrt}
        placeholder={platzhalter}
        defaultValue={standardwert ?? ""}
        className={EINGABE}
      />
      {hinweis && <p className="mt-2 text-fluestern text-tinte-still">{hinweis}</p>}
    </div>
  );
}

export function Textfeld({
  name,
  beschriftung,
  hinweis,
  standardwert,
  zeilen = 6,
  platzhalter,
}: {
  name: string;
  beschriftung: string;
  hinweis?: string;
  standardwert?: string | null;
  zeilen?: number;
  platzhalter?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="beschriftung">
        {beschriftung}
      </label>
      <textarea
        id={name}
        name={name}
        rows={zeilen}
        placeholder={platzhalter}
        defaultValue={standardwert ?? ""}
        className={`${EINGABE} resize-y leading-relaxed`}
      />
      {hinweis && <p className="mt-2 text-fluestern text-tinte-still">{hinweis}</p>}
    </div>
  );
}

export function Auswahl({
  name,
  beschriftung,
  hinweis,
  standardwert,
  optionen,
}: {
  name: string;
  beschriftung: string;
  hinweis?: string;
  standardwert?: string | null;
  optionen: { wert: string; name: string }[];
}) {
  return (
    <div>
      <label htmlFor={name} className="beschriftung">
        {beschriftung}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={standardwert ?? ""}
        className={EINGABE}
      >
        {optionen.map((option) => (
          <option key={option.wert} value={option.wert}>
            {option.name}
          </option>
        ))}
      </select>
      {hinweis && <p className="mt-2 text-fluestern text-tinte-still">{hinweis}</p>}
    </div>
  );
}

export function Schalter({
  name,
  beschriftung,
  hinweis,
  an = false,
}: {
  name: string;
  beschriftung: string;
  hinweis?: string;
  an?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={name}
        name={name}
        type="checkbox"
        value="ja"
        defaultChecked={an}
        className="mt-1.5 h-4 w-4 shrink-0 accent-[#111111]"
      />
      <div>
        <label htmlFor={name} className="text-klein">
          {beschriftung}
        </label>
        {hinweis && (
          <p className="mt-1 text-fluestern text-tinte-still">{hinweis}</p>
        )}
      </div>
    </div>
  );
}

/** Eine Gruppe zusammengehoeriger Felder. */
export function Gruppe({
  titel,
  hinweis,
  children,
}: {
  titel: string;
  hinweis?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-linie pt-10">
      <h2 className="text-lead leading-snug">{titel}</h2>
      {hinweis && (
        <p className="mt-2 max-w-xl text-klein text-tinte-leise">{hinweis}</p>
      )}
      <div className="mt-8 space-y-10">{children}</div>
    </section>
  );
}

/** Rueckmeldung nach dem Speichern. */
export function Meldung({
  erfolg,
  fehler,
  meldung,
}: {
  erfolg: boolean;
  fehler: string | null;
  meldung: string | null;
}) {
  if (!fehler && !meldung) return null;

  return (
    <p
      role={fehler ? "alert" : "status"}
      className={`text-klein ${fehler ? "text-[#a33]" : "text-tinte-leise"}`}
    >
      {fehler ?? (erfolg ? meldung : null)}
    </p>
  );
}

/** Eine leere Liste — mit Hinweis, was als Nächstes zu tun ist. */
export function Leer({ children }: { children: ReactNode }) {
  return (
    <p className="border-t border-linie py-16 text-center text-klein text-tinte-leise">
      {children}
    </p>
  );
}
