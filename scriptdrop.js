// ...existing code...
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('myDropdownBtn');
  const menu = document.getElementById('myDropdownMenu');

  if (btn && menu) {
    // Toggle dropdown without letting the click bubble up and close it immediately
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('show');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target)) menu.classList.remove('show');
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') menu.classList.remove('show');
    });
  }

  // -------- Alto Contraste --------
  const contrasteLink = document.getElementById('altoContraste');

  function applyContrast(enable) {
    if (!contrasteLink) return;
    if (enable) {
      document.body.classList.add('high-contrast');
      contrasteLink.setAttribute('aria-pressed', 'true');
      localStorage.setItem('highContrast', 'true');
    } else {
      document.body.classList.remove('high-contrast');
      contrasteLink.setAttribute('aria-pressed', 'false');
      localStorage.setItem('highContrast', 'false');
    }
  }

  // initialize contrast from storage
  const savedContrast = localStorage.getItem('highContrast') === 'true';
  applyContrast(savedContrast);

  if (contrasteLink) {
    contrasteLink.addEventListener('click', (e) => {
      e.preventDefault();
      const enabled = document.body.classList.contains('high-contrast');
      applyContrast(!enabled);
      if (menu) menu.classList.remove('show');
    });
  }

   // -------- Font scaling (robust, site-wide) --------
  const increaseBtn = document.getElementById('aumentarFonte');
  const decreaseBtn = document.getElementById('diminuirFonte');

  const STEP = 0.05;   // 5% per click
  const MIN_SCALE = 1.0;
  const MAX_SCALE = 1.12;

  function getSavedScale() {
    const v = parseFloat(localStorage.getItem('fontScale'));
    return isNaN(v) ? 1 : v;
  }

  function clampScale(s) {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(s * 100) / 100));
  }

  // Initialize original font sizes for every element relative to baseline (scale = 1).
  function initOriginalFontSizes() {
    const currentApplied = getSavedScale(); // if site already scaled, computed sizes reflect that
    const all = document.querySelectorAll('body *');
    all.forEach(el => {
      const tag = el.tagName && el.tagName.toLowerCase();
      // skip non-text/visual elements
      if (!tag) return;
      if (['img','svg','canvas','video','iframe','meter','progress','picture','source','link','meta','style','script','noscript'].includes(tag)) return;
      // skip elements that are not displayed
      const cs = window.getComputedStyle(el);
      if (!cs || cs.display === 'none' || cs.visibility === 'hidden') return;
      const fs = parseFloat(cs.fontSize);
      if (isNaN(fs) || fs === 0) return;
      // store baseline (unscaled) original size: computed / currentApplied
      if (!el.dataset.originalFontSize) {
        el.dataset.originalFontSize = String(fs / currentApplied);
      }
    });
  }

  // Apply scale using stored original sizes. Also adjust root font-size for rem-based rules.
  function applyFontScale(scale) {
    const s = clampScale(scale);
    // set root for rem/em based text
    document.documentElement.style.fontSize = `${s * 100}%`;

    // ensure original sizes were captured
    if (!document.body.dataset.originalsCaptured) {
      initOriginalFontSizes();
      document.body.dataset.originalsCaptured = 'true';
    }

    // apply scaled px sizes using stored originals
    const all = document.querySelectorAll('body *');
    all.forEach(el => {
      const orig = parseFloat(el.dataset.originalFontSize);
      if (isNaN(orig)) return;
      // avoid touching controls if you want: keep them by default, comment out next lines to skip form controls
      const tag = el.tagName && el.tagName.toLowerCase();
      if (['input','textarea','select','button'].includes(tag)) {
        // keep form controls sized by CSS but still allow root scaling via rems
        el.style.fontSize = '';
        return;
      }
      el.style.fontSize = (orig * s) + 'px';
    });

    localStorage.setItem('fontScale', String(s));
    updateFontAria(s);
  }

  function updateFontAria(s) {
    if (increaseBtn) increaseBtn.setAttribute('aria-disabled', String(s >= MAX_SCALE));
    if (decreaseBtn) decreaseBtn.setAttribute('aria-disabled', String(s <= MIN_SCALE));
  }

  // Initialize: capture originals relative to whatever scale was saved, then apply saved scale
  initOriginalFontSizes();
  applyFontScale(getSavedScale());

  if (increaseBtn) {
    increaseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = getSavedScale();
      applyFontScale(current + STEP);
      if (menu) menu.classList.remove('show');
    });
  }

  if (decreaseBtn) {
    decreaseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = getSavedScale();
      applyFontScale(current - STEP);
      if (menu) menu.classList.remove('show');
    });
  }

});