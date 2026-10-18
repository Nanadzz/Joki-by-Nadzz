import {$,esc,snap} from '/js/api.js';
import {mountLayout} from '/js/layout.js';
import {workerCard} from '/js/components.js';
mountLayout('worker');
const g0=$('#g').innerHTML; // opsi "Semua game" bawaan
snap(['/workers','/config'],([list,c])=>{
 const games=[...new Set(list.flatMap(w=>w.skills))];
 const sel=$('#g').value;$('#g').innerHTML=g0+games.map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join('');$('#g').value=sel;
 const draw=()=>{const t=$('#q').value.toLowerCase(),g=$('#g').value,a=$('#av').checked;
  const r=list.filter(w=>w.displayName.toLowerCase().includes(t)&&(!g||w.skills.includes(g))&&(!a||w.available));
  $('#cnt').textContent=`${r.length} worker ditemukan`;$('#grid').innerHTML=r.map(w=>workerCard(w,c)).join('')||'<p class="text-slate-400">Tidak ada worker yang cocok.</p>'};
 ['q','g','av'].forEach(id=>$('#'+id).oninput=draw);draw()}).catch(()=>{$('#grid').innerHTML='<p class="text-slate-400">Server belum tersambung.</p>'});
