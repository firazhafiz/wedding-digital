# Test Cases — Digital Wedding Invitation

Dokumen ini memetakan uji fungsional terhadap Implementation Plan (F1–F17) plus fitur SaaS yang sudah ada di repo (landing, order/Xendit, client portal, WA blast).

Lingkungan: `npm run dev`, event seed `kylo-rey`, tamu `budi-partner`.

---

## A. Undangan Tamu (Public)

| ID | Fitur | Langkah | Hasil diharapkan | Status kode |
| --- | --- | --- | --- | --- |
| TC-F1-01 | Personalized URL | Buka `/kylo-rey/to/budi-partner` | Halaman undangan tampil, nama “Budi & Partner” | Implemented |
| TC-F1-02 | Slug invalid | Buka `/kylo-rey/to/tidak-ada` | 404 | Implemented |
| TC-F1-03 | Event invalid | Buka `/event-salah/to/budi-partner` | 404 | Implemented |
| TC-F1-04 | Root event slug | Buka `/kylo-rey` | **Saat ini redirect ke tamu pertama** (bocor privasi). Seharusnya 404 atau landing event, bukan undangan tamu lain | Bug |
| TC-F2-01 | Welcome + Hero | Buka undangan, cek foto/video, teks “Special Invitation For” | Welcome lock scroll, tombol “Buka Undangan” | Implemented |
| TC-F2-02 | Video mobile | Buka di viewport 375px | Plan: foto statis. Kode: video tetap di-load | Gap |
| TC-F3-01 | Audio fade-in | Klik “Buka Undangan” | Musik mulai, volume naik ~2–4 detik, tombol pause/play | Implemented |
| TC-F3-02 | Autoplay block | Browser blokir autoplay | Tidak crash; user bisa play manual | Implemented |
| TC-F4-01 | Countdown | Cek hari/jam/menit/detik ke `akad_date` | Angka update tiap detik | Implemented |
| TC-F4-02 | Schedule + Maps | Klik “Petunjuk Lokasi” akad & resepsi | Tab maps terbuka | Implemented (di Countdown, bukan LocationSection) |
| TC-F4-03 | Kalender | Klik “Simpan ke Kalender” | Google Calendar template | Extra (bukan di plan) |
| TC-F5-01 | Mempelai | Scroll ke Couple | Foto, nama, orang tua, Instagram | Implemented |
| TC-F6-01 | Storyline | Scroll timeline | Item muncul sequential, GSAP | Implemented (flag `show_storyline`) |
| TC-F8-01 | Gallery | Klik foto | Lightbox fullscreen, prev/next | Implemented |
| TC-F8-02 | Gallery swipe | Swipe di mobile lightbox | Plan minta swipe; cek apakah gesture ada | Perlu verifikasi UI |
| TC-F9-01 | RSVP hadir | Pilih “Ya, Saya Hadir”, kirim | Status DB `attending`, pax = `max_pax` | Implemented (pax tidak bisa dipilih tamu) |
| TC-F9-02 | RSVP tidak hadir | Pilih tidak hadir | Status `not_attending`, pax 0 | Implemented |
| TC-F9-03 | RSVP ulang | Refresh setelah submit | Form terkunci success state | Implemented |
| TC-F9-04 | RSVP tanpa event_id | POST `/api/rsvp` tanpa `event_id` | 400 validasi | Implemented |
| TC-F10-01 | Guestbook submit | Kirim ucapan | Toast “menunggu persetujuan”, row `pending` | Implemented |
| TC-F10-02 | Guestbook publik | Lihat list | Hanya `approved` | Implemented |
| TC-F10-03 | Guestbook realtime | Approve dari admin sambil undangan terbuka | Ucapan baru muncul | Implemented (filter tidak per event) |
| TC-F11-01 | Salin rekening | Klik salin | Clipboard + toast | Implemented |
| TC-F11-02 | QRIS | Event punya `qris_image_url` | Gambar tampil | Implemented |
| TC-F11-03 | Upload bukti | Pilih gambar, konfirmasi hadiah | **Upload `/api/upload` butuh login** → bukti sering gagal, konfirmasi tetap bisa tanpa file | Bug |
| TC-F12-01 | QR setelah RSVP hadir | RSVP attending | QR tampil di success RSVP | Implemented (QrSection terpisah tidak dipakai) |
| TC-F12-02 | QR jika pending/tidak hadir | Jangan RSVP / pilih tidak hadir | QR tidak tampil di halaman (hanya setelah attending) | Deviasi plan |

---

## B. Admin (Supabase Auth)

| ID | Fitur | Langkah | Hasil diharapkan | Status kode |
| --- | --- | --- | --- | --- |
| TC-F13-01 | Login valid | `/admin/login` | Redirect dashboard | Implemented |
| TC-F13-02 | Tanpa session | Buka `/admin` | Redirect login | Implemented |
| TC-F14-01 | Tambah tamu manual | Isi nama, max pax, HP | Row baru, slug + `qr_token` otomatis | Implemented |
| TC-F14-02 | CSV/XLSX import | Upload file valid | Bulk insert, kuota dicek | Implemented |
| TC-F14-03 | Kuota penuh | Import melebihi `guest_limit` | 403 + pesan kuota | Implemented |
| TC-F14-04 | Duplikat nama | Tambah nama sama di event sama | 409 | Implemented |
| TC-F14-05 | Generate link | Salin link tamu | `/{event_slug}/to/{slug}` | Implemented |
| TC-F15-01 | RSVP tracker | Filter/badge status | attending / pending / not_attending | Implemented |
| TC-F15-02 | Toggle status | Klik toggle hadir | PATCH guest | Implemented |
| TC-F16-01 | Moderasi | Approve / reject / hapus | Status berubah; approved tampil di publik | Implemented |
| TC-F17-01 | Check-in list | `/admin/checkin` | Stats + search + manual | Implemented |
| TC-F17-02 | Scanner | `/admin/checkin/scanner` scan QR valid | `checked_in_count` naik, auth wajib | Implemented (`/api/admin/checkin/scan`) |
| TC-F17-03 | Scanner QR salah event | Token event lain | 404 | Implemented |
| TC-F17-04 | Check-in publik | POST `/api/guests/checkin` tanpa login | **Berhasil check-in** (tidak ada auth) | Bug keamanan |
| TC-ADM-01 | Multi-event | Pilih event di `/admin/events` | Context cookie, data terfilter | Implemented |
| TC-ADM-02 | Settings CMS | Ubah foto, flag, rekening, SEO, analytics | Tersimpan | Implemented |
| TC-ADM-03 | Client access | Buat user client | **API `/api/admin/client-users` tanpa cek admin** | Bug keamanan |
| TC-ADM-04 | WA blast | Exclusive/Elite, pilih ≤50 tamu ber-HP | Pesan terkirim; delay 30–60s (request lama, risiko timeout) | Risiko |

---

## C. Client Portal

| ID | Fitur | Langkah | Hasil diharapkan | Status kode |
| --- | --- | --- | --- | --- |
| TC-CL-01 | Login client | `/client/login` | Cookie JWT httpOnly | Implemented |
| TC-CL-02 | Salah password | Login salah | 401 | Implemented |
| TC-CL-03 | Dashboard | Buka `/client` | Stats event | **Bug multi-event: page memakai `payload.eventId` JWT, bukan cookie `client_active_event`** |
| TC-CL-04 | Tamu / guestbook / check-in / settings | Navigasi menu | CRUD terbatas event milik client | Implemented (settings payload tidak di-whitelist) |
| TC-CL-05 | Privilege | PATCH settings `guest_limit` / `package_type` | Seharusnya ditolak; saat ini bisa | Bug |

---

## D. Landing & Order (di luar PRD asli)

| ID | Fitur | Langkah | Hasil diharapkan | Status kode |
| --- | --- | --- | --- | --- |
| TC-LD-01 | Landing | `/` | Hero, about, pricing, testimoni, contact | Implemented |
| TC-OR-01 | Form order | `/order` isi data | Row `order_requests` + invoice Xendit jika key ada | Implemented |
| TC-OR-02 | Webhook PAID | Simulasi Xendit `PAID` | `payment_status=paid`, event auto-created | Implemented; **event tanpa `client_email` sehingga klien bayar belum otomatis dapat akses** |
| TC-OR-03 | Webhook tanpa token | `XENDIT_WEBHOOK_TOKEN` kosong | Request diterima tanpa verifikasi | Bug |
| TC-OR-04 | GET/DELETE order by id | `/api/orders/{id}` tanpa auth | Status bisa dibaca; pending bisa dihapus siapa saja | Bug |
| TC-OR-05 | Success page | `/order/success?id=` | Status pembayaran | Implemented |

---

## E. Keamanan & Data (wajib)

| ID | Langkah | Hasil diharapkan | Temuan |
| --- | --- | --- | --- |
| TC-SEC-01 | Anon SELECT `guests` via Supabase | Hanya data minim (tanpa `qr_token`, HP) | Policy `USING (true)` — semua kolom tamu publik |
| TC-SEC-02 | Anon UPDATE `guests` | Ditolak | Policy `Allow public rsvp update USING (true)` — bisa ubah check-in/QR |
| TC-SEC-03 | Anon SELECT `order_requests` | Ditolak | Policy SELECT publik |
| TC-SEC-04 | POST `/api/admin/client-users` tanpa login | 401 | Saat ini 200 jika DB izinkan |
| TC-SEC-05 | Client DELETE `/api/guests?id=` tanpa `event_id` | Hanya tamu miliknya | Session tanpa `eventId` bisa hapus ID arbitrary |
| TC-SEC-06 | Schema vs kode | `schema.sql` punya semua kolom types | Banyak kolom (`phone_number`, `checked_in_count`, `client_email`, SEO, WA, paket) tidak ada di `schema.sql` |

---

## F. Build & Smoke

| ID | Command / aksi | Pass |
| --- | --- | --- |
| TC-BLD-01 | `npm run lint` | 0 error |
| TC-BLD-02 | `npm run build` | 0 error |
| TC-BLD-03 | Responsive 375 / 768 / 1440 | Layout tidak overflow, CTA tap-able |
