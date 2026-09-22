"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type DragEvent } from "react";
import { Werkbild } from "@/components/Werkbild";
import { Signatur } from "@/components/Signatur";
import { entferneBild, entferneSignatur, speichereBild } from "@/app/admin/aktionen";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { BEHAELTER, speicherSchluessel } from "@/lib/bilder";
import type { Werk } from "@/lib/typen";

type Art = "haupt" | "detail" | "signatur";

type AblageProps = {
  art: Art;
  beschriftung: string;
  istAktiv: boolean;
  istZiel: boolean;
  gesperrt: boolean;
  beiAuswahl: (ereignis: ChangeEvent<HTMLInputElement>, art: Art) => void;
  beiAblegen: (ereignis: DragEvent<HTMLLabelElement>, art: Art) => void;
  setUeberZiel: (art: Art | null) => void;
};

/**
 * Ein Ablagefeld fuer eine Datei.
 *
 * Steht bewusst ausserhalb von Bilderverwaltung. Eine innerhalb des
 * Renderns definierte Komponente ist bei jedem Zustandswechsel eine
 * andere Komponente — React haengt sie dann aus und neu ein, das
 * Dateifeld verliert dabei seinen Knoten, und die Referenz darauf
 * zeigt ins Leere.
 */
function Ablage({
  art,
  beschriftung,
  istAktiv,
  istZiel,
  gesperrt,
  beiAuswahl,
  beiAblegen,
  setUeberZiel,
}: AblageProps) {
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setUeberZiel(art);
      }}
      onDragLeave={() => setUeberZiel(null)}
      onDrop={(e) => beiAblegen(e, art)}
      className={`flex cursor-pointer items-center justify-center border border-dashed px-6 py-10 text-center text-klein transition-colors duration-300 ${
        istZiel
          ? "border-tinte text-tinte"
          : "border-linie text-tinte-leise hover:border-tinte-still"
      } ${istAktiv ? "pointer-events-none opacity-50" : ""}`}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/tiff"
        onChange={(e) => beiAuswahl(e, art)}
        disabled={istAktiv || gesperrt}
        className="sr-only"
      />
      {istAktiv ? "Wird hochgeladen …" : beschriftung}
    </label>
  );
}

export function Bilderverwaltung({
  werk,
  gesperrt = false,
}: {
  werk: Werk;
  gesperrt?: boolean;
}) {
  const router = useRouter();
  const [laeuft, setLaeuft] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [hinweis, setHinweis] = useState<string | null>(null);
  const [ueberZiel, setUeberZiel] = useState<Art | null>(null);

  /**
   * Liest Breite und Hoehe aus der Datei, ohne sie anzutasten.
   *
   * Die Masse landen in der Datenbank, damit der Browser spaeter den
   * Platz fuer das Bild reservieren kann. Ohne sie springt die Seite
   * beim Laden — in einer Galerie besonders stoerend.
   */
  async function leseMasse(datei: File): Promise<{ breite: number; hoehe: number }> {
    return new Promise((fertig) => {
      const adresse = URL.createObjectURL(datei);
      const bild = new Image();

      bild.onload = () => {
        URL.revokeObjectURL(adresse);
        fertig({ breite: bild.naturalWidth, hoehe: bild.naturalHeight });
      };
      bild.onerror = () => {
        URL.revokeObjectURL(adresse);
        // Kein Grund abzubrechen: ohne Masse laedt das Bild trotzdem,
        // die Seite kann nur den Platz nicht vorab reservieren.
        fertig({ breite: 0, hoehe: 0 });
      };

      bild.src = adresse;
    });
  }

  async function verarbeite(datei: File, art: Art) {
    setFehler(null);
    setHinweis(null);

    if (gesperrt) {
      setFehler("Vorschau-Modus: ohne Datenbank lässt sich nichts hochladen.");
      return;
    }

    setLaeuft(art);

    try {
      const masse = await leseMasse(datei);

      // --- Die Datei in den Speicher ------------------------------------
      // Unveraendert und unmittelbar aus dem Browser, unter der
      // Anmeldung dieser Sitzung. Es wird nichts verkleinert und nichts
      // umgerechnet: was hier hochgeht, wird spaeter genau so
      // ausgeliefert.
      const schluessel = speicherSchluessel(
        art === "signatur" ? "signaturen" : "werke",
        datei.name,
      );

      const speicher = supabaseBrowser();
      const { error: hochladeFehler } = await speicher.storage
        .from(BEHAELTER)
        .upload(schluessel, datei, {
          contentType: datei.type,
          upsert: true,
          cacheControl: "31536000",
        });

      if (hochladeFehler) {
        throw new Error(
          `Die Datei konnte nicht übertragen werden: ${hochladeFehler.message}`,
        );
      }

      // --- Beim Werk vermerken -------------------------------------------
      const formular = new FormData();
      formular.set("werkId", werk.id);
      formular.set("schluessel", schluessel);
      formular.set("art", art);
      formular.set("breitePx", String(masse.breite));
      formular.set("hoehePx", String(masse.hoehe));
      formular.set(
        "altText",
        art === "signatur"
          ? ""
          : `${werk.titel} — ${art === "haupt" ? "Gesamtansicht" : "Detailaufnahme"}`,
      );

      await speichereBild(formular);

      setHinweis("Hochgeladen.");
      router.refresh();
    } catch (problem) {
      setFehler(problem instanceof Error ? problem.message : "Unbekannter Fehler.");
    } finally {
      setLaeuft(null);
    }
  }

  function beiAuswahl(ereignis: ChangeEvent<HTMLInputElement>, art: Art) {
    const eingabe = ereignis.target;
    const datei = eingabe.files?.[0];
    if (!datei) return;

    // Das Feld leeren, sobald die Datei verarbeitet ist. Sonst laesst
    // sich dieselbe Datei kein zweites Mal auswaehlen — der Browser
    // meldet dann keine Aenderung.
    void verarbeite(datei, art).finally(() => {
      eingabe.value = "";
    });
  }

  function beiAblegen(ereignis: DragEvent<HTMLLabelElement>, art: Art) {
    ereignis.preventDefault();
    setUeberZiel(null);
    const datei = ereignis.dataTransfer.files?.[0];
    if (datei) void verarbeite(datei, art);
  }

  const hauptbild = werk.bilder.find((bild) => bild.art === "haupt");
  const details = werk.bilder.filter((bild) => bild.art === "detail");

  return (
    <div className="space-y-12">
      {(fehler || hinweis) && (
        <p
          role={fehler ? "alert" : "status"}
          className={`text-klein ${fehler ? "text-[#a33]" : "text-tinte-leise"}`}
        >
          {fehler ?? hinweis}
        </p>
      )}

      {/* --- Hauptbild ----------------------------------------------------- */}
      <section>
        <h3 className="beschriftung">Hauptbild</h3>
        <p className="mt-2 max-w-xl text-fluestern text-tinte-still">
          Die Gesamtansicht des Werks. Auf reinweißem Grund aufnehmen —
          nur dann steht das Werk auf der Seite ohne sichtbare Kante.
          Die Datei wird unverändert übernommen und genau so ausgeliefert,
          also bitte vorher auf eine sinnvolle Größe bringen.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-[14rem_1fr]">
          <div className="flex items-start">
            {hauptbild ? (
              <div className="w-full">
                <Werkbild
                  schluessel={hauptbild.schluessel}
                  alt=""
                  breitePx={hauptbild.breitePx}
                  hoehePx={hauptbild.hoehePx}
                  sizes="14rem"
                />
                <form action={entferneBild} className="mt-3">
                  <input type="hidden" name="bildId" value={hauptbild.id} />
                  <input type="hidden" name="werkId" value={werk.id} />
                  <button
                    type="submit"
                    disabled={gesperrt}
                    className="text-fluestern text-tinte-still transition-colors duration-300 hover:text-[#a33] disabled:opacity-40"
                  >
                    Entfernen
                  </button>
                </form>
              </div>
            ) : (
              <p className="text-fluestern text-tinte-still">Noch kein Hauptbild</p>
            )}
          </div>

          <Ablage
            art="haupt"
            beschriftung={
              hauptbild
                ? "Neues Hauptbild hierher ziehen oder klicken — das bisherige wird zur Detailaufnahme"
                : "Hauptbild hierher ziehen oder klicken"
            }
            istAktiv={laeuft === "haupt"}
            istZiel={ueberZiel === "haupt"}
            gesperrt={gesperrt}
            beiAuswahl={beiAuswahl}
            beiAblegen={beiAblegen}
            setUeberZiel={setUeberZiel}
          />
        </div>
      </section>

      {/* --- Detailaufnahmen ----------------------------------------------- */}
      <section>
        <h3 className="beschriftung">Detailaufnahmen</h3>
        <p className="mt-2 max-w-xl text-fluestern text-tinte-still">
          Nahaufnahmen von Pinselstruktur und Kanten. Sie zeigen, was ein
          Katalogbild nie zeigen kann — bei einem Original ist das das
          eigentliche Verkaufsargument.
        </p>

        {details.length > 0 && (
          <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {details.map((bild) => (
              <li key={bild.id}>
                <Werkbild
                  schluessel={bild.schluessel}
                  alt=""
                  breitePx={bild.breitePx}
                  hoehePx={bild.hoehePx}
                  sizes="12rem"
                />
                <form action={entferneBild} className="mt-2">
                  <input type="hidden" name="bildId" value={bild.id} />
                  <input type="hidden" name="werkId" value={werk.id} />
                  <button
                    type="submit"
                    disabled={gesperrt}
                    className="text-fluestern text-tinte-still transition-colors duration-300 hover:text-[#a33] disabled:opacity-40"
                  >
                    Entfernen
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6">
          <Ablage
            art="detail"
            beschriftung="Detailaufnahme hierher ziehen oder klicken"
            istAktiv={laeuft === "detail"}
            istZiel={ueberZiel === "detail"}
            gesperrt={gesperrt}
            beiAuswahl={beiAuswahl}
            beiAblegen={beiAblegen}
            setUeberZiel={setUeberZiel}
          />
        </div>
      </section>

      {/* --- Signatur ------------------------------------------------------ */}
      <section>
        <h3 className="beschriftung">Signatur</h3>
        <p className="mt-2 max-w-xl text-fluestern text-tinte-still">
          Die individuelle Signatur dieses Werks als freigestelltes PNG mit
          durchsichtigem Hintergrund. Sie erscheint unter dem Werk, am Ende der
          Geschichte und im Katalog beim Darüberfahren.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-[14rem_1fr]">
          <div className="flex items-start">
            {werk.signaturSchluessel ? (
              <div>
                <Signatur
                  schluessel={werk.signaturSchluessel}
                  werkTitel={werk.titel}
                  breite={200}
                />
                <form action={entferneSignatur} className="mt-3">
                  <input type="hidden" name="werkId" value={werk.id} />
                  <button
                    type="submit"
                    disabled={gesperrt}
                    className="text-fluestern text-tinte-still transition-colors duration-300 hover:text-[#a33] disabled:opacity-40"
                  >
                    Entfernen
                  </button>
                </form>
              </div>
            ) : (
              <p className="text-fluestern text-tinte-still">Noch keine Signatur</p>
            )}
          </div>

          <Ablage
            art="signatur"
            beschriftung="Signatur-PNG hierher ziehen oder klicken"
            istAktiv={laeuft === "signatur"}
            istZiel={ueberZiel === "signatur"}
            gesperrt={gesperrt}
            beiAuswahl={beiAuswahl}
            beiAblegen={beiAblegen}
            setUeberZiel={setUeberZiel}
          />
        </div>
      </section>
    </div>
  );
}
