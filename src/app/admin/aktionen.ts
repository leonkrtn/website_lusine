"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer, angemeldeterBenutzer } from "@/lib/supabase/server";
import { loescheBild } from "@/lib/speicher";
import { demoModus } from "@/lib/umgebung";
import { zuCent, zuSlug, type FormZustand } from "@/lib/adminzustand";
import { WERK_STATUS } from "@/lib/typen";

/**
 * Alle schreibenden Vorgaenge des Admin-Bereichs.
 *
 * Jede einzelne Funktion prueft zuerst die Anmeldung. Der Schutz im
 * proxy allein genuegt nicht: eine Server Action ist eine eigene
 * Adresse, die sich direkt aufrufen laesst, ohne je eine geschuetzte
 * Seite besucht zu haben.
 */

/** Wirft, wenn niemand angemeldet ist. */
async function stelleSicherAngemeldet(): Promise<void> {
  if (demoModus()) {
    throw new Error(
      "Vorschau-Modus: ohne Datenbank lässt sich nichts speichern.",
    );
  }

  const benutzer = await angemeldeterBenutzer();
  if (!benutzer) throw new Error("Nicht angemeldet.");
}

/** Faengt die Pruefung ab und macht daraus eine lesbare Rueckmeldung. */
function alsFehler(fehler: unknown): FormZustand {
  const text =
    fehler instanceof Error ? fehler.message : "Etwas ist schiefgelaufen.";
  return { erfolg: false, meldung: null, fehler: text };
}

/** Die Seiten, die sich nach einer Aenderung erneuern muessen. */
function erneuereOeffentlich(werkSlug?: string, serieSlug?: string): void {
  revalidatePath("/");
  revalidatePath("/werke");
  revalidatePath("/serien");
  if (werkSlug) revalidatePath(`/werke/${werkSlug}`);
  if (serieSlug) revalidatePath(`/serien/${serieSlug}`);
  revalidatePath("/admin/werke");
  revalidatePath("/sitemap.xml");
}

// ---------------------------------------------------------------------------
//  Werke
// ---------------------------------------------------------------------------

const WerkSchema = z.object({
  titel: z.string().trim().min(1, "Ein Werk braucht einen Titel."),
  slug: z.string().trim().optional(),
  jahr: z.string().trim().optional(),
  serieId: z.string().trim().optional(),
  geschichte: z.string().optional(),
  zitat: z.string().optional(),
  technik: z.string().optional(),
  material: z.string().optional(),
  breiteCm: z.string().optional(),
  hoeheCm: z.string().optional(),
  tiefeCm: z.string().optional(),
  editionInfo: z.string().optional(),
  preis: z.string().optional(),
  versand: z.string().optional(),
  status: z.enum(WERK_STATUS),
});

function zahlOderNull(eingabe: string | undefined): number | null {
  if (!eingabe?.trim()) return null;
  const zahl = Number(eingabe.trim().replace(",", "."));
  return Number.isFinite(zahl) ? zahl : null;
}

export async function speichereWerk(
  _zustand: FormZustand,
  formular: FormData,
): Promise<FormZustand> {
  try {
    await stelleSicherAngemeldet();
  } catch (fehler) {
    return alsFehler(fehler);
  }

  const id = String(formular.get("id") ?? "").trim();

  const geprueft = WerkSchema.safeParse({
    titel: formular.get("titel"),
    slug: formular.get("slug"),
    jahr: formular.get("jahr"),
    serieId: formular.get("serieId"),
    geschichte: formular.get("geschichte"),
    zitat: formular.get("zitat"),
    technik: formular.get("technik"),
    material: formular.get("material"),
    breiteCm: formular.get("breiteCm"),
    hoeheCm: formular.get("hoeheCm"),
    tiefeCm: formular.get("tiefeCm"),
    editionInfo: formular.get("editionInfo"),
    preis: formular.get("preis"),
    versand: formular.get("versand"),
    status: formular.get("status"),
  });

  if (!geprueft.success) {
    return {
      erfolg: false,
      meldung: null,
      fehler: geprueft.error.issues[0]?.message ?? "Eingabe unvollständig.",
    };
  }

  const d = geprueft.data;
  const slug = d.slug?.trim() ? zuSlug(d.slug) : zuSlug(d.titel);

  const datensatz = {
    titel: d.titel,
    slug,
    jahr: zahlOderNull(d.jahr),
    serie_id: d.serieId || null,
    geschichte: d.geschichte ?? "",
    zitat: d.zitat?.trim() || null,
    technik: d.technik ?? "",
    material: d.material?.trim() || null,
    breite_cm: zahlOderNull(d.breiteCm),
    hoehe_cm: zahlOderNull(d.hoeheCm),
    tiefe_cm: zahlOderNull(d.tiefeCm),
    ist_unikat: formular.get("istUnikat") === "ja",
    edition_info: d.editionInfo?.trim() || null,
    preis_cent: zuCent(d.preis ?? ""),
    versand_cent: zuCent(d.versand ?? "") ?? 0,
    status: d.status,
    anfrage_erlaubt: formular.get("anfrageErlaubt") === "ja",
    auf_startseite: formular.get("aufStartseite") === "ja",
    startseite_sortierung: zahlOderNull(String(formular.get("startseiteSortierung") ?? "")) ?? 0,
    sortierung: zahlOderNull(String(formular.get("sortierung") ?? "")) ?? 0,
  };

  const client = await supabaseServer();

  if (id) {
    const { error } = await client.from("werke").update(datensatz).eq("id", id);
    if (error) {
      return {
        erfolg: false,
        meldung: null,
        fehler:
          error.code === "23505"
            ? "Diese Adresse ist schon vergeben. Bitte eine andere wählen."
            : error.message,
      };
    }

    erneuereOeffentlich(slug);
    revalidatePath(`/admin/werke/${id}`);
    return { erfolg: true, meldung: "Gespeichert.", fehler: null };
  }

  const { data, error } = await client
    .from("werke")
    .insert(datensatz)
    .select("id")
    .single();

  if (error || !data) {
    return {
      erfolg: false,
      meldung: null,
      fehler:
        error?.code === "23505"
          ? "Diese Adresse ist schon vergeben. Bitte eine andere wählen."
          : (error?.message ?? "Das Werk konnte nicht angelegt werden."),
    };
  }

  erneuereOeffentlich(slug);
  // Gleich weiter zum Bearbeiten: dort werden die Bilder hochgeladen.
  redirect(`/admin/werke/${data.id}?neu=1`);
}

export async function loescheWerk(formular: FormData): Promise<void> {
  await stelleSicherAngemeldet();

  const id = String(formular.get("id") ?? "");
  if (!id) return;

  const client = await supabaseServer();

  // Erst die Bilder aus dem Speicher raeumen, dann den Datensatz. Die
  // umgekehrte Reihenfolge wuerde verwaiste Dateien hinterlassen, die
  // niemand mehr zuordnen kann.
  const { data: bilder } = await client
    .from("werk_bilder")
    .select("schluessel")
    .eq("werk_id", id);

  const { data: werk } = await client
    .from("werke")
    .select("slug, signatur_schluessel")
    .eq("id", id)
    .maybeSingle();

  for (const bild of bilder ?? []) {
    const schluessel = String(bild.schluessel ?? "");
    if (schluessel && !schluessel.startsWith("/")) await loescheBild(schluessel);
  }

  const signatur = werk?.signatur_schluessel;
  if (signatur && !String(signatur).startsWith("/")) {
    await loescheBild(String(signatur));
  }

  await client.from("werke").delete().eq("id", id);

  erneuereOeffentlich(werk?.slug ? String(werk.slug) : undefined);
  redirect("/admin/werke");
}

// ---------------------------------------------------------------------------
//  Serien
// ---------------------------------------------------------------------------

export async function speichereSerie(
  _zustand: FormZustand,
  formular: FormData,
): Promise<FormZustand> {
  try {
    await stelleSicherAngemeldet();
  } catch (fehler) {
    return alsFehler(fehler);
  }

  const id = String(formular.get("id") ?? "").trim();
  const titel = String(formular.get("titel") ?? "").trim();

  if (!titel) {
    return { erfolg: false, meldung: null, fehler: "Eine Serie braucht einen Titel." };
  }

  const slugEingabe = String(formular.get("slug") ?? "").trim();
  const slug = slugEingabe ? zuSlug(slugEingabe) : zuSlug(titel);

  const datensatz = {
    titel,
    slug,
    jahr: zahlOderNull(String(formular.get("jahr") ?? "")),
    einleitung: String(formular.get("einleitung") ?? ""),
    sortierung: zahlOderNull(String(formular.get("sortierung") ?? "")) ?? 0,
  };

  const client = await supabaseServer();

  const { error } = id
    ? await client.from("serien").update(datensatz).eq("id", id)
    : await client.from("serien").insert(datensatz);

  if (error) {
    return {
      erfolg: false,
      meldung: null,
      fehler:
        error.code === "23505"
          ? "Diese Adresse ist schon vergeben."
          : error.message,
    };
  }

  erneuereOeffentlich(undefined, slug);
  revalidatePath("/admin/serien");
  return { erfolg: true, meldung: "Gespeichert.", fehler: null };
}

export async function loescheSerie(formular: FormData): Promise<void> {
  await stelleSicherAngemeldet();

  const id = String(formular.get("id") ?? "");
  if (!id) return;

  // Die Werke bleiben erhalten und verlieren nur ihre Zuordnung —
  // dafuer sorgt "on delete set null" im Schema.
  const client = await supabaseServer();
  await client.from("serien").delete().eq("id", id);

  erneuereOeffentlich();
  revalidatePath("/admin/serien");
}

// ---------------------------------------------------------------------------
//  Freie Texte
// ---------------------------------------------------------------------------

const TEXT_SCHLUESSEL = [
  "startseiteAuftakt",
  "startseiteZitat",
  "startseiteAbschluss",
  "ueberUeberschrift",
  "ueberText",
  "kontaktText",
] as const;

export async function speichereTexte(
  _zustand: FormZustand,
  formular: FormData,
): Promise<FormZustand> {
  try {
    await stelleSicherAngemeldet();
  } catch (fehler) {
    return alsFehler(fehler);
  }

  const zeilen = TEXT_SCHLUESSEL.map((schluessel) => ({
    schluessel,
    wert: String(formular.get(schluessel) ?? ""),
  }));

  const client = await supabaseServer();
  const { error } = await client
    .from("seiten_texte")
    .upsert(zeilen, { onConflict: "schluessel" });

  if (error) {
    return { erfolg: false, meldung: null, fehler: error.message };
  }

  revalidatePath("/");
  revalidatePath("/ueber");
  revalidatePath("/kontakt");
  return { erfolg: true, meldung: "Texte gespeichert.", fehler: null };
}

// ---------------------------------------------------------------------------
//  Anfragen
// ---------------------------------------------------------------------------

export async function setzeAnfragestatus(formular: FormData): Promise<void> {
  await stelleSicherAngemeldet();

  const id = String(formular.get("id") ?? "");
  const status = String(formular.get("status") ?? "");
  if (!id || !status) return;

  const client = await supabaseServer();
  await client.from("anfragen").update({ status }).eq("id", id);

  revalidatePath("/admin/anfragen");
  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
//  Bilder
// ---------------------------------------------------------------------------

/**
 * Traegt ein hochgeladenes Bild beim Werk ein.
 *
 * Die Datei liegt zu diesem Zeitpunkt bereits im Speicher — der Browser
 * hat sie unmittelbar dorthin geschickt. Hier wird nur noch vermerkt,
 * dass sie zu diesem Werk gehoert.
 *
 * Die Masse kommen aus dem Browser, der sie vor dem Hochladen aus der
 * Datei gelesen hat. Sie werden gebraucht, damit der Browser spaeter
 * den Platz fuer das Bild reservieren kann und die Seite beim Laden
 * nicht springt.
 */
export async function speichereBild(formular: FormData): Promise<void> {
  await stelleSicherAngemeldet();

  const werkId = String(formular.get("werkId") ?? "");
  const schluessel = String(formular.get("schluessel") ?? "");
  const artEingabe = String(formular.get("art") ?? "detail");
  const breitePx = Number(formular.get("breitePx") ?? 0) || 0;
  const hoehePx = Number(formular.get("hoehePx") ?? 0) || 0;
  const altText = String(formular.get("altText") ?? "");

  if (!werkId || !schluessel) return;

  // Nur eigene Schluessel annehmen. Der Browser bestimmt den Pfad, also
  // wird er hier gegen das erwartete Muster geprueft.
  if (!/^(werke|signaturen)\/[a-z0-9-]+\.[a-z0-9]{2,5}$/.test(schluessel)) {
    throw new Error("Ungültiger Schlüssel.");
  }

  const client = await supabaseServer();

  // --- Signatur ----------------------------------------------------------
  if (artEingabe === "signatur") {
    await client
      .from("werke")
      .update({ signatur_schluessel: schluessel })
      .eq("id", werkId);

    erneuereOeffentlich();
    revalidatePath(`/admin/werke/${werkId}`);
    return;
  }

  const art = artEingabe === "haupt" ? "haupt" : "detail";

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
    schluessel,
    art,
    alt_text: altText,
    breite_px: breitePx,
    hoehe_px: hoehePx,
    sortierung: naechsteSortierung,
  });

  if (error) throw new Error(error.message);

  erneuereOeffentlich();
  revalidatePath(`/admin/werke/${werkId}`);
}

export async function entferneBild(formular: FormData): Promise<void> {
  await stelleSicherAngemeldet();

  const bildId = String(formular.get("bildId") ?? "");
  const werkId = String(formular.get("werkId") ?? "");
  if (!bildId) return;

  const client = await supabaseServer();

  const { data } = await client
    .from("werk_bilder")
    .select("schluessel")
    .eq("id", bildId)
    .maybeSingle();

  await client.from("werk_bilder").delete().eq("id", bildId);

  const schluessel = data?.schluessel ? String(data.schluessel) : "";
  if (schluessel && !schluessel.startsWith("/")) await loescheBild(schluessel);

  erneuereOeffentlich();
  if (werkId) revalidatePath(`/admin/werke/${werkId}`);
}

export async function entferneSignatur(formular: FormData): Promise<void> {
  await stelleSicherAngemeldet();

  const werkId = String(formular.get("werkId") ?? "");
  if (!werkId) return;

  const client = await supabaseServer();

  const { data } = await client
    .from("werke")
    .select("signatur_schluessel")
    .eq("id", werkId)
    .maybeSingle();

  await client
    .from("werke")
    .update({ signatur_schluessel: null })
    .eq("id", werkId);

  const schluessel = data?.signatur_schluessel
    ? String(data.signatur_schluessel)
    : "";
  if (schluessel && !schluessel.startsWith("/")) await loescheBild(schluessel);

  erneuereOeffentlich();
  revalidatePath(`/admin/werke/${werkId}`);
}

// ---------------------------------------------------------------------------
//  Abmelden
// ---------------------------------------------------------------------------

export async function abmelden(): Promise<void> {
  const client = await supabaseServer();
  await client.auth.signOut();
  redirect("/admin/login");
}
