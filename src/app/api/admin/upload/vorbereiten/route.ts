import { NextResponse } from "next/server";
import { angemeldeterBenutzer } from "@/lib/supabase/server";
import { hochladeAdresse } from "@/lib/r2";
import { speicherSchluessel } from "@/lib/bilder";
import { r2Konfiguriert } from "@/lib/umgebung";

/**
 * Schritt 1 des Hochladens: eine befristete Adresse besorgen.
 *
 * Der Browser laedt die Datei anschliessend unmittelbar nach R2. Der
 * Umweg ueber diesen Server entfaellt damit — er koennte ein
 * Gemaeldefoto in voller Aufloesung ohnehin nicht annehmen, weil
 * Serverless-Funktionen den Datenstrom auf wenige Megabyte begrenzen.
 */

const ERLAUBTE_TYPEN = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/tiff",
];

export async function POST(anfrage: Request) {
  const benutzer = await angemeldeterBenutzer();
  if (!benutzer) {
    return NextResponse.json({ fehler: "Nicht angemeldet." }, { status: 401 });
  }

  if (!r2Konfiguriert()) {
    return NextResponse.json(
      {
        fehler:
          "Der Bildspeicher ist noch nicht eingerichtet. Bitte die Cloudflare-Zugangsdaten in den Umgebungsvariablen hinterlegen.",
      },
      { status: 503 },
    );
  }

  let daten: { dateiname?: string; typ?: string; bereich?: string };
  try {
    daten = await anfrage.json();
  } catch {
    return NextResponse.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }

  const typ = String(daten.typ ?? "");
  if (!ERLAUBTE_TYPEN.includes(typ)) {
    return NextResponse.json(
      { fehler: "Dieses Dateiformat wird nicht unterstützt." },
      { status: 400 },
    );
  }

  const bereich = daten.bereich === "signaturen" ? "signaturen" : "werke";
  const praefix = speicherSchluessel(bereich, String(daten.dateiname ?? "bild"))
    // Der Schluessel in der Datenbank ist ein Praefix ohne Endung:
    // darunter liegen Ausgangsdatei und alle Groessenvarianten.
    .replace(/\.[^.]+$/, "");

  const endung = typ === "image/png" ? "png" : "jpg";
  const ablage = `${praefix}/original.${endung}`;

  const adresse = await hochladeAdresse(ablage, typ);
  if (!adresse) {
    return NextResponse.json(
      { fehler: "Die Hochladeadresse konnte nicht erzeugt werden." },
      { status: 500 },
    );
  }

  return NextResponse.json({ praefix, ablage, adresse });
}
