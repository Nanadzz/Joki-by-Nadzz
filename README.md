# Nadzz Joki — Platform Jasa Joki Game
Nadya Paramesti Amirasyifa · NIM 60225070

## Menjalankan
    cd backend && npm install && npm start      # http://localhost:3000
atau `docker compose up --build`.

Akun awal (khusus pengembangan): admin@chaa.id / admin123 · booster@chaa.id / booster123 — **segera ganti sandi** lewat menu Akun di dashboard (`#/akun`). Pelanggan: daftar di halaman Masuk.
**Ganti nomor WhatsApp admin** di Dashboard Admin → Pengaturan (`adminWhatsapp`, format 62812...).

## Halaman
index (landing) · login · pesan (3 langkah) · worker (info + WhatsApp) · cs (WhatsApp, FAQ, tiket) · app (dashboard pelanggan/worker/admin, cek transaksi)

## Struktur
backend/server.js (API) · frontend/css/theme.css · frontend/js/{api,layout,components,faq}.js · frontend/js/pages/*.js · sw.js · manifest.json

## Deploy (VPS)
1. `docker compose up -d --build` dengan env produksi (`NODE_ENV=production`, `JWT_SECRET`, `ENC_KEY`, `GATEWAY_SECRET`, `TRUST_PROXY=1`). Server menolak start di production bila secret belum diisi.
2. Pasang nginx/Caddy sebagai reverse proxy ke port 3000 dan aktifkan HTTPS (Let's Encrypt / Cloudflare).
3. Mode production mematikan pembayaran simulasi: sambungkan payment gateway nyata (Midtrans/Xendit/dll.) ke `POST /api/payments/webhook` (signature HMAC-SHA256 header `x-signature`, kunci idempoten `transactionId`).
4. Untuk produksi, build Tailwind dengan CLI (bukan CDN) dan ganti data file JSON dengan PostgreSQL.
