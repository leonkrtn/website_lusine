/**
 * Die Ausgangszustaende der Formulare.
 *
 * Sie stehen hier und nicht in aktionen.ts, weil eine Datei mit
 * "use server" ausschliesslich asynchrone Funktionen nach aussen geben
 * darf. Ein Wert, der dort exportiert wird, kommt im Browser als
 * undefined an — und zwar erst beim Rendern, nicht beim Uebersetzen.
 */

export type AnfrageZustand = {
  erfolg: boolean;
  fehler: string | null;
  felderfehler: Partial<Record<"name" | "email" | "nachricht", string>>;
};

export const ANFRAGE_START: AnfrageZustand = {
  erfolg: false,
  fehler: null,
  felderfehler: {},
};
