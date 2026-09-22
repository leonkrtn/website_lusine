import type { Metadata } from "next";
import { Abschnitt, Auszufuellen, Rechtstext } from "@/components/Rechtstext";

export const metadata: Metadata = {
  title: "Verkaufsbedingungen",
  alternates: { canonical: "/agb" },
  robots: { index: true, follow: false },
};

/**
 * Verkaufsbedingungen.
 *
 * Über diese Website wird nichts verkauft — sie zeigt Werke und Preise,
 * der Kauf entsteht danach im persönlichen Austausch. Diese Seite
 * beschreibt genau diesen Ablauf und ist als Anlage zu einem Angebot
 * gedacht, nicht als Shop-AGB.
 */
export default function VerkaufsbedingungenSeite() {
  return (
    <Rechtstext titel="Verkaufsbedingungen">
      <Abschnitt ueberschrift="1. Anbieterin und Geltung">
        <p>
          Diese Bedingungen gelten für Verträge über den Kauf von Kunstwerken
          zwischen{" "}
          <Auszufuellen>Name und Anschrift der Künstlerin</Auszufuellen>{" "}
          (nachfolgend „die Künstlerin“) und dem Käufer.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="2. Kein Kauf über diese Website">
        <p>
          Über diese Website findet kein Verkauf statt. Die Darstellung der
          Werke mit Preisangabe ist kein rechtlich bindendes Angebot, sondern
          eine Einladung, Kontakt aufzunehmen.
        </p>
        <p>
          Wer ein Werk erwerben möchte, sendet eine Anfrage. Die Künstlerin
          antwortet mit einem persönlichen Angebot, das Preis, Versandart,
          Versandkosten und Lieferzeit ausweist. Der Vertrag kommt erst
          zustande, wenn dieses Angebot angenommen wird.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="3. Vertragsgegenstand">
        <p>
          Gegenstand des Vertrags ist der Verkauf eines Originalkunstwerks.
          Alle Werke sind Unikate und existieren jeweils nur einmal. Ein
          Anspruch auf ein bestimmtes Werk entsteht erst mit Vertragsschluss —
          bis dahin kann es anderweitig verkauft werden.
        </p>
        <p>
          Die Abbildungen geben Farbe und Oberfläche so genau wieder, wie es
          fotografisch möglich ist. Geringfügige Abweichungen in der
          Darstellung auf unterschiedlichen Bildschirmen sind technisch bedingt
          und stellen keinen Mangel dar.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="4. Preise und Zahlung">
        <p>
          Die auf dieser Website genannten Preise sind Endpreise. Angaben zu
          Versandkosten dienen der Orientierung; verbindlich sind die Angaben
          im persönlichen Angebot.
        </p>
        <p>
          Die Zahlung erfolgt nach Rechnungsstellung per Überweisung, sofern
          nichts anderes vereinbart ist.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="5. Lieferung">
        <p>
          Die Lieferung erfolgt versichert an die vereinbarte Adresse. Die
          Lieferzeit wird im Angebot genannt.
        </p>
        <p>
          Die Werke werden fachgerecht verpackt. Transportschäden sind
          unverzüglich nach Erhalt anzuzeigen und nach Möglichkeit
          fotografisch zu dokumentieren.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="6. Eigentumsvorbehalt">
        <p>
          Das Werk bleibt bis zur vollständigen Bezahlung Eigentum der
          Künstlerin.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="7. Widerrufsrecht">
        <p>
          Wird der Vertrag mit einem Verbraucher ausschließlich über
          Fernkommunikationsmittel geschlossen — etwa per E-Mail —, besteht ein
          gesetzliches Widerrufsrecht. Einzelheiten stehen in der{" "}
          <a href="/widerruf">Widerrufsbelehrung</a>.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="8. Gewährleistung">
        <p>
          Es gelten die gesetzlichen Gewährleistungsrechte. Merkmale, die sich
          aus der künstlerischen Technik ergeben — etwa sichtbare Pinselspuren,
          Unebenheiten des Farbauftrags, Craquelé oder die materialbedingte
          Alterung von Farben — sind keine Mängel, sondern Eigenschaften des
          Originals.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="9. Urheberrecht">
        <p>
          Mit dem Kauf erwirbt der Käufer das Eigentum am Werk, nicht die
          Nutzungsrechte daran. Das Urheberrecht verbleibt bei der Künstlerin.
          Die Vervielfältigung oder gewerbliche Verwertung von Abbildungen des
          Werks bedarf ihrer Zustimmung.
        </p>
        <p>
          Die Künstlerin behält sich das Recht vor, das Werk weiterhin in ihrem
          Werkverzeichnis, in Ausstellungen und in Publikationen abzubilden.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="10. Schlussbestimmungen">
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
          UN-Kaufrechts. Zwingende Verbraucherschutzvorschriften des Staates,
          in dem der Käufer seinen gewöhnlichen Aufenthalt hat, bleiben
          unberührt.
        </p>
        <p>
          Sollte eine Bestimmung unwirksam sein, bleibt die Wirksamkeit der
          übrigen Bestimmungen unberührt.
        </p>
      </Abschnitt>
    </Rechtstext>
  );
}
