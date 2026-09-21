import type { Metadata, Viewport } from "next";
import { EB_Garamond } from "next/font/google";
import { seitenUrl } from "@/lib/umgebung";
import "./globals.css";

/**
 * EB Garamond traegt die ganze Seite — Titel wie Fliesstext.
 * Eine klassische Buchschrift, gemacht fuer lange Texte, zurueckhaltend
 * genug, dass die Gemaelde die Aufmerksamkeit behalten.
 */
const garamond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--schrift-garamond",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(seitenUrl()),
  title: {
    default: "Lusine — Malerei",
    template: "%s — Lusine",
  },
  description:
    "Originale Malerei von Lusine. Jedes Werk ein Unikat, jedes mit seiner eigenen Geschichte.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Lusine",
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
