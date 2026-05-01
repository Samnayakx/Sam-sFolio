(function () {
  'use strict';

  var STORAGE_KEY = 'portfolio-theme';

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  }

  /* Apply saved theme immediately to avoid flash */
  (function () {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
    } catch (e) {}
  })();

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      applyTheme(isLight ? 'dark' : 'light');
    });
  });
})();
