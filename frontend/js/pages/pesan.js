import {$,$$,api,rp,esc,getS,toast,waLink,config} from '/js/api.js';
import {mountLayout} from '/js/layout.js';
mountLayout('pesan');
// Pembayaran selalu lunas (sistem DP sudah dihapus). Jumlah (qty) dipakai untuk paket bersatuan: bintang / hari.
const st={games:[],svc:null,tier:'standard',qty:1,step:1,gi:0},key=crypto.randomUUID(),q=new URLSearchParams(location.search);
const fmtH=h=>h<1?`${Math.max(1,Math.round(h*60))} mnt`:`${+(+h).toFixed(1)} jam`;
const per=s=>s.unit&&s.unit!=='paket'?` / ${s.unit}`:'';
const price=()=>st.svc?Math.round(st.svc.basePrice*st.qty*(st.svc.tiers[st.tier]||1)):0;
const clampQty=v=>Math.min(st.svc?.maxQty||1,Math.max(st.svc?.minQty||1,Math.floor(+v)||1));
const S=getS();
if(!S||S.user.role!=='CUSTOMER'){$('#guest').classList.remove('hidden');$('#glogin').href='/login.html?next='+encodeURIComponent(location.pathname+location.search)}
function pick(x){st.svc=x;st.qty=1;if(!x.tiers[st.tier])st.tier='standard'}
function tabs(){$('#tabs').innerHTML=st.games.map((g,i)=>`<button class="tab ${i===st.gi?'on':''}" data-i="${i}">${esc(g.gameName)}</button>`).join('');
 const g=st.games[st.gi],cats=[...new Set((g?.services||[]).map(s=>s.category||'Lainnya'))];
 $('#lst').innerHTML=cats.map(c=>`<h3 class="sm:col-span-2 text-xs uppercase tracking-widest text-slate-500 mt-3 first:mt-0">${esc(c)}</h3>`+
  g.services.filter(s=>(s.category||'Lainnya')===c).map(s=>`<button data-s="${s.id}" class="glass hov rounded-2xl p-5 text-left ${st.svc?.id===s.id?'ring-2 ring-cy':''}">
   <div class="flex items-start justify-between gap-2"><h3 class="font-semibold mb-1">${esc(s.title)}</h3>${s.badge?`<span class="chip shrink-0">${esc(s.badge)}</span>`:''}</div>
   <p class="text-sm text-slate-400 mb-3">${esc(s.description)}</p>
   <div class="flex justify-between items-center"><b class="grad-text font-display">${rp(s.basePrice)}<span class="text-xs text-slate-400 font-sans font-normal">${per(s)}</span></b><span class="text-xs text-slate-400">Est. ${fmtH(s.estimatedHours)}${per(s)}</span></div></button>`).join('')).join('')}
function sum(){const s=st.svc;if(!s)return $('#sum').innerHTML='Belum ada paket dipilih.';
 const hasQty=s.unit!=='paket',ex=!!s.tiers.express;
 $('#sum').innerHTML=`<div class="text-white font-semibold mb-1">${esc(s.title)}</div><div class="mb-4">${esc(s.gameName)}</div>
  ${hasQty?`<div class="mb-4"><label class="lbl">Jumlah (${esc(s.unit)}, maks. ${s.maxQty})<input id="qty" type="number" class="field" min="${s.minQty||1}" max="${s.maxQty}" value="${st.qty}"></label></div>`:''}
  ${ex?`<div class="grid gap-1.5 mb-4"><label class="lbl">Kecepatan<select id="tier" class="field"><option value="standard" ${st.tier==='standard'?'selected':''}>Standar</option><option value="express" ${st.tier==='express'?'selected':''}>Express (prioritas)</option></select></label></div>`:''}
  ${hasQty?`<div class="flex justify-between"><span>Harga satuan</span><span>${rp(Math.round(s.basePrice*(s.tiers[st.tier]||1)))}</span></div><div class="flex justify-between mb-1"><span>Jumlah</span><span>${st.qty} ${esc(s.unit)}</span></div>`:''}
  <div class="flex justify-between"><span>Total</span><b class="text-white">${rp(price())}</b></div>`;
 if($('#qty'))$('#qty').onchange=e=>{st.qty=clampQty(e.target.value);sum();pay()};
 if($('#tier'))$('#tier').onchange=e=>{st.tier=e.target.value;sum();pay()}}
function pay(){$('#fullTxt').textContent=`Bayar ${rp(price())} sekarang lewat payment gateway. Pesanan masuk antrian setelah pembayaran terkonfirmasi.`}
function go(n){st.step=n;['p1','p2','p3'].forEach((id,i)=>$('#'+id).classList.toggle('hidden',i+1!==n));
 $$('#dots .step-dot').forEach((d,i)=>d.classList.toggle('on',i+1<=n));$('#back').classList.toggle('invisible',n===1);$('#next').textContent=n===3?'Buat Pesanan & Bayar':'Lanjut';if(n===3)pay()}
$('#tabs').onclick=e=>{if(e.target.dataset.i!=null){st.gi=+e.target.dataset.i;tabs()}};
$('#lst').onclick=e=>{const b=e.target.closest('[data-s]');if(!b)return;pick(st.games.flatMap(g=>g.services).find(s=>s.id===b.dataset.s));tabs();sum()};
$('#back').onclick=()=>go(st.step-1);
$('#next').onclick=async()=>{
 if(st.step===1){if(!st.svc)return toast('Pilih paket terlebih dahulu','err');return go(2)}
 if(st.step===2){if(!$('#f').reportValidity())return;return go(3)}
 const cur=getS();if(!cur||cur.user.role!=='CUSTOMER'){toast('Masuk sebagai pelanggan untuk memesan','err');return setTimeout(()=>location.href='/login.html?next='+encodeURIComponent(`/pesan.html?service=${st.svc.id}&tier=${st.tier}&qty=${st.qty}`),900)}
 const b=Object.fromEntries(new FormData($('#f')));b.serviceId=st.svc.id;b.tier=st.tier;b.qty=st.qty;
 $('#next').disabled=true;
 try{const o=await api('/orders',{body:b,headers:{'Idempotency-Key':key}});const p=await api(`/orders/${o.id}/pay`,{method:'POST'});let paid=false;
  if(confirm(`Bayar ${rp(p.amount)} lewat gateway sandbox?`)){await api(`/orders/${o.id}/simulate-pay`,{method:'POST'});paid=true}
  done(o,paid)}catch(x){toast(x.message,'err')}finally{$('#next').disabled=false}};
async function done(o,paid){const c=await config().catch(()=>({brand:'Nadzz Joki'}));
 ['p1','p2','p3','nav'].forEach(id=>$('#'+id).classList.add('hidden'));$('#done').classList.remove('hidden');
 const wa=c.adminWhatsapp?waLink(c.adminWhatsapp,`Halo Admin ${c.brand}, saya baru membuat pesanan ${o.code} (${o.title}). Mohon konfirmasi.`):'/cs.html';
 $('#done').innerHTML=`<div class="text-5xl mb-3">${paid?'✅':'🕒'}</div><h2 class="text-2xl font-bold mb-2">${paid?'Pembayaran berhasil':'Pesanan dibuat'}</h2>
  <p class="text-slate-400 mb-4">${paid?'Pesananmu masuk proses.':'Belum dibayar — selesaikan dari Pesanan Saya.'}</p>
  <div class="inline-block glass rounded-xl px-6 py-3 mb-6"><div class="text-xs text-slate-400">Kode pesanan</div><b class="font-display text-xl grad-text">${esc(o.code)}</b></div>
  <div class="flex flex-wrap justify-center gap-3"><a target="_blank" rel="noopener" href="${wa}" class="btn-grad rounded-xl px-6 py-2.5">Konfirmasi via WhatsApp</a><a href="/app.html#/orders" class="btn-line rounded-xl px-6 py-2.5">Pesanan Saya</a><a href="/track.html?code=${encodeURIComponent(o.code)}" class="btn-line rounded-xl px-6 py-2.5">Cek Transaksi</a></div>`;
 setTimeout(()=>{window.__dp?.prompt();window.__dp=null},1200)}
(async()=>{let pre=null;
 try{const c=await api('/catalog');st.games=c.games;
  pre=c.games.flatMap(g=>g.services).find(s=>s.id===q.get('service'));
  if(pre){pick(pre);st.gi=c.games.findIndex(g=>g.gameName===pre.gameName);
   if(pre.tiers[q.get('tier')])st.tier=q.get('tier');st.qty=clampQty(q.get('qty'))}}
 catch{$('#lst').innerHTML='<p class="text-slate-400">Server belum tersambung.</p>'}
 tabs();sum();go(pre?2:1)})(); // datang dari pricelist → langsung ke langkah data akun
