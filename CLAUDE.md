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
- **Die Startseite beginnt mit dem Pinselstrich** (`Auftakt.tsx`): das
  erste Werk steht zuerst bildschirmfüllend vergrößert da und tritt beim
  Scrollen auf sein Maß zurück, während die Bühne stehen bleibt. Wie
  stark vergrößert wird, misst die Komponente aus Werkformat und
  Fenster (`--auftakt-naehe`). Der Abschnitt rückt um die Höhe der
  Kopfzeile unter sie (`--kopf-hoehe`, von `Kopfzeile.tsx` gemessen),
  damit der Zoom beim ersten gescrollten Punkt beginnt und nicht erst
  nach einem Leerweg. Ohne Scroll-Zeitachse oder bei
  reduzierter Bewegung steht das Werk einfach am Seitenanfang.
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
- **Kein `scroll-behavior: smooth`.** Es machte das Scrollen, das Next
  beim Seitenwechsel und beim Zurück selbst auslöst, zu einer
  sichtbaren Fahrt — von der Startseite aus über zweitausend Punkte,
  mitten in der Wanderung. Bewegen soll sich nur, was der Finger
  bewegt.
- Jedes Werk kann eine **Leitfarbe** tragen (Hexwert, von Hand im Admin).
  Sie färbt nie eine Fläche, nur die Auswahlmarkierung und die Linie über
  dem Datenblatt — der Grund bleibt überall reinweiß.
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

Das Favicon ist der Schriftzug LUART aus der Kopfzeile, als Umriss
aus der eigenen Schriftdatei. Neu erzeugt wird es mit
`python3 scripts/favicon-schriftzug.py` (schreibt `src/app/icon.svg`)
und danach `node scripts/favicon-erzeugen.mjs` (`favicon.ico`,
`apple-icon.png`).

Die Browserprüfung braucht einen laufenden `npm run start` und einmalig
`npm i -D playwright`. Playwright steht nicht in `package.json`: es lädt
einen kompletten Browser herunter und wird für den Betrieb nicht
gebraucht.
