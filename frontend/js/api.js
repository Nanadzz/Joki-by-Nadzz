// Util bersama: sesi, fetch API (auto refresh token), toast, escape HTML, tautan WhatsApp
export const KEY='nadzz';
export const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
export const rp=n=>'Rp '+Number(n||0).toLocaleString('id-ID');
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const getS=()=>{try{return JSON.parse(localStorage.getItem(KEY))}catch{return null}};
export const setS=s=>s?localStorage.setItem(KEY,JSON.stringify(s)):localStorage.removeItem(KEY);
export const waLink=(n,t='')=>`https://wa.me/${n}${t?`?text=${encodeURIComponent(t)}`:''}`;
export const roleHome=r=>r==='ADMIN'?'/app.html#/admin':r==='BOOSTER'?'/app.html#/booster':'/app.html#/orders';
export const safeNext=n=>n&&n.startsWith('/')&&!n.startsWith('//')?n:null;
export function toast(msg,type='ok'){let b=$('#toast-box');if(!b){b=document.createElement('div');b.id='toast-box';document.body.append(b)}
 const t=document.createElement('div');t.className='toast '+(type==='err'?'err':'');t.textContent=msg;b.append(t);setTimeout(()=>t.remove(),3200)}
export async function api(path,{method,body,headers,retry}={}){
 const S=getS();
 const r=await fetch('/api'+path,{method:method||(body?'POST':'GET'),headers:{...(body?{'Content-Type':'application/json'}:{}),...(S?{Authorization:'Bearer '+S.accessToken}:{}),...headers},body:body?JSON.stringify(body):undefined});
 if(r.status===401&&S?.refreshToken&&!retry){
  const rr=await fetch('/api/auth/refresh',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:S.refreshToken})});
  if(rr.ok){setS(await rr.json());return api(path,{method,body,headers,retry:1})}setS(null)}
 const d=await r.json().catch(()=>null);if(!r.ok)throw new Error(d?.error||(d?'Terjadi kesalahan':'Server belum tersambung, coba lagi nanti atau hubungi admin'));return d??{}}
// Render cache: data publik terakhir disimpan di localStorage. Kunjungan berikutnya langsung tergambar dari cache
// (tanpa menunggu jaringan), lalu halaman diperbarui diam-diam hanya jika datanya berubah. render(dataList, dariCache)
export async function snap(paths,render){
 const keys=paths.map(p=>'nz:v1:'+p),raw=keys.map(k=>{try{return localStorage.getItem(k)}catch{return null}});let had=false;
 if(raw.every(Boolean)){try{render(raw.map(x=>JSON.parse(x)),true);had=true}catch{}}
 let fresh;try{fresh=await Promise.all(paths.map(p=>api(p)))}catch(e){if(had)return;throw e} // jaringan gagal tapi cache sudah tampil: biarkan
 const js=fresh.map(d=>JSON.stringify(d));if(had&&js.every((j,i)=>j===raw[i]))return fresh;
 js.forEach((j,i)=>{try{localStorage.setItem(keys[i],j)}catch{}});render(fresh,false);return fresh}
export const DEFAULT_WA='6285656317710'; // cadangan jika server belum tersambung; format wa.me tanpa + dan tanpa 0 di depan
let cfg;export const config=()=>cfg??=api('/config').catch(()=>({brand:'Nadzz Joki',adminWhatsapp:DEFAULT_WA}));
