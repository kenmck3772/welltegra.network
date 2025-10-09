// Helpers
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const getVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const rgba = (rgb, a = 1) => `rgba(${rgb},${a})`;

// Year
$('#year').textContent = new Date().getFullYear();

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
    renderEcosystemChart();
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
    timePct: +$('#time').value / 100,
    nptPct: +$('#npt').value / 100,
    loadedCost: +$('#loadedCost').value,
    nptDayCost: +$('#nptDayCost').value,
    nptDays: +$('#nptDays').value,
    currency: $('#currency').value
  };
}
export function updateROI(){
  const s = roiState();
  const engineerSavings = s.engineers * s.loadedCost * s.timePct;
  const nptSavings = s.nptDayCost * s.nptDays * s.nptPct;
  const total = engineerSavings + nptSavings;

  $('#engineersVal').textContent = s.engineers;
  $('#timeVal').textContent = Math.round(s.timePct*100) + '%';
  $('#nptVal').textContent = Math.round(s.nptPct*100) + '%';

  $('#engineerSavings').textContent = fmtCurrency(engineerSavings, s.currency);
  $('#nptSavings').textContent = fmtCurrency(nptSavings, s.currency);
  $('#total').textContent = fmtCurrency(total, s.currency);
}
function setupCsvDownload(){
  const btn = $('#downloadCsvBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const s = roiState();
    const engineerSavings = s.engineers * s.loadedCost * s.timePct;
    const nptSavings = s.nptDayCost * s.nptDays * s.nptPct;
    const total = engineerSavings + nptSavings;
    const rows = [
      ['Metric','Value'],
      ['Engineers', s.engineers],
      ['Engineering Time Reclaimed (%)', Math.round(s.timePct*100)],
      ['NPT Reduction (%)', Math.round(s.nptPct*100)],
      ['Loaded Cost / Engineer', s.loadedCost],
      ['NPT Cost / Day', s.nptDayCost],
      ['Operational Days / Year', s.nptDays],
      ['Currency', s.currency],
      ['Engineer Savings', engineerSavings.toFixed(0)],
      ['NPT Savings', nptSavings.toFixed(0)],
      ['Total Savings', total.toFixed(0)],
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

/* ---------- Chart.js — Grouped Horizontal Bar ---------- */
let myEcosystemChart;
function renderEcosystemChart() {
  const canvas = $('#ecosystemChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const axis = rgba(getVar('--wt-axis'));
  const grid = rgba(getVar('--wt-grid'));

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

/* ---------- Form validation + UX ---------- */
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
    // Honeypot
    if (form.website && form.website.value) ok = false;
    return ok;
  }

  form.addEventListener('submit', (e) => {
    if (!validate()) { e.preventDefault(); return; }
    // Let Netlify handle submission if configured; still show UX spinner briefly
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

  updateROI();
  setupCsvDownload();

  renderEcosystemChart();
  setupForm();
});

// expose for range inputs
window.updateROI = updateROI;
