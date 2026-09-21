import Stripe from "stripe";
import { stripeKonfiguriert } from "@/lib/umgebung";

/**
 * Zahlungsabwicklung.
 *
 * Solange kein Schluessel hinterlegt ist, liefert diese Datei null
 * zurueck statt zu scheitern. Die Seite laeuft dann vollstaendig, nur
 * der Direktkauf ist aus — die Kaufanfrage bleibt verfuegbar.
 */

let zwischengespeichert: Stripe | null = null;

export function stripe(): Stripe | null {
  if (!stripeKonfiguriert()) return null;
  if (zwischengespeichert) return zwischengespeichert;

  zwischengespeichert = new Stripe(process.env.STRIPE_GEHEIMSCHLUESSEL!, {
    // Ohne feste Version wuerde ein Versionswechsel bei Stripe die
    // Zahlungen dieser Seite ohne jede Aenderung im Code brechen.
    apiVersion: "2026-08-26.dahlia",
    typescript: true,
  });

  return zwischengespeichert;
}
