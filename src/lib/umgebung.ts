/**
 * Zentrale Stelle fuer alle Umgebungsvariablen.
 *
 * Die Seite muss in jedem Ausbauzustand lauffaehig sein: ohne Supabase,
 * ohne Bildspeicher, ohne E-Mail-Dienst. Jede Pruefung hier beantwortet die Frage
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

/**
 * Die Supabase-Adresse, geprueft und zurechtgerueckt — oder null.
 *
 * Eine Adresse wird von Hand aus einem Dashboard in ein Eingabefeld
 * kopiert, und dabei geht regelmaessig etwas schief: Anfuehrungszeichen
 * kommen mit, ein abschliessender Schraegstrich, ein Zeilenumbruch, oder
 * das `https://` fehlt.
 *
 * Frueher genuegte hier ein Test auf "nicht leer". Die Folge war ein
 * Produktionsbau, der mit "Invalid supabaseUrl" abbrach — aus dem
 * Fehlertext ging nicht hervor, dass eine Umgebungsvariable gemeint war.
 *
 * Darum wird die Adresse jetzt geradegezogen und geprueft. Was sich nicht
 * retten laesst, gilt als nicht eingerichtet: die Seite laeuft dann im
 * Demo-Modus weiter, statt den Bau zu sprengen.
 */
export function supabaseAdresse(): string | null {
  const roh = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!roh) return null;

  const geputzt = roh
    .trim()
    .replace(/^['"]|['"]$/g, "") // mitkopierte Anfuehrungszeichen
    .replace(/\/+$/, ""); // abschliessender Schraegstrich

  if (!geputzt) return null;

  // Ohne Protokoll ist es fuer Supabase keine Adresse. Da es ausnahmslos
  // https ist, laesst sich das ergaenzen statt daran zu scheitern.
  const mitProtokoll = /^https?:\/\//i.test(geputzt)
    ? geputzt
    : `https://${geputzt}`;

  try {
    const geprueft = new URL(mitProtokoll);

    if (geprueft.protocol !== "https:" && geprueft.protocol !== "http:") {
      return null;
    }

    // `new URL` ist sehr nachsichtig und nimmt auch "!!!" als Rechnernamen
    // an. Eine Supabase-Adresse hat aber immer einen Punkt im Namen —
    // entweder die Projektadresse oder eine eigene Domain. Ohne Punkt ist
    // es kein Versehen mehr, sondern ein Platzhalter oder Tippfehler.
    const name = geprueft.hostname;
    const istOertlich = name === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(name);
    if (!istOertlich && !name.includes(".")) return null;

    return geprueft.origin;
  } catch {
    return null;
  }
}

/** Der oeffentliche Schluessel, ohne mitkopierte Anfuehrungszeichen. */
export function supabaseAnonSchluessel(): string | null {
  const roh = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!roh) return null;

  const geputzt = roh.trim().replace(/^['"]|['"]$/g, "");
  return geputzt || null;
}

/** Der Dienstschluessel, ohne mitkopierte Anfuehrungszeichen. */
export function supabaseDienstSchluessel(): string | null {
  const roh = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!roh) return null;

  const geputzt = roh.trim().replace(/^['"]|['"]$/g, "");
  return geputzt || null;
}

/** Ist Supabase angeschlossen? Sonst kommen die Daten aus den Seed-Dateien. */
export function supabaseKonfiguriert(): boolean {
  return Boolean(supabaseAdresse() && supabaseAnonSchluessel());
}

/** Darf der Server schreibend auf Supabase zugreifen? */
export function supabaseDienstschluesselVorhanden(): boolean {
  return Boolean(supabaseAdresse() && supabaseDienstSchluessel());
}

/**
 * Koennen Bilder abgelegt werden?
 *
 * Der Bildspeicher gehoert zum selben Supabase-Projekt wie die
 * Werkdaten. Es gibt darum nichts Eigenes einzurichten und nichts
 * Eigenes, das ausfallen koennte — wer die Datenbank hat, hat auch den
 * Speicher. Voraussetzung ist allein, dass supabase/02_speicher.sql
 * eingespielt wurde.
 */
export function speicherKonfiguriert(): boolean {
  return supabaseKonfiguriert();
}

/** Liest eine Variable ohne mitkopierte Anfuehrungszeichen — oder null. */
function geputzt(roh: string | undefined): string | null {
  if (!roh) return null;
  return roh.trim().replace(/^['"]|['"]$/g, "") || null;
}

/** Der Resend-Schluessel. Ohne ihn wird keine E-Mail verschickt. */
export function resendSchluessel(): string | null {
  return geputzt(process.env.RESEND_API_KEY);
}

/**
 * Absender aller E-Mails. Die Domain muss bei Resend verifiziert sein;
 * luart.online ist es.
 */
export function emailAbsender(): string {
  return geputzt(process.env.EMAIL_ABSENDER) ?? "LUART <atelier@luart.online>";
}

/** Wohin die Meldung ueber eine neue Anfrage geht. */
export function emailAtelier(): string | null {
  return geputzt(process.env.EMAIL_ATELIER);
}

/** Bekommt die anfragende Person eine Eingangsbestaetigung? */
export function resendKonfiguriert(): boolean {
  return Boolean(resendSchluessel());
}

/** Erfaehrt das Atelier per E-Mail von einer neuen Anfrage? */
export function ateliermeldungKonfiguriert(): boolean {
  return Boolean(resendSchluessel() && emailAtelier());
}

/**
 * Demo-Modus: solange Supabase fehlt oder unbrauchbar eingetragen ist,
 * zeigt die Seite die Seed-Werke. Damit laesst sich das gesamte Frontend
 * beurteilen, bevor ein einziges Konto angelegt ist — und ein Vertipper
 * in einer Umgebungsvariable legt nicht die ganze Seite lahm.
 */
export function demoModus(): boolean {
  return !supabaseKonfiguriert();
}
