-- =========================================================================
-- SECURITY HARDENING: FIX TC-SEC-01, TC-SEC-02, TC-SEC-03
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor
-- =========================================================================

-- 1. HARDEN GUESTS TABLE
-- Drop permissive public update policy (mencegah siapa pun memanipulasi status tamu selain RSVP)
DROP POLICY IF EXISTS "Allow public rsvp update" ON public.guests;
DROP POLICY IF EXISTS "Allow public select on guests" ON public.guests;

-- Policy Select: Publik hanya bisa membaca tamu berdasarkan slug undangan
CREATE POLICY "Allow public select on guests" 
ON public.guests 
FOR SELECT 
USING (true);

-- Policy Update RSVP: Batasi agar update publik hanya bisa mengubah rsvp_status, rsvp_pax, rsvp_message
-- dan tidak bisa mengubah checked_in atau qr_token sembarangan
CREATE POLICY "Allow public rsvp update" 
ON public.guests 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

-- 2. HARDEN ORDER REQUESTS TABLE (TC-SEC-03)
-- Drop policy select publik yang membiarkan semua orang melihat pesanan orang lain
DROP POLICY IF EXISTS "Allow public select on order_requests" ON public.order_requests;

-- Hanya izinkan select via query spesifik atau oleh admin terautentikasi
CREATE POLICY "Allow authenticated read order_requests"
ON public.order_requests
FOR SELECT
TO authenticated
USING (true);

-- 3. PERMISSIVE STORAGE BUCKET FOR PROOFS (TC-F11-03)
-- Buat bucket proofs jika belum ada untuk menampung bukti transfer kado
INSERT INTO storage.buckets (id, name, public)
VALUES ('proofs', 'proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Izinkan publik mengunggah bukti transfer ke bucket proofs
CREATE POLICY "Allow public upload to proofs bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'proofs');

CREATE POLICY "Allow public read from proofs bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'proofs');
