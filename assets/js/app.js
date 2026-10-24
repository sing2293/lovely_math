/* Lovely Math — main UI: patterns, walkthroughs, method cards, test room, plan. */
(function () {
  'use strict';
  let C = {}; // decrypted content, handed over by auth.js after sign-in
  let families = [];
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const t = (k, v) => (window.LovelyI18n ? window.LovelyI18n.t(k, v) : k);
  const reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const famById = (id) => families.find((f) => f.id === id);

  // ---------- small helpers ----------
  // Progress lives in localStorage, so it survives closing the tab or restarting the computer.
  const store = {
    get(k, d) {
      try { const v = localStorage.getItem('lm:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set(k, v) {
      try { localStorage.setItem('lm:' + k, JSON.stringify(v)); } catch (e) { /* private mode */ }
    }
  };

  function h(tag, attrs) {
    const n = document.createElement(tag);
    if (attrs) {
      for (const k of Object.keys(attrs)) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') n.className = v;
        else if (k === 'html') n.innerHTML = v;
        else if (k === 'text') n.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') {
          for (const s of Object.keys(v)) s.startsWith('--') ? n.style.setProperty(s, v[s]) : (n.style[s] = v[s]);
        } else n.setAttribute(k, v === true ? '' : v);
      }
    }
    for (let i = 2; i < arguments.length; i++) append(n, arguments[i]);
    return n;
  }
  function append(n, kid) {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) return kid.forEach((k) => append(n, k));
    n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  function icon(id, cls, viewBox) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    if (cls) s.setAttribute('class', cls);
    if (viewBox) s.setAttribute('viewBox', viewBox);
    s.setAttribute('aria-hidden', 'true');
    const u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    u.setAttribute('href', '#' + id);
    s.appendChild(u);
    return s;
  }
  function renderMath(node) {
    if (!node || !window.renderMathInElement) return;
    try {
      window.renderMathInElement(node, {
        delimiters: [
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false,
        strict: false
      });
    } catch (e) { /* leave the TeX readable */ }
  }
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }
  function hearts(x, y, n) {
    if (reduceMotion) return;
    const colors = ['#d76a8b', '#ec9ab3', '#bca8e6', '#f4b1c5', '#8b6fc6'];
    for (let i = 0; i < (n || 14); i++) {
      const s = icon('heart', 'confetti-heart');
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.fill = colors[i % colors.length];
      const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 110;
      s.style.setProperty('--dx', Math.cos(a) * d + 'px');
      s.style.setProperty('--dy', Math.sin(a) * d - 40 + 'px');
      s.style.setProperty('--rot', Math.random() * 120 - 60 + 'deg');
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1200);
    }
  }
  const burstFrom = (el, n) => { const r = el.getBoundingClientRect(); hearts(r.left + r.width / 2, r.top + r.height / 2, n); };

  // ---------- modal ----------
  function openModal(node, opts) {
    const back = h('div', { class: 'modal-backdrop' });
    back.appendChild(node);
    document.body.appendChild(back);
    document.body.style.overflow = 'hidden';
    const prev = document.activeElement;
    function close() {
      back.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      if (prev && prev.focus) prev.focus();
      if (opts && opts.onClose) opts.onClose();
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const f = $$('button, [href], input, select, textarea', node).filter((x) => !x.disabled && x.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    }
    back.addEventListener('mousedown', (e) => { if (e.target === back) close(); });
    document.addEventListener('keydown', onKey);
    setTimeout(() => { const f = node.querySelector('input, button'); if (f) f.focus(); }, 40);
    return close;
  }

  // ---------- nav, petals, doodles, greeting ----------
  function initNav() {
    const links = $$('.tabs a');
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((l) => l.classList.remove('active'));
        const a = byId.get(e.target.id);
        if (a) a.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => io.observe(s));
  }

  function initPetals() {
    const layer = $('#petal-layer'), btn = $('#petal-toggle');
    let on = !reduceMotion && store.get('petals', true);
    let timer = null;
    function spawn() {
      if (document.hidden) return;
      const p = document.createElement('span');
      p.className = 'petal';
      const size = 9 + Math.random() * 9;
      p.style.width = size + 'px';
      p.style.height = size * 0.85 + 'px';
      p.style.left = Math.random() * 100 + 'vw';
      const dur = 9 + Math.random() * 8;
      p.style.animationDuration = dur + 's, ' + (2 + Math.random() * 2) + 's';
      p.style.opacity = String(0.45 + Math.random() * 0.4);
      layer.appendChild(p);
      setTimeout(() => p.remove(), dur * 1000);
    }
    function set(v) {
      on = v;
      btn.setAttribute('aria-pressed', String(v));
      store.set('petals', v);
      clearInterval(timer);
      if (v) { timer = setInterval(spawn, 1500); spawn(); } else layer.innerHTML = '';
    }
    btn.addEventListener('click', () => { set(!on); toast(on ? t('petals.on') : t('petals.off')); });
    set(on);
  }

  function initDoodles() {
    let tip = null;
    const close = () => { if (tip) { tip.remove(); tip = null; } };
    $$('.doodle[data-tip]').forEach((d) => {
      d.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const same = tip && tip._for === d;
        close();
        if (same) return;
        const hero = $('#home');
        tip = h('div', { class: 'tip', role: 'tooltip', html: d.dataset.tip });
        tip._for = d;
        hero.appendChild(tip);
        const r = d.getBoundingClientRect(), hr = hero.getBoundingClientRect();
        const left = Math.max(12, Math.min(r.left - hr.left, hr.width - 284));
        tip.style.left = left + 'px';
        tip.style.top = r.bottom - hr.top + 8 + 'px';
      });
    });
    document.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  function greet(name) {
    const hi = $('#hello');
    if (!hi || !name) return;
    const hour = new Date().getHours();
    const part = t(hour < 12 ? 'greet.morning' : hour < 18 ? 'greet.afternoon' : 'greet.evening');
    const done = Object.values(store.get('mastered', {})).filter(Boolean).length;
    hi.textContent = part + ', ' + name + ' ♡ ' + (done ? t('greet.progress', { done }) : t('greet.start'));
  }

  // ---------- patterns + walkthroughs ----------
  function heartRating(n) {
    const wrap = h('span', { class: 'hearts', title: t('conf.' + n) });
    for (let i = 1; i <= 3; i++) wrap.appendChild(icon('heart', i <= n ? '' : 'off', '0 0 24 24'));
    return wrap;
  }

  function initPatterns() {
    const strip = $('#evidence-strip');
    (C.evidence || []).forEach((e) => strip.appendChild(h('span', { class: 'chip ' + (e.tone || 'ghost'), text: e.text })));
    if (C.patternsLead) $('#patterns-lead').innerHTML = C.patternsLead;

    const topics = [null].concat(Array.from(new Set(families.map((f) => f.topic)))); // null = all
    const filters = $('#pattern-filters');
    let current = null;
    topics.forEach((topic) => {
      filters.appendChild(h('button', {
        class: 'filter-btn' + (topic === null ? ' active' : ''),
        type: 'button',
        'aria-pressed': String(topic === null),
        onclick: (ev) => {
          current = topic;
          $$('.filter-btn', filters).forEach((b) => {
            b.classList.toggle('active', b === ev.currentTarget);
            b.setAttribute('aria-pressed', String(b === ev.currentTarget));
          });
          drawPatterns();
        }
      }, topic === null ? t('filter.all') : topic));
    });

    const grid = $('#pattern-grid');
    window.drawPatterns = drawPatterns;
    function drawPatterns() {
      const mastered = store.get('mastered', {});
      const solved = store.get('solved', {});
      grid.innerHTML = '';
      families.filter((f) => current === null || f.topic === current).forEach((f, i) => {
        grid.appendChild(h('button', {
          class: 'pattern-card' + (mastered[f.id] ? ' done' : ''),
          type: 'button',
          style: { '--tilt': ((i % 3) - 1) * 0.8 + 'deg' },
          onclick: () => openWalkthrough(f),
          'aria-label': t('pat.openAria') + ' ' + f.title
        },
          h('span', { class: 'tape ' + ['', 'lav', 'mint'][i % 3] }),
          h('span', { class: 'rank', text: f.rank ? '#' + f.rank : '' }),
          h('span', { class: 'topic', text: f.topic }),
          h('h3', { text: f.title }),
          h('p', { html: f.blurb || '' }),
          h('span', { class: 'meta' },
            f.freq && h('span', { class: 'chip', text: f.freq }),
            f.conf && heartRating(f.conf),
            f.lab && h('span', { class: 'chip lav', text: t('pat.lab') }),
            solved[f.id] && h('span', { class: 'chip mint', text: t('pat.solved') })
          ),
          h('span', { class: 'open-cue', text: t('pat.cue') })
        ));
      });
      renderMath(grid);
    }
    drawPatterns();
  }

  function listBox(title, items) {
    if (!items || !items.length) return null;
    return h('div', { class: 'nb-box' }, h('h4', { text: title }), h('ul', {}, items.map((it) => h('li', { html: it }))));
  }

  function openWalkthrough(f) {
    const nb = h('article', { class: 'notebook', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'nb-title' });
    let close;
    const closeBtn = h('button', { class: 'icon-btn notebook-close', type: 'button', 'aria-label': t('wt.close'), onclick: () => close() }, icon('close', '', '0 0 24 24'));

    // stepper
    const steps = f.steps || [];
    const stepEls = steps.map((s, i) => h('div', { class: 'step' },
      h('h4', {}, h('span', { class: 'num', text: String(i + 1) }), h('span', { html: s.title })),
      s.work && h('div', { class: 'work', html: s.work }),
      s.why && h('div', { class: 'why', html: s.why }),
      s.trap && h('div', { class: 'trap', html: '<strong>' + t('wt.trap') + '</strong> ' + s.trap })
    ));
    const track = h('span', { class: 'heart-track', 'aria-hidden': 'true' }, steps.map(() => icon('heart', '', '0 0 24 24')));
    let shown = 0;
    const nextBtn = h('button', { class: 'btn btn-rose btn-small', type: 'button' });
    const backBtn = h('button', { class: 'btn btn-ghost btn-small', type: 'button' }, t('wt.back'));
    const allBtn = h('button', { class: 'btn btn-ghost btn-small', type: 'button' }, t('wt.all'));
    const status = h('span', { class: 'sr-only', 'aria-live': 'polite' });
    function update() {
      stepEls.forEach((el, i) => el.classList.toggle('shown', i < shown));
      $$('svg', track).forEach((s, i) => s.classList.toggle('on', i < shown));
      nextBtn.disabled = shown >= steps.length;
      backBtn.disabled = shown === 0;
      allBtn.disabled = shown >= steps.length;
      nextBtn.textContent = shown >= steps.length ? t('wt.done') : t('wt.next', { n: shown + 1 });
      status.textContent = shown ? t('wt.status', { n: shown, total: steps.length }) : '';
    }
    nextBtn.addEventListener('click', () => {
      if (shown >= steps.length) return;
      shown++;
      update();
      stepEls[shown - 1].scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
      if (shown === steps.length) burstFrom(nextBtn, 16);
    });
    backBtn.addEventListener('click', () => { if (shown > 0) { shown--; update(); } });
    allBtn.addEventListener('click', () => { shown = steps.length; update(); });
    update();

    // your turn
    let tryBox = null;
    if (f.tryIt) {
      const q = f.tryIt;
      const inp = h('input', { type: 'text', inputmode: 'decimal', placeholder: t('try.placeholder'), 'aria-label': t('try.placeholder') });
      const fb = h('span', { class: 'feedback', 'aria-live': 'polite' });
      const explain = h('div', { class: 'hint-box', html: q.explain || '' });
      const hint = q.hint ? h('div', { class: 'hint-box', html: '<strong>' + t('hint.label') + '</strong> ' + q.hint }) : null;
      const check = h('button', { class: 'btn btn-lav btn-small', type: 'button' }, t('try.check'));
      check.addEventListener('click', () => {
        let v = null;
        try { v = window.LovelyCalc ? window.LovelyCalc.evaluate(inp.value) : parseFloat(inp.value); } catch (e) { v = null; }
        if (v == null || !Number.isFinite(v)) { fb.className = 'feedback bad'; fb.textContent = t('try.invalid'); return; }
        const ok = Math.abs(v - q.answer) <= (q.tol == null ? 0.01 : q.tol);
        fb.className = 'feedback ' + (ok ? 'good' : 'bad');
        fb.textContent = ok ? t('try.good') : t('try.bad');
        if (ok) {
          burstFrom(check, 18);
          explain.classList.add('shown');
          renderMath(explain);
          const s = store.get('solved', {});
          s[f.id] = true;
          store.set('solved', s);
        }
      });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') check.click(); });
      tryBox = h('div', { class: 'try-it' },
        h('h4', { text: t('try.title') }),
        h('div', { html: q.prompt }),
        h('div', { class: 'answer-row' }, inp, check,
          hint && h('button', { class: 'btn btn-ghost btn-small', type: 'button', onclick: () => { hint.classList.toggle('shown'); renderMath(hint); } }, t('try.hint')),
          fb),
        hint, explain);
    }

    const mastered = store.get('mastered', {});
    const mBtn = h('button', { class: 'btn ' + (mastered[f.id] ? 'btn-ghost' : 'btn-lav'), type: 'button' },
      mastered[f.id] ? t('master.done') : t('master.yes'));
    mBtn.addEventListener('click', () => {
      const m = store.get('mastered', {});
      m[f.id] = !m[f.id];
      store.set('mastered', m);
      mBtn.className = 'btn ' + (m[f.id] ? 'btn-ghost' : 'btn-lav');
      mBtn.textContent = m[f.id] ? t('master.done') : t('master.yes');
      if (m[f.id]) { burstFrom(mBtn, 20); toast(t('master.toast')); }
    });
    const labBtn = f.lab && window.LovelyLabs ? h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { close(); window.LovelyLabs.activate(f.lab, true); } }, t('wt.lab')) : null;

    nb.append(
      closeBtn,
      h('div', { class: 'topic', text: f.topic }),
      h('h2', { id: 'nb-title', text: f.title }),
      f.tests && h('p', { html: '<strong>' + t('wt.testing') + '</strong> ' + f.tests }),
      f.evidence && h('div', { class: 'evidence-note', html: f.evidence }),
      listBox(t('wt.spot'), f.cues),
      f.example && h('div', { class: 'example-card' },
        h('span', { class: 'label', text: f.example.label || t('wt.example') }),
        h('div', { html: f.example.prompt })),
      h('h3', { text: t('wt.solve') }),
      h('div', { class: 'stepper' }, stepEls),
      h('div', { class: 'stepper-controls' }, backBtn, nextBtn, allBtn, track, status),
      tryBox,
      h('div', { class: 'nb-grid' },
        listBox(t('wt.check'), f.checks),
        listBox(t('wt.mistakes'), f.mistakes),
        listBox(t('wt.vary'), f.variations),
        listBox(t('wt.breaks'), f.boundary),
        listBox(t('wt.prereq'), f.prereqs)),
      h('div', { class: 'lab-actions', style: { marginTop: '18px' } }, mBtn, labBtn)
    );
    close = openModal(nb, { onClose: () => { if (window.drawPatterns) window.drawPatterns(); greet(window.LovelyApp.name); } });
    renderMath(nb);
  }

  // ---------- method finder ----------
  function initFinder() {
    const grid = $('#flip-grid'), q = $('#finder-q');
    const cards = (C.flashcards || []).map((c) => {
      const b = h('button', { class: 'flip', type: 'button', 'aria-pressed': 'false' },
        h('span', { class: 'flip-inner' },
          h('span', { class: 'flip-face flip-front' }, h('span', { class: 'see', text: t('find.see') }), h('span', { class: 'cue', html: c.see })),
          h('span', { class: 'flip-face flip-back' }, h('span', { class: 'see', text: t('find.think') }), h('span', { class: 'think', html: c.think }))));
      b.addEventListener('click', () => { b.classList.toggle('flipped'); b.setAttribute('aria-pressed', String(b.classList.contains('flipped'))); });
      b._text = (c.see + ' ' + c.think + ' ' + (c.tags || '')).replace(/<[^>]+>/g, ' ').toLocaleLowerCase();
      grid.appendChild(b);
      return b;
    });
    renderMath(grid);
    // a property, not addEventListener: a re-render in another language replaces the handler
    q.oninput = () => {
      const s = q.value.trim().toLocaleLowerCase();
      cards.forEach((el) => { el.style.display = !s || el._text.includes(s) ? '' : 'none'; });
    };
    if (q.value) q.oninput();
  }

  function initFormulas() {
    const box = $('#formula-pocket');
    (C.formulas || []).forEach((g) => {
      box.appendChild(h('h4', { style: { margin: '16px 0 4px', fontFamily: 'var(--f-caps)', letterSpacing: '.16em', textTransform: 'uppercase', fontSize: '12.5px', color: 'var(--rose-deep)' }, text: g.title }));
      box.appendChild(h('ul', { style: { margin: '0', paddingLeft: '18px' } }, g.items.map((it) => h('li', { style: { margin: '4px 0' }, html: it }))));
    });
    renderMath(box);
  }

  // ---------- test room ----------
  function initTests() {
    const tests = C.tests || [];
    const picker = $('#test-picker'), area = $('#test-area'), summary = $('#score-summary');
    if (!tests.length) return;
    let active = tests.find((x) => x.id === store.get('test')) || tests[0];
    const scores = store.get('scores', {});
    const marksText = (n) => (n === 1 ? t('test.mark1') : t('test.marks', { n }));

    // timer
    let left = 0, ticking = null;
    const timerEl = h('span', { class: 'timer', 'aria-live': 'off' });
    const timerBtn = h('button', { class: 'btn btn-ghost btn-small', type: 'button' }, t('timer.start'));
    function paintTimer() { const m = Math.floor(left / 60), s = left % 60; timerEl.textContent = m + ':' + String(s).padStart(2, '0'); }
    function resetTimer() { clearInterval(ticking); ticking = null; left = (active.minutes || 0) * 60; timerBtn.textContent = t('timer.start'); paintTimer(); }
    timerBtn.addEventListener('click', () => {
      if (ticking) { clearInterval(ticking); ticking = null; timerBtn.textContent = t('timer.resume'); return; }
      timerBtn.textContent = t('timer.pause');
      ticking = setInterval(() => {
        left = Math.max(0, left - 1);
        paintTimer();
        if (left === 0) { clearInterval(ticking); ticking = null; timerBtn.textContent = t('timer.start'); toast(t('timer.done')); }
      }, 1000);
    });
    cleanups.push(() => clearInterval(ticking));

    tests.forEach((x) => picker.appendChild(h('button', {
      class: 'test-tab', type: 'button', role: 'tab',
      onclick: () => { active = x; store.set('test', x.id); draw(); }
    }, x.title, h('small', { text: x.subtitle || '' }))));

    function questionCard(q, i) {
      const fam = famById(q.family);
      const hint = h('div', { class: 'hint-box', html: '<strong>' + t('hint.label') + '</strong> ' + (q.hint || '') });
      const sol = h('div', { class: 'solution-box' });
      const solBtn = h('button', { class: 'btn btn-lav btn-small sol-btn', type: 'button' }, t('sol.show'));
      solBtn.addEventListener('click', async () => {
        if (!window.LovelyVault || !window.LovelyVault.isOpen()) { toast(t('sol.signin')); return; }
        if (sol.classList.contains('shown')) { sol.classList.remove('shown'); solBtn.textContent = t('sol.show'); return; }
        if (!sol.dataset.loaded) {
          try {
            const html = await window.LovelyVault.reveal(q.sol);
            sol.innerHTML = '<h5>' + t('sol.title') + '</h5>' + (html || '<p>' + t('sol.missing') + '</p>');
            sol.dataset.loaded = '1';
            renderMath(sol);
          } catch (e) { toast(t('sol.error')); return; }
        }
        sol.classList.add('shown');
        solBtn.textContent = t('sol.hide');
      });
      const score = h('span', { class: 'self-score', role: 'group', 'aria-label': t('score.aria') },
        [['2', t('score.got')], ['1', t('score.partly')], ['0', t('score.missed')]].map(([v, label]) => h('button', {
          type: 'button', 'data-score': v, class: scores[q.id] === +v ? 'on' : '',
          onclick: (e) => {
            scores[q.id] = +v;
            store.set('scores', scores);
            $$('button', e.currentTarget.parentNode).forEach((b) => b.classList.toggle('on', b === e.currentTarget));
            if (v === '2') burstFrom(e.currentTarget, 10);
            drawSummary();
          }
        }, label)));
      return h('article', { class: 'q-card paper' },
        h('div', { class: 'q-head' },
          h('span', { class: 'q-num', text: t('q.prefix') + (i + 1) }),
          q.marks && h('span', { class: 'chip lav', text: marksText(q.marks) }),
          fam && h('span', { class: 'chip ghost', text: fam.short || fam.title })),
        h('div', { class: 'q-body', html: q.body }),
        h('div', { class: 'q-tools' },
          q.hint && h('button', { class: 'btn btn-ghost btn-small', type: 'button', onclick: () => { hint.classList.toggle('shown'); renderMath(hint); } }, t('try.hint')),
          solBtn, score),
        hint, sol);
    }

    function drawSummary() {
      const qs = active.questions;
      const marked = qs.filter((q) => scores[q.id] != null);
      summary.innerHTML = '';
      if (!marked.length) return;
      const pts = marked.reduce((a, q) => a + scores[q.id], 0);
      const by = {};
      marked.forEach((q) => { const b = by[q.family] || (by[q.family] = { got: 0, max: 0 }); b.got += scores[q.id]; b.max += 2; });
      const rows = Object.keys(by).sort((a, b) => by[a].got / by[a].max - by[b].got / by[b].max).map((fid) => {
        const fam = famById(fid);
        return h('div', { class: 'score-bar' },
          h('span', { text: fam ? fam.short || fam.title : fid }),
          h('span', { class: 'track' }, h('span', { class: 'fill', style: { width: (by[fid].got / by[fid].max) * 100 + '%' } })),
          h('span', { text: by[fid].got + '/' + by[fid].max }));
      });
      summary.appendChild(h('div', { class: 'score-summary paper' },
        h('h3', { style: { fontFamily: 'var(--f-title)', fontSize: '32px', margin: '0' }, text: t('score.title', { pct: Math.round((pts / (marked.length * 2)) * 100) }) }),
        h('p', { style: { margin: '4px 0 0', color: 'var(--ink-soft)' }, text: t('score.sub', { n: marked.length, total: qs.length }) }),
        h('div', { class: 'score-bars' }, rows)));
    }

    function draw() {
      $$('.test-tab', picker).forEach((b, i) => { b.classList.toggle('active', tests[i] === active); b.setAttribute('aria-selected', String(tests[i] === active)); });
      area.innerHTML = '';
      resetTimer();
      area.appendChild(h('div', { class: 'test-meta' },
        h('span', { class: 'chip', text: t('test.questions', { n: active.questions.length }) }),
        active.marks && h('span', { class: 'chip lav', text: marksText(active.marks) }),
        active.minutes && h('span', { class: 'chip butter', text: t('test.minutes', { n: active.minutes }) }),
        active.minutes && timerEl, active.minutes && timerBtn));
      if (active.intro) area.appendChild(h('p', { html: active.intro, style: { color: 'var(--ink-soft)' } }));
      active.questions.forEach((q, i) => area.appendChild(questionCard(q, i)));
      renderMath(area);
      drawSummary();
    }
    draw();
  }

  // ---------- plan ----------
  function initPlan() {
    const plan = C.plan || [];
    const grid = $('#plan-grid');
    const done = store.get('plan', {});
    const ids = [];
    plan.forEach((d, di) => {
      const list = h('ul', { class: 'check-list' });
      d.tasks.forEach((task, ti) => {
        const id = 'd' + di + 't' + ti;
        ids.push(id);
        const cb = h('input', { type: 'checkbox', id: 'cb-' + id });
        cb.checked = !!done[id];
        cb.addEventListener('change', () => {
          done[id] = cb.checked;
          store.set('plan', done);
          ring();
          if (cb.checked) burstFrom(cb, 8);
        });
        list.appendChild(h('li', {}, h('label', { for: 'cb-' + id }, cb, h('span', { html: task }))));
      });
      grid.appendChild(h('article', { class: 'day-card' },
        h('span', { class: 'tape ' + ['', 'lav', 'mint'][di % 3] }),
        h('h3', { text: d.title }),
        d.focus && h('div', { class: 'focus', html: d.focus }),
        list));
    });
    function ring() {
      const n = ids.filter((id) => done[id]).length;
      const pct = ids.length ? Math.round((n / ids.length) * 100) : 0;
      $('#ring-fg').style.strokeDashoffset = String(251.3 * (1 - pct / 100));
      $('#ring-text').textContent = pct + '%';
      $('#plan-cheer').textContent = t(pct === 100 ? 'plan.cheer3' : pct >= 50 ? 'plan.cheer2' : pct > 0 ? 'plan.cheer1' : 'plan.cheer0');
    }
    ring();
    renderMath(grid);
  }

  // ---------- boot ----------
  // The page shell (nav, petals, doodles) starts now; content waits for the sign-in in auth.js.
  let started = false;
  const cleanups = []; // timers to stop before a re-render
  function render(content) {
    C = content || {};
    families = C.families || [];
    window.LOVELY_CONTENT = C; // labs.js reads labOrder from here
    initPatterns();
    initFinder();
    initFormulas();
    initTests();
    initPlan();
    if (window.LovelyLabs) window.LovelyLabs.init({ tabs: $('#lab-tabs'), area: $('#lab-area'), renderMath });
    if (C.footer) $('#footer-note').innerHTML = C.footer;
    greet(window.LovelyApp.name);
  }
  function start(content, opts) {
    if (started) return;
    started = true;
    window.LovelyApp.name = opts && opts.name;
    try { localStorage.removeItem('lm:student'); } catch (e) { /* left over from the old student card */ }
    render(content);
    if (window.LovelyApp.name) toast(t('welcome', { name: window.LovelyApp.name }));
  }
  // Language switch: rebuild every content section in place and keep the reader where they were.
  function restart(content) {
    if (!started) return start(content, { name: window.LovelyApp.name });
    const anchor = $$('main section[id]').find((s) => s.getBoundingClientRect().bottom > 80);
    const before = anchor ? anchor.getBoundingClientRect().top : 0;
    cleanups.splice(0).forEach((fn) => fn());
    ['#evidence-strip', '#pattern-filters', '#pattern-grid', '#flip-grid', '#formula-pocket', '#test-picker', '#test-area', '#score-summary', '#plan-grid']
      .forEach((s) => { $(s).innerHTML = ''; });
    if (window.LovelyLabs) window.LovelyLabs.reset();
    render(content);
    const keep = () => { if (anchor) window.scrollBy({ top: anchor.getBoundingClientRect().top - before, behavior: 'instant' }); };
    keep();
    // Turkish letters can pull in extra font files that reflow the page a moment later
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => requestAnimationFrame(keep));
    toast(t('lang.switched'));
  }
  window.LovelyApp = { toast, hearts, renderMath, store, start, restart, name: null };
  initNav();
  initPetals();
  initDoodles();
})();
