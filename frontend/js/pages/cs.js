import {$,api,esc,getS,toast,waLink,config} from '/js/api.js';
import {mountLayout} from '/js/layout.js';
import {FAQ,renderFaq} from '/js/faq.js';
mountLayout('cs');
config().then(c=>{$('#wa').href=c.adminWhatsapp?waLink(c.adminWhatsapp,`Halo Admin ${c.brand}, saya butuh bantuan.`):'#tiket'}).catch(()=>{$('#wa').href='#tiket'});
renderFaq($('#faqs'));
$('#fq').oninput=e=>{const t=e.target.value.toLowerCase();renderFaq($('#faqs'),FAQ.filter(([q,a])=>(q+a).toLowerCase().includes(t)))};
const SC={OPEN:'bg-amber-400/10 text-amber-300',ANSWERED:'bg-emerald-400/10 text-emerald-300',CLOSED:'bg-slate-500/20 text-slate-300'};
const tk=t=>`<div class="glass rounded-xl p-4 text-sm"><div class="flex justify-between gap-2 mb-1"><b>${esc(t.code)} · ${esc(t.subject)}</b><span class="text-xs px-2 py-0.5 rounded-full ${SC[t.status]||''}">${t.status}</span></div>
 <p class="text-slate-400">${esc(t.message)}</p>${t.orderCode?`<p class="text-xs text-slate-500 mt-1">Pesanan ${esc(t.orderCode)}</p>`:''}
 ${t.replies.map(r=>`<div class="mt-2 border-l-2 border-cy pl-3"><div class="text-xs text-cy">Admin · ${new Date(r.at).toLocaleString('id-ID')}</div>${esc(r.message)}</div>`).join('')}</div>`;
const S=getS();if(S){const f=$('#tf');f.name.value=S.user.displayName||'';f.contact.value=S.user.email||''}
$('#tf').onsubmit=async e=>{e.preventDefault();if(!e.target.reportValidity())return;
 try{const t=await api('/support/tickets',{body:Object.fromEntries(new FormData(e.target))});e.target.message.value='';
  $('#tres').innerHTML=`<div class="glass rounded-xl p-4 text-sm"><b class="text-cy">Tiket terkirim.</b> Simpan kodenya: <b class="font-display">${esc(t.code)}</b></div>`;loadMine()}catch(x){toast(x.message,'err')}};
$('#lf').onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));
 try{$('#lres').innerHTML=tk(await api(`/support/ticket/${encodeURIComponent(f.code.trim())}?contact=${encodeURIComponent(f.contact.trim())}`))}catch{$('#lres').innerHTML='<p class="text-sm text-red-400">Tiket tidak ditemukan. Periksa kode dan kontak.</p>'}};
async function loadMine(){if(!getS())return;try{const l=await api('/support/tickets/mine');$('#mine').classList.remove('hidden');$('#mlist').innerHTML=l.map(tk).join('')||'<p class="text-sm text-slate-400">Belum ada tiket.</p>'}catch{}}
loadMine();
