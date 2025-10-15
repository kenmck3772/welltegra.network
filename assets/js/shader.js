// screen-shader.js — idempotent, accessible blue-light shader
(function () {
  if (window.__WT_SCREEN_SHADER_INIT__) return;
  window.__WT_SCREEN_SHADER_INIT__ = true;

  const STORAGE_KEY = 'wt-shader';
  const overlayId = 'wt-screen-shader';

  function ensureOverlay() {
    let ov = document.getElementById(overlayId);
    if (!ov) {
      ov = document.createElement('div');
      ov.id = overlayId;
      Object.assign(ov.style, {
        position: 'fixed',
        inset: '0',
        pointerEvents: 'none',
        background: 'transparent',
        mixBlendMode: 'multiply',
        zIndex: '2147483646' // just below modals/tooltips
      });
      document.body.appendChild(ov);
    }
    return ov;
  }

  function setStrength(val) {
    // val: 0..100
    const ov = ensureOverlay();
    const n = Math.max(0, Math.min(100, Number(val) || 0));
    ov.style.background = n ? `rgba(255, 140, 0, ${0.0025 * n})` : 'transparent';
    const ctrl = document.querySelector('[data-shader-range]');
    if (ctrl) ctrl.value = String(n);
    const switcher = document.querySelector('[data-shader-toggle]');
    if (switcher) switcher.setAttribute('aria-pressed', n > 0 ? 'true' : 'false');
    localStorage.setItem(STORAGE_KEY, String(n));
  }

  // Screen reader announcement
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

  function bind() {
    const stored = Number(localStorage.getItem(STORAGE_KEY) || '0');
    setStrength(stored);

    const toggleBtn = document.querySelector('[data-shader-toggle]');
    const range = document.querySelector('[data-shader-range]');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const current = Number(localStorage.getItem(STORAGE_KEY) || '0');
        const next = current > 0 ? 0 : 40; // default to a comfy value
        setStrength(next);
        srAnnounce(next > 0 ? `Screen shader set to ${next} percent` : 'Screen shader off');
      });
      toggleBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleBtn.click(); }
      });
      toggleBtn.setAttribute('aria-label', 'Toggle screen shader');
      toggleBtn.setAttribute('aria-pressed', stored > 0 ? 'true' : 'false');
    }

    if (range) {
      range.addEventListener('input', (e) => {
        const v = Number(e.target.value || 0);
        setStrength(v);
      });
      range.setAttribute('aria-label', 'Adjust screen shader intensity');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }
})();
