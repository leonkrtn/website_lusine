import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client mit Dienstschluessel. Umgeht alle Zugriffsregeln.
 *
 * Nur fuer Vorgaenge, die ohne angemeldeten Benutzer stattfinden und
 * trotzdem schreiben muessen:
 *   - der Stripe-Webhook, der eine Bestellung anlegt
 *   - das Anfrageformular, das eine Nachricht speichert
 *
 * Darf niemals in eine Client Component importiert werden. Der
 * Schluessel steht nur in einer serverseitigen Umgebungsvariable,
 * ohne NEXT_PUBLIC_-Praefix, und erreicht den Browser dadurch nie.
 */
export function supabaseDienst(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const schluessel = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !schluessel) return null;

  return createClient(url, schluessel, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
