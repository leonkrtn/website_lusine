/**
 * Zentrale Stelle fuer alle Umgebungsvariablen.
 *
 * Die Seite muss in jedem Ausbauzustand lauffaehig sein: ohne Supabase,
 * ohne Cloudflare, ohne E-Mail-Dienst. Jede Pruefung hier beantwortet die Frage
 * "ist dieser Baustein schon angeschlossen?" — der Rest des Codes
 * entscheidet daran, ob er echte Daten nutzt oder den Demo-Modus.
 */

export function seitenUrl(): string {
  const gesetzt = process.env.NEXT_PUBLIC_SEITEN_URL?.replace(/\/$/, "");
  if (gesetzt) return gesetzt;

  // Auf Vercel steht die Adresse automatisch bereit.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

/** Ist Supabase angeschlossen? Sonst kommen die Daten aus den Seed-Dateien. */
export function supabaseKonfiguriert(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Darf der Server schreibend auf Supabase zugreifen? */
export function supabaseDienstschluesselVorhanden(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** Liefert der Cloudflare Worker die Bilder aus? */
export function bildWorkerKonfiguriert(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_BILD_BASIS_URL);
}

/** Ist der R2-Speicher fuer Uploads eingerichtet? */
export function r2Konfiguriert(): boolean {
  return Boolean(
    process.env.R2_KONTO_ID &&
      process.env.R2_ZUGRIFFSSCHLUESSEL_ID &&
      process.env.R2_GEHEIMER_SCHLUESSEL &&
      process.env.R2_BUCKET,
  );
}

/** Koennen E-Mails verschickt werden? */
export function resendKonfiguriert(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_ATELIER);
}

/**
 * Demo-Modus: solange Supabase fehlt, zeigt die Seite die Seed-Werke.
 * Damit laesst sich das gesamte Frontend beurteilen, bevor ein einziges
 * Konto angelegt ist.
 */
export function demoModus(): boolean {
  return !supabaseKonfiguriert();
}
