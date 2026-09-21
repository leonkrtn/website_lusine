"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { supabaseDienst } from "@/lib/supabase/dienst";
import { holeWerkNachId, holeWerk } from "@/lib/daten";
import { bestaetigeAnfrage, meldeAnfrageAnAtelier } from "@/lib/mail";
import { demoModus, seitenUrl, stripeKonfiguriert } from "@/lib/umgebung";
import type { AnfrageZustand, KaufZustand } from "@/lib/formularzustand";

/**
 * Die Vorgaenge, die Besucher der Seite ausloesen koennen: ein Werk
 * kaufen oder danach fragen.
 *
 * Beide laufen ausschliesslich auf dem Server. Preise, Verfuegbarkeit
 * und Versandkosten werden hier frisch aus der Datenbank gelesen und
 * nie aus dem Formular uebernommen — sonst koennte jeder den Preis
 * eines Originals im Browser aendern.
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
  await Promise.all([
    meldeAnfrageAnAtelier({
      name: daten.name,
      email: daten.email,
      nachricht: daten.nachricht,
      werkTitel: daten.werkTitel ?? null,
      werkSlug: daten.werkSlug ?? null,
    }),
    bestaetigeAnfrage({
      name: daten.name,
      email: daten.email,
      nachricht: daten.nachricht,
      werkTitel: daten.werkTitel ?? null,
    }),
  ]);

  return { erfolg: true, fehler: null, felderfehler: {} };
}

// ---------------------------------------------------------------------------
//  Direktkauf
// ---------------------------------------------------------------------------

export async function starteKauf(
  _zustand: KaufZustand,
  formular: FormData,
): Promise<KaufZustand> {
  const werkId = String(formular.get("werkId") ?? "");
  const werkSlug = String(formular.get("werkSlug") ?? "");

  if (!werkId) return { fehler: "Unbekanntes Werk." };

  if (!stripeKonfiguriert()) {
    return {
      fehler:
        "Der Direktkauf ist noch nicht eingerichtet. Bitte nutzen Sie die Kaufanfrage — wir melden uns persönlich.",
    };
  }

  // Frisch aus der Datenbank: Preis, Versand und Verfuegbarkeit duerfen
  // niemals aus dem Formular stammen.
  const werk = werkSlug ? await holeWerk(werkSlug) : await holeWerkNachId(werkId);

  if (!werk) return { fehler: "Dieses Werk wurde nicht gefunden." };

  if (werk.status !== "verfuegbar" || !werk.direktkaufErlaubt) {
    return {
      fehler:
        "Dieses Werk ist nicht mehr direkt erhältlich. Schreiben Sie mir gern eine Nachricht.",
    };
  }

  if (!werk.preisCent || werk.preisCent <= 0) {
    return {
      fehler: "Für dieses Werk ist kein Preis hinterlegt. Bitte fragen Sie an.",
    };
  }

  const zahlung = stripe();
  if (!zahlung) return { fehler: "Die Zahlung ist gerade nicht verfügbar." };

  const basis = seitenUrl();
  let adresse: string | null = null;

  try {
    const sitzung = await zahlung.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: werk.waehrung,
            unit_amount: werk.preisCent,
            product_data: {
              name: werk.titel,
              description: [werk.jahr, werk.technik].filter(Boolean).join(", "),
            },
          },
        },
      ],
      // Versandkosten haengen am Werk: ein Grossformat kostet mehr als
      // eine kleine Arbeit.
      shipping_options: werk.versandCent
        ? [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                display_name: "Versicherter Versand",
                fixed_amount: {
                  amount: werk.versandCent,
                  currency: werk.waehrung,
                },
              },
            },
          ]
        : undefined,
      shipping_address_collection: { allowed_countries: ["DE", "AT", "CH"] },
      phone_number_collection: { enabled: false },
      locale: "de",
      // Ueber diese Angaben findet der Webhook das Werk wieder.
      metadata: { werkId: werk.id, werkTitel: werk.titel, werkSlug: werk.slug },
      success_url: `${basis}/kauf/danke?sitzung={CHECKOUT_SESSION_ID}`,
      cancel_url: `${basis}/werke/${werk.slug}`,
    });

    adresse = sitzung.url;
  } catch {
    return {
      fehler:
        "Die Zahlung konnte nicht gestartet werden. Bitte versuchen Sie es noch einmal.",
    };
  }

  if (!adresse) {
    return { fehler: "Die Zahlung konnte nicht gestartet werden." };
  }

  // redirect wirft intern eine besondere Ausnahme und muss deshalb
  // ausserhalb des try-Blocks stehen.
  redirect(adresse);
}
