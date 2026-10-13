// Halaman Pricelist — data diambil dari /api/catalog, jadi harga yang diubah admin langsung tampil di sini.
import {$,api,rp,esc,config,waLink} from '/js/api.js';
import {mountLayout} from '/js/layout.js';
mountLayout('pricelist');

// Tampilan per game (hanya warna & teks; nama game harus sama persis dengan di katalog/skill worker)
const THEMES={
 'Genshin Impact':{ini:'GI',c1:'#f7d27a',c2:'#e58a3b',blurb:'Joki Spiral Abyss, Imaginarium Theater, serta rawat akun harian sampai bulanan.'},
 'Mobile Legends':{ini:'ML',c1:'#5db0ff',c2:'#3b5bdb',blurb:'Joki rank per bintang atau paket naik tier. Hero dikerjakan sesuai permintaanmu.'},
 'Honkai Star Rail':{ini:'HSR',c1:'#d2a2ff',c2:'#7a63ff',blurb:'Joki Memory of Chaos, Pure Fiction, Apocalyptic Shadow, dan rawat akun.'}};
const themeOf=n=>THEMES[n]||{ini:String(n).split(/\s+/).map(w=>w[0]).join('').slice(0,3).toUpperCase(),c1:'#2de2e6',c2:'#b66dff',blurb:`Layanan joki ${n}.`};
const UNIT={paket:{ic:'📦',per:''},bintang:{ic:'⭐',per:'/ bintang'},hari:{ic:'📅',per:'/ hari'}};
const slug=n=>String(n).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const fmtH=h=>h<1?`${Math.max(1,Math.round(h*60))} mnt`:`${+(+h).toFixed(1)} jam`;

const st={games:[],g:0,cat:null,svc:null,tier:'standard',qty:1,brand:'Nadzz Joki',wa:''};
const cur=()=>st.games[st.g];
const catsOf=g=>[...new Set(g.services.map(s=>s.category||'Lainnya'))];
const total=()=>st.svc?Math.round(st.svc.basePrice*st.qty*(st.svc.tiers?.[st.tier]||1)):0;

function renderGames(){
 $('#games').innerHTML=st.games.map((g,i)=>{const t=themeOf(g.gameName),min=Math.min(...g.services.map(s=>s.basePrice));
  return `<button type="button" class="pl-game ${i===st.g?'on':''}" data-act="game" data-i="${i}" aria-pressed="${i===st.g}" style="--c1:${t.c1};--c2:${t.c2}">
   <span class="pl-emb">${esc(t.ini)}</span><span><span class="pl-gn">${esc(g.gameName)}</span><span class="pl-gc">${g.services.length} layanan · mulai <b>${rp(min)}</b></span></span></button>`}).join('')}

function renderInfo(){
 const g=cur(),t=themeOf(g.gameName),min=Math.min(...g.services.map(s=>s.basePrice)),
  wa=st.wa?waLink(st.wa,`Halo Admin ${st.brand}, saya ingin bertanya soal pricelist joki ${g.gameName}.`):'/cs.html';
 $('#info').setAttribute('style',`--c1:${t.c1};--c2:${t.c2}`);
 $('#info').innerHTML=`<div class="pl-cover" data-ini="${esc(t.ini)}"></div><div class="pl-ib">
  <div class="pl-gname">${esc(g.gameName)}</div><div class="pl-from">Mulai dari <b>${rp(min)}</b></div><p class="pl-blurb">${esc(t.blurb)}</p>
  <ul class="pl-feat"><li><span>🔐</span><span>Kredensial dienkripsi dan dihapus setelah pesanan selesai</span></li><li><span>📈</span><span>Progres bisa dilacak dengan kode pesanan</span></li><li><span>🛟</span><span>Sengketa dan refund ditangani admin</span></li></ul>
  <div class="pl-how"><h3>Cara pesan</h3><ol><li>Pilih paket dan atur jumlah</li><li>Isi UID, server, dan data akun</li><li>Bayar lunas, lalu pantau progres</li></ol></div>
  <a class="pl-wa" href="${wa}" target="_blank" rel="noopener">Tanya admin via WhatsApp</a>
  <p class="pl-warn">Sebagian game melarang joki dalam ketentuan layanannya. Risiko akun ditanggung pemilik akun.</p></div>`}

function renderSections(){
 const g=cur(),cs=catsOf(g);if(!cs.includes(st.cat))st.cat=cs[0];
 const list=g.services.filter(s=>(s.category||'Lainnya')===st.cat),s=st.svc;let n=0,h='';
 const head=(t,sub)=>`<div class="pl-sh"><span class="pl-n">${++n}</span><div><div class="pl-st">${t}</div>${sub?`<div class="pl-ss">${sub}</div>`:''}</div></div>`;
 if(cs.length>1)h+=`<section class="pl-sec">${head('Pilih kategori')}<div class="pl-cats">${cs.map(c=>`<button type="button" class="pl-cat ${c===st.cat?'on':''}" data-act="cat" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div></section>`;
 h+=`<section class="pl-sec">${head('Pilih paket',`${list.length} pilihan di kategori ${esc(st.cat)}`)}<div class="pl-grid">${list.map(x=>{
  const u=UNIT[x.unit]||UNIT.paket,on=s?.id===x.id,cls=/populer/i.test(x.badge)?'hot':/hemat/i.test(x.badge)?'save':'';
  return `<button type="button" class="pl-item ${on?'on':''}" data-act="svc" data-id="${esc(x.id)}" aria-pressed="${on}" title="${esc(x.description)}">
   <span class="pl-r1"><span class="pl-ic">${u.ic}</span>${x.badge?`<span class="pl-tag ${cls}">${esc(x.badge)}</span>`:''}</span>
   <span class="pl-t">${esc(x.title)}</span><span class="pl-d">${esc(x.description)}</span>
   <span class="pl-foot"><span class="pl-p">${rp(x.basePrice)}<small>${u.per}</small></span><span class="pl-e">±${fmtH(x.estimatedHours)}${x.unit==='paket'?'':' / '+esc(x.unit)}</span></span></button>`}).join('')}</div></section>`;
 if(s){
  const per=s.unit!=='paket',ex=s.tiers?.express;
  h+=`<section class="pl-sec">${head('Atur pesanan',esc(s.title))}<div class="pl-opts">
   ${per?`<div><span class="pl-lab">Jumlah ${esc(s.unit)} (maks. ${s.maxQty})</span><div class="pl-qty"><button type="button" data-act="dec" aria-label="Kurangi">−</button><input id="qty" type="number" inputmode="numeric" min="${s.minQty||1}" max="${s.maxQty}" value="${st.qty}" aria-label="Jumlah ${esc(s.unit)}"><button type="button" data-act="inc" aria-label="Tambah">+</button></div></div>`:''}
   ${ex?`<div><span class="pl-lab">Kecepatan</span><div class="pl-seg"><button type="button" data-act="tier" data-v="standard" class="${st.tier==='standard'?'on':''}">Standar</button><button type="button" data-act="tier" data-v="express" class="${st.tier==='express'?'on':''}">Express +${Math.round((ex-1)*100)}%</button></div></div>`:''}
   ${!per&&!ex?'<span class="pl-hint">Paket ini tidak memerlukan pengaturan tambahan.</span>':''}</div>
   ${ex?'<p class="pl-hint" style="margin-top:12px">Express: pesananmu didahulukan dalam antrian worker.</p>':''}</section>`}
 $('#sections').innerHTML=h}

function renderBar(){
 const s=st.svc,g=cur();
 if(!s){$('#bar').innerHTML=`<div class="pl-bsel"><div class="pl-bt">Belum ada paket dipilih</div><div class="pl-bn">Pilih paket di atas untuk melihat total</div></div><div class="pl-bx"><span class="pl-buy" aria-disabled="true">Pesan Sekarang</span></div>`;return}
 const per=s.unit!=='paket',href=`/pesan.html?service=${encodeURIComponent(s.id)}&tier=${st.tier}&qty=${st.qty}`;
 $('#bar').innerHTML=`<div class="pl-bsel"><div class="pl-bt">${esc(g.gameName)} · ${st.tier==='express'?'Express':'Standar'} · est. ±${fmtH(s.estimatedHours*st.qty)}</div>
  <div class="pl-bn">${esc(s.title)}${per?` × ${st.qty} ${esc(s.unit)}`:''}</div></div>
  <div class="pl-bx"><div class="pl-tot"><span class="pl-bt">Total</span><b>${rp(total())}</b></div><a class="pl-buy" href="${href}">Pesan Sekarang</a></div>`}

const draw=()=>{renderGames();renderInfo();renderSections();renderBar()};
const setQty=v=>{const s=st.svc;if(!s)return;st.qty=Math.min(s.maxQty||1,Math.max(s.minQty||1,Math.floor(+v)||1));renderSections();renderBar()};

document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(!t||!st.games.length)return;const a=t.dataset.act;
 if(a==='game'){st.g=+t.dataset.i;st.cat=null;st.svc=null;st.qty=1;st.tier='standard';history.replaceState(null,'','#'+slug(cur().gameName));draw()}
 else if(a==='cat'){st.cat=t.dataset.v;if(st.svc&&(st.svc.category||'Lainnya')!==st.cat)st.svc=null;renderSections();renderBar()}
 else if(a==='svc'){const x=cur().services.find(v=>v.id===t.dataset.id);if(!x)return;
  if(st.svc?.id!==x.id){st.svc=x;st.qty=1}if(!x.tiers?.[st.tier])st.tier='standard';renderSections();renderBar()}
 else if(a==='tier'){st.tier=t.dataset.v;renderSections();renderBar()}
 else if(a==='inc'||a==='dec')setQty(st.qty+(a==='inc'?1:-1))});
document.addEventListener('change',e=>{if(e.target.id==='qty')setQty(e.target.value)});
addEventListener('hashchange',()=>{const i=st.games.findIndex(g=>slug(g.gameName)===decodeURIComponent(location.hash.slice(1)));if(i>=0&&i!==st.g){st.g=i;st.cat=null;st.svc=null;st.qty=1;draw()}});

(async()=>{
 try{const [cat,c]=await Promise.all([api('/catalog'),config().catch(()=>({}))]);
  st.games=cat.games.filter(g=>g.services.length);st.brand=c.brand||st.brand;st.wa=c.adminWhatsapp||'';
  if(!st.games.length)throw new Error('kosong');
  const i=st.games.findIndex(g=>slug(g.gameName)===decodeURIComponent(location.hash.slice(1)));if(i>=0)st.g=i;
  draw()}
 catch{$('#games').innerHTML='';$('#info').style.display='none';$('#bar').style.display='none';document.querySelector('.pl-layout').style.display='block';
  $('#sections').innerHTML='<div class="pl-sec"><p class="pl-empty">Pricelist belum bisa dimuat. Pastikan server berjalan, lalu muat ulang halaman.</p></div>'}
})();
