import {esc,waLink} from './api.js';
export const stars=r=>{const n=Math.round(r||0);return '★'.repeat(n)+'☆'.repeat(5-n)};
export function workerCard(w,c){
 const msg=`Halo ${w.displayName}, saya dari ${c.brand}. Saya ingin konsultasi jasa joki.`;
 const href=w.whatsapp?waLink(w.whatsapp,msg):c.adminWhatsapp?waLink(c.adminWhatsapp,`Halo Admin ${c.brand}, saya ingin diarahkan ke worker ${w.displayName}.`):'#';
 return `<article class="glass hov rounded-2xl p-5 flex flex-col gap-3">
 <div class="flex items-center gap-3"><div class="h-12 w-12 rounded-full btn-grad grid place-items-center font-display text-lg">${esc((w.displayName||'?')[0].toUpperCase())}</div>
 <div class="min-w-0"><h3 class="font-semibold truncate">${esc(w.displayName)}</h3><div class="text-xs text-cy">${stars(w.rating)} <span class="text-slate-400">${w.rating}</span></div></div>
 <span class="ml-auto text-xs px-2.5 py-1 rounded-full ${w.available?'bg-emerald-400/10 text-emerald-300':'bg-amber-400/10 text-amber-300'}">${w.available?'Tersedia':'Penuh'}</span></div>
 <p class="text-sm text-slate-400 min-h-[2.5rem]">${esc(w.bio)||'Worker terverifikasi Nadzz Joki.'}</p>
 <div class="flex flex-wrap gap-1.5">${w.skills.map(s=>`<span class="chip">${esc(s)}</span>`).join('')||'<span class="chip">Belum ada skill</span>'}</div>
 <div class="flex items-center justify-between text-xs text-slate-400"><span>${w.done} pesanan selesai</span></div>
 <a href="${href}" target="_blank" rel="noopener" class="btn-grad rounded-xl py-2.5 text-sm">${w.whatsapp?'Chat WhatsApp Worker':'Hubungi via Admin'}</a></article>`}
