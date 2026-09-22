-- ===========================================================================
--  LUART — Bildspeicher
--
--  Einspielen wie 01_schema.sql:
--    Supabase Dashboard -> SQL Editor -> New query -> einfuegen -> Run.
--
--  Legt den Ablageort fuer Werkbilder und Signaturen an. Das Skript ist
--  wiederholbar und zerstoert keine Daten.
-- ===========================================================================

-- ---------------------------------------------------------------------------
--  Der Ablageort
--
--  Oeffentlich lesbar: die Bilder sind der Inhalt der Seite, sie sollen
--  ohne Umweg und ohne Anmeldung ausgeliefert werden. Geschrieben wird
--  ausschliesslich aus dem Admin-Bereich.
--
--  Die Groessenbegrenzung faengt ein versehentlich hochgeladenes
--  Rohbild ab, laesst aber eine ordentliche Aufnahme in voller
--  Aufloesung durch.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bilder',
  'bilder',
  true,
  52428800, -- 50 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/tiff']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
--  Zugriffsregeln
-- ---------------------------------------------------------------------------

drop policy if exists "werkbilder oeffentlich lesbar" on storage.objects;
create policy "werkbilder oeffentlich lesbar"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'bilder');

drop policy if exists "werkbilder hochladen" on storage.objects;
create policy "werkbilder hochladen"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'bilder');

drop policy if exists "werkbilder ersetzen" on storage.objects;
create policy "werkbilder ersetzen"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'bilder')
  with check (bucket_id = 'bilder');

drop policy if exists "werkbilder loeschen" on storage.objects;
create policy "werkbilder loeschen"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'bilder');
