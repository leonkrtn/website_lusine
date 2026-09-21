"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { starteKauf } from "@/app/aktionen";
import { KAUF_START } from "@/lib/formularzustand";
import { Anfrageformular } from "@/components/Anfrageformular";
import { preisText } from "@/lib/bilder";
import { type Werk } from "@/lib/typen";

function Kaufknopf() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="border-b border-tinte pb-1 text-klein transition-opacity duration-500 hover:opacity-60 disabled:opacity-40"
    >
      {pending ? "Einen Moment …" : "Erwerben"}
    </button>
  );
}

/**
 * Der Erwerbsblock einer Werkseite.
 *
 * Zwei Wege, wie besprochen: direkt kaufen oder persoenlich anfragen.
 * Welche davon zu sehen sind, entscheidet allein das Werk — ein
 * verkauftes Original zeigt keinen Kaufknopf mehr, sondern einen ruhigen
 * Hinweis. Es bleibt sichtbar, weil es zum Werkverzeichnis gehoert.
 */
export function Erwerb({ werk }: { werk: Werk }) {
  const [zustand, aktion] = useActionState(starteKauf, KAUF_START);
  const [formularOffen, setFormularOffen] = useState(false);

  const verfuegbar = werk.status === "verfuegbar";
  const kannKaufen = verfuegbar && werk.direktkaufErlaubt && Boolean(werk.preisCent);
  const kannAnfragen = werk.anfrageErlaubt && werk.status !== "verkauft";

  return (
    <div>
      {/* --- Preis --------------------------------------------------------- */}
      {werk.status === "verkauft" ? (
        <p className="text-lead text-tinte-leise">Verkauft</p>
      ) : (
        <>
          <p className="text-lead">{preisText(werk.preisCent, werk.waehrung)}</p>
          {werk.preisCent !== null && (
            <p className="beschriftung mt-3">
              {werk.versandCent > 0
                ? `zzgl. ${preisText(werk.versandCent, werk.waehrung)} versicherter Versand`
                : "inklusive versichertem Versand"}
            </p>
          )}
          {werk.status === "reserviert" && (
            <p className="mt-4 text-klein text-tinte-leise">
              Dieses Werk ist derzeit reserviert. Fragen Sie gern an — manchmal
              wird eine Reservierung wieder frei.
            </p>
          )}
        </>
      )}

      {/* --- Die beiden Wege ----------------------------------------------- */}
      {(kannKaufen || kannAnfragen) && (
        <div className="mt-10 flex flex-wrap items-baseline gap-x-10 gap-y-4">
          {kannKaufen && (
            <form action={aktion}>
              <input type="hidden" name="werkId" value={werk.id} />
              <input type="hidden" name="werkSlug" value={werk.slug} />
              <Kaufknopf />
            </form>
          )}

          {kannAnfragen && !formularOffen && (
            <button
              type="button"
              onClick={() => setFormularOffen(true)}
              className="text-klein text-tinte-leise transition-colors duration-500 hover:text-tinte"
            >
              {kannKaufen ? "Oder persönlich anfragen" : "Anfragen"}
            </button>
          )}
        </div>
      )}

      {zustand.fehler && (
        <p role="alert" className="mt-6 max-w-md text-klein text-tinte-leise">
          {zustand.fehler}
        </p>
      )}

      {/* --- Anfrage ------------------------------------------------------- */}
      {formularOffen && (
        <div className="mt-16 border-t border-linie pt-16">
          <h3 className="beschriftung">Anfrage zu „{werk.titel}“</h3>
          <Anfrageformular
            werkId={werk.id}
            werkTitel={werk.titel}
            werkSlug={werk.slug}
            vorlage={`Guten Tag,\n\nich interessiere mich für „${werk.titel}“.\n\n`}
          />
        </div>
      )}

      {werk.status === "verkauft" && (
        <p className="mt-8 max-w-md text-klein text-tinte-leise">
          Dieses Werk hat ein Zuhause gefunden. Es bleibt hier als Teil des
          Werkverzeichnisses sichtbar.
        </p>
      )}
    </div>
  );
}
