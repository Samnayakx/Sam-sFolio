/*!
 * hero-webgl.js — WebGL bulge distortion for portfolio hero
 * Supports smooth crossfade between dark/light textures.
 */
(function () {
  'use strict';

  /* ─── Vertex shader ─────────────────────────────────────────── */
  var VERT = [
    'attribute vec2 a_pos;',
    'varying   vec2 vUv;',
    'void main() {',
    '  vUv         = a_pos * 0.5 + 0.5;',
    '  gl_Position = vec4(a_pos, 0.0, 1.0);',
    '}'
  ].join('\n');

  /* ─── Fragment shader ────────────────────────────────────────── */
  var FRAG = [
    'precision highp float;',
    'uniform sampler2D uTexture;',
    'uniform sampler2D uTexture2;',
    'uniform float     uBlend;',
    'uniform vec2      uResolution;',
    'uniform vec2      uTexSize;',
    'uniform vec2      uTexSize2;',
    'uniform vec2      uMouse;',
    'uniform float     uStrength;',
    'uniform float     uRadius;',
    'varying vec2 vUv;',
    '',
    'vec2 coverUV(vec2 uv, vec2 res, vec2 tex) {',
    '  float ra = res.x / res.y;',
    '  float ta = tex.x / tex.y;',
    '  vec2  s  = (ra > ta) ? vec2(1.0, ta / ra) : vec2(ra / ta, 1.0);',
    '  return (uv - 0.5) * s + 0.5;',
    '}',
    '',
    'void main() {',
    '  vec2 texSize = mix(uTexSize, uTexSize2, uBlend);',
    '  vec2 texUV   = coverUV(vUv,    uResolution, texSize);',
    '  vec2 mouseUV = coverUV(uMouse, uResolution, texSize);',
    '  float aspect = uResolution.x / uResolution.y;',
    '  vec2  diff   = texUV - mouseUV;',
    '  float dist   = length(diff * vec2(aspect, 1.0));',
    '  float weight = exp(-(dist * dist) / (uRadius * uRadius));',
    '  float edgeDist = min(min(texUV.x, 1.0 - texUV.x), min(texUV.y, 1.0 - texUV.y));',
    '  float edgeFade = smoothstep(0.0, 0.15, edgeDist);',
    '  vec2  distUV = clamp(texUV - diff * weight * uStrength * edgeFade, 0.001, 0.999);',
    '  vec4  col0   = texture2D(uTexture,  distUV);',
    '  vec4  col1   = texture2D(uTexture2, distUV);',
    '  vec4  color  = mix(col0, col1, uBlend);',
    '  float fade   = smoothstep(0.42, 0.0, vUv.y);',
    '  color.rgb    = mix(color.rgb, vec3(0.0), fade * 0.72);',
    '  gl_FragColor = color;',
    '}'
  ].join('\n');

  /* ─── GL helpers ─────────────────────────────────────────────── */
  function compileShader(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('[hero-webgl] shader:', gl.getShaderInfoLog(s));
      gl.deleteShader(s); return null;
    }
    return s;
  }

  function buildProgram(gl) {
    var v = compileShader(gl, gl.VERTEX_SHADER,   VERT);
    var f = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!v || !f) return null;
    var p = gl.createProgram();
    gl.attachShader(p, v); gl.attachShader(p, f);
    gl.linkProgram(p);
    gl.deleteShader(v); gl.deleteShader(f);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('[hero-webgl] link:', gl.getProgramInfoLog(p)); return null;
    }
    return p;
  }

  function makeTexture(gl) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([10, 10, 10, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  }

  function uploadImage(gl, tex, source) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  /*
   * safeUpload — tries direct upload first, then bridges through a 2D canvas.
   * The canvas-bridge bypasses the WebGL cross-origin taint check that fires
   * on file:// URLs where crossOrigin='anonymous' can't be satisfied.
   * Returns the image dimensions [w, h] on success, null on failure.
   */
  function safeUpload(gl, tex, img) {
    /* Direct upload (works when crossOrigin='anonymous' was honoured) */
    try {
      uploadImage(gl, tex, img);
      return [img.naturalWidth || img.width, img.naturalHeight || img.height];
    } catch (e) { /* SecurityError — fall through to bridge */ }

    /* Canvas bridge: draw into a same-origin 2D canvas, upload that */
    try {
      var w = img.naturalWidth  || img.width  || 1;
      var h = img.naturalHeight || img.height || 1;
      var c   = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0);
      uploadImage(gl, tex, c);
      return [w, h];
    } catch (e2) {
      console.warn('[hero-webgl] texture upload failed:', e2);
      return null;
    }
  }

  /*
   * loadImg — tries crossOrigin='anonymous' first (required for deployed HTTP).
   * If that fails (e.g. file:// protocol can't satisfy CORS), retries without
   * the attribute so the image at least loads for the canvas-bridge path.
   */
  function loadImg(src, cb, errCb) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () { cb(img); };
    img.onerror = function () {
      /* CORS load failed — retry without crossOrigin for file:// serving */
      var img2 = new Image();
      img2.onload  = function () { cb(img2); };
      img2.onerror = function () {
        console.warn('[hero-webgl] failed to load:', src);
        if (errCb) errCb();
      };
      img2.src = src + (src.indexOf('?') === -1 ? '?' : '&') + '_nc=' + Date.now();
    };
    img.src = src;
  }

  /* ─── Core ───────────────────────────────────────────────────── */
  function HeroBulge(canvas, darkSrc, lightSrc, opts) {
    var STRENGTH    = opts.strength    !== undefined ? opts.strength    : 0.05;
    var RADIUS      = opts.radius      !== undefined ? opts.radius      : 0.22;
    var LERP        = opts.lerp        !== undefined ? opts.lerp        : 0.06;
    var BLEND_SPEED = 0.04;

    canvas.style.visibility = 'hidden';
    canvas.style.display    = 'block';

    var gl;
    try { gl = canvas.getContext('webgl2') || canvas.getContext('webgl'); }
    catch(e) { gl = null; }

    if (!gl) {
      var fresh = canvas.cloneNode(true);
      fresh.style.visibility = 'hidden';
      fresh.style.display    = 'block';
      canvas.parentNode.replaceChild(fresh, canvas);
      canvas = fresh;
      try { gl = canvas.getContext('webgl2') || canvas.getContext('webgl'); }
      catch(e) { gl = null; }
    }

    if (!gl) {
      canvas.style.display = 'none';
      canvas.style.visibility = '';
      console.warn('[hero-webgl] WebGL unavailable — showing fallback');
      return null;
    }

    var prog = buildProgram(gl);
    if (!prog) { canvas.style.display = 'none'; canvas.style.visibility = ''; return null; }

    /* Quad */
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    var posLoc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    /* Uniforms */
    var uRes   = gl.getUniformLocation(prog, 'uResolution');
    var uTS    = gl.getUniformLocation(prog, 'uTexSize');
    var uTS2   = gl.getUniformLocation(prog, 'uTexSize2');
    var uMse   = gl.getUniformLocation(prog, 'uMouse');
    var uStr   = gl.getUniformLocation(prog, 'uStrength');
    var uRad   = gl.getUniformLocation(prog, 'uRadius');
    var uTex   = gl.getUniformLocation(prog, 'uTexture');
    var uTex2  = gl.getUniformLocation(prog, 'uTexture2');
    var uBlend = gl.getUniformLocation(prog, 'uBlend');

    /* Textures */
    var tex0 = makeTexture(gl);
    var tex1 = makeTexture(gl);
    var tw0 = 1, th0 = 1, tw1 = 1, th1 = 1;
    var loaded0 = false, loaded1 = false;

    function showCanvas() {
      canvas.style.visibility = '';
      var wrap = canvas.parentElement;
      if (!wrap) return;
      wrap.querySelectorAll('.hero-bg-img').forEach(function (el) {
        el.style.display = 'none';
      });
      var ov = wrap.querySelector('.hero-bg-overlay');
      if (ov) ov.style.opacity = '0';
    }

    function showFallback() {
      canvas.style.display = 'none';
      canvas.style.visibility = '';
      var wrap = canvas.parentElement;
      if (!wrap) return;
      wrap.querySelectorAll('.hero-bg-img').forEach(function (el) {
        el.style.display = '';
      });
      var ov = wrap.querySelector('.hero-bg-overlay');
      if (ov) ov.style.opacity = '';
    }

    loadImg(darkSrc, function (img) {
      var dims = safeUpload(gl, tex0, img);
      if (!dims) { showFallback(); return; }
      tw0 = dims[0]; th0 = dims[1];
      loaded0 = true;
      if (loaded0 && loaded1) showCanvas();
    }, showFallback);

    loadImg(lightSrc || darkSrc, function (img) {
      var dims = safeUpload(gl, tex1, img);
      if (!dims) { showFallback(); return; }
      tw1 = dims[0]; th1 = dims[1];
      loaded1 = true;
      if (loaded0 && loaded1) showCanvas();
    }, showFallback);

    /* State */
    var tX = 0.5, tY = 0.5, cX = 0.5, cY = 0.5;
    var blendTarget  = 0.0;
    var blendCurrent = 0.0;
    var rafId = null, alive = true;
    var heroEl = document.querySelector('.hero');

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.round(window.innerWidth  * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function tick() {
      if (!alive) return;
      cX += (tX - cX) * LERP;
      cY += (tY - cY) * LERP;
      blendCurrent += (blendTarget - blendCurrent) * BLEND_SPEED;

      gl.useProgram(prog);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex0);
      gl.uniform1i(uTex, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, tex1);
      gl.uniform1i(uTex2, 1);
      gl.uniform1f(uBlend, blendCurrent);
      gl.uniform2f(uRes,   canvas.width, canvas.height);
      gl.uniform2f(uTS,    tw0 || 1, th0 || 1);
      gl.uniform2f(uTS2,   tw1 || 1, th1 || 1);
      gl.uniform2f(uMse,   cX, cY);
      gl.uniform1f(uStr,   STRENGTH);
      gl.uniform1f(uRad,   RADIUS);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(tick);
    }

    function onMouseMove(e) {
      var rect = heroEl ? heroEl.getBoundingClientRect()
                        : { left:0, top:0, width: window.innerWidth, height: window.innerHeight };
      tX = Math.max(0, Math.min(1,       (e.clientX - rect.left) / rect.width));
      tY = Math.max(0, Math.min(1, 1.0 - (e.clientY - rect.top)  / rect.height));
    }
    function onMouseLeave() { tX = 0.5; tY = 0.5; }

    if (heroEl) {
      heroEl.addEventListener('mousemove',  onMouseMove,  { passive: true });
      heroEl.addEventListener('mouseleave', onMouseLeave);
    }
    window.addEventListener('resize', function () { resize(); });

    /* ─── Gyroscope parallax (mobile) ───────────────────────────── */
    var gyroActive = false;
    var baseGamma  = null;
    var baseBeta   = null;
    var GYRO_RANGE = 18; // degrees of tilt = full 0→1 travel

    function onDeviceOrientation(e) {
      if (e.gamma === null || e.gamma === undefined) return;
      var g = e.gamma;
      var b = (e.beta  !== null && e.beta  !== undefined) ? e.beta  : 0;

      // Calibrate on first valid reading
      if (baseGamma === null) { baseGamma = g; baseBeta = b; return; }

      var dx = (g - baseGamma) / GYRO_RANGE;
      var dy = (b - baseBeta)  / GYRO_RANGE;
      tX = Math.max(0.05, Math.min(0.95, 0.5 + dx * 0.5));
      tY = Math.max(0.05, Math.min(0.95, 0.5 - dy * 0.5));
    }

    function resetGyroBaseline() { baseGamma = null; baseBeta = null; }

    function startGyro() {
      if (gyroActive) return;
      gyroActive = true;
      window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
      window.addEventListener('orientationchange', resetGyroBaseline);
    }

    var isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (isTouchDevice && window.DeviceOrientationEvent) {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 13+ requires a user-gesture to grant permission
        document.addEventListener('touchstart', function askGyro() {
          document.removeEventListener('touchstart', askGyro);
          DeviceOrientationEvent.requestPermission()
            .then(function (s) { if (s === 'granted') startGyro(); })
            .catch(function () {});
        }, { passive: true, once: true });
      } else {
        startGyro(); // Android / other — no permission needed
      }
    }
    /* ─────────────────────────────────────────────────────────── */

    resize();
    tick();

    return {
      el: canvas,
      setTheme: function (isLight) { blendTarget = isLight ? 1.0 : 0.0; },
      destroy: function () {
        alive = false;
        if (rafId) cancelAnimationFrame(rafId);
        if (heroEl) {
          heroEl.removeEventListener('mousemove',  onMouseMove);
          heroEl.removeEventListener('mouseleave', onMouseLeave);
        }
        if (gyroActive) {
          window.removeEventListener('deviceorientation', onDeviceOrientation);
          window.removeEventListener('orientationchange', resetGyroBaseline);
        }
        try { gl.deleteTexture(tex0); gl.deleteTexture(tex1);
              gl.deleteBuffer(buf);   gl.deleteProgram(prog); } catch(e) {}
      }
    };
  }

  /* ─── Boot ───────────────────────────────────────────────────── */
  function boot() {
    var canvas = document.getElementById('hero-webgl-canvas');
    if (!canvas) return;

    var darkSrc  = canvas.dataset.imgDark;
    var lightSrc = canvas.dataset.imgLight || darkSrc;
    var instance = null;

    function start() {
      if (instance) { instance.destroy(); instance = null; }
      instance = HeroBulge(canvas, darkSrc, lightSrc, {
        strength: 0.08,
        radius:   0.28,
        lerp:     0.06
      });
      if (instance) {
        canvas = instance.el;
        var isLight = document.documentElement.getAttribute('data-theme') === 'light';
        instance.setTheme(isLight);
      }
    }

    var content = document.getElementById('site-content');
    if (content && content.classList.contains('ldr-revealed')) {
      start();
    } else if (content) {
      var pollId = setInterval(function () {
        if (content.classList.contains('ldr-revealed')) {
          clearInterval(pollId);
          start();
        }
      }, 100);
      setTimeout(function () { clearInterval(pollId); if (!instance) start(); }, 4000);
    } else {
      start();
    }

    var themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        requestAnimationFrame(function () {
          if (!instance) return;
          var isLight = document.documentElement.getAttribute('data-theme') === 'light';
          instance.setTheme(isLight);
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
