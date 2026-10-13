# Nadzz Joki - Platform Jasa Joki Game
Nadya Paramesti Amirasyifa · NIM 60225070

pelanggan: daftar di halaman Masuk.
**Ganti nomor WhatsApp admin** di Dashboard Admin → Pengaturan (`adminWhatsapp`, format 62812...).

## Halaman
index (landing) · pricelist (daftar harga per game) · login · pesan (3 langkah) · worker (info + WhatsApp) · cs (WhatsApp, FAQ, tiket) · app (dashboard pelanggan/worker/admin, cek transaksi)

## Struktur
backend/server.js (API) · backend/catalog.js (katalog harga default) · frontend/css/theme.css · frontend/js/{api,layout,components,faq}.js · frontend/js/pages/*.js · sw.js · manifest.json

## Deploy (VPS)
1. `docker compose up -d --build` dengan env produksi (`NODE_ENV=production`, `JWT_SECRET`, `ENC_KEY`, `GATEWAY_SECRET`, `TRUST_PROXY=1`). Server menolak start di production bila secret belum diisi.
2. Pasang nginx/Caddy sebagai reverse proxy ke port 3000 dan aktifkan HTTPS (Let's Encrypt / Cloudflare).
3. Mode production mematikan pembayaran simulasi: sambungkan payment gateway nyata (Midtrans/Xendit/dll.) ke `POST /api/payments/webhook` (signature HMAC-SHA256 header `x-signature`, kunci idempoten `transactionId`).

## Harga & katalog
Harga default ada di `backend/catalog.js` (acuan pasar Okt 2026). Saat server menyala, item yang belum ada ditambahkan ke `data.json` berdasarkan `sku`; harga yang sudah kamu ubah di Dashboard Admin → Layanan **tidak** ditimpa. Pembayaran selalu lunas (sistem DP sudah dihapus).

## Menambah worker
Daftar lewat `/login.html#daftar` (pilih Worker, centang game, isi WhatsApp). Nama game di skill harus persis: `Genshin Impact`, `Mobile Legends`, `Honkai Star Rail`.
