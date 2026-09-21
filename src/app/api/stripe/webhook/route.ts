import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseDienst } from "@/lib/supabase/dienst";
import { markiereWerkAlsVerkauft } from "@/lib/daten";
import { bestaetigeKauf, meldeKaufAnAtelier } from "@/lib/mail";

/**
 * Der Stripe-Webhook — die einzige Stelle, an der ein Verkauf entsteht.
 *
 * Warum nicht auf der Danke-Seite: die kann jeder aufrufen. Nur Stripe
 * weiss, ob wirklich bezahlt wurde, und nur eine signierte Meldung von
 * Stripe darf ein Original als verkauft markieren.
 *
 * Einrichten:
 *   Stripe Dashboard -> Entwickler -> Webhooks -> Endpunkt hinzufügen
 *   Adresse:   https://<domain>/api/stripe/webhook
 *   Ereignis:  checkout.session.completed
 *   Das erzeugte Signaturgeheimnis als STRIPE_WEBHOOK_GEHEIMNIS eintragen.
 */

// Der Rumpf muss unveraendert bleiben, sonst stimmt die Signatur nicht.
export const dynamic = "force-dynamic";

export async function POST(anfrage: Request) {
  const zahlung = stripe();
  const geheimnis = process.env.STRIPE_WEBHOOK_GEHEIMNIS;

  if (!zahlung || !geheimnis) {
    return NextResponse.json(
      { fehler: "Stripe ist nicht eingerichtet." },
      { status: 503 },
    );
  }

  const signatur = anfrage.headers.get("stripe-signature");
  if (!signatur) {
    return NextResponse.json({ fehler: "Signatur fehlt." }, { status: 400 });
  }

  const rumpf = await anfrage.text();

  let ereignis: Stripe.Event;
  try {
    ereignis = await zahlung.webhooks.constructEventAsync(
      rumpf,
      signatur,
      geheimnis,
    );
  } catch {
    // Ohne gueltige Signatur wird nichts verarbeitet. Punkt.
    return NextResponse.json({ fehler: "Signatur ungültig." }, { status: 400 });
  }

  if (ereignis.type !== "checkout.session.completed") {
    // Andere Ereignisse bestaetigen, damit Stripe nicht erneut zustellt.
    return NextResponse.json({ erhalten: true });
  }

  const sitzung = ereignis.data.object as Stripe.Checkout.Session;

  // Nur bezahlte Sitzungen zaehlen.
  if (sitzung.payment_status !== "paid") {
    return NextResponse.json({ erhalten: true });
  }

  const werkId = sitzung.metadata?.werkId ?? null;
  const werkTitel = sitzung.metadata?.werkTitel ?? "Unbekanntes Werk";

  const versandCent =
    sitzung.total_details?.amount_shipping ??
    sitzung.shipping_cost?.amount_total ??
    0;

  const lieferung = sitzung.collected_information?.shipping_details ?? null;
  const anschrift = lieferung?.address;

  const lieferadresse = anschrift
    ? {
        name: lieferung?.name ?? null,
        strasse: [anschrift.line1, anschrift.line2].filter(Boolean).join(", ") || null,
        plz: anschrift.postal_code ?? null,
        ort: anschrift.city ?? null,
        land: anschrift.country ?? null,
      }
    : null;

  const kaeuferEmail =
    sitzung.customer_details?.email ?? sitzung.customer_email ?? null;
  const kaeuferName = sitzung.customer_details?.name ?? lieferung?.name ?? null;
  const betragCent = sitzung.amount_total ?? 0;
  const waehrung = sitzung.currency ?? "eur";

  const client = supabaseDienst();

  if (client) {
    // Stripe stellt eine Meldung im Zweifel mehrfach zu. Die
    // Sitzungskennung ist in der Datenbank eindeutig — ein zweiter
    // Versuch legt also keine zweite Bestellung an.
    const { error } = await client.from("bestellungen").upsert(
      {
        werk_id: werkId,
        werk_titel: werkTitel,
        stripe_sitzung_id: sitzung.id,
        stripe_zahlung_id:
          typeof sitzung.payment_intent === "string"
            ? sitzung.payment_intent
            : (sitzung.payment_intent?.id ?? null),
        kaeufer_name: kaeuferName,
        kaeufer_email: kaeuferEmail,
        betrag_cent: betragCent,
        versand_cent: versandCent,
        waehrung,
        lieferadresse,
        status: "bezahlt",
      },
      { onConflict: "stripe_sitzung_id" },
    );

    if (error) {
      // Fehlschlag melden, damit Stripe es erneut versucht — eine
      // bezahlte Bestellung darf nicht verloren gehen.
      return NextResponse.json(
        { fehler: "Bestellung konnte nicht gespeichert werden." },
        { status: 500 },
      );
    }
  }

  // Das Werk sperren. Bei Unikaten ist das der Schutz vor
  // Doppelverkauf: ab hier ist es nicht mehr kaufbar, bleibt aber als
  // Teil des Werkverzeichnisses sichtbar.
  if (werkId) {
    await markiereWerkAlsVerkauft(werkId);
  }

  await Promise.all([
    bestaetigeKauf({
      werkTitel,
      kaeuferName,
      kaeuferEmail,
      betragCent,
      waehrung,
      lieferadresse,
    }),
    meldeKaufAnAtelier({
      werkTitel,
      kaeuferName,
      kaeuferEmail,
      betragCent,
      waehrung,
      lieferadresse,
    }),
  ]);

  return NextResponse.json({ erhalten: true });
}
