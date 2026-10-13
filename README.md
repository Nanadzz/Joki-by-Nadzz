# Nadzz Joki - Platform Jasa Joki Game
Nadya Paramesti Amirasyifa · NIM 60225070

pelanggan: daftar di halaman Masuk.
**Ganti nomor WhatsApp admin** di Dashboard Admin → Pengaturan (`adminWhatsapp`, format 62812...).

## Halaman
index (landing) · pricelist (daftar harga per game) · login · pesan (3 langkah) · worker (info + WhatsApp) · cs (WhatsApp, FAQ, tiket) · app (dashboard pelanggan/worker/admin, cek transaksi)

## Struktur
backend/server.js (API) · backend/catalog.js (katalog harga default) · frontend/css/theme.css · frontend/js/{api,layout,components,faq}.js · frontend/js/pages/*.js · sw.js · manifest.json

## Harga & katalog
Harga di katalog adalah harga sesuai acuan pasar pada Oktiber 2026.

## Menambah worker
Daftar lewat `/login.html#daftar` (pilih Worker, centang game, isi WhatsApp). Nama game di skill harus persis: `Genshin Impact`, `Mobile Legends`, `Honkai Star Rail`.
