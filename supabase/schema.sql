-- ==========================================
-- Supabase Schema & Dummy Data Generator
-- ==========================================

-- 1. Create Tables
CREATE TABLE public.event_info (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  groom_name text NOT NULL,
  groom_father text,
  groom_mother text,
  groom_photo_url text,
  groom_instagram text,
  bride_name text NOT NULL,
  bride_father text,
  bride_mother text,
  bride_photo_url text,
  bride_instagram text,
  akad_date timestamptz,
  akad_location text,
  akad_maps_url text,
  resepsi_date timestamptz,
  resepsi_location text,
  resepsi_maps_url text,
  hero_photo_url text,
  audio_url text,
  bank_name text,
  bank_account_number text,
  bank_account_holder text,
  qris_image_url text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.guests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  max_pax integer DEFAULT 2 NOT NULL,
  rsvp_status text DEFAULT 'pending'::text,
  rsvp_pax integer DEFAULT 0,
  rsvp_message text,
  checked_in boolean DEFAULT false,
  checked_in_at timestamptz,
  qr_token text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.guestbook (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id uuid REFERENCES public.guests(id) ON DELETE SET NULL,
  guest_name text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending'::text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.gifts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id uuid REFERENCES public.guests(id) ON DELETE SET NULL,
  sender_name text NOT NULL,
  bank_name text,
  amount numeric,
  proof_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.storyline (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  year text NOT NULL,
  title text NOT NULL,
  description text,
  photo_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.gallery (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_url text NOT NULL,
  caption text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);


-- ==========================================
-- 2. Security (RLS) - Jika butuh diaktifkan
-- ==========================================
-- Untuk kemudahan sesuai request "rls off", kita skip konfigurasi RLS.
-- Harap aktifkan RLS di dashboard jika web ini mau dipublish skala besar.

-- ==========================================
-- 3. Insert Dummy Data (Seed)
-- ==========================================

-- Bersihkan data lama (opsional jika butuh fresh start)
TRUNCATE TABLE public.event_info CASCADE;
TRUNCATE TABLE public.guests CASCADE;
TRUNCATE TABLE public.guestbook CASCADE;
TRUNCATE TABLE public.storyline CASCADE;
TRUNCATE TABLE public.gallery CASCADE;

-- Insert Event Info
INSERT INTO public.event_info (
  groom_name, groom_father, groom_mother, groom_instagram, groom_photo_url,
  bride_name, bride_father, bride_mother, bride_instagram, bride_photo_url,
  akad_date, akad_location, akad_maps_url,
  resepsi_date, resepsi_location, resepsi_maps_url,
  bank_name, bank_account_number, bank_account_holder,
  audio_url
) VALUES (
  'Kylo', 'Bapak Suryo', 'Ibu Endang', '@kylor', '/images/groom-dummy.jpg',
  'Rey', 'Bapak Ahmad', 'Ibu Siti', '@reyyy', '/images/bride-dummy.jpg',
  '2026-10-10 08:00:00+07', 'Masjid Raya Pondok Indah, Jakarta', 'https://maps.app.goo.gl/example',
  '2026-10-10 19:00:00+07', 'The Ritz-Carlton Jakarta, Mega Kuningan', 'https://maps.app.goo.gl/example2',
  'BCA', '1234567890', 'Kylo Ren',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
);

-- Insert Guests
INSERT INTO public.guests (id, name, slug, max_pax, rsvp_status, rsvp_pax, rsvp_message, qr_token)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Budi & Partner', 'budi-partner', 2, 'pending', 0, NULL, 'qr-budi-123'),
  ('22222222-2222-2222-2222-222222222222', 'Andi Santoso', 'andi-santoso', 1, 'pending', 0, NULL, 'qr-andi-456'),
  ('33333333-3333-3333-3333-333333333333', 'Keluarga Pak RT', 'keluarga-pak-rt', 4, 'pending', 0, NULL, 'qr-pakrt-789');

INSERT INTO public.guestbook (guest_id, guest_name, message, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Budi', 'Testing UI', 'pending'),
  ('33333333-3333-3333-3333-333333333333', 'Pak RT', 'Testing UI 2', 'pending'),
  ('22222222-2222-2222-2222-222222222222', 'Andi', 'Happy wedding brader!', 'pending');

-- Insert Storyline
INSERT INTO public.storyline (year, title, description, sort_order)
VALUES
  ('2018', 'Awal Bertemu', 'Pertama kali bertemu di bangku kuliah saat orientasi kampus.', 1),
  ('2020', 'Mulai Bersama', 'Menjalani banyak suka duka bersama dan memutuskan untuk berkomitmen.', 2),
  ('2025', 'Lamaran', 'Momen membahagiakan di mana dua keluarga besar saling bersilaturahmi.', 3);

-- Insert Gallery (Images placehold using unsplash nature/couple vibes)
INSERT INTO public.gallery (photo_url, caption, sort_order)
VALUES
  ('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800', 'Prewedding di Bali', 1),
  ('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800', 'Momen Bahagia', 2),
  ('https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800', 'Terbenam Bersama', 3),
  ('https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800', 'Lamaran', 4),
  ('https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800', 'Senyum Pertama', 5),
  ('https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800', 'Ring Details', 6);
