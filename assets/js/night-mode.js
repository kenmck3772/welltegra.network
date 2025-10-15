// night-mode.js — idempotent, accessible, no duplicate globals
(function () {
  if (window.__WT_NIGHT_MODE_INIT__) return;
  window.__WT_NIGHT_MODE_INIT__ = true;

  // Screen-reader announcer
  function srAnnounce(msg) {
    let live = document.getElementById('wt-live');
    if (!live) {
      live = document.createElement('div');
      live.id = 'wt-live';
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('aria-atomic', 'true');
      Object.assign(live.style, {
        position: 'absolute', clip: 'rect(1px,1px,1px,1px)',
        clipPath: 'inset(50%)', height: '1px', width: '1px',
        overflow: 'hidden', whiteSpace: 'nowrap'
      });
      document.body.appendChild(live);
    }
    live.textContent = msg;
  }

  const STORAGE_KEY = 'wt-night';
  const html = document.documentElement;

  // Respect OS setting on first run
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const stored = localStorage.getItem(STORAGE_KEY);
  const initialOn = stored === null ? prefersDark : stored === '1';

  function apply(on) {
    html.classList.toggle('night', !!on);
    const btn = document.querySelector('[data-night-toggle]');
    if (btn) {
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? 'Switch to day mode' : 'Switch to night mode');
    }
  }

  function toggle() {
    const now = !html.classList.contains('night');
    localStorage.setItem(STORAGE_KEY, now ? '1' : '0');
    apply(now);
    srAnnounce(now ? 'Night mode on' : 'Night mode off');
  }

  function bind() {
    apply(initialOn);
    const btn = document.querySelector('[data-night-toggle]');
    if (!btn) return;
    btn.addEventListener('click', toggle);
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }
})();
