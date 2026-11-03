import { Resend } from "resend";
import { bildAdresseVoll } from "@/lib/bilder";
import { holeWerk } from "@/lib/daten";
import { hauptbild } from "@/lib/darstellung";
import {
  ateliermeldung,
  bestaetigung,
  type Anfragedaten,
  type Mailinhalt,
  type MailWerk,
} from "@/lib/mailvorlagen";
import { emailAbsender, emailAtelier, resendSchluessel } from "@/lib/umgebung";

/**
 * E-Mails zu eingegangenen Anfragen. Wie sie aussehen, steht in
 * `mailvorlagen.ts`; hier geht es nur ums Verschicken.
 *
 * Fehlt der Zugang, wird nichts verschickt und nichts geworfen: eine
 * Anfrage darf niemals daran scheitern, dass der E-Mail-Dienst klemmt.
 * Sie steht dann trotzdem im Admin-Panel.
 */

function client(): Resend | null {
  const schluessel = resendSchluessel();
  return schluessel ? new Resend(schluessel) : null;
}

/**
 * Das Werk, nach dem gefragt wurde — fuer Bild und Schild in der E-Mail.
 * Laesst es sich nicht laden, geht die E-Mail ohne Bild hinaus.
 */
async function werkFuerMail(slug: string | null | undefined): Promise<MailWerk | null> {
  if (!slug) return null;

  try {
    const werk = await holeWerk(slug);
    if (!werk) return null;

    const bild = hauptbild(werk.bilder);
    const src = bild ? bildAdresseVoll(bild.schluessel) : "";

    return {
      titel: werk.titel,
      slug: werk.slug,
      jahr: werk.jahr,
      technik: werk.technik,
      breiteCm: werk.breiteCm,
      hoeheCm: werk.hoeheCm,
      tiefeCm: werk.tiefeCm,
      bild: bild && src ? { src, breitePx: bild.breitePx, hoehePx: bild.hoehePx } : null,
    };
  } catch {
    return null;
  }
}

/**
 * Verschickt eine E-Mail und schluckt jeden Fehler.
 *
 * Resend wirft bei einer Ablehnung nicht, sondern liefert `error` zurueck.
 * Beides landet im Serverprotokoll (auf Vercel unter "Logs"), damit ein
 * klemmender Versand auffaellt, ohne die Anfrage zu gefaehrden.
 */
async function verschicke(
  dienst: Resend,
  zweck: string,
  an: string,
  inhalt: Mailinhalt,
  antwortAn: string | null,
): Promise<void> {
  try {
    const { error } = await dienst.emails.send({
      from: emailAbsender(),
      to: an,
      ...(antwortAn ? { replyTo: antwortAn } : {}),
      subject: inhalt.betreff,
      html: inhalt.html,
      text: inhalt.text,
    });
    if (error) console.error(`E-Mail (${zweck}) abgelehnt:`, error);
  } catch (fehler) {
    console.error(`E-Mail (${zweck}) gescheitert:`, fehler);
  }
}

/**
 * Beide E-Mails zu einer Anfrage: die Meldung an das Atelier und die
 * Eingangsbestaetigung an die anfragende Person.
 */
export async function verschickeAnfragemails(daten: Anfragedaten): Promise<void> {
  const dienst = client();
  if (!dienst) return;

  const werk = await werkFuerMail(daten.werkSlug);
  const atelier = emailAtelier();

  await Promise.all([
    // Antwortet das Atelier, geht die Antwort an die anfragende Person.
    atelier
      ? verschicke(dienst, "Atelier", atelier, ateliermeldung(daten, werk), daten.email)
      : null,
    // Antwortet die Person auf die Bestaetigung, soll das beim Atelier
    // ankommen und nicht bei einer Absenderadresse, die niemand liest.
    verschicke(
      dienst,
      "Bestätigung",
      daten.email,
      bestaetigung(daten, werk, { antwortMoeglich: Boolean(atelier) }),
      atelier,
    ),
  ]);
}
