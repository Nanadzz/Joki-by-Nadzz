# Nadzz Joki - Platform Jasa Joki Game
Nadya Paramesti Amirasyifa · NIM 60225070

Welcome to the official repository of **Joki by Nadzz**, a modern, responsive, and user-friendly web platform designed to provide professional game boosting (joki) services. This website allows gamers to order boosting services securely and efficiently.

## ✨ Features
* **Interactive Dashboard:** Easy navigation for users to select games and services.
* **Modern UI/UX:** Clean, dark-themed, and responsive design optimized for mobile and desktop.
* **Price Calculator:** Dynamic pricing based on tiers, ranks, or stars selected.
* **Secure Order System:** Integrated checkout form to track order status.
* **Testimonials & Portfolio:** Showcase of trusted results and customer reviews.

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

## 📦 Installation & Setup
Follow these steps to run the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com
   ```
2. Navigate to the project directory:
   ```bash
   cd joki-by-nadzz
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 📝 License
This project is licensed under the MIT License.

## Performa & render cache
- **CSS statis**: Tailwind tidak lagi dikompilasi di browser (CDN). Setelah menambah/mengubah class Tailwind di `frontend/*.html` atau `frontend/js/**/*.js`, jalankan `npm install` lalu `npm run build:css` di folder root dan commit `frontend/css/tailwind.css`.
- **Render cache server**: `/api/catalog`, `/api/workers`, `/api/config` dibangun sekali, di-gzip, diberi ETag (balasan 304), dan dikosongkan otomatis setiap data berubah.
- **Render cache browser**: data publik terakhir disimpan di localStorage sehingga halaman langsung tampil, lalu diperbarui diam-diam bila ada perubahan (`snap()` di `frontend/js/api.js`).
- Di folder `backend` jalankan `npm install` agar `compression` (gzip untuk file statis) ikut terpasang.

## Kelola katalog (Panel Admin > Layanan)
Tambah/hapus layanan, unggah gambar tiap layanan (otomatis diubah ke webp 192×192), serta unggah icon & banner game. Item bawaan yang dihapus tidak muncul lagi setelah restart; klik "Pulihkan item bawaan yang terhapus" untuk mengembalikannya.

## Cadangan data (Panel Admin > Cadangan)
- **Unduh cadangan**: seluruh data (akun, layanan, gambar, pesanan, keuangan) menjadi satu file `.json`. File ini berisi hash sandi dan kredensial terenkripsi, jadi simpan di tempat aman.
- **Pulihkan dari cadangan**: mengganti seluruh data server dengan isi file (wajib mengetik `IMPOR`). Data sebelumnya disalin dulu ke folder volume sebagai `data.json.sebelum-impor-<waktu>` (3 salinan terakhir). Setelah berhasil, login ulang.
- Kredensial akun game hanya bisa dibuka jika `ENC_KEY` server sama dengan saat cadangan dibuat.

