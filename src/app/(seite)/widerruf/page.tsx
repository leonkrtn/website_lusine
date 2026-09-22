import type { Metadata } from "next";
import { Abschnitt, Auszufuellen, Rechtstext } from "@/components/Rechtstext";

export const metadata: Metadata = {
  title: "Widerrufsbelehrung",
  alternates: { canonical: "/widerruf" },
  robots: { index: true, follow: false },
};

/**
 * Widerrufsbelehrung fuer Verbrauchervertraege im Fernabsatz.
 *
 * Ueber diese Website wird nichts verkauft. Ein Vertrag entsteht erst
 * im persoenlichen Austausch — kommt er dabei ausschliesslich ueber
 * E-Mail oder Telefon zustande, ist er ein Fernabsatzvertrag, und die
 * Belehrung muss dem Verbraucher vor Vertragsschluss vorliegen. Diese
 * Seite ist dafuer da, aus einem Angebot heraus verlinkt zu werden.
 *
 * Der Text folgt dem gesetzlichen Muster und ist bewusst nicht
 * umformuliert: Abweichungen vom Muster kosten den Schutz, den das
 * Muster bietet.
 */
export default function WiderrufSeite() {
  return (
    <Rechtstext titel="Widerrufsbelehrung">
      <Abschnitt ueberschrift="Wann diese Belehrung gilt">
        <p>
          Über diese Website kann nichts gekauft werden. Ein Kaufvertrag kommt
          erst im persönlichen Austausch zustande. Geschieht das ausschließlich
          über Fernkommunikationsmittel — etwa per E-Mail — und ist der Käufer
          Verbraucher, so gilt die folgende Belehrung.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="Widerrufsrecht">
        <p>
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
          diesen Vertrag zu widerrufen.
        </p>
        <p>
          Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder
          ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die
          Ware in Besitz genommen haben beziehungsweise hat.
        </p>
        <p>
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns
          (<Auszufuellen>Name, Anschrift, E-Mail-Adresse</Auszufuellen>) mittels
          einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief
          oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu
          widerrufen, informieren.
        </p>
        <p>
          Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung
          über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist
          absenden.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="Folgen des Widerrufs">
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen,
          die wir von Ihnen erhalten haben, einschließlich der Lieferkosten
          (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass
          Sie eine andere Art der Lieferung als die von uns angebotene,
          günstigste Standardlieferung gewählt haben), unverzüglich und
          spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem
          die Mitteilung über Ihren Widerruf dieses Vertrags bei uns
          eingegangen ist.
        </p>
        <p>
          Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie
          bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit
          Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall
          werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
        </p>
        <p>
          Wir können die Rückzahlung verweigern, bis wir die Waren wieder
          zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass
          Sie die Waren zurückgesandt haben, je nachdem, welches der frühere
          Zeitpunkt ist.
        </p>
        <p>
          Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen
          vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses
          Vertrags unterrichten, an uns zurückzusenden oder zu übergeben.
        </p>
        <p>
          Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.
          Aufgrund der Beschaffenheit der Werke (großformatige, empfindliche
          Originale) können diese Kosten{" "}
          <Auszufuellen>geschätzte Rücksendekosten eintragen</Auszufuellen>{" "}
          betragen.
        </p>
        <p>
          Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen,
          wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit,
          Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang
          mit ihnen zurückzuführen ist.
        </p>
      </Abschnitt>

      <Abschnitt ueberschrift="Hinweis zu Auftragsarbeiten">
        <p>
          Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von
          Waren, die nicht vorgefertigt sind und für deren Herstellung eine
          individuelle Auswahl oder Bestimmung durch den Verbraucher maßgeblich
          ist (§ 312 g Abs. 2 Nr. 1 BGB). Das betrifft Auftragsarbeiten, nicht
          jedoch bereits fertiggestellte Werke aus dem Werkverzeichnis.
        </p>
      </Abschnitt>
    </Rechtstext>
  );
}
