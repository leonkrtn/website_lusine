import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdresse, supabaseAnonSchluessel } from "@/lib/umgebung";

/**
 * Client fuer oeffentliche, nicht benutzerbezogene Lesezugriffe.
 *
 * Anders als `supabaseServer()` liest dieser Client keine Request-Cookies.
 * Das ist hier kein Verzicht, sondern der Punkt: die Galerie zeigt allen
 * Besuchern dasselbe. Wer sie ueber den Cookie-Client liest, macht jede
 * Seite von einem Request abhaengig — Next.js kann sie dann nicht mehr
 * beim Bauen vorrendern, und jeder Aufruf kostet eine Datenbankabfrage.
 *
 * Darum lesen alle oeffentlichen Seiten hierueber, und der Cookie-Client
 * bleibt dem Admin-Bereich vorbehalten, wo die Anmeldung zaehlt.
 *
 * Die Leserechte dafuer sind in der Datenbank ausdruecklich fuer die
 * `anon`-Rolle freigegeben (siehe supabase/01_schema.sql).
 */
export function supabaseOeffentlich(): SupabaseClient {
  const url = supabaseAdresse();
  const schluessel = supabaseAnonSchluessel();

  if (!url || !schluessel) {
    throw new Error(
      "Supabase ist nicht brauchbar eingerichtet: NEXT_PUBLIC_SUPABASE_URL " +
        "oder NEXT_PUBLIC_SUPABASE_ANON_KEY fehlt oder ist keine gültige Adresse.",
    );
  }

  return createClient(url, schluessel, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Supabase-Client fuer Server Components, Server Actions und Route
 * Handler. Die Anmeldung steckt in Cookies, die dieser Client liest
 * und — wo erlaubt — auch erneuert.
 *
 * In Next.js 16 ist `cookies()` asynchron, darum ist die ganze
 * Funktion asynchron.
 */
export async function supabaseServer(): Promise<SupabaseClient> {
  const url = supabaseAdresse();
  const schluessel = supabaseAnonSchluessel();

  // Sollte nie eintreten: jeder Aufrufer prueft vorher `demoModus()`.
  // Die Meldung nennt trotzdem die Ursache, weil die von Supabase
  // ("Invalid supabaseUrl") nicht erkennen laesst, dass eine
  // Umgebungsvariable gemeint ist.
  if (!url || !schluessel) {
    throw new Error(
      "Supabase ist nicht brauchbar eingerichtet: NEXT_PUBLIC_SUPABASE_URL " +
        "oder NEXT_PUBLIC_SUPABASE_ANON_KEY fehlt oder ist keine gültige Adresse.",
    );
  }

  const keksdose = await cookies();

  return createServerClient(url, schluessel, {
      cookies: {
        getAll() {
          return keksdose.getAll();
        },
        setAll(kekse) {
          try {
            for (const { name, value, options } of kekse) {
              keksdose.set(name, value, options);
            }
          } catch {
            // In Server Components laesst sich nicht schreiben. Das ist
            // unkritisch: die Aktualisierung der Anmeldung uebernimmt
            // dann die Proxy-Schicht (siehe proxy.ts).
          }
        },
    },
  });
}

/**
 * Der angemeldete Benutzer, oder null.
 *
 * Bewusst `getUser()` und nicht `getSession()`: nur `getUser()` prueft
 * das Token beim Auth-Server nach. Ein Session-Cookie allein laesst
 * sich faelschen und darf nie als Zugangsnachweis genuegen.
 */
export async function angemeldeterBenutzer() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const client = await supabaseServer();
  const { data, error } = await client.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}
