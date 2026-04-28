(function () {
  var replies = [
    'Sam is strongest where ambiguous product strategy, systems design, and AI behavior overlap. I would evaluate the portfolio by looking for how decisions changed the product, not just how polished the screens are.',
    'Start with AI Studio for AI-native product thinking, Salesforce Trailhead Solve for research depth, and Gap 3D Fit Viewer for technical product design across 3D commerce.',
    'Sam tends to design from the workflow out: map the system, find the trust gaps, prototype the risky behavior, then make the UI quiet enough for repeated use.',
    'I am running in dummy mode right now. Later, this drawer can pass the conversation and portfolio context to your model API.'
  ];

  function ensureSidebar() {
    var existing = document.querySelector('[data-samai-shell]');
    if (existing) return existing;

    var style = document.createElement('style');
    style.textContent = [
      ':root{--samai-width:430px;}',
      'body{transition:padding-right .34s cubic-bezier(.22,1,.36,1);}',
      '.samai-open body{padding-right:min(var(--samai-width),62vw);}',
      '.samai-shell{position:fixed;top:0;right:0;bottom:0;z-index:90;display:grid;grid-template-rows:auto 1fr auto;width:min(var(--samai-width),62vw);overflow:hidden;border-left:1px solid rgba(246,240,230,.18);background:linear-gradient(180deg,rgba(12,14,18,.98),rgba(0,0,0,.99));box-shadow:inset 1px 0 0 rgba(255,255,255,.06);transform:translateX(100%);transition:transform .34s cubic-bezier(.22,1,.36,1),width .12s ease;}',
      '.samai-open .samai-shell{transform:none;}',
      '.samai-resizing body,.samai-resizing .samai-shell{transition:none!important;}',
      '.samai-resizing,.samai-resizing *{cursor:col-resize!important;user-select:none!important;}',
      '.samai-resizer{position:absolute;top:0;bottom:0;left:0;z-index:3;width:10px;cursor:col-resize;}',
      '.samai-resizer::before{position:absolute;top:0;bottom:0;left:4px;width:1px;content:"";background:rgba(246,240,230,.2);}',
      '.samai-resizer:hover::before,.samai-resizing .samai-resizer::before{background:rgba(255,122,26,.86);}',
      '.samai-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:18px;border-bottom:1px solid rgba(246,240,230,.14);}',
      '.samai-kicker{margin:0;color:#a79f92;font:12px/1.3 "American Typewriter","Courier New",monospace;text-transform:uppercase;}',
      '.samai-title{margin:4px 0 0;color:#f6f0e6;font:400 34px/.9 "Cormorant Garamond",Georgia,serif;}',
      '.samai-close{display:grid;width:34px;height:34px;place-items:center;border:1px solid rgba(246,240,230,.22);border-radius:999px;color:#f6f0e6;background:rgba(255,255,255,.04);font:18px/1 system-ui,sans-serif;}',
      '.samai-body{display:flex;flex-direction:column;gap:12px;overflow:auto;padding:18px;}',
      '.samai-message{max-width:88%;padding:12px 13px;border:1px solid rgba(246,240,230,.14);border-radius:10px;color:rgba(246,240,230,.78);background:rgba(255,255,255,.04);font:14px/1.48 "American Typewriter","Courier New",monospace;}',
      '.samai-message.user{align-self:flex-end;border-color:rgba(255,122,26,.28);background:rgba(255,122,26,.1);color:#f6f0e6;}',
      '.samai-message.assistant{align-self:flex-start;}',
      '.samai-prompts{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 18px 14px;}',
      '.samai-prompt{min-height:40px;padding:9px 10px;border:1px solid rgba(246,240,230,.14);border-radius:10px;color:rgba(246,240,230,.76);background:rgba(255,255,255,.035);font:12px/1.35 "American Typewriter","Courier New",monospace;text-align:left;}',
      '.samai-prompt:hover{border-color:rgba(246,240,230,.38);background:rgba(255,255,255,.07);}',
      '.samai-form{display:grid;grid-template-columns:1fr auto;gap:8px;padding:14px;border-top:1px solid rgba(246,240,230,.14);}',
      '.samai-input{min-width:0;height:46px;border:1px solid rgba(246,240,230,.18);border-radius:999px;color:#f6f0e6;background:rgba(255,255,255,.05);padding:0 15px;font:14px "American Typewriter","Courier New",monospace;outline:none;}',
      '.samai-input:focus{border-color:rgba(246,240,230,.46);}',
      '.samai-send{height:46px;padding:0 16px;border:1.5px solid rgba(255,255,255,.35);border-radius:999px;color:#fff;background:rgba(255,255,255,.06);font:13px "American Typewriter","Courier New",monospace;}',
      '.samai-send:hover{border-color:rgba(255,255,255,.65);background:rgba(255,255,255,.1);}',
      '@media(max-width:820px){.samai-open body{padding-right:0}.samai-shell{width:min(420px,100vw);box-shadow:-22px 0 70px rgba(0,0,0,.5)}.samai-resizer{display:none}.samai-prompts{grid-template-columns:1fr}.samai-title{font-size:30px}}'
    ].join('');
    document.head.appendChild(style);

    var shell = document.createElement('aside');
    shell.className = 'samai-shell';
    shell.setAttribute('data-samai-shell', '');
    shell.setAttribute('aria-label', 'SamAI sidebar');
    shell.setAttribute('aria-hidden', 'true');
    shell.innerHTML = [
      '<div class="samai-resizer" data-samai-resizer aria-hidden="true"></div>',
      '<header class="samai-head">',
      '<div><p class="samai-kicker">Digital replica</p><h2 class="samai-title">Ask SamAI</h2></div>',
      '<button class="samai-close" type="button" data-samai-close aria-label="Close SamAI">x</button>',
      '</header>',
      '<div class="samai-body" data-samai-messages>',
      '<div class="samai-message assistant">Hi, I am SamAI in dummy mode. Ask about Sam work, process, case studies, or product design strengths.</div>',
      '<div class="samai-message assistant">API is not connected yet. This sidebar is ready for your future model endpoint.</div>',
      '</div>',
      '<div class="samai-prompts">',
      '<button class="samai-prompt" type="button" data-samai-prompt="What kind of designer is Sam?">What kind of designer is Sam?</button>',
      '<button class="samai-prompt" type="button" data-samai-prompt="Which case study should I read first?">Which case study first?</button>',
      '<button class="samai-prompt" type="button" data-samai-prompt="Summarize Sam AI UX strengths.">AI UX strengths</button>',
      '<button class="samai-prompt" type="button" data-samai-prompt="How should a recruiter evaluate Sam?">Recruiter lens</button>',
      '</div>',
      '<form class="samai-form" data-samai-form>',
      '<input class="samai-input" data-samai-input autocomplete="off" placeholder="Ask SamAI...">',
      '<button class="samai-send" type="submit">Send</button>',
      '</form>'
    ].join('');

    document.body.appendChild(shell);
    bindSidebar(shell);
    return shell;
  }

  function appendMessage(shell, role, text) {
    var messages = shell.querySelector('[data-samai-messages]');
    var bubble = document.createElement('div');
    bubble.className = 'samai-message ' + role;
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  function respond(shell, text) {
    var typing = appendMessage(shell, 'assistant', 'SamAI is typing...');
    window.setTimeout(function () {
      var index = Math.abs(text.length + shell.querySelectorAll('.samai-message').length) % replies.length;
      typing.textContent = replies[index];
    }, 520);
  }

  function send(shell, text) {
    var value = text.trim();
    if (!value) return;
    appendMessage(shell, 'user', value);
    respond(shell, value);
  }

  function openSidebar() {
    var shell = ensureSidebar();
    restoreWidth();
    document.documentElement.classList.add('samai-open');
    shell.setAttribute('aria-hidden', 'false');
    window.setTimeout(function () {
      var input = shell.querySelector('[data-samai-input]');
      if (input) input.focus();
    }, 180);
  }

  function closeSidebar() {
    var shell = document.querySelector('[data-samai-shell]');
    document.documentElement.classList.remove('samai-open');
    if (shell) shell.setAttribute('aria-hidden', 'true');
  }

  function bindSidebar(shell) {
    var form = shell.querySelector('[data-samai-form]');
    var input = shell.querySelector('[data-samai-input]');
    var resizer = shell.querySelector('[data-samai-resizer]');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      send(shell, input.value);
      input.value = '';
    });
    shell.querySelectorAll('[data-samai-prompt]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        send(shell, chip.dataset.samaiPrompt || chip.textContent);
      });
    });

    if (resizer) {
      resizer.addEventListener('pointerdown', function (event) {
        event.preventDefault();
        document.documentElement.classList.add('samai-resizing');
        resizer.setPointerCapture(event.pointerId);

        function move(moveEvent) {
          setSidebarWidth(window.innerWidth - moveEvent.clientX);
        }

        function up(upEvent) {
          document.documentElement.classList.remove('samai-resizing');
          resizer.releasePointerCapture(upEvent.pointerId);
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
        }

        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      });
    }
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function setSidebarWidth(value) {
    var max = Math.min(Math.round(window.innerWidth * 0.62), 760);
    var min = Math.min(340, Math.max(280, window.innerWidth - 48));
    var width = clamp(Math.round(value), min, Math.max(min, max));
    document.documentElement.style.setProperty('--samai-width', width + 'px');
    try {
      window.localStorage.setItem('samaiWidth', String(width));
    } catch (error) {
      return;
    }
  }

  function restoreWidth() {
    try {
      var stored = parseInt(window.localStorage.getItem('samaiWidth'), 10);
      if (stored) setSidebarWidth(stored);
    } catch (error) {
      setSidebarWidth(430);
    }
  }

  document.addEventListener('click', function (event) {
    var opener = event.target.closest('[data-samai-open]');
    if (opener) {
      event.preventDefault();
      openSidebar();
      return;
    }
    if (event.target.closest('[data-samai-close]')) {
      event.preventDefault();
      closeSidebar();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeSidebar();
  });

  window.openSamAI = openSidebar;
})();
