/* External media consent gate - YouTube embeds are not requested until
   External Media consent is enabled AND the visitor clicks a video. */
(() => {
  'use strict';

  const frames = Array.from(document.querySelectorAll('.video-frame iframe[data-src]'));
  if (!frames.length) return;

  const isAllowed = () => !!window.MPITIConsent?.hasConsent('externalMedia');

  function renderPlaceholder(frame) {
    const host = frame.parentElement;
    if (!host) return;
    frame.remove();
    host.querySelector('.external-media-placeholder')?.remove();

    const placeholder = document.createElement('div');
    placeholder.className = 'external-media-placeholder';
    placeholder.innerHTML = `
      <div class="external-media-placeholder-content">
        <span class="external-media-icon" aria-hidden="true">▶</span>
        <strong>YouTube video</strong>
        <span>External media is blocked until you allow it.</span>
        <button type="button" class="external-media-load">${isAllowed() ? 'Load video' : 'Allow External Media'}</button>
      </div>`;
    placeholder.querySelector('button').addEventListener('click', () => {
      if (!isAllowed()) {
        window.MPITIConsent?.openSettings();
        return;
      }
      loadFrame(host, frame.dataset.src, frame.title || 'YouTube video');
    });
    host.appendChild(placeholder);
  }

  function loadFrame(host, src, title) {
    if (!isAllowed()) return;
    host.querySelector('.external-media-placeholder')?.remove();
    if (host.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = title;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    host.appendChild(iframe);
  }

  function refresh() {
    frames.forEach(original => {
      const host = document.querySelector(`[data-external-media-host="${CSS.escape(original.dataset.hostId)}"]`);
      if (!host) return;
      if (!isAllowed()) {
        const live = host.querySelector('iframe');
        if (live) {
          const savedSrc = live.src;
          const title = live.title;
          live.remove();
          original.dataset.src = savedSrc;
          original.title = title;
        }
        renderPlaceholder(original.cloneNode(true));
      } else {
        const button = host.querySelector('.external-media-load');
        if (button) button.textContent = 'Load video';
      }
    });
  }

  // Replace every source iframe with a local placeholder before any third-party request.
  frames.forEach((frame, index) => {
    const host = frame.parentElement;
    host.dataset.externalMediaHost = String(index);
    frame.dataset.hostId = String(index);
    frame.removeAttribute('src');
    renderPlaceholder(frame);
  });

  window.addEventListener('mpiti:consentchange', refresh);
})();
