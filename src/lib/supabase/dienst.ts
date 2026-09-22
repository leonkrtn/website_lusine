import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdresse, supabaseDienstSchluessel } from "@/lib/umgebung";

/**
 * Client mit Dienstschluessel. Umgeht alle Zugriffsregeln.
 *
 * Nur fuer Vorgaenge, die ohne angemeldeten Benutzer stattfinden und
 * trotzdem schreiben muessen:
 *   - das Anfrageformular, das eine Nachricht speichert
 *
 * Darf niemals in eine Client Component importiert werden. Der
 * Schluessel steht nur in einer serverseitigen Umgebungsvariable,
 * ohne NEXT_PUBLIC_-Praefix, und erreicht den Browser dadurch nie.
 */
export function supabaseDienst(): SupabaseClient | null {
  const url = supabaseAdresse();
  const schluessel = supabaseDienstSchluessel();

  if (!url || !schluessel) return null;

  return createClient(url, schluessel, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
