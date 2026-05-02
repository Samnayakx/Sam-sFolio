(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;

  var hamburger = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML =
    '<span class="hb-line"></span>' +
    '<span class="hb-line"></span>' +
    '<span class="hb-line"></span>';
  nav.appendChild(hamburger);

  var desktopLinks = nav.querySelectorAll('.nav-links a');
  var linksHTML = Array.prototype.map.call(desktopLinks, function (a) {
    var extras = '';
    if (a.target) extras += ' target="' + a.target + '"';
    if (a.getAttribute('rel')) extras += ' rel="' + a.getAttribute('rel') + '"';
    return '<a href="' + a.getAttribute('href') + '"' + extras + '>' + a.textContent.trim() + '</a>';
  }).join('');

  var sidebar = document.createElement('div');
  sidebar.className = 'mobile-nav';
  sidebar.setAttribute('role', 'dialog');
  sidebar.setAttribute('aria-modal', 'true');
  sidebar.setAttribute('aria-label', 'Navigation menu');
  sidebar.innerHTML =
    '<div class="mobile-nav-top">' +
      '<button class="mobile-nav-close" aria-label="Close navigation">' +
        '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
          '<line x1="2" y1="2" x2="16" y2="16"/><line x1="16" y1="2" x2="2" y2="16"/>' +
        '</svg>' +
      '</button>' +
    '</div>' +
    '<nav class="mobile-nav-links">' + linksHTML + '</nav>' +
    '<div class="mobile-nav-bottom"></div>';

  var bottom = sidebar.querySelector('.mobile-nav-bottom');
  var askBtn = document.querySelector('.topbar .ask-sam-btn');
  var themeBtn = document.querySelector('.topbar .theme-toggle');

  if (askBtn) {
    var mobileAsk = askBtn.cloneNode(true);
    mobileAsk.addEventListener('click', function () {
      closeMenu();
      window.setTimeout(function () {
        if (askBtn) askBtn.click();
      }, 200);
    });
    bottom.appendChild(mobileAsk);
  }

  if (themeBtn) {
    var mobileTheme = themeBtn.cloneNode(true);
    mobileTheme.id = '';
    mobileTheme.addEventListener('click', function () {
      if (themeBtn) themeBtn.click();
    });
    bottom.appendChild(mobileTheme);
  }

  var backdrop = document.createElement('div');
  backdrop.className = 'mobile-nav-backdrop';
  document.body.appendChild(backdrop);
  document.body.appendChild(sidebar);

  var isOpen = false;

  function openMenu() {
    isOpen = true;
    sidebar.classList.add('is-open');
    backdrop.classList.add('is-open');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    isOpen = false;
    sidebar.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    isOpen ? closeMenu() : openMenu();
  });

  backdrop.addEventListener('click', closeMenu);
  sidebar.querySelector('.mobile-nav-close').addEventListener('click', closeMenu);

  sidebar.querySelectorAll('.mobile-nav-links a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768 && isOpen) closeMenu();
  }, { passive: true });
})();
