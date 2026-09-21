import type { Metadata } from "next";
import { Abschnitt, Auszufuellen, Rechtstext } from "@/components/Rechtstext";

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: true, follow: false },
};

/**
 * Impressum nach § 5 DDG.
 *
 * Die gelb hinterlegten Stellen muessen vor dem Livegang durch die
 * echten Angaben ersetzt werden. Ein unvollstaendiges Impressum ist in
 * Deutschland abmahnfaehig — deshalb sind die Luecken auffaellig
 * markiert und nicht bloss leer gelassen.
 */
export default function ImpressumSeite() {
  return (
    <Rechtstext titel="Impressum">
      <Abschnitt ueberschrift="Angaben gemäß § 5 DDG">
        <p>
          <Auszufuellen>Vor- und Nachname der Künstlerin</Auszufuellen>
          <br />
          <Auszufuellen>Straße und Hausnummer</Auszufuellen>
          <br />
          <Auszufuellen>PLZ und Ort</Auszufuellen>
          <br />
          Deutschland
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="Kontakt">
        <p>
          Telefon: <Auszufuellen>Telefonnummer</Auszufuellen>
          <br />
          E-Mail: <Auszufuellen>E-Mail-Adresse</Auszufuellen>
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="Umsatzsteuer">
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a
          Umsatzsteuergesetz:{" "}
          <Auszufuellen>USt-IdNr. oder Hinweis auf Kleinunternehmerregelung</Auszufuellen>
        </p>
        <p>
          Bei Anwendung der Kleinunternehmerregelung nach § 19 UStG ist
          stattdessen folgender Hinweis aufzunehmen: „Gemäß § 19 UStG wird
          keine Umsatzsteuer berechnet.“
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="Verantwortlich für den Inhalt">
        <p>
          <Auszufuellen>Vor- und Nachname</Auszufuellen>, Anschrift wie oben.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="Streitbeilegung">
        <p>
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            rel="noopener noreferrer"
            target="_blank"
          >
            ec.europa.eu/consumers/odr
          </a>
          .
        </p>
        <p>
          Wir sind nicht bereit und nicht verpflichtet, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="Urheberrecht">
        <p>
          Alle auf dieser Website gezeigten Werke, Abbildungen und Texte sind
          urheberrechtlich geschützt. Eine Verwendung außerhalb der Grenzen des
          Urheberrechts bedarf der vorherigen schriftlichen Zustimmung der
          Urheberin.
        </p>
      </Abschnitt>
    </Rechtstext>
  );
}
