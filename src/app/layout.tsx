import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { seitenUrl } from "@/lib/umgebung";
import "./globals.css";

/**
 * EB Garamond traegt die ganze Seite — Titel wie Fliesstext.
 * Eine klassische Buchschrift, gemacht fuer lange Texte, zurueckhaltend
 * genug, dass die Gemaelde die Aufmerksamkeit behalten.
 *
 * Selbst gehostet, nicht ueber next/font/google: die von Google
 * ausgelieferte Fassung enthaelt nur Kerning. Mediaevalziffern,
 * Kapitaelchen und Ligaturen fehlen dort — und genau die tragen den
 * Satz dieser Seite. Herkunft und Bauweise der Dateien stehen in
 * src/schriften/HERKUNFT.md.
 *
 * Eine variable Schrift statt sechs fester Schnitte: zusammen wiegen
 * die beiden Dateien weniger als das, was vorher geladen wurde.
 */
const garamond = localFont({
  src: [
    {
      path: "../schriften/EBGaramond-Variabel.woff2",
      style: "normal",
      weight: "400 800",
    },
    {
      path: "../schriften/EBGaramond-Variabel-Kursiv.woff2",
      style: "italic",
      weight: "400 800",
    },
  ],
  variable: "--schrift-garamond",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(seitenUrl()),
  title: {
    default: "LUART — Malerei",
    template: "%s — LUART",
  },
  description:
    "Originale Malerei von Lusine. Jedes Werk ein Unikat, jedes mit seiner eigenen Geschichte.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "LUART",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  // Der Hintergrund der Browserleiste soll zum Papier passen.
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={garamond.variable}>
      <body className="bg-papier text-tinte antialiased">{children}</body>
    </html>
  );
}
