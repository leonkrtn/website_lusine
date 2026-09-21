import { Resend } from "resend";
import { resendKonfiguriert, seitenUrl } from "@/lib/umgebung";

/**
 * E-Mails zu eingegangenen Anfragen.
 *
 * Fehlt der Zugang, wird nichts verschickt und nichts geworfen: eine
 * Anfrage darf niemals daran scheitern, dass der E-Mail-Dienst klemmt.
 * Sie steht dann trotzdem im Admin-Panel.
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
    ? `Anfrage zu „${daten.werkTitel}“`
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
