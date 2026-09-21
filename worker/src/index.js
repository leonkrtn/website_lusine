/**
 * Bild-Worker für lusine
 * =======================
 *
 * Liefert die Werkbilder aus dem R2-Speicher aus.
 *
 * Bewusst ohne Cloudflare Image Resizing: die Größenvarianten entstehen
 * bereits beim Hochladen (siehe src/lib/varianten.ts in der Website).
 * Dadurch kostet die Auslieferung nichts, ist am Edge zwischenspeicherbar
 * und liefert immer dieselbe, vorher geprüfte Qualität.
 *
 * Adressen:
 *
 *   GET /werke/das-zimmer-ab12cd?b=1600
 *        -> beste Variante mit mindestens 1600 Punkten Breite,
 *           als AVIF oder WebP, je nachdem was der Browser annimmt
 *
 *   GET /werke/das-zimmer-ab12cd/original.jpg
 *        -> die unveränderte Ausgangsdatei
 *
 * Jeder Schlüssel enthält eine Zufallskennung. Ein Bild unter einer
 * bestimmten Adresse ändert sich deshalb nie, und der Zwischenspeicher
 * darf es für immer behalten.
 */

/** Muss zu VARIANTEN_BREITEN in src/lib/varianten.ts passen. */
const BREITEN = [640, 1080, 1600, 2400, 3840];

const EIN_JAHR = 60 * 60 * 24 * 365;

function fehler(status, text) {
  return new Response(text, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

/** Die kleinste Variante, die für die gewünschte Breite noch reicht. */
function passendeBreite(gewuenscht) {
  const zahl = Number.parseInt(gewuenscht ?? "", 10);
  if (!Number.isFinite(zahl) || zahl <= 0) return BREITEN[BREITEN.length - 1];

  // Bildschirme mit hoher Punktdichte fordern bereits die doppelte
  // Breite an, darum hier kein weiterer Aufschlag.
  return BREITEN.find((breite) => breite >= zahl) ?? BREITEN[BREITEN.length - 1];
}

/** AVIF ist deutlich kleiner als WebP, aber nicht überall vorhanden. */
function besterTyp(annahme) {
  const akzeptiert = annahme ?? "";
  if (akzeptiert.includes("image/avif")) return { endung: "avif", typ: "image/avif" };
  if (akzeptiert.includes("image/webp")) return { endung: "webp", typ: "image/webp" };
  return { endung: "jpg", typ: "image/jpeg" };
}

const worker = {
  async fetch(anfrage, umgebung, kontext) {
    if (anfrage.method !== "GET" && anfrage.method !== "HEAD") {
      return fehler(405, "Nur GET und HEAD.");
    }

    if (!umgebung.WERKE) {
      return fehler(500, "R2-Bindung WERKE fehlt in der Worker-Konfiguration.");
    }

    const adresse = new URL(anfrage.url);
    const pfad = decodeURIComponent(adresse.pathname).replace(/^\/+/, "");

    if (!pfad) return fehler(404, "Kein Bild angegeben.");

    // Ausbruchsversuche aus dem Schlüsselraum abweisen.
    if (pfad.includes("..")) return fehler(400, "Ungültiger Pfad.");

    // Nur die Bereiche, die die Website wirklich nutzt.
    if (!/^(werke|signaturen|seite)\//.test(pfad)) {
      return fehler(404, "Unbekannter Bereich.");
    }

    // Antwort aus dem Edge-Zwischenspeicher, falls vorhanden.
    const zwischenspeicher = caches.default;
    const bereits = await zwischenspeicher.match(anfrage);
    if (bereits) return bereits;

    // Enthält der Pfad bereits einen Dateinamen, wird genau der geholt.
    // Sonst ist er ein Präfix und die Variante wird gewählt.
    const istDirekt = /\.[a-z0-9]{2,5}$/i.test(pfad);

    let objekt = null;
    let inhaltstyp = "application/octet-stream";

    if (istDirekt) {
      objekt = await umgebung.WERKE.get(pfad);
      const endung = pfad.slice(pfad.lastIndexOf(".") + 1).toLowerCase();
      inhaltstyp =
        { avif: "image/avif", webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" }[
          endung
        ] ?? "application/octet-stream";
    } else {
      const breite = passendeBreite(adresse.searchParams.get("b"));
      const gewuenscht = besterTyp(anfrage.headers.get("accept"));

      // Vom besten zum sichersten Format absteigen, falls eine
      // Variante fehlt — etwa weil ein altes Bild vor einer Änderung
      // der Formate hochgeladen wurde.
      const reihenfolge = [gewuenscht, { endung: "webp", typ: "image/webp" }, { endung: "jpg", typ: "image/jpeg" }];

      for (const kandidat of reihenfolge) {
        const schluessel = `${pfad}/${String(breite).padStart(4, "0")}.${kandidat.endung}`;
        objekt = await umgebung.WERKE.get(schluessel);
        if (objekt) {
          inhaltstyp = kandidat.typ;
          break;
        }
      }

      // Immer noch nichts: auf die Ausgangsdatei zurückfallen.
      if (!objekt) {
        for (const endung of ["jpg", "png"]) {
          objekt = await umgebung.WERKE.get(`${pfad}/original.${endung}`);
          if (objekt) {
            inhaltstyp = endung === "png" ? "image/png" : "image/jpeg";
            break;
          }
        }
      }
    }

    if (!objekt) return fehler(404, "Bild nicht gefunden.");

    const kopfzeilen = new Headers();
    objekt.writeHttpMetadata(kopfzeilen);
    kopfzeilen.set("content-type", inhaltstyp);
    kopfzeilen.set("cache-control", `public, max-age=${EIN_JAHR}, immutable`);
    kopfzeilen.set("etag", objekt.httpEtag);
    // Dieselbe Adresse liefert je nach Browser AVIF oder WebP — das muss
    // jeder Zwischenspeicher auf dem Weg wissen.
    kopfzeilen.set("vary", "Accept");
    kopfzeilen.set("x-content-type-options", "nosniff");

    const antwort = new Response(anfrage.method === "HEAD" ? null : objekt.body, {
      headers: kopfzeilen,
    });

    // Im Hintergrund ablegen, ohne die Antwort aufzuhalten.
    kontext.waitUntil(zwischenspeicher.put(anfrage, antwort.clone()));

    return antwort;
  },
};

export default worker;
