-- ==========================================
-- Supabase Schema: Multi-tenant SaaS Wedding
-- ==========================================

-- 0. Clean old tables if they exist
DROP TABLE IF EXISTS public.order_requests CASCADE;
DROP TABLE IF EXISTS public.gallery CASCADE;
DROP TABLE IF EXISTS public.storyline CASCADE;
DROP TABLE IF EXISTS public.gifts CASCADE;
DROP TABLE IF EXISTS public.guestbook CASCADE;
DROP TABLE IF EXISTS public.guests CASCADE;
DROP TABLE IF EXISTS public.event_info CASCADE;

-- 1. Create Tables
CREATE TABLE public.event_info (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid, -- Links to Supabase Auth User
  event_slug text NOT NULL UNIQUE, -- e.g., 'kylo-rey'
  
  -- Bride & Groom
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
  
  -- Events
  akad_date timestamptz,
  akad_location text,
  akad_maps_url text,
  resepsi_date timestamptz,
  resepsi_location text,
  resepsi_maps_url text,
  
  -- Appearance / CMS
  hero_photo_url text,
  welcome_video_url text DEFAULT '/videos/wedding.mp4',
  audio_url text,
  primary_color text DEFAULT '#D4AF37',
  secondary_color text DEFAULT '#1A1A1A',
  font_display text DEFAULT 'Safira March',
  photo_style text DEFAULT 'rounded-sm', -- rounded-sm, rounded-full
  story_gallery_bg_url text,
  
  -- Feature Flags
  show_storyline boolean DEFAULT true,
  show_countdown boolean DEFAULT true,
  show_guestbook boolean DEFAULT true,
  show_gifts boolean DEFAULT true,
  show_akad boolean DEFAULT true,
  show_resepsi boolean DEFAULT true,
  
  -- Bank Details (Updated to JSONB for multiple accounts)
  bank_name text, -- fallback
  bank_account_number text, -- fallback
  bank_account_holder text, -- fallback
  bank_accounts jsonb DEFAULT '[]'::jsonb,
  qris_image_url text,
  
  -- Footer
  footer_text text DEFAULT 'Created with Love',
  
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.guests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.event_info(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL, -- Not unique globally anymore, unique per event
  max_pax integer DEFAULT 2 NOT NULL,
  rsvp_status text DEFAULT 'pending'::text,
  rsvp_pax integer DEFAULT 0,
  rsvp_message text,
  checked_in boolean DEFAULT false,
  checked_in_at timestamptz,
  qr_token text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_guest_slug_per_event UNIQUE (event_id, slug)
);

CREATE TABLE public.guestbook (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.event_info(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES public.guests(id) ON DELETE SET NULL,
  guest_name text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending'::text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.gifts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.event_info(id) ON DELETE CASCADE,
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
  event_id uuid REFERENCES public.event_info(id) ON DELETE CASCADE,
  year text NOT NULL,
  title text NOT NULL,
  description text,
  photo_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.gallery (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.event_info(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  caption text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.order_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  package_type text NOT NULL DEFAULT 'starter',
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_email text,
  groom_name text NOT NULL,
  bride_name text NOT NULL,
  event_date text,
  event_location text,
  notes text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- 2. Row Level Security (RLS)
-- ==========================================

ALTER TABLE public.event_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storyline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;

-- 2a. Public SELECT Access (For the Invitation Page)
-- Allow anyone to view event and guest details by slug
CREATE POLICY "Allow public select on event_info" ON public.event_info FOR SELECT USING (true);
CREATE POLICY "Allow public select on guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Allow public select on storyline" ON public.storyline FOR SELECT USING (true);
CREATE POLICY "Allow public select on gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Allow public select on guestbook" ON public.guestbook FOR SELECT USING (status = 'approved');

-- 2b. Public INSERT/UPDATE Access (For RSVP and Guestbook)
CREATE POLICY "Allow public insert on guestbook" ON public.guestbook FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on gifts" ON public.gifts FOR INSERT WITH CHECK (true); -- Added for gifts
CREATE POLICY "Allow public rsvp update" ON public.guests FOR UPDATE USING (true) WITH CHECK (true);

-- 2c. Administrative Access (Authenticated Users)
-- Since the user is the sole administrator, we allow all authenticated users to manage all records.
CREATE POLICY "Allow authenticated manage all event_info" ON public.event_info
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated manage all guests" ON public.guests
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated manage all guestbook" ON public.guestbook
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated manage all storyline" ON public.storyline
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated manage all gallery" ON public.gallery
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated manage all gifts" ON public.gifts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Order Requests: Public can insert and select their own, admin can manage all
CREATE POLICY "Allow public insert on order_requests" ON public.order_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on order_requests" ON public.order_requests FOR SELECT USING (true);
CREATE POLICY "Allow authenticated manage all order_requests" ON public.order_requests
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated manage all client_users" ON public.client_users
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- 3. Initial Data (Sync with default event)
-- ==========================================

-- TRUNCATE existing data
TRUNCATE TABLE public.event_info CASCADE;

-- Insert Default Event
INSERT INTO public.event_info (
  id, event_slug, 
  groom_name, groom_father, groom_mother, groom_instagram, groom_photo_url,
  bride_name, bride_father, bride_mother, bride_instagram, bride_photo_url,
  akad_date, akad_location, akad_maps_url,
  resepsi_date, resepsi_location, resepsi_maps_url,
  bank_name, bank_account_number, bank_account_holder,
  bank_accounts,
  audio_url,
  footer_text
) VALUES (
  '00000000-0000-0000-0000-000000000001', 'kylo-rey',
  'Kylo', 'Bapak Suryo', 'Ibu Endang', '@kylor', '/images/groom-dummy.jpg',
  'Rey', 'Bapak Ahmad', 'Ibu Siti', '@reyyy', '/images/bride-dummy.jpg',
  '2026-10-10 08:00:00+07', 'Masjid Raya Pondok Indah, Jakarta', 'https://maps.app.goo.gl/example',
  '2026-10-10 19:00:00+07', 'The Ritz-Carlton Jakarta, Mega Kuningan', 'https://maps.app.goo.gl/example2',
  'BCA', '1234567890', 'Kylo Ren',
  '[{"bank":"BCA", "account":"1234567890", "holder":"Kylo Ren"}]'::jsonb,
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  '© 2026 Kylo & Rey. All Rights Reserved.'
);

-- Insert Guests linked to event
INSERT INTO public.guests (id, event_id, name, slug, max_pax, rsvp_status, rsvp_pax, rsvp_message, qr_token)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Budi & Partner', 'budi-partner', 2, 'pending', 0, NULL, 'qr-budi-123'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Andi Santoso', 'andi-santoso', 1, 'pending', 0, NULL, 'qr-andi-456'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Keluarga Pak RT', 'keluarga-pak-rt', 4, 'pending', 0, NULL, 'qr-pakrt-789');

-- Insert Storyline linked to event
INSERT INTO public.storyline (event_id, year, title, description, sort_order)
VALUES
  ('00000000-0000-0000-0000-000000000001', '2018', 'Awal Bertemu', 'Pertama kali bertemu di bangku kuliah saat orientasi kampus.', 1),
  ('00000000-0000-0000-0000-000000000001', '2020', 'Mulai Bersama', 'Menjalani banyak suka duka bersama dan memutuskan untuk berkomitmen.', 2),
  ('00000000-0000-0000-0000-000000000001', '2025', 'Lamaran', 'Momen membahagiakan di mana dua keluarga besar saling bersilaturahmi.', 3);

-- Insert Gallery linked to event
INSERT INTO public.gallery (event_id, photo_url, caption, sort_order)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800', 'Prewedding di Bali', 1),
  ('00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800', 'Momen Bahagia', 2);
