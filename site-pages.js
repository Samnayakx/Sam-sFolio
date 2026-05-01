/* ── Mobile navigation sidebar ── */
(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;

  /* Build hamburger button */
  var hamburger = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML =
    '<span class="hb-line"></span>' +
    '<span class="hb-line"></span>' +
    '<span class="hb-line"></span>';
  nav.appendChild(hamburger);

  /* Collect links from the desktop nav */
  var desktopLinks = nav.querySelectorAll('.nav-links a');
  var linksHTML = Array.prototype.map.call(desktopLinks, function (a) {
    var extras = '';
    if (a.target) extras += ' target="' + a.target + '"';
    if (a.getAttribute('rel')) extras += ' rel="' + a.getAttribute('rel') + '"';
    return '<a href="' + a.getAttribute('href') + '"' + extras + '>' + a.textContent.trim() + '</a>';
  }).join('');

  /* Sidebar panel */
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

  /* Clone Ask Sam + theme toggle into sidebar bottom */
  var bottom = sidebar.querySelector('.mobile-nav-bottom');
  var askBtn = document.querySelector('.topbar .ask-sam-btn');
  var themeBtn = document.querySelector('.topbar .theme-toggle');

  if (askBtn) {
    var mobileAsk = askBtn.cloneNode(true);
    mobileAsk.addEventListener('click', function () {
      closeMenu();
      setTimeout(function () { if (askBtn) askBtn.click(); }, 200);
    });
    bottom.appendChild(mobileAsk);
  }
  if (themeBtn) {
    var mobileTheme = themeBtn.cloneNode(true);
    mobileTheme.id = '';
    mobileTheme.addEventListener('click', function () {
      if (themeBtn) themeBtn.click();
      /* Sync icon state after toggle */
      setTimeout(function () {
        var isDark = !document.documentElement.hasAttribute('data-theme') ||
                      document.documentElement.getAttribute('data-theme') === 'dark';
        mobileTheme.querySelector('.theme-icon-sun') &&
          (mobileTheme.querySelector('.theme-icon-sun').style.display = isDark ? '' : 'none');
        mobileTheme.querySelector('.theme-icon-moon') &&
          (mobileTheme.querySelector('.theme-icon-moon').style.display = isDark ? 'none' : '');
      }, 50);
    });
    bottom.appendChild(mobileTheme);
  }

  /* Backdrop */
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

  hamburger.addEventListener('click', function () { isOpen ? closeMenu() : openMenu(); });
  backdrop.addEventListener('click', closeMenu);
  sidebar.querySelector('.mobile-nav-close').addEventListener('click', closeMenu);

  /* Close when a nav link is clicked */
  sidebar.querySelectorAll('.mobile-nav-links a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* ESC key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });
})();

(function () {
  /* ── Custom cursor dot ── */
  var cursorDot = document.createElement('div');
  cursorDot.className = 'cursor-dot';
  document.body.appendChild(cursorDot);

  document.addEventListener('mousemove', function (e) {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top  = e.clientY + 'px';
  }, { passive: true });

  document.addEventListener('mouseleave', function () { cursorDot.classList.add('is-hidden'); });
  document.addEventListener('mouseenter', function () { cursorDot.classList.remove('is-hidden'); });

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest('a, button, [role="button"], input, textarea, select, label')) {
      cursorDot.classList.add('is-hover');
    } else {
      cursorDot.classList.remove('is-hover');
    }
  }, { passive: true });
})();

(function () {
  var motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

  var footer = document.querySelector('.site-footer');
  var footerBg = document.querySelector('.footer-mountain');
  if (footer) {
    if (footerBg && motionOk) {
      var rafFooter = null;
      function runFooterParallax() {
        var rect = footer.getBoundingClientRect();
        var vh = window.innerHeight;
        if (rect.bottom < 0 || rect.top > vh) {
          rafFooter = null;
          return;
        }
        var offset = ((vh - rect.top) / (vh + rect.height) - 0.5) * 60;
        footerBg.style.setProperty('--footer-parallax', offset.toFixed(1) + 'px');
        footerBg.style.setProperty('--footer-bg-y', 'calc(48% + ' + (offset * -0.32).toFixed(1) + 'px)');
        rafFooter = null;
      }
      window.addEventListener('scroll', function () {
        if (!rafFooter) rafFooter = requestAnimationFrame(runFooterParallax);
      }, { passive: true });
      runFooterParallax();
    }

    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) footer.classList.add('in-view');
      });
    }, { threshold: 0.08 }).observe(footer);
  }

  if (window.initFooterPixelName) window.initFooterPixelName();

  if (motionOk) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-vis');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.glass-panel, .statement, .experiment-card, .summary-card').forEach(function (node) {
      node.style.opacity = '0';
      node.style.transform = 'translateY(18px)';
      node.style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
      revealObserver.observe(node);
    });

    var style = document.createElement('style');
    style.textContent = '.is-vis{opacity:1!important;transform:none!important;}';
    document.head.appendChild(style);
  }

  var chat = document.querySelector('[data-samai-chat]');
  if (!chat) return;

  var form = chat.querySelector('[data-chat-form]');
  var input = chat.querySelector('[data-chat-input]');
  var messages = chat.querySelector('[data-chat-messages]');
  var chips = document.querySelectorAll('[data-prompt]');

  var replies = [
    'I would frame Sam as a product designer who is strongest when ambiguity, systems, and AI behavior overlap. The portfolio should show the decision logic, not just the final surface.',
    'A good case-study question for Sam is: what changed because of the design work? I would look for team velocity, user confidence, operational clarity, or a measurable reduction in friction.',
    'For recruiting, I would start with AI Studio, Salesforce Trailhead Solve, and Gap 3D Fit Viewer. Together they show AI-native product thinking, research depth, and technical product design.',
    'I am a local prototype right now. When the API is connected, this panel can pass the conversation, page context, and selected portfolio data into a real SamAI response.'
  ];

  function appendMessage(role, text) {
    var bubble = document.createElement('div');
    bubble.className = 'message ' + role;
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  function respond(text) {
    var typing = appendMessage('assistant', 'SamAI is typing...');
    window.setTimeout(function () {
      var index = Math.abs(text.length + messages.children.length) % replies.length;
      typing.textContent = replies[index];
    }, 520);
  }

  function send(text) {
    var value = text.trim();
    if (!value) return;
    appendMessage('user', value);
    respond(value);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    send(input.value);
    input.value = '';
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      send(chip.dataset.prompt || chip.textContent);
    });
  });
})();
