// Efek neon: garis pinggir elemen menyala dengan gradasi yang mengikuti posisi kursor (juga sentuhan)
const SEL='.glass,.card,.btn,.btn-grad,.btn-line,.tab',RANGE=240;
let px=-9999,py=-9999,raf=0;
function tag(){document.querySelectorAll(SEL).forEach(el=>{if(el.classList.contains('neon'))return;el.classList.add('neon');
 if(getComputedStyle(el).position==='static')el.style.position='relative'})}
function paint(){raf=0;tag();
 document.querySelectorAll('.neon').forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom<-RANGE||r.top>innerHeight+RANGE)return;
  const d=Math.hypot(Math.max(r.left-px,0,px-r.right),Math.max(r.top-py,0,py-r.bottom)),k=Math.max(0,1-d/RANGE);
  el.style.setProperty('--mx',(px-r.left).toFixed(1)+'px');el.style.setProperty('--my',(py-r.top).toFixed(1)+'px');el.style.setProperty('--o',(.18+.82*k).toFixed(3))})}
const sched=()=>{raf||=requestAnimationFrame(paint)};
addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;sched()},{passive:true});
addEventListener('scroll',sched,{passive:true});addEventListener('resize',sched);
document.addEventListener('mouseleave',()=>{px=py=-9999;sched()});
new MutationObserver(sched).observe(document.documentElement,{childList:true,subtree:true});
sched();
