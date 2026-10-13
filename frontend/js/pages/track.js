import {$,api,esc,rp,config,waLink,toast} from '/js/api.js';
import {mountLayout} from '/js/layout.js';
mountLayout('track');
const ST={PENDING_PAYMENT:'Menunggu pembayaran',PAID:'Dibayar',QUEUED:'Dalam antrian',ASSIGNED:'Ditugaskan',IN_PROGRESS:'Sedang dikerjakan',COMPLETED:'Selesai, menunggu konfirmasi',VERIFIED:'Terverifikasi',DISPUTED:'Sengketa',REFUNDED:'Refund',CANCELLED:'Dibatalkan',DRAFT:'Draft'};
const FLOW=['PENDING_PAYMENT','QUEUED','ASSIGNED','IN_PROGRESS','COMPLETED','VERIFIED'],END=['VERIFIED','CANCELLED','REFUNDED'];
let timer,adminWa='',brand='Nadzz Joki';
config().then(c=>{adminWa=c.adminWhatsapp;brand=c.brand}).catch(()=>{});
function draw(o){
 const idx=Math.max(0,FLOW.indexOf(o.status==='PAID'?'QUEUED':o.status)),bad=['DISPUTED','REFUNDED','CANCELLED'].includes(o.status);
 const wa=adminWa?waLink(adminWa,`Halo Admin ${brand}, saya ingin menanyakan pesanan ${o.code}.`):'/cs.html';
 $('#res').innerHTML=`<article class="glass rounded-2xl p-6 fade-in">
 <div class="flex flex-wrap items-start justify-between gap-3"><div><div class="text-xs text-slate-400">${esc(o.gameName)} · ${esc(o.code)}</div><h2 class="text-xl font-semibold">${esc(o.title)}</h2></div>
  <span class="text-xs px-3 py-1 rounded-full ${bad?'bg-red-400/10 text-red-300':o.status==='VERIFIED'?'bg-emerald-400/10 text-emerald-300':'bg-cyan-400/10 text-cyan-200'}">${ST[o.status]||o.status}</span></div>
 ${bad?'':`<ol class="grid grid-cols-6 gap-1 my-6 text-center text-[11px]">${FLOW.map((s,i)=>`<li class="${i<=idx?'text-cy':'text-slate-500'}"><div class="h-1.5 rounded-full mb-2 ${i<=idx?'bg-gradient-to-r from-cy to-vi':'bg-white/10'}"></div>${ST[s].split(',')[0]}</li>`).join('')}</ol>`}
 <div class="my-4"><div class="flex justify-between text-xs text-slate-400 mb-1"><span>Progres pengerjaan</span><b>${o.progress||0}%</b></div><div class="h-2 rounded-full bg-white/10 overflow-hidden"><div class="h-full bg-gradient-to-r from-cy to-vi transition-all" style="width:${o.progress||0}%"></div></div></div>
 <div class="text-sm text-slate-400 mb-4">Pembayaran: <b class="text-white">${rp(o.paidAmount)}</b> / ${rp(o.totalAmount)}</div>
 <ul class="border-l border-white/10 ml-1.5 pl-5 grid gap-3 text-sm">${o.history.slice().reverse().map(h=>`<li><b>${ST[h.status]||esc(h.status)}</b>${h.note?` — ${esc(h.note)}`:''}<div class="text-xs text-slate-500">${new Date(h.at).toLocaleString('id-ID')}</div></li>`).join('')}</ul>
 <div class="flex flex-wrap gap-3 mt-6"><a href="${wa}" target="_blank" rel="noopener" class="btn-grad rounded-xl px-5 py-2.5 text-sm">Tanya via WhatsApp</a><button id="cp" class="btn-line rounded-xl px-5 py-2.5 text-sm">Salin tautan</button><a href="/cs.html#tiket" class="btn-line rounded-xl px-5 py-2.5 text-sm">Ada masalah?</a></div></article>`;
 $('#cp').onclick=()=>navigator.clipboard.writeText(`${location.origin}/track.html?code=${o.code}`).then(()=>toast('Tautan disalin'));
}
async function load(code,quiet){clearTimeout(timer);$('#err').classList.add('hidden');
 try{const o=await api('/track/'+encodeURIComponent(code.trim()));draw(o);history.replaceState(null,'','?code='+o.code);if(!END.includes(o.status))timer=setTimeout(()=>load(code,true),10000)}
 catch(x){if(!quiet){$('#res').innerHTML='';$('#err').textContent=x.message==='Data tidak ditemukan'?'Kode pesanan tidak ditemukan. Periksa kembali.':x.message;$('#err').classList.remove('hidden')}}}
$('#f').onsubmit=e=>{e.preventDefault();load($('#c').value)};
const pre=new URLSearchParams(location.search).get('code');if(pre){$('#c').value=pre;load(pre)}
