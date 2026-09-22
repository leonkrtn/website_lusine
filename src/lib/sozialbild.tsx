import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { bildQuelle, istLokalesBild, masseText } from "@/lib/bilder";
import { detailbilder, hauptbild } from "@/lib/darstellung";
import { seitenUrl } from "@/lib/umgebung";
import type { Werk, WerkBild } from "@/lib/typen";

/**
 * Die Bilder, mit denen ein Werk die Seite verlässt.
 *
 * Draußen — in einer Linkvorschau, auf Pinterest, auf Instagram —
 * gilt dieselbe Regel wie drinnen: das Werk steht ohne Kante auf
 * reinweißem Grund, und neben ihm hängt höchstens sein Saalschild.
 * Das Originalfoto wird dabei nicht angetastet, nur auf eine weiße
 * Fläche gesetzt.
 *
 * **Der Name steht dort, wo viele Hände hängen.** Auf der Seite fehlt
 * er im Saalschild, weil dort nur eine Hand hängt (siehe
 * `Saalschild.tsx`). Eine Linkvorschau und eine Pinnwand sind aber
 * das Gegenteil: dort hängt das Werk zwischen fremden. Ein Pin wird
 * weitergemerkt, bis niemand mehr weiß, woher er kam — also trägt das
 * Schild dort den Namen und die Adresse. Auf Instagram steht das Werk
 * im eigenen Profil; dort ist der Name schon da, und das Bild bleibt
 * allein.
 */

export const FORMATE = {
  /** Linkvorschau in Nachrichten, Suchmaschinen, sozialen Netzen. */
  vorschau: { breite: 1200, hoehe: 630 },
  /** Hochformat für Pinterest, 2 : 3. */
  pinterest: { breite: 1000, hoehe: 1500 },
  /** Hochformat für den Instagram-Beitrag, 4 : 5. */
  instagram: { breite: 1080, hoehe: 1350 },
  /** Die Nahaufnahme als erstes Bild eines Instagram-Beitrags. */
  "instagram-nah": { breite: 1080, hoehe: 1350 },
} as const;

export type Format = keyof typeof FORMATE;

export function istFormat(wert: string): wert is Format {
  return Object.hasOwn(FORMATE, wert);
}

/*
 * Die Schrift als statische Schnitte. Die Bildsatz-Bibliothek liest
 * weder woff2 noch variable Schriften; die beiden Dateien sind aus
 * denselben Quellen erzeugt wie die der Seite (src/schriften/HERKUNFT.md).
 */
const [schriftGerade, schriftKursiv] = await Promise.all([
  readFile(join(process.cwd(), "src/schriften/EBGaramond-Bildsatz.ttf")),
  readFile(join(process.cwd(), "src/schriften/EBGaramond-Bildsatz-Kursiv.ttf")),
]);

const SCHRIFTEN = [
  { name: "Garamond", data: schriftGerade, style: "normal" as const, weight: 400 as const },
  { name: "Garamond", data: schriftKursiv, style: "italic" as const, weight: 400 as const },
];

const TINTE = "#111111";
const TINTE_LEISE = "#5f5a55";

/**
 * Das Bild als Daten-Adresse — oder null, wenn es sich nicht setzen
 * lässt. Der Bildsatz kennt nur JPEG und PNG; ein WebP- oder
 * HEIC-Foto wird nicht umgerechnet, sondern ausgelassen.
 */
async function bildDaten(schluessel: string): Promise<string | null> {
  try {
    let daten: Buffer;

    if (istLokalesBild(schluessel)) {
      daten = await readFile(join(process.cwd(), "public", schluessel));
    } else {
      const antwort = await fetch(bildQuelle(schluessel));
      if (!antwort.ok) return null;
      daten = Buffer.from(await antwort.arrayBuffer());
    }

    const art =
      daten[0] === 0xff && daten[1] === 0xd8
        ? "image/jpeg"
        : daten[0] === 0x89 && daten[1] === 0x50
          ? "image/png"
          : null;
    if (!art) return null;

    return `data:${art};base64,${daten.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Wie groß ein Bild in einem Kasten steht, ohne beschnitten zu werden. */
function eingepasst(bild: WerkBild, breite: number, hoehe: number) {
  const b = bild.breitePx || 4;
  const h = bild.hoehePx || 5;
  const massstab = Math.min(breite / b, hoehe / h);
  return { width: Math.round(b * massstab), height: Math.round(h * massstab) };
}

/** Die Adresse der Seite ohne Protokoll, so wie man sie abschreibt. */
function adresseKurz(): string {
  return seitenUrl().replace(/^https?:\/\//, "").replace(/^www\./, "");
}

/**
 * Das Saalschild als Bildsatz — dieselben Angaben in derselben Folge
 * wie auf der Seite, aber mit dem Namen der Künstlerin darüber und
 * ohne Preis: ein Preis veraltet, ein geteiltes Bild nicht.
 */
function Schild({ werk, groesse }: { werk: Werk; groesse: number }) {
  const masse = masseText(werk.breiteCm, werk.hoeheCm, werk.tiefeCm);
  const angaben = [werk.technik, masse].filter(Boolean) as string[];

  return (
    <div style={{ display: "flex", flexDirection: "column", color: TINTE }}>
      <div
        style={{
          fontSize: groesse * 0.62,
          letterSpacing: groesse * 0.06,
          textTransform: "uppercase",
          color: TINTE_LEISE,
          marginBottom: groesse * 0.7,
        }}
      >
        Lusine
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", fontSize: groesse * 1.25, lineHeight: 1.2 }}>
        <span style={{ fontStyle: "italic" }}>{werk.titel}</span>
        {werk.jahr && <span>, {werk.jahr}</span>}
      </div>
      {angaben.map((zeile) => (
        <div key={zeile} style={{ fontSize: groesse, color: TINTE_LEISE, marginTop: groesse * 0.35 }}>
          {zeile}
        </div>
      ))}
      <div style={{ fontSize: groesse * 0.8, color: TINTE_LEISE, marginTop: groesse * 1.4 }}>
        {adresseKurz()}
      </div>
    </div>
  );
}

/**
 * Setzt ein Werk in eines der Formate. Gibt null zurück, wenn es
 * dafür kein geeignetes Bild gibt.
 */
export async function sozialbild(werk: Werk, format: Format): Promise<ImageResponse | null> {
  const { breite, hoehe } = FORMATE[format];
  const optionen = { width: breite, height: hoehe, fonts: SCHRIFTEN };

  const grund = {
    display: "flex",
    width: "100%",
    height: "100%",
    background: "#ffffff",
    fontFamily: "Garamond",
  } as const;

  /* Die Nahaufnahme füllt das Format. Hier ist ein Rechteck aus Farbe
     die Sache selbst, kein zugeschnittenes Werk — wie bei den
     Detailaufnahmen auf der Werkseite. */
  if (format === "instagram-nah") {
    const detail = detailbilder(werk.bilder)[0];
    const daten = detail ? await bildDaten(detail.schluessel) : null;
    if (!detail || !daten) return null;

    return new ImageResponse(
      (
        <div style={grund}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={daten}
            alt=""
            width={breite}
            height={hoehe}
            style={{ width: breite, height: hoehe, objectFit: "cover" }}
          />
        </div>
      ),
      optionen,
    );
  }

  const bild = hauptbild(werk.bilder);
  const daten = bild ? await bildDaten(bild.schluessel) : null;

  if (!bild || !daten) {
    /* Eine Linkvorschau braucht immer ein Bild, sonst zeigt die
       Nachricht ein leeres Feld. Ohne setzbares Foto steht dort
       wenigstens das Schild. */
    if (format !== "vorschau") return null;
    return new ImageResponse(
      (
        <div style={{ ...grund, alignItems: "center", paddingLeft: 140 }}>
          <Schild werk={werk} groesse={34} />
        </div>
      ),
      optionen,
    );
  }

  /* Instagram: das Werk allein, mittig, mit gleichem Rand in jedem
     Beitrag. Das Profil zeigt die Beiträge beschnitten auf 3 : 4 — der
     Kasten bleibt darum schmal genug, dass der Schnitt nur Weiß trifft.
     So wird das Raster des Profils selbst zur Wand. */
  if (format === "instagram") {
    const mass = eingepasst(bild, 820, 1060);
    return new ImageResponse(
      (
        <div style={{ ...grund, alignItems: "center", justifyContent: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={daten} alt="" {...mass} style={mass} />
        </div>
      ),
      optionen,
    );
  }

  /* Pinterest: das Werk oben, das Schild darunter, linksbündig an der
     Kante des Werks — so wie das Schild auf dem Handy unter das Werk
     rutscht. */
  if (format === "pinterest") {
    const mass = eingepasst(bild, 820, 1020);
    return new ImageResponse(
      (
        <div style={{ ...grund, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", width: mass.width }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={daten} alt="" {...mass} style={mass} />
            <div style={{ display: "flex", marginTop: 56, width: Math.max(mass.width, 460) }}>
              <Schild werk={werk} groesse={27} />
            </div>
          </div>
        </div>
      ),
      optionen,
    );
  }

  /* Die Linkvorschau ist quer: Werk und Schild nebeneinander, wie an
     der Wand. */
  const mass = eingepasst(bild, 620, 530);
  return new ImageResponse(
    (
      <div style={{ ...grund, alignItems: "center", padding: "0 70px" }}>
        <div style={{ display: "flex", justifyContent: "center", width: 640 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={daten} alt="" {...mass} style={mass} />
        </div>
        <div style={{ display: "flex", marginLeft: 56, width: 360 }}>
          <Schild werk={werk} groesse={26} />
        </div>
      </div>
    ),
    optionen,
  );
}
