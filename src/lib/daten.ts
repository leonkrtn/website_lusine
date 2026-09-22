import { unstable_rethrow } from "next/navigation";
import { supabaseOeffentlich, supabaseServer } from "@/lib/supabase/server";
import { demoModus } from "@/lib/umgebung";
import { SERIEN_SEED } from "@/data/serien";
import { WERKE_SEED } from "@/data/werke";
import {
  TEXTE_STANDARD,
  type Anfrage,
  type SeitenTexte,
  type Serie,
  type Werk,
  type WerkBild,
  type WerkMitSerie,
} from "@/lib/typen";

/**
 * Die einzige Stelle, an der Daten gelesen werden.
 *
 * Jede Funktion beantwortet dieselbe Frage zweimal: einmal aus Supabase,
 * einmal aus den Seed-Dateien. Welcher Weg genommen wird, entscheidet
 * allein `demoModus()`. Dadurch laeuft die gesamte Seite vollstaendig,
 * bevor ein einziges Konto angelegt ist — und der Umstieg auf echte
 * Daten aendert keine einzige Zeile in den Seiten.
 */

// ---------------------------------------------------------------------------
//  Uebersetzung Datenbank -> Anwendung
// ---------------------------------------------------------------------------

type Zeile = Record<string, unknown>;

function zuZahl(wert: unknown): number | null {
  if (wert === null || wert === undefined || wert === "") return null;
  const zahl = Number(wert);
  return Number.isFinite(zahl) ? zahl : null;
}

/**
 * Laesst nur eine sechsstellige Hexfarbe durch.
 *
 * Der Wert wird als CSS-Variable ins Markup geschrieben. Was von dort
 * in ein `style`-Attribut wandert, muss geprueft sein — auch wenn im
 * Admin nur Lusine schreibt.
 */
function istHexfarbe(wert: unknown): boolean {
  return typeof wert === "string" && /^#[0-9a-fA-F]{6}$/.test(wert);
}

function zuSerie(zeile: Zeile): Serie {
  return {
    id: String(zeile.id),
    slug: String(zeile.slug),
    titel: String(zeile.titel ?? ""),
    jahr: zuZahl(zeile.jahr),
    einleitung: String(zeile.einleitung ?? ""),
    sortierung: zuZahl(zeile.sortierung) ?? 0,
  };
}

function zuBild(zeile: Zeile): WerkBild {
  return {
    id: String(zeile.id),
    schluessel: String(zeile.schluessel ?? ""),
    art: zeile.art === "haupt" ? "haupt" : "detail",
    altText: String(zeile.alt_text ?? ""),
    breitePx: zuZahl(zeile.breite_px) ?? 0,
    hoehePx: zuZahl(zeile.hoehe_px) ?? 0,
    sortierung: zuZahl(zeile.sortierung) ?? 0,
  };
}

function zuWerk(zeile: Zeile): Werk {
  const rohbilder = Array.isArray(zeile.werk_bilder)
    ? (zeile.werk_bilder as Zeile[])
    : [];

  return {
    id: String(zeile.id),
    slug: String(zeile.slug),
    titel: String(zeile.titel ?? ""),
    jahr: zuZahl(zeile.jahr),
    serieId: zeile.serie_id ? String(zeile.serie_id) : null,
    geschichte: String(zeile.geschichte ?? ""),
    zitat: zeile.zitat ? String(zeile.zitat) : null,
    technik: String(zeile.technik ?? ""),
    material: zeile.material ? String(zeile.material) : null,
    breiteCm: zuZahl(zeile.breite_cm),
    hoeheCm: zuZahl(zeile.hoehe_cm),
    tiefeCm: zuZahl(zeile.tiefe_cm),
    istUnikat: zeile.ist_unikat !== false,
    editionInfo: zeile.edition_info ? String(zeile.edition_info) : null,
    preisCent: zuZahl(zeile.preis_cent),
    versandCent: zuZahl(zeile.versand_cent) ?? 0,
    waehrung: String(zeile.waehrung ?? "eur"),
    status:
      zeile.status === "verkauft"
        ? "verkauft"
        : zeile.status === "reserviert"
          ? "reserviert"
          : "verfuegbar",
    anfrageErlaubt: zeile.anfrage_erlaubt !== false,
    leitfarbe: istHexfarbe(zeile.leitfarbe) ? String(zeile.leitfarbe) : null,
    signaturSchluessel: zeile.signatur_schluessel
      ? String(zeile.signatur_schluessel)
      : null,
    aufStartseite: zeile.auf_startseite === true,
    startseiteSortierung: zuZahl(zeile.startseite_sortierung) ?? 0,
    sortierung: zuZahl(zeile.sortierung) ?? 0,
    bilder: rohbilder.map(zuBild).sort((a, b) => a.sortierung - b.sortierung),
  };
}

/** Alle Felder eines Werks inklusive seiner Bilder. */
const WERK_FELDER = "*, werk_bilder(*)";

// ---------------------------------------------------------------------------
//  Schutz gegen eine Datenbank, die gerade nicht antwortet
// ---------------------------------------------------------------------------

let ausfallGemeldet = false;

/**
 * Meldet einen Datenbankausfall — einmal je Lauf.
 *
 * Bei einem Bau mit vielen Seiten stuende dieselbe Meldung sonst
 * hundertfach im Protokoll und die eigentliche Ursache waere darin nicht
 * mehr zu finden.
 */
function meldeAusfall(beschreibung: string, ursache: unknown): void {
  if (ausfallGemeldet) return;
  ausfallGemeldet = true;

  const text =
    ursache instanceof Error
      ? ursache.message
      : typeof ursache === "object" && ursache !== null && "message" in ursache
        ? String((ursache as { message: unknown }).message)
        : String(ursache);

  console.warn(
    `[Daten] Die Datenbank hat nicht geantwortet (${beschreibung}). ` +
      `Betroffene Seiten bleiben vorerst leer. Ursache: ${text}`,
  );
}

/**
 * Wertet ein Supabase-Ergebnis aus und meldet einen Fehlschlag.
 *
 * supabase-js wirft bei einem Netzwerkfehler nicht, sondern liefert ihn
 * als `error` zurueck. Ohne diese Stelle bliebe ein Ausfall daher voellig
 * stumm: die Seite waere leer, das Protokoll sauber, und niemand wuesste
 * warum.
 */
function fehlgeschlagen(beschreibung: string, fehler: unknown): true {
  if (fehler) meldeAusfall(beschreibung, fehler);
  return true;
}

/**
 * Fuehrt eine Abfrage aus und faengt alles ab, was dabei schiefgehen kann.
 *
 * Eine Datenbank ist nicht immer da. Supabase pausiert Projekte der
 * kostenlosen Stufe nach laengerer Ruhe, ein Netzwerk kann haengen, ein
 * Schluessel kann abgelaufen sein. Ohne diesen Schutz reisst so ein
 * Aussetzer den gesamten Produktionsbau mit — denn `generateStaticParams`
 * laeuft beim Bauen, und eine Ausnahme dort bricht ihn ab.
 *
 * Hier gilt stattdessen: im Zweifel nichts liefern. Eine Seite, die
 * voruebergehend leer ist, laesst sich neu bauen; ein Bau, der nie
 * durchlaeuft, nicht.
 */
async function frage<T>(
  beschreibung: string,
  standard: T,
  abfrage: () => Promise<T>,
): Promise<T> {
  try {
    return await abfrage();
  } catch (fehler) {
    // Next.js wirft selbst Ausnahmen, um zu steuern: notFound(),
    // redirect() und der Hinweis, dass eine Seite dynamisch gerendert
    // werden muss. Wer die abfaengt, nimmt dem Rahmenwerk das Ruder aus
    // der Hand — eine Seite wuerde dann still mit leerem Inhalt statisch
    // gebaut, statt zur Laufzeit ihre Daten zu holen.
    unstable_rethrow(fehler);

    meldeAusfall(beschreibung, fehler);
    return standard;
  }
}

// ---------------------------------------------------------------------------
//  Serien
// ---------------------------------------------------------------------------

export async function holeSerien(): Promise<Serie[]> {
  if (demoModus()) {
    return [...SERIEN_SEED].sort((a, b) => a.sortierung - b.sortierung);
  }

  return frage("Serien", [], async () => {
    const client = supabaseOeffentlich();
    const { data, error } = await client
      .from("serien")
      .select("*")
      .order("sortierung", { ascending: true });

    if (error || !data) {
      fehlgeschlagen("Serien", error);
      return [];
    }
    return data.map(zuSerie);
  });
}

/**
 * Die Slugs, die waehrend des Produktionsbaus vorgerendert werden.
 *
 * `generateStaticParams` hat keinen HTTP-Request und darf folglich keinen
 * Cookie-basierten Client verwenden. Serien sind oeffentlich lesbar, daher
 * reicht hier der anonyme, zustandslose Client aus.
 */
export async function holeSerienFuerStatischePfade(): Promise<string[]> {
  if (demoModus()) return SERIEN_SEED.map((serie) => serie.slug);

  return frage("Serien-Adressen", [], async () => {
    const client = supabaseOeffentlich();
    const { data, error } = await client
      .from("serien")
      .select("slug")
      .order("sortierung", { ascending: true });

    if (error || !data) return [];
    return data.map((serie) => String(serie.slug));
  });
}

export async function holeSerie(slug: string): Promise<Serie | null> {
  if (demoModus()) {
    return SERIEN_SEED.find((serie) => serie.slug === slug) ?? null;
  }

  return frage("Serie", null, async () => {
    const client = supabaseOeffentlich();
    const { data, error } = await client
      .from("serien")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      fehlgeschlagen("Serie", error);
      return null;
    }
    return zuSerie(data);
  });
}

// ---------------------------------------------------------------------------
//  Werke
// ---------------------------------------------------------------------------

export async function holeWerke(): Promise<Werk[]> {
  if (demoModus()) {
    return [...WERKE_SEED].sort((a, b) => b.sortierung - a.sortierung);
  }

  return frage("Werke", [], async () => {
    const client = supabaseOeffentlich();
    const { data, error } = await client
      .from("werke")
      .select(WERK_FELDER)
      .order("sortierung", { ascending: false });

    if (error || !data) return [];
    return data.map(zuWerk);
  });
}

/** Siehe `holeSerienFuerStatischePfade` fuer den Grund des separaten Clients. */
export async function holeWerkeFuerStatischePfade(): Promise<string[]> {
  if (demoModus()) return WERKE_SEED.map((werk) => werk.slug);

  return frage("Werk-Adressen", [], async () => {
    const client = supabaseOeffentlich();
    const { data, error } = await client
      .from("werke")
      .select("slug")
      .order("sortierung", { ascending: false });

    if (error || !data) {
      fehlgeschlagen("Werk-Adressen", error);
      return [];
    }
    return data.map((werk) => String(werk.slug));
  });
}

export async function holeWerk(slug: string): Promise<WerkMitSerie | null> {
  if (demoModus()) {
    const werk = WERKE_SEED.find((eintrag) => eintrag.slug === slug);
    if (!werk) return null;
    const serie = SERIEN_SEED.find((eintrag) => eintrag.id === werk.serieId);
    return { ...werk, serie: serie ?? null };
  }

  return frage("Werk", null, async () => {
    const client = supabaseOeffentlich();
    const { data, error } = await client
      .from("werke")
      .select(`${WERK_FELDER}, serien(*)`)
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return null;

    const zeile = data as Zeile;
    const serieZeile = zeile.serien as Zeile | null;
    return { ...zuWerk(zeile), serie: serieZeile ? zuSerie(serieZeile) : null };
  });
}

/** Ein einzelnes Werk nach seiner Kennung — fuer das Admin-Panel. */
export async function holeWerkNachId(id: string): Promise<Werk | null> {
  if (demoModus()) {
    return WERKE_SEED.find((werk) => werk.id === id) ?? null;
  }

  return frage("Werk", null, async () => {
    const client = await supabaseServer();
    const { data, error } = await client
      .from("werke")
      .select(WERK_FELDER)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      fehlgeschlagen("Werk", error);
      return null;
    }
    return zuWerk(data);
  });
}

/**
 * Die Werke der Startseite, in der von Lusine festgelegten Reihenfolge.
 * Bewusst auf fuenf begrenzt: die Startseite zeigt eine Auswahl, keinen
 * Katalog.
 */
export async function holeStartseitenWerke(anzahl = 5): Promise<Werk[]> {
  if (demoModus()) {
    return WERKE_SEED.filter((werk) => werk.aufStartseite)
      .sort((a, b) => a.startseiteSortierung - b.startseiteSortierung)
      .slice(0, anzahl);
  }

  return frage("Startseiten-Werke", [], async () => {
    const client = supabaseOeffentlich();
    const { data, error } = await client
      .from("werke")
      .select(WERK_FELDER)
      .eq("auf_startseite", true)
      .order("startseite_sortierung", { ascending: true })
      .limit(anzahl);

    if (error || !data) return [];
    return data.map(zuWerk);
  });
}

export async function holeWerkeDerSerie(serieId: string): Promise<Werk[]> {
  if (demoModus()) {
    return WERKE_SEED.filter((werk) => werk.serieId === serieId).sort(
      (a, b) => b.sortierung - a.sortierung,
    );
  }

  return frage("Werke einer Serie", [], async () => {
    const client = supabaseOeffentlich();
    const { data, error } = await client
      .from("werke")
      .select(WERK_FELDER)
      .eq("serie_id", serieId)
      .order("sortierung", { ascending: false });

    if (error || !data) {
      fehlgeschlagen("Werke einer Serie", error);
      return [];
    }
    return data.map(zuWerk);
  });
}

/**
 * Ein bis zwei weitere Werke derselben Serie, fuer den Abschluss der
 * Detailseite. Faellt auf beliebige andere Werke zurueck, wenn das Werk
 * zu keiner Serie gehoert.
 */
export async function holeVerwandteWerke(
  werk: Werk,
  anzahl = 2,
): Promise<Werk[]> {
  const kandidaten = werk.serieId
    ? await holeWerkeDerSerie(werk.serieId)
    : await holeWerke();

  const uebrige = kandidaten.filter((eintrag) => eintrag.id !== werk.id);
  if (uebrige.length >= anzahl) return uebrige.slice(0, anzahl);

  // Zu wenige in der Serie: mit anderen Werken auffuellen.
  const alle = await holeWerke();
  const bereits = new Set([werk.id, ...uebrige.map((e) => e.id)]);
  const auffuellen = alle.filter((eintrag) => !bereits.has(eintrag.id));

  return [...uebrige, ...auffuellen].slice(0, anzahl);
}

// ---------------------------------------------------------------------------
//  Freie Texte
// ---------------------------------------------------------------------------

export async function holeTexte(): Promise<SeitenTexte> {
  if (demoModus()) return TEXTE_STANDARD;

  return frage("Texte", TEXTE_STANDARD, async () => {
    const client = supabaseOeffentlich();
    const { data, error } = await client.from("seiten_texte").select("*");

    if (error || !data) return TEXTE_STANDARD;

    // Fehlende Schluessel fallen auf den Standardtext zurueck, damit die
    // Seite nie mit leeren Abschnitten erscheint.
    const texte: SeitenTexte = { ...TEXTE_STANDARD };
    for (const zeile of data as Zeile[]) {
      const schluessel = String(zeile.schluessel) as keyof SeitenTexte;
      if (schluessel in texte && typeof zeile.wert === "string" && zeile.wert) {
        (texte as Record<string, unknown>)[schluessel] = zeile.wert;
      }
    }
    return texte;
  });
}

// ---------------------------------------------------------------------------
//  Anfragen — ausschliesslich fuer das Admin-Panel
// ---------------------------------------------------------------------------

function zuAnfrage(zeile: Zeile): Anfrage {
  return {
    id: String(zeile.id),
    werkId: zeile.werk_id ? String(zeile.werk_id) : null,
    werkTitel: zeile.werk_titel ? String(zeile.werk_titel) : null,
    name: String(zeile.name ?? ""),
    email: String(zeile.email ?? ""),
    nachricht: String(zeile.nachricht ?? ""),
    status:
      zeile.status === "beantwortet" || zeile.status === "abgeschlossen"
        ? zeile.status
        : "neu",
    erstelltAm: String(zeile.erstellt_am ?? ""),
  };
}

export async function holeAnfragen(): Promise<Anfrage[]> {
  if (demoModus()) return [];

  return frage("Anfragen", [], async () => {
    const client = await supabaseServer();
    const { data, error } = await client
      .from("anfragen")
      .select("*")
      .order("erstellt_am", { ascending: false });

    if (error || !data) {
      fehlgeschlagen("Anfragen", error);
      return [];
    }
    return (data as Zeile[]).map(zuAnfrage);
  });
}
