"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAdresse, supabaseAnonSchluessel } from "@/lib/umgebung";

/**
 * Supabase-Client fuer den Browser. Wird nur im Admin-Bereich benutzt,
 * ausschliesslich fuer An- und Abmeldung. Alle Datenaenderungen laufen
 * ueber Server Actions — so liegt die Pruefung immer auf dem Server.
 */
export function supabaseBrowser() {
  return createBrowserClient(
    supabaseAdresse() ?? "",
    supabaseAnonSchluessel() ?? "",
  );
}
