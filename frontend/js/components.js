import {esc,waLink} from './api.js';
export const stars=r=>{const n=Math.round(r||0);return '★'.repeat(n)+'☆'.repeat(5-n)};

// Kartu ID worker (tali lanyard + kartu yang bisa dibalik). Dipakai di halaman Beranda & Worker.
// Foto worker diisi lewat Dashboard > Profil Worker; jika belum ada, tampil siluet bawaan.
const safeImg=u=>/^\/(api|assets)\//.test(u||'')?u:'';
const idOf=w=>'NZ-'+String(w.id||'').replace(/[^a-z0-9]/gi,'').slice(0,6).toUpperCase().padEnd(6,'0');
const SIL='<svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><circle cx="50" cy="46" r="19" fill="#2de2e6" opacity=".35"/><path d="M12 125c2-30 18-44 38-44s36 14 38 44z" fill="#b66dff" opacity=".4"/></svg>';

export function workerCard(w,c){
 const name=w.displayName||'Worker',msg=`Halo ${name}, saya dari ${c.brand}. Saya ingin konsultasi jasa joki.`;
 const href=w.whatsapp?waLink(w.whatsapp,msg):c.adminWhatsapp?waLink(c.adminWhatsapp,`Halo Admin ${c.brand}, saya ingin diarahkan ke worker ${name}.`):'#';
 const photo=safeImg(w.photo),top=(extra='')=>`<header class="idc-top"><img src="/assets/nadzzjoki.webp" alt="" width="26" height="26"><div><b>NADZZ JOKI</b><span>WORKER ID</span></div>${extra}</header>`;
 const turn=`<button type="button" class="idc-turn" data-turn aria-label="Balik kartu ${esc(name)}" title="Balik kartu">↻</button>`;
 return `<article class="idc"><div class="idc-hang"><div class="idc-strap" aria-hidden="true"><i class="idc-ring"></i></div><div class="idc-clip" aria-hidden="true"></div>
 <div class="idc-flip"><div class="idc-card">
  <div class="idc-face idc-front"><div class="idc-slot" aria-hidden="true"></div>
   ${top(`<em class="idc-st ${w.available?'ok':'no'}">${w.available?'Tersedia':'Penuh'}</em>`)}
   <div class="idc-photo">${SIL}${photo?`<img src="${esc(photo)}" alt="Foto ${esc(name)}" loading="lazy" decoding="async" onerror="this.remove()">`:''}</div>
   <div class="idc-info"><h3 title="${esc(name)}">${esc(name)}</h3><div class="idc-meta"><span class="idc-id">${idOf(w)}</span><span class="idc-rt">${stars(w.rating)} ${esc(w.rating)}</span></div></div>${turn}</div>
  <div class="idc-face idc-back" inert><div class="idc-slot" aria-hidden="true"></div>${top()}
   <div class="idc-bd"><h4>Tentang</h4><p>${esc(w.bio)||'Worker terverifikasi Nadzz Joki.'}</p>
    <h4>Keahlian</h4><div class="idc-skills">${(w.skills||[]).map(s=>`<span class="chip">${esc(s)}</span>`).join('')||'<span class="chip">Belum ada skill</span>'}</div>
    <div class="idc-stats"><div><b>${esc(w.done)}</b><span>Pesanan selesai</span></div><div><b>${esc(w.rating)}</b><span>Rating</span></div></div></div>
   <a href="${href}" target="_blank" rel="noopener" class="btn-grad idc-wa rounded-xl">${w.whatsapp?'Chat WhatsApp Worker':'Hubungi via Admin'}</a>
   <div class="idc-bar" aria-hidden="true"></div>${turn}</div>
 </div></div></div></article>`}

// Balik kartu: klik/ketuk di mana saja pada kartu, atau tombol ↻ (Enter/Spasi). Satu listener untuk semua kartu, jadi aman saat daftar digambar ulang.
function flip(card){const on=card.classList.toggle('is-flipped');
 card.closest('.idc').classList.toggle('is-flipped',on);
 card.querySelector('.idc-front').inert=on;card.querySelector('.idc-back').inert=!on}
document.addEventListener('click',e=>{const card=e.target.closest('.idc-card');if(card&&!e.target.closest('a'))flip(card)});
