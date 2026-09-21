import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Konfiguriert } from "@/lib/umgebung";

/**
 * Zugriff auf den Cloudflare-R2-Speicher.
 *
 * R2 spricht die S3-Schnittstelle, darum der AWS-Client. Die Region
 * "auto" ist bei R2 vorgeschrieben.
 *
 * Nur serverseitig verwenden — die Schluessel duerfen den Browser nie
 * erreichen.
 */

let zwischengespeichert: S3Client | null = null;

export function r2Client(): S3Client | null {
  if (!r2Konfiguriert()) return null;
  if (zwischengespeichert) return zwischengespeichert;

  zwischengespeichert = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_KONTO_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ZUGRIFFSSCHLUESSEL_ID!,
      secretAccessKey: process.env.R2_GEHEIMER_SCHLUESSEL!,
    },
  });

  return zwischengespeichert;
}

function bucket(): string {
  return process.env.R2_BUCKET ?? "luart-werke";
}

/** Legt ein Objekt im Speicher ab. */
export async function ladeHoch(
  schluessel: string,
  inhalt: Buffer,
  typ: string,
): Promise<void> {
  const client = r2Client();
  if (!client) throw new Error("R2 ist nicht eingerichtet.");

  await client.send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: schluessel,
      Body: inhalt,
      ContentType: typ,
      // Die Schluessel tragen eine Zufallskennung, ein Bild unter einer
      // Adresse aendert sich also nie.
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

/** Holt ein Objekt zurueck, etwa um Varianten daraus zu erzeugen. */
export async function holeObjekt(schluessel: string): Promise<Buffer | null> {
  const client = r2Client();
  if (!client) return null;

  try {
    const antwort = await client.send(
      new GetObjectCommand({ Bucket: bucket(), Key: schluessel }),
    );
    if (!antwort.Body) return null;

    const bytes = await antwort.Body.transformToByteArray();
    return Buffer.from(bytes);
  } catch {
    return null;
  }
}

/**
 * Eine befristete Adresse, unter der der Browser direkt hochladen darf.
 *
 * Der Umweg ueber den Server entfaellt damit — wichtig, weil
 * Serverless-Funktionen den Datenstrom auf wenige Megabyte begrenzen und
 * ein Gemaeldefoto in voller Aufloesung deutlich groesser ist.
 */
export async function hochladeAdresse(
  schluessel: string,
  typ: string,
  gueltigSekunden = 600,
): Promise<string | null> {
  const client = r2Client();
  if (!client) return null;

  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket(), Key: schluessel, ContentType: typ }),
    { expiresIn: gueltigSekunden },
  );
}

/**
 * Loescht ein Bild samt aller seiner Varianten.
 *
 * Der Schluessel ist ein Praefix wie "werke/das-zimmer-ab12cd"; darunter
 * liegen Ausgangsdatei und alle Groessen.
 */
export async function loescheBild(praefix: string): Promise<void> {
  const client = r2Client();
  if (!client) return;

  const aufgelistet = await client.send(
    new ListObjectsV2Command({ Bucket: bucket(), Prefix: `${praefix}/` }),
  );

  const schluessel = (aufgelistet.Contents ?? [])
    .map((eintrag) => eintrag.Key)
    .filter((key): key is string => Boolean(key));

  if (schluessel.length === 0) return;

  await client.send(
    new DeleteObjectsCommand({
      Bucket: bucket(),
      Delete: { Objects: schluessel.map((Key) => ({ Key })) },
    }),
  );
}
