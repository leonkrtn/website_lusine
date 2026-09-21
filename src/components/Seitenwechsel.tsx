"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Blendet den Seiteninhalt bei jedem Routenwechsel weich ein.
 *
 * Der `key` auf dem Pfad sorgt dafuer, dass React den Teilbaum neu
 * einhaengt und die CSS-Animation dadurch erneut laeuft. Das genuegt
 * fuer einen ruhigen Uebergang und kostet kein einziges Kilobyte
 * Animationsbibliothek.
 */
export function Seitenwechsel({ children }: { children: ReactNode }) {
  const pfad = usePathname();

  return (
    <div key={pfad} className="seitenwechsel">
      {children}
    </div>
  );
}
