import sharp from "sharp";
import { SIGNATUR_BREITEN, VARIANTEN_BREITEN } from "@/lib/bildformate";

/**
 * Bildverarbeitung beim Hochladen.
 *
 * Hier entscheidet sich, ob der rahmenlose Grundsatz der Seite in der
 * Praxis haelt. Ein Gemaelde, das auf einem leicht grauen oder
 * gelbstichigen Weiss fotografiert wurde, bekommt auf reinweissem
 * Grund sofort eine sichtbare Kante — und zwar eine rechteckige, die
 * niemand uebersieht.
 *
 * Darum wird jedes Bild beim Hochladen gemessen und auf Wunsch
 * korrigiert, bevor es ueberhaupt in den Speicher kommt.
 */

export type Weissbefund = {
  /** Gemessener Hintergrundwert an den Raendern. */
  gemessen: { r: number; g: number; b: number };
  /** Groesste Abweichung von 255 ueber alle Kanaele. */
  abweichung: number;
  /** Bis 2 gilt als reinweiss — das ist unter der Wahrnehmungsschwelle. */
  istReinweiss: boolean;
  /** Ab 24 ist es kein Weiss mehr, sondern ein farbiger Grund. */
  istKorrigierbar: boolean;
};

/**
 * Misst den Hintergrund an den Bildraendern.
 *
 * Gemessen wird nicht an einzelnen Eckpunkten, sondern an vier
 * Randstreifen. Ein einzelnes Pixel kann durch Rauschen oder einen
 * Staubkorn-Schatten danebenliegen; der Median ueber tausende Punkte
 * nicht.
 */
export async function messeHintergrund(puffer: Buffer): Promise<Weissbefund> {
  const bild = sharp(puffer);
  const { width = 0, height = 0 } = await bild.metadata();

  if (!width || !height) {
    return {
      gemessen: { r: 255, g: 255, b: 255 },
      abweichung: 0,
      istReinweiss: true,
      istKorrigierbar: false,
    };
  }

  // Auf Handformat verkleinern: schnell, und Rauschen mittelt sich
  // dabei bereits heraus.
  const breite = 200;
  const hoehe = Math.max(1, Math.round((height / width) * breite));
  const roh = await sharp(puffer)
    .resize(breite, hoehe, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer();

  const streifen = Math.max(2, Math.round(breite * 0.04));
  const werte: number[][] = [[], [], []];

  const nimm = (x: number, y: number) => {
    const index = (y * breite + x) * 3;
    werte[0].push(roh[index]);
    werte[1].push(roh[index + 1]);
    werte[2].push(roh[index + 2]);
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

  // Median statt Mittelwert: ein dunkles Werk, das bis an den Rand
  // reicht, wuerde den Mittelwert verziehen, den Median kaum.
  const median = (liste: number[]) => {
    const sortiert = [...liste].sort((a, b) => a - b);
    return sortiert[Math.floor(sortiert.length / 2)] ?? 255;
  };

  const gemessen = {
    r: median(werte[0]),
    g: median(werte[1]),
    b: median(werte[2]),
  };

  const abweichung = Math.max(
    255 - gemessen.r,
    255 - gemessen.g,
    255 - gemessen.b,
  );

  return {
    gemessen,
    abweichung,
    istReinweiss: abweichung <= 2,
    istKorrigierbar: abweichung > 2 && abweichung <= 24,
  };
}

/**
 * Zieht den gemessenen Hintergrund auf exaktes Reinweiss.
 *
 * Jeder Farbkanal wird mit dem Faktor gestreckt, der seinen
 * Randwert auf 255 bringt. Das ist ein echter Weissabgleich: er
 * entfernt nebenbei einen Farbstich, weil die drei Kanaele
 * unterschiedlich stark gestreckt werden.
 *
 * Die Gemaeldefarben verschieben sich dabei mit — das ist gewollt und
 * genau der Punkt. Wer bei Kunstlicht fotografiert, hat den Stich auch
 * im Bild, nicht nur am Rand.
 */
export async function ziehAufReinweiss(
  puffer: Buffer,
  befund: Weissbefund,
): Promise<Buffer> {
  if (befund.istReinweiss) return puffer;

  const faktor = (wert: number) => Math.min(1.35, 255 / Math.max(1, wert));

  return sharp(puffer)
    .linear(
      [faktor(befund.gemessen.r), faktor(befund.gemessen.g), faktor(befund.gemessen.b)],
      [0, 0, 0],
    )
    .toBuffer();
}

export type Variante = {
  schluessel: string;
  puffer: Buffer;
  typ: string;
};

/**
 * Erzeugt alle Groessen- und Formatvarianten eines Bildes.
 *
 * Das passiert beim Hochladen und nicht bei jedem Abruf: so kostet die
 * Auslieferung nichts, und die Qualitaet ist einmal geprueft statt bei
 * jedem Aufruf neu berechnet.
 *
 * AVIF zuerst, weil es bei Malerei mit ihren weichen Farbverlaeufen
 * deutlich kleiner ausfaellt als WebP. JPEG bleibt als letzte Sicherung.
 */
export async function erzeugeVarianten(
  puffer: Buffer,
  praefix: string,
  breiten: readonly number[] = VARIANTEN_BREITEN,
): Promise<{ varianten: Variante[]; breitePx: number; hoehePx: number }> {
  const metadaten = await sharp(puffer).metadata();
  const breitePx = metadaten.width ?? 0;
  const hoehePx = metadaten.height ?? 0;

  const varianten: Variante[] = [];

  // Die Ausgangsdatei bleibt unangetastet erhalten. Sie ist das Archiv:
  // aus ihr lassen sich Varianten jederzeit neu erzeugen, etwa wenn ein
  // neues Bildformat dazukommt.
  varianten.push({
    schluessel: `${praefix}/original.jpg`,
    puffer: await sharp(puffer).jpeg({ quality: 95, chromaSubsampling: "4:4:4" }).toBuffer(),
    typ: "image/jpeg",
  });

  for (const breite of breiten) {
    // Kein Hochrechnen: eine 4000-Punkte-Variante aus einem
    // 1200-Punkte-Bild waere nur groesser, nicht besser.
    if (breitePx && breite > breitePx * 1.05) continue;

    const verkleinert = sharp(puffer).resize(breite, undefined, {
      withoutEnlargement: true,
      kernel: "lanczos3",
    });

    const name = String(breite).padStart(4, "0");

    varianten.push({
      schluessel: `${praefix}/${name}.avif`,
      puffer: await verkleinert.clone().avif({ quality: 62, effort: 4 }).toBuffer(),
      typ: "image/avif",
    });

    varianten.push({
      schluessel: `${praefix}/${name}.webp`,
      puffer: await verkleinert.clone().webp({ quality: 82 }).toBuffer(),
      typ: "image/webp",
    });

    varianten.push({
      schluessel: `${praefix}/${name}.jpg`,
      puffer: await verkleinert
        .clone()
        .jpeg({ quality: 86, chromaSubsampling: "4:4:4", mozjpeg: true })
        .toBuffer(),
      typ: "image/jpeg",
    });
  }

  return { varianten, breitePx, hoehePx };
}

/**
 * Varianten einer Signatur.
 *
 * Signaturen behalten ihre Transparenz — sie liegen auf der Seite frei
 * auf dem Papier, ohne eigene Flaeche. Deshalb PNG und WebP statt JPEG.
 */
export async function erzeugeSignaturVarianten(
  puffer: Buffer,
  praefix: string,
): Promise<{ varianten: Variante[]; breitePx: number; hoehePx: number }> {
  const metadaten = await sharp(puffer).metadata();
  const breitePx = metadaten.width ?? 0;
  const hoehePx = metadaten.height ?? 0;

  const varianten: Variante[] = [
    {
      schluessel: `${praefix}/original.png`,
      puffer: await sharp(puffer).png({ compressionLevel: 9 }).toBuffer(),
      typ: "image/png",
    },
  ];

  for (const breite of SIGNATUR_BREITEN) {
    if (breitePx && breite > breitePx * 1.05) continue;

    const verkleinert = sharp(puffer).resize(breite, undefined, {
      withoutEnlargement: true,
      kernel: "lanczos3",
    });

    const name = String(breite).padStart(4, "0");

    varianten.push({
      schluessel: `${praefix}/${name}.webp`,
      puffer: await verkleinert.clone().webp({ quality: 92, alphaQuality: 100 }).toBuffer(),
      typ: "image/webp",
    });

    varianten.push({
      schluessel: `${praefix}/${name}.png`,
      puffer: await verkleinert.clone().png({ compressionLevel: 9 }).toBuffer(),
      typ: "image/png",
    });
  }

  return { varianten, breitePx, hoehePx };
}
