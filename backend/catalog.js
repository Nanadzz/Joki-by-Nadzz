// Katalog harga default Nadzz Joki — acuan harga pasaran (Oktober 2026), dalam Rupiah (bilangan bulat).
// Setiap item punya `sku` tetap: saat server menyala, item yang belum ada di data.json ditambahkan,
// sedangkan harga yang sudah kamu ubah lewat Dashboard Admin TIDAK ditimpa.
//
// Sumber acuan (cek ulang secara berkala, harga joki bergerak mengikuti pasar):
//  - Mobile Legends : Lapakgaming (pricelist joki MLBB, diperbarui 30 Jul 2026)
//  - Genshin Impact : pricelist joki Genshin (carrd.co, toko joki Indonesia)
//  - Honkai Star Rail: Sandi Jaya Store (rawat akun weekly/monthly); harga endgame (MoC/PF/AS) dan
//                      rawat akun harian = ESTIMASI dari pasar lokal + FunPay, belum ada pricelist lokal resmi.
// Nama game WAJIB sama persis dengan skill worker ('Genshin Impact', 'Mobile Legends', 'Honkai Star Rail'),
// karena penugasan otomatis mencocokkan keduanya.

const GI = 'Genshin Impact', ML = 'Mobile Legends', HSR = 'Honkai Star Rail';

// item(sku, game, kategori, judul, deskripsi, harga, opsi)
// opsi: unit ('paket' | 'bintang' | 'hari'), max (jumlah maksimum per pesanan), h (jam per satuan), badge
const item = (sku, gameName, category, title, description, basePrice, o = {}) => ({
  sku, gameName, category, title, description, basePrice,
  unit: o.unit || 'paket',
  maxQty: o.unit && o.unit !== 'paket' ? (o.max || 100) : 1,
  estimatedHours: o.h || 1,
  badge: o.badge || '',
});

module.exports = [
  // ───────── Genshin Impact ─────────
  item('gi-abyss-full', GI, 'Endgame', 'Spiral Abyss Lantai 9–12 Full Clear', '36 bintang. Build disesuaikan dengan karakter di akunmu.', 55000, { h: 4, badge: 'Populer' }),
  item('gi-abyss-9-10', GI, 'Endgame', 'Spiral Abyss Lantai 9–10', '18 bintang (lantai 9 dan 10).', 20000, { h: 2 }),
  item('gi-abyss-11', GI, 'Endgame', 'Spiral Abyss Lantai 11', '9 bintang.', 15000, { h: 1 }),
  item('gi-abyss-12', GI, 'Endgame', 'Spiral Abyss Lantai 12', '9 bintang.', 20000, { h: 1.5 }),
  item('gi-theater-easy', GI, 'Endgame', 'Imaginarium Theater — Easy', 'Act 1–3. Mengikuti kartu TCG yang kamu miliki.', 15000, { h: 1 }),
  item('gi-theater-normal', GI, 'Endgame', 'Imaginarium Theater — Normal', 'Act 4–6. Mengikuti kartu TCG yang kamu miliki.', 30000, { h: 1.5 }),
  item('gi-theater-hard', GI, 'Endgame', 'Imaginarium Theater — Hard', 'Act 7–8. Mengikuti kartu TCG yang kamu miliki.', 50000, { h: 2 }),
  item('gi-theater-visionary', GI, 'Endgame', 'Imaginarium Theater — Visionary', 'Act 9–10. Mengikuti kartu TCG yang kamu miliki.', 65000, { h: 3 }),
  item('gi-daily', GI, 'Harian & Mingguan', 'Daily Commission + 200 Resin + Ekspedisi', 'Per hari: daily commission, habiskan 200 resin (request bebas), ekspedisi.', 8000, { unit: 'hari', max: 30, h: 1, badge: 'Populer' }),
  item('gi-resin', GI, 'Harian & Mingguan', 'Habiskan 200 Resin', 'Resin dipakai untuk farm sesuai request kamu.', 5000, { h: 0.5 }),
  item('gi-weekly-2', GI, 'Harian & Mingguan', 'Weekly II — Daily Saja (7 hari)', 'Daily commission + ekspedisi + teapot coin selama 7 hari.', 18500, { h: 1 }),
  item('gi-weekly-1', GI, 'Harian & Mingguan', 'Weekly I — Daily + Resin (7 hari)', 'Daily + 200 resin (request bebas) + ekspedisi + bounty + teapot coin.', 45500, { h: 1 }),
  item('gi-monthly-1', GI, 'Harian & Mingguan', 'Monthly I — Daily Saja (30 hari)', 'Daily commission + ekspedisi + teapot coin selama 30 hari.', 72000, { h: 1 }),
  item('gi-monthly-2', GI, 'Harian & Mingguan', 'Monthly II — Resin Saja (30 hari)', 'Habiskan resin (request bebas) + ekspedisi + teapot coin selama 30 hari.', 93000, { h: 1 }),

  // ───────── Mobile Legends ─────────
  item('ml-epic', ML, 'Per Bintang', 'Joki Epic', 'Naik bintang di tier Epic. Hero sesuai permintaan.', 7000, { unit: 'bintang', max: 100, h: 0.4 }),
  item('ml-legend', ML, 'Per Bintang', 'Joki Legend', 'Naik bintang di tier Legend. Hero sesuai permintaan.', 10000, { unit: 'bintang', max: 100, h: 0.5 }),
  item('ml-mythic', ML, 'Per Bintang', 'Joki Mythic', 'Naik bintang di tier Mythic (0–24 bintang).', 20000, { unit: 'bintang', max: 100, h: 0.6, badge: 'Populer' }),
  item('ml-honor', ML, 'Per Bintang', 'Joki Mythical Honor', 'Naik bintang di tier Mythical Honor (25–49 bintang).', 24000, { unit: 'bintang', max: 100, h: 0.7 }),
  item('ml-glory', ML, 'Per Bintang', 'Joki Mythical Glory', 'Naik bintang di tier Mythical Glory (50–99 bintang).', 29000, { unit: 'bintang', max: 100, h: 0.8 }),
  item('ml-immortal', ML, 'Per Bintang', 'Joki Mythical Immortal', 'Naik bintang di tier Mythical Immortal (100+ bintang).', 34000, { unit: 'bintang', max: 100, h: 0.9 }),
  item('ml-epic-legend', ML, 'Paket Rank', 'Epic → Legend', 'Paket naik tier dari Epic ke Legend.', 200000, { h: 12 }),
  item('ml-legend-mythic', ML, 'Paket Rank', 'Legend → Mythic', 'Paket naik tier dari Legend ke Mythic.', 225000, { h: 14, badge: 'Populer' }),
  item('ml-epic-mythic', ML, 'Paket Rank', 'Epic → Mythic', 'Paket naik tier dari Epic langsung ke Mythic.', 370000, { h: 26, badge: 'Hemat' }),
  item('ml-gm-mythic', ML, 'Paket Rank', 'Grandmaster → Mythic', 'Paket naik tier dari Grandmaster ke Mythic.', 470000, { h: 36 }),

  // ───────── Honkai: Star Rail ─────────
  item('hsr-moc', HSR, 'Endgame', 'Memory of Chaos — Full Star', '36 bintang (Stage 1–12). Hasil clear tergantung build karakter.', 45000, { h: 3 }),
  item('hsr-pf', HSR, 'Endgame', 'Pure Fiction — Full Star', '12 bintang (Stage 1–4). Hasil clear tergantung build karakter.', 45000, { h: 3 }),
  item('hsr-as', HSR, 'Endgame', 'Apocalyptic Shadow — Full Star', '12 bintang (Stage 1–4). Hasil clear tergantung build karakter.', 45000, { h: 3 }),
  item('hsr-endgame3', HSR, 'Endgame', 'Paket 3 Endgame (MoC + PF + AS)', 'Memory of Chaos, Pure Fiction, dan Apocalyptic Shadow sekaligus.', 120000, { h: 8, badge: 'Hemat' }),
  item('hsr-daily', HSR, 'Rawat Akun', 'Rawat Akun Harian', 'Per hari: Daily Training 500 poin + habiskan Trailblaze Power.', 8000, { unit: 'hari', max: 30, h: 1, badge: 'Populer' }),
  item('hsr-weekly', HSR, 'Rawat Akun', 'Rawat Akun Weekly (7 hari)', 'Daily Training 500 poin, 240 Trailblaze Power, Echo of War, Simulated Universe poin maksimal.', 90000, { h: 1 }),
  item('hsr-monthly', HSR, 'Rawat Akun', 'Rawat Akun Monthly (30 hari)', 'Semua isi Weekly + event bulanan + MoC, AS & Pure Fiction (clear tergantung build) + bantu build karakter.', 390000, { h: 1, badge: 'Lengkap' }),
];
