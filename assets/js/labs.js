/* Lovely Math — interactive labs (cobwebs, tangents, Taylor, optimization, Newton, area, rhythms). */
(function () {
  'use strict';
  const Plot = window.LovelyPlot;
  const T = (k, v) => (window.LovelyI18n ? window.LovelyI18n.t(k, v) : k);
  const fmt = (v, d) => {
    if (!Number.isFinite(v)) return v > 0 ? '∞' : v < 0 ? '−∞' : '—';
    const s = Math.abs(v) < 1e-10 ? '0' : String(parseFloat(v.toFixed(d == null ? 4 : d)));
    return s.replace('-', '−');
  };
  const h = (tag, attrs, html) => {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  };
  const numDeriv = (f, x) => { const e = 1e-5 * Math.max(1, Math.abs(x)); return (f(x + e) - f(x - e)) / (2 * e); };

  // ---------- shared UI pieces ----------
  function slider(panel, o) {
    const id = 'lab-' + o.key + '-' + Math.random().toString(36).slice(2, 7);
    const wrap = h('div', { class: 'control' });
    wrap.innerHTML = `<label for="${id}"><span>${o.label}</span><output></output></label>`;
    const inp = h('input', { type: 'range', id, min: o.min, max: o.max, step: o.step, value: o.value });
    wrap.appendChild(inp);
    panel.appendChild(wrap);
    const out = wrap.querySelector('output');
    const show = () => { out.textContent = (o.format || ((v) => fmt(v, 3)))(+inp.value); };
    inp.addEventListener('input', () => { show(); o.onchange && o.onchange(+inp.value); });
    show();
    return { get value() { return +inp.value; }, set value(v) { inp.value = v; show(); }, el: inp, setRange(min, max, step) { inp.min = min; inp.max = max; if (step) inp.step = step; show(); } };
  }
  function select(panel, label, options, onchange) {
    const id = 'lab-sel-' + Math.random().toString(36).slice(2, 7);
    const wrap = h('div', { class: 'control' }, `<label for="${id}"><span>${label}</span></label>`);
    const sel = h('select', { id });
    options.forEach((o, i) => { const op = h('option', { value: i }); op.textContent = o; sel.appendChild(op); });
    sel.addEventListener('change', () => onchange(+sel.value));
    wrap.appendChild(sel);
    panel.appendChild(wrap);
    return sel;
  }
  function frame(root, title, intro) {
    const stage = h('div', { class: 'lab-stage paper grid-paper' });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    stage.appendChild(h('span', { class: 'tape', style: 'top:-14px;left:40px;transform:rotate(-5deg)' }));
    stage.appendChild(svg);
    const panel = h('div', { class: 'lab-panel paper' });
    panel.appendChild(h('h3', null, title));
    panel.appendChild(h('p', null, intro));
    root.appendChild(stage);
    root.appendChild(panel);
    return { stage, svg, panel };
  }
  function readout(panel) { const r = h('div', { class: 'readout', 'aria-live': 'polite' }); panel.appendChild(r); return r; }

  // ---------- function library with exact derivatives ----------
  const FUNCS = {
    'x²': { f: (x) => x * x, d: (k, x) => [x * x, 2 * x, 2][k] ?? 0, view: [-3, 3, -1, 6] },
    'x³ − 3x': { f: (x) => x ** 3 - 3 * x, d: (k, x) => [x ** 3 - 3 * x, 3 * x * x - 3, 6 * x, 6][k] ?? 0, view: [-2.6, 2.6, -4, 4] },
    'eˣ': { f: Math.exp, d: (k, x) => Math.exp(x), view: [-3, 2.5, -1, 8] },
    'sin x': { f: Math.sin, d: (k, x) => [Math.sin(x), Math.cos(x), -Math.sin(x), -Math.cos(x)][k % 4], view: [-6.5, 6.5, -2, 2] },
    'cos x': { f: Math.cos, d: (k, x) => [Math.cos(x), -Math.sin(x), -Math.cos(x), Math.sin(x)][k % 4], view: [-6.5, 6.5, -2, 2] },
    'ln x': { f: Math.log, d: (k, x) => (k === 0 ? Math.log(x) : ((k % 2 ? 1 : -1) * fact(k - 1)) / x ** k), view: [-0.3, 5, -3, 2.5], dom: (x) => x > 0 },
    '√x': { f: Math.sqrt, d: (k, x) => { let c = 1; for (let j = 0; j < k; j++) c *= 0.5 - j; return c * x ** (0.5 - k); }, view: [-0.3, 6, -0.5, 3], dom: (x) => x > 0 },
    'x·e⁻ˣ': { f: (x) => x * Math.exp(-x), d: (k, x) => (k % 2 ? -1 : 1) * (x - k) * Math.exp(-x), view: [-0.5, 6, -0.6, 0.6] }
  };
  function fact(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }

  // ================= LAB 1: cobweb garden =================
  const MODELS = [
    { name: 'lab.m.linear', f: (x, p) => p.a * x + p.b, params: [['a', 'lab.p.a', -1.4, 1.4, 0.01, 0.5], ['b', 'lab.p.b', -4, 8, 0.1, 4]], view: () => [-2, 16, -2, 16], x0: [0, 15, 0.1, 1] },
    { name: 'lab.m.logistic', f: (x, p) => p.r * x * (1 - x), params: [['r', 'lab.p.r', 0.2, 4, 0.01, 2.8]], view: () => [0, 1, 0, 1], x0: [0.01, 0.99, 0.01, 0.15] },
    { name: 'lab.m.bh', f: (x, p) => (p.r * x) / (1 + x), params: [['r', 'lab.p.rmax', 0.3, 6, 0.01, 3]], view: (p) => { const m = Math.max(2, p.r) * 1.25; return [0, m, 0, m]; }, x0: [0.05, 7, 0.05, 0.4] },
    { name: 'lab.m.ricker', f: (x, p) => p.r * x * Math.exp(-x), params: [['r', 'lab.p.r', 0.5, 16, 0.05, 5]], view: (p) => { const m = Math.max(1.5, (p.r / Math.E) * 1.3 + 0.3); return [0, Math.max(m, Math.log(p.r) * 1.6 + 0.5), 0, m]; }, x0: [0.05, 4, 0.05, 0.3] }
  ];

  function cobwebLab(root) {
    const { svg, panel } = frame(root, T('lab.tab.cobweb'), T('lab.cobweb.intro'));
    const tsWrap = h('div', { style: 'margin-top:12px' });
    const ts = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    tsWrap.appendChild(ts);
    svg.parentNode.appendChild(tsWrap);
    const P = new Plot(svg, { width: 560, height: 420 });
    const TS = new Plot(ts, { width: 560, height: 170, pad: 30 });
    let model = MODELS[0];
    let sliders = {};
    const paramBox = h('div');
    select(panel, T('lab.model'), MODELS.map((m) => T(m.name)), (i) => { model = MODELS[i]; buildParams(); draw(); });
    panel.appendChild(paramBox);
    const x0s = slider(panel, { key: 'x0', label: T('lab.x0'), min: 0, max: 15, step: 0.1, value: 1, onchange: () => draw() });
    const ns = slider(panel, { key: 'n', label: T('lab.steps'), min: 1, max: 60, step: 1, value: 12, format: (v) => String(v), onchange: () => draw() });
    const out = readout(panel);
    const actions = h('div', { class: 'lab-actions' });
    const play = h('button', { class: 'btn btn-rose btn-small', type: 'button' }, T('lab.animate'));
    actions.appendChild(play);
    panel.appendChild(actions);
    let anim = null;

    function buildParams() {
      paramBox.innerHTML = '';
      sliders = {};
      model.params.forEach(([k, label, min, max, step, val]) => { sliders[k] = slider(paramBox, { key: k, label: T(label), min, max, step, value: val, onchange: () => draw() }); });
      x0s.setRange(model.x0[0], model.x0[1], model.x0[2]);
      x0s.value = model.x0[3];
    }
    const params = () => { const p = {}; for (const k in sliders) p[k] = sliders[k].value; return p; };

    function equilibria(f, lo, hi) {
      const g = (x) => f(x) - x, roots = [], N = 1200;
      let px = lo, pg = g(lo);
      if (Math.abs(pg) < 1e-9) roots.push(lo);
      for (let i = 1; i <= N; i++) {
        const x = lo + ((hi - lo) * i) / N, gx = g(x);
        if (Math.abs(gx) < 1e-12) { roots.push(x); }
        else if (pg * gx < 0) {
          let a = px, b = x;
          for (let j = 0; j < 60; j++) { const m = (a + b) / 2; (g(a) * g(m) <= 0) ? (b = m) : (a = m); }
          roots.push((a + b) / 2);
        }
        px = x; pg = gx;
      }
      return roots.filter((r, i) => i === 0 || Math.abs(r - roots[i - 1]) > 1e-6);
    }

    function draw(limit) {
      const p = params(), f = (x) => model.f(x, p);
      let [x1, x2, y1, y2] = model.view(p);
      if (model === MODELS[0]) { const span = Math.max(16, x0s.value + 4); x2 = span; y2 = span; }
      P.view(x1, x2, y1, y2).clear().grid().axes({ xlabel: 'xₜ', ylabel: 'xₜ₊₁' });
      P.fn((x) => x, { color: '#bca8e6', width: 2, dash: '6 6' });
      P.fn(f, { color: '#d76a8b', width: 3 });
      const n = ns.value, pts = [];
      let x = x0s.value;
      const traj = [x];
      pts.push([x, y1 < 0 && y2 > 0 ? 0 : y1]);
      const steps = limit == null ? n : Math.min(limit, n);
      for (let i = 0; i < n; i++) {
        const y = f(x);
        traj.push(y);
        if (i < steps) { pts.push([x, y]); pts.push([y, y]); }
        x = y;
        if (!Number.isFinite(x) || Math.abs(x) > 1e6) break;
      }
      P.poly(pts, { color: '#8b6fc6', width: 1.8 });
      P.dot(x0s.value, y1 < 0 && y2 > 0 ? 0 : y1, { r: 5, color: '#8b6fc6' });
      const eqs = equilibria(f, Math.min(x1, -1e-9), x2);
      let html = '<strong>' + T('lab.eq.head') + '</strong><br>';
      if (!eqs.length) html += T('lab.eq.none') + '<br>';
      eqs.forEach((e) => {
        P.dot(e, e, { r: 6, color: '#b13a64', fill: '#fff' });
        const d = numDeriv(f, e), ad = Math.abs(d);
        const cls = ad < 0.999 ? 'stable' : ad > 1.001 ? 'unstable' : 'neutral';
        const kind = ad < 0.999 ? T(d < 0 ? 'lab.v.stableOsc' : 'lab.v.stableMono') : ad > 1.001 ? T(d < -1 ? 'lab.v.unstableOsc' : 'lab.v.unstable') : T('lab.v.inconclusive');
        html += `<div class="verdict ${cls}">x* = ${fmt(e, 3)} · f′(x*) = ${fmt(d, 3)} → ${kind}</div>`;
      });
      out.innerHTML = html;
      // time series
      const tmax = traj.length - 1;
      const vals = traj.filter(Number.isFinite);
      const lo = Math.min(0, ...vals), hi = Math.max(1e-6, ...vals) * 1.1;
      TS.view(0, Math.max(1, tmax), lo, hi === lo ? lo + 1 : hi).clear().grid().axes({ xlabel: 't', ylabel: 'xₜ' });
      TS.poly(traj.map((v, i) => [i, v]).filter((q) => Number.isFinite(q[1])), { color: '#d76a8b', width: 2 });
      traj.forEach((v, i) => { if (Number.isFinite(v) && i <= 60) TS.dot(i, v, { r: 2.6, color: '#d76a8b', width: 1.5 }); });
    }
    play.addEventListener('click', () => {
      clearInterval(anim);
      let k = 0;
      anim = setInterval(() => { draw(k++); if (k > ns.value) clearInterval(anim); }, 380);
    });
    buildParams();
    draw();
  }

  // ================= LAB 2: secant to tangent =================
  function tangentLab(root) {
    const names = Object.keys(FUNCS);
    let F = FUNCS[names[0]];
    const { svg, panel } = frame(root, T('lab.tab.tangent'), T('lab.tangent.intro'));
    const P = new Plot(svg, { width: 560, height: 420 });
    select(panel, T('lab.function'), names, (i) => { F = FUNCS[names[i]]; a.setRange(F.view[0] + 0.3, F.view[1] - 0.3, 0.01); a.value = 1; draw(); });
    const a = slider(panel, { key: 'a', label: T('lab.pointA'), min: -2.7, max: 2.7, step: 0.01, value: 1, onchange: () => draw() });
    const hs = slider(panel, { key: 'h', label: T('lab.gapH'), min: -3, max: 0.3, step: 0.01, value: 0, format: (v) => fmt(Math.pow(10, v), 4), onchange: () => draw() });
    const out = readout(panel);
    let dragging = false;
    svg.addEventListener('pointerdown', (e) => { dragging = true; svg.setPointerCapture(e.pointerId); move(e); });
    svg.addEventListener('pointermove', (e) => { if (dragging) move(e); });
    svg.addEventListener('pointerup', () => { dragging = false; });
    function move(e) { const p = P.pointer(e); a.value = Math.min(+a.el.max, Math.max(+a.el.min, p.x)); draw(); }
    function draw() {
      const [x1, x2, y1, y2] = F.view;
      const A = a.value, H = Math.pow(10, hs.value), fa = F.f(A), fb = F.f(A + H);
      P.view(x1, x2, y1, y2).clear().grid().axes({ xlabel: 'x', ylabel: 'y' });
      P.fn(F.f, { color: '#d76a8b', width: 3, from: F.dom ? Math.max(x1, 1e-3) : x1 });
      const m = (fb - fa) / H, d = F.d(1, A);
      if (Number.isFinite(m)) P.fn((x) => fa + m * (x - A), { color: '#8b6fc6', width: 2 });
      if (Number.isFinite(d)) P.fn((x) => fa + d * (x - A), { color: '#3a8a69', width: 2, dash: '7 6' });
      P.dot(A, fa, { r: 6 });
      if (Number.isFinite(fb)) P.dot(A + H, fb, { r: 5, color: '#8b6fc6' });
      const rows = [1, 0.1, 0.01, 0.001].map((hh) => `<tr><td>${hh}</td><td>${fmt((F.f(A + hh) - fa) / hh, 5)}</td></tr>`).join('');
      out.innerHTML = `<div>${T('lab.secantSlope')} <strong>[f(a+h) − f(a)] / h = ${fmt(m, 5)}</strong></div>
        <div class="verdict stable">${T('lab.tangentSlope')} f′(${fmt(A, 2)}) = ${fmt(d, 5)}</div>
        <table style="width:100%;margin-top:8px;font-size:14px"><tr><th align="left">h</th><th align="left">${T('lab.dq')}</th></tr>${rows}</table>
        <div class="hand" style="font-size:19px;color:var(--ink-soft)">${T('lab.legend')}</div>`;
    }
    draw();
  }

  // ================= LAB 3: tangent line and Taylor =================
  function taylorLab(root) {
    const names = ['eˣ', 'sin x', 'cos x', 'ln x', '√x', 'x·e⁻ˣ'];
    let F = FUNCS[names[0]];
    const { svg, panel } = frame(root, T('lab.tab.taylor'), T('lab.taylor.intro'));
    const P = new Plot(svg, { width: 560, height: 420 });
    select(panel, T('lab.function'), names, (i) => { F = FUNCS[names[i]]; a.setRange(F.dom ? 0.3 : F.view[0] + 0.5, F.view[1] - 0.5, 0.01); a.value = F.dom ? 1 : 0; xs.setRange(F.dom ? 0.05 : F.view[0], F.view[1], 0.01); draw(); });
    const a = slider(panel, { key: 'a', label: T('lab.centre'), min: -2.5, max: 2, step: 0.01, value: 0, onchange: () => draw() });
    const n = slider(panel, { key: 'n', label: T('lab.degree'), min: 1, max: 6, step: 1, value: 1, format: (v) => String(v), onchange: () => draw() });
    const xs = slider(panel, { key: 'x', label: T('lab.estAt'), min: -3, max: 2.5, step: 0.01, value: 0.5, onchange: () => draw() });
    const out = readout(panel);
    function draw() {
      const [x1, x2, y1, y2] = F.view, A = a.value, N = n.value;
      const c = []; for (let k = 0; k <= N; k++) c.push(F.d(k, A) / fact(k));
      const Tn = (x) => c.reduce((s, ck, k) => s + ck * Math.pow(x - A, k), 0);
      P.view(x1, x2, y1, y2).clear().grid().axes({ xlabel: 'x', ylabel: 'y' });
      P.fn(F.f, { color: '#d76a8b', width: 3, from: F.dom ? 1e-3 : x1 });
      P.fn(Tn, { color: '#8b6fc6', width: 2.4, dash: N === 1 ? null : '8 5' });
      P.dot(A, F.f(A), { r: 6 });
      const X = xs.value, fx = F.f(X), tx = Tn(X);
      P.line(X, Math.min(y1, 0), X, y2, { color: '#ec9ab3', width: 1, dash: '3 5' });
      P.dot(X, tx, { r: 5, color: '#8b6fc6' });
      const base = Math.abs(A) < 1e-9 ? 'x' : `(x ${A < 0 ? '+' : '−'} ${fmt(Math.abs(A), 2)})`;
      const terms = c
        .map((ck, k) => {
          if (Math.abs(ck) < 1e-10 && k > 0) return null;
          if (k === 0) return fmt(ck, 4);
          const coef = Math.abs(Math.abs(ck) - 1) < 1e-10 ? (ck < 0 ? '−' : '') : fmt(ck, 4);
          return coef + base + (k > 1 ? '<sup>' + k + '</sup>' : '');
        })
        .filter(Boolean)
        .join(' + ')
        .replace(/\+ −/g, '− ');
      out.innerHTML = `<div><strong>P<sub>${N}</sub>(x) =</strong> ${terms}</div>
        <div style="margin-top:6px">${T('lab.true')} f(${fmt(X, 2)}) = ${fmt(fx, 5)} · ${T('lab.estimate')} P<sub>${N}</sub>(${fmt(X, 2)}) = ${fmt(tx, 5)}</div>
        <div class="verdict ${Math.abs(fx - tx) < 0.01 ? 'stable' : 'unstable'}">${T('lab.error')} = ${fmt(Math.abs(fx - tx), 5)}</div>`;
    }
    draw();
  }

  // ================= LAB 4: optimization =================
  const OPT = [
    { name: 'lab.o.harvest', f: (x) => x * (1 - x / 2), d: (x) => 1 - x, I: [0, 2], label: 'lab.o.effort' },
    { name: 'lab.o.drug', f: (x) => 5 * x * Math.exp(-x / 2), d: (x) => 5 * Math.exp(-x / 2) * (1 - x / 2), I: [0, 10], label: 'lab.o.time' },
    { name: 'lab.o.forage', f: (x) => x / (x + 1) / (x + 2), d: (x) => numDeriv((y) => y / (y + 1) / (y + 2), x), I: [0, 6], label: 'lab.o.patch' },
    { name: 'lab.o.cubic', f: (x) => x ** 3 - 3 * x * x + 1, d: (x) => 3 * x * x - 6 * x, I: [-1, 3], label: null }
  ];
  function optimizationLab(root) {
    let M = OPT[0];
    const { svg, panel } = frame(root, T('lab.tab.optimize'), T('lab.opt.intro'));
    const P = new Plot(svg, { width: 560, height: 420 });
    select(panel, T('lab.model'), OPT.map((m) => T(m.name)), (i) => { M = OPT[i]; xs.setRange(M.I[0], M.I[1], (M.I[1] - M.I[0]) / 400); xs.value = (M.I[0] + M.I[1]) / 3; draw(); });
    const xs = slider(panel, { key: 'x', label: T('lab.move'), min: 0, max: 2, step: 0.005, value: 0.5, onchange: () => draw() });
    const out = readout(panel);
    function crit() {
      const [lo, hi] = M.I, res = [], N = 2000;
      let px = lo, pd = M.d(lo);
      for (let i = 1; i < N; i++) {
        const x = lo + ((hi - lo) * i) / N, dx = M.d(x);
        if (Math.abs(dx) < 1e-12) res.push(x); // landed exactly on a critical point
        else if (pd * dx < 0) { let a = px, b = x; for (let j = 0; j < 60; j++) { const m = (a + b) / 2; M.d(a) * M.d(m) <= 0 ? (b = m) : (a = m); } res.push((a + b) / 2); }
        px = x; pd = dx;
      }
      return res.filter((r, i) => i === 0 || Math.abs(r - res[i - 1]) > 1e-6);
    }
    function draw() {
      const [lo, hi] = M.I;
      let ymin = Infinity, ymax = -Infinity;
      for (let i = 0; i <= 200; i++) { const y = M.f(lo + ((hi - lo) * i) / 200); ymin = Math.min(ymin, y); ymax = Math.max(ymax, y); }
      const pad = (ymax - ymin) * 0.15 || 1;
      P.view(lo - (hi - lo) * 0.05, hi + (hi - lo) * 0.05, Math.min(0, ymin - pad), ymax + pad).clear().grid().axes({ xlabel: M.label ? T(M.label) : 'x', ylabel: 'f' });
      P.fn(M.f, { color: '#d76a8b', width: 3, from: lo, to: hi });
      const X = xs.value, slope = M.d(X);
      P.fn((x) => M.f(X) + slope * (x - X), { color: '#8b6fc6', width: 1.8, dash: '6 5', from: Math.max(lo, X - (hi - lo) * 0.2), to: Math.min(hi, X + (hi - lo) * 0.2) });
      P.dot(X, M.f(X), { r: 6, color: '#8b6fc6' });
      const cands = [[lo, T('lab.endpoint')], ...crit().map((c) => [c, T('lab.critical')]), [hi, T('lab.endpoint')]];
      let best = cands[0], worst = cands[0];
      cands.forEach((c) => { if (M.f(c[0]) > M.f(best[0])) best = c; if (M.f(c[0]) < M.f(worst[0])) worst = c; });
      cands.forEach((c) => P.dot(c[0], M.f(c[0]), { r: 5, color: c === best ? '#3a8a69' : '#b13a64' }));
      const rows = cands.map((c) => `<tr><td>${c[1]}</td><td>${fmt(c[0], 4)}</td><td>${fmt(M.f(c[0]), 4)}</td></tr>`).join('');
      out.innerHTML = `<div>${T('lab.slopeHere')}: f′ = <strong>${fmt(slope, 4)}</strong> (${slope > 1e-6 ? T('lab.rising') : slope < -1e-6 ? T('lab.falling') : T('lab.flat')})</div>
        <table style="width:100%;margin-top:8px;font-size:14px"><tr><th align="left">${T('lab.candidate')}</th><th align="left">x</th><th align="left">f(x)</th></tr>${rows}</table>
        <div class="verdict stable">${T('lab.absMax', { v: fmt(M.f(best[0]), 4), x: fmt(best[0], 4) })}</div>
        <div class="verdict unstable">${T('lab.absMin', { v: fmt(M.f(worst[0]), 4), x: fmt(worst[0], 4) })}</div>`;
    }
    xs.setRange(M.I[0], M.I[1], 0.005);
    draw();
  }

  // ================= LAB 5: Newton's method =================
  const NEWTON = [
    { name: 'lab.n.sqrt2', f: (x) => x * x - 2, d: (x) => 2 * x, view: [-0.5, 3, -3, 7], x0: 2 },
    { name: 'cos x − x', f: (x) => Math.cos(x) - x, d: (x) => -Math.sin(x) - 1, view: [-1, 2, -2.5, 1.5], x0: 1.5 },
    { name: 'eˣ − 3', f: (x) => Math.exp(x) - 3, d: (x) => Math.exp(x), view: [-1, 3, -4, 12], x0: 2.5 },
    { name: 'x³ − 2x − 5', f: (x) => x ** 3 - 2 * x - 5, d: (x) => 3 * x * x - 2, view: [0, 3.5, -10, 25], x0: 3 }
  ];
  function newtonLab(root) {
    let M = NEWTON[0];
    const { svg, panel } = frame(root, T('lab.tab.newton'), T('lab.newton.intro'));
    const P = new Plot(svg, { width: 560, height: 420 });
    select(panel, T('lab.equation'), NEWTON.map((m) => T(m.name)), (i) => { M = NEWTON[i]; x0.setRange(M.view[0] + 0.05, M.view[1] - 0.05, 0.01); x0.value = M.x0; draw(); });
    const x0 = slider(panel, { key: 'x0', label: T('lab.firstGuess'), min: -0.45, max: 2.95, step: 0.01, value: 2, onchange: () => draw() });
    const steps = slider(panel, { key: 'k', label: T('lab.stepsShown'), min: 1, max: 6, step: 1, value: 3, format: (v) => String(v), onchange: () => draw() });
    const out = readout(panel);
    function draw() {
      const [x1, x2, y1, y2] = M.view;
      P.view(x1, x2, y1, y2).clear().grid().axes({ xlabel: 'x', ylabel: 'y' });
      P.fn(M.f, { color: '#d76a8b', width: 3 });
      let x = x0.value;
      let rows = `<tr><td>0</td><td>${fmt(x, 6)}</td></tr>`;
      for (let k = 1; k <= steps.value; k++) {
        const fx = M.f(x), dx = M.d(x);
        if (Math.abs(dx) < 1e-12) { rows += `<tr><td colspan="2">${T('lab.flatFail')}</td></tr>`; break; }
        const nx = x - fx / dx;
        P.line(x, 0, x, fx, { color: '#ec9ab3', width: 1.2, dash: '3 4' });
        P.line(x, fx, nx, 0, { color: '#8b6fc6', width: 2 });
        P.dot(x, fx, { r: 4, color: '#8b6fc6' });
        x = nx;
        rows += `<tr><td>${k}</td><td>${fmt(x, 6)}</td></tr>`;
      }
      P.dot(x, 0, { r: 6, color: '#3a8a69' });
      out.innerHTML = `<table style="width:100%;font-size:14px"><tr><th align="left">n</th><th align="left">xₙ</th></tr>${rows}</table><div class="verdict stable">${T('lab.lastStep')} = ${fmt(M.f(x), 8)}</div>`;
    }
    draw();
  }

  // ================= LAB 6: area and the FTC =================
  const AREA = [
    { name: 'lab.a.x2', f: (x) => x * x, F: (x) => (x ** 3) / 3, a: 0, bmax: 3, Ftex: 'x³/3' },
    { name: 'lab.a.xex', f: (x) => x * Math.exp(-x), F: (x) => -(x + 1) * Math.exp(-x), a: 0, bmax: 6, Ftex: '−(x+1)e⁻ˣ' },
    { name: 'lab.a.inv', f: (x) => 1 / x, F: Math.log, a: 1, bmax: 6, Ftex: 'ln x' },
    { name: 'lab.a.sin', f: Math.sin, F: (x) => -Math.cos(x), a: 0, bmax: 6.28, Ftex: '−cos x' }
  ];
  function areaLab(root) {
    let M = AREA[0];
    const { svg, panel } = frame(root, T('lab.tab.area'), T('lab.area.intro'));
    const P = new Plot(svg, { width: 560, height: 420 });
    select(panel, T('lab.integrand'), AREA.map((m) => T(m.name)), (i) => { M = AREA[i]; b.setRange(M.a + 0.2, M.bmax, 0.01); b.value = M.bmax * 0.7; draw(); });
    const b = slider(panel, { key: 'b', label: T('lab.upper'), min: 0.2, max: 3, step: 0.01, value: 2, onchange: () => draw() });
    const n = slider(panel, { key: 'n', label: T('lab.rects'), min: 1, max: 60, step: 1, value: 6, format: (v) => String(v), onchange: () => draw() });
    let rule = 'left';
    select(panel, T('lab.heights'), [T('lab.left'), T('lab.right'), T('lab.mid')], (i) => { rule = ['left', 'right', 'mid'][i]; draw(); });
    const out = readout(panel);
    function draw() {
      const A = M.a, B = b.value, N = n.value, w = (B - A) / N;
      let ymin = 0, ymax = 0;
      for (let i = 0; i <= 200; i++) { const y = M.f(A + ((M.bmax - A) * i) / 200); ymin = Math.min(ymin, y); ymax = Math.max(ymax, y); }
      P.view(Math.min(0, A) - 0.1, M.bmax + 0.1, ymin - 0.15 * (ymax - ymin || 1), ymax * 1.15 + 0.05).clear().grid().axes({ xlabel: 'x', ylabel: 'y' });
      let sum = 0;
      for (let i = 0; i < N; i++) {
        const xl = A + i * w, xm = rule === 'left' ? xl : rule === 'right' ? xl + w : xl + w / 2, y = M.f(xm);
        sum += y * w;
        P.el('rect', { x: P.X(xl), y: P.Y(Math.max(0, y)), width: Math.max(0.5, P.X(xl + w) - P.X(xl)), height: Math.abs(P.Y(0) - P.Y(y)), fill: y >= 0 ? 'rgba(188,168,230,.45)' : 'rgba(236,154,179,.45)', stroke: '#8b6fc6', 'stroke-width': 1 });
      }
      P.fn(M.f, { color: '#d76a8b', width: 3, from: M.a === 1 ? 0.15 : Math.min(0, A) });
      const exact = M.F(B) - M.F(A);
      out.innerHTML = `<div>${T('lab.riemann', { rule: T('lab.rule.' + rule), n: N })}: <strong>${fmt(sum, 5)}</strong></div>
        <div>${T('lab.exact', { F: M.Ftex })}: <strong>${fmt(exact, 5)}</strong></div>
        <div class="verdict ${Math.abs(sum - exact) < 0.01 ? 'stable' : 'neutral'}">${T('lab.error')} = ${fmt(Math.abs(sum - exact), 5)}</div>`;
    }
    draw();
  }

  // ================= LAB 7: rhythms (trig models) =================
  function rhythmLab(root) {
    const { svg, panel } = frame(root, T('lab.tab.rhythm'), T('lab.rhythm.intro'));
    const P = new Plot(svg, { width: 560, height: 420 });
    const Ms = slider(panel, { key: 'M', label: T('lab.r.M'), min: -10, max: 20, step: 0.5, value: 6, onchange: () => draw() });
    const As = slider(panel, { key: 'A', label: T('lab.r.A'), min: 0, max: 20, step: 0.5, value: 15, onchange: () => draw() });
    const Ps = slider(panel, { key: 'P', label: T('lab.r.P'), min: 3, max: 24, step: 0.5, value: 12, onchange: () => draw() });
    const t0s = slider(panel, { key: 't0', label: T('lab.r.t0'), min: 0, max: 12, step: 0.1, value: 6.5, onchange: () => draw() });
    const ts = slider(panel, { key: 't', label: T('lab.r.t'), min: 0, max: 24, step: 0.1, value: 3, onchange: () => draw() });
    const out = readout(panel);
    panel.appendChild(h('p', { class: 'hand', style: 'font-size:18px' }, T('lab.r.note')));
    function draw() {
      const M = Ms.value, A = As.value, Pp = Ps.value, t0 = t0s.value, t = ts.value;
      const f = (x) => M + A * Math.cos((2 * Math.PI * (x - t0)) / Pp);
      const d = (x) => ((-A * 2 * Math.PI) / Pp) * Math.sin((2 * Math.PI * (x - t0)) / Pp);
      P.view(0, 24, Math.min(-25, M - A - 3), Math.max(25, M + A + 3)).clear().grid().axes({ xlabel: T('lab.r.months'), ylabel: 'T (°C)', xstep: 2 });
      P.line(0, M, 24, M, { color: '#bca8e6', width: 1.5, dash: '6 6' });
      P.fn(f, { color: '#d76a8b', width: 3 });
      P.fn((x) => f(t) + d(t) * (x - t), { color: '#8b6fc6', width: 2, dash: '7 5', from: Math.max(0, t - 2.5), to: Math.min(24, t + 2.5) });
      P.dot(t, f(t), { r: 6, color: '#8b6fc6' });
      out.innerHTML = `<div>T(${fmt(t, 1)}) = <strong>${fmt(f(t), 2)} °C</strong></div>
        <div>${T('lab.r.rate')} T′(${fmt(t, 1)}) = <strong>${fmt(d(t), 2)} ${T('lab.r.perMonth')}</strong></div>
        <div>${T('lab.r.maxAt', { max: fmt(M + A, 1), t0: fmt(t0, 1), P: fmt(Pp, 1), min: fmt(M - A, 1) })}</div>
        <div class="verdict neutral">${T('lab.r.fastest', { r: fmt((A * 2 * Math.PI) / Pp, 2) })}</div>`;
    }
    draw();
  }

  const LABS = [
    { id: 'cobweb', build: cobwebLab },
    { id: 'tangent', build: tangentLab },
    { id: 'taylor', build: taylorLab },
    { id: 'optimize', build: optimizationLab },
    { id: 'newton', build: newtonLab },
    { id: 'area', build: areaLab },
    { id: 'rhythm', build: rhythmLab }
  ];

  let ui = null;
  function activate(id, scroll) {
    if (!ui) return;
    LABS.forEach((L) => {
      if (!L.tab) return;
      const on = L.id === id;
      L.tab.classList.toggle('active', on);
      L.tab.setAttribute('aria-selected', String(on));
      L.panel.classList.toggle('active', on);
      if (on && !L.built) { L.build(L.panel); L.built = true; if (ui.renderMath) ui.renderMath(L.panel); }
    });
    if (scroll) document.getElementById('labs').scrollIntoView({ behavior: 'smooth' });
  }
  window.LovelyLabs = {
    init(o) {
      ui = o;
      const order = (window.LOVELY_CONTENT && window.LOVELY_CONTENT.labOrder) || LABS.map((L) => L.id);
      order.map((id) => LABS.find((L) => L.id === id)).filter(Boolean).forEach((L) => {
        L.tab = h('button', { class: 'lab-tab', type: 'button', role: 'tab', 'aria-selected': 'false' });
        L.tab.textContent = T('lab.tab.' + L.id);
        L.tab.addEventListener('click', () => activate(L.id));
        L.panel = h('div', { class: 'lab', role: 'tabpanel' });
        o.tabs.appendChild(L.tab);
        o.area.appendChild(L.panel);
      });
      activate(order[0]);
    },
    activate
  };
})();
