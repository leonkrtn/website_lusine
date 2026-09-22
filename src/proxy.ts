import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdresse, supabaseAnonSchluessel } from "@/lib/umgebung";

/**
 * Zugriffsschutz fuer den Admin-Bereich.
 *
 * Heisst in Next.js 16 `proxy` statt `middleware` und laeuft in der
 * Node-Laufzeit.
 *
 * Zwei Aufgaben:
 *   1. Die Anmeldung frisch halten. Server Components duerfen keine
 *      Cookies schreiben, darum muss die Erneuerung hier geschehen.
 *   2. Nicht angemeldete Zugriffe auf /admin zur Anmeldung schicken.
 *
 * Solange Supabase nicht eingerichtet ist, laeuft die Seite im
 * Vorschau-Modus: dann gibt es weder Anmeldung noch echte Daten, und
 * das Panel zeigt nur die Seed-Werke, an denen sich nichts aendern
 * laesst.
 */
export async function proxy(anfrage: NextRequest) {
  const url = supabaseAdresse();
  const schluessel = supabaseAnonSchluessel();

  if (!url || !schluessel) return NextResponse.next();

  let antwort = NextResponse.next({ request: anfrage });

  const client = createServerClient(url, schluessel, {
    cookies: {
      getAll() {
        return anfrage.cookies.getAll();
      },
      setAll(kekse) {
        for (const { name, value } of kekse) {
          anfrage.cookies.set(name, value);
        }
        antwort = NextResponse.next({ request: anfrage });
        for (const { name, value, options } of kekse) {
          antwort.cookies.set(name, value, options);
        }
      },
    },
  });

  // Erneuert die Anmeldung, falls noetig. Bewusst getUser() und nicht
  // getSession(): nur getUser() prueft das Token beim Auth-Server nach.
  const {
    data: { user },
  } = await client.auth.getUser();

  const pfad = anfrage.nextUrl.pathname;
  const istAdmin = pfad.startsWith("/admin");
  const istAnmeldung = pfad === "/admin/login";

  if (istAdmin && !istAnmeldung && !user) {
    const ziel = anfrage.nextUrl.clone();
    ziel.pathname = "/admin/login";
    // Nach der Anmeldung dorthin zurueck, wo man hinwollte.
    ziel.searchParams.set("weiter", pfad);
    return NextResponse.redirect(ziel);
  }

  // Wer angemeldet ist, braucht die Anmeldeseite nicht.
  if (istAnmeldung && user) {
    const ziel = anfrage.nextUrl.clone();
    ziel.pathname = "/admin";
    ziel.search = "";
    return NextResponse.redirect(ziel);
  }

  return antwort;
}

export const config = {
  /**
   * Nur dort laufen, wo es noetig ist. Statische Dateien und Bilder
   * durch die Anmeldepruefung zu schicken waere reine Verschwendung —
   * und auf einer bildlastigen Seite eine spuerbare.
   */
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|werke/.*\\.(?:jpg|png|webp|avif)|signaturen/.*\\.png|.*\\.(?:svg|ico)$).*)",
  ],
};
