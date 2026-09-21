import Link from "next/link";

export default function NichtGefunden() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[110rem] items-center px-4 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-gross leading-tight">Nicht gefunden</h1>
        <p className="erzaehlung mx-auto mt-10 text-left">
          Diese Seite gibt es nicht — vielleicht wurde ein Werk verkauft und
          später aus dem Verzeichnis genommen, oder die Adresse hat sich
          vertippt.
        </p>
        <Link
          href="/werke"
          className="mt-12 inline-block border-b border-tinte pb-1 text-klein transition-opacity duration-500 hover:opacity-60"
        >
          Zu den Werken
        </Link>
      </div>
    </div>
  );
}
