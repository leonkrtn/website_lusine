/**
 * Rechnet den Schriftzug aus src/app/icon.svg in die Rasterfassungen um.
 *
 *   node scripts/favicon-erzeugen.mjs
 *
 * - `src/app/favicon.ico` — 16, 32 und 48 Punkt, für Browser, die kein
 *   SVG-Favicon nehmen
 * - `src/app/apple-icon.png` — 180 Punkt, für den Startbildschirm
 *
 * Das SVG selbst entsteht aus der Schrift, siehe
 * scripts/favicon-schriftzug.py.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const APP = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "app");
const svg = readFileSync(join(APP, "icon.svg"));

const raster = (groesse) =>
  sharp(svg, { density: 72 * (groesse / 1000) * 8 })
    .resize(groesse, groesse)
    .png()
    .toBuffer();

// Eine ICO-Datei ist ein Verzeichnis, dem die PNG-Dateien unverändert
// folgen. Seit Windows Vista versteht das jeder Browser.
const groessen = [16, 32, 48];
const bilder = await Promise.all(groessen.map(raster));

const kopf = Buffer.alloc(6 + 16 * bilder.length);
kopf.writeUInt16LE(0, 0);
kopf.writeUInt16LE(1, 2);
kopf.writeUInt16LE(bilder.length, 4);

let versatz = kopf.length;
bilder.forEach((bild, nummer) => {
  const eintrag = 6 + 16 * nummer;
  kopf.writeUInt8(groessen[nummer], eintrag);
  kopf.writeUInt8(groessen[nummer], eintrag + 1);
  kopf.writeUInt16LE(1, eintrag + 4);
  kopf.writeUInt16LE(32, eintrag + 6);
  kopf.writeUInt32LE(bild.length, eintrag + 8);
  kopf.writeUInt32LE(versatz, eintrag + 12);
  versatz += bild.length;
});

writeFileSync(join(APP, "favicon.ico"), Buffer.concat([kopf, ...bilder]));
writeFileSync(join(APP, "apple-icon.png"), await raster(180));

console.log("favicon.ico und apple-icon.png geschrieben");
