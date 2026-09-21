"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendeAnfrage } from "@/app/aktionen";
import { ANFRAGE_START } from "@/lib/formularzustand";

type Props = {
  werkId?: string;
  werkTitel?: string;
  werkSlug?: string;
  /** Vorbelegter Text, etwa "Ich interessiere mich für …". */
  vorlage?: string;
};

function Absenden() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-10 border-b border-tinte pb-1 text-klein transition-opacity duration-500 hover:opacity-60 disabled:opacity-40"
    >
      {pending ? "Wird gesendet …" : "Nachricht senden"}
    </button>
  );
}

const feldKlasse =
  "mt-2 w-full border-0 border-b border-linie bg-papier pb-2 text-basis " +
  "outline-none transition-colors duration-500 focus:border-tinte";

/**
 * Das Anfrageformular — der persoenliche Weg zu einem Werk.
 *
 * Bewusst schlicht: vier Felder, keine Pflichtsternchen, keine
 * Auswahlfelder. Wer ein Original kaufen will, schreibt eine Nachricht,
 * keinen Bestellschein.
 */
export function Anfrageformular({ werkId, werkTitel, werkSlug, vorlage }: Props) {
  const [zustand, aktion] = useActionState(sendeAnfrage, ANFRAGE_START);

  if (zustand.erfolg) {
    return (
      <div role="status" className="max-w-xl">
        <p className="text-lead">Vielen Dank — Ihre Nachricht ist angekommen.</p>
        <p className="mt-4 text-tinte-leise">
          Lusine meldet sich persönlich bei Ihnen, in der Regel innerhalb von
          zwei Tagen.
        </p>
      </div>
    );
  }

  return (
    <form action={aktion} className="max-w-xl" noValidate>
      {werkId && <input type="hidden" name="werkId" value={werkId} />}
      {werkTitel && <input type="hidden" name="werkTitel" value={werkTitel} />}
      {werkSlug && <input type="hidden" name="werkSlug" value={werkSlug} />}

      {/* Honigtopf gegen automatische Formularausfueller. Fuer
          Vorlesegeraete und die Tastaturreihenfolge unsichtbar. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website (bitte frei lassen)</label>
        <input id="website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-8">
        <label htmlFor="name" className="beschriftung">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-invalid={zustand.felderfehler.name ? "true" : undefined}
          aria-describedby={zustand.felderfehler.name ? "name-fehler" : undefined}
          className={feldKlasse}
        />
        {zustand.felderfehler.name && (
          <p id="name-fehler" className="mt-2 text-klein text-tinte-leise">
            {zustand.felderfehler.name}
          </p>
        )}
      </div>

      <div className="mt-10">
        <label htmlFor="email" className="beschriftung">
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={zustand.felderfehler.email ? "true" : undefined}
          aria-describedby={zustand.felderfehler.email ? "email-fehler" : undefined}
          className={feldKlasse}
        />
        {zustand.felderfehler.email && (
          <p id="email-fehler" className="mt-2 text-klein text-tinte-leise">
            {zustand.felderfehler.email}
          </p>
        )}
      </div>

      <div className="mt-10">
        <label htmlFor="nachricht" className="beschriftung">
          Nachricht
        </label>
        <textarea
          id="nachricht"
          name="nachricht"
          rows={5}
          required
          defaultValue={vorlage}
          aria-invalid={zustand.felderfehler.nachricht ? "true" : undefined}
          aria-describedby={
            zustand.felderfehler.nachricht ? "nachricht-fehler" : undefined
          }
          className={`${feldKlasse} resize-none`}
        />
        {zustand.felderfehler.nachricht && (
          <p id="nachricht-fehler" className="mt-2 text-klein text-tinte-leise">
            {zustand.felderfehler.nachricht}
          </p>
        )}
      </div>

      {zustand.fehler && (
        <p role="alert" className="mt-8 text-klein text-tinte-leise">
          {zustand.fehler}
        </p>
      )}

      <Absenden />

      <p className="mt-8 text-fluestern text-tinte-still">
        Ihre Angaben werden ausschließlich zur Beantwortung Ihrer Anfrage
        verwendet. Näheres in der{" "}
        <a href="/datenschutz" className="border-b border-tinte-still">
          Datenschutzerklärung
        </a>
        .
      </p>
    </form>
  );
}
