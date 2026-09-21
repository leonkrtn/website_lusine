-- ===========================================================================
--  Website Lusine — Datenbankschema
--
--  Einspielen:
--    Supabase Dashboard -> SQL Editor -> New query -> dieses Skript
--    einfuegen -> Run.
--
--  Das Skript ist wiederholbar: es laesst sich mehrfach ausfuehren, ohne
--  Fehler zu werfen oder Daten zu zerstoeren.
-- ===========================================================================

-- ---------------------------------------------------------------------------
--  Aufzaehlungstypen
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'werk_status') then
    create type werk_status as enum ('verfuegbar', 'reserviert', 'verkauft');
  end if;

  if not exists (select 1 from pg_type where typname = 'bild_art') then
    create type bild_art as enum ('haupt', 'detail');
  end if;

  if not exists (select 1 from pg_type where typname = 'anfrage_status') then
    create type anfrage_status as enum ('neu', 'beantwortet', 'abgeschlossen');
  end if;
end $$;

-- ---------------------------------------------------------------------------
--  Hilfsfunktion: aktualisiert_am automatisch fortschreiben
-- ---------------------------------------------------------------------------

create or replace function setze_aktualisiert_am()
returns trigger
language plpgsql
as $$
begin
  new.aktualisiert_am = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
--  Serien
--
--  Eine Werkgruppe mit eigenem Einleitungstext. Werke koennen zu genau
--  einer Serie gehoeren oder zu keiner.
-- ---------------------------------------------------------------------------

create table if not exists serien (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  titel         text not null,
  jahr          integer,
  einleitung    text not null default '',
  sortierung    integer not null default 0,
  erstellt_am   timestamptz not null default now(),
  aktualisiert_am timestamptz not null default now()
);

create index if not exists serien_sortierung_idx on serien (sortierung, titel);

drop trigger if exists serien_aktualisiert on serien;
create trigger serien_aktualisiert
  before update on serien
  for each row execute function setze_aktualisiert_am();

-- ---------------------------------------------------------------------------
--  Werke
--
--  Der Kern der Seite. Preise werden in Cent gespeichert, damit beim
--  Rechnen keine Rundungsfehler entstehen.
-- ---------------------------------------------------------------------------

create table if not exists werke (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  titel         text not null,
  jahr          integer,
  serie_id      uuid references serien (id) on delete set null,

  -- Die Geschichte hinter dem Werk. Das Herzstueck der Detailseite.
  geschichte    text not null default '',
  -- Ein Satz von Lusine, gross gesetzt wie ein Wandtext im Museum.
  zitat         text,

  technik       text not null default '',
  material      text,
  breite_cm     numeric(6, 1),
  hoehe_cm      numeric(6, 1),
  tiefe_cm      numeric(6, 1),
  ist_unikat    boolean not null default true,
  edition_info  text,

  -- Preis und Versand werden nur angezeigt. Es wird ueber diese Seite
  -- nicht verkauft; die Abwicklung geschieht persoenlich.
  preis_cent    integer check (preis_cent is null or preis_cent >= 0),
  versand_cent  integer not null default 0 check (versand_cent >= 0),
  waehrung      text not null default 'eur',
  status        werk_status not null default 'verfuegbar',
  anfrage_erlaubt boolean not null default true,

  -- Individuelle Signatur dieses Werks, freigestelltes PNG im R2-Speicher.
  signatur_schluessel text,

  auf_startseite         boolean not null default false,
  startseite_sortierung  integer not null default 0,
  sortierung             integer not null default 0,

  erstellt_am     timestamptz not null default now(),
  aktualisiert_am timestamptz not null default now()
);

create index if not exists werke_sortierung_idx on werke (sortierung desc, erstellt_am desc);
create index if not exists werke_serie_idx on werke (serie_id);
create index if not exists werke_startseite_idx
  on werke (startseite_sortierung)
  where auf_startseite;

drop trigger if exists werke_aktualisiert on werke;
create trigger werke_aktualisiert
  before update on werke
  for each row execute function setze_aktualisiert_am();

-- ---------------------------------------------------------------------------
--  Bilder eines Werks
--
--  'haupt' ist die Ansicht des ganzen Gemaeldes, 'detail' sind
--  Nahaufnahmen von Struktur und Pinselstrich.
--
--  breite_px und hoehe_px werden beim Upload ausgelesen und gespeichert.
--  Das ist keine Spielerei: ohne die echten Masse kann der Browser den
--  Platz fuer ein Bild nicht reservieren, und die Seite springt beim
--  Laden — was in einer Galerie besonders stoert.
-- ---------------------------------------------------------------------------

create table if not exists werk_bilder (
  id          uuid primary key default gen_random_uuid(),
  werk_id     uuid not null references werke (id) on delete cascade,
  schluessel  text not null,
  art         bild_art not null default 'detail',
  alt_text    text not null default '',
  breite_px   integer not null default 0,
  hoehe_px    integer not null default 0,
  sortierung  integer not null default 0,
  erstellt_am timestamptz not null default now()
);

create index if not exists werk_bilder_werk_idx on werk_bilder (werk_id, sortierung);

-- ---------------------------------------------------------------------------
--  Kaufanfragen
--
--  Der persoenliche Weg: statt Warenkorb eine Nachricht an Lusine.
-- ---------------------------------------------------------------------------

create table if not exists anfragen (
  id          uuid primary key default gen_random_uuid(),
  werk_id     uuid references werke (id) on delete set null,
  werk_titel  text,
  name        text not null,
  email       text not null,
  nachricht   text not null,
  status      anfrage_status not null default 'neu',
  erstellt_am timestamptz not null default now(),
  aktualisiert_am timestamptz not null default now()
);

create index if not exists anfragen_zeit_idx on anfragen (erstellt_am desc);
create index if not exists anfragen_status_idx on anfragen (status) where status = 'neu';

drop trigger if exists anfragen_aktualisiert on anfragen;
create trigger anfragen_aktualisiert
  before update on anfragen
  for each row execute function setze_aktualisiert_am();

-- ---------------------------------------------------------------------------
--  Freie Texte der Seite
--
--  Schluessel-Wert-Tabelle fuer alles, was Lusine unter "Texte" aendern
--  kann: Startseiten-Auftakt, Zitat, Ueber-Text, Kontakttext.
-- ---------------------------------------------------------------------------

create table if not exists seiten_texte (
  schluessel      text primary key,
  wert            text not null default '',
  aktualisiert_am timestamptz not null default now()
);

drop trigger if exists seiten_texte_aktualisiert on seiten_texte;
create trigger seiten_texte_aktualisiert
  before update on seiten_texte
  for each row execute function setze_aktualisiert_am();

-- ===========================================================================
--  Zugriffsschutz (Row Level Security)
--
--  Grundregel:
--    * Oeffentlich lesbar sind Serien, Werke, Bilder und Texte.
--    * Schreiben darf nur, wer angemeldet ist.
--    * Anfragen sind fuer die Oeffentlichkeit weder lesbar noch
--      schreibbar. Sie werden ausschliesslich serverseitig mit dem
--      Dienstschluessel verarbeitet, der RLS umgeht.
--
--  Da es genau einen Zugang gibt (Lusine), genuegt "angemeldet" als
--  Kriterium. Wichtig: In den Supabase-Einstellungen unter
--  Authentication -> Sign In / Providers die Selbstregistrierung
--  ("Allow new users to sign up") abschalten.
-- ===========================================================================

alter table serien       enable row level security;
alter table werke        enable row level security;
alter table werk_bilder  enable row level security;
alter table anfragen     enable row level security;
alter table seiten_texte enable row level security;

-- --- Oeffentlich lesbar ----------------------------------------------------

drop policy if exists "serien oeffentlich lesbar" on serien;
create policy "serien oeffentlich lesbar"
  on serien for select
  to anon, authenticated
  using (true);

drop policy if exists "werke oeffentlich lesbar" on werke;
create policy "werke oeffentlich lesbar"
  on werke for select
  to anon, authenticated
  using (true);

drop policy if exists "werk_bilder oeffentlich lesbar" on werk_bilder;
create policy "werk_bilder oeffentlich lesbar"
  on werk_bilder for select
  to anon, authenticated
  using (true);

drop policy if exists "seiten_texte oeffentlich lesbar" on seiten_texte;
create policy "seiten_texte oeffentlich lesbar"
  on seiten_texte for select
  to anon, authenticated
  using (true);

-- --- Schreiben nur fuer Angemeldete ---------------------------------------

drop policy if exists "serien pflegbar" on serien;
create policy "serien pflegbar"
  on serien for all
  to authenticated
  using (true) with check (true);

drop policy if exists "werke pflegbar" on werke;
create policy "werke pflegbar"
  on werke for all
  to authenticated
  using (true) with check (true);

drop policy if exists "werk_bilder pflegbar" on werk_bilder;
create policy "werk_bilder pflegbar"
  on werk_bilder for all
  to authenticated
  using (true) with check (true);

drop policy if exists "seiten_texte pflegbar" on seiten_texte;
create policy "seiten_texte pflegbar"
  on seiten_texte for all
  to authenticated
  using (true) with check (true);

-- --- Anfragen: nur lesen, nur angemeldet ----------------------------------
--
--  Kein anon-Zugriff. Neue Anfragen legt der Server mit dem
--  Dienstschluessel an — so kann niemand ueber den Browser fremde
--  Anfragen auslesen oder faelschen.

drop policy if exists "anfragen nur intern lesbar" on anfragen;
create policy "anfragen nur intern lesbar"
  on anfragen for select
  to authenticated
  using (true);

drop policy if exists "anfragen intern pflegbar" on anfragen;
create policy "anfragen intern pflegbar"
  on anfragen for update
  to authenticated
  using (true) with check (true);

-- ===========================================================================
--  Startwerte fuer die freien Texte
-- ===========================================================================

insert into seiten_texte (schluessel, wert) values
  ('startseiteAuftakt',  'Jedes Bild beginnt mit einem Gefühl, für das es noch keine Worte gibt. Die Farbe kommt zuerst, die Geschichte findet sich später.'),
  ('startseiteZitat',    'Ich male nicht, was ich sehe. Ich male, was bleibt, wenn ich die Augen schließe.'),
  ('startseiteAbschluss','Alle Werke sind Originale und existieren genau einmal. Wer ein Bild mit nach Hause nimmt, nimmt die einzige Fassung mit.'),
  ('ueberUeberschrift',  'Über Lusine'),
  ('ueberText',          'Lusine arbeitet in Öl und Acryl auf Leinwand. Ihre Bilder entstehen langsam, oft über Monate, in Schichten, die einander überlagern und durchscheinen.'),
  ('kontaktText',        'Sie haben ein Werk entdeckt, das Sie nicht mehr loslässt? Schreiben Sie mir — ich antworte persönlich.')
on conflict (schluessel) do nothing;
