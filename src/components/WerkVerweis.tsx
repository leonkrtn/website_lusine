"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import type { Bildquelle } from "@/lib/werkseitenbild";

type Props = {
  href: string;
  /** Das Hauptbild der Werkseite, wie `werkseitenQuelle()` es liefert. */
  quelle: Bildquelle | null;
  className?: string;
  tabIndex?: number;
  children: ReactNode;
};

/**
 * Wie lange ein Klick höchstens auf das Bild wartet. Danach wird
 * trotzdem gewechselt — lieber ein Werk, das nachlädt, als ein Klick,
 * auf den nichts geschieht.
 */
const HOECHSTENS_MS = 1000;

/**
 * Was schon geladen wird oder geladen ist, je Quelle. Das Bild selbst
 * bleibt mit darin: ein `Image`, auf das nichts mehr zeigt, darf der
 * Browser wegräumen und mit ihm die fertig entschlüsselte Fassung.
 */
const vorgeladen = new Map<string, { bild: HTMLImageElement; fertig: Promise<void> }>();

function vorladen(quelle: Bildquelle): Promise<void> {
  const schluessel = quelle.srcSet ?? quelle.src;
  const bekannt = vorgeladen.get(schluessel);
  if (bekannt) return bekannt.fertig;

  const bild = new Image();
  /* `sizes` vor `srcset`: sonst wählt der Browser schon, bevor er
     weiß, wie breit das Bild werden soll. */
  if (quelle.sizes) bild.sizes = quelle.sizes;
  if (quelle.srcSet) bild.srcset = quelle.srcSet;
  bild.src = quelle.src;

  /* `decode()` statt `onload`: fertig heißt hier nicht geladen,
     sondern bereit zum Zeichnen. */
  const fertig = bild.decode().catch(() => {});
  vorgeladen.set(schluessel, { bild, fertig });
  return fertig;
}

/**
 * Ein Verweis auf eine Werkseite, der das Werk mitbringt.
 *
 * Beim Wechsel wandert das Werk an seinen Platz auf der Werkseite
 * (siehe `.wanderung` in globals.css). Die Wanderung endet auf dem
 * Bild der Werkseite — und das ist eine andere Fassung als die, die
 * man gerade sieht: größer, auf dem Handy oft eine ganz andere Datei.
 * War sie noch nicht geladen, lief die Wanderung kurz an, das Werk
 * verschwand, und erst mit der Datei kam es wieder.
 *
 * Darum wird sie vorab geholt: sobald der Zeiger über dem Verweis
 * steht, er den Fokus bekommt oder ein Finger ihn berührt. Der Klick
 * selbst wartet, bis sie bereit ist, höchstens aber eine Sekunde. Wer
 * mit dem Zeiger kommt, merkt davon nichts; das Bild ist längst da.
 *
 * Mit gedrückter Taste oder mittlerer Maustaste bleibt es ein
 * gewöhnlicher Verweis — ein neuer Tab braucht keine Wanderung.
 */
export function WerkVerweis({ href, quelle, className, tabIndex, children }: Props) {
  const router = useRouter();

  const holen = () => {
    if (quelle) vorladen(quelle);
  };

  const beimKlick = (ereignis: MouseEvent<HTMLAnchorElement>) => {
    if (
      !quelle ||
      ereignis.button !== 0 ||
      ereignis.metaKey ||
      ereignis.ctrlKey ||
      ereignis.shiftKey ||
      ereignis.altKey
    ) {
      return;
    }

    /* `Link` sieht das und wechselt nicht selbst. */
    ereignis.preventDefault();

    const frist = new Promise<void>((fertig) => setTimeout(fertig, HOECHSTENS_MS));
    Promise.race([vorladen(quelle), frist]).then(() => router.push(href));
  };

  return (
    <Link
      href={href}
      className={className}
      tabIndex={tabIndex}
      onPointerEnter={holen}
      onFocus={holen}
      onTouchStart={holen}
      onClick={beimKlick}
    >
      {children}
    </Link>
  );
}
