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
4. Di Supabase Authentication → Sign In / Providers, aktifkan Email provider dan pastikan password sign-in diizinkan.
5. Buat admin melalui Authentication → Users → Add user, memakai email dan password yang akan dipakai untuk masuk. Tambahkan UUID user itu ke `public.admin_users` melalui SQL Editor; hanya UUID yang ada di tabel tersebut yang bisa membuka editor. Contoh query berdasarkan email ada di komentar `supabase/setup.sql`.
6. Masuk ke `/backoffice` menggunakan email dan password akun tersebut.
7. Klik **Save homepage** untuk menyimpan ke Supabase. Gunakan input upload untuk mengirim foto atau MP4 (maks. 10 MB) ke Storage.

Service role key jangan dimasukkan ke variabel `NEXT_PUBLIC_*` atau kode browser. RLS admin allowlist melindungi CMS homepage dan Storage; katalog produk saat ini baru disiapkan untuk pembacaan produk yang dipublikasikan.

Backoffice memakai email dan password melalui Supabase Auth. Pembuatan akun dikelola dari Supabase Dashboard; tidak ada pendaftaran publik, mode demo, atau penyimpanan konten lokal. Jika konfigurasi Supabase belum tersedia, editor akan tetap terkunci.

## Persiapan integrasi Google AI Studio

Kode dan aset dipisah dari konfigurasi Supabase agar mudah dijadikan bahan untuk proses import atau adaptasi berikutnya. Sertakan folder `app`, `lib`, `public`, `supabase` serta file konfigurasi. Simpan kredensial di environment variables, bukan di source.
