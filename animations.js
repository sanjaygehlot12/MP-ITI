/* =====================================================
   animations.js  -  SIRF scroll animation (additive)
   - Purani script.js ko touch nahi karta.
   - Koi bhi existing class/ID/data change nahi karta.
   - Animation khatam hote hi apni classes hata deta hai,
     isliye cards ka hover effect pehle jaisa hi rahega.
   - Kuch bhi error aaye to saari hidden cheezein wapas
     dikha deta hai (website kabhi blank nahi hogi).
   ===================================================== */
(function () {
    'use strict';

    function showAll() {
        document.querySelectorAll('.mpa-hide').forEach(function (el) {
            el.classList.remove('mpa-hide');
        });
    }

    try {
        var reduce = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce || !('IntersectionObserver' in window)) return;

        /* Kin cheezon par animation lagani hai (sliders, header, hero ko chhua nahi gaya) */
        var SELECTORS = [
            '.dashboard-heading',
            '.dashboard-card',
            '.principal-message-card',
            '.job-updates-card',
            '.success-stories-heading',
            '.highlights-heading',
            '.highlight-card',
            '.whats-new-header',
            '.notice-search',
            '.notice-table-wrapper',
            '.testimonials-heading',
            '.recruiters-heading',
            '.home-faq-heading',
            '.home-faq-item',
            '.home-faq-view-all',
            '.footer-column'
        ];
        var joined = SELECTORS.join(',');

        /* Inke andar kuch animate nahi karna */
        var SKIP_INSIDE = '.main-header, .main-nav, .top-bar, .hero-slider, .latest-updates-bar';

        function finish(el) {
            el.classList.remove('mpa-in');
            el.style.removeProperty('--mpa-delay');
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                io.unobserve(el);

                el.classList.remove('mpa-hide');
                el.classList.add('mpa-in');

                var done = false;
                function end() { if (done) return; done = true; finish(el); }
                el.addEventListener('animationend', function (e) {
                    if (e.target === el && e.animationName === 'mpaFadeUp') end();
                });
                setTimeout(end, 1500);   /* safety: animationend na aaye to bhi classes hat jayein */
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

        var nodes = document.querySelectorAll(joined);
        Array.prototype.forEach.call(nodes, function (el) {
            if (el.closest(SKIP_INSIDE)) return;

            /* Pehle se koi animation chal rahi ho to chhodo */
            var cs = window.getComputedStyle(el);
            if (cs.animationName && cs.animationName !== 'none') return;

            /* Ek hi row ke cards thoda gap se aayein (max 4 step) */
            var idx = 0;
            var sibs = el.parentElement ? el.parentElement.children : [];
            for (var i = 0; i < sibs.length; i++) {
                if (sibs[i] === el) break;
                if (sibs[i].matches(joined)) idx++;
            }
            if (idx > 0) el.style.setProperty('--mpa-delay', Math.min(idx, 4) * 90 + 'ms');

            el.classList.add('mpa-hide');
            io.observe(el);
        });
    } catch (err) {
        showAll();
        if (window.console) console.warn('animations.js disabled:', err);
    }
})();
