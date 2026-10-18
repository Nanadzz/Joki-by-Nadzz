// Peta gambar Nadzz Joki (semua .webp).
// - Icon game  : /assets/games/<game>.webp          128×128 (tampil 52px, aman untuk layar 2×)
// - Banner game: /assets/games/banner_<game>.webp   800×300 (rasio 8:3, tampil ±300px lebar)
// - Icon item  : /assets/items/<game>-<nama>.webp   96×96  (tampil 44px, aman untuk layar 2×)
// Kunci game harus persis sama dengan nama game di katalog; kunci item = sku di backend/catalog.js.
// Admin bisa mengunggah gambar sendiri di Panel Admin > Layanan; tanpa gambar (atau gagal dimuat) otomatis memakai emoji/inisial.
const G='/assets/games/',I='/assets/items/';

export const GAME_ART={
 'Genshin Impact':{icon:G+'genshin.webp',banner:G+'banner_genshin.webp'},
 'Mobile Legends':{icon:G+'ml.webp',banner:G+'banner_ml.webp'},
 'Honkai Star Rail':{icon:G+'hsr.webp',banner:G+'banner_hsr.webp'}};

const ITEM={
 // Genshin Impact
 'gi-abyss-full':'gi-abyss','gi-abyss-9-10':'gi-primogem','gi-abyss-11':'gi-primogem','gi-abyss-12':'gi-primogem',
 'gi-theater-easy':'gi-theater','gi-theater-normal':'gi-theater','gi-theater-hard':'gi-theater-gold','gi-theater-visionary':'gi-theater-gold',
 'gi-daily':'gi-daily-quest','gi-resin':'gi-resin-condensed',
 'gi-weekly-2':'gi-events','gi-weekly-1':'gi-resin-transient','gi-monthly-1':'gi-world-quest','gi-monthly-2':'gi-resin-fragile',
 // Mobile Legends
 'ml-epic':'ml-epic','ml-legend':'ml-legend','ml-mythic':'ml-mythic','ml-honor':'ml-honor','ml-glory':'ml-glory','ml-immortal':'ml-immortal',
 'ml-epic-legend':'ml-legend','ml-legend-mythic':'ml-mythic','ml-epic-mythic':'ml-mythic','ml-gm-mythic':'ml-grandmaster',
 // Honkai Star Rail
 'hsr-moc':'hsr-memory-factor','hsr-pf':'hsr-lc-dream-wheat','hsr-as':'hsr-lc-tomorrow-journey','hsr-endgame3':'hsr-emblem',
 'hsr-daily':'hsr-stellar-jade','hsr-weekly':'hsr-special-pass','hsr-monthly':'hsr-lc-thankless-coronation'};

// g = objek game dari /api/catalog ({gameName, art:{icon,banner}}); gambar unggahan admin diutamakan, lalu bawaan di /assets
export const gameArt=g=>{const d=GAME_ART[g.gameName]||{},a=g.art||{};return a.icon||a.banner||d.icon?{icon:a.icon||d.icon||'',banner:a.banner||d.banner||''}:null};
// x = objek layanan ({sku, image}); gambar unggahan admin diutamakan
export const itemIcon=x=>x.image||(ITEM[x.sku]?`${I}${ITEM[x.sku]}.webp`:'');
