# Bild-Worker

Liefert die Werkbilder aus dem Cloudflare-R2-Speicher aus.

## Warum ein eigener Worker

Die Bilder sind das Produkt dieser Seite. Sie müssen gestochen scharf
sein, schnell laden und dürfen nichts kosten, solange die Galerie klein
ist. Der Worker erreicht das, indem er nur fertige Varianten ausliefert
und sie am Edge zwischenspeichert — ohne kostenpflichtiges
Image Resizing.

Die Varianten entstehen beim Hochladen im Admin-Bereich der Website
(`src/lib/varianten.ts`). Dort wird jedes Bild einmal in fünf Breiten
und drei Formaten abgelegt. Der Worker wählt daraus aus.

## Aufbau im Speicher

```
werke/das-zimmer-ab12cd/original.jpg
werke/das-zimmer-ab12cd/0640.avif
werke/das-zimmer-ab12cd/0640.webp
werke/das-zimmer-ab12cd/0640.jpg
werke/das-zimmer-ab12cd/1080.avif
…
```

Jeder Schlüssel trägt eine Zufallskennung. Ein Bild unter einer
bestimmten Adresse ändert sich damit nie und darf für immer
zwischengespeichert werden.

## Einrichten

```bash
cd worker
npx wrangler login
npx wrangler r2 bucket create luart-werke
npx wrangler deploy
```

Die ausgegebene Adresse anschließend in der Website als
`NEXT_PUBLIC_BILD_BASIS_URL` eintragen.

Solange sie leer ist, läuft die Website im lokalen Modus und nimmt die
Bilder aus `public/` — der Worker wird dann gar nicht angefragt.
