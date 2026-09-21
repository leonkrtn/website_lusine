"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Gruppe, Meldung, Textfeld } from "@/components/admin/Bausteine";
import { speichereTexte } from "@/app/admin/aktionen";
import { FORM_START } from "@/lib/adminzustand";
import type { SeitenTexte } from "@/lib/typen";

function Speichern() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="border-b border-tinte pb-1 text-klein transition-opacity duration-300 hover:opacity-60 disabled:opacity-40"
    >
      {pending ? "Wird gespeichert …" : "Texte speichern"}
    </button>
  );
}

export function Texteformular({
  texte,
  gesperrt = false,
}: {
  texte: SeitenTexte;
  gesperrt?: boolean;
}) {
  const [zustand, aktion] = useActionState(speichereTexte, FORM_START);

  return (
    <form action={aktion} className="max-w-3xl space-y-16">
      <Gruppe titel="Startseite">
        <Textfeld
          name="startseiteAuftakt"
          beschriftung="Auftakt"
          hinweis="Steht ganz oben, vor dem ersten Werk. Zwei bis drei Sätze."
          standardwert={texte.startseiteAuftakt}
          zeilen={4}
        />
        <Textfeld
          name="startseiteZitat"
          beschriftung="Zitat"
          hinweis="Ein Satz, groß gesetzt. Erscheint zwischen den Werken und dem Abschluss."
          standardwert={texte.startseiteZitat}
          zeilen={3}
        />
        <Textfeld
          name="startseiteAbschluss"
          beschriftung="Abschluss"
          hinweis="Der letzte Absatz vor dem Verweis auf alle Werke."
          standardwert={texte.startseiteAbschluss}
          zeilen={4}
        />
      </Gruppe>

      <Gruppe titel="Über Lusine">
        <Textfeld
          name="ueberUeberschrift"
          beschriftung="Überschrift"
          standardwert={texte.ueberUeberschrift}
          zeilen={2}
        />
        <Textfeld
          name="ueberText"
          beschriftung="Text"
          hinweis="Absätze durch eine Leerzeile trennen."
          standardwert={texte.ueberText}
          zeilen={12}
        />
      </Gruppe>

      <Gruppe titel="Kontakt">
        <Textfeld
          name="kontaktText"
          beschriftung="Einleitung"
          hinweis="Steht neben dem Formular."
          standardwert={texte.kontaktText}
          zeilen={5}
        />
      </Gruppe>

      <div className="flex flex-wrap items-center gap-8 border-t border-linie pt-10">
        {!gesperrt && <Speichern />}
        <Meldung {...zustand} />
      </div>
    </form>
  );
}
