"""
Setzt den Schriftzug LUART als Umriss in src/app/icon.svg.

    pip install fonttools brotli
    python3 scripts/favicon-schriftzug.py
    node scripts/favicon-erzeugen.mjs

Das Favicon zeigt denselben Schriftzug wie die Kopfzeile: EB Garamond
in Versalien, auf 0,2 em gesperrt. Ein Favicon kann keine Webschrift
laden, darum stehen die Buchstaben als Pfade in der Datei — aus
derselben Schriftdatei, die die Seite ausliefert.

Die Strichstärke liegt etwas über der Kopfzeile. Bei 16 und 32 Punkt
lösen sich die feinen Serifen der Garamond sonst in Grau auf.
"""

from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

WURZEL = Path(__file__).resolve().parent.parent
SCHRIFT = WURZEL / "src" / "schriften" / "EBGaramond-Variabel.woff2"
ZIEL = WURZEL / "src" / "app" / "icon.svg"

WORT = "LUART"
STAERKE = 560  # wght; die Kopfzeile steht bei 400
SPERRUNG = 0.2  # em, wie tracking-[0.2em] in Kopfzeile.tsx
FELD = 1000  # Kantenlänge der Zeichenfläche
RAND = 0.05  # Anteil der Fläche, der links und rechts frei bleibt
TINTE = "#111111"  # --color-tinte
PAPIER = "#FFFFFF"  # --color-papier

schrift = instantiateVariableFont(TTFont(SCHRIFT), {"wght": STAERKE})
einheiten = schrift["head"].unitsPerEm
versalhoehe = schrift["OS/2"].sCapHeight
glyphen = schrift.getGlyphSet()
zeichen = schrift.getBestCmap()

# Breite des Worts in Schrifteinheiten. Die Sperrung steht nur zwischen
# den Buchstaben — nach dem letzten würde sie das Wort aus der Mitte
# schieben.
namen = [zeichen[ord(b)] for b in WORT]
vorschuebe = [glyphen[n].width for n in namen]
sperrung = SPERRUNG * einheiten
wortbreite = sum(vorschuebe) + sperrung * (len(namen) - 1)

massstab = FELD * (1 - 2 * RAND) / wortbreite
links = FELD * RAND
# Optisch mittig: die Versalhöhe sitzt in der Mitte der Fläche.
grundlinie = FELD / 2 + versalhoehe * massstab / 2

pfade = []
x = 0.0
for name, vorschub in zip(namen, vorschuebe):
    stift = SVGPathPen(glyphen, ntos=lambda wert: f"{wert:.1f}".rstrip("0").rstrip("."))
    # Schriftkoordinaten zeigen nach oben, SVG nach unten.
    glyphen[name].draw(
        TransformPen(stift, (massstab, 0, 0, -massstab, links + x * massstab, grundlinie))
    )
    pfade.append(stift.getCommands())
    x += vorschub + sperrung

ZIEL.write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {FELD} {FELD}">'
    f'<rect width="{FELD}" height="{FELD}" fill="{PAPIER}"/>'
    f'<path fill="{TINTE}" d="{" ".join(pfade)}"/>'
    "</svg>\n"
)
print(f"{ZIEL.relative_to(WURZEL)} geschrieben")
