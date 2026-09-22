/**
 * Das Datenmodell der Galerie.
 *
 * Die Namen sind bewusst deutsch und entsprechen eins zu eins den
 * Spalten in Supabase (dort in snake_case). Das haelt die Uebersetzung
 * zwischen Datenbank und Anwendung trivial und die Admin-Oberflaeche
 * verstaendlich fuer die Person, die sie taeglich benutzt.
 */

export const WERK_STATUS = ["verfuegbar", "reserviert", "verkauft"] as const;
export type WerkStatus = (typeof WERK_STATUS)[number];

export const STATUS_BESCHRIFTUNG: Record<WerkStatus, string> = {
  verfuegbar: "Verfügbar",
  reserviert: "Reserviert",
  verkauft: "Verkauft",
};

export const BILD_ART = ["haupt", "detail"] as const;
export type BildArt = (typeof BILD_ART)[number];

export const ANFRAGE_STATUS = ["neu", "beantwortet", "abgeschlossen"] as const;
export type AnfrageStatus = (typeof ANFRAGE_STATUS)[number];

export const ANFRAGE_STATUS_BESCHRIFTUNG: Record<AnfrageStatus, string> = {
  neu: "Neu",
  beantwortet: "Beantwortet",
  abgeschlossen: "Abgeschlossen",
};

/** Eine Werkgruppe mit eigenem Einleitungstext. */
export type Serie = {
  id: string;
  slug: string;
  titel: string;
  jahr: number | null;
  einleitung: string;
  sortierung: number;
};

/**
 * Ein Bild eines Werks.
 *
 * `schluessel` ist entweder ein Pfad im R2-Speicher (Produktivbetrieb)
 * oder ein Pfad unter /public (Demo-Modus). Welcher Fall vorliegt,
 * entscheidet `bildQuelle()` in lib/bilder.ts.
 */
export type WerkBild = {
  id: string;
  schluessel: string;
  art: BildArt;
  altText: string;
  breitePx: number;
  hoehePx: number;
  sortierung: number;
};

export type Werk = {
  id: string;
  slug: string;
  titel: string;
  jahr: number | null;
  serieId: string | null;

  /** Der erzaehlende Text — das Herzstueck jeder Werkseite. */
  geschichte: string;
  /** Ein Satz von Lusine, gross gesetzt wie ein Wandtext. */
  zitat: string | null;

  technik: string;
  material: string | null;
  breiteCm: number | null;
  hoeheCm: number | null;
  tiefeCm: number | null;
  istUnikat: boolean;
  editionInfo: string | null;

  preisCent: number | null;
  /** Nur zur Information neben dem Preis — es wird nichts berechnet. */
  versandCent: number;
  waehrung: string;
  status: WerkStatus;
  anfrageErlaubt: boolean;

  /** Die individuelle Signatur dieses Werks als freigestelltes PNG. */
  signaturSchluessel: string | null;

  aufStartseite: boolean;
  startseiteSortierung: number;
  sortierung: number;

  bilder: WerkBild[];
};

/** Ein Werk mit aufgeloester Serie — was die Detailseite braucht. */
export type WerkMitSerie = Werk & { serie: Serie | null };

export type Anfrage = {
  id: string;
  werkId: string | null;
  werkTitel: string | null;
  name: string;
  email: string;
  nachricht: string;
  status: AnfrageStatus;
  erstelltAm: string;
};

/**
 * Frei pflegbare Texte der Seite.
 * Alles, was Lusine im Backend unter "Texte" aendern kann.
 */
export type SeitenTexte = {
  startseiteAuftakt: string;
  startseiteZitat: string;
  startseiteAbschluss: string;
  ueberUeberschrift: string;
  ueberText: string;
  ueberPortraitSchluessel: string | null;
  kontaktText: string;
};

export const TEXTE_STANDARD: SeitenTexte = {
  startseiteAuftakt:
    "Jedes Bild beginnt mit einem Gefühl, für das es noch keine Worte gibt. Die Farbe kommt zuerst, die Geschichte findet sich später.",
  startseiteZitat:
    "Ich male nicht, was ich sehe. Ich male, was bleibt, wenn ich die Augen schließe.",
  startseiteAbschluss:
    "Alle Werke sind Originale und existieren genau einmal. Wer ein Bild mit nach Hause nimmt, nimmt die einzige Fassung mit.",
  ueberUeberschrift: "Über Lusine",
  ueberText:
    "Lusine arbeitet in Öl und Acryl auf Leinwand. Ihre Bilder entstehen langsam, oft über Monate, in Schichten, die einander überlagern und durchscheinen.\n\nSie malt keine Motive, sondern Zustände: das Licht kurz vor einem Gewitter, die Stille nach einem Gespräch, den Moment, in dem eine Erinnerung kippt. Was am Ende auf der Leinwand steht, hat selten einen Namen — aber immer eine Geschichte.\n\nJedes Werk ist ein Unikat und trägt eine eigene Signatur, die nur zu diesem einen Bild gehört.",
  ueberPortraitSchluessel: null,
  kontaktText:
    "Sie haben ein Werk entdeckt, das Sie nicht mehr loslässt? Oder eine Frage zu Technik, Format oder Versand? Schreiben Sie mir — ich antworte persönlich, meist innerhalb von zwei Tagen.",
};
