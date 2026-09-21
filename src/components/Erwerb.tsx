"use client";

import { useState } from "react";
import { Anfrageformular } from "@/components/Anfrageformular";
import { preisText } from "@/lib/bilder";
import { type Werk } from "@/lib/typen";

/**
 * Der Erwerbsblock einer Werkseite.
 *
 * Es gibt keinen Kauf ueber die Website. Der Preis steht offen da, und
 * wer das Werk haben moechte, schreibt eine Nachricht — alles Weitere
 * klaert Lusine persoenlich.
 *
 * Das ist keine fehlende Funktion, sondern die Form, die zu Originalen
 * passt: ein Bild, das es genau einmal gibt, legt man nicht in einen
 * Warenkorb.
 */
export function Erwerb({ werk }: { werk: Werk }) {
  const [formularOffen, setFormularOffen] = useState(false);

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

      {/* --- Der Weg zum Werk ---------------------------------------------- */}
      {kannAnfragen && !formularOffen && (
        <div className="mt-10">
          <button
            type="button"
            onClick={() => setFormularOffen(true)}
            className="border-b border-tinte pb-1 text-klein transition-opacity duration-500 hover:opacity-60"
          >
            Dieses Werk anfragen
          </button>

          <p className="mt-6 max-w-sm text-klein text-tinte-leise">
            Schreiben Sie mir eine Nachricht. Ich melde mich persönlich und
            bespreche alles Weitere mit Ihnen — Versand, Zahlung und den
            richtigen Zeitpunkt.
          </p>
        </div>
      )}

      {formularOffen && (
        <div className="mt-14 border-t border-linie pt-14">
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
