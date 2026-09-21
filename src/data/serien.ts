import type { Serie } from "@/lib/typen";

/**
 * Platzhalter-Serien fuer den Demo-Modus.
 *
 * Sobald Supabase angeschlossen ist, kommen die echten Serien aus der
 * Datenbank und diese Datei wird nicht mehr gelesen.
 */
export const SERIEN_SEED: Serie[] = [
  {
    id: "serie-stille-raeume",
    slug: "stille-raeume",
    titel: "Stille Räume",
    jahr: 2024,
    einleitung:
      "Eine Folge von sieben Bildern über Zimmer, in denen gerade jemand gewesen ist. Nicht die Menschen interessieren mich, sondern was sie zurücklassen: die Wärme auf einem Stuhl, das Licht, das weiterzieht, die Luft, die sich noch bewegt.",
    sortierung: 1,
  },
  {
    id: "serie-vor-dem-gewitter",
    slug: "vor-dem-gewitter",
    titel: "Vor dem Gewitter",
    jahr: 2023,
    einleitung:
      "Der Moment, in dem die Farbe im Himmel kippt und alles den Atem anhält. Diese Bilder sind im Sommer 2023 entstanden, fast alle an denselben drei Abenden, an denen es angekündigt war und dann doch nicht kam.",
    sortierung: 2,
  },
  {
    id: "serie-was-bleibt",
    slug: "was-bleibt",
    titel: "Was bleibt",
    jahr: 2025,
    einleitung:
      "Erinnerungen verlieren ihre Ränder, bevor sie ihre Farbe verlieren. Die Arbeiten dieser Serie entstehen in vielen dünnen Schichten, von denen jede die vorherige halb verdeckt — so, wie sich Erinnerung über Erinnerung legt.",
    sortierung: 3,
  },
];
