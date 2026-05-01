(function () {

  /* ── Per-page context map ── */
  var CONTEXTS = {
    portfolio: {
      label: '',
      welcome: 'Welcome to SamAI.',
      prompts: [
        'What kind of designer is Sam?',
        'Which case study should I read first?',
        'How does Sam approach AI product design?',
        'What makes Sam\'s work stand out?'
      ],
      placeholder: 'Ask about Sam...'
    },
    'gap-3d': {
      label: 'Gap 3D Fit Viewer',
      welcome: 'Gap 3D Fit Viewer.',
      prompts: [
        'What problem did this project solve?',
        'What was Sam\'s role here?',
        'What were the biggest design challenges?',
        'How did 3D change the fit experience?'
      ],
      placeholder: 'Ask about Gap 3D...'
    },
    'ai-studio': {
      label: 'AI Studio, CotonAI',
      welcome: 'AI Studio, CotonAI.',
      prompts: [
        'What is CotonAI\'s AI Studio?',
        'How did Sam design for agentic AI here?',
        'What were the core UX challenges?',
        'What did Sam ship in this project?'
      ],
      placeholder: 'Ask about AI Studio...'
    },
    salesforce: {
      label: 'Trailhead Solve',
      welcome: 'Trailhead Solve.',
      prompts: [
        'What did Sam redesign in Trailhead?',
        'What was the core problem Sam solved?',
        'How did Sam approach enterprise UX here?',
        'What research shaped this project?'
      ],
      placeholder: 'Ask about Trailhead...'
    },
    gatson: {
      label: 'Gatson Driver App',
      welcome: 'Gatson Driver App.',
      prompts: [
        'What was the Gatson Driver App?',
        'What was Sam\'s design focus here?',
        'How did Sam handle workflow complexity?',
        'What makes mobility UX uniquely hard?'
      ],
      placeholder: 'Ask about Gatson...'
    },
    about: {
      label: 'About Sam',
      welcome: 'About Sam.',
      prompts: [
        'What is Sam\'s design background?',
        'What problems does Sam love solving?',
        'How does Sam describe his process?',
        'What\'s Sam\'s take on AI-native products?'
      ],
      placeholder: 'Ask about Sam...'
    },
    playground: {
      label: 'Playground',
      welcome: 'Design Artifacts.',
      prompts: [
        'What artifacts has Sam released?',
        'How does Sam approach side projects?',
        'Which artifact is most useful for teams?',
        'What experiments is Sam building?'
      ],
      placeholder: 'Ask about the playground...'
    }
  };

  var replies = [
    'Sam is strongest where ambiguous product strategy, systems design, and AI behaviour overlap. Evaluate the portfolio by looking for how decisions changed the product, not just how polished the screens are.',
    'Start with AI Studio for AI-native product thinking, Salesforce Trailhead Solve for research depth, and Gap 3D Fit Viewer for technical product design across 3D commerce.',
    'Sam tends to design from the workflow out — map the system, find the trust gaps, prototype the risky behaviour, then make the UI quiet enough for repeated use.',
    'I\'m running in prototype mode right now. Later, this sidebar passes the conversation and portfolio context to a live model API.'
  ];

  var activeContext = 'portfolio';

  function detectContext() {
    var p = window.location.pathname;
    if (/enterprise-ai/.test(p)) return 'gap-3d';
    if (/ai-hardware/.test(p))   return 'ai-studio';
    if (/design-tooling/.test(p)) return 'salesforce';
    if (/consumer-coach/.test(p)) return 'gatson';
    if (/about/.test(p))         return 'about';
    if (/playground/.test(p))    return 'playground';
    return 'portfolio';
  }

  function ctx() {
    return CONTEXTS[activeContext] || CONTEXTS.portfolio;
  }

  /* ── Welcome screen HTML ── */
  function buildWelcomeHTML() {
    var c = ctx();
    var prompts = c.prompts.map(function (q) {
      return '<button class="samai-suggestion" type="button" data-samai-prompt="' +
        q.replace(/"/g, '&quot;') + '">&#8627; ' + q + '</button>';
    }).join('');
    return '<div class="samai-welcome" data-samai-welcome>' +
      '<div class="samai-welcome-spacer"></div>' +
      '<div class="samai-welcome-dot" aria-hidden="true"></div>' +
      '<p class="samai-welcome-title">' + c.welcome + '</p>' +
      '<div class="samai-suggestions">' + prompts + '</div>' +
      '</div>';
  }

  /* ── Inject styles ── */
  function injectStyles() {
    if (document.getElementById('samai-styles')) return;
    var style = document.createElement('style');
    style.id = 'samai-styles';
    style.textContent = [
      /* width token */
      ':root{--samai-width:400px;}',

      /* body shift */
      'body{transition:padding-right .34s cubic-bezier(.22,1,.36,1);}',
      '.samai-open body{padding-right:min(var(--samai-width),62vw);}',

      /* shell */
      '.samai-shell{',
        'position:fixed;top:0;right:0;bottom:0;z-index:90;',
        'width:min(var(--samai-width),62vw);',
        'display:flex;flex-direction:column;overflow:hidden;',
        'background:#080808;',
        'border-left:1px solid rgba(246,240,230,.09);',
        'transform:translateX(100%);',
        'transition:transform .34s cubic-bezier(.22,1,.36,1);',
      '}',
      '.samai-open .samai-shell{transform:none;}',
      '.samai-resizing body,.samai-resizing .samai-shell{transition:none!important;}',
      '.samai-resizing,.samai-resizing *{cursor:col-resize!important;user-select:none!important;}',

      /* resizer */
      '.samai-resizer{position:absolute;top:0;bottom:0;left:0;z-index:3;width:10px;cursor:col-resize;}',
      '.samai-resizer::before{position:absolute;top:0;bottom:0;left:4px;width:1px;content:"";',
        'background:rgba(246,240,230,.1);}',
      '.samai-resizer:hover::before,.samai-resizing .samai-resizer::before{background:#ff7a1a;}',

      /* header */
      '.samai-head{',
        'display:flex;align-items:center;justify-content:space-between;',
        'padding:14px 20px;flex-shrink:0;',
        'border-bottom:1px solid rgba(246,240,230,.07);',
      '}',
      '.samai-head-left{display:flex;align-items:baseline;gap:8px;min-width:0;}',
      '.samai-head-name{',
        'font:600 11px/1 "American Typewriter","Courier New",monospace;',
        'letter-spacing:0.13em;text-transform:uppercase;color:#f6f0e6;',
        'margin:0;white-space:nowrap;',
      '}',
      '.samai-head-ctx{',
        'font:11px/1 "American Typewriter","Courier New",monospace;',
        'color:rgba(246,240,230,.3);margin:0;',
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;',
      '}',
      '.samai-head-right{display:flex;align-items:center;gap:6px;flex-shrink:0;}',
      '.samai-icon-btn{',
        'width:28px;height:28px;display:flex;align-items:center;justify-content:center;',
        'background:none;border:1px solid rgba(246,240,230,.12);border-radius:50%;',
        'color:rgba(246,240,230,.4);cursor:pointer;',
        'transition:border-color 160ms ease,color 160ms ease;',
      '}',
      '.samai-icon-btn:hover{border-color:rgba(246,240,230,.36);color:#f6f0e6;}',

      /* scrollable body */
      '.samai-body{flex:1;overflow-y:auto;display:flex;flex-direction:column;min-height:0;}',
      '.samai-body::-webkit-scrollbar{width:2px;}',
      '.samai-body::-webkit-scrollbar-thumb{background:rgba(246,240,230,.1);border-radius:999px;}',

      /* welcome */
      '.samai-welcome{flex:1;display:flex;flex-direction:column;padding:28px 24px 32px;}',
      '.samai-welcome-spacer{flex:1;}',
      '.samai-welcome-dot{',
        'width:11px;height:11px;border-radius:50%;',
        'background:#ff7a1a;margin-bottom:18px;flex-shrink:0;',
      '}',
      '.samai-welcome-title{',
        'font:400 clamp(24px,3vw,32px)/1.1 "Cormorant Garamond",Georgia,serif;',
        'letter-spacing:-0.02em;color:#f6f0e6;margin:0 0 24px;flex-shrink:0;',
      '}',
      '.samai-suggestions{display:flex;flex-direction:column;flex-shrink:0;}',
      '.samai-suggestion{',
        'display:block;width:100%;background:none;border:none;',
        'border-top:1px solid rgba(246,240,230,.07);',
        'padding:13px 0;text-align:left;cursor:pointer;',
        'font:15px/1.45 "Cormorant Garamond",Georgia,serif;',
        'color:rgba(246,240,230,.5);transition:color 160ms ease,padding-left 160ms ease;',
      '}',
      '.samai-suggestion:last-child{border-bottom:1px solid rgba(246,240,230,.07);}',
      '.samai-suggestion:hover{color:#f6f0e6;padding-left:6px;}',

      /* chat messages */
      '.samai-messages{display:flex;flex-direction:column;gap:12px;padding:24px 20px 12px;flex:1;}',
      '.samai-bubble{',
        'font:13px/1.6 "American Typewriter","Courier New",monospace;',
        'max-width:88%;padding:10px 13px;border-radius:8px;',
      '}',
      '.samai-bubble.user{',
        'align-self:flex-end;color:#f6f0e6;',
        'background:rgba(255,122,26,.1);border:1px solid rgba(255,122,26,.2);',
        'border-radius:10px 10px 2px 10px;',
      '}',
      '.samai-bubble.assistant{',
        'align-self:flex-start;color:rgba(246,240,230,.7);',
        'border:1px solid rgba(246,240,230,.09);',
        'border-radius:2px 10px 10px 10px;',
      '}',

      /* footer input */
      '.samai-foot{flex-shrink:0;padding:14px 18px;border-top:1px solid rgba(246,240,230,.07);}',
      '.samai-form{',
        'display:flex;align-items:center;gap:8px;',
        'border:1px solid rgba(246,240,230,.14);border-radius:8px;',
        'padding:4px 4px 4px 14px;',
        'background:rgba(255,255,255,.025);',
        'transition:border-color 180ms ease;',
      '}',
      '.samai-form:focus-within{border-color:rgba(246,240,230,.3);}',
      '.samai-input{',
        'flex:1;min-width:0;background:none;border:none;outline:none;',
        'font:13px "American Typewriter","Courier New",monospace;',
        'color:#f6f0e6;padding:8px 0;',
      '}',
      '.samai-input::placeholder{color:rgba(246,240,230,.25);}',
      '.samai-send{',
        'width:30px;height:30px;display:flex;align-items:center;justify-content:center;flex-shrink:0;',
        'background:rgba(255,255,255,.05);border:1px solid rgba(246,240,230,.14);border-radius:6px;',
        'color:rgba(246,240,230,.5);cursor:pointer;',
        'transition:background 160ms ease,border-color 160ms ease,color 160ms ease;',
      '}',
      '.samai-send:hover{background:rgba(255,122,26,.15);border-color:rgba(255,122,26,.35);color:#ff7a1a;}',

      /* light mode overrides */
      '[data-theme="light"] .samai-shell{background:#f4f0e8;border-left-color:rgba(26,20,16,.1);}',
      '[data-theme="light"] .samai-resizer::before{background:rgba(26,20,16,.1);}',
      '[data-theme="light"] .samai-head{border-bottom-color:rgba(26,20,16,.09);}',
      '[data-theme="light"] .samai-head-name{color:#1a1410;}',
      '[data-theme="light"] .samai-head-ctx{color:rgba(26,20,16,.38);}',
      '[data-theme="light"] .samai-icon-btn{border-color:rgba(26,20,16,.15);color:rgba(26,20,16,.45);}',
      '[data-theme="light"] .samai-icon-btn:hover{border-color:rgba(26,20,16,.5);color:#1a1410;}',
      '[data-theme="light"] .samai-body::-webkit-scrollbar-thumb{background:rgba(26,20,16,.1);}',
      '[data-theme="light"] .samai-welcome-title{color:#1a1410;}',
      '[data-theme="light"] .samai-suggestion{border-top-color:rgba(26,20,16,.08);color:rgba(26,20,16,.5);}',
      '[data-theme="light"] .samai-suggestion:last-child{border-bottom-color:rgba(26,20,16,.08);}',
      '[data-theme="light"] .samai-suggestion:hover{color:#1a1410;}',
      '[data-theme="light"] .samai-bubble.user{color:#1a1410;}',
      '[data-theme="light"] .samai-bubble.assistant{color:rgba(26,20,16,.7);border-color:rgba(26,20,16,.11);}',
      '[data-theme="light"] .samai-foot{border-top-color:rgba(26,20,16,.09);}',
      '[data-theme="light"] .samai-form{border-color:rgba(26,20,16,.16);background:rgba(26,20,16,.03);}',
      '[data-theme="light"] .samai-form:focus-within{border-color:rgba(26,20,16,.35);}',
      '[data-theme="light"] .samai-input{color:#1a1410;}',
      '[data-theme="light"] .samai-input::placeholder{color:rgba(26,20,16,.28);}',
      '[data-theme="light"] .samai-send{background:rgba(26,20,16,.04);border-color:rgba(26,20,16,.15);color:rgba(26,20,16,.45);}',

      /* mobile */
      '@media(max-width:820px){',
        '.samai-open body{padding-right:0}',
        '.samai-shell{width:min(400px,100vw)}',
        '.samai-resizer{display:none}',
      '}'
    ].join('');
    document.head.appendChild(style);
  }

  /* ── Build sidebar DOM ── */
  function ensureSidebar() {
    var existing = document.querySelector('[data-samai-shell]');
    if (existing) return existing;

    injectStyles();
    activeContext = detectContext();
    var c = ctx();

    var shell = document.createElement('aside');
    shell.className = 'samai-shell';
    shell.setAttribute('data-samai-shell', '');
    shell.setAttribute('aria-label', 'SamAI sidebar');
    shell.setAttribute('aria-hidden', 'true');

    var ctxSpan = activeContext !== 'portfolio'
      ? '<p class="samai-head-ctx" data-samai-ctx-label>&#8212; ' + c.label + '</p>'
      : '<p class="samai-head-ctx" data-samai-ctx-label></p>';

    shell.innerHTML =
      '<div class="samai-resizer" data-samai-resizer aria-hidden="true"></div>' +

      '<header class="samai-head">' +
        '<div class="samai-head-left">' +
          '<p class="samai-head-name">Sam AI</p>' +
          ctxSpan +
        '</div>' +
        '<div class="samai-head-right">' +
          '<button class="samai-icon-btn" type="button" data-samai-reset aria-label="Reset conversation">' +
            '<svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M2 7a5 5 0 1 0 1.4-3.4"/>' +
              '<polyline points="2,1.5 2,4.5 5,4.5"/>' +
            '</svg>' +
          '</button>' +
          '<button class="samai-icon-btn" type="button" data-samai-close aria-label="Close SamAI">' +
            '<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">' +
              '<line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
      '</header>' +

      '<div class="samai-body" data-samai-body>' +
        buildWelcomeHTML() +
      '</div>' +

      '<footer class="samai-foot">' +
        '<form class="samai-form" data-samai-form>' +
          '<input class="samai-input" data-samai-input autocomplete="off" placeholder="' + c.placeholder + '">' +
          '<button class="samai-send" type="submit" aria-label="Send">' +
            '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
              '<line x1="6" y1="11" x2="6" y2="1"/><polyline points="2,5 6,1 10,5"/>' +
            '</svg>' +
          '</button>' +
        '</form>' +
      '</footer>';

    document.body.appendChild(shell);
    bindSidebar(shell);
    return shell;
  }

  /* ── Welcome state ── */
  function showWelcome(shell, newCtx) {
    if (newCtx) activeContext = newCtx;
    var body = shell.querySelector('[data-samai-body]');
    body.innerHTML = buildWelcomeHTML();
    bindSuggestions(shell);

    var c = ctx();
    var ctxLabel = shell.querySelector('[data-samai-ctx-label]');
    if (ctxLabel) ctxLabel.textContent = activeContext !== 'portfolio' ? '— ' + c.label : '';
    var input = shell.querySelector('[data-samai-input]');
    if (input) input.placeholder = c.placeholder;
  }

  function bindSuggestions(shell) {
    var body = shell.querySelector('[data-samai-body]');
    body.querySelectorAll('[data-samai-prompt]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        send(shell, btn.getAttribute('data-samai-prompt'));
      });
    });
  }

  /* ── Chat state ── */
  function getMessagesContainer(shell) {
    var body = shell.querySelector('[data-samai-body]');
    var welcome = body.querySelector('[data-samai-welcome]');
    if (welcome) {
      body.removeChild(welcome);
      var msgs = document.createElement('div');
      msgs.className = 'samai-messages';
      msgs.setAttribute('data-samai-messages', '');
      body.appendChild(msgs);
    }
    return body.querySelector('[data-samai-messages]');
  }

  function appendBubble(shell, role, text) {
    var msgs = getMessagesContainer(shell);
    var el = document.createElement('div');
    el.className = 'samai-bubble ' + role;
    el.textContent = text;
    msgs.appendChild(el);
    var body = shell.querySelector('[data-samai-body]');
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function respond(shell, text) {
    var bubble = appendBubble(shell, 'assistant', '...');
    window.setTimeout(function () {
      var idx = Math.abs(text.length + shell.querySelectorAll('.samai-bubble').length) % replies.length;
      bubble.textContent = replies[idx];
    }, 560);
  }

  function send(shell, text) {
    var value = (text || '').trim();
    if (!value) return;
    appendBubble(shell, 'user', value);
    respond(shell, value);
  }

  /* ── Sidebar open / close ── */
  function openSidebar() {
    var shell = ensureSidebar();
    restoreWidth();
    document.documentElement.classList.add('samai-open');
    shell.setAttribute('aria-hidden', 'false');
    window.setTimeout(function () {
      var input = shell.querySelector('[data-samai-input]');
      if (input) input.focus();
    }, 200);
  }

  function closeSidebar() {
    var shell = document.querySelector('[data-samai-shell]');
    document.documentElement.classList.remove('samai-open');
    if (shell) shell.setAttribute('aria-hidden', 'true');
  }

  /* ── Event binding ── */
  function bindSidebar(shell) {
    var form = shell.querySelector('[data-samai-form]');
    var input = shell.querySelector('[data-samai-input]');
    var resizer = shell.querySelector('[data-samai-resizer]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      send(shell, input.value);
      input.value = '';
    });

    shell.querySelector('[data-samai-reset]').addEventListener('click', function () {
      showWelcome(shell);
    });

    bindSuggestions(shell);

    if (resizer) {
      resizer.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        document.documentElement.classList.add('samai-resizing');
        resizer.setPointerCapture(e.pointerId);
        function move(me) { setSidebarWidth(window.innerWidth - me.clientX); }
        function up(ue) {
          document.documentElement.classList.remove('samai-resizing');
          resizer.releasePointerCapture(ue.pointerId);
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
        }
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      });
    }
  }

  /* ── Width persistence ── */
  function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

  function setSidebarWidth(value) {
    var max = Math.min(Math.round(window.innerWidth * 0.62), 760);
    var min = Math.min(340, Math.max(280, window.innerWidth - 48));
    var width = clamp(Math.round(value), min, Math.max(min, max));
    document.documentElement.style.setProperty('--samai-width', width + 'px');
    try { window.localStorage.setItem('samaiWidth', String(width)); } catch (e) {}
  }

  function restoreWidth() {
    try {
      var stored = parseInt(window.localStorage.getItem('samaiWidth'), 10);
      if (stored) setSidebarWidth(stored);
    } catch (e) { setSidebarWidth(400); }
  }

  /* ── Global click delegation ── */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-samai-open]')) { e.preventDefault(); openSidebar(); return; }
    if (e.target.closest('[data-samai-close]')) { e.preventDefault(); closeSidebar(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSidebar();
  });

  /* ── Public API ── */
  window.openSamAI = openSidebar;

  window.setSamAIContext = function (newCtx) {
    activeContext = newCtx;
    var shell = document.querySelector('[data-samai-shell]');
    if (shell) showWelcome(shell, newCtx);
  };

})();
