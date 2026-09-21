/**
 * Die Groessen, in denen jedes Bild vorliegt.
 *
 * Diese Datei hat bewusst keine einzige Abhaengigkeit. Sie wird sowohl
 * von der Bildverarbeitung auf dem Server gelesen als auch von den
 * Anzeigekomponenten im Browser — laege sie bei der Verarbeitung, zoege
 * jeder Aufruf die gesamte Bildbibliothek ins Browser-Bundle.
 *
 * Muss zu BREITEN in worker/src/index.js passen.
 */

export const VARIANTEN_BREITEN = [640, 1080, 1600, 2400, 3840] as const;

/** Signaturen sind klein und brauchen keine grossen Varianten. */
export const SIGNATUR_BREITEN = [400, 900] as const;
