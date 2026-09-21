import { Resend } from "resend";
import { resendKonfiguriert, seitenUrl } from "@/lib/umgebung";
import { preisText } from "@/lib/bilder";

/**
 * E-Mails an Kaeufer und an das Atelier.
 *
 * Fehlt der Zugang, wird nichts verschickt und nichts geworfen: eine
 * Bestellung darf niemals daran scheitern, dass der E-Mail-Dienst
 * klemmt. Sie liegt dann trotzdem in der Datenbank und im Admin-Panel.
 */

function client(): Resend | null {
  if (!resendKonfiguriert()) return null;
  return new Resend(process.env.RESEND_API_KEY!);
}

function absender(): string {
  return process.env.EMAIL_ABSENDER ?? "Lusine <onboarding@resend.dev>";
}

/** Schuetzt gegen eingeschleuste Auszeichnung in E-Mail-Texten. */
function sicher(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rahmen(inhalt: string): string {
  return `<div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.7;color:#111111;background:#ffffff;padding:32px;max-width:560px">
${inhalt}
<p style="margin-top:40px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6f6a66">Lusine</p>
</div>`;
}

type Anfragedaten = {
  name: string;
  email: string;
  nachricht: string;
  werkTitel?: string | null;
  werkSlug?: string | null;
};

/** Meldung an das Atelier, dass eine Anfrage eingegangen ist. */
export async function meldeAnfrageAnAtelier(daten: Anfragedaten): Promise<void> {
  const dienst = client();
  const ziel = process.env.EMAIL_ATELIER;
  if (!dienst || !ziel) return;

  const betreff = daten.werkTitel
    ? `Anfrage zu „${daten.werkTitel}"`
    : "Neue Anfrage über die Website";

  const link = daten.werkSlug
    ? `<p><a href="${seitenUrl()}/werke/${sicher(daten.werkSlug)}">Werk ansehen</a></p>`
    : "";

  try {
    await dienst.emails.send({
      from: absender(),
      to: ziel,
      replyTo: daten.email,
      subject: betreff,
      html: rahmen(`
<h1 style="font-size:22px;font-weight:normal;margin:0 0 24px">${sicher(betreff)}</h1>
<p><strong>${sicher(daten.name)}</strong><br>${sicher(daten.email)}</p>
<p style="white-space:pre-wrap;margin-top:24px">${sicher(daten.nachricht)}</p>
${link}`),
    });
  } catch {
    // Siehe oben: eine gescheiterte E-Mail darf den Vorgang nicht
    // abbrechen. Die Anfrage steht bereits im Admin-Panel.
  }
}

/** Eingangsbestaetigung an die anfragende Person. */
export async function bestaetigeAnfrage(daten: Anfragedaten): Promise<void> {
  const dienst = client();
  if (!dienst) return;

  const werk = daten.werkTitel
    ? `zu <em>${sicher(daten.werkTitel)}</em> `
    : "";

  try {
    await dienst.emails.send({
      from: absender(),
      to: daten.email,
      subject: "Ihre Anfrage ist angekommen",
      html: rahmen(`
<p>Guten Tag ${sicher(daten.name)},</p>
<p>vielen Dank für Ihre Nachricht ${werk}— sie ist angekommen. Ich melde mich persönlich bei Ihnen, in der Regel innerhalb von zwei Tagen.</p>
<p>Herzliche Grüße<br>Lusine</p>`),
    });
  } catch {
    // bewusst still
  }
}

type Kaufdaten = {
  werkTitel: string;
  kaeuferName: string | null;
  kaeuferEmail: string | null;
  betragCent: number;
  waehrung: string;
  lieferadresse: Record<string, unknown> | null;
};

/** Kaufbestaetigung an den Kaeufer. */
export async function bestaetigeKauf(daten: Kaufdaten): Promise<void> {
  const dienst = client();
  if (!dienst || !daten.kaeuferEmail) return;

  try {
    await dienst.emails.send({
      from: absender(),
      to: daten.kaeuferEmail,
      subject: `Ihr Werk „${daten.werkTitel}"`,
      html: rahmen(`
<p>Guten Tag${daten.kaeuferName ? ` ${sicher(daten.kaeuferName)}` : ""},</p>
<p>Ihr Kauf von <em>${sicher(daten.werkTitel)}</em> ist bestätigt. Vielen Dank — es freut mich sehr, dass dieses Bild zu Ihnen kommt.</p>
<p>Betrag: ${preisText(daten.betragCent, daten.waehrung)}</p>
<p>Das Werk wird sorgfältig verpackt und versichert versendet. Sie erhalten die Sendungsnummer, sobald es auf dem Weg ist.</p>
<p>Herzliche Grüße<br>Lusine</p>`),
    });
  } catch {
    // bewusst still
  }
}

/** Verkaufsmeldung an das Atelier. */
export async function meldeKaufAnAtelier(daten: Kaufdaten): Promise<void> {
  const dienst = client();
  const ziel = process.env.EMAIL_ATELIER;
  if (!dienst || !ziel) return;

  const adresse = daten.lieferadresse
    ? `<pre style="font-family:inherit;white-space:pre-wrap">${sicher(
        JSON.stringify(daten.lieferadresse, null, 2),
      )}</pre>`
    : "<p>Keine Lieferadresse übermittelt.</p>";

  try {
    await dienst.emails.send({
      from: absender(),
      to: ziel,
      subject: `Verkauft: ${daten.werkTitel}`,
      html: rahmen(`
<h1 style="font-size:22px;font-weight:normal;margin:0 0 24px">„${sicher(daten.werkTitel)}" ist verkauft</h1>
<p>${sicher(daten.kaeuferName ?? "")}<br>${sicher(daten.kaeuferEmail ?? "")}</p>
<p>Betrag: ${preisText(daten.betragCent, daten.waehrung)}</p>
${adresse}`),
    });
  } catch {
    // bewusst still
  }
}
