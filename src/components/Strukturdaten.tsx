/**
 * Setzt strukturierte Daten (JSON-LD) in die Seite.
 *
 * `<` wird maskiert, damit ein Titel oder eine Geschichte, die
 * zufällig „</script>“ enthält, das Skript nicht vorzeitig schließt.
 * Die Angaben kommen aus `src/lib/strukturdaten.ts`.
 */
export function Strukturdaten({ daten }: { daten: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(daten).replace(/</g, "\\u003c"),
      }}
    />
  );
}
