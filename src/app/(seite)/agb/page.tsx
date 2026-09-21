import type { Metadata } from "next";
import { Abschnitt, Auszufuellen, Rechtstext } from "@/components/Rechtstext";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  robots: { index: true, follow: false },
};

export default function AgbSeite() {
  return (
    <Rechtstext titel="Allgemeine Geschäftsbedingungen">
      <Abschnitt ueberschrift="1. Geltungsbereich und Anbieterin">
        <p>
          Diese Bedingungen gelten für alle Verträge über den Kauf von
          Kunstwerken, die über diese Website zwischen{" "}
          <Auszufuellen>Name und Anschrift der Künstlerin</Auszufuellen>{" "}
          (nachfolgend „die Künstlerin“) und dem Käufer geschlossen werden.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="2. Vertragsgegenstand">
        <p>
          Gegenstand des Vertrags ist der Verkauf eines Originalkunstwerks.
          Alle angebotenen Werke sind Unikate und existieren jeweils nur
          einmal. Die Abbildungen auf dieser Website geben Farbe und Oberfläche
          so genau wieder, wie es fotografisch möglich ist; geringfügige
          Abweichungen in der Darstellung auf unterschiedlichen Bildschirmen
          sind technisch bedingt und stellen keinen Mangel dar.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="3. Vertragsschluss">
        <p>
          Die Darstellung der Werke auf dieser Website ist kein rechtlich
          bindendes Angebot, sondern eine Aufforderung zur Bestellung. Mit dem
          Abschluss des Zahlungsvorgangs gibt der Käufer ein verbindliches
          Angebot ab. Der Vertrag kommt mit der Annahme durch die Künstlerin
          zustande, spätestens mit dem Versand des Werks.
        </p>
        <p>
          Da jedes Werk nur einmal existiert, wird es unmittelbar nach
          erfolgreicher Zahlung als verkauft gekennzeichnet und ist nicht mehr
          erwerbbar.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="4. Preise und Zahlung">
        <p>
          Alle Preise sind Endpreise. Die Versandkosten werden vor Abschluss
          der Bestellung gesondert ausgewiesen und richten sich nach Format und
          Gewicht des jeweiligen Werks.
        </p>
        <p>
          Die Zahlung erfolgt über den Zahlungsdienstleister Stripe. Es gelten
          ergänzend dessen Bedingungen. Die Künstlerin erhält dabei keine
          vollständigen Zahlungsdaten.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="5. Lieferung">
        <p>
          Die Lieferung erfolgt versichert innerhalb von{" "}
          <Auszufuellen>Lieferfrist, z. B. 5 bis 10 Werktagen</Auszufuellen>{" "}
          nach Zahlungseingang an die vom Käufer angegebene Adresse. Es wird
          nach Deutschland, Österreich und in die Schweiz geliefert.
        </p>
        <p>
          Die Werke werden fachgerecht verpackt. Transportschäden sind
          unverzüglich nach Erhalt anzuzeigen und nach Möglichkeit fotografisch
          zu dokumentieren.
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
          Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Einzelheiten
          finden sich in der <a href="/widerruf">Widerrufsbelehrung</a>.
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
          Die Künstlerin behält sich das Recht vor, das Werk weiterhin in
          ihrem Werkverzeichnis, in Ausstellungen und in Publikationen
          abzubilden.
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
