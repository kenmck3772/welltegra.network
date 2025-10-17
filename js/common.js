export const qs=(s,e=document)=>e.querySelector(s);
export const qsa=(s,e=document)=>[...e.querySelectorAll(s)];
export const on=(e,ev,fn)=>e.addEventListener(ev,fn);
export function countUp(el,end,dur=1200){const t0=performance.now();const step=(t)=>{const p=Math.min(1,(t-t0)/dur);const v=Math.floor(end*(p*(2-p)));el.textContent=v.toLocaleString();if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)}