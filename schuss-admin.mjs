import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const SC = process.env.SC;
const fehler = [];

async function schuss(pfad, name, opts = {}) {
  const seite = await browser.newPage({ viewport: opts.viewport ?? { width: 1280, height: 900 } });
  seite.on("console", (m) => { if (m.type() === "error") fehler.push(`${pfad}: ${m.text()}`); });
  seite.on("pageerror", (e) => fehler.push(`${pfad} pageerror: ${e.message}`));
  seite.on("response", (r) => { if (r.status() >= 400) fehler.push(`${pfad}: ${r.status()} ${r.url().slice(0, 100)}`); });
  await seite.goto("http://localhost:3000" + pfad, { waitUntil: "load", timeout: 25000 });
  await seite.waitForTimeout(1000);
  if (opts.klick) { await seite.click(opts.klick); await seite.waitForTimeout(700); }
  if (opts.scroll) { await seite.evaluate((y) => window.scrollTo(0, y), opts.scroll); await seite.waitForTimeout(700); }
  await seite.screenshot({ path: `${SC}/${name}.png`, fullPage: opts.full ?? false });
  console.log(pfad, "->", name);
  await seite.close();
}

await schuss("/admin", "a-uebersicht");
await schuss("/admin/werke", "a-werke");
await schuss("/admin/werke/werk-02", "a-werk-bilder");
await schuss("/admin/werke/werk-02", "a-werk-formular", { scroll: 1100 });
await schuss("/admin/serien", "a-serien");
await schuss("/admin/texte", "a-texte");
await schuss("/admin/anfragen", "a-anfragen");

if (fehler.length) { console.log("\nPROBLEME:"); [...new Set(fehler)].forEach(f => console.log(" ", f)); }
else console.log("\nKeine Fehler.");
await browser.close();
