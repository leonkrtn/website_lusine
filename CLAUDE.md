@AGENTS.md

# LUART

Online-Galerie für originale Malerei der Künstlerin Lusine.
Kein Shop: die Seite zeigt Werke und Preise, gekauft wird im
persönlichen Austausch.

---

## Offene Punkte

### Bilder werden unverändert ausgeliefert

**Zustand:** Was hochgeladen wird, landet unverändert im Speicher und
geht unverändert an jeden Besucher. Es gibt keine kleineren Fassungen
fürs Handy, keine Umrechnung in sparsamere Formate und keine
Weißkorrektur. So gewünscht — die Werke sollen nicht angetastet werden.

**Was daran hängt:** Ein 4-MB-Foto ist auf dem Handy dasselbe 4-MB-Foto.
Bei zwölf Werken im Katalog summiert sich das. Zwei Dinge sollte man
darum im Auge behalten:

- **Ladezeit** auf langsamen Verbindungen. Die Galerie lädt Bilder erst,
  wenn sie in den Blick kommen (`loading="lazy"`), das federt einiges ab.
- **Supabase-Kontingent.** Die kostenlose Stufe erlaubt 5 GB Datenverkehr
  im Monat, geteilt mit der Datenbank. Bei unverkleinerten Bildern ist
  das schneller erreicht als bei verkleinerten — grob gerechnet nach
  einigen hundert Besuchern statt nach ein paar tausend.

**Der Hebel, wenn es knapp wird:** Die Bilder vor dem Hochladen auf eine
vernünftige Größe bringen (etwa 2000 Punkte an der langen Kante, als
JPEG bei Qualität 85). Das kostet in der Darstellung praktisch nichts
und senkt den Verbrauch um ein Vielfaches.

Die frühere Verarbeitung steht im Verlauf:
`git log --all -S "erzeugeVarianten" -- src/lib/varianten.ts`.

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

Im Code sichern sie zwei Vorkehrungen ab:

0. **Der Auslauf unter der Kopfzeile** (`--kopf-auslauf`) ist an seiner
   Oberkante **deckend** weiß, nicht bloß zart. Was direkt darunter
   steht, ist nicht gedämpft, sondern weg. Beim Scrollen ist das
   gewollt; am Seitenanfang aber steht der Inhalt fest, und dann ist
   es ein Fehler. Dafür gibt es `.seitenanfang` (Text) und
   `.werkanfang` (ein Gemälde, das nur knapp herausmuss). Wer
   `.werkanfang` ändert, muss den Höhenabzug auf der Werkseite
   mitziehen, sonst steht das Werk unter der Falz.
1. **Die Verbotsliste** am Ende von `src/app/globals.css` schließt für
   jede Fläche mit der Klasse `.werkbild` `border`, `border-radius` und
   `box-shadow` aus. Wer ein Bild einbaut, vergibt diese Klasse.
2. **`npm run browserpruefung`** misst am fertigen HTML nach, ob Bild,
   Seite und alle übergeordneten Flächen reinweiß sind. Lohnt sich
   besonders, nachdem echte Aufnahmen die Platzhalter ersetzt haben.

**Was davor liegen darf und was nie dahinter.** Weil Bildgrund und
Seitengrund derselbe Weißton sind, kann Schrift über die Kante eines
Werks hinauslaufen, ohne sie zu verraten. Umgekehrt gilt das nicht:
alles, was **hinter** einem Werk läge, schaute an dessen Rand hervor
und zeichnete genau den Umriss, den es nicht geben darf. Davor ist
erlaubt, dahinter nie — daran scheitert jede Idee mit einer großen
Zahl oder einem Schriftzug im Rücken des Bildes.

**Die dritte Vorkehrung liegt außerhalb des Codes.** Es gab einmal eine
Weißmessung beim Hochladen, die den Bildhintergrund maß und auf Wunsch
korrigierte. Sie wurde auf Wunsch entfernt: Bilder werden unverändert
übernommen (siehe unten). Damit entscheidet sich allein bei der
**Aufnahme**, ob ein Werk ohne Kante auf der Seite steht. Ein Foto auf
leicht grauem oder gelbstichigem Grund bekommt auf `#FFFFFF` eine
sichtbare rechteckige Kante, und nichts im Programm fängt das noch ab.

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

**`src/schriften/`** — EB Garamond, selbst gehostet statt über
`next/font/google`. Die Google-Auslieferung enthält **nur Kerning**;
Mediävalziffern, Kapitälchen und Ligaturen fehlen dort, und genau die
tragen den Satz. Herkunft, Lizenz und der Befehl, mit dem die Dateien
gebaut wurden, stehen in `src/schriften/HERKUNFT.md`.

Eine Eigenheit ist dort festgehalten, weil sie sonst niemand findet:
bei `lang="de"` ersetzt die Schrift über `locl` das `f` durch eine
deutsche Variante, die das Kapitälchen-Lookup dann nicht mehr erfasst.
Darum steht in `.beschriftung` ein `font-feature-settings: "locl" 0`.
Ohne das bliebe in „Öl auf Leinwand" genau ein Buchstabe gemein.

Weiteres:

- `src/app/(seite)/` — die öffentliche Galerie, `src/app/admin/` — die
  Verwaltung. Die Trennung als Route Group gibt beiden ein eigenes Layout.
- Der Katalog unter `/werke` kennt zwei Ansichten: **Wand** (alle gleich
  groß) und **Liste** (das Verzeichnis, ohne Bilder). Beide stehen
  fertig im HTML, `Katalog.tsx` legt nur ein `data-Attribut` um. Ohne
  JavaScript bleibt die Wand stehen.
- Wie groß ein Werk wirklich ist, zeigt die Werkseite: unter dem
  Datenblatt lässt sich ein Vergleich mit einem Blatt DIN A4 aufklappen
  (`Groessenvergleich.tsx`), gerechnet aus `breiteCm` und `hoeheCm`.
  Das Blatt steht neben dem Werk, nie dahinter.
- **Neben einem Werk steht nur sein Saalschild.** Kein anderer Text
  darf waagerecht daneben stehen — kein Auftaktsatz, keine
  Serieneinleitung, kein Fließtext. Wer einen Satz neben ein Gemälde
  setzt, macht ihn zur Beschriftung dieses Gemäldes, ganz gleich
  wovon er handelt: der Besucher läse einen Text über die Ausstellung
  als Titel des Bildes, vor dem er steht. Solche Texte stehen für
  sich, wie der Saaltext am Eingang (`.saaltext`), oder über dem
  Werk — nie in einer Reihe damit.
- **Neben jedem Werk hängt ein Saalschild** (`Saalschild.tsx`): Titel
  kursiv, Jahr, Technik, Träger, Maße, Ausführung, dann der Preis —
  in dieser Reihenfolge, weil sie der Frage folgt, die jemand vor
  einem Bild hat: Was ist das? Woraus? Wie groß? Und erst zuletzt: zu
  haben? Linksbündig im Flattersatz, auch wenn es links vom Werk
  hängt; so wird ein Saalschild gesetzt. Werk und Schild bilden eine
  `.werkreihe` — wird der Platz eng, gibt das Werk nach, nicht das
  Schild. Unter 48 rem rutscht es unter das Werk.
  **Ausnahme Startseite:** dort trägt das Schild nur Titel, Jahr und
  die Serie, wenn es eine gibt (`schlicht`) — keine Technik, keine
  Maße, kein Preis. Die Startseite ist eine Auswahl, kein Katalog.
- **Das erste Werk steht einfach da.** Startseite und Werkseite beginnen
  mit einem Werk in voller Größe (`Werkanfang.tsx`), ohne Vergrößerung
  und ohne eigene Bewegung. Ein Zoom vom Pinselstrich aus gab es einmal;
  er wurde auf Wunsch entfernt.
- Die Startseite hängt die Werke abwechselnd links, mittig und rechts.
  Die Folge steht fest in `haengung()` in `src/lib/darstellung.ts` — eine
  Wand, die sich bei jedem Aufruf neu ordnet, wäre keine Hängung.
- **Werke erscheinen scrollgebunden, nicht auf eigener Uhr.** `.auftritt`
  in `globals.css` ist eine einzige Kurve an einer einzigen Zeitachse,
  und die Zeitachse ist das Scrollen. Vorher waren es zwei Bewegungen —
  ein Einblenden ab einer Schwelle und ein Parallax darunter —, die sich
  gegenseitig störten. Wer hier etwas ergänzt: **eine** Bewegung je
  Gegenstand, sonst zuckt es wieder.
- `--tiefe` sagt, auf welcher Ebene etwas liegt. Was näher liegt,
  wandert beim Scrollen weiter; das Werk selbst liegt am tiefsten. Daher
  kommt der Raum.
- Beim Seitenwechsel wandert ein Werk per View Transition an seinen
  neuen Platz. Der alte `seitenwechsel`-Übergang läuft darum nur noch,
  wo der Browser keine View Transitions kann — beides zugleich ergab
  zwei Bewegungen auf demselben Bild.
  Das gilt von Katalog **und** Startseite aus: überall, wo ein Werk
  steht, trägt es den Namen `werk-<id>`. Die Kopfzeile hat im
  Übergang eine eigene Ebene über dem Werk (`kopfzeile`), sonst führe
  ein Werk, das knapp unter ihr stand, über sie hinweg.
  Verweise auf eine Werkseite laufen über `WerkVerweis.tsx`: er lädt
  das Bild der Werkseite vor, sobald Zeiger oder Finger ihn berühren,
  und wechselt erst, wenn es bereit ist (höchstens eine Sekunde).
  Sonst endete die Wanderung auf einem noch leeren Bild, und das Werk
  war kurz weg. Die `sizes` der Werkseite stehen darum an einer Stelle
  (`WERKSEITE_SIZES` in `src/lib/werkseitenbild.ts`).
- **Kein `scroll-behavior: smooth`.** Es machte das Scrollen, das Next
  beim Seitenwechsel und beim Zurück selbst auslöst, zu einer
  sichtbaren Fahrt — von der Startseite aus über zweitausend Punkte,
  mitten in der Wanderung. Bewegen soll sich nur, was der Finger
  bewegt.
- **Bilder für draußen** entstehen in `src/lib/sozialbild.tsx`:
  Linkvorschau (`opengraph-image.tsx` neben der Werkseite) und unter
  `/werke/<slug>/bild/pinterest`, `…/instagram`, `…/instagram-nah`.
  Dieselbe Regel wie drinnen: Werk auf Reinweiß, daneben höchstens
  das Schild. Anders als auf der Seite trägt das Schild dort den
  Namen, weil draußen viele Hände hängen (vgl. `Saalschild.tsx`).
  Das Originalfoto bleibt unangetastet; gesetzt werden nur JPEG und
  PNG, ein WebP-Foto fällt aus. Im Admin stehen die Bilder samt
  Bildunterschrift und Link unter jedem Werk (`Weitergabe.tsx`).
- **Pinterest** merkt von der Seite nie das nackte Foto: jedes Werkbild
  trägt `data-pin-media` auf das Pinterest-Format (`pinFuer()` in
  `darstellung.ts`). Signaturen und der Größenvergleich tragen
  `data-pin-nopin`. Wer ein neues Bild einbaut, das ein Werk zeigt,
  aber nicht das Werk ist, schließt es genauso aus.
- **Für Suchmaschinen** gehen die Metadaten jeder öffentlichen Seite
  über `seitenangaben()` in `src/lib/metadaten.ts`: Titel,
  Beschreibung, kanonische Adresse, Linkvorschau. Next.js ersetzt
  `openGraph` pro Seite ganz, statt es zusammenzuführen — wer dort
  selbst etwas setzt, verliert Seitenname, Sprache und Vorschaubild.
  Liegt neben einer Seite ein eigenes `opengraph-image.tsx`, braucht
  sie `eigenesBild: true`, sonst verdrängt das allgemeine Bild
  (`/vorschaubild`) das eigene. Strukturdaten (schema.org) stehen in
  `src/lib/strukturdaten.ts`: Seite und Künstlerin im Rahmen, jedes
  Werk als `VisualArtwork`. Die Sitemap führt je Werk seine Bilder
  und, sobald Supabase angeschlossen ist, das Änderungsdatum.
- Öffentliche Seiten lesen über `supabaseOeffentlich()` **ohne Cookies**,
  damit Next.js sie vorrendern kann. Der Cookie-Client bleibt dem
  Admin-Bereich vorbehalten.
- **E-Mails** laufen über Resend (`src/lib/mail.ts`): eine Meldung an
  `EMAIL_ATELIER` und eine Eingangsbestätigung an die anfragende Person.
  Beide erst nach dem Speichern und fehlertolerant — eine Anfrage, die
  in der Datenbank steht, ist angekommen, auch wenn der Versand klemmt.
  Fehler landen im Serverprotokoll.
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

Das Favicon ist der Schriftzug LUART aus der Kopfzeile, als Umriss
aus der eigenen Schriftdatei. Neu erzeugt wird es mit
`python3 scripts/favicon-schriftzug.py` (schreibt `src/app/icon.svg`)
und danach `node scripts/favicon-erzeugen.mjs` (`favicon.ico`,
`apple-icon.png`).

Die Browserprüfung braucht einen laufenden `npm run start` und einmalig
`npm i -D playwright`. Playwright steht nicht in `package.json`: es lädt
einen kompletten Browser herunter und wird für den Betrieb nicht
gebraucht.
