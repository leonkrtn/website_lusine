import type { Metadata } from "next";
import { Abschnitt, Auszufuellen, Rechtstext } from "@/components/Rechtstext";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  robots: { index: true, follow: false },
};

/**
 * Datenschutzerklaerung.
 *
 * Beschreibt genau die Verarbeitungen, die diese Seite tatsaechlich
 * vornimmt: Anfrageformular, Zahlungsabwicklung, Bildauslieferung und
 * Hosting. Bewusst keine Textbausteine fuer Dienste, die hier gar nicht
 * laufen — eine Erklaerung, die mehr verspricht als die Seite tut, ist
 * so falsch wie eine, die zu wenig nennt.
 */
export default function DatenschutzSeite() {
  return (
    <Rechtstext titel="Datenschutzerklärung">
      <Abschnitt ueberschrift="1. Verantwortliche Stelle">
        <p>
          <Auszufuellen>Name, Anschrift und E-Mail-Adresse der Künstlerin</Auszufuellen>
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="2. Aufruf dieser Website">
        <p>
          Beim Aufruf dieser Website werden durch den Hosting-Anbieter
          technisch notwendige Daten verarbeitet: IP-Adresse, Zeitpunkt des
          Zugriffs, aufgerufene Adresse, übertragene Datenmenge sowie Angaben
          zu Browser und Betriebssystem.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte
          Interesse liegt im sicheren und stabilen Betrieb der Website. Diese
          Daten werden nach{" "}
          <Auszufuellen>Speicherdauer des Hosters eintragen</Auszufuellen>{" "}
          gelöscht.
        </p>
        <p>
          Hosting-Anbieter ist{" "}
          <Auszufuellen>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA</Auszufuellen>
          . Die Übermittlung in die USA erfolgt auf Grundlage von
          Standardvertragsklauseln.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="3. Keine Analyse, keine Werbung">
        <p>
          Diese Website setzt keine Cookies zu Analyse- oder Werbezwecken ein.
          Es findet keine Reichweitenmessung statt, es werden keine Profile
          gebildet, und es sind keine Inhalte sozialer Netzwerke eingebunden.
        </p>
        <p>
          Über diese Website werden auch keine Zahlungen abgewickelt. Es ist
          kein Zahlungsdienstleister eingebunden, und es werden zu keinem
          Zeitpunkt Zahlungsdaten erhoben.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="4. Kontakt- und Anfrageformular">
        <p>
          Wenn Sie das Formular nutzen, werden die von Ihnen angegebenen Daten
          — Name, E-Mail-Adresse, Ihre Nachricht sowie gegebenenfalls das Werk,
          auf das sich die Anfrage bezieht — zur Bearbeitung Ihrer Anfrage
          gespeichert.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit die Anfrage
          auf einen Vertragsschluss gerichtet ist, im Übrigen Art. 6 Abs. 1
          lit. f DSGVO.
        </p>
        <p>
          Die Daten werden gelöscht, sobald die Anfrage abschließend bearbeitet
          ist und keine gesetzlichen Aufbewahrungsfristen entgegenstehen.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="5. Speicherung der Werkdaten">
        <p>
          Werke, Texte und Anfragen werden bei Supabase Inc. gespeichert. Die Bilddateien liegen bei Cloudflare, Inc. und werden
          von dort ausgeliefert. Beide Anbieter verarbeiten die Daten als
          Auftragsverarbeiter auf Grundlage eines Vertrags nach Art. 28 DSGVO.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="6. Ihre Rechte">
        <p>Sie haben jederzeit das Recht auf</p>
        <ul>
          <li>Auskunft über die zu Ihnen gespeicherten Daten (Art. 15 DSGVO),</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
          <li>Löschung (Art. 17 DSGVO),</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
          <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO).</li>
        </ul>
        <p>
          Wenden Sie sich dazu an die oben genannte Adresse. Ihnen steht
          außerdem ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde
          zu.
        </p>
      </Abschnitt>
    </Rechtstext>
  );
}
