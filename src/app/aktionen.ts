"use server";

import { z } from "zod";
import { supabaseDienst } from "@/lib/supabase/dienst";
import { verschickeAnfragemails } from "@/lib/mail";
import { demoModus } from "@/lib/umgebung";
import type { AnfrageZustand } from "@/lib/formularzustand";

/**
 * Der einzige Vorgang, den Besucher der Seite ausloesen koennen: eine
 * Anfrage zu einem Werk.
 *
 * Es gibt keinen Kauf ueber die Website. Wer ein Werk erwerben will,
 * schreibt eine Nachricht; alles Weitere — Preis, Versand, Zahlung —
 * klaert Lusine persoenlich. Das passt zu Originalen, die es je nur
 * einmal gibt, und erspart der Seite einen Zahlungsdienst samt der
 * Pflichten, die daran haengen.
 */

// ---------------------------------------------------------------------------
//  Kaufanfrage
// ---------------------------------------------------------------------------

const AnfrageSchema = z.object({
  name: z.string().trim().min(2, "Bitte geben Sie Ihren Namen an.").max(120),
  email: z.string().trim().email("Diese E-Mail-Adresse sieht nicht gültig aus.").max(180),
  nachricht: z
    .string()
    .trim()
    .min(10, "Bitte schreiben Sie ein paar Worte mehr.")
    .max(4000, "Bitte fassen Sie sich etwas kürzer."),
  werkId: z.string().optional(),
  werkTitel: z.string().optional(),
  werkSlug: z.string().optional(),
});

export async function sendeAnfrage(
  _zustand: AnfrageZustand,
  formular: FormData,
): Promise<AnfrageZustand> {
  // Honigtopf: ein Feld, das im Browser unsichtbar ist. Menschen lassen
  // es leer, automatische Formularausfueller nicht.
  if (formular.get("website")) {
    // Nicht verraten, dass die Falle zugeschnappt ist.
    return { erfolg: true, fehler: null, felderfehler: {} };
  }

  const geprueft = AnfrageSchema.safeParse({
    name: formular.get("name"),
    email: formular.get("email"),
    nachricht: formular.get("nachricht"),
    werkId: formular.get("werkId") || undefined,
    werkTitel: formular.get("werkTitel") || undefined,
    werkSlug: formular.get("werkSlug") || undefined,
  });

  if (!geprueft.success) {
    const felderfehler: AnfrageZustand["felderfehler"] = {};
    for (const problem of geprueft.error.issues) {
      const feld = problem.path[0];
      if (feld === "name" || feld === "email" || feld === "nachricht") {
        felderfehler[feld] ??= problem.message;
      }
    }
    return { erfolg: false, fehler: null, felderfehler };
  }

  const daten = geprueft.data;

  // Speichern mit dem Dienstschluessel: die anfragende Person ist nicht
  // angemeldet und soll auch keinerlei Leserecht auf die Tabelle haben.
  const client = supabaseDienst();
  if (client) {
    const { error } = await client.from("anfragen").insert({
      werk_id: daten.werkId ?? null,
      werk_titel: daten.werkTitel ?? null,
      name: daten.name,
      email: daten.email,
      nachricht: daten.nachricht,
    });

    if (error) {
      return {
        erfolg: false,
        fehler:
          "Die Anfrage konnte nicht gespeichert werden. Bitte versuchen Sie es noch einmal oder schreiben Sie direkt eine E-Mail.",
        felderfehler: {},
      };
    }
  } else if (!demoModus()) {
    // Supabase ist eingerichtet, aber der Dienstschluessel fehlt.
    return {
      erfolg: false,
      fehler:
        "Das Anfrageformular ist noch nicht vollständig eingerichtet. Bitte schreiben Sie vorerst direkt eine E-Mail.",
      felderfehler: {},
    };
  }

  // Die E-Mails laufen bewusst nach dem Speichern und ohne Abbruch:
  // eine Anfrage, die in der Datenbank steht, ist angekommen — auch
  // wenn der Mailversand gerade klemmt.
  await verschickeAnfragemails({
    name: daten.name,
    email: daten.email,
    nachricht: daten.nachricht,
    werkTitel: daten.werkTitel ?? null,
    werkSlug: daten.werkSlug ?? null,
  });

  return { erfolg: true, fehler: null, felderfehler: {} };
}
