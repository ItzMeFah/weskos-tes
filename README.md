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
2. Salin `.env.example` sebagai `.env.local` dan isi URL serta anon key dari Project Settings → API.
3. Jalankan `supabase/setup.sql` melalui SQL Editor.
4. Aktifkan Google di Supabase Authentication → Sign In / Providers, lalu masukkan OAuth Client ID dan Secret dari Google Cloud. Authorized redirect URI di Google adalah `https://<project-ref>.supabase.co/auth/v1/callback`.
5. Di Supabase Authentication → URL Configuration, tambahkan URL lokal dan URL produksi dengan path `/backoffice` sebagai Redirect URLs yang diizinkan.
6. Masuk ke `/backoffice` dengan Google. Tambahkan UUID akun Google yang diizinkan ke `public.admin_users` melalui SQL Editor; hanya UUID yang ada di tabel tersebut yang bisa membuka editor.
7. Klik **Save homepage** untuk menyimpan ke Supabase. Gunakan input upload untuk mengirim foto atau MP4 (maks. 10 MB) ke Storage.

Service role key jangan dimasukkan ke variabel `NEXT_PUBLIC_*` atau kode browser. RLS admin allowlist melindungi CMS homepage dan Storage; katalog produk saat ini baru disiapkan untuk pembacaan produk yang dipublikasikan.

Backoffice hanya mendukung Google OAuth melalui Supabase Auth. Tidak ada mode demo, penyimpanan konten lokal, atau login password. Jika konfigurasi Supabase belum tersedia, editor akan tetap terkunci.

## Persiapan integrasi Google AI Studio

Kode dan aset dipisah dari konfigurasi Supabase agar mudah dijadikan bahan untuk proses import atau adaptasi berikutnya. Sertakan folder `app`, `lib`, `public`, `supabase` serta file konfigurasi. Simpan kredensial di environment variables, bukan di source.
