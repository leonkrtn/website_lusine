@AGENTS.md

# LUART

Online-Galerie für originale Malerei der Künstlerin Lusine.
Kein Shop: die Seite zeigt Werke und Preise, gekauft wird im
persönlichen Austausch.

---

## Offene Punkte

### E-Mail-Versand fehlt

**Zustand:** Geht eine Anfrage ein, wird sie in der Datenbank gespeichert
und erscheint unter `/admin/anfragen`. Sonst passiert nichts — weder
bekommt Lusine eine Benachrichtigung, noch die anfragende Person eine
Eingangsbestätigung.

**Warum das zählt:** Das Admin-Panel ist die einzige Stelle, an der eine
Anfrage sichtbar wird. Eine Kaufanfrage, die niemand liest, ist ein
verlorener Verkauf. Darum steht in der Admin-Übersicht oben ein
deutlicher Hinweis, täglich hereinzusehen. Dieser Hinweis gehört
entfernt, sobald der Versand steht.

**Was zu tun ist, wenn es kommt:**

1. `resend` als Abhängigkeit aufnehmen (oder einen anderen Dienst wählen)
2. `src/lib/mail.ts` anlegen: Benachrichtigung ans Atelier,
   Eingangsbestätigung an die anfragende Person. Beide Aufrufe müssen
   fehlertolerant sein — eine Anfrage, die in der Datenbank steht, ist
   angekommen, auch wenn der Versand klemmt.
3. In `src/app/aktionen.ts` die markierte Stelle in `sendeAnfrage`
   ersetzen (dort steht ein Kommentar, der auf diesen Abschnitt verweist)
4. `resendKonfiguriert()` in `src/lib/umgebung.ts` wieder aufnehmen und in
   die Einrichtungsliste der Admin-Übersicht eintragen
5. Den gelben Hinweis in `src/app/admin/page.tsx` entfernen
6. Datenschutzerklärung: Abschnitt zum E-Mail-Versand wieder aufnehmen
   (Auftragsverarbeiter nennen), Nummerierung der Abschnitte anpassen
7. `.env.example`, `README.md` und `PLAN.md` nachziehen

Die Variablen hießen zuvor `RESEND_API_KEY`, `EMAIL_ABSENDER` und
`EMAIL_ATELIER`. Der frühere Stand steht im Verlauf: `git log --all -S
"resend" -- src/lib/mail.ts`.

### Rechtstexte sind Gerüste

Impressum, Datenschutz, Verkaufsbedingungen und Widerruf enthalten
Platzhalter, die **gelb hinterlegt** sind (`<Auszufuellen>` in
`src/components/Rechtstext.tsx`). Sie müssen vor dem Livegang ausgefüllt
und fachkundig geprüft werden.

### Die Bilder sind Platzhalter

`public/werke/` und `public/signaturen/` enthalten programmatisch
erzeugte Bilder aus `scripts/gemaelde-erzeugen.mjs`. Sie dienen nur dem
Demo-Modus und werden nicht mehr gebraucht, sobald echte Aufnahmen über
das Admin-Panel hochgeladen sind.

---

## Der Grundsatz, an dem sich alles ausrichtet

Ein Gemälde steht **ohne sichtbare Kante** auf der Seite. Seitengrund und
Bildgrund sind identisch reinweiß (`#FFFFFF`).

Das ist keine Geschmacksfrage, sondern die tragende Gestaltungsregel.
Drei Vorkehrungen sichern sie ab:

1. **Die Verbotsliste** am Ende von `src/app/globals.css` schließt für
   jede Fläche mit der Klasse `.werkbild` `border`, `border-radius` und
   `box-shadow` aus. Wer ein Bild einbaut, vergibt diese Klasse.
2. **Die Weißmessung beim Hochladen** (`src/lib/varianten.ts` und
   `src/components/admin/Bilderverwaltung.tsx`) misst die Randstreifen
   eines Fotos und bietet eine Korrektur an, wenn der Hintergrund nicht
   reinweiß ist. Ein leicht graues Foto bekäme sonst eine rechteckige
   Kante.
3. **`npm run browserpruefung`** misst am fertigen HTML nach, ob Bild,
   Seite und alle übergeordneten Flächen reinweiß sind. Lohnt sich
   besonders, nachdem echte Aufnahmen die Platzhalter ersetzt haben.

Daraus folgt außerdem: **kein Dark Mode.** Ein auf Weiß freigestelltes
Werk bekäme auf dunklem Grund sofort eine Kante.

---

## Aufbau

Zwei Dateien erklären den Rest:

**`src/lib/daten.ts`** — die einzige Stelle, an der gelesen wird. Jede
Funktion beantwortet dieselbe Frage zweimal: einmal aus Supabase, einmal
aus den Seed-Dateien in `src/data/`. Welcher Weg genommen wird,
entscheidet allein `demoModus()`. Deshalb ändert der Umstieg auf echte
Daten keine Zeile in den Seiten.

**`src/lib/bilder.ts`** — alle Fragen zu Bildadressen an einer Stelle: wo
eine Datei liegt, welche Größen es gibt, wie ein `srcset` aussieht. Die
Anzeigekomponenten wissen nichts über den Speicherort.

Weiteres:

- `src/app/(seite)/` — die öffentliche Galerie, `src/app/admin/` — die
  Verwaltung. Die Trennung als Route Group gibt beiden ein eigenes Layout.
- Öffentliche Seiten lesen über `supabaseOeffentlich()` **ohne Cookies**,
  damit Next.js sie vorrendern kann. Der Cookie-Client bleibt dem
  Admin-Bereich vorbehalten.
- Jede Server Action im Admin prüft die Anmeldung **selbst**. Der Schutz
  in `src/proxy.ts` genügt nicht: eine Server Action ist eine eigene
  Adresse, die sich direkt aufrufen lässt.

---

## Sprache

Bezeichner, Kommentare und Oberfläche sind deutsch. Das ist bewusst so —
die Person, die täglich damit arbeitet, spricht deutsch, und ein
Datenfeld, das `versandCent` heißt, erklärt sich ihr ohne Übersetzung.
Neue Namen bitte in derselben Sprache.

---

## Befehle

```bash
npm run dev              # Entwicklung
npm run build            # Produktionsbau
npm run pruefen          # Typen und Linting
npm run browserpruefung  # Prüft die laufende Seite im Browser
npm run platzhalter      # Erzeugt die Demo-Bilder neu
```

Die Browserprüfung braucht einen laufenden `npm run start` und einmalig
`npm i -D playwright`. Playwright steht nicht in `package.json`: es lädt
einen kompletten Browser herunter und wird für den Betrieb nicht
gebraucht.
