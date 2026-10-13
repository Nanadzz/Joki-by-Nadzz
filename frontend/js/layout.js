// Header, footer, tombol WhatsApp melayang, PWA — dipasang di setiap halaman publik
import './fx.js';
import {$,getS,setS,config,waLink,roleHome,esc} from './api.js';
const NAV=[['/index.html','Beranda','home'],['/pricelist.html','Pricelist','pricelist'],['/pesan.html','Pesan','pesan'],['/worker.html','Worker','worker'],['/track.html','Cek Transaksi','track'],['/cs.html','Customer Service','cs']];
addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.__dp=e});
if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js');
export async function mountLayout(active){
 const S=getS();let c={brand:'Nadzz Joki',adminWhatsapp:''};try{c=await config()}catch{}
 const links=NAV.map(([h,t,k])=>`<a href="${h}" class="${k===active?'text-cy':'text-slate-400 hover:text-white'} text-sm">${t}</a>`).join('');
 const auth=S?`<a href="${roleHome(S.user.role)}" class="btn-line rounded-lg px-4 py-2 text-sm">Dashboard</a><button id="lo" class="text-sm text-slate-400 hover:text-white">Keluar</button>`
  :`<a href="/login.html" class="text-sm text-slate-300 hover:text-white">Masuk</a><a href="/login.html#daftar" class="btn-grad rounded-lg px-4 py-2 text-sm">Daftar</a>`;
 $('#site-header').innerHTML=`<header class="sticky top-0 z-40 border-b border-white/10 bg-ink/80 backdrop-blur"><div class="mx-auto max-w-6xl px-5 py-3 flex items-center gap-6">
 <a href="/index.html" class="flex items-center gap-2.5 mr-auto"><img src="/assets/nadzzjoki.png" alt="Logo" class="h-9 w-9 rounded-full"><span class="font-display font-bold text-lg grad-text">${esc(c.brand)}</span></a>
 <nav class="hidden lg:flex gap-6">${links}</nav><div class="hidden lg:flex items-center gap-4">${auth}</div>
 <button id="mb" class="lg:hidden text-2xl" aria-label="Menu">☰</button></div>
 <div id="mm" class="hidden lg:hidden border-t border-white/10 px-5 py-4 grid gap-4">${links}<div class="flex items-center gap-4">${auth}</div></div></header>`;
 $('#mb').onclick=()=>$('#mm').classList.toggle('hidden');
 document.querySelectorAll('#lo').forEach(b=>b.onclick=()=>{setS(null);location.href='/index.html'});
 const wa=c.adminWhatsapp?waLink(c.adminWhatsapp,`Halo Admin ${c.brand}, saya butuh bantuan.`):'/cs.html';
 $('#site-footer').innerHTML=`<footer class="border-t border-white/10 mt-20"><div class="mx-auto max-w-6xl px-5 py-10 grid gap-8 md:grid-cols-3 text-sm">
 <div><div class="flex items-center gap-2.5 mb-3"><img src="/assets/nadzzjoki.png" class="h-8 w-8 rounded-full" alt=""><b class="font-display grad-text">${esc(c.brand)}</b></div><p class="text-slate-400">Platform jasa joki game dengan harga transparan, penugasan worker otomatis, dan pelacakan progres.</p></div>
 <div class="grid gap-2"><b>Menu</b>${NAV.map(([h,t])=>`<a class="text-slate-400 hover:text-cy" href="${h}">${t}</a>`).join('')}</div>
 <div class="grid gap-2 content-start"><b>Bantuan</b><a class="text-slate-400 hover:text-cy" target="_blank" rel="noopener" href="${wa}">WhatsApp Admin</a><a class="text-slate-400 hover:text-cy" href="/cs.html#tiket">Kirim Tiket</a><a class="text-slate-400 hover:text-cy" href="/cs.html#faq">FAQ</a><a class="text-slate-400 hover:text-cy" href="/syarat.html">Syarat &amp; Privasi</a></div></div>
 <div class="border-t border-white/10 py-4 text-center text-xs text-slate-500">© ${new Date().getFullYear()} ${esc(c.brand)}. Seluruh hak dilindungi.</div></footer>
 <a href="${wa}" target="_blank" rel="noopener" aria-label="WhatsApp" class="fixed bottom-5 right-5 z-50 rounded-full btn-grad bnc-idle px-5 py-3 text-sm shadow-lg">💬 Chat Admin</a>`}
