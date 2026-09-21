import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client fuer oeffentliche, nicht benutzerbezogene Lesezugriffe.
 *
 * Anders als `supabaseServer()` liest dieser Client keine Request-Cookies.
 * Er kann daher auch beim Produktionsbau verwendet werden, etwa in
 * `generateStaticParams`. Die Leserechte fuer diese Daten sind in der
 * Datenbank explizit fuer die `anon`-Rolle freigegeben.
 */
export function supabaseOeffentlich(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const schluessel = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !schluessel) return null;

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
  const keksdose = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  );
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
