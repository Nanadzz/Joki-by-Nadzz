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
   git clone https://github.com/Nanadzz/Joki-by-Nadzz.git
   ```
2. Masuk ke folder backend (backend juga menyajikan frontend):
   ```bash
   cd Joki-by-Nadzz/backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server (http://localhost:3000):
   ```bash
   npm run dev
   ``'

## 📝 License
This project is licensed under the MIT License.
