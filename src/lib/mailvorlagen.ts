import { masseText } from "@/lib/bilder";
import { seitenUrl } from "@/lib/umgebung";

/**
 * Wie die E-Mails aussehen.
 *
 * Getrennt vom Versand in `mail.ts`, damit sich die Vorlagen ohne
 * Resend und ohne Datenbank ansehen lassen.
 *
 * Eine E-Mail ist keine Webseite. Was im Browser selbstverstaendlich
 * ist, fehlt in Outlook und Gmail: kein Stylesheet, keine eigene
 * Schrift, kein Flexbox. Darum stehen alle Angaben direkt am Element,
 * der Aufbau laeuft ueber Tabellen, und die Schrift ist Georgia — die
 * Garamond der Seite hat kaum ein Postfach.
 *
 * Der Grundsatz der Seite gilt auch hier: das Werk steht auf Reinweiss,
 * ohne Rahmen und ohne Schatten, daneben nur sein Schild. Einen dunklen
 * Modus gibt es nicht; `color-scheme` bittet die Postfaecher, die
 * Farben nicht umzukehren.
 */

// ---------------------------------------------------------------------------
//  Farben und Schrift — dieselben Werte wie in globals.css
// ---------------------------------------------------------------------------

const PAPIER = "#ffffff";
const TINTE = "#111111";
const TINTE_LEISE = "#5f5a55";
const TINTE_STILL = "#746e68";
const LINIE = "#e7e4e0";
const SCHRIFT = "Georgia, 'Times New Roman', Times, serif";

// ---------------------------------------------------------------------------
//  Daten
// ---------------------------------------------------------------------------

export type Anfragedaten = {
  name: string;
  email: string;
  nachricht: string;
  werkTitel?: string | null;
  werkSlug?: string | null;
};

/** Was eine E-Mail von einem Werk wissen muss. */
export type MailWerk = {
  titel: string;
  slug: string;
  jahr: number | null;
  technik: string;
  breiteCm: number | null;
  hoeheCm: number | null;
  tiefeCm: number | null;
  /** Vollstaendige Adresse des Hauptbilds samt Seitenverhaeltnis. */
  bild: { src: string; breitePx: number; hoehePx: number } | null;
};

export type Mailinhalt = {
  betreff: string;
  html: string;
  text: string;
};

// ---------------------------------------------------------------------------
//  Bausteine
// ---------------------------------------------------------------------------

/** Schuetzt gegen eingeschleuste Auszeichnung in E-Mail-Texten. */
function sicher(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function werkAdresse(slug: string): string {
  return `${seitenUrl()}/werke/${encodeURIComponent(slug)}`;
}

/** Die kleine Zeile in Versalien, wie `.beschriftung` auf der Seite. */
function beschriftung(text: string, abstandOben = 0): string {
  return `<p style="margin:${abstandOben}px 0 0;font-family:${SCHRIFT};font-size:11px;line-height:16px;letter-spacing:0.16em;text-transform:uppercase;color:${TINTE_STILL}">${text}</p>`;
}

function absatz(inhalt: string, abstandOben = 16): string {
  return `<p style="margin:${abstandOben}px 0 0;font-family:${SCHRIFT};font-size:17px;line-height:28px;color:${TINTE}">${inhalt}</p>`;
}

/** Die Nachricht der anfragenden Person, abgesetzt durch eine feine Linie. */
function zitat(nachricht: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px">
<tr><td style="border-left:2px solid ${LINIE};padding:2px 0 2px 20px;font-family:${SCHRIFT};font-size:16px;line-height:26px;color:${TINTE_LEISE};white-space:pre-wrap">${sicher(nachricht)}</td></tr>
</table>`;
}

/** Passt ein Bild in einen Kasten, ohne es zu verzerren. */
function einpassen(
  bild: NonNullable<MailWerk["bild"]>,
  maxBreite: number,
  maxHoehe: number,
): { breite: number; hoehe: number } {
  if (!bild.breitePx || !bild.hoehePx) return { breite: maxBreite, hoehe: 0 };
  const faktor = Math.min(maxBreite / bild.breitePx, maxHoehe / bild.hoehePx, 1);
  return {
    breite: Math.round(bild.breitePx * faktor),
    hoehe: Math.round(bild.hoehePx * faktor),
  };
}

function werkbild(werk: MailWerk, maxBreite: number, maxHoehe: number): string {
  if (!werk.bild) return "";
  const { breite, hoehe } = einpassen(werk.bild, maxBreite, maxHoehe);
  const hoeheAttribut = hoehe ? ` height="${hoehe}"` : "";
  return `<a href="${werkAdresse(werk.slug)}" style="text-decoration:none"><img src="${sicher(werk.bild.src)}" width="${breite}"${hoeheAttribut} alt="${sicher(werk.titel)}" style="display:block;width:${breite}px;max-width:100%;height:auto;border:0;outline:none;background:${PAPIER}"></a>`;
}

/** Das Saalschild: Titel kursiv, Jahr, darunter Technik und Masse. */
function saalschild(werk: MailWerk): string {
  const jahr = werk.jahr ? `, ${werk.jahr}` : "";
  const angaben = [werk.technik, masseText(werk.breiteCm, werk.hoeheCm, werk.tiefeCm)]
    .filter(Boolean)
    .map((zeile) => sicher(String(zeile)))
    .join("<br>");

  return `<p style="margin:0;font-family:${SCHRIFT};font-size:17px;line-height:24px;color:${TINTE}"><a href="${werkAdresse(werk.slug)}" style="color:${TINTE};text-decoration:none"><em>${sicher(werk.titel)}</em></a>${jahr}</p>
${angaben ? `<p style="margin:6px 0 0;font-family:${SCHRIFT};font-size:14px;line-height:21px;color:${TINTE_LEISE}">${angaben}</p>` : ""}`;
}

/** Ein Knopf, der auch in Outlook wie einer aussieht. */
function knopf(href: string, beschriftung: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px">
<tr><td style="background:${TINTE}">
<a href="${href}" style="display:inline-block;padding:14px 28px;font-family:${SCHRIFT};font-size:15px;line-height:18px;letter-spacing:0.06em;color:${PAPIER};text-decoration:none">${beschriftung}</a>
</td></tr>
</table>`;
}

/**
 * Der Rahmen um jede E-Mail: Schriftzug oben, Inhalt, Fuss.
 *
 * Die Vorschauzeile (`vorschau`) steht unsichtbar am Anfang. Postfaecher
 * zeigen sie neben dem Betreff an; fehlt sie, erscheint dort der
 * Schriftzug „LUART“ und sonst nichts.
 */
function rahmen({
  titel,
  vorschau,
  inhalt,
  fuss,
}: {
  titel: string;
  vorschau: string;
  inhalt: string;
  fuss: string;
}): string {
  const seite = seitenUrl();
  const domain = seite.replace(/^https?:\/\//, "");

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>${sicher(titel)}</title>
<style>
  :root { color-scheme: light only; }
  a { color: ${TINTE}; }
  @media (max-width: 600px) {
    .innen { padding: 40px 20px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${PAPIER};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${PAPIER}">${sicher(vorschau)}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPIER}">
<tr><td align="center">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px">
<tr><td class="innen" style="padding:56px 40px 48px;text-align:left">

<a href="${seite}" style="font-family:${SCHRIFT};font-size:20px;line-height:20px;letter-spacing:0.2em;text-transform:uppercase;color:${TINTE};text-decoration:none">LUART</a>

<div style="height:48px;line-height:48px;font-size:0">&nbsp;</div>

${inhalt}

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:56px">
<tr><td style="border-top:1px solid ${LINIE};padding-top:20px;font-family:${SCHRIFT};font-size:13px;line-height:20px;color:${TINTE_STILL}">
${fuss}
<p style="margin:12px 0 0"><a href="${seite}" style="color:${TINTE_STILL};text-decoration:underline">${sicher(domain)}</a></p>
</td></tr>
</table>

</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}

/** Zeitpunkt in deutscher Schreibweise, deutsche Uhrzeit. */
function zeitpunkt(datum: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(datum);
}

// ---------------------------------------------------------------------------
//  Meldung an das Atelier
// ---------------------------------------------------------------------------

export function ateliermeldung(
  daten: Anfragedaten,
  werk: MailWerk | null,
  eingegangen = new Date(),
): Mailinhalt {
  const werkTitel = werk?.titel ?? daten.werkTitel ?? null;
  const betreff = werkTitel
    ? `Neue Anfrage zu „${werkTitel}“ von ${daten.name}`
    : `Neue Anfrage von ${daten.name}`;

  const antwortBetreff = werkTitel
    ? `Ihre Anfrage zu „${werkTitel}“`
    : "Ihre Anfrage bei LUART";
  const antworten = `mailto:${sicher(daten.email)}?subject=${encodeURIComponent(antwortBetreff)}`;

  // Werk und Schild nebeneinander: das Bild klein, damit beides auch auf
  // einem Handy in eine Zeile passt.
  const werkzeile = werk
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px">
<tr>
${werk.bild ? `<td valign="top" style="padding-right:20px">${werkbild(werk, 112, 140)}</td>` : ""}
<td valign="top">${saalschild(werk)}</td>
</tr>
</table>`
    : "";

  const zeile = (feld: string, wert: string) =>
    `<tr>
<td valign="top" style="width:88px;padding:10px 16px 10px 0;border-top:1px solid ${LINIE};font-family:${SCHRIFT};font-size:11px;line-height:24px;letter-spacing:0.16em;text-transform:uppercase;color:${TINTE_STILL}">${feld}</td>
<td valign="top" style="padding:10px 0;border-top:1px solid ${LINIE};font-family:${SCHRIFT};font-size:16px;line-height:24px;color:${TINTE};word-break:break-word">${wert}</td>
</tr>`;

  // Der Werktitel steht nicht in der Ueberschrift: er steht schon am
  // Schild daneben, und zweimal untereinander wirkte er wie ein Versehen.
  const inhalt = `${beschriftung(`Eingegangen am ${sicher(zeitpunkt(eingegangen))}`)}
<h1 style="margin:12px 0 0;font-family:${SCHRIFT};font-size:28px;line-height:36px;font-weight:normal;color:${TINTE}">${werk ? "Neue Anfrage zu einem Werk" : werkTitel ? `Neue Anfrage zu <em>${sicher(werkTitel)}</em>` : "Neue Anfrage"}</h1>
${werkzeile}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;border-bottom:1px solid ${LINIE}">
${zeile("Name", sicher(daten.name))}
${zeile("E-Mail", `<a href="mailto:${sicher(daten.email)}" style="color:${TINTE};text-decoration:underline">${sicher(daten.email)}</a>`)}
</table>
${beschriftung("Nachricht", 32)}
${zitat(daten.nachricht)}
${knopf(antworten, `${sicher(daten.name)} antworten`)}
<p style="margin:20px 0 0;font-family:${SCHRIFT};font-size:15px;line-height:22px;color:${TINTE_LEISE}"><a href="${seitenUrl()}/admin/anfragen" style="color:${TINTE_LEISE};text-decoration:underline">Im Admin-Panel öffnen</a></p>`;

  const fuss = `<p style="margin:0">Eingegangen über das Anfrageformular. „Antworten“ in Ihrem Postfach schreibt direkt an ${sicher(daten.name)}.</p>`;

  const text = [
    `Neue Anfrage · ${zeitpunkt(eingegangen)}`,
    werkTitel ? `Werk: ${werkTitel}` : "Allgemeine Anfrage",
    werk ? werkAdresse(werk.slug) : null,
    "",
    `Name: ${daten.name}`,
    `E-Mail: ${daten.email}`,
    "",
    "Nachricht:",
    daten.nachricht,
    "",
    "—",
    `Im Admin-Panel: ${seitenUrl()}/admin/anfragen`,
  ]
    .filter((teil) => teil !== null)
    .join("\n");

  return {
    betreff,
    html: rahmen({
      titel: betreff,
      vorschau: daten.nachricht.slice(0, 120),
      inhalt,
      fuss,
    }),
    text,
  };
}

// ---------------------------------------------------------------------------
//  Eingangsbestaetigung an die anfragende Person
// ---------------------------------------------------------------------------

export function bestaetigung(
  daten: Anfragedaten,
  werk: MailWerk | null,
  { antwortMoeglich }: { antwortMoeglich: boolean },
): Mailinhalt {
  const werkTitel = werk?.titel ?? daten.werkTitel ?? null;
  const betreff = werkTitel
    ? `Ihre Anfrage zu „${werkTitel}“ ist angekommen`
    : "Ihre Anfrage ist angekommen";

  const interesse = werkTitel
    ? `vielen Dank für Ihr Interesse an <em>${sicher(werkTitel)}</em>.`
    : "vielen Dank für Ihre Nachricht.";

  // Das Werk steht so, wie es auf der Seite steht: gross, auf Weiss,
  // darunter sein Schild. Hochformate werden in der Hoehe begrenzt,
  // sonst fuellte ein schmales Bild den ganzen Bildschirm.
  const werkblock = werk
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:40px">
${werk.bild ? `<tr><td>${werkbild(werk, 400, 440)}</td></tr><tr><td style="height:20px;line-height:20px;font-size:0">&nbsp;</td></tr>` : ""}
<tr><td>${saalschild(werk)}</td></tr>
</table>`
    : "";

  const inhalt = `<h1 style="margin:0;font-family:${SCHRIFT};font-size:28px;line-height:36px;font-weight:normal;color:${TINTE}">Ihre Anfrage ist angekommen.</h1>
${absatz(`Guten Tag ${sicher(daten.name)},`, 28)}
${absatz(`${interesse} Ich lese jede Nachricht selbst und melde mich persönlich bei Ihnen, in der Regel innerhalb von zwei Tagen.`)}
${werkblock}
${beschriftung("Ihre Nachricht", 40)}
${zitat(daten.nachricht)}
${absatz("Herzliche Grüße", 40)}
<p style="margin:4px 0 0;font-family:${SCHRIFT};font-size:22px;line-height:30px;font-style:italic;color:${TINTE}">Lusine</p>`;

  const fuss = antwortMoeglich
    ? `<p style="margin:0">Möchten Sie etwas ergänzen? Antworten Sie einfach auf diese E-Mail.</p>`
    : `<p style="margin:0">Diese E-Mail wurde automatisch versandt, weil über die Website eine Anfrage mit Ihrer Adresse gestellt wurde.</p>`;

  const text = [
    `Guten Tag ${daten.name},`,
    "",
    `${werkTitel ? `vielen Dank für Ihr Interesse an „${werkTitel}“.` : "vielen Dank für Ihre Nachricht."} Ich lese jede Nachricht selbst und melde mich persönlich bei Ihnen, in der Regel innerhalb von zwei Tagen.`,
    werk ? `\n${werkAdresse(werk.slug)}` : null,
    "",
    "Ihre Nachricht:",
    daten.nachricht
      .split("\n")
      .map((zeile) => `> ${zeile}`)
      .join("\n"),
    "",
    "Herzliche Grüße",
    "Lusine",
    "",
    "—",
    `LUART · ${seitenUrl()}`,
  ]
    .filter((teil) => teil !== null)
    .join("\n");

  return {
    betreff,
    html: rahmen({
      titel: betreff,
      vorschau: "Vielen Dank für Ihre Nachricht. Lusine meldet sich persönlich bei Ihnen.",
      inhalt,
      fuss,
    }),
    text,
  };
}
