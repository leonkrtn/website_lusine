"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type DragEvent } from "react";
import { Werkbild } from "@/components/Werkbild";
import { Signatur } from "@/components/Signatur";
import { entferneBild, entferneSignatur } from "@/app/admin/aktionen";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { BEHAELTER, speicherSchluessel } from "@/lib/bilder";
import type { Werk } from "@/lib/typen";

type Befund = {
  gemessen: { r: number; g: number; b: number };
  abweichung: number;
  istReinweiss: boolean;
  istKorrigierbar: boolean;
};

/**
 * Misst den Bildhintergrund im Browser, bevor hochgeladen wird.
 *
 * Das ist der Kern des rahmenlosen Grundsatzes: ein Gemaelde, das auf
 * einem leicht grauen oder gelbstichigen Weiss fotografiert wurde,
 * bekommt auf reinweissem Grund eine sichtbare rechteckige Kante.
 *
 * Die Messung hier ersetzt nicht die auf dem Server — sie erlaubt nur,
 * das Problem zu zeigen und die Entscheidung einzuholen, bevor
 * Megabyte durch die Leitung gehen.
 */
async function messeRand(datei: File): Promise<Befund | null> {
  const bild = await new Promise<HTMLImageElement | null>((fertig) => {
    const element = new Image();
    const adresse = URL.createObjectURL(datei);
    element.onload = () => {
      URL.revokeObjectURL(adresse);
      fertig(element);
    };
    element.onerror = () => {
      URL.revokeObjectURL(adresse);
      fertig(null);
    };
    element.src = adresse;
  });

  if (!bild) return null;

  const breite = 160;
  const hoehe = Math.max(1, Math.round((bild.naturalHeight / bild.naturalWidth) * breite));

  const flaeche = document.createElement("canvas");
  flaeche.width = breite;
  flaeche.height = hoehe;

  const stift = flaeche.getContext("2d", { willReadFrequently: true });
  if (!stift) return null;

  stift.drawImage(bild, 0, 0, breite, hoehe);

  let punkte: number[][];
  try {
    const daten = stift.getImageData(0, 0, breite, hoehe).data;
    const streifen = Math.max(2, Math.round(breite * 0.05));
    punkte = [[], [], []];

    const nimm = (x: number, y: number) => {
      const index = (y * breite + x) * 4;
      punkte[0].push(daten[index]);
      punkte[1].push(daten[index + 1]);
      punkte[2].push(daten[index + 2]);
    };

    for (let y = 0; y < hoehe; y += 1) {
      for (let x = 0; x < streifen; x += 1) {
        nimm(x, y);
        nimm(breite - 1 - x, y);
      }
    }
    for (let x = 0; x < breite; x += 1) {
      for (let y = 0; y < streifen; y += 1) {
        nimm(x, y);
        nimm(x, hoehe - 1 - y);
      }
    }
  } catch {
    // Kann bei fremden Bildquellen fehlschlagen. Dann uebernimmt
    // allein die Messung auf dem Server.
    return null;
  }

  const median = (liste: number[]) => {
    const sortiert = [...liste].sort((a, b) => a - b);
    return sortiert[Math.floor(sortiert.length / 2)] ?? 255;
  };

  const gemessen = { r: median(punkte[0]), g: median(punkte[1]), b: median(punkte[2]) };
  const abweichung = Math.max(255 - gemessen.r, 255 - gemessen.g, 255 - gemessen.b);

  return {
    gemessen,
    abweichung,
    istReinweiss: abweichung <= 2,
    istKorrigierbar: abweichung > 2 && abweichung <= 24,
  };
}

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
      {istAktiv ? "Wird verarbeitet — das dauert einen Moment …" : beschriftung}
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

  async function verarbeite(datei: File, art: Art) {
    setFehler(null);
    setHinweis(null);

    if (gesperrt) {
      setFehler("Vorschau-Modus: ohne Datenbank lässt sich nichts hochladen.");
      return;
    }

    setLaeuft(art);

    try {
      // --- Weissabgleich pruefen, bevor irgendetwas hochgeht -------------
      let korrigieren = false;

      if (art !== "signatur") {
        const befund = await messeRand(datei);

        if (befund && !befund.istReinweiss) {
          const { r, g, b } = befund.gemessen;

          if (befund.istKorrigierbar) {
            korrigieren = window.confirm(
              `Der Bildhintergrund ist nicht reinweiß, sondern ${r}, ${g}, ${b}.\n\n` +
                "Auf der Seite bekäme das Werk dadurch eine sichtbare rechteckige Kante.\n\n" +
                "Soll der Hintergrund automatisch auf Reinweiß gezogen werden? " +
                "Dabei verschieben sich auch die Bildfarben leicht — das gleicht " +
                "einen Farbstich der Aufnahme mit aus.\n\n" +
                "OK = korrigieren, Abbrechen = unverändert hochladen",
            );
          } else {
            const weiter = window.confirm(
              `Der Bildhintergrund weicht deutlich von Weiß ab (${r}, ${g}, ${b}).\n\n` +
                "Das lässt sich nicht mehr sinnvoll korrigieren — das Werk bekäme " +
                "auf der Seite eine sichtbare Kante.\n\n" +
                "Empfehlung: das Werk auf reinweißem Grund neu fotografieren oder freistellen.\n\n" +
                "Trotzdem hochladen?",
            );
            if (!weiter) {
              setLaeuft(null);
              return;
            }
          }
        }
      }

      // --- Schritt 1: die Ausgangsdatei in den Speicher -----------------
      // Unmittelbar aus dem Browser, unter der Anmeldung dieser Sitzung.
      // Der Umweg ueber den eigenen Server entfaellt damit — er koennte
      // ein Gemaeldefoto in voller Aufloesung ohnehin nicht annehmen,
      // weil Serverless-Funktionen den Datenstrom eng begrenzen.
      const praefix = speicherSchluessel(
        art === "signatur" ? "signaturen" : "werke",
        datei.name,
      );
      const endung = datei.type === "image/png" ? "png" : "jpg";
      const ablage = `${praefix}/original.${endung}`;

      const speicher = supabaseBrowser();
      const { error: hochladeFehler } = await speicher.storage
        .from(BEHAELTER)
        .upload(ablage, datei, { contentType: datei.type, upsert: true });

      if (hochladeFehler) {
        throw new Error(
          `Die Datei konnte nicht übertragen werden: ${hochladeFehler.message}`,
        );
      }

      // --- Schritt 2: umrechnen und eintragen ---------------------------
      const verarbeitung = await fetch("/api/admin/upload/verarbeiten", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          praefix,
          ablage,
          werkId: werk.id,
          art,
          altText:
            art === "signatur" ? "" : `${werk.titel} — ${art === "haupt" ? "Gesamtansicht" : "Detailaufnahme"}`,
          weissKorrigieren: korrigieren,
        }),
      });

      const ergebnis = await verarbeitung.json();
      if (!verarbeitung.ok) throw new Error(ergebnis.fehler ?? "Verarbeitung fehlgeschlagen.");

      setHinweis(
        korrigieren
          ? "Hochgeladen und auf Reinweiß korrigiert."
          : "Hochgeladen.",
      );
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
          Die Gesamtansicht des Werks. Am besten auf reinweißem Grund
          aufgenommen, mit mindestens 3000 Punkten an der langen Kante.
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
