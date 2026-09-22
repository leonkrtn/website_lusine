import { supabaseServer } from "@/lib/supabase/server";
import { BEHAELTER } from "@/lib/bilder";

/**
 * Der Bildspeicher.
 *
 * Liegt bei Supabase, im selben Projekt wie die Werkdaten. Ein zweiter
 * Anbieter waere hier nur ein zweites Konto, ein zweiter Satz
 * Zugangsdaten und ein zweiter Ort, an dem etwas ausfallen kann.
 *
 * Aufbau im Speicher — jeder Schluessel ist ein Ordner, kein Dateiname:
 *
 *   werke/das-zimmer-ab12cd/original.jpg
 *   werke/das-zimmer-ab12cd/0640.avif
 *   werke/das-zimmer-ab12cd/0640.webp
 *   werke/das-zimmer-ab12cd/0640.jpg
 *   werke/das-zimmer-ab12cd/1080.avif
 *   …
 *
 * Jeder Schluessel traegt eine Zufallskennung. Ein Bild unter einer
 * bestimmten Adresse aendert sich damit nie, und jeder Zwischenspeicher
 * auf dem Weg darf es behalten.
 */

/** Legt eine Datei ab. Ueberschreibt eine gleichnamige. */
export async function ladeHoch(
  pfad: string,
  inhalt: Buffer,
  typ: string,
): Promise<void> {
  const client = await supabaseServer();

  const { error } = await client.storage.from(BEHAELTER).upload(pfad, inhalt, {
    contentType: typ,
    upsert: true,
    // Die Schluessel tragen eine Zufallskennung, ein Bild unter einer
    // Adresse aendert sich also nie.
    cacheControl: "31536000",
  });

  if (error) throw new Error(`Hochladen fehlgeschlagen: ${error.message}`);
}

/** Holt eine Datei zurueck, etwa um Varianten daraus zu erzeugen. */
export async function holeObjekt(pfad: string): Promise<Buffer | null> {
  const client = await supabaseServer();

  const { data, error } = await client.storage.from(BEHAELTER).download(pfad);
  if (error || !data) return null;

  return Buffer.from(await data.arrayBuffer());
}

/**
 * Loescht ein Bild samt aller seiner Varianten.
 *
 * Der Schluessel ist ein Ordner wie "werke/das-zimmer-ab12cd"; darunter
 * liegen Ausgangsdatei und alle Groessen.
 */
export async function loescheBild(praefix: string): Promise<void> {
  const client = await supabaseServer();

  const { data, error } = await client.storage.from(BEHAELTER).list(praefix);
  if (error || !data || data.length === 0) return;

  await client.storage
    .from(BEHAELTER)
    .remove(data.map((eintrag) => `${praefix}/${eintrag.name}`));
}
