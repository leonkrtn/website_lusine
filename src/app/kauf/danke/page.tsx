import type { Metadata } from "next";
import Link from "next/link";
import { Einblenden } from "@/components/Einblenden";

export const metadata: Metadata = {
  title: "Vielen Dank",
  robots: { index: false, follow: false },
};

/**
 * Landeseite nach erfolgreicher Zahlung.
 *
 * Die Bestellung selbst wird hier bewusst nicht angelegt — das macht
 * der Stripe-Webhook. Ein Besucher koennte diese Seite sonst einfach
 * aufrufen und damit einen Verkauf ausloesen, der nie bezahlt wurde.
 */
export default function DankeSeite() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[110rem] items-center px-4 sm:px-10 lg:px-16">
      <Einblenden className="mx-auto max-w-xl text-center">
        <h1 className="text-gross leading-tight text-balance">Vielen Dank</h1>

        <p className="erzaehlung mx-auto mt-10 text-left">
          Ihr Kauf ist eingegangen. Sie erhalten in wenigen Augenblicken eine
          Bestätigung per E-Mail.
        </p>

        <p className="erzaehlung mx-auto mt-6 text-left">
          Das Werk wird sorgfältig verpackt und versichert versendet. Sobald es
          auf dem Weg ist, bekommen Sie die Sendungsnummer.
        </p>

        <Link
          href="/werke"
          className="mt-14 inline-block border-b border-tinte pb-1 text-klein transition-opacity duration-500 hover:opacity-60"
        >
          Zurück zu den Werken
        </Link>
      </Einblenden>
    </div>
  );
}
