// night-mode.js — idempotent, accessible, no duplicate globals
(function () {
  if (window.__WT_NIGHT_MODE_INIT__) return;
  window.__WT_NIGHT_MODE_INIT__ = true;

  // Util: announce to screen readers
  function srAnnounce(msg) {
    let live = document.getElementById('wt-live');
    if (!live) {
      live = document.createElement('div');
      live.id = 'wt-live';
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('aria-atomic', 'true');
      live.style.position = 'absolute';
      live.style.clip = 'rect(1px, 1px, 1px, 1px)';
      live.style.clipPath = 'inset(50%)';
      live.style.height = '1px';
      live.style.width = '1px';
      live.style.overflow = 'hidden';
      live.style.whiteSpace = 'nowrap';
      document.body.appendChild(live);
    }
    live.textContent = msg;
  }

  const STORAGE_KEY = 'wt-night';
  const html = document.documentElement;

  // Respect user’s system preference the first time
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

  // Initialize
  apply(initialOn);

  // Click + keyboard toggle
  function toggle() {
    const now = !html.classList.contains('night');
    localStorage.setItem(STORAGE_KEY, now ? '1' : '0');
    apply(now);
    srAnnounce(now ? 'Night mode on' : 'Night mode off');
  }

  // Bind once
  const bind = () => {
    const btn = document.querySelector('[data-night-toggle]');
    if (!btn) return;
    btn.addEventListener('click', toggle);
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }
})();
