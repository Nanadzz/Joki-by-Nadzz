// =====================================================
// script.js - Tugas Dasar JavaScript
// Proyek : Nadzz Joki (Joki by Nadzz) - jasa joki game
// Pemilik: Nadya Paramesti Amirasyifa (NIM 60225070)
// =====================================================

// ---------- 1. SAPAAN MEMAKAI alert() ----------
// Nama usaha disimpan di const karena nilainya tidak akan berubah.
const namaUMKM = "Nadzz Joki";
const pemilik = "Nadya Paramesti Amirasyifa";
const jenisUsaha = "Jasa Joki Game";

alert("Halo, selamat datang di " + namaUMKM + "!");
alert("Kami adalah " + jenisUsaha + " yang dikelola oleh " + pemilik + ".");
alert("Silakan lihat pricelist kami dan pesan layanan favoritmu di " + namaUMKM + ". Terima kasih!");

// ---------- 2. NAMA UMKM (const) ----------
console.log("===== DATA USAHA =====");
console.log("Nama UMKM  :", namaUMKM);
console.log("Pemilik    :", pemilik);
console.log("Jenis usaha:", jenisUsaha);

// ---------- 3. JUMLAH PRODUK AWAL (let) + OPERATOR ----------
// let dipakai karena nilainya akan berubah.
let jumlahProduk = 31; // total produk pada katalog saat ini
console.log("===== JUMLAH PRODUK (let) =====");
console.log("Jumlah produk awal:", jumlahProduk);

jumlahProduk = jumlahProduk + 2; // operator tambah (+)
console.log("Setelah tambah 2 produk baru (+):", jumlahProduk);

jumlahProduk -= 1; // operator pengurangan (-=)
console.log("Setelah 1 produk dihapus (-=):", jumlahProduk);

jumlahProduk++; // operator increment (++)
console.log("Setelah ditambah 1 lagi (++):", jumlahProduk);

jumlahProduk *= 2; // operator perkalian (*=)
console.log("Jika katalog digandakan (*=):", jumlahProduk);

jumlahProduk = 31; // dikembalikan ke jumlah asli
console.log("Dikembalikan ke jumlah asli:", jumlahProduk);

// ---------- 4. JUMLAH PRODUK BERDASARKAN GAME ----------
const produkGenshin = 14;
const produkMobileLegends = 10;
const produkHonkaiStarRail = 7;

console.log("===== PRODUK PER GAME =====");
console.log("Genshin Impact   :", produkGenshin);
console.log("Mobile Legends   :", produkMobileLegends);
console.log("Honkai Star Rail :", produkHonkaiStarRail);

const totalProduk = produkGenshin + produkMobileLegends + produkHonkaiStarRail;
console.log("Total semua game :", totalProduk);
console.log("Cocok dengan jumlah awal?", totalProduk === jumlahProduk); // operator perbandingan

// ---------- 5. JUMLAH PRODUK BERDASARKAN KATEGORI ----------
const genshinEndgame = 8;
const genshinHarian = 6;
const mlPerBintang = 6;
const mlPaketRank = 4;
const hsrEndgame = 4;
const hsrRawatAkun = 3;

console.log("===== PRODUK PER KATEGORI =====");
console.log("Genshin - Endgame            :", genshinEndgame);
console.log("Genshin - Harian & Mingguan  :", genshinHarian);
console.log("Mobile Legends - Per Bintang :", mlPerBintang);
console.log("Mobile Legends - Paket Rank  :", mlPaketRank);
console.log("Star Rail - Endgame          :", hsrEndgame);
console.log("Star Rail - Rawat Akun       :", hsrRawatAkun);

const jumlahEndgame = genshinEndgame + hsrEndgame;
console.log("Total produk Endgame (Genshin + Star Rail):", jumlahEndgame);

// ---------- 6. CONTOH PERHITUNGAN HARGA ----------
const hargaMythicPerBintang = 20000;
let jumlahBintang = 5;
let totalHarga = hargaMythicPerBintang * jumlahBintang; // operator kali (*)

console.log("===== SIMULASI HARGA =====");
console.log(`Joki Mythic ${jumlahBintang} bintang = Rp${totalHarga}`);

jumlahBintang += 3; // pelanggan menambah 3 bintang
totalHarga = hargaMythicPerBintang * jumlahBintang;
console.log(`Setelah tambah bintang (${jumlahBintang} bintang) = Rp${totalHarga}`);

const diskon = 10; // persen
const hargaSetelahDiskon = totalHarga - (totalHarga * diskon) / 100;
console.log(`Harga setelah diskon ${diskon}% = Rp${hargaSetelahDiskon}`);

// ---------- 7. OPERATOR PERBANDINGAN DAN LOGIKA ----------
const hargaSpiralAbyss = 55000;
const hargaMemoryOfChaos = 45000;
const batasHargaMurah = 50000;

console.log("===== PERBANDINGAN & LOGIKA =====");
console.log("Spiral Abyss lebih mahal dari Memory of Chaos?", hargaSpiralAbyss > hargaMemoryOfChaos);
console.log("Memory of Chaos tergolong murah (< Rp50.000)?", hargaMemoryOfChaos < batasHargaMurah);
console.log("Dua-duanya murah? (&&)", hargaSpiralAbyss < batasHargaMurah && hargaMemoryOfChaos < batasHargaMurah);
console.log("Salah satunya murah? (||)", hargaSpiralAbyss < batasHargaMurah || hargaMemoryOfChaos < batasHargaMurah);
console.log("Sisa bagi jumlah produk dengan 5 (%):", jumlahProduk % 5);

// ---------- 8. STATUS USAHA (boolean) ----------
const sedangBuka = true;
console.log("===== STATUS =====");
console.log("Apakah " + namaUMKM + " sedang buka?", sedangBuka);

// ---------- 9. TABEL RINGKASAN ----------
console.table([
  { game: "Genshin Impact", produk: produkGenshin },
  { game: "Mobile Legends", produk: produkMobileLegends },
  { game: "Honkai Star Rail", produk: produkHonkaiStarRail },
]);

console.log("Selesai. Terima kasih telah mengunjungi " + namaUMKM + "!");
