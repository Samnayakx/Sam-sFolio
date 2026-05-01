(function () {
  'use strict';

  /* ── Easing ──────────────────────────────────────── */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  /* ── Counter animation ───────────────────────────── */
  function runCounter(el) {
    var raw    = el.dataset.count;
    var isFloat = raw.indexOf('.') !== -1;
    var target  = parseFloat(raw);
    var suffix  = el.dataset.suffix || '';
    var prefix  = el.dataset.prefix || '';
    var dur     = 1400;
    var start   = null;

    function tick(ts) {
      if (!start) start = ts;
      var p  = Math.min((ts - start) / dur, 1);
      var v  = target * easeOutCubic(p);
      el.textContent = prefix + (isFloat ? v.toFixed(1) : Math.round(v)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var countObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      runCounter(e.target);
      countObs.unobserve(e.target);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('[data-count]').forEach(function (el) {
    countObs.observe(el);
  });

  /* ── Tooltip ─────────────────────────────────────── */
  var tip = document.createElement('div');
  tip.className = 'dv-tooltip';
  document.body.appendChild(tip);

  function moveTip(x, y) {
    var tw = tip.offsetWidth;
    var th = tip.offsetHeight;
    var vw = window.innerWidth;
    tip.style.left = Math.min(x + 14, vw - tw - 12) + 'px';
    tip.style.top  = (y - th - 10) + 'px';
  }

  document.querySelectorAll('[data-tip]').forEach(function (el) {
    el.addEventListener('mouseenter', function (e) {
      tip.textContent    = el.dataset.tip;
      tip.style.opacity  = '1';
      tip.style.transform = 'translateY(0)';
      moveTip(e.clientX, e.clientY);
    });
    el.addEventListener('mousemove', function (e) {
      moveTip(e.clientX, e.clientY);
    });
    el.addEventListener('mouseleave', function () {
      tip.style.opacity  = '0';
      tip.style.transform = 'translateY(5px)';
    });
  });

  /* ── Finding tabs ────────────────────────────────── */
  document.querySelectorAll('.finding-tabs').forEach(function (tabs) {
    var spans = tabs.querySelectorAll('span');
    spans.forEach(function (tab, i) {
      if (i === 0) tab.classList.add('tab-active');
      tab.addEventListener('click', function () {
        spans.forEach(function (s) { s.classList.remove('tab-active'); });
        tab.classList.add('tab-active');
      });
    });
  });

  /* ── Stat chart label axis ticks ─────────────────── */
  document.querySelectorAll('.stat-chart').forEach(function (chart) {
    var header = document.createElement('div');
    header.className = 'stat-axis';
    header.innerHTML =
      '<span></span>' +
      '<div class="stat-axis-scale">' +
        '<span>0</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>' +
      '</div>' +
      '<span></span>';
    chart.insertBefore(header, chart.firstChild);
  });

})();
