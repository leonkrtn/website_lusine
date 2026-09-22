import { Kopierfeld } from "@/components/admin/Kopierfeld";
import { masseText } from "@/lib/bilder";
import { detailbilder, hauptbild } from "@/lib/darstellung";
import { seitenUrl } from "@/lib/umgebung";
import type { Werk } from "@/lib/typen";

/**
 * Alles, was ein Werk braucht, um auf Instagram und Pinterest zu
 * erscheinen — Bilder in den richtigen Formaten, der Link, die Texte.
 *
 * **Der Gedanke dahinter: draußen der Ausschnitt, drinnen das Ganze.**
 * Ein Beitrag auf Instagram zeigt ein Werk auf Handbreite, gepresst,
 * zwischen fremden Bildern. Er kann Neugier wecken, aber nicht zeigen,
 * wie die Farbe liegt, wie groß das Bild ist, was es erzählt. Darum
 * beginnt der Beitrag mit der Nahaufnahme und endet mit dem ganzen
 * Werk auf Weiß — und wer dem Link folgt, kommt auf der Werkseite
 * wieder am Pinselstrich an und tritt dort zurück, bis das Werk in
 * voller Auflösung dasteht (`Werkanfang.tsx`).
 *
 * Die Bilder entstehen in `src/lib/sozialbild.tsx`; hier wird nur
 * verlinkt.
 */
export function Weitergabe({ werk }: { werk: Werk }) {
  const adresse = `${seitenUrl()}/werke/${werk.slug}`;
  const kurz = adresse.replace(/^https?:\/\//, "").replace(/^www\./, "");
  const masse = masseText(werk.breiteCm, werk.hoeheCm, werk.tiefeCm);
  const hatBild = Boolean(hauptbild(werk.bilder));
  const hatDetail = detailbilder(werk.bilder).length > 0;

  const titelzeile = `${werk.titel}${werk.jahr ? `, ${werk.jahr}` : ""}`;
  const angaben = [
    werk.technik,
    masse,
    werk.istUnikat ? "Unikat" : werk.editionInfo,
  ].filter(Boolean);

  /* Wie ein Saalschild, dann ein Satz, der sagt, was drinnen wartet.
     Instagram macht Links in Bildunterschriften nicht anklickbar; die
     Adresse steht trotzdem da, zum Abschreiben, und der Hinweis aufs
     Profil führt zum Link, der funktioniert. */
  const bildunterschrift = [
    titelzeile,
    ...angaben,
    "",
    "Das ganze Werk, seine Geschichte und seine wahre Größe: Link im Profil.",
    kurz,
  ].join("\n");

  const pinBeschreibung = [
    `${titelzeile}. ${angaben.join(", ")}.`,
    "Originalgemälde von Lusine.",
  ].join(" ");

  const formate = [
    hatDetail && {
      pfad: "instagram-nah",
      titel: "Instagram · 1. Bild",
      text: "Die erste Nahaufnahme, formatfüllend. Sie macht neugierig.",
    },
    hatBild && {
      pfad: "instagram",
      titel: hatDetail ? "Instagram · 2. Bild" : "Instagram",
      text: "Das ganze Werk auf Weiß, mit demselben Rand wie jeder andere Beitrag — das Profil wird zur Wand.",
    },
    hatBild && {
      pfad: "pinterest",
      titel: "Pinterest",
      text: "Werk und Schild mit Name und Adresse. Der Pin trägt sie mit, wohin er auch weitergemerkt wird.",
    },
  ].filter((eintrag): eintrag is { pfad: string; titel: string; text: string } => Boolean(eintrag));

  return (
    <section className="border-t border-linie pt-10">
      <h2 className="text-lead leading-snug">Für Instagram und Pinterest</h2>
      <p className="mt-2 max-w-xl text-klein text-tinte-leise">
        Draußen der Ausschnitt, drinnen das Ganze: auf Instagram zuerst die
        Nahaufnahme, dann das ganze Werk. Wer dem Link folgt, kommt auf der
        Werkseite wieder am Pinselstrich an und tritt zurück, bis das Werk
        dasteht. Die Bilder erneuern sich, sobald das Werk gespeichert wird.
      </p>

      {formate.length === 0 ? (
        <p className="mt-8 text-klein text-tinte-leise">
          Sobald ein Hauptbild hochgeladen ist, stehen hier die Bilder bereit.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {formate.map((format) => {
            const quelle = `/werke/${werk.slug}/bild/${format.pfad}`;
            return (
              <li key={format.pfad}>
                <a href={quelle} download={`${werk.slug}-${format.pfad}.png`} className="group block">
                  {/* Eine Vorschau des fertigen Bildes, nicht das Werk selbst. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={quelle}
                    alt=""
                    loading="lazy"
                    className="w-full outline outline-1 outline-linie"
                  />
                  <span className="beschriftung mt-4 block">{format.titel}</span>
                  <span className="mt-1 block text-klein underline decoration-feldlinie underline-offset-4 group-hover:decoration-tinte">
                    Herunterladen
                  </span>
                </a>
                <p className="mt-2 text-fluestern text-tinte-still">{format.text}</p>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-12 max-w-2xl space-y-10">
        <Kopierfeld beschriftung="Link zum Werk" text={adresse} />
        <Kopierfeld
          beschriftung="Bildunterschrift für Instagram"
          text={bildunterschrift}
          zeilen={bildunterschrift.split("\n").length}
        />
        <Kopierfeld beschriftung="Pinterest · Titel" text={titelzeile} />
        <Kopierfeld beschriftung="Pinterest · Beschreibung" text={pinBeschreibung} zeilen={3} />
      </div>
    </section>
  );
}
