/**
 * Prüft die fertige Seite im Browser.
 *
 *   npm run build && npm run start      (in einem zweiten Fenster)
 *   npm i -D playwright                  (einmalig)
 *   node scripts/pruefen-im-browser.mjs
 *
 * Der wichtigste Teil ist der erste: er misst nach, ob ein Gemälde
 * wirklich ohne sichtbare Kante auf dem Papier steht. Sobald echte
 * Aufnahmen die Platzhalter ersetzen, lohnt es sich, diese Prüfung
 * erneut laufen zu lassen — eine Bildfläche mit Rahmen, Schatten oder
 * farbigem Grund schleicht sich leicht ein und fällt am Bildschirm
 * erst auf, wenn man weiß, wonach man sucht.
 *
 * Playwright steht bewusst nicht in package.json: es lädt einen
 * kompletten Browser herunter, und für den täglichen Betrieb der Seite
 * wird es nicht gebraucht.
 */

import { chromium } from "playwright";

// Ein eigener Browserpfad lässt sich über CHROMIUM_PFAD vorgeben;
// sonst nimmt Playwright den, den es selbst installiert hat.
const browser = await chromium.launch(
  process.env.CHROMIUM_PFAD ? { executablePath: process.env.CHROMIUM_PFAD } : {},
);
const SC = process.env.SC ?? "./pruefung-aufnahmen";
const probleme = [];
const bestanden = [];

const { mkdirSync } = await import("node:fs");
mkdirSync(SC, { recursive: true });

function pruefe(name, bedingung, hinweis = "") {
  if (bedingung) bestanden.push(name);
  else probleme.push(`${name}${hinweis ? " — " + hinweis : ""}`);
}

// ---------------------------------------------------------------------------
//  1. Der rahmenlose Effekt, an echten Bildpunkten gemessen
// ---------------------------------------------------------------------------
{
  const seite = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await seite.goto("http://localhost:3000/werke/gewitterluft", { waitUntil: "load" });
  await seite.waitForTimeout(2500);

  await seite.screenshot({ path: `${SC}/p-rahmenlos.png` });

  // Nicht das Aussehen beurteilen, sondern die beteiligten Stile
  // auslesen: Hintergrund, Rahmen, Schatten, Eckenradius — und dazu
  // die Hintergründe aller übergeordneten Elemente, denn ein farbiger
  // Kasten dahinter erzeugt dieselbe Kante wie ein Rahmen am Bild.
  const werte = await seite.evaluate(() => {
    const bild = document.querySelector("img.werkbild");
    const stil = getComputedStyle(bild);
    const koerper = getComputedStyle(document.body);
    return {
      bildHintergrund: stil.backgroundColor,
      bildRahmen: stil.borderTopWidth + " " + stil.borderTopStyle,
      bildSchatten: stil.boxShadow,
      bildRadius: stil.borderTopLeftRadius,
      seitenHintergrund: koerper.backgroundColor,
      elternHintergruende: (() => {
        const kette = [];
        let knoten = bild.parentElement;
        while (knoten && kette.length < 6) {
          kette.push(getComputedStyle(knoten).backgroundColor);
          knoten = knoten.parentElement;
        }
        return kette;
      })(),
    };
  });

  pruefe("Bildhintergrund ist reinweiß", werte.bildHintergrund === "rgb(255, 255, 255)", werte.bildHintergrund);
  pruefe("Seitenhintergrund ist reinweiß", werte.seitenHintergrund === "rgb(255, 255, 255)", werte.seitenHintergrund);
  pruefe("Kein Rahmen am Bild", werte.bildRahmen.startsWith("0px"), werte.bildRahmen);
  pruefe("Kein Schatten am Bild", werte.bildSchatten === "none", werte.bildSchatten);
  pruefe("Keine runden Ecken", werte.bildRadius === "0px", werte.bildRadius);
  pruefe(
    "Kein farbiger Container hinter dem Bild",
    werte.elternHintergruende.every((f) => f === "rgba(0, 0, 0, 0)" || f === "rgb(255, 255, 255)"),
    werte.elternHintergruende.join(" / "),
  );

  await seite.close();
}

// ---------------------------------------------------------------------------
//  2. Zoomansicht: oeffnen, schliessen, Tastatur
// ---------------------------------------------------------------------------
{
  const seite = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await seite.goto("http://localhost:3000/werke/gewitterluft", { waitUntil: "load" });
  await seite.waitForTimeout(1500);

  await seite.locator("button[aria-label*='vergrößert']").first().click();
  await seite.waitForTimeout(700);

  const dialogDa = await seite.locator("[role=dialog]").count();
  pruefe("Zoomansicht öffnet sich", dialogDa === 1);

  const fokus = await seite.evaluate(() => document.activeElement?.textContent ?? "");
  pruefe("Fokus springt in die Zoomansicht", fokus.includes("Schließen"), `Fokus auf: ${fokus}`);

  await seite.screenshot({ path: `${SC}/p-zoom.png` });

  await seite.keyboard.press("Escape");
  await seite.waitForTimeout(600);
  pruefe("Escape schließt die Zoomansicht", (await seite.locator("[role=dialog]").count()) === 0);

  await seite.close();
}

// ---------------------------------------------------------------------------
//  3. Anfrageformular: Prüfung greift
// ---------------------------------------------------------------------------
{
  const seite = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await seite.goto("http://localhost:3000/kontakt", { waitUntil: "load" });
  await seite.waitForTimeout(1500);

  await seite.fill("#name", "A");
  await seite.fill("#email", "keine-adresse");
  await seite.fill("#nachricht", "kurz");
  await seite.click("button[type=submit]");
  await seite.waitForTimeout(2500);

  const text = await seite.locator("form").innerText();
  pruefe("Formular meldet zu kurzen Namen", text.includes("Namen an"), text.slice(0, 120));
  pruefe("Formular meldet ungültige E-Mail", text.includes("gültig"), "");
  pruefe("Formular meldet zu kurze Nachricht", text.includes("paar Worte"), "");

  await seite.screenshot({ path: `${SC}/p-formular.png` });
  await seite.close();
}

// ---------------------------------------------------------------------------
//  4. Mobile Navigation
// ---------------------------------------------------------------------------
{
  const seite = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await seite.goto("http://localhost:3000/", { waitUntil: "load" });
  await seite.waitForTimeout(1200);

  await seite.click("button[aria-controls=mobile-navigation]");
  await seite.waitForTimeout(500);
  pruefe("Mobiles Menü öffnet", (await seite.locator("#mobile-navigation").count()) === 1);
  await seite.screenshot({ path: `${SC}/p-mobil-menue.png` });

  // Kein waagerechtes Scrollen — der Parallax darf nichts hinausschieben.
  await seite.click("button[aria-controls=mobile-navigation]");
  await seite.waitForTimeout(400);
  await seite.evaluate(() => window.scrollTo(0, 1800));
  await seite.waitForTimeout(900);
  const ueberbreite = await seite.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  pruefe("Kein waagerechtes Scrollen auf dem Handy", ueberbreite <= 1, `${ueberbreite}px zu breit`);
  await seite.screenshot({ path: `${SC}/p-mobil.png` });
  await seite.close();
}

// ---------------------------------------------------------------------------
//  5. Preis sichtbar, kein Kaufweg
// ---------------------------------------------------------------------------
{
  const seite = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await seite.goto("http://localhost:3000/werke/gewitterluft", { waitUntil: "load" });
  await seite.waitForTimeout(1500);

  // Die Werkseite selbst, nicht die Kacheln der verwandten Werke darin.
  const inhalt = await seite.locator("article").first().innerText();
  pruefe("Preis steht auf der Werkseite", /4\.200/.test(inhalt), "");
  pruefe("Versandhinweis steht dabei", /Versand/i.test(inhalt), "");
  pruefe("Weg zur Anfrage ist da", inhalt.includes("anfragen"), "");
  pruefe(
    "Kein Kaufknopf mehr",
    !/\bErwerben\b|Warenkorb|In den Korb/.test(inhalt),
    "es gibt noch einen Kaufweg",
  );

  await seite.close();
}

// ---------------------------------------------------------------------------
//  6. Alle Seiten fehlerfrei
// ---------------------------------------------------------------------------
{
  const pfade = ["/", "/werke", "/werke/gewitterluft", "/serien", "/serien/stille-raeume",
                 "/ueber", "/kontakt", "/impressum", "/agb", "/widerruf", "/datenschutz",
                 "/admin", "/admin/werke", "/admin/werke/werk-02", "/admin/serien",
                 "/admin/anfragen", "/admin/texte", "/nicht-vorhanden"];

  for (const pfad of pfade) {
    const seite = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const fehler = [];
    seite.on("pageerror", (e) => fehler.push(e.message));
    seite.on("response", (r) => { if (r.status() >= 400 && !pfad.includes("nicht-vorhanden")) fehler.push(`${r.status()} ${r.url().slice(-50)}`); });
    await seite.goto("http://localhost:3000" + pfad, { waitUntil: "load" });
    await seite.waitForTimeout(700);
    pruefe(`Seite ${pfad}`, fehler.length === 0, fehler.slice(0, 2).join("; "));
    await seite.close();
  }
}

console.log(`\nBestanden: ${bestanden.length}`);
console.log(`Aufnahmen in ${SC}`);
if (probleme.length) {
  console.log(`\nPROBLEME (${probleme.length}):`);
  probleme.forEach((p) => console.log("  ✗", p));
} else {
  console.log("Keine Probleme.");
}
await browser.close();
