# LUART — Malerei

Online-Galerie für originale Malerei.
Kein Shop: wenige, kuratierte Werke, jedes mit seiner eigenen Geschichte.
Die Seite zeigt Werke und Preise — gekauft wird im persönlichen
Austausch, nicht per Warenkorb.

---

## Der Grundsatz

Drei Regeln überstimmen jede spätere Entscheidung:

1. **Das Werk schwebt.** Seitenhintergrund und Bildhintergrund sind
   identisch reinweiß (`#FFFFFF`). Kein Rahmen, kein Schatten, keine
   Kachel, keine Trennlinie um ein Gemälde.
2. **Weißraum ist Inhalt.** Abstände sind großzügig und bewusst gesetzt.
3. **Die Geschichte trägt.** Der erzählende Text zu jedem Werk ist der
   zweite Hauptdarsteller, typografisch wie ein Essay gesetzt.

Regel 1 ist technisch abgesichert, nicht nur gestalterisch gemeint:

- `src/app/globals.css` enthält am Ende eine **Verbotsliste**. Sie schließt
  für jede Bildfläche `border`, `border-radius` und `box-shadow` aus.
- Beim Hochladen misst der Browser den Bildhintergrund. Weicht er von
  Reinweiß ab, wird das gezeigt und eine Korrektur angeboten — ein leicht
  graues oder gelbstichiges Foto bekäme auf der Seite sonst eine sichtbare
  rechteckige Kante.
- Es gibt **keinen Dark Mode**. Er widerspricht dem Prinzip direkt.

---

## Sofort starten

```bash
npm install
npm run dev
```

→ <http://localhost:3000>

Die Seite läuft ohne jede Zugangsdaten im **Demo-Modus**: die Werke kommen
aus `src/data/`, die Bilder aus `public/`. So lässt sich alles ansehen und
bedienen, bevor ein einziges Konto angelegt ist.

Der Verwaltungsbereich unter `/admin` zeigt dann eine Vorschau mit den
Beispielwerken; gespeichert wird nichts.

---

## Einrichtung

Zwei Dienste, in dieser Reihenfolge. Nach jedem Schritt läuft mehr — die
Seite ist in jedem Zwischenstand lauffähig.

Die Zugangsdaten gehören nach `.env.local` (Vorlage: `.env.example`).
Diese Datei gehört **nicht** ins Repository.

### 1. Supabase — Daten und Anmeldung

1. Projekt anlegen auf <https://supabase.com>
2. **SQL Editor → New query** → Inhalt von `supabase/01_schema.sql`
   einfügen → **Run**. Dann dasselbe mit `supabase/02_speicher.sql`, das
   den Ablageort für die Bilder anlegt. Beide Skripte sind wiederholbar
   und zerstören keine Daten.
3. **Authentication → Sign In / Providers**: „Allow new users to sign up“
   **abschalten**. Es soll genau einen Zugang geben.
4. **Authentication → Users → Add user**: Lusines E-Mail-Adresse und ein
   Passwort. Das sind ihre Anmeldedaten für `/admin`.
5. **Project Settings → API**: die drei Werte nach `.env.local` übertragen.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Der Dienstschlüssel umgeht alle Zugriffsregeln und darf niemals im Browser
landen — deshalb trägt er kein `NEXT_PUBLIC_`.

Ab jetzt ist `/admin` passwortgeschützt, die Seite zeigt echte Daten und
Bilder lassen sich hochladen. Sie ist zunächst leer; die Beispielwerke
gehören zum Demo-Modus.

### 2. Resend — E-Mail

Verschickt die Eingangsbestätigung an Interessenten und benachrichtigt
Lusine über neue Anfragen. Konto auf <https://resend.com>, Absenderdomain
verifizieren:

```
RESEND_API_KEY=
EMAIL_ABSENDER="LUART <atelier@deine-domain.de>"
EMAIL_ATELIER=
```

### Zuletzt: die Rechtstexte

`/impressum`, `/datenschutz`, `/agb` und `/widerruf` stehen als Gerüste
bereit. Alle auszufüllenden Stellen sind **gelb hinterlegt** und dadurch
nicht zu übersehen.

Impressum und Datenschutzerklärung sind verpflichtend und abmahnfähig.
Die Verkaufsbedingungen und die Widerrufsbelehrung sind für die Website
selbst nicht vorgeschrieben, weil hier kein Vertrag geschlossen wird —
sie sind für den Fall da, dass der Kauf später per E-Mail zustande kommt.
Das ist dann ein Fernabsatzvertrag, und die Widerrufsbelehrung muss dem
Käufer **vor** Vertragsschluss vorliegen. Aus einem Angebot heraus auf
diese Seite zu verlinken, genügt dafür.

Die Endfassung aller vier Seiten sollte vor dem Livegang jemand mit
Fachkenntnis prüfen.

---

## Veröffentlichen

Auf Vercel: Repository verbinden, alle Variablen aus `.env.local` unter
**Settings → Environment Variables** eintragen, `NEXT_PUBLIC_SEITEN_URL`
auf die echte Adresse setzen.

---

## Aufbau

```
src/
  app/
    (seite)/          Die öffentliche Galerie
    admin/            Verwaltung für Lusine
    api/              Bild-Upload
    aktionen.ts       Das Anfrageformular
  components/         Anzeige- und Bewegungsbausteine
  lib/
    daten.ts          Die einzige Stelle, an der gelesen wird
    varianten.ts      Bildverarbeitung und Weißabgleich
    speicher.ts       Ablage der Bilder
    bilder.ts         Bildadressen, Preise, Maße
  data/               Beispielwerke für den Demo-Modus
supabase/             Datenbankschema und Bildspeicher
scripts/              Platzhalter-Gemälde und Browserprüfung
```

**`src/lib/bilder.ts`** beantwortet alle Fragen zu Bildadressen an einer
Stelle: wo eine Datei liegt, welche Größen es gibt, wie ein `srcset`
aussieht. Die Anzeigekomponenten wissen nichts über den Speicherort —
deshalb war der Wechsel von einem externen Anbieter hierher ein Eingriff
in eine einzige Datei.

**`src/lib/daten.ts`** ist der zweite Schlüssel zum Verständnis: jede Funktion
beantwortet dieselbe Frage zweimal — einmal aus Supabase, einmal aus den
Beispieldaten. Welcher Weg genommen wird, entscheidet allein, ob
Zugangsdaten hinterlegt sind. Deshalb ändert der Umstieg auf echte Daten
keine einzige Zeile in den Seiten.

---

## Befehle

```bash
npm run dev      # Entwicklung
npm run build    # Produktionsbau
npm run start    # Produktionsbau lokal ausführen
npm run lint     # Prüfung
npm run pruefen  # Typen und Prüfung zusammen

node scripts/gemaelde-erzeugen.mjs   # Platzhalter neu erzeugen
```

Das letzte Skript erzeugt die Beispielbilder aus `src/data/werke.ts` und
**prüft anschließend jede Bildecke auf exaktes Reinweiß**. Sobald echte
Fotos vorliegen, wird es nicht mehr gebraucht.

---

## Für echte Aufnahmen

Die Zoomansicht lebt von hochauflösenden Bildern — sie ist bei einem
Original das wichtigste Verkaufsargument.

- mindestens 3000 Punkte an der langen Kante
- auf **reinweißem** Grund, gleichmäßig ausgeleuchtet
- farbtreu, ohne Farbstich
- zusätzlich zwei bis drei Nahaufnahmen der Oberfläche

Jedes Bild wird beim Hochladen in fünf Breiten und drei Formaten abgelegt;
welche Fassung ein Besucher bekommt, entscheidet sein Browser anhand von
Bildschirm und unterstützten Formaten.

Weicht der Hintergrund von Reinweiß ab, meldet das der Upload und bietet
eine Korrektur an. Die Korrektur verschiebt dabei auch die Bildfarben leicht — das
gleicht einen Farbstich der Aufnahme mit aus, ersetzt aber keine gute
Aufnahme.
