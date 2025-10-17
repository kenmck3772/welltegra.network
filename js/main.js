
async function getJSON(path){ const r = await fetch(path); if(!r.ok) throw new Error('Failed '+path); return r.json(); }
function fmt(n){ return new Intl.NumberFormat().format(n); }
function qs(sel, el=document){ return el.querySelector(sel); }
function qsa(sel, el=document){ return [...el.querySelectorAll(sel)]; }
