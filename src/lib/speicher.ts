import { supabaseServer } from "@/lib/supabase/server";
import { BEHAELTER } from "@/lib/bilder";

/**
 * Der Bildspeicher.
 *
 * Liegt bei Supabase, im selben Projekt wie die Werkdaten. Ein zweiter
 * Anbieter waere hier nur ein zweites Konto, ein zweiter Satz
 * Zugangsdaten und ein zweiter Ort, an dem etwas ausfallen kann.
 *
 * Aufbau im Speicher — eine Datei je Bild, unveraendert so abgelegt,
 * wie sie hochgeladen wurde:
 *
 *   werke/das-zimmer-ab12cd.jpg
 *   signaturen/das-zimmer-xy34ef.png
 *
 * Jeder Schluessel traegt eine Zufallskennung. Ein Bild unter einer
 * bestimmten Adresse aendert sich damit nie, und jeder Zwischenspeicher
 * auf dem Weg darf es behalten.
 *
 * Hochgeladen wird nicht hier, sondern unmittelbar aus dem Browser
 * unter der Anmeldung der laufenden Sitzung (siehe
 * components/admin/Bilderverwaltung.tsx). Diese Datei kuemmert sich nur
 * um das Aufraeumen, das serverseitig geschehen muss.
 */

/** Loescht eine Bilddatei. */
export async function loescheBild(pfad: string): Promise<void> {
  const client = await supabaseServer();
  await client.storage.from(BEHAELTER).remove([pfad]);
}
