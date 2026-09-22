# LUART — Umsetzungsplan

Online-Galerie für die Künstlerin Lusine, unter dem Namen LUART.
Kein Shop: wenige, kuratierte Originale, jedes mit seiner eigenen Geschichte.

> **Zwei Änderungen während der Umsetzung:** Der Bildspeicher liegt bei
> Supabase statt bei Cloudflare R2 — bei einer Galerie dieser Größe ist
> ein zweiter Anbieter samt Worker mehr Aufwand als Nutzen, und die
> Formatwahl trifft ohnehin der Browser besser als ein Dienst.
>
> Der ursprünglich geplante Direktkauf über Stripe ist entfallen. Die Seite zeigt Werke und Preise; der Kauf
> entsteht im persönlichen Austausch über das Anfrageformular. Damit
> verschwinden Zahlungsdienst, Bestellverwaltung und die automatische
> Verkaufssperre — und mit ihnen ein gutes Stück Pflichten und Wartung.

---

## 1. Leitgedanke

Die Website ist ein Ausstellungsraum, kein Katalog. Das bedeutet drei
Gestaltungsprinzipien, die jede spätere Entscheidung überstimmen:

1. **Das Werk schwebt.** Seitenhintergrund und Bildhintergrund sind identisch
   reinweiß (`#FFFFFF`). Kein Rahmen, kein Schatten, keine Kachel, keine
   Trennlinie um ein Gemälde. Die Leinwand endet dort, wo die Farbe endet.
2. **Weißraum ist Inhalt.** Abstände sind großzügig und bewusst gesetzt. Ein
   Werk bekommt Luft, damit der Blick zur Ruhe kommt.
3. **Die Geschichte trägt.** Der erzählende Text zu jedem Werk ist kein
   Beiwerk, sondern der zweite Hauptdarsteller — typografisch wie ein Essay
   gesetzt, nicht wie eine Produktbeschreibung.

---

## 2. Entscheidungen aus der Befragung

| Thema | Entscheidung |
|---|---|
| Name der Seite | LUART |
| Künstlerin | Lusine, Einzelkünstlerin |
| Technik | Next.js (App Router, TypeScript) |
| Sprache | Deutsch |
| Verkauf | Preisanzeige, Erwerb über persönliche Anfrage |
| Struktur | Klassische Galerie-Navigation, eigene URL pro Werk |
| Umfang | 8–20 Werke, kuratiert |
| Serien | Eigene Ebene mit Einleitungstext |
| Backend | Eigenes Admin-Panel unter `/admin`, gleiche Codebasis |
| Daten | Supabase (Postgres + Auth) |
| Bilder | Supabase Storage, unverändert abgelegt und ausgeliefert |
| Hintergrund | Reinweiß `#FFFFFF` überall |
| Typografie | Durchgängig Serif (Titel und Fließtext) |
| Startseite | 5 im Admin wählbare Werke, je bildschirmfüllend |
| Katalog | Ruhiges 2-Spalten-Raster |
| Effekte | Scroll-Einblendung, weiche Seitenübergänge, Bild-Zoom, sanfter Parallax |
| Signatur | Individuelles PNG je Werk — unter dem Werk, als Textabschluss, beim Hover |
| Material | Start mit Platzhaltern, Lusine füllt über das Admin-Panel |
| Recht/Versand | Versandkosten je Werk als Hinweis, Rechtstexte, Bestätigungsmails |
| Hosting | Vercel |

---

## 3. Seitenstruktur

### Öffentlich

```
/                     Startseite — 5 kuratierte Werke, je bildschirmfüllend
/werke                Katalog — 2-Spalten-Raster, nach Serien gliederbar
/werke/[slug]         Werk-Detailseite — Hauptbühne
/serien               Serienübersicht
/serien/[slug]        Serie mit Einleitungstext und ihren Werken
/ueber                Über Lusine — Porträt, Biografie, Haltung
/kontakt              Kontakt- und Anfrageformular
/impressum  /agb  /widerruf  /datenschutz
```

### Geschützt

```
/admin/login          Anmeldung (Supabase Auth)
/admin                Übersicht: offene Anfragen, neue Bestellungen, Werkstatus
/admin/werke          Werkliste, Sortierung, Startseiten-Auswahl
/admin/werke/[id]     Werk bearbeiten — Texte, Daten, Bilder, Signatur, Preis
/admin/serien         Serien verwalten
/admin/bestellungen   Stripe-Käufe mit Status und Lieferadresse
/admin/anfragen       Kaufanfragen mit Bearbeitungsstatus
/admin/texte          Startseiten- und Über-Texte
```

---

## 4. Die Werk-Detailseite im Detail

Das ist die wichtigste Seite der Website. Aufbau von oben nach unten:

1. **Das Werk, groß und allein.** Formatfüllend auf Weiß, ohne Beschriftung im
   ersten Blickfeld. Klick öffnet die Zoom-Ansicht mit der Pinselstruktur.
2. **Signatur und Titel.** Direkt darunter das Signatur-PNG dieses Werks, daneben
   oder darunter Titel und Jahr — wie die Beglaubigung eines Originals.
3. **Die Geschichte.** Schmale Textspalte (ca. 60–70 Zeichen Zeilenlänge),
   großzügige Zeilenhöhe. Endet mit der Signatur als Unterschrift.
4. **Das Zitat.** Ein Satz von Lusine, groß gesetzt, viel Raum darum — wie ein
   Wandtext im Museum.
5. **Detailaufnahmen.** Nahaufnahmen von Struktur, Pinselstrich, Kanten.
6. **Datenblatt.** Technik, Material, Maße, Unikat/Edition — klein und sachlich.
7. **Erwerb.** Preis, Verfügbarkeit und der Weg zur Anfrage. Bei
   verkauften Werken stattdessen ein ruhiger Hinweis „Verkauft".
8. **Weiter.** Ein bis zwei verwandte Werke aus derselben Serie.

---

## 5. Datenmodell (Supabase Postgres)

```
series          id, slug, titel, jahr, einleitung, sortierung
artworks        id, slug, titel, jahr, serie_id,
                geschichte (Langtext), zitat,
                technik, material, breite_cm, höhe_cm, tiefe_cm,
                ist_unikat, edition_info,
                preis_cent, versand_cent, währung,
                status (verfügbar | reserviert | verkauft),
                anfrage_erlaubt,
                signatur_key,
                auf_startseite, startseite_sortierung, sortierung
artwork_images  id, artwork_id, r2_key, art (haupt | detail),
                alt_text, breite_px, höhe_px, sortierung
inquiries       id, artwork_id, name, email, nachricht,
                status (neu | beantwortet | abgeschlossen)
site_content    key, value  — Startseiten- und Über-Texte
```

**Zugriffsschutz:** Row Level Security. Öffentlich lesbar sind nur Werke,
Serien, Bilder und Texte. Anfragen sind ausschließlich für den angemeldeten
Admin-Account sichtbar; geschrieben wird dort nur serverseitig.

---

## 6. Bilder

Bilder werden **unverändert** übernommen: die Datei geht aus dem Browser
unmittelbar in den Speicher und von dort genau so an die Besucher. Keine
Verkleinerung, keine Formatumrechnung, keine Weißkorrektur.

Das ist eine bewusste Entscheidung — die Werke sollen nicht angetastet
werden. Sie verlagert allerdings zwei Dinge auf die Aufnahme: der
Hintergrund muss reinweiß sein, damit das Werk ohne Kante auf der Seite
steht, und die Datei sollte vorher auf eine vernünftige Größe gebracht
werden, weil sie unverkleinert auch auf dem Handy ankommt. Näheres in
`CLAUDE.md`.

Breite und Höhe liest der Browser vor dem Hochladen aus der Datei und
legt sie beim Werk ab. Sie werden gebraucht, damit der Browser den Platz
für ein Bild reservieren kann und die Seite beim Laden nicht springt.

## 7. Design-System

**Farbe.** `#FFFFFF` Grund, `#111111` Text, ein einziger gedeckter Grauton für
Sekundärtext. Keine Akzentfarbe — die Farbe kommt aus den Gemälden.

**Typografie.** Eine Serif für alles, in klar abgestuften Größen. Fließtext
großzügig mit begrenzter Zeilenlänge. Beschriftungen klein, in weiter
Laufweite, nie laut.

**Raster.** Ein durchgehendes Layout-Raster mit sehr breiten Außenrändern am
Desktop. Am Handy 16px Rand, Katalog wird einspaltig.

**Verbotsliste** (was den rahmenlosen Eindruck zerstören würde): keine
`box-shadow` auf Bildern, keine `border` oder `border-radius` an Bildflächen,
keine grauen Container hinter Werken, keine Platzhalterfarbe beim Laden außer
Weiß, kein Dark Mode.

---

## 8. Effekte

Alle vier gewünschten Effekte, bewusst langsam und zurückhaltend:

| Effekt | Umsetzung |
|---|---|
| Einblenden beim Scrollen | IntersectionObserver, Opazität 0→1 plus 24px Aufwärtsversatz, ca. 800ms, weiche Kurve |
| Seitenübergänge | Weiche Überblendung zwischen Routen, ohne Layout-Sprung |
| Bild-Zoom | Formatfüllende Ansicht auf Weiß, Zoom per Klick/Pinch, Schließen per Escape |
| Parallax | Bild bewegt sich beim Scrollen ca. 8% langsamer als der Text — spürbar, nicht auffällig |

Alle Effekte respektieren `prefers-reduced-motion` und schalten sich dann ab.
Nichts blockiert den Inhalt: Texte sind auch ohne JavaScript lesbar.

---

## 9. Erwerb

**Kein Kauf über die Website.** Der Preis steht offen auf der Werkseite,
daneben der Hinweis auf die Versandkosten. Wer ein Werk möchte, schreibt
über „Dieses Werk anfragen" eine Nachricht; Lusine antwortet persönlich
und klärt Versand, Zahlung und Zeitpunkt.

Das passt zu Originalen, die es je nur einmal gibt — und es erspart der
Seite einen Zahlungsdienst samt Warenkorb, Bestellverwaltung und den
Pflichten eines Online-Shops.

**Anfragen** landen im Admin-Panel und werden dort auf neu, beantwortet
oder abgeschlossen gesetzt.

Ein **E-Mail-Versand** ist vorerst nicht angebunden. Das Admin-Panel ist
damit die einzige Stelle, an der eine Anfrage sichtbar wird — es weist
oben deutlich darauf hin. Siehe `CLAUDE.md`, „Offene Punkte".

## 10. Arbeitsphasen

| Phase | Inhalt | Ergebnis |
|---|---|---|
| **0** | Projektgerüst: Next.js, TypeScript, Tailwind, Linting, `.env.example`, README | Repo läuft lokal |
| **1** | Design-System: Tokens, Typografie, Raster, Motion-Bausteine | Sichtbare Stilvorlage |
| **2** | Supabase: Tabellen, RLS, Auth, Seed mit Platzhalterwerken | Daten stehen |
| **3** | Bilder: Upload und Auslieferung | Bilder laufen |
| **4** | Öffentliches Frontend: Start, Katalog, Werk, Serien, Über, Kontakt | Website steht |
| **5** | Admin-Panel: Werke, Serien, Bilder, Signaturen, Texte | Lusine kann pflegen |
| **6** | Anfragen | Interessenten erreichen Lusine |
| **7** | Rechtstexte, SEO, Performance, Barrierefreiheit, Deployment auf Vercel | Live |

---

## 11. Was von außen gebraucht wird

Die Phasen 0–5 kann ich vollständig mit Platzhaltern bauen. Für Phase 6 und 7
werden Zugänge benötigt:

- Supabase-Projekt (URL, Anon-Key, Service-Key) — deckt Daten und Bilder ab
- Gewünschte Domain
- Angaben für das Impressum

Alle Schlüssel gehören in Umgebungsvariablen, niemals ins Repo. Ich lege eine
`.env.example` mit allen Namen und eine Einrichtungsanleitung an.

---

## 12. Annahmen und Hinweise

- **Anmeldung:** Supabase Auth mit E-Mail und Passwort, ein einziger Account für
  Lusine. Kein öffentliches Registrierungsformular.
- **Rechtstexte:** Impressum und Datenschutzerklärung sind verpflichtend.
  Verkaufsbedingungen und Widerrufsbelehrung sind für die Website selbst
  nicht vorgeschrieben, weil dort kein Vertrag geschlossen wird — sie sind
  für den Fall da, dass der Kauf per E-Mail zustande kommt. Das ist dann
  ein Fernabsatzvertrag, und die Belehrung muss vor Vertragsschluss
  vorliegen. Alle vier sollten vor dem Livegang juristisch geprüft werden.
- **Kein Dark Mode.** Er steht im direkten Widerspruch zum rahmenlosen
  Weiß-auf-Weiß-Prinzip.
- **Bildqualität ist Verkaufsargument.** Die Zoom-Ansicht lebt von hochauflösenden
  Aufnahmen. Empfehlung: mindestens 3000px lange Kante, auf reinweißem Grund
  fotografiert, farbtreu.
