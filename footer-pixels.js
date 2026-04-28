(function () {
  function initFooterPixelName() {
    var node = document.querySelector('.footer-name');
    if (!node || node.dataset.pixelReady === 'true') return;
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;

    var text = (node.textContent || '').trim();
    if (!text) return;

    node.dataset.pixelReady = 'true';
    node.setAttribute('aria-label', text);

    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    node.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var particles = [];
    var mouse = { x: -9999, y: -9999, active: false };
    var raf = null;
    var dpr = 1;
    var particleSize = 4;

    function parseLetterSpacing(value, fontSize) {
      if (!value || value === 'normal') return 0;
      if (value.indexOf('em') > -1) return parseFloat(value) * fontSize;
      return parseFloat(value) || 0;
    }

    function measureSpacedText(context, value, spacing) {
      var width = 0;
      for (var i = 0; i < value.length; i += 1) {
        width += context.measureText(value[i]).width;
        if (i < value.length - 1) width += spacing;
      }
      return width;
    }

    function fillSpacedText(context, value, x, y, spacing) {
      var width = measureSpacedText(context, value, spacing);
      var cursor = x - width / 2;
      for (var i = 0; i < value.length; i += 1) {
        var glyph = value[i];
        var glyphWidth = context.measureText(glyph).width;
        context.fillText(glyph, cursor + glyphWidth / 2, y);
        cursor += glyphWidth + spacing;
      }
    }

    function buildParticles() {
      var rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';

      var computed = window.getComputedStyle(node);
      var fontSize = parseFloat(computed.fontSize) || Math.min(rect.width / 7, rect.height * 0.9);
      var fontFamily = computed.fontFamily || '"Doto", monospace';
      var letterSpacing = parseLetterSpacing(computed.letterSpacing, fontSize);

      var offscreen = document.createElement('canvas');
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      var off = offscreen.getContext('2d', { willReadFrequently: true });

      off.clearRect(0, 0, offscreen.width, offscreen.height);
      off.fillStyle = '#fff';
      off.textAlign = 'center';
      off.textBaseline = 'middle';
      off.font = '900 ' + (fontSize * dpr) + 'px ' + fontFamily;

      var spacing = letterSpacing * dpr;
      var maxWidth = offscreen.width * 0.985;
      var measured = measureSpacedText(off, text, spacing);
      if (measured > maxWidth) {
        fontSize *= maxWidth / measured;
        letterSpacing = parseLetterSpacing(computed.letterSpacing, fontSize);
        spacing = letterSpacing * dpr;
        off.font = '900 ' + (fontSize * dpr) + 'px ' + fontFamily;
      }

      fillSpacedText(off, text, offscreen.width / 2, offscreen.height * 0.52, spacing);

      var image = off.getImageData(0, 0, offscreen.width, offscreen.height).data;
      var step = Math.max(4, Math.round(Math.min(rect.width, 1180) / 210)) * dpr;
      particleSize = Math.max(2, Math.ceil(step * 0.72));
      particles = [];

      for (var y = 0; y < offscreen.height; y += step) {
        for (var x = 0; x < offscreen.width; x += step) {
          var alpha = image[(y * offscreen.width + x) * 4 + 3];
          if (alpha > 90) {
            particles.push({
              x: x,
              y: y,
              ox: x,
              oy: y,
              vx: (Math.random() - 0.5) * 0.45,
              vy: (Math.random() - 0.5) * 0.45,
              warm: Math.random()
            });
          }
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var radius = 132 * dpr;
      var radiusSq = radius * radius;
      var mx = mouse.x * dpr;
      var my = mouse.y * dpr;

      for (var i = 0; i < particles.length; i += 1) {
        var p = particles[i];
        var dx = p.x - mx;
        var dy = p.y - my;
        var distSq = dx * dx + dy * dy;

        if (mouse.active && distSq < radiusSq) {
          var dist = Math.sqrt(distSq) || 1;
          var force = (1 - dist / radius) * 2.9;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force + 0.18 * dpr;
        }

        p.vx += (p.ox - p.x) * 0.018;
        p.vy += (p.oy - p.y) * 0.018;
        p.vy += mouse.active ? 0.012 * dpr : 0;
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.warm > 0.88 ? 'rgba(255, 122, 26, 0.92)' : 'rgba(255, 255, 255, 0.92)';
        ctx.fillRect(p.x, p.y, particleSize, particleSize);
      }

      raf = window.requestAnimationFrame(draw);
    }

    function updateMouse(event) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.active = mouse.x >= 0 && mouse.x <= rect.width && mouse.y >= 0 && mouse.y <= rect.height;
    }

    function clearMouse() {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    }

    function rebuild() {
      buildParticles();
    }

    node.addEventListener('pointermove', updateMouse);
    node.addEventListener('pointerleave', clearMouse);
    window.addEventListener('resize', rebuild, { passive: true });

    var start = function () {
      buildParticles();
      node.classList.add('pixel-ready');
      if (!raf) draw();
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start);
    } else {
      window.setTimeout(start, 120);
    }
  }

  window.initFooterPixelName = initFooterPixelName;
})();
