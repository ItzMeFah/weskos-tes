# Weskos Surf & Co

Starter website Next.js untuk Weskos Surf & Co. Landing page memakai bahasa Inggris sebagai bahasa utama dan mengikuti alur referensi Bali Solve: hero, pengenalan brand, highlight, cerita, galeri, lalu kontak. Video surf diputar 4 detik saat hero dibuka; setelah itu foto berganti setiap 10 detik dengan transisi fade. Slogan hero berganti setiap 4 detik.

## Preview lokal

Node.js 20.9 atau lebih baru diperlukan.

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## Struktur utama

- `app/page.tsx` — landing page.
- `app/backoffice/` — login dan CMS editor homepage.
- `app/globals.css` — gaya responsif.
- `public/images/` — logo, video surf, dan foto dari lampiran.
- `lib/supabase.ts` — Supabase client opsional dan upload helper.
- `lib/home-content.ts` — konten default homepage yang dapat diedit.
- `supabase/setup.sql` — bucket media, tabel katalog, admin allowlist, dan CMS homepage.

## Menyiapkan Supabase

1. Buat project Supabase.
2. Salin `.env.example` sebagai `.env.local` dan isi URL, publishable key, serta server secret key dari Supabase API Keys. Key `anon` lama tetap didahulukan bila masih dikonfigurasi, sebagai kompatibilitas untuk setup yang sudah berjalan.
3. Tambahkan `SUPABASE_SECRET_KEY` dan `BACKOFFICE_SESSION_SECRET` ke environment server lokal dan Vercel. Secret key harus server-only dan tidak boleh memakai prefix `NEXT_PUBLIC_`; buat session secret acak minimal 32 karakter. `SUPABASE_SERVICE_ROLE_KEY` lama tetap diterima sebagai fallback.
4. Jalankan `supabase/setup.sql` melalui SQL Editor.
5. Di Supabase Authentication → Sign In / Providers, aktifkan Email provider untuk akun Dev. Tambahkan UUID Dev ke `public.admin_users`; hanya Dev yang ada di allowlist ini yang bisa membuka panel Dev.
6. Dev masuk lewat `/backoffice`, lalu membuat username dan password admin kantor di Dev control panel. Admin kantor masuk lewat halaman login yang sama dengan username dan password tersebut.
7. Admin kantor mengedit homepage di `/backoffice/homepage` dan akunnya di `/backoffice/account`. Perubahan homepage, login, dan perubahan password dicatat dalam audit log.
8. Klik **Save homepage** untuk menyimpan ke Supabase. Gunakan input upload untuk mengirim foto ke Storage.

Nama dan aktivitas Dev tersimpan di `public.admin_users` dan `public.backoffice_audit`. Username, hash password, status aktif, dan waktu login admin kantor tersimpan di `public.backoffice_staff`; audit tidak menyimpan password polos.

Secret key jangan dimasukkan ke variabel `NEXT_PUBLIC_*` atau kode browser. RLS admin allowlist melindungi CMS homepage dan Storage; katalog produk saat ini baru disiapkan untuk pembacaan produk yang dipublikasikan.

Backoffice memiliki satu pintu login: Supabase Auth untuk Dev dan akun `backoffice_staff` untuk admin kantor. Password admin kantor disimpan sebagai hash scrypt dan hanya bisa direset, bukan dibaca kembali. Jangan simpan password polos di tabel atau audit log. Tidak ada pendaftaran publik.
