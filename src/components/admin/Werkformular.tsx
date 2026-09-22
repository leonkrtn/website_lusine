"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  Auswahl,
  Feld,
  Gruppe,
  Meldung,
  Schalter,
  Textfeld,
} from "@/components/admin/Bausteine";
import { speichereWerk, loescheWerk } from "@/app/admin/aktionen";
import { FORM_START, centZuEingabe } from "@/lib/adminzustand";
import { WERK_STATUS, STATUS_BESCHRIFTUNG, type Serie, type Werk } from "@/lib/typen";
import { Zeichen } from "@/components/admin/Zeichen";

function Speichern({ neu }: { neu: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="border-b border-tinte pb-1 text-klein transition-opacity duration-300 hover:opacity-60 disabled:opacity-40"
    >
      {pending ? "Wird gespeichert …" : neu ? "Werk anlegen" : "Speichern"}
    </button>
  );
}

type Props = {
  werk?: Werk | null;
  serien: Serie[];
  gesperrt?: boolean;
};

/**
 * Das Formular fuer ein Werk.
 *
 * Die Reihenfolge folgt dem, was beim Einstellen eines Bildes
 * tatsaechlich zuerst feststeht: Titel und Geschichte kommen vor
 * Preis und Verfuegbarkeit. Jedes Feld, dessen Wirkung nicht
 * offensichtlich ist, traegt einen Hinweis darunter.
 */
export function Werkformular({ werk, serien, gesperrt = false }: Props) {
  const [zustand, aktion] = useActionState(speichereWerk, FORM_START);
  const neu = !werk;

  return (
    <form action={aktion} className="max-w-3xl space-y-16">
      {werk && <input type="hidden" name="id" value={werk.id} />}

      <Gruppe titel="Das Werk">
        <Feld
          name="titel"
          beschriftung="Titel"
          standardwert={werk?.titel}
          pflicht
          gesperrt={gesperrt}
        />

        <Feld
          name="slug"
          beschriftung="Adresse"
          hinweis={
            neu
              ? "Leer lassen, dann wird sie aus dem Titel gebildet."
              : "Achtung: Wird sie geändert, funktionieren bereits geteilte Links auf dieses Werk nicht mehr."
          }
          standardwert={werk?.slug}
          platzhalter="wird-aus-dem-titel-gebildet"
          gesperrt={gesperrt}
        />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Feld
            name="jahr"
            beschriftung="Jahr"
            standardwert={werk?.jahr}
            typ="number"
            gesperrt={gesperrt}
          />
          <Auswahl
            name="serieId"
            beschriftung="Serie"
            standardwert={werk?.serieId ?? ""}
            optionen={[
              { wert: "", name: "— keine Serie —" },
              ...serien.map((serie) => ({ wert: serie.id, name: serie.titel })),
            ]}
          />
        </div>
      </Gruppe>

      <Gruppe
        titel="Die Geschichte"
        hinweis="Der wichtigste Text der ganzen Seite. Absätze durch eine Leerzeile trennen."
      >
        <Textfeld
          name="geschichte"
          beschriftung="Geschichte hinter dem Werk"
          standardwert={werk?.geschichte}
          zeilen={14}
          platzhalter={"Wie ist das Bild entstanden? Was war der Gedanke, das Gefühl, der Moment?\n\nEin neuer Absatz nach einer Leerzeile."}
        />

        <Textfeld
          name="zitat"
          beschriftung="Zitat"
          hinweis="Ein einzelner Satz. Erscheint groß gesetzt wie ein Wandtext im Museum."
          standardwert={werk?.zitat}
          zeilen={2}
        />
      </Gruppe>

      <Gruppe titel="Technische Angaben">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Feld
            name="technik"
            beschriftung="Technik"
            standardwert={werk?.technik}
            platzhalter="Öl auf Leinwand"
            gesperrt={gesperrt}
          />
          <Feld
            name="material"
            beschriftung="Material"
            standardwert={werk?.material}
            platzhalter="Baumwollgewebe auf Keilrahmen"
            gesperrt={gesperrt}
          />
        </div>

        <div className="grid grid-cols-3 gap-8">
          <Feld
            name="hoeheCm"
            beschriftung="Höhe in cm"
            standardwert={werk?.hoeheCm}
            gesperrt={gesperrt}
          />
          <Feld
            name="breiteCm"
            beschriftung="Breite in cm"
            standardwert={werk?.breiteCm}
            gesperrt={gesperrt}
          />
          <Feld
            name="tiefeCm"
            beschriftung="Tiefe in cm"
            standardwert={werk?.tiefeCm}
            gesperrt={gesperrt}
          />
        </div>

        <Schalter
          name="istUnikat"
          beschriftung="Unikat"
          hinweis="Das Werk existiert genau einmal."
          an={werk?.istUnikat ?? true}
        />

        <Feld
          name="editionInfo"
          beschriftung="Angabe zur Edition"
          hinweis="Nur ausfüllen, wenn es kein Unikat ist. Zum Beispiel: Auflage 3 von 12."
          standardwert={werk?.editionInfo}
          gesperrt={gesperrt}
        />
      </Gruppe>

      <Gruppe titel="Preis und Verfügbarkeit">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Feld
            name="preis"
            beschriftung="Preis in Euro"
            hinweis="Wird auf der Werkseite angezeigt. Leer lassen für „Preis auf Anfrage“."
            standardwert={centZuEingabe(werk?.preisCent ?? null)}
            platzhalter="3400"
            gesperrt={gesperrt}
          />
          <Feld
            name="versand"
            beschriftung="Versandkosten in Euro"
            hinweis="Erscheint als Hinweis neben dem Preis. Es wird nichts berechnet — die Abwicklung klären Sie persönlich."
            standardwert={centZuEingabe(werk?.versandCent ?? 0)}
            platzhalter="120"
            gesperrt={gesperrt}
          />
        </div>

        <Auswahl
          name="status"
          beschriftung="Status"
          hinweis="Steuert, was auf der Werkseite steht: Preis mit Anfrage, ein Hinweis auf die Reservierung oder schlicht „Verkauft“."
          standardwert={werk?.status ?? "verfuegbar"}
          optionen={WERK_STATUS.map((status) => ({
            wert: status,
            name: STATUS_BESCHRIFTUNG[status],
          }))}
        />

        <Schalter
          name="anfrageErlaubt"
          beschriftung="Anfrage zu diesem Werk erlauben"
          hinweis="Zeigt den Knopf, über den Interessenten eine Nachricht schreiben können."
          an={werk?.anfrageErlaubt ?? true}
        />
      </Gruppe>

      <Gruppe
        titel="Darstellung"
        hinweis="Die Startseite zeigt höchstens fünf Werke, jedes fast bildschirmfüllend."
      >
        <Schalter
          name="aufStartseite"
          beschriftung="Auf der Startseite zeigen"
          an={werk?.aufStartseite ?? false}
        />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Feld
            name="startseiteSortierung"
            beschriftung="Platz auf der Startseite"
            hinweis="Kleinere Zahl steht weiter oben."
            standardwert={werk?.startseiteSortierung ?? 0}
            typ="number"
            gesperrt={gesperrt}
          />
          <Feld
            name="sortierung"
            beschriftung="Platz im Katalog"
            hinweis="Größere Zahl steht weiter vorn."
            standardwert={werk?.sortierung ?? 0}
            typ="number"
            gesperrt={gesperrt}
          />
        </div>
      </Gruppe>

      <div className="flex flex-wrap items-center gap-8 border-t border-linie pt-10">
        <Speichern neu={neu} />
        <Meldung {...zustand} />

        {werk && (
          <Link
            href={`/werke/${werk.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-klein text-tinte-leise transition-colors duration-300 hover:text-tinte"
          >
            Auf der Seite ansehen <Zeichen name="extern" />
          </Link>
        )}
      </div>

      {/* Loeschen steht bewusst abgesetzt am Ende und nicht neben
          "Speichern": ein Fehlgriff loescht hier ein Originalwerk samt
          allen Bildern. */}
      {werk && !gesperrt && (
        <div className="border-t border-linie pt-10">
          <details>
            <summary className="cursor-pointer text-klein text-tinte-still">
              Werk löschen
            </summary>
            <div className="mt-6">
              <p className="max-w-xl text-klein text-tinte-leise">
                Das Werk wird mit allen Bildern und der Signatur unwiderruflich
                entfernt. Bereits geteilte Links darauf führen danach ins Leere.
                Bei einem verkauften Werk ist „Verkauft“ meist die bessere Wahl
                — so bleibt es Teil des Werkverzeichnisses.
              </p>
              <button
                type="submit"
                formAction={loescheWerk}
                formNoValidate
                className="mt-6 border-b border-[#a33] pb-1 text-klein text-[#a33] transition-opacity duration-300 hover:opacity-60"
              >
                Endgültig löschen
              </button>
            </div>
          </details>
        </div>
      )}
    </form>
  );
}
