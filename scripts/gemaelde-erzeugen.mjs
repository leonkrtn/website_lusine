/**
 * Erzeugt die abstrakten Platzhalter-Gemaelde und Signaturen.
 *
 *   node scripts/gemaelde-erzeugen.mjs
 *
 * Die Bilder sind keine Fotos, sondern programmatisch erzeugte
 * Farbfelder. Entscheidend ist eine einzige Eigenschaft: sie laufen zum
 * Rand hin in echtes #FFFFFF aus. Nur so laesst sich beurteilen, ob der
 * rahmenlose Effekt der Seite wirklich traegt — mit grauen Rechtecken
 * oder abfotografierten Leinwaenden ginge das nicht.
 *
 * Am Ende prueft das Skript jedes erzeugte Bild daraufhin nach.
 */

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..");
const WERKE_AUS = join(WURZEL, "public", "werke");
const SIGNATUREN_AUS = join(WURZEL, "public", "signaturen");

// ---------------------------------------------------------------------------
//  Deterministischer Zufall
//
//  Gleicher Aufruf, gleiches Bild. Ohne das waere jede Ausfuehrung ein
//  anderer Satz Bilder und der Git-Verlauf voller Rauschen.
// ---------------------------------------------------------------------------

function zufallAus(saat) {
  let zustand = saat >>> 0;
  return function naechste() {
    zustand = (zustand + 0x6d2b79f5) >>> 0;
    let t = zustand;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function saatAusText(text) {
  let wert = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    wert ^= text.charCodeAt(i);
    wert = Math.imul(wert, 16777619);
  }
  return wert >>> 0;
}

// ---------------------------------------------------------------------------
//  Farbe
// ---------------------------------------------------------------------------

function hexZuRgb(hex) {
  const sauber = hex.replace("#", "");
  return [
    parseInt(sauber.slice(0, 2), 16),
    parseInt(sauber.slice(2, 4), 16),
    parseInt(sauber.slice(4, 6), 16),
  ];
}

/** Weiche Stufenfunktion — der Grund, warum nichts harte Kanten bekommt. */
function weich(rand0, rand1, wert) {
  const t = Math.min(1, Math.max(0, (wert - rand0) / (rand1 - rand0)));
  return t * t * (3 - 2 * t);
}

// ---------------------------------------------------------------------------
//  Ein Gemaelde
// ---------------------------------------------------------------------------

/**
 * Baut das Farbfeld in halber Aufloesung auf und laesst sharp es
 * hochrechnen. Bei weichen Verlaeufen ist das nicht zu sehen, spart aber
 * das Vierfache an Rechenzeit.
 */
function erzeugeFarbfeld(zielBreite, zielHoehe, palette, saat) {
  const b = Math.round(zielBreite / 1.5);
  const h = Math.round(zielHoehe / 1.5);
  const rnd = zufallAus(saat);

  const farben = palette.map(hexZuRgb);

  // Jeder Fleck ist eine organisch verzogene Ellipse. Die Verziehung
  // entsteht durch eine Welle auf dem Radius — dadurch wirkt die Form
  // gewachsen statt konstruiert.
  const anzahlFlecken = 7 + Math.floor(rnd() * 4);
  const flecken = [];
  for (let i = 0; i < anzahlFlecken; i += 1) {
    flecken.push({
      // Die Zentren liegen dicht beieinander, damit eine
      // zusammenhaengende Malflaeche entsteht und keine verstreuten
      // Farbinseln.
      cx: (0.27 + rnd() * 0.46) * b,
      cy: (0.27 + rnd() * 0.46) * h,
      rx: (0.3 + rnd() * 0.26) * b,
      ry: (0.3 + rnd() * 0.26) * h,
      drehung: rnd() * Math.PI,
      farbe: farben[Math.floor(rnd() * farben.length)],
      staerke: 0.5 + rnd() * 0.45,
      wellen: 2 + Math.floor(rnd() * 4),
      wellenTiefe: 0.1 + rnd() * 0.26,
      phase: rnd() * Math.PI * 2,
    });
  }

  // Die aeussere Form des Farbfelds. Eine organisch verzogene Ellipse,
  // die deutlich vor dem Bildrand auf null geht.
  //
  // Ohne sie schneidet die Randabblendung die Farbflaeche rechteckig ab
  // — und ein Rechteck ist genau der sichtbare Rahmen, den es auf dieser
  // Seite nicht geben darf.
  const form = {
    rx: b * 0.42,
    ry: h * 0.42,
    wellen1: 2 + Math.floor(rnd() * 3),
    wellen2: 4 + Math.floor(rnd() * 4),
    tiefe1: 0.06 + rnd() * 0.08,
    tiefe2: 0.03 + rnd() * 0.05,
    phase1: rnd() * Math.PI * 2,
    phase2: rnd() * Math.PI * 2,
  };

  const rgb = new Float32Array(b * h * 3).fill(255);
  const deckung = new Float32Array(b * h);

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < b; x += 1) {
      const index = y * b + x;
      let r = 255;
      let g = 255;
      let bl = 255;
      let gesamt = 0;

      for (const fleck of flecken) {
        const dx = x - fleck.cx;
        const dy = y - fleck.cy;
        const cos = Math.cos(fleck.drehung);
        const sin = Math.sin(fleck.drehung);
        const ux = (dx * cos + dy * sin) / fleck.rx;
        const uy = (-dx * sin + dy * cos) / fleck.ry;

        const abstand = Math.hypot(ux, uy);
        if (abstand > 1.6) continue;

        const winkel = Math.atan2(uy, ux);
        const verzug =
          1 + Math.sin(winkel * fleck.wellen + fleck.phase) * fleck.wellenTiefe;

        // Sehr weicher Rand: von innen (0.15) nach aussen (1.0) ausblenden.
        const anteil = (1 - weich(0.42, 1.02, abstand / verzug)) * fleck.staerke;
        if (anteil <= 0) continue;

        // Farben legen sich uebereinander wie Lasuren, nicht wie Deckfarbe.
        r = r * (1 - anteil) + fleck.farbe[0] * anteil;
        g = g * (1 - anteil) + fleck.farbe[1] * anteil;
        bl = bl * (1 - anteil) + fleck.farbe[2] * anteil;
        gesamt = Math.min(1, gesamt + anteil);
      }

      // Aeussere Form: was ausserhalb liegt, ist Papier.
      const fx = (x - b / 2) / form.rx;
      const fy = (y - h / 2) / form.ry;
      const fAbstand = Math.hypot(fx, fy);
      const fWinkel = Math.atan2(fy, fx);
      const fVerzug =
        1 +
        Math.sin(fWinkel * form.wellen1 + form.phase1) * form.tiefe1 +
        Math.sin(fWinkel * form.wellen2 + form.phase2) * form.tiefe2;
      const maske = 1 - weich(0.62, 1.0, fAbstand / fVerzug);

      rgb[index * 3] = 255 * (1 - maske) + r * maske;
      rgb[index * 3 + 1] = 255 * (1 - maske) + g * maske;
      rgb[index * 3 + 2] = 255 * (1 - maske) + bl * maske;
      deckung[index] = gesamt * maske;
    }
  }

  // --- Pinselstruktur ------------------------------------------------------
  // Kurze gerichtete Striche, die aufhellen oder abdunkeln. Sie liegen
  // nur dort, wo schon Farbe ist — auf dem weissen Grund waere jeder
  // Strich ein sichtbarer Fleck im vermeintlich leeren Raum.
  const anzahlStriche = Math.round((b * h) / 420);
  for (let i = 0; i < anzahlStriche; i += 1) {
    const x0 = rnd() * b;
    const y0 = rnd() * h;
    const startIndex = Math.floor(y0) * b + Math.floor(x0);
    if (deckung[startIndex] < 0.12) continue;

    const laenge = 6 + rnd() * 26;
    const winkel = rnd() * Math.PI * 2;
    const staerke = (rnd() - 0.45) * 38;
    const dx = Math.cos(winkel);
    const dy = Math.sin(winkel);

    for (let s = 0; s < laenge; s += 1) {
      const x = Math.round(x0 + dx * s);
      const y = Math.round(y0 + dy * s);
      if (x < 0 || y < 0 || x >= b || y >= h) break;

      const index = y * b + x;
      // Der Strich verblasst dorthin, wo die Farbe duenner wird.
      const gewicht = deckung[index] * (1 - s / laenge) * 0.55;
      if (gewicht <= 0) continue;

      for (let k = 0; k < 3; k += 1) {
        const neu = rgb[index * 3 + k] + staerke * gewicht;
        rgb[index * 3 + k] = Math.min(255, Math.max(0, neu));
      }
    }
  }

  // --- Ausblenden zum Rand -------------------------------------------------
  // Der wichtigste Schritt. Zum Rand hin geht alles in reines Weiss
  // ueber, damit das Bild ohne Kante auf der Seite steht.
  // Die aeussere Form laesst die Farbe ohnehin vor dem Rand enden. Diese
  // Abblendung ist nur die Garantie fuer die letzten Bildpunkte — sie
  // greift ueber einen sehr schmalen Streifen und bleibt dadurch
  // unsichtbar.
  const randX = b * 0.05;
  const randY = h * 0.05;

  const ausgabe = Buffer.alloc(b * h * 3);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < b; x += 1) {
      const index = y * b + x;

      const naehe = Math.min(
        weich(0, randX, x),
        weich(0, randX, b - 1 - x),
        weich(0, randY, y),
        weich(0, randY, h - 1 - y),
      );

      for (let k = 0; k < 3; k += 1) {
        const wert = rgb[index * 3 + k] * naehe + 255 * (1 - naehe);
        ausgabe[index * 3 + k] = Math.round(Math.min(255, Math.max(0, wert)));
      }
    }
  }

  return { puffer: ausgabe, breite: b, hoehe: h };
}

// ---------------------------------------------------------------------------
//  Signatur
//
//  Ein kalligrafischer Schriftzug wird nicht als Linie gezeichnet, sondern
//  als Flaeche: fuer jeden Punkt der Mittellinie wird links und rechts ein
//  Rand berechnet, dessen Abstand von der Strichrichtung abhaengt. Genau
//  das macht den Unterschied zwischen Handschrift und Draht — Abstriche
//  werden breit, Aufstriche duenn.
// ---------------------------------------------------------------------------

/**
 * Der Schriftzug "Lusine" als Folge von Stuetzpunkten, normiert auf
 * 0..1 in beiden Richtungen. y = 0 ist Oberlaenge, y = 1 Grundlinie.
 *
 * Diese Punkte sind die Handschrift. Alles andere — Neigung, Federbreite,
 * Zittern — ist Variation darauf, damit jedes Werk seine eigene Signatur
 * bekommt und die Signaturen trotzdem erkennbar dieselbe Hand sind.
 */
const SCHRIFTZUG = [
  // L — Aufstrich, Schleife oben, Abstrich, Bogen nach rechts
  [0.055, 0.97], [0.028, 0.62], [0.055, 0.2], [0.105, 0.06],
  [0.138, 0.16], [0.118, 0.45], [0.108, 0.78], [0.125, 0.95],
  [0.185, 0.99], [0.225, 0.9],
  // u
  [0.245, 0.58], [0.262, 0.86], [0.295, 0.95], [0.322, 0.7],
  [0.332, 0.55], [0.338, 0.82], [0.352, 0.95],
  // s
  [0.398, 0.63], [0.372, 0.6], [0.362, 0.74], [0.395, 0.82],
  [0.412, 0.9], [0.385, 0.96],
  // i
  [0.442, 0.92], [0.452, 0.62], [0.462, 0.9], [0.48, 0.95],
  // n
  [0.512, 0.6], [0.518, 0.88], [0.528, 0.95], [0.552, 0.68],
  [0.578, 0.58], [0.592, 0.82], [0.602, 0.95],
  // e
  [0.648, 0.84], [0.678, 0.76], [0.662, 0.64], [0.634, 0.7],
  [0.628, 0.86], [0.652, 0.97], [0.702, 0.9],
  // Abschlussschwung
  [0.775, 0.78], [0.855, 0.83], [0.93, 0.93],
];

/** Ein Punkt auf einer Catmull-Rom-Kurve durch vier Stuetzpunkte. */
function kurvenPunkt(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const achse = (a, b, c, d) =>
    0.5 *
    (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);

  return [achse(p0[0], p1[0], p2[0], p3[0]), achse(p0[1], p1[1], p2[1], p3[1])];
}

function erzeugeSignaturSvg(saat) {
  const rnd = zufallAus(saat);

  const breite = 900;
  const hoehe = 300;
  const rand = 28;
  const zeichenBreite = breite - rand * 2;
  const zeichenHoehe = hoehe - rand * 2;

  // Die Variation, die eine Signatur von der naechsten unterscheidet.
  const neigung = 0.1 + rnd() * 0.14;
  const federbreite = 3.4 + rnd() * 2.6;
  const zittern = 0.004 + rnd() * 0.007;
  const stauchung = 0.86 + rnd() * 0.24;

  // Stuetzpunkte leicht verschieben — keine zwei Unterschriften eines
  // Menschen sind gleich.
  const stuetzen = SCHRIFTZUG.map(([x, y]) => [
    x + (rnd() - 0.5) * zittern * 2.2,
    y + (rnd() - 0.5) * zittern * stauchung * 3,
  ]);

  // Catmull-Rom braucht je einen Punkt vor und hinter dem Abschnitt.
  const erweitert = [stuetzen[0], ...stuetzen, stuetzen[stuetzen.length - 1]];

  const punkte = [];
  const proAbschnitt = 26;

  for (let i = 0; i < erweitert.length - 3; i += 1) {
    for (let k = 0; k < proAbschnitt; k += 1) {
      const [nx, ny] = kurvenPunkt(
        erweitert[i],
        erweitert[i + 1],
        erweitert[i + 2],
        erweitert[i + 3],
        k / proAbschnitt,
      );

      // Auf die Zeichenflaeche legen, mit kursiver Neigung: je hoeher
      // ein Punkt liegt, desto weiter rueckt er nach rechts.
      const y = rand + ny * zeichenHoehe * stauchung + zeichenHoehe * (1 - stauchung);
      const x = rand + nx * zeichenBreite + (1 - ny) * zeichenHoehe * neigung;

      punkte.push([x, y]);
    }
  }

  // --- Aus der Mittellinie eine Flaeche machen -----------------------------
  // Eine Schreibfeder steht schraeg. Bewegt sie sich senkrecht, laeuft
  // sie breit; waagerecht laeuft sie schmal. Genau dieser Wechsel macht
  // den Unterschied zwischen Handschrift und gebogenem Draht.
  const federwinkel = -Math.PI / 4 + (rnd() - 0.5) * 0.5;
  const oben = [];
  const unten = [];

  for (let i = 0; i < punkte.length; i += 1) {
    const vorher = punkte[Math.max(0, i - 2)];
    const nachher = punkte[Math.min(punkte.length - 1, i + 2)];
    const dx = nachher[0] - vorher[0];
    const dy = nachher[1] - vorher[1];
    const laenge = Math.hypot(dx, dy) || 1;

    // Wie stark die Laufrichtung von der Federrichtung abweicht.
    const abweichung = Math.abs(
      (dx / laenge) * Math.sin(federwinkel) - (dy / laenge) * Math.cos(federwinkel),
    );
    let breiteHier = federbreite * (0.28 + abweichung * 1.5);

    // Beide Enden laufen duenn aus, wie ein aufgesetzter und ein
    // abhebender Stift.
    const t = i / (punkte.length - 1);
    breiteHier *= 0.25 + weich(0, 0.035, t) * 0.75;
    breiteHier *= 1 - weich(0.9, 1, t) * 0.85;

    const nx = -dy / laenge;
    const ny = dx / laenge;

    oben.push([punkte[i][0] + nx * breiteHier, punkte[i][1] + ny * breiteHier]);
    unten.push([punkte[i][0] - nx * breiteHier, punkte[i][1] - ny * breiteHier]);
  }

  const zuPfad = (liste) =>
    liste.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" L ");

  // fill-rule nonzero, damit die Schleife des L eine gefuellte Flaeche
  // bleibt und kein Loch bekommt, wo der Strich sich selbst kreuzt.
  const pfad = `M ${zuPfad(oben)} L ${zuPfad([...unten].reverse())} Z`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${breite}" height="${hoehe}" viewBox="0 0 ${breite} ${hoehe}">
  <path d="${pfad}" fill="#111111" fill-rule="nonzero"/>
</svg>`;
}

// ---------------------------------------------------------------------------
//  Die Werkdaten aus src/data/werke.ts lesen
//
//  Bewusst kein zweiter Datensatz: Slug, Format und Palette stehen genau
//  einmal, naemlich dort, wo auch die Geschichten stehen. Zwei Listen,
//  die man von Hand gleich halten muss, laufen garantiert auseinander.
// ---------------------------------------------------------------------------

function leseWerke() {
  const quelle = readFileSync(join(WURZEL, "src", "data", "werke.ts"), "utf8");

  const formate = {};
  const formatRegex =
    /const (HOCH|QUER|QUADRAT) = \{ breite: (\d+), hoehe: (\d+) \}/g;
  let treffer;
  while ((treffer = formatRegex.exec(quelle)) !== null) {
    formate[treffer[1]] = {
      breite: Number(treffer[2]),
      hoehe: Number(treffer[3]),
    };
  }

  const werke = [];
  const werkRegex =
    /slug:\s*"([^"]+)"[\s\S]*?bilder:\s*bilder\(\s*"[^"]+",\s*(HOCH|QUER|QUADRAT),[\s\S]*?palette:\s*\[([^\]]+)\]/g;

  while ((treffer = werkRegex.exec(quelle)) !== null) {
    const palette = treffer[3]
      .split(",")
      .map((eintrag) => eintrag.trim().replace(/['"]/g, ""))
      .filter(Boolean);

    werke.push({ slug: treffer[1], format: formate[treffer[2]], palette });
  }

  if (werke.length === 0) {
    throw new Error(
      "Keine Werke in src/data/werke.ts gefunden. Wurde das Format der Datei geaendert?",
    );
  }

  return werke;
}

// ---------------------------------------------------------------------------
//  Pruefung: sind die Ecken wirklich reinweiss?
// ---------------------------------------------------------------------------

async function pruefeEcken(pfad) {
  const bild = sharp(pfad);
  const { width, height } = await bild.metadata();
  const roh = await bild.raw().toBuffer();
  const kanaele = roh.length / (width * height);

  const ecken = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];

  for (const [x, y] of ecken) {
    const index = (y * width + x) * kanaele;
    if (roh[index] !== 255 || roh[index + 1] !== 255 || roh[index + 2] !== 255) {
      return `${roh[index]},${roh[index + 1]},${roh[index + 2]} bei ${x}/${y}`;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
//  Hauptlauf
// ---------------------------------------------------------------------------

async function main() {
  mkdirSync(WERKE_AUS, { recursive: true });
  mkdirSync(SIGNATUREN_AUS, { recursive: true });

  const werke = leseWerke();
  console.log(`${werke.length} Werke gefunden.\n`);

  const beanstandungen = [];

  for (const werk of werke) {
    const saat = saatAusText(werk.slug);

    // --- Hauptbild ---------------------------------------------------------
    const feld = erzeugeFarbfeld(
      werk.format.breite,
      werk.format.hoehe,
      werk.palette,
      saat,
    );

    const hauptPfad = join(WERKE_AUS, `${werk.slug}.jpg`);
    await sharp(feld.puffer, {
      raw: { width: feld.breite, height: feld.hoehe, channels: 3 },
    })
      .resize(werk.format.breite, werk.format.hoehe, { kernel: "lanczos3" })
      .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
      .toFile(hauptPfad);

    const fehler = await pruefeEcken(hauptPfad);
    if (fehler) beanstandungen.push(`${werk.slug}.jpg: ${fehler}`);

    // --- Detailaufnahmen ---------------------------------------------------
    // Ausschnitte aus dem Hauptbild, wieder zum Rand hin weiss
    // ausgeblendet, damit auch sie ohne Kante auf der Seite stehen.
    for (let i = 1; i <= 2; i += 1) {
      const rnd = zufallAus(saat + i * 7919);
      const ausschnitt = Math.round(
        Math.min(werk.format.breite, werk.format.hoehe) * 0.34,
      );
      const links = Math.round(
        (werk.format.breite - ausschnitt) * (0.25 + rnd() * 0.5),
      );
      const oben = Math.round(
        (werk.format.hoehe - ausschnitt) * (0.25 + rnd() * 0.5),
      );

      const roh = await sharp(hauptPfad)
        .extract({
          left: links,
          top: oben,
          width: ausschnitt,
          height: ausschnitt,
        })
        .resize(1800, 1800, { kernel: "lanczos3" })
        .raw()
        .toBuffer();

      // Randabblendung auf dem Ausschnitt.
      const kante = 1800 * 0.16;
      for (let y = 0; y < 1800; y += 1) {
        for (let x = 0; x < 1800; x += 1) {
          const naehe = Math.min(
            weich(0, kante, x),
            weich(0, kante, 1799 - x),
            weich(0, kante, y),
            weich(0, kante, 1799 - y),
          );
          if (naehe >= 1) continue;

          const index = (y * 1800 + x) * 3;
          for (let k = 0; k < 3; k += 1) {
            roh[index + k] = Math.round(roh[index + k] * naehe + 255 * (1 - naehe));
          }
        }
      }

      const detailPfad = join(WERKE_AUS, `${werk.slug}-detail-${i}.jpg`);
      await sharp(roh, { raw: { width: 1800, height: 1800, channels: 3 } })
        .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
        .toFile(detailPfad);

      const detailFehler = await pruefeEcken(detailPfad);
      if (detailFehler) {
        beanstandungen.push(`${werk.slug}-detail-${i}.jpg: ${detailFehler}`);
      }
    }

    // --- Signatur ----------------------------------------------------------
    // Transparentes PNG, damit sie auf jedem Untergrund sitzt.
    const svg = erzeugeSignaturSvg(saat + 104729);
    await sharp(Buffer.from(svg))
      .resize(900, 300, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(join(SIGNATUREN_AUS, `${werk.slug}.png`));

    console.log(`  ${werk.slug}`);
  }

  // --- Portraet fuer die Ueber-Seite ---------------------------------------
  const portraet = erzeugeFarbfeld(1800, 2250, ["#b5a89a", "#8a7c6d", "#ded5c9", "#6b6058"], 424242);
  await sharp(portraet.puffer, {
    raw: { width: portraet.breite, height: portraet.hoehe, channels: 3 },
  })
    .resize(1800, 2250, { kernel: "lanczos3" })
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
    .toFile(join(WURZEL, "public", "portraet-lusine.jpg"));

  console.log("\nFertig.");

  if (beanstandungen.length > 0) {
    console.error("\nEcken NICHT reinweiss:");
    for (const zeile of beanstandungen) console.error(`  ${zeile}`);
    process.exitCode = 1;
  } else {
    console.log("Alle Ecken sind exakt #FFFFFF — der rahmenlose Effekt trägt.");
  }
}

main().catch((fehler) => {
  console.error(fehler);
  process.exit(1);
});
