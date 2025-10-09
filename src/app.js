// src/app.js
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const getVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const rgba = (rgb, a = 1) => `rgba(${rgb},${a})`;

// Year
document.addEventListener('DOMContentLoaded', () => {
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
});

/* ---------- Dark Mode ---------- */
function setupDarkMode() {
  const html = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('theme');
  const isDark = saved ? saved === 'dark' : prefersDark;
  html.classList.toggle('dark', isDark);

  window.toggleDarkMode = () => {
    const nowDark = !html.classList.contains('dark');
    html.classList.toggle('dark', nowDark);
    localStorage.setItem('theme', nowDark ? 'dark' : 'light');
    if (window.myEcosystemChart) window.myEcosystemChart.destroy();
    // if chart already requested, re-render with new theme
    if (document.getElementById('ecosystemChart')?.dataset.rendered) {
      renderEcosystemChart();
    }
  };
}

/* ---------- Mobile Menu ---------- */
function setupMobileMenu() {
  const button = $('#mobile-menu-button');
  const panel = $('#mobile-menu-panel');
  const iconMenu = $('#icon-menu');
  const iconClose = $('#icon-close');
  if (!button || !panel) return;

  const toggleMenu = () => {
    const open = !panel.classList.toggle('hidden');
    iconMenu.classList.toggle('hidden', open);
    iconClose.classList.toggle('hidden', !open);
    button.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('overflow-hidden', open);
  };

  button.addEventListener('click', toggleMenu);
  $$('#mobile-menu-panel a').forEach((a) => a.addEventListener('click', () => {
    if (!panel.classList.contains('hidden')) toggleMenu();
  }));
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && !panel.classList.contains('hidden')) toggleMenu();
  });
}

/* ---------- Scroll Spy ---------- */
function setupScrollSpy() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');
  const scrollOffset = 64;
  const rootMarginValue = `-${scrollOffset}px 0px -${window.innerHeight - scrollOffset}px 0px`;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.id;
      const target = document.querySelector(`#desktop-menu a[href="#${id}"]`);
      if (entry.isIntersecting) {
        navLinks.forEach((l) => { l.classList.remove('active-scroll'); l.removeAttribute('aria-current'); });
        if (target) { target.classList.add('active-scroll'); target.setAttribute('aria-current', 'page'); }
      }
    });
  }, { root: null, rootMargin: rootMarginValue, threshold: 0 });

  sections.forEach((s) => { if (s.id !== 'top') observer.observe(s); });
  const initial = document.querySelector('#desktop-menu a[href="#product"]');
  if (initial) { initial.classList.add('active-scroll'); initial.setAttribute('aria-current', 'page'); }
}

/* ---------- Reveal on Scroll ---------- */
function setupRevealOnScroll() {
  const els = $$('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach((el) => obs.observe(el));
}

/* ---------- Sticky Mobile CTA ---------- */
function setupStickyCta() {
  const bar = $('#stickyCta');
  const contact = $('#contact');
  if (!bar || !contact) return;
  const show = () => bar.classList.remove('hidden');
  const hide = () => bar.classList.add('hidden');
  let shownOnce = false;

  window.addEventListener('scroll', () => {
    if (window.innerWidth >= 768) return;
    if (!shownOnce && window.scrollY > 100) { show(); shownOnce = true; }
  }, { passive: true });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) hide(); else if (shownOnce) show(); });
  }, { threshold: 0.1 });
  obs.observe(contact);
}

/* ---------- ROI Calculator ---------- */
function fmtCurrency(value, currency) {
  try { return new Intl.NumberFormat('en-GB', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value); }
  catch { return value.toLocaleString(); }
}
function roiState() {
  return {
    engineers: +$('#engineers').value,
    time: +$('#time').value,
    npt: +$('#npt').value,
    loadedCost: +$('#loadedCost').value,
    nptDayCost: +$('#nptDayCost').value,
    nptDays: +$('#nptDays').value,
    currency: $('#currency').value
  };
}
function applyRoiToControls(q) {
  const map = { engineers:'engineers', time:'time', npt:'npt', cost:'loadedCost', nptDay:'nptDayCost', days:'nptDays', cur:'currency' };
  Object.entries(map).forEach(([k,id]) => {
    if (q.get(k) !== null) {
      const el = document.getElementById(id);
      if (el) el.value = q.get(k);
    }
  });
}
function writeRoiToUrl(){
  const s = roiState();
  const p = new URLSearchParams({
    engineers: s.engineers, time: s.time, npt: s.npt,
    cost: s.loadedCost, nptDay: s.nptDayCost, days: s.nptDays, cur: s.currency
  });
  history.replaceState(null, '', `${location.pathname}?${p.toString()}#roi`);
}
export function updateROI(){
  const s = roiState();
  const timePct = s.time / 100;
  const nptPct = s.npt / 100;
  const engineerSavings = s.engineers * s.loadedCost * timePct;
  const nptSavings = s.nptDayCost * s.nptDays * nptPct;
  const total = engineerSavings + nptSavings;

  $('#engineersVal').textContent = s.engineers;
  $('#timeVal').textContent = Math.round(timePct*100) + '%';
  $('#nptVal').textContent = Math.round(nptPct*100) + '%';
  $('#engineerSavings').textContent = fmtCurrency(engineerSavings, s.currency);
  $('#nptSavings').textContent = fmtCurrency(nptSavings, s.currency);
  $('#total').textContent = fmtCurrency(total, s.currency);

  writeRoiToUrl();
}
function setupCsvDownload(){
  const btn = $('#downloadCsvBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const s = roiState();
    const engineerSavings = s.engineers * s.loadedCost * (s.time/100);
    const nptSavings = s.nptDayCost * s.nptDays * (s.npt/100);
    const total = engineerSavings + nptSavings;
    const rows = [
      ['Metric','Value'],
      ['Engineers', s.engineers],
      ['Engineering Time Reclaimed (%)', s.time],
      ['NPT Reduction (%)', s.npt],
      ['Loaded Cost / Engineer', s.loadedCost],
      ['NPT Cost / Day', s.nptDayCost],
      ['Operational Days / Year', s.nptDays],
      ['Currency', s.currency],
      ['Engineer Savings', Math.round(engineerSavings)],
      ['NPT Savings', Math.round(nptSavings)],
      ['Total Savings', Math.round(total)],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'welltegra-roi.csv';
    document.body.appendChild(a); a.click();
    a.remove(); URL.revokeObjectURL(url);
  });
}
function setupRoiShare(){
  const btn = document.getElementById('shareRoi');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      btn.textContent = 'Copied!';
      setTimeout(()=> btn.textContent = 'Copy link to this estimate', 1200);
    } catch {
      alert('Copy failed. You can copy the address bar URL.');
    }
  });
}

/* ---------- UTM capture ---------- */
function setupUtmCapture(){
  const form = document.getElementById('demoForm');
  if (!form) return;
  const params = new URLSearchParams(window.location.search);
  const fields = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
  fields.forEach(name => {
    const v = params.get(name);
    if (!v) return;
    let input = form.querySelector(`input[name="${name}"]`);
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      form.appendChild(input);
    }
    input.value = v;
  });
}

/* ---------- Lite YouTube ---------- */
function setupLiteYouTube(){
  document.querySelectorAll('.lite-yt').forEach(el => {
    const src = el.getAttribute('data-yt-src');
    el.addEventListener('click', () => {
      if (!src) return;
      const ifr = document.createElement('iframe');
      ifr.setAttribute('title', 'YouTube video player');
      ifr.setAttribute('allowfullscreen', '');
      ifr.setAttribute('loading', 'lazy');
      ifr.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      ifr.setAttribute('allow', 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      ifr.src = src + (src.includes('?') ? '&' : '?') + 'autoplay=1';
      el.innerHTML = '';
      el.appendChild(ifr);
    });
  });
}

/* ---------- Lazy-load Chart.js and render ---------- */
async function lazyLoadChartJs() {
  if (window.Chart) return Promise.resolve();
  await new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}
function setupChartLazyInit() {
  const canvas = document.getElementById('ecosystemChart');
  if (!canvas) return;
  const obs = new IntersectionObserver(async (entries) => {
    if (entries.some(e => e.isIntersecting)) {
      obs.disconnect();
      await lazyLoadChartJs();
      renderEcosystemChart();
      canvas.dataset.rendered = '1';
    }
  }, { rootMargin: '0px 0px -40% 0px' });
  obs.observe(canvas);
}
let myEcosystemChart;
function renderEcosystemChart() {
  const canvas = document.getElementById('ecosystemChart');
  if (!canvas || !window.Chart) return;
  if (myEcosystemChart) { myEcosystemChart.destroy(); }
  const ctx = canvas.getContext('2d');
  const axis = rgba(getVar('--wt-axis'));
  const grid = rgba(getVar('--wt-grid'));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  myEcosystemChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Data Capture', 'Specialized Analytics', '3D Subsurface Modeling', 'Usability', 'Integration'],
      datasets: [
        { label: 'WellView', data: [5,2,1,4,3], backgroundColor: rgba(getVar('--wt-accent'), .75), borderColor: rgba(getVar('--wt-accent'), 1), borderWidth: 1 },
        { label: 'Sapphire', data: [2,5,2,2,2], backgroundColor: 'rgba(107,114,128,0.75)', borderColor: 'rgba(107,114,128,1)', borderWidth: 1 },
        { label: 'Petrel',   data: [3,4,5,2,3], backgroundColor: 'rgba(11,11,11,0.75)', borderColor: 'rgba(11,11,11,1)', borderWidth: 1 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      animation: prefersReducedMotion ? false : { duration: 300 },
      scales: {
        y: { ticks: { color: axis, font: { weight: 500 } }, grid: { display: false } },
        x: {
          beginAtZero: true, min: 0, max: 5,
          ticks: { stepSize: 1, color: axis, callback: v => v === 0 ? '' : (v === 1 ? 'Low' : (v === 5 ? 'High' : v)) },
          grid: { color: grid }
        }
      },
      plugins: {
        legend: { labels: { color: axis } },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed.x;
              const band = val === 1 ? 'Low' : (val === 5 ? 'High' : String(val));
              return `${ctx.dataset.label}: ${val} (${band})`;
            }
          }
        }
      }
    }
  });
}

/* ---------- Form validation + local UX ---------- */
function setupForm() {
  const form = $('#demoForm');
  if (!form) return;

  const submitBtn = $('#submitBtn');
  const label = submitBtn.querySelector('.btn-label');
  const icon = submitBtn.querySelector('.btn-icon');
  const spinner = submitBtn.querySelector('.btn-spinner');
  const success = $('#formSuccess');

  function setError(id, show) {
    const p = form.querySelector(`[data-error-for="${id}"]`);
    if (p) p.classList.toggle('hidden', !show);
  }
  function validate() {
    const ids = ['name','email','company','interest'];
    let ok = true;
    ids.forEach(id => {
      const el = form.querySelector('#'+id);
      const valid = el && el.value && (id !== 'email' || el.validity.valid);
      setError(id, !valid);
      if (!valid) ok = false;
    });
    if (form.website && form.website.value) ok = false; // honeypot bot
    return ok;
  }

  form.addEventListener('submit', (e) => {
    if (!validate()) { e.preventDefault(); return; }
    // Local success UX (works on GitHub Pages). Replace with real action for Formspree if needed.
    e.preventDefault();
    success.classList.add('hidden');
    submitBtn.disabled = true; label.textContent = 'Sending...';
    icon.classList.add('hidden'); spinner.classList.remove('hidden');

    setTimeout(() => {
      submitBtn.disabled = false; label.textContent = 'Schedule Demo Session';
      icon.classList.remove('hidden'); spinner.classList.add('hidden');
      success.classList.remove('hidden'); form.reset();
    }, 900);
  });

  $$('input,select', form).forEach(el => {
    el.addEventListener('input', () => setError(el.id, false));
    el.addEventListener('blur', () => { if (!el.value) setError(el.id, true); });
  });
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  setupDarkMode();
  setupMobileMenu();
  setupScrollSpy();
  setupRevealOnScroll();
  setupStickyCta();
  setupLiteYouTube();
  setupUtmCapture();

  // ROI URL → controls
  applyRoiToControls(new URLSearchParams(location.search));
  // then compute + write URL
  updateROI();
  setupCsvDownload();
  setupRoiShare();

  setupChartLazyInit();
  setupForm();
});

// expose for range inputs
window.updateROI = updateROI;
