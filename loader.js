(function () {
  var loader  = document.getElementById('site-loader');
  var canvas  = document.getElementById('ldr-canvas');
  var logo    = document.getElementById('ldr-logo');
  var content = document.getElementById('site-content');
  if (!loader) return;

  var params = new URLSearchParams(window.location.search);
  if (params.get('skipLoader') === '1') {
    if (content) content.classList.add('ldr-revealed');
    loader.remove();
    params.delete('skipLoader');
    var cleanUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
    window.history.replaceState(null, '', cleanUrl);
    return;
  }

  /* ── Dot config ─────────────────────────────────────────────── */
  var DOT_COUNT = 420;
  var DOT_R     = 1.2;

  /* ── Timing ──────────────────────────────────────────────────── */
  var START_DELAY = 280;   /* ms before dots begin   */
  var BLOOM_DUR   = 2100;  /* ms to reach edges      */

  /* ── State ───────────────────────────────────────────────────── */
  var W, H, cx, cy, maxR, dots;
  var startTime = null;
  var done      = false;
  var ctx       = canvas ? canvas.getContext('2d') : null;

  function buildDots() {
    W    = canvas.width  = window.innerWidth;
    H    = canvas.height = window.innerHeight;
    cx   = W / 2;
    cy   = H / 2;
    maxR = Math.sqrt(cx * cx + cy * cy);
    dots = [];
    for (var i = 0; i < DOT_COUNT; i++) {
      var px = Math.random() * W;
      var py = Math.random() * H;
      var dx = px - cx;
      var dy = py - cy;
      dots.push({ x: px, y: py, dist: Math.sqrt(dx * dx + dy * dy) });
    }
    dots.sort(function (a, b) { return a.dist - b.dist; });
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function reveal() {
    if (done) return;
    done = true;
    if (content) content.classList.add('ldr-revealed');
    loader.classList.add('ldr-done');
    setTimeout(function () { loader.remove(); }, 600);
  }

  function draw(now) {
    if (done) return;
    if (!startTime) startTime = now;

    var raw    = (now - startTime - START_DELAY) / BLOOM_DUR;
    var bloomT = Math.max(0, Math.min(raw, 1));
    var bloomE = easeInOut(bloomT);

    /* Reveal radius grows from 0 to just past the farthest corner */
    var revealR  = bloomE * (maxR * 1.1);
    var fadeZone = maxR * 0.22;

    if (ctx) {
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < dots.length; i++) {
        var d    = dots[i];
        var diff = revealR - d.dist;
        if (diff <= 0) continue;

        var edge  = Math.min(diff / fadeZone, 1);
        var alpha = edge * (0.08 + bloomE * 0.92);

        ctx.beginPath();
        ctx.arc(d.x, d.y, DOT_R, 0, 6.2832);
        ctx.fillStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
        ctx.fill();
      }
    }

    /* Fade logo out as dots brighten near center */
    if (logo && bloomT > 0.55) {
      logo.style.opacity = Math.max(0, 1 - (bloomT - 0.55) / 0.20).toFixed(3);
    }

    if (bloomT >= 1) {
      reveal();
      return;
    }

    requestAnimationFrame(draw);
  }

  /* Safety net — always reveal after max possible duration + buffer */
  setTimeout(reveal, START_DELAY + BLOOM_DUR + 400);

  if (canvas && ctx) {
    window.addEventListener('resize', buildDots);
    buildDots();
  }

  requestAnimationFrame(draw);
})();
