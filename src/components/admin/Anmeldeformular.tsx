"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

/**
 * Die Anmeldung.
 *
 * Laeuft als einziger Vorgang des Admin-Bereichs im Browser: Supabase
 * muss das Anmelde-Cookie selbst setzen. Alles Weitere — jedes Lesen,
 * jedes Speichern — passiert danach auf dem Server.
 */
export function Anmeldeformular() {
  const router = useRouter();
  const parameter = useSearchParams();
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);

  async function anmelden(ereignis: FormEvent<HTMLFormElement>) {
    ereignis.preventDefault();
    setFehler(null);
    setLaeuft(true);

    const formular = new FormData(ereignis.currentTarget);
    const client = supabaseBrowser();

    const { error } = await client.auth.signInWithPassword({
      email: String(formular.get("email") ?? ""),
      password: String(formular.get("passwort") ?? ""),
    });

    if (error) {
      // Bewusst unspezifisch: die Meldung soll nicht verraten, ob es
      // die E-Mail-Adresse ueberhaupt gibt.
      setFehler("E-Mail-Adresse oder Passwort stimmt nicht.");
      setLaeuft(false);
      return;
    }

    const weiter = parameter.get("weiter");
    // Nur eigene Pfade zulassen — sonst liesse sich ueber den
    // Parameter auf eine fremde Adresse umleiten.
    const ziel = weiter?.startsWith("/admin") ? weiter : "/admin";

    router.push(ziel);
    router.refresh();
  }

  const feldKlasse =
    "mt-2 w-full border-0 border-b border-feldlinie bg-papier pb-2 text-basis " +
    "outline-none transition-colors duration-500 focus:border-tinte";

  return (
    <form onSubmit={anmelden} className="mt-12">
      <div>
        <label htmlFor="email" className="beschriftung">
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          className={feldKlasse}
        />
      </div>

      <div className="mt-10">
        <label htmlFor="passwort" className="beschriftung">
          Passwort
        </label>
        <input
          id="passwort"
          name="passwort"
          type="password"
          autoComplete="current-password"
          required
          className={feldKlasse}
        />
      </div>

      {fehler && (
        <p role="alert" className="mt-8 text-klein text-tinte-leise">
          {fehler}
        </p>
      )}

      <button
        type="submit"
        disabled={laeuft}
        className="mt-12 border-b border-tinte pb-1 text-klein transition-opacity duration-500 hover:opacity-60 disabled:opacity-40"
      >
        {laeuft ? "Einen Moment …" : "Anmelden"}
      </button>
    </form>
  );
}
