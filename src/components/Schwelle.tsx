"use client";

import { useEffect } from "react";
import { eingetreten } from "@/lib/ankunft";

/**
 * Markiert, dass die erste Seite steht. Alles, was danach gerendert
 * wird, kommt aus der Galerie selbst, nicht von draußen. Siehe
 * `src/lib/ankunft.ts`.
 *
 * Sitzt im Layout und damit über jeder Seite: seine Wirkung tritt ein,
 * nachdem die erste Seite gerendert ist, und das Layout bleibt beim
 * Seitenwechsel stehen.
 */
export function Schwelle() {
  useEffect(() => {
    eingetreten();
  }, []);

  return null;
}
