# EB Garamond

Die Schrift der ganzen Seite, hier selbst gehostet statt über
`next/font/google` bezogen.

## Warum nicht mehr über Google Fonts

Die von Google ausgelieferte Fassung ist auf das Nötigste beschnitten:
sie enthält **nur Kerning**. Nachgemessen im Browser — `onum`, `smcp`,
`liga`, `dlig` und `tnum` verändern die Satzbreite dort um keinen
Punkt, weil die Merkmale schlicht fehlen.

Genau diese Merkmale tragen aber den Satz dieser Seite:

- `onum` — Mediävalziffern. Eine Jahreszahl bekommt Ober- und
  Unterlängen und sitzt im Text, statt als Block darüber zu stehen.
- `smcp` / `c2sc` — echte Kapitälchen für die Beschriftungen, statt
  verkleinerter Versalien mit aufgezogener Laufweite.
- `liga` / `dlig` — Ligaturen.
- `tnum` — Tabellenziffern fürs Datenblatt, damit die Spalte steht.

## Herkunft

Quelle: <https://github.com/google/fonts/tree/main/ofl/ebgaramond>
(die unbeschnittenen Ausgangsdateien, nicht die API-Auslieferung)

- `EBGaramond[wght].ttf` → `EBGaramond-Variabel.woff2`
- `EBGaramond-Italic[wght].ttf` → `EBGaramond-Variabel-Kursiv.woff2`

Lizenz: SIL Open Font License 1.1, siehe `OFL.txt`.

## Wie die Dateien entstanden sind

Zeichenvorrat auf Latein samt Erweiterung und Satzzeichen begrenzt, die
Merkmale ausdrücklich behalten, als variable Schrift (Achse `wght`
400–800) nach woff2 gepackt:

```bash
pip install fonttools brotli

python3 -m fontTools.subset "EBGaramond[wght].ttf" \
  --unicodes="U+0000-00FF,U+0100-017F,U+0180-024F,U+2000-206F,U+2070-209F,U+20A0-20BF,U+2122,U+2190-2193,U+2212,U+2013,U+2014,U+2018,U+2019,U+201A,U+201C,U+201D,U+201E,U+2026,U+00A0,U+00AD" \
  --layout-features="kern,liga,clig,rlig,dlig,onum,lnum,tnum,pnum,smcp,c2sc,frac,numr,dnom,sups,subs,case,locl,ordn,ccmp,mark,mkmk" \
  --flavor=woff2 --output-file=EBGaramond-Variabel.woff2
```

Für die kursive Datei dasselbe mit `EBGaramond-Italic[wght].ttf`.

Beide Dateien zusammen wiegen rund 250 kB und ersetzen die sechs
statischen Schnitte, die vorher geladen wurden — unterm Strich also
nicht mehr, sondern weniger.
