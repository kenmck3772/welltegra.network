import {qs,on,countUp} from './common.js';
const supportsReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmall=()=>matchMedia('(max-width:768px)').matches;
function pickVideo(){const small=isSmall();const fast=navigator.connection&&(navigator.connection.effectiveType==='4g'||navigator.connection.downlink>3);
return small?'assets/hero1-720.mp4':(fast?'assets/hero1.mp4':'assets/hero1-720.mp4');}
let audioCtx,noiseNode,gainNode;
function startAmbience(){if(audioCtx)return;audioCtx=new (window.AudioContext||window.webkitAudioContext)();
const N=2*audioCtx.sampleRate,buf=audioCtx.createBuffer(1,N,audioCtx.sampleRate),out=buf.getChannelData(0);let last=0;
for(let i=0;i<N;i++){const w=Math.random()*2-1;out[i]=(last+(0.02*w))/1.02;last=out[i];}
noiseNode=audioCtx.createBufferSource();noiseNode.buffer=buf;noiseNode.loop=true;gainNode=audioCtx.createGain();gainNode.gain.value=0.02;
noiseNode.connect(gainNode).connect(audioCtx.destination);noiseNode.start();}
function stopAmbience(){if(noiseNode){try{noiseNode.stop()}catch{}}if(audioCtx){try{audioCtx.close()}catch{}}audioCtx=noiseNode=gainNode=null;}
export function initHero(){const el=qs('.hero');if(!el)return;const v=qs('video',el),mute=qs('#btn-mute',el),amb=qs('#btn-amb',el);
const s=document.createElement('source');s.src=pickVideo();s.type='video/mp4';v.appendChild(s);v.muted=true;v.playsInline=true;if(!supportsReducedMotion){v.play().catch(()=>{});}
on(mute,'click',()=>{v.muted=!v.muted;mute.classList.toggle('active',!v.muted);mute.textContent=v.muted?'Unmute':'Mute';});
mute.textContent='Mute';on(amb,'click',()=>{const onNow=amb.classList.toggle('active');onNow?startAmbience():stopAmbience();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)v.pause();else if(!supportsReducedMotion){v.play().catch(()=>{});}});
document.querySelectorAll('[data-kpi]').forEach(el=>{const val=Number(el.getAttribute('data-kpi'))||0;setTimeout(()=>countUp(el,val,1200),350)});}
window.addEventListener('DOMContentLoaded',initHero);