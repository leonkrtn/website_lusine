"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase-Client fuer den Browser. Wird nur im Admin-Bereich benutzt,
 * ausschliesslich fuer An- und Abmeldung. Alle Datenaenderungen laufen
 * ueber Server Actions — so liegt die Pruefung immer auf dem Server.
 */
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
