import { NextResponse } from "next/server";
import { angemeldeterBenutzer, supabaseServer } from "@/lib/supabase/server";
import { holeObjekt, ladeHoch } from "@/lib/speicher";
import {
  erzeugeSignaturVarianten,
  erzeugeVarianten,
  messeHintergrund,
  ziehAufReinweiss,
} from "@/lib/varianten";

/**
 * Schritt 2 des Hochladens: pruefen, umrechnen, eintragen.
 *
 * Hier entscheidet sich, ob der rahmenlose Grundsatz der Seite haelt.
 * Das Bild wird an den Raendern gemessen; liegt der Hintergrund nicht
 * auf reinem Weiss, wird er auf Wunsch dorthin gezogen. Erst danach
 * entstehen die Groessenvarianten — sonst traegt jede einzelne den
 * Farbstich weiter.
 */

// AVIF zu erzeugen ist rechenintensiv. Fuenf Breiten in drei Formaten
// brauchen je nach Ausgangsgroesse bis zu einer halben Minute.
export const maxDuration = 60;

export async function POST(anfrage: Request) {
  const benutzer = await angemeldeterBenutzer();
  if (!benutzer) {
    return NextResponse.json({ fehler: "Nicht angemeldet." }, { status: 401 });
  }

  let daten: {
    praefix?: string;
    ablage?: string;
    werkId?: string;
    art?: string;
    altText?: string;
    weissKorrigieren?: boolean;
  };

  try {
    daten = await anfrage.json();
  } catch {
    return NextResponse.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }

  const praefix = String(daten.praefix ?? "");
  const ablage = String(daten.ablage ?? "");
  const werkId = String(daten.werkId ?? "");
  const art = daten.art === "haupt" ? "haupt" : daten.art === "signatur" ? "signatur" : "detail";

  if (!praefix || !ablage || !werkId) {
    return NextResponse.json({ fehler: "Angaben unvollständig." }, { status: 400 });
  }

  // Nur eigene Schluessel verarbeiten. Der Browser bestimmt den Pfad,
  // also wird er hier gegen das erwartete Muster geprueft — sonst liesse
  // sich ueber diese Schnittstelle an beliebige Stellen im Speicher
  // schreiben.
  if (!/^(werke|signaturen)\/[a-z0-9-]+$/.test(praefix) || !ablage.startsWith(`${praefix}/`)) {
    return NextResponse.json({ fehler: "Ungültiger Schlüssel." }, { status: 400 });
  }

  const original = await holeObjekt(ablage);
  if (!original) {
    return NextResponse.json(
      { fehler: "Die hochgeladene Datei wurde nicht gefunden." },
      { status: 404 },
    );
  }

  const client = await supabaseServer();

  // --- Signatur ------------------------------------------------------------
  // Sie ist eine freigestellte Grafik und wird nicht weissabgeglichen:
  // ihre Transparenz ist genau das, was sie ausmacht.
  if (art === "signatur") {
    const { varianten } = await erzeugeSignaturVarianten(original, praefix);

    for (const variante of varianten) {
      await ladeHoch(variante.schluessel, variante.puffer, variante.typ);
    }

    const { error } = await client
      .from("werke")
      .update({ signatur_schluessel: praefix })
      .eq("id", werkId);

    if (error) {
      return NextResponse.json({ fehler: error.message }, { status: 500 });
    }

    return NextResponse.json({ erfolg: true, schluessel: praefix });
  }

  // --- Gemaelde ------------------------------------------------------------
  const befund = await messeHintergrund(original);

  const verwendet =
    daten.weissKorrigieren && !befund.istReinweiss
      ? await ziehAufReinweiss(original, befund)
      : original;

  const { varianten, breitePx, hoehePx } = await erzeugeVarianten(
    verwendet,
    praefix,
  );

  for (const variante of varianten) {
    await ladeHoch(variante.schluessel, variante.puffer, variante.typ);
  }

  // Ein Werk hat genau ein Hauptbild. Wird ein neues bestimmt, werden
  // die bisherigen zu Detailaufnahmen.
  if (art === "haupt") {
    await client
      .from("werk_bilder")
      .update({ art: "detail" })
      .eq("werk_id", werkId)
      .eq("art", "haupt");
  }

  const { data: vorhandene } = await client
    .from("werk_bilder")
    .select("sortierung")
    .eq("werk_id", werkId)
    .order("sortierung", { ascending: false })
    .limit(1);

  const naechsteSortierung =
    art === "haupt" ? 0 : Number(vorhandene?.[0]?.sortierung ?? 0) + 1;

  const { error } = await client.from("werk_bilder").insert({
    werk_id: werkId,
    schluessel: praefix,
    art,
    alt_text: String(daten.altText ?? ""),
    breite_px: breitePx,
    hoehe_px: hoehePx,
    sortierung: naechsteSortierung,
  });

  if (error) {
    return NextResponse.json({ fehler: error.message }, { status: 500 });
  }

  return NextResponse.json({
    erfolg: true,
    schluessel: praefix,
    breitePx,
    hoehePx,
    befund: {
      istReinweiss: befund.istReinweiss,
      istKorrigierbar: befund.istKorrigierbar,
      abweichung: befund.abweichung,
      gemessen: befund.gemessen,
      korrigiert: Boolean(daten.weissKorrigieren && !befund.istReinweiss),
    },
  });
}
