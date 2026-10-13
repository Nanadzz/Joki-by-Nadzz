import {$,api,setS,getS,roleHome,safeNext,toast} from '/js/api.js';
import {mountLayout} from '/js/layout.js';
mountLayout('');
const q=new URLSearchParams(location.search),next=safeNext(q.get('next'));
let reg=false;
const fd=f=>Object.fromEntries(new FormData(f));
function mode(r){reg=r;$('#reg').classList.toggle('hidden',!r);$('#t1').classList.toggle('on',!r);$('#t2').classList.toggle('on',r);
 $('#sb').textContent=r?'Buat Akun':'Masuk';$('#ttl').textContent=r?'Buat akun baru':'Selamat datang kembali';
 $('#sub').textContent=r?'Gratis dan hanya butuh satu menit.':'Masuk untuk melanjutkan pesananmu.';$('#pw').autocomplete=r?'new-password':'current-password'}
$('#t1').onclick=()=>mode(false);$('#t2').onclick=()=>mode(true);
$('#eye').onclick=e=>{const p=$('#pw'),h=p.type==='password';p.type=h?'text':'password';e.target.textContent=h?'Sembunyi':'Lihat'};
$('#role').onchange=e=>$('#wkf').classList.toggle('hidden',e.target.value!=='BOOSTER');
if(location.hash==='#daftar'||q.get('role')==='BOOSTER'){mode(true);if(q.get('role')==='BOOSTER'){$('#role').value='BOOSTER';$('#wkf').classList.remove('hidden')}}
api('/catalog').then(c=>{$('#skills').innerHTML=c.games.map(g=>`<label class="chip cursor-pointer flex items-center gap-1.5"><input type="checkbox" value="${g.gameName.replace(/"/g,'&quot;')}"> ${g.gameName.replace(/</g,'&lt;')}</label>`).join('')}).catch(()=>{});
const S=getS();if(S)$('#sub').innerHTML=`Kamu sudah masuk sebagai <b>${S.user.email.replace(/</g,'&lt;')}</b>. <a class="text-cy underline" href="${roleHome(S.user.role)}">Buka dashboard</a>`;
$('#f').onsubmit=async e=>{e.preventDefault();const m=$('#msg');m.classList.add('hidden');
 if(!e.target.reportValidity())return;
 const b=fd(e.target);b.skills=[...document.querySelectorAll('#skills input:checked')].map(i=>i.value);
 $('#sb').disabled=true;
 try{const s=await api(reg?'/auth/register':'/auth/login',{body:b});setS(s);toast(s.pending?'Pendaftaran terkirim, menunggu persetujuan admin':'Berhasil masuk');
  setTimeout(()=>location.href=next||roleHome(s.user.role),s.pending?1400:400)}
 catch(x){m.textContent=x.message;m.classList.remove('hidden')}finally{$('#sb').disabled=false}};
