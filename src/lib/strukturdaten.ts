import { bildAdresseVoll } from "@/lib/bilder";
import { absaetze } from "@/lib/darstellung";
import { SEITENNAME } from "@/lib/metadaten";
import { seitenUrl } from "@/lib/umgebung";
import type { WerkMitSerie, WerkStatus } from "@/lib/typen";

/**
 * Strukturierte Daten nach schema.org, als JSON-LD.
 *
 * Für Suchmaschinen ist eine Werkseite sonst nur Text mit einem Bild.
 * Hier steht ausdrücklich, was sie zeigt: ein Gemälde, von wem, woraus,
 * wie groß, ob es zu haben ist. Das hilft vor allem der Bildersuche,
 * über die man ein Gemälde am ehesten findet.
 *
 * Die Künstlerin und die Seite tragen eine feste `@id`. Die Werke
 * verweisen darauf, statt sie jedes Mal neu zu beschreiben.
 */

type Daten = Record<string, unknown>;

export function kuenstlerinId(): string {
  return `${seitenUrl()}/#kuenstlerin`;
}

function seiteId(): string {
  return `${seitenUrl()}/#seite`;
}

/** Die Seite und die Künstlerin — gilt für jede öffentliche Seite. */
export function seiteUndKuenstlerin(): Daten {
  const basis = seitenUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": seiteId(),
        url: basis,
        name: SEITENNAME,
        inLanguage: "de",
        publisher: { "@id": kuenstlerinId() },
      },
      {
        "@type": "Person",
        "@id": kuenstlerinId(),
        name: "Lusine",
        jobTitle: "Malerin",
        url: `${basis}/ueber`,
      },
    ],
  };
}

/** Die Seite „Über“ beschreibt die Künstlerin selbst. */
export function profilseite(): Daten {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${seitenUrl()}/ueber`,
    isPartOf: { "@id": seiteId() },
    mainEntity: { "@id": kuenstlerinId() },
  };
}

const VERFUEGBARKEIT: Record<WerkStatus, string> = {
  verfuegbar: "https://schema.org/InStock",
  reserviert: "https://schema.org/Reserved",
  verkauft: "https://schema.org/SoldOut",
};

function zentimeter(wert: number | null): Daten | undefined {
  return wert ? { "@type": "QuantitativeValue", value: wert, unitCode: "CMT" } : undefined;
}

/** Ein Werk als Gemälde, samt Weg dorthin. */
export function werkangaben(werk: WerkMitSerie): Daten {
  const basis = seitenUrl();
  const adresse = `${basis}/werke/${werk.slug}`;
  const beschreibung = absaetze(werk.geschichte)[0];

  const gemaelde: Daten = {
    "@type": "VisualArtwork",
    "@id": `${adresse}#werk`,
    url: adresse,
    name: werk.titel,
    description: beschreibung || undefined,
    image: werk.bilder.map((bild) => bildAdresseVoll(bild.schluessel)).filter(Boolean),
    creator: { "@id": kuenstlerinId() },
    dateCreated: werk.jahr ? String(werk.jahr) : undefined,
    artform: "Malerei",
    artMedium: werk.technik || undefined,
    artworkSurface: werk.material ?? undefined,
    width: zentimeter(werk.breiteCm),
    height: zentimeter(werk.hoeheCm),
    depth: zentimeter(werk.tiefeCm),
    artEdition: werk.istUnikat ? 1 : (werk.editionInfo ?? undefined),
    isPartOf: werk.serie
      ? { "@type": "CreativeWorkSeries", name: werk.serie.titel, url: `${basis}/serien/${werk.serie.slug}` }
      : undefined,
    offers:
      werk.preisCent !== null
        ? {
            "@type": "Offer",
            url: adresse,
            price: (werk.preisCent / 100).toFixed(2),
            priceCurrency: werk.waehrung.toUpperCase(),
            availability: VERFUEGBARKEIT[werk.status],
            seller: { "@id": kuenstlerinId() },
          }
        : undefined,
  };

  const pfad: Daten = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Werke", item: `${basis}/werke` },
      { "@type": "ListItem", position: 2, name: werk.titel, item: adresse },
    ],
  };

  return { "@context": "https://schema.org", "@graph": [gemaelde, pfad] };
}
