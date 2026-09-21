import type { NextConfig } from "next";

/**
 * Die Bilder werden im Produktivbetrieb von einem Cloudflare Worker
 * ausgeliefert, der die passende Variante erzeugt. Solange dessen Adresse
 * nicht gesetzt ist, läuft die Seite im lokalen Modus mit Dateien aus
 * /public und der eingebauten Bildoptimierung.
 */
const bildHost = process.env.NEXT_PUBLIC_BILD_BASIS_URL;

const nextConfig: NextConfig = {
  images: {
    // Ein Gemälde soll auch im Zoom gestochen scharf sein.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
    formats: ["image/avif", "image/webp"],
    remotePatterns: bildHost
      ? [
          {
            protocol: new URL(bildHost).protocol.replace(":", "") as
              | "http"
              | "https",
            hostname: new URL(bildHost).hostname,
          },
        ]
      : [],
  },
};

export default nextConfig;
