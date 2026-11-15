/* Cookie & Privacy Consent Manager - Maharana Pratap Pvt ITI Sehore
   Optional tracking is disabled until the visitor makes a choice. */
(() => {
  'use strict';

  const CONSENT_KEY = 'mpiti_cookie_consent_v1';
  const CONSENT_VERSION = 1;
  const MAX_AGE_DAYS = 180;
  const defaults = { necessary: true, analytics: false, preferences: false, externalMedia: false, marketing: false };

  const readConsent = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
      if (!saved || saved.version !== CONSENT_VERSION || !saved.timestamp) return null;
      if (Date.now() - saved.timestamp > MAX_AGE_DAYS * 86400000) return null;
      return { ...defaults, ...saved.categories, necessary: true };
    } catch (_) { return null; }
  };

  let consent = readConsent();
  let overlay;
  let panel;

  const hasConsent = category => category === 'necessary' || !!consent?.[category];
  window.MPITIConsent = {
    hasConsent,
    getConsent: () => consent ? { ...consent } : null,
    openSettings: () => showPanel(true)
  };

  const announce = () => window.dispatchEvent(new CustomEvent('mpiti:consentchange', { detail: { ...consent } }));

  const save = categories => {
    consent = { ...defaults, ...categories, necessary: true };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ version: CONSENT_VERSION, timestamp: Date.now(), categories: consent }));
    } catch (error) { console.warn('Could not save privacy preferences.', error); }
    closePanel();
    announce();
  };

  const addStyles = () => {
    if (document.getElementById('mpiti-consent-style')) return;
    const link = document.createElement('link');
    link.id = 'mpiti-consent-style'; link.rel = 'stylesheet'; link.href = '/cookie-consent.css';
    document.head.appendChild(link);
  };

  const makePanel = () => {
    if (overlay) return;
    overlay = document.createElement('div'); overlay.id = 'mpiti-consent-overlay'; overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.setAttribute('aria-labelledby','mpiti-consent-title');
    overlay.innerHTML = `
      <section id="mpiti-consent-panel">
        <button type="button" id="mpiti-consent-close" aria-label="Close privacy choices">×</button>
        <h2 id="mpiti-consent-title">We care about your privacy</h2>
        <p id="mpiti-consent-intro">This website uses cookies that are needed for the site to work properly and to understand how visitors use it. You can choose whether to allow optional features such as analytics and external media. Read our <a href="/pages/privacy-policy.html">Privacy Policy</a>.</p>
        <div id="mpiti-consent-details">
          <div class="mpiti-consent-row"><div><strong>Necessary</strong><small>Required for basic website operation and security.</small></div><input type="checkbox" checked disabled aria-label="Necessary always active"></div>
          <div class="mpiti-consent-row"><div><strong>Analytics</strong><small>Allows the website visitor counter to record visits.</small></div><input data-consent="analytics" type="checkbox"></div>
          <div class="mpiti-consent-row"><div><strong>Preferences</strong><small>Remembers optional choices. No preference tracking is currently enabled.</small></div><input data-consent="preferences" type="checkbox"></div>
          <div class="mpiti-consent-row"><div><strong>External Media</strong><small>Allows third-party media such as YouTube videos to load.</small></div><input data-consent="externalMedia" type="checkbox"></div>
          <div class="mpiti-consent-row"><div><strong>Marketing</strong><small>Advertising or marketing measurement. Currently not enabled.</small></div><input data-consent="marketing" type="checkbox"></div>
        </div>
        <div class="mpiti-consent-actions" id="mpiti-consent-main-actions">
          <button type="button" class="mpiti-consent-btn mpiti-consent-secondary" data-action="customize">Customize</button>
          <button type="button" class="mpiti-consent-btn mpiti-consent-secondary" data-action="reject">Reject All</button>
          <button type="button" class="mpiti-consent-btn mpiti-consent-primary" data-action="accept">Accept All</button>
        </div>
        <div class="mpiti-consent-actions" id="mpiti-consent-custom-actions" style="display:none">
          <button type="button" class="mpiti-consent-btn mpiti-consent-secondary" data-action="back">Back</button>
          <button type="button" class="mpiti-consent-btn mpiti-consent-primary" data-action="save">Save Preferences</button>
        </div>
      </section>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (!action) return;
      const panel = overlay.querySelector('#mpiti-consent-panel');
      if (action === 'customize') {
        panel.classList.add('mpiti-customizing');
        overlay.querySelector('#mpiti-consent-details').style.display = 'block';
        overlay.querySelector('#mpiti-consent-main-actions').style.display = 'none';
        overlay.querySelector('#mpiti-consent-custom-actions').style.display = 'grid';
        overlay.querySelector('#mpiti-consent-title').textContent = 'Customize your privacy';
        overlay.querySelector('#mpiti-consent-intro').textContent = 'Choose which optional categories you want to allow. Necessary storage is always active.';
      }
      if (action === 'back') {
        overlay.querySelector('#mpiti-consent-details').style.display = 'none';
        overlay.querySelector('#mpiti-consent-main-actions').style.display = 'grid';
        overlay.querySelector('#mpiti-consent-custom-actions').style.display = 'none';
        overlay.querySelector('#mpiti-consent-title').textContent = 'We care about your privacy';
        overlay.querySelector('#mpiti-consent-intro').innerHTML = 'This website uses cookies that are needed for the site to work properly and to understand how visitors use it. You can choose whether to allow optional features such as analytics and external media. Read our <a href="/pages/privacy-policy.html">Privacy Policy</a>.';
      }
      if (action === 'accept') save({ necessary:true, analytics:true, preferences:true, externalMedia:true, marketing:true });
      if (action === 'reject') save({ ...defaults });
      if (action === 'save') {
        const selected = { ...defaults };
        overlay.querySelectorAll('[data-consent]').forEach(input => selected[input.dataset.consent] = input.checked);
        save(selected);
      }
    });
    overlay.querySelector('#mpiti-consent-close').addEventListener('click', () => { if (consent) closePanel(); });
    overlay.addEventListener('click', e => { if (e.target === overlay) e.stopPropagation(); });
  };

  const showPanel = (settings = false) => {
    makePanel();
    overlay.style.display = 'flex';
    overlay.querySelectorAll('[data-consent]').forEach(input => input.checked = !!consent?.[input.dataset.consent]);
    overlay.querySelector('#mpiti-consent-details').style.display = settings ? 'block' : 'none';
    overlay.querySelector('#mpiti-consent-main-actions').style.display = settings ? 'none' : 'grid';
    overlay.querySelector('#mpiti-consent-custom-actions').style.display = settings ? 'grid' : 'none';
    overlay.querySelector('#mpiti-consent-title').textContent = settings ? 'Customize your privacy' : 'We care about your privacy';
    overlay.querySelector('#mpiti-consent-intro').innerHTML = settings ? 'Choose which optional categories you want to allow. Necessary storage is always active.' : 'This website uses cookies that are needed for the site to work properly and to understand how visitors use it. You can choose whether to allow optional features such as analytics and external media. Read our <a href="/pages/privacy-policy.html">Privacy Policy</a>.';
  };
  const closePanel = () => { if (overlay) overlay.remove(); overlay = null; };

  const init = () => {
    addStyles();
    // Footer link opens the preference panel; no persistent floating button is added.
    document.addEventListener('click', event => {
      if (event.target.closest('[data-cookie-settings]')) {
        event.preventDefault();
        showPanel(true);
      }
    });
    if (!consent) showPanel(false);
    else announce();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
