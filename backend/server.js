// Nadzz Joki — Backend monolit modular | Nadya Paramesti Amirasyifa · NIM 60225070
// Sesuai blueprint: JWT+refresh (Customer/Booster/Admin), state machine order, pembayaran lunas,
// dispatch penjoki, double-ledger (integer Rupiah, tanpa float), webhook idempoten, enkripsi AES-256-GCM.
const express = require('express'), crypto = require('crypto'), fs = require('fs'), path = require('path'), zlib = require('zlib'), CATALOG = require('./catalog');
const SECRET = process.env.JWT_SECRET || 'ganti-di-produksi', GW = process.env.GATEWAY_SECRET || 'gateway-secret';
if (process.env.NODE_ENV === 'production' && !(process.env.JWT_SECRET && process.env.ENC_KEY && process.env.GATEWAY_SECRET)) { 
  console.error('Production wajib mengatur JWT_SECRET, ENC_KEY, dan GATEWAY_SECRET'); 
  process.exit(1); 
}
const KEY = crypto.scryptSync(process.env.ENC_KEY || 'ganti-kunci-enkripsi', 'chaa-salt', 32);
const FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json'), uid = () => crypto.randomUUID(), now = () => Date.now();
const err = (code, msg) => Object.assign(new Error(msg), { code }), nf = () => { throw err(404, 'Data tidak ditemukan'); };

// ---------- util: sandi, JWT HS256, enkripsi ----------
const hashPw = (p, s = crypto.randomBytes(16).toString('hex')) => s + ':' + crypto.scryptSync(p, s, 32).toString('hex');
const checkPw = (p, h) => { const [s, x] = h.split(':'); return crypto.timingSafeEqual(Buffer.from(hashPw(p, s).split(':')[1], 'hex'), Buffer.from(x, 'hex')); };
const b64 = o => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
const mac = s => crypto.createHmac('sha256', SECRET).update(s).digest('base64url');
const sign = (p, ttl) => { const b = b64({ alg: 'HS256', typ: 'JWT' }) + '.' + b64({ ...p, exp: Math.floor(now() / 1000) + ttl }); return b + '.' + mac(b); };
const verify = t => { const [a, b, c] = String(t).split('.'); if (!c || mac(a + '.' + b) !== c) throw err(401, 'Token tidak valid'); const p = JSON.parse(Buffer.from(b, 'base64url')); if (p.exp < now() / 1000) throw err(401, 'Token kedaluwarsa'); return p; };
const enc = t => { const iv = crypto.randomBytes(12), c = crypto.createCipheriv('aes-256-gcm', KEY, iv), d = Buffer.concat([c.update(t, 'utf8'), c.final()]); return [iv, c.getAuthTag(), d].map(x => x.toString('base64')).join('.'); };
const dec = s => { const [iv, tag, d] = s.split('.').map(x => Buffer.from(x, 'base64')), c = crypto.createDecipheriv('aes-256-gcm', KEY, iv); c.setAuthTag(tag); return Buffer.concat([c.update(d), c.final()]).toString('utf8'); };

// ---------- data (JSON file) ----------
const tiersFor = u => u === 'hari' ? { standard: 1 } : { standard: 1, express: 1.5 };
const svc = (o = {}) => {
  const unit = o.unit || 'paket'; return {
    id: uid(), sku: o.sku || null, gameName: o.gameName || '', category: o.category || 'Lainnya', title: o.title || '', description: o.description || '', basePrice: o.basePrice || 0,
    unit, minQty: 1, maxQty: unit === 'paket' ? 1 : (o.maxQty || 100), tiers: tiersFor(unit), estimatedHours: o.estimatedHours || 1, badge: o.badge || '', sort: o.sort ?? 1000, commissionPct: null, active: true, image: '', imageAt: 0
  };
};
const seed = () => {
  // Admin awal: ADMIN_EMAIL / ADMIN_PASSWORD dari env (bawaan lokal: admin@chaa.id / admin123). Akun demo booster hanya dibuat di luar production.
  const b = uid(), prod = process.env.NODE_ENV === 'production';
  return {
    users: [{ id: uid(), email: (process.env.ADMIN_EMAIL || 'admin@chaa.id').trim().toLowerCase(), passwordHash: hashPw(process.env.ADMIN_PASSWORD || 'admin123'), role: 'ADMIN', displayName: 'Admin Chaa' },
    ...(prod ? [] : [{ id: b, email: 'booster@chaa.id', passwordHash: hashPw('booster123'), role: 'BOOSTER', displayName: 'Penjoki Nadzz' }])],
    boosters: prod ? [] : [{ userId: b, skills: ['Genshin Impact', 'Honkai Star Rail', 'Mobile Legends'], maxConcurrentOrders: 3, sharePercentage: null, rating: 5, active: true, lastAssignedAt: 0, availability: [], whatsapp: '6289501350962', bio: 'Spesialis Genshin & Star Rail, pengerjaan rapi dan komunikatif.', showWhatsapp: true, photo: '', photoAt: 0 }],
    services: [],
    settings: { commissionPct: 20, assignMode: 'auto', assignTimeoutMin: 15, autoConfirmHours: 24, gatewayFeeBp: 70 },
    orders: [], ledger: [], payouts: [], txs: {}, idem: {}, refresh: {}
  };
};
try { fs.mkdirSync(path.dirname(FILE), { recursive: true }); } catch { }
let db = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : seed();
const cleanWa = n => String(n || '').replace(/\D/g, '').replace(/^0/, '62');
const cleanName = n => { const t = String(n ?? '').trim().replace(/\s+/g, ' ').slice(0, 60); if (t.length < 2) throw err(400, 'Nama minimal 2 karakter'); return t; };

const migrate = () => {
  db.tickets = db.tickets || []; db.settings = { adminWhatsapp: '6285656317710', brand: 'Nadzz Joki', ...db.settings };
  if (db.settings.adminWhatsapp === '6281234567890') db.settings.adminWhatsapp = '6285656317710';
  db.boosters.forEach(b => { b.whatsapp = b.whatsapp || ''; b.bio = b.bio || ''; b.showWhatsapp = !!b.showWhatsapp; b.photo = b.photo || ''; b.photoAt = b.photoAt || 0; });
  db.users.forEach(u => {
    if (u.role === 'WORKER') u.role = 'BOOSTER';
    if (/^(booster demo|penjoki nadzz)$/i.test(u.displayName || '')) {
      u.displayName = 'Penjoki Nadzz'; const b = db.boosters.find(x => x.userId === u.id);
      if (b && (!b.whatsapp || b.whatsapp === '6281234567890')) b.whatsapp = cleanWa('089501350962');
    }
  });
  delete db.settings.dpPct; delete db.settings.reservationHours;
  db.meta = db.meta || {};
  db.services.forEach(s => { s.category = s.category || 'Lainnya'; s.unit = s.unit || 'paket'; s.minQty = s.minQty || 1; s.maxQty = s.maxQty || 1; s.badge = s.badge || ''; s.sort = s.sort ?? 1000; s.image = s.image || ''; s.imageAt = s.imageAt || 0; });
  db.meta.deletedSkus = db.meta.deletedSkus || []; db.gameArt = db.gameArt || {};
  if (!db.meta.catalogV) {
    const DEMO = ['Spiral Abyss Lantai 9-12 Full Clear', 'Daily Commission + Resin 7 Hari', 'Memory of Chaos Full Star', 'Joki Rank Epic ke Legend (per bintang)'];
    db.services.forEach(s => { if (!s.sku && DEMO.includes(s.title)) s.active = false; }); db.meta.catalogV = 1;
  }
  CATALOG.forEach((c, i) => { if (!db.meta.deletedSkus.includes(c.sku) && !db.services.some(s => s.sku === c.sku)) db.services.push(svc({ ...c, sort: i })); }); // item bawaan yang dihapus admin tidak ditambahkan lagi
};
const RC = new Map(); // render cache: respons JSON publik (sudah di-gzip), dikosongkan setiap data berubah
const save = () => { RC.clear(); fs.writeFileSync(FILE + '.tmp', JSON.stringify(db)); fs.renameSync(FILE + '.tmp', FILE); };
// Di production, akun yang masih memakai sandi bawaan (admin123 / booster123) tidak boleh aktif: sandinya diganti.
function hardenAccounts() {
  const prod = process.env.NODE_ENV === 'production', ae = (process.env.ADMIN_EMAIL || '').trim().toLowerCase(), ap = process.env.ADMIN_PASSWORD || '';
  const isDefault = u => ['admin123', 'booster123'].some(p => { try { return checkPw(p, u.passwordHash); } catch { return false; } });
  if (ae && ap.length >= 8 && !db.users.some(u => u.email === ae)) db.users.push({ id: uid(), email: ae, passwordHash: hashPw(ap), role: 'ADMIN', displayName: 'Admin' });
  if (!prod) return;
  for (const u of db.users.filter(isDefault)) {
    const pw = u.role === 'ADMIN' ? (ap.length >= 8 ? ap : crypto.randomBytes(9).toString('base64url')) : crypto.randomBytes(18).toString('base64url');
    u.passwordHash = hashPw(pw);
    for (const t in db.refresh) if (db.refresh[t].uid === u.id) delete db.refresh[t];
    console.warn(u.role === 'ADMIN' ? `[KEAMANAN] Sandi bawaan admin ${u.email} diganti. ${ap.length >= 8 ? 'Masuk dengan ADMIN_PASSWORD.' : 'Sandi sementara: ' + pw + ' (segera ganti di menu Akun)'}` : `[KEAMANAN] Akun ${u.email} memakai sandi bawaan dan dikunci (sandi diacak).`);
  }
}
migrate();
hardenAccounts();
save();

// ---------- ledger ----------
const led = (orderId, type, amount, party, description, boosterId) => db.ledger.push({ id: uid(), orderId, type, amount, party, description, boosterId, at: now() });
const sum = (t, f = () => true) => db.ledger.filter(e => e.type === t && f(e)).reduce((a, e) => a + e.amount, 0);
const balance = u => sum('BOOSTER_PAYABLE', e => e.boosterId === u) - db.payouts.filter(p => p.boosterId === u && p.status !== 'REJECTED').reduce((a, p) => a + p.amount, 0);
const rep = (from = 0, to = now()) => {
  const f = e => e.at >= from && e.at <= to, S = t => sum(t, f), all = t => sum(t, e => e.at <= to);
  const pendapatan = S('INCOME') - S('REFUND'), jasa = S('BOOSTER_PAYABLE'), gw = S('GATEWAY_FEE'), opex = S('OPEX');
  const kas = all('INCOME') - all('REFUND') - all('GATEWAY_FEE') - all('OPEX') - all('PAYOUT'), hutang = all('BOOSTER_PAYABLE') - all('PAYOUT');
  return {
    labaRugi: { pendapatan, bebanJasa: jasa, bebanGateway: gw, bebanOperasional: opex, labaBersih: pendapatan - jasa - gw - opex },
    neraca: { kas, piutangGateway: 0, hutangPenjoki: hutang, ekuitas: kas - hutang },
    arusKas: { operasionalMasuk: S('INCOME'), operasionalKeluar: S('REFUND') + gw + opex + S('PAYOUT'), investasi: 0, pendanaan: 0, netto: S('INCOME') - S('REFUND') - gw - opex - S('PAYOUT') }
  };
};

// ---------- state machine order ----------
const FLOW = { DRAFT: ['PENDING_PAYMENT'], PENDING_PAYMENT: ['PAID', 'CANCELLED'], PAID: ['QUEUED'], QUEUED: ['ASSIGNED'], ASSIGNED: ['IN_PROGRESS', 'QUEUED'], IN_PROGRESS: ['COMPLETED'], COMPLETED: ['VERIFIED', 'DISPUTED'], DISPUTED: ['VERIFIED', 'REFUNDED'] };
const go = (o, to, note) => { if (!(FLOW[o.status] || []).includes(to)) throw err(409, `Transisi ${o.status} → ${to} tidak diizinkan`); o.status = to; o.history.push({ status: to, at: now(), note }); };
const view = o => { const { gameAccountInfo, excluded, ...r } = o; return r; };
const due = o => o.totalAmount - o.paidAmount;

// ---------- dispatch penjoki ----------
const load = b => db.orders.filter(o => o.boosterId === b.userId && ['ASSIGNED', 'IN_PROGRESS'].includes(o.status)).length;
const inSlot = b => { if (!b.availability.length) return true; const d = new Date(), hm = d.toTimeString().slice(0, 5); return b.availability.some(s => s.dayOfWeek === d.getDay() && hm >= s.startTime && hm < s.endTime); };
const eligible = (b, o) => b.active && b.skills.includes(o.gameName) && !o.excluded.includes(b.userId) && load(b) < b.maxConcurrentOrders && inSlot(b) &&
  !db.orders.some(x => x.id !== o.id && ['ASSIGNED', 'IN_PROGRESS'].includes(x.status) && x.gameName === o.gameName && x.gameUid === o.gameUid);
const assign = (o, b) => { if (!b.active) throw err(409, 'Worker belum aktif / belum disetujui'); o.boosterId = b.userId; o.assignedAt = now(); b.lastAssignedAt = now(); go(o, 'ASSIGNED'); };
function dispatch() {
  if (db.settings.assignMode !== 'auto') return;
  for (const o of db.orders.filter(o => o.status === 'QUEUED').sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt)) {
    const c = db.boosters.filter(b => eligible(b, o)).sort((a, b) => load(a) - load(b) || a.lastAssignedAt - b.lastAssignedAt)[0]; if (c) assign(o, c);
  }
}
const bv = b => ({ ...b, displayName: db.users.find(u => u.id === b.userId)?.displayName, load: load(b), balance: balance(b.userId) });

function applyPayment(o, txId, amount) {
  if (db.txs[txId]) return false;
  if (amount !== o.totalAmount - o.paidAmount || !(amount > 0)) throw err(400, 'Nominal pembayaran harus sama dengan tagihan');
  db.txs[txId] = { orderId: o.id, amount, at: now() }; o.paidAmount += amount;
  led(o.id, 'INCOME', amount, 'PLATFORM', `Pembayaran ${o.code}`);
  led(o.id, 'GATEWAY_FEE', Math.floor(amount * db.settings.gatewayFeeBp / 10000), 'PLATFORM', `Biaya gateway ${o.code}`);
  go(o, 'PAID'); go(o, 'QUEUED'); dispatch();
  return true;
}

function verifyOrder(o, note) {
  go(o, 'VERIFIED', note); setImmediate(() => {
    const b = db.boosters.find(x => x.userId === o.boosterId), s = db.services.find(x => x.id === o.serviceId);
    const pct = b?.sharePercentage ?? s?.commissionPct ?? db.settings.commissionPct;
    const fee = Math.floor(o.totalAmount * pct / 100), share = o.totalAmount - fee;
    led(o.id, 'BOOSTER_PAYABLE', share, 'BOOSTER', `Bagi hasil ${o.code} (komisi platform ${pct}%)`, o.boosterId);
    led(o.id, 'PLATFORM_SHARE', fee, 'PLATFORM', `Komisi ${o.code}`); save();
  });
}

setInterval(() => {
  const t = now(), S = db.settings;
  for (const o of db.orders) {
    if (o.status === 'ASSIGNED' && t - o.assignedAt > S.assignTimeoutMin * 6e4) { o.excluded.push(o.boosterId); o.boosterId = null; go(o, 'QUEUED', 'Timeout dispatch'); }
    if (o.status === 'COMPLETED' && t - o.completedAt > S.autoConfirmHours * 36e5) verifyOrder(o, 'Auto-confirm');
  }
  dispatch(); save();
}, 30000);

// ---------- HTTP ----------
const app = express(), FRONT = path.join(__dirname, '../frontend');
app.disable('x-powered-by');
const TP = process.env.TRUST_PROXY || (process.env.RAILWAY_ENVIRONMENT ? '1' : '');
if (TP) app.set('trust proxy', /^\d+$/.test(TP) ? +TP : TP);
app.use((req, res, next) => { res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()' }); next(); });
const jsonSmall = express.json({ limit: '300kb', verify: (req, _, buf) => { req.raw = buf; } }), jsonBig = express.json({ limit: '40mb' });
app.use((req, res, next) => req.path === '/api/admin/import' ? auth('ADMIN')(req, res, () => jsonBig(req, res, next)) : jsonSmall(req, res, next));
let compression; try { compression = require('compression'); } catch { }
if (compression) app.use(compression());
app.use(express.static(FRONT, {
  extensions: ['html'], setHeaders: (res, f) => {
    res.setHeader('Cache-Control', /[\\/](assets|icons)[\\/]/.test(f) ? 'public, max-age=86400, stale-while-revalidate=604800' : 'no-cache');
  }
}));

const hits = {}, limit = (max, win = 9e5) => (req, res, next) => { const k = req.path + req.ip, t = now(), a = hits[k] = (hits[k] || []).filter(x => t - x < win); if (a.length >= max) return res.status(429).json({ error: 'Terlalu banyak percobaan, coba lagi nanti' }); a.push(t); next(); };
setInterval(() => { for (const k in hits) if (!hits[k].length || now() - hits[k].at(-1) > 9e5) delete hits[k]; }, 36e5).unref();

// Health Check Endpoint (Khusus Railway & Uptime Monitoring)
app.get(['/api/health', '/health'], (req, res) => res.status(200).set('Cache-Control', 'no-store').json({ ok: true, status: 'ok', message: 'Server running smooth', uptime: Math.round(process.uptime()), timestamp: new Date().toISOString() }));

const h = fn => (req, res) => { try { const r = fn(req, res); if (req.method !== 'GET') { save(); RC.clear(); } res.json(r); } catch (e) { res.status(e.code || 500).json({ error: e.message }); } };

// ---------- render cache ----------
const cached = build => (req, res) => {
  try {
    let e = RC.get(req.path);
    if (!e || e.exp < now()) {
      const body = JSON.stringify(build());
      e = { body, gz: zlib.gzipSync(body), etag: 'W/"' + crypto.createHash('sha1').update(body).digest('base64url').slice(0, 20) + '"', exp: now() + 6e4 };
      RC.set(req.path, e);
    }
    res.set({ ETag: e.etag, 'Cache-Control': 'public, max-age=15, s-maxage=15, stale-while-revalidate=120', Vary: 'Accept-Encoding' });
    if (req.headers['if-none-match'] === e.etag) return res.status(304).end();
    res.type('json');
    if (/\bgzip\b/.test(req.headers['accept-encoding'] || '')) { res.set('Content-Encoding', 'gzip'); return res.send(e.gz); }
    res.send(e.body);
  } catch (e) { res.status(e.code || 500).json({ error: e.message }); }
};

const imgOk = (p, max) => {
  const m = /^data:image\/(webp|jpeg|png);base64,([A-Za-z0-9+/=]+)$/.exec(p);
  if (!m || p.length > max) return false;
  const x = Buffer.from(m[2].slice(0, 24), 'base64');
  return m[1] === 'webp' ? x.subarray(0, 4).toString() === 'RIFF' && x.subarray(8, 12).toString() === 'WEBP' : m[1] === 'png' ? x[0] === 0x89 && x.subarray(1, 4).toString() === 'PNG' : x[0] === 0xff && x[1] === 0xd8;
};
const imgUrl = (kind, id, v, data) => !data ? '' : data.startsWith('data:') ? `/api/img/${kind}/${encodeURIComponent(id)}?v=${v || 0}` : data;
const pubSvc = s => ({ ...s, image: imgUrl('service', s.id, s.imageAt, s.image) });
const gameArt = g => { const a = db.gameArt[g] || {}; return { icon: imgUrl('game-icon', g, a.iconAt, a.icon), banner: imgUrl('game-banner', g, a.bannerAt, a.banner) }; };

app.get('/api/img/:kind/:id', (req, res) => {
  const k = req.params.kind, id = req.params.id;
  const d = k === 'service' ? db.services.find(x => x.id === id)?.image : k === 'game-icon' ? db.gameArt[id]?.icon : k === 'game-banner' ? db.gameArt[id]?.banner : '';
  const m = /^data:(image\/[a-z]+);base64,(.+)$/.exec(d || '');
  if (!m) return res.status(404).json({ error: 'Gambar tidak ditemukan' });
  res.set({ 'Content-Type': m[1], 'Cache-Control': 'public, max-age=31536000, immutable' }).send(Buffer.from(m[2], 'base64'));
});

const auth = (...roles) => (req, res, next) => {
  try {
    req.user = verify((req.headers.authorization || '').replace('Bearer ', ''));
    if (roles.length && !roles.includes(req.user.role)) throw err(403, 'Akses ditolak');
    next();
  } catch (e) { res.status(e.code || 401).json({ error: e.message }); }
};

const session = u => {
  const rt = crypto.randomBytes(32).toString('hex');
  db.refresh[rt] = { uid: u.id, exp: now() + 30 * 864e5 };
  return { accessToken: sign({ sub: u.id, role: u.role }, 7200), refreshToken: rt, user: { id: u.id, email: u.email, role: u.role, displayName: u.displayName } };
};

// Auth
app.post('/api/auth/register', limit(20), h(req => {
  const { email, password, displayName, role, skills = [] } = req.body;
  if (!email || !password || password.length < 8) throw err(400, 'Email dan sandi (min. 8 karakter) wajib diisi');
  if (db.users.some(u => u.email === email.toLowerCase())) throw err(409, 'Email sudah terdaftar');
  const games = [...new Set(db.services.map(s => s.gameName))], sk = [...new Set((Array.isArray(skills) ? skills : []).filter(x => games.includes(x)))];
  if (role === 'BOOSTER' && !sk.length) throw err(400, 'Pilih minimal satu game yang kamu kuasai');
  const r = role === 'BOOSTER' ? 'BOOSTER' : 'CUSTOMER', u = { id: uid(), email: email.toLowerCase(), passwordHash: hashPw(password), role: r, displayName: displayName || email.split('@')[0] };
  db.users.push(u);
  if (r === 'BOOSTER') db.boosters.push({ userId: u.id, skills: sk, maxConcurrentOrders: 2, sharePercentage: null, rating: 5, active: false, lastAssignedAt: 0, availability: [], whatsapp: cleanWa(req.body.whatsapp), bio: '', showWhatsapp: !!req.body.whatsapp });
  return r === 'BOOSTER' ? { ...session(u), pending: true } : session(u);
}));

app.post('/api/auth/login', limit(20), h(req => {
  const u = db.users.find(x => x.email === String(req.body.email || '').toLowerCase());
  let ok = false; try { ok = u && checkPw(String(req.body.password || ''), u.passwordHash); } catch { }
  if (!ok) throw err(401, 'Email atau sandi salah');
  return session(u);
}));

app.post('/api/auth/refresh', h(req => {
  const r = db.refresh[req.body.refreshToken]; delete db.refresh[req.body.refreshToken];
  if (!r || r.exp < now()) throw err(401, 'Sesi berakhir');
  const u = db.users.find(x => x.id === r.uid); if (!u) throw err(401, 'Sesi berakhir');
  return session(u);
}));

app.post('/api/auth/change-password', auth(), limit(10), h(req => {
  const u = db.users.find(x => x.id === req.user.sub) || nf(), { currentPassword, newPassword } = req.body;
  let ok = false; try { ok = checkPw(String(currentPassword || ''), u.passwordHash); } catch { }
  if (!ok) throw err(401, 'Sandi saat ini salah');
  if (typeof newPassword !== 'string' || newPassword.length < 8) throw err(400, 'Sandi baru minimal 8 karakter');
  if (newPassword === currentPassword) throw err(400, 'Sandi baru harus berbeda dari sandi saat ini');
  u.passwordHash = hashPw(newPassword);
  for (const t in db.refresh) if (db.refresh[t].uid === u.id) delete db.refresh[t];
  return session(u);
}));

// Katalog & lacak
app.get('/api/catalog', cached(() => ({ games: [...new Set(db.services.filter(s => s.active).map(s => s.gameName))].map(g => ({ gameName: g, art: gameArt(g), services: db.services.filter(s => s.active && s.gameName === g).sort((a, b) => a.sort - b.sort).map(pubSvc) })) })));
app.get('/api/track/:code', h(req => {
  const o = db.orders.find(x => x.code === req.params.code.toUpperCase()) || nf();
  return { code: o.code, gameName: o.gameName, title: o.title, status: o.status, progress: o.progress, totalAmount: o.totalAmount, paidAmount: o.paidAmount, history: o.history };
}));

// Customer
const mine = req => db.orders.find(o => o.id === req.params.id && o.customerId === req.user.sub) || nf();
app.post('/api/orders', auth('CUSTOMER'), h(req => {
  const k = req.headers['idempotency-key'], prev = k && db.idem[k] && db.orders.find(o => o.id === db.idem[k] && o.customerId === req.user.sub); if (prev) return view(prev);
  const { serviceId, tier = 'standard', qty, gameUid, server, accountLogin, accountPassword, targetDescription, notes } = req.body;
  const s = db.services.find(x => x.id === serviceId && x.active) || nf(), m = s.tiers[tier];
  if (!m) throw err(400, 'Tier tidak valid');
  if (!gameUid || !accountPassword) throw err(400, 'UID dan kredensial akun wajib diisi');
  const n = Math.floor(+qty || 1);
  if (n < (s.minQty || 1) || n > (s.maxQty || 1)) throw err(400, s.unit === 'paket' ? 'Paket ini dipesan 1 kali per pesanan' : `Jumlah harus ${s.minQty || 1}–${s.maxQty || 1} ${s.unit}`);
  const total = Math.round(s.basePrice * n * m), o = {
    id: uid(), code: 'NJ' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + crypto.randomBytes(2).toString('hex').toUpperCase(),
    customerId: req.user.sub, serviceId, gameName: s.gameName, title: s.unit === 'paket' ? s.title : `${s.title} (${n} ${s.unit})`, tier, qty: n, unit: s.unit, priority: tier === 'express' ? 0 : 1, gameUid, server, targetDescription, notes, estimatedHours: s.estimatedHours * n,
    gameAccountInfo: enc(JSON.stringify({ login: accountLogin, password: accountPassword })), totalAmount: total, paidAmount: 0, progress: 0, excluded: [], boosterId: null, status: 'DRAFT', history: [{ status: 'DRAFT', at: now() }], createdAt: now()
  };
  go(o, 'PENDING_PAYMENT'); db.orders.push(o); if (k) db.idem[k] = o.id; return view(o);
}));
app.get('/api/orders', auth('CUSTOMER'), h(req => db.orders.filter(o => o.customerId === req.user.sub).map(o => ({ ...view(o), due: o.status === 'PENDING_PAYMENT' ? due(o) : 0, worker: wk(o) })).reverse()));
app.post('/api/orders/:id/pay', auth('CUSTOMER'), h(req => { const o = mine(req); if (o.status !== 'PENDING_PAYMENT') throw err(409, 'Pesanan tidak menunggu pembayaran'); return { orderId: o.id, amount: due(o), paymentToken: uid() }; }));
app.post('/api/orders/:id/simulate-pay', auth('CUSTOMER'), h(req => { if (process.env.NODE_ENV === 'production') nf(); const o = mine(req); if (o.status !== 'PENDING_PAYMENT') throw err(409, 'Pesanan tidak menunggu pembayaran'); applyPayment(o, 'SIM-' + uid(), due(o)); return view(o); }));
app.post('/api/orders/:id/confirm', auth('CUSTOMER'), h(req => { const o = mine(req); verifyOrder(o, 'Dikonfirmasi pelanggan'); return view(o); }));
app.post('/api/orders/:id/dispute', auth('CUSTOMER'), h(req => { const o = mine(req); go(o, 'DISPUTED', req.body.reason); return view(o); }));
app.post('/api/payments/webhook', h(req => {
  if (crypto.createHmac('sha256', GW).update(req.raw || '').digest('hex') !== req.headers['x-signature']) throw err(401, 'Signature salah');
  const { transactionId, orderId, amount, status } = req.body;
  if (status !== 'success') return { ok: true };
  return { ok: true, duplicate: !applyPayment(db.orders.find(o => o.id === orderId) || nf(), transactionId, amount) };
}));

// Booster
const me = req => db.boosters.find(b => b.userId === req.user.sub) || nf();
const bord = req => { const o = db.orders.find(x => x.id === req.params.id) || nf(); if (o.boosterId !== req.user.sub) throw err(403, 'Bukan pesanan Anda'); return o; };
app.get('/api/booster/me', auth('BOOSTER'), h(req => {
  const b = me(req);
  return {
    profile: bv(b), mode: db.settings.assignMode,
    orders: db.orders.filter(o => o.boosterId === b.userId).map(view).reverse(),
    queue: db.settings.assignMode === 'broadcast' ? db.orders.filter(o => o.status === 'QUEUED' && eligible(b, o)).map(view) : [], payouts: db.payouts.filter(p => p.boosterId === b.userId)
  };
}));
app.put('/api/booster/availability', auth('BOOSTER'), h(req => {
  const b = me(req), { availability, maxConcurrentOrders, skills } = req.body;
  if (Array.isArray(availability)) b.availability = availability.filter(s => s.startTime < s.endTime).map(s => ({ dayOfWeek: +s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, maxOrdersInSlot: +s.maxOrdersInSlot || 1 }));
  if (maxConcurrentOrders) b.maxConcurrentOrders = Math.max(1, +maxConcurrentOrders);
  if (Array.isArray(skills)) b.skills = skills;
  dispatch(); return bv(b);
}));
app.post('/api/booster/orders/:id/accept', auth('BOOSTER'), h(req => { const o = bord(req); go(o, 'IN_PROGRESS'); return view(o); }));
app.post('/api/booster/orders/:id/reject', auth('BOOSTER'), h(req => { const o = bord(req); if (o.status !== 'ASSIGNED') throw err(409, 'Hanya order berstatus Ditugaskan yang bisa ditolak'); o.excluded.push(o.boosterId); o.boosterId = null; go(o, 'QUEUED', 'Ditolak penjoki'); dispatch(); return view(o); }));
app.post('/api/booster/orders/:id/claim', auth('BOOSTER'), h(req => { const b = me(req), o = db.orders.find(x => x.id === req.params.id) || nf(); if (db.settings.assignMode !== 'broadcast' || o.status !== 'QUEUED' || !eligible(b, o)) throw err(409, 'Order tidak bisa diambil'); assign(o, b); go(o, 'IN_PROGRESS', 'Direbut penjoki'); return view(o); }));
app.post('/api/booster/orders/:id/progress', auth('BOOSTER'), h(req => { const o = bord(req); if (o.status !== 'IN_PROGRESS') throw err(409, 'Order tidak sedang dikerjakan'); o.progress = Math.min(99, Math.max(0, +req.body.progress || 0)); o.history.push({ status: 'IN_PROGRESS', at: now(), note: `Progres ${o.progress}%` }); return view(o); }));
app.post('/api/booster/orders/:id/complete', auth('BOOSTER'), h(req => { const o = bord(req); go(o, 'COMPLETED'); o.progress = 100; o.completedAt = now(); o.gameAccountInfo = null; return view(o); }));
app.get('/api/booster/orders/:id/credentials', auth('BOOSTER'), h(req => { const o = bord(req); if (o.status !== 'IN_PROGRESS' || !o.gameAccountInfo) throw err(403, 'Kredensial hanya tersedia saat order aktif'); return JSON.parse(dec(o.gameAccountInfo)); }));
app.post('/api/booster/payouts', auth('BOOSTER'), h(req => { const a = Math.floor(+req.body.amount); if (!(a > 0) || a > balance(req.user.sub)) throw err(400, 'Saldo tidak cukup'); const p = { id: uid(), boosterId: req.user.sub, amount: a, status: 'PENDING', requestedAt: now() }; db.payouts.push(p); return p; }));

// Profil akun
const uview = u => ({ id: u.id, email: u.email, role: u.role, displayName: u.displayName });
app.get('/api/auth/me', auth(), h(req => uview(db.users.find(x => x.id === req.user.sub) || nf())));
app.put('/api/auth/profile', auth(), limit(30), h(req => {
  const u = db.users.find(x => x.id === req.user.sub) || nf(), r = req.body;
  const name = 'displayName' in r ? cleanName(r.displayName) : u.displayName;
  let email = u.email;
  if ('email' in r) { email = String(r.email || '').trim().toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw err(400, 'Format email tidak valid'); if (db.users.some(x => x.id !== u.id && x.email === email)) throw err(409, 'Email sudah dipakai akun lain'); }
  u.displayName = name; u.email = email; return { user: uview(u) };
}));

// Admin
const adm = auth('ADMIN');
app.get('/api/admin/data', adm, h(() => ({ settings: db.settings, services: db.services.map(pubSvc), games: [...new Set(db.services.map(s => s.gameName))].map(g => ({ gameName: g, ...gameArt(g) })), orders: db.orders.map(view).reverse(), boosters: db.boosters.map(bv), payouts: db.payouts, report: rep(), ledger: db.ledger.slice(-50).reverse(), tickets: db.tickets.slice().reverse() })));
app.get('/api/admin/reports', adm, h(req => rep(req.query.from ? Date.parse(req.query.from) : 0, req.query.to ? Date.parse(req.query.to) + 864e5 - 1 : now())));
app.put('/api/admin/settings', adm, h(req => { for (const k of Object.keys(db.settings)) if (req.body[k] !== undefined) db.settings[k] = k === 'adminWhatsapp' ? cleanWa(req.body[k]) : k === 'brand' ? String(req.body[k]).slice(0, 40) || 'Nadzz Joki' : k === 'assignMode' ? (req.body[k] === 'broadcast' ? 'broadcast' : 'auto') : (req.body[k] !== '' && Number.isFinite(+req.body[k]) ? Math.max(0, k === 'commissionPct' ? Math.min(100, +req.body[k]) : +req.body[k]) : db.settings[k]); dispatch(); return db.settings; }));
app.post('/api/admin/services', adm, h(req => {
  const b = req.body;
  if (b.image && !imgOk(String(b.image), 150000)) throw err(400, 'Gambar tidak valid: gunakan webp/jpeg/png, maks. ±110 KB');
  if (!b.id && (!String(b.gameName || '').trim() || !String(b.title || '').trim())) throw err(400, 'Game dan judul paket wajib diisi');
  const s = b.id ? db.services.find(x => x.id === b.id) || nf() : svc();
  if (!b.id) db.services.push(s);
  const num = (v, d) => v === undefined || v === '' || v === null || !Number.isFinite(+v) ? d : +v;
  if (b.unit !== undefined) s.unit = ['paket', 'bintang', 'hari'].includes(b.unit) ? b.unit : s.unit;
  Object.assign(s, {
    gameName: b.gameName ?? s.gameName, category: b.category || s.category, title: b.title ?? s.title, description: b.description ?? s.description,
    basePrice: Math.max(0, Math.floor(num(b.basePrice, s.basePrice))), estimatedHours: num(b.estimatedHours, s.estimatedHours) || s.estimatedHours,
    badge: b.badge !== undefined ? String(b.badge).slice(0, 20) : s.badge, active: b.active ?? s.active
  });
  s.maxQty = s.unit === 'paket' ? 1 : Math.min(500, Math.max(1, Math.floor(num(b.maxQty, s.maxQty > 1 ? s.maxQty : 100)))); s.tiers = tiersFor(s.unit);
  if ('commissionPct' in b) s.commissionPct = b.commissionPct === '' || b.commissionPct == null ? null : +b.commissionPct;
  if ('image' in b) { s.image = b.image ? String(b.image) : ''; s.imageAt = now(); }
  return pubSvc(s);
}));
app.delete('/api/admin/services/:id', adm, h(req => { const i = db.services.findIndex(x => x.id === req.params.id); if (i < 0) nf(); const [s] = db.services.splice(i, 1); if (s.sku && !db.meta.deletedSkus.includes(s.sku)) db.meta.deletedSkus.push(s.sku); return { ok: true }; }));
app.post('/api/admin/services-restore', adm, h(() => { const n = db.meta.deletedSkus.length; db.meta.deletedSkus = []; CATALOG.forEach((c, i) => { if (!db.services.some(s => s.sku === c.sku)) db.services.push(svc({ ...c, sort: i })); }); return { restored: n }; }));

app.get('/api/admin/export', adm, (req, res) => {
  const d = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  res.set({ 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="nadzz-backup-${d}.json"`, 'Cache-Control': 'no-store' }).send(JSON.stringify({ format: 'nadzz-backup-v1', exportedAt: now(), data: db }));
});
app.post('/api/admin/import', adm, h(req => {
  const d = req.body?.data;
  if (!d || typeof d !== 'object' || Array.isArray(d)) throw err(400, 'File cadangan tidak valid');
  for (const k of ['users', 'boosters', 'services']) if (!Array.isArray(d[k])) throw err(400, `File cadangan tidak valid: "${k}" tidak ada`);
  if (!d.settings || typeof d.settings !== 'object') throw err(400, 'File cadangan tidak valid: "settings" tidak ada');
  if (!d.users.some(u => u && u.role === 'ADMIN' && u.email && u.passwordHash)) throw err(400, 'Cadangan harus berisi minimal satu akun ADMIN');
  if (d.users.some(u => !u || !u.id || !u.email || !u.passwordHash) || d.services.some(x => !x || !x.id)) throw err(400, 'File cadangan rusak: ada data tanpa id/email');
  for (const k of ['orders', 'ledger', 'payouts', 'tickets']) d[k] = Array.isArray(d[k]) ? d[k] : [];
  for (const k of ['txs', 'idem', 'refresh', 'gameArt', 'meta']) d[k] = d[k] && typeof d[k] === 'object' ? d[k] : {};
  const bak = `${FILE}.sebelum-impor-${now()}`; fs.writeFileSync(bak, JSON.stringify(db));
  const old = fs.readdirSync(path.dirname(FILE)).filter(f => f.startsWith(path.basename(FILE) + '.sebelum-impor-')).sort().reverse().slice(3);
  for (const f of old) try { fs.unlinkSync(path.join(path.dirname(FILE), f)); } catch { }
  db = d; migrate(); return { ok: true, users: db.users.length, services: db.services.length, orders: db.orders.length, backup: path.basename(bak) };
}));

app.post('/api/admin/games', adm, h(req => {
  const g = String(req.body.gameName || '').trim(); if (!g || !db.services.some(s => s.gameName === g)) throw err(400, 'Game tidak ditemukan di katalog');
  const a = db.gameArt[g] = db.gameArt[g] || {};
  for (const [k, max] of [['icon', 120000], ['banner', 230000]]) if (k in req.body) { const v = req.body[k]; if (v) { if (!imgOk(String(v), max)) throw err(400, 'Gambar tidak valid: gunakan webp/jpeg/png'); a[k] = String(v); } else a[k] = ''; a[k + 'At'] = now(); }
  return { gameName: g, ...gameArt(g) };
}));
app.put('/api/admin/boosters/:id', adm, h(req => { const b = db.boosters.find(x => x.userId === req.params.id) || nf(), r = req.body; if ('sharePercentage' in r) b.sharePercentage = r.sharePercentage === '' || r.sharePercentage == null ? null : +r.sharePercentage; if ('active' in r) { b.active = !!r.active; if (b.active) dispatch(); } return bv(b); }));
app.post('/api/admin/orders/:id/assign', adm, h(req => { const o = db.orders.find(x => x.id === req.params.id) || nf(), b = db.boosters.find(x => x.userId === req.body.boosterId) || nf(); assign(o, b); return view(o); }));
app.post('/api/admin/orders/:id/resolve', adm, h(req => { const o = db.orders.find(x => x.id === req.params.id) || nf(); if (o.status !== 'DISPUTED') throw err(409, 'Order tidak sedang disengketakan'); if (req.body.outcome === 'refund') { go(o, 'REFUNDED', 'Sengketa: refund'); led(o.id, 'REFUND', o.paidAmount, 'PLATFORM', `Refund ${o.code}`); } else verifyOrder(o, 'Sengketa: diselesaikan'); return view(o); }));
app.post('/api/admin/payouts/:id/process', adm, h(req => { const p = db.payouts.find(x => x.id === req.params.id && x.status === 'PENDING') || nf(); if (req.body.approve) { p.status = 'COMPLETED'; p.processedAt = now(); p.referenceNumber = 'PO-' + Date.now(); led(null, 'PAYOUT', p.amount, 'BOOSTER', `Payout ${p.referenceNumber}`, p.boosterId); } else p.status = 'REJECTED'; return p; }));
app.post('/api/admin/expenses', adm, h(req => { const a = Math.floor(+req.body.amount); if (!(a > 0)) throw err(400, 'Nominal tidak valid'); led(null, 'OPEX', a, 'PLATFORM', req.body.description || 'Beban operasional'); return { ok: true }; }));

// ===== Konfigurasi publik & Customer Service =====
const wk = o => { const b = db.boosters.find(x => x.userId === o.boosterId); return b && ['IN_PROGRESS', 'COMPLETED'].includes(o.status) ? { displayName: db.users.find(u => u.id === b.userId)?.displayName, whatsapp: b.showWhatsapp && b.whatsapp ? b.whatsapp : null } : null; };
app.get('/api/config', cached(() => ({ brand: db.settings.brand, adminWhatsapp: db.settings.adminWhatsapp, sandbox: process.env.NODE_ENV !== 'production' })));

const photoOk = p => {
  const m = /^data:image\/(webp|jpeg|png);base64,([A-Za-z0-9+/=]+)$/.exec(p);
  if (!m || p.length > 230000) return false;
  const x = Buffer.from(m[2].slice(0, 24), 'base64');
  return m[1] === 'webp' ? x.subarray(0, 4).toString() === 'RIFF' && x.subarray(8, 12).toString() === 'WEBP' : m[1] === 'png' ? x[0] === 0x89 && x.subarray(1, 4).toString() === 'PNG' : x[0] === 0xff && x[1] === 0xd8;
};
const photoUrl = b => !b.photo ? '' : b.photo.startsWith('data:') ? `/api/workers/${b.userId}/photo?v=${b.photoAt || 0}` : b.photo;
app.get('/api/workers/:id/photo', (req, res) => {
  const b = db.boosters.find(x => x.userId === req.params.id && x.active), m = b && /^data:(image\/[a-z]+);base64,(.+)$/.exec(b.photo || '');
  if (!m) return res.status(404).json({ error: 'Foto tidak ditemukan' });
  res.set({ 'Content-Type': m[1], 'Cache-Control': 'public, max-age=86400' }).send(Buffer.from(m[2], 'base64'));
});
app.get('/api/workers', cached(() => db.boosters.filter(b => b.active).map(b => ({ id: b.userId, displayName: db.users.find(u => u.id === b.userId)?.displayName, skills: b.skills, rating: b.rating, bio: b.bio, photo: photoUrl(b), done: db.orders.filter(o => o.boosterId === b.userId && o.status === 'VERIFIED').length, available: load(b) < b.maxConcurrentOrders && inSlot(b), whatsapp: b.showWhatsapp && b.whatsapp ? b.whatsapp : null }))));
app.put('/api/booster/profile', auth('BOOSTER'), h(req => {
  const b = me(req), r = req.body;
  if ('whatsapp' in r) b.whatsapp = cleanWa(r.whatsapp);
  if ('bio' in r) b.bio = String(r.bio).slice(0, 300);
  if ('showWhatsapp' in r) b.showWhatsapp = !!r.showWhatsapp && !!b.whatsapp;
  if ('photo' in r) { if (r.photo) { if (!photoOk(String(r.photo))) throw err(400, 'Foto tidak valid: gunakan webp/jpeg/png, maks. ±170 KB'); b.photo = String(r.photo); } else b.photo = ''; b.photoAt = now(); }
  return bv(b);
}));

const rl = {}, tview = t => ({ code: t.code, subject: t.subject, message: t.message, orderCode: t.orderCode, status: t.status, replies: t.replies, createdAt: t.createdAt });
app.post('/api/support/tickets', h(req => {
  const k = req.ip + new Date().toISOString().slice(0, 13);
  rl[k] = (rl[k] || 0) + 1;
  if (rl[k] > 5) throw err(429, 'Terlalu banyak tiket, coba lagi nanti');
  const { name, contact, orderCode, subject, message } = req.body;
  if (!name || !contact || !subject || String(message || '').length < 10) throw err(400, 'Lengkapi nama, kontak, subjek, dan pesan (min. 10 karakter)');
  let userId = null;
  try { userId = verify((req.headers.authorization || '').replace('Bearer ', '')).sub; } catch { }
  const t = { id: uid(), code: 'TK' + crypto.randomBytes(3).toString('hex').toUpperCase(), userId, name: String(name).slice(0, 80), contact: String(contact).slice(0, 80), orderCode: String(orderCode || '').slice(0, 30).toUpperCase(), subject: String(subject).slice(0, 120), message: String(message).slice(0, 2000), status: 'OPEN', replies: [], createdAt: now() };
  db.tickets.push(t); return tview(t);
}));
app.get('/api/support/tickets/mine', auth(), h(req => db.tickets.filter(t => t.userId === req.user.sub).map(tview).reverse()));
app.get('/api/support/ticket/:code', h(req => tview(db.tickets.find(x => x.code === req.params.code.toUpperCase() && x.contact.toLowerCase() === String(req.query.contact || '').toLowerCase()) || nf())));
app.post('/api/admin/tickets/:id/reply', adm, h(req => {
  const t = db.tickets.find(x => x.id === req.params.id) || nf(), m = String(req.body.message || '').trim();
  if (!m) throw err(400, 'Balasan kosong');
  t.replies.push({ by: 'ADMIN', message: m.slice(0, 2000), at: now() });
  t.status = ['OPEN', 'ANSWERED', 'CLOSED'].includes(req.body.status) ? req.body.status : 'ANSWERED';
  return tview(t);
}));

// 404 Handler
app.use((req, res) => req.path.startsWith('/api/') ? res.status(404).json({ error: 'Endpoint tidak ditemukan' }) : res.status(404).sendFile(path.join(FRONT, '404.html')));

// Global Error Handler
app.use((e, req, res, next) => {
  console.error('Server Error:', e);
  const statusCode = [e.code, e.status, e.statusCode].find(n => Number.isInteger(n) && n >= 400 && n < 600) || 500;
  res.status(statusCode).json({ error: e.message || 'Kesalahan internal server' });
});

// Server Execution
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
server.on('error', e => { console.error('Gagal membuka port', PORT, e.message); process.exit(1); });
// Railway mengirim SIGTERM saat redeploy: simpan data dulu agar tidak ada yang hilang
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => { try { save(); } catch { } process.exit(0); });
process.on('unhandledRejection', e => console.error('unhandledRejection:', e));