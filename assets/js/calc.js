/* Lovely Math — a pink scientific calculator with a safe expression parser (no eval). */
(function () {
  'use strict';

  const FUNCS = {
    sin: (x, deg) => Math.sin(deg ? (x * Math.PI) / 180 : x),
    cos: (x, deg) => Math.cos(deg ? (x * Math.PI) / 180 : x),
    tan: (x, deg) => Math.tan(deg ? (x * Math.PI) / 180 : x),
    asin: (x, deg) => (deg ? (Math.asin(x) * 180) / Math.PI : Math.asin(x)),
    acos: (x, deg) => (deg ? (Math.acos(x) * 180) / Math.PI : Math.acos(x)),
    atan: (x, deg) => (deg ? (Math.atan(x) * 180) / Math.PI : Math.atan(x)),
    ln: (x) => Math.log(x),
    log: (x) => Math.log10(x),
    sqrt: (x) => Math.sqrt(x),
    exp: (x) => Math.exp(x),
    abs: (x) => Math.abs(x)
  };
  const CONSTS = { pi: Math.PI, e: Math.E };

  function tokenize(src) {
    const s = src
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/[−–]/g, '-')
      .replace(/π/g, 'pi')
      .replace(/√/g, 'sqrt')
      .replace(/²/g, '^2')
      .replace(/⁻¹/g, '^(-1)');
    const out = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        const m = /^(\d*\.?\d+|\d+\.)(e[+-]?\d+)?/i.exec(s.slice(i));
        if (!m) throw new Error('bad number');
        out.push({ t: 'num', v: parseFloat(m[0]) });
        i += m[0].length;
        continue;
      }
      if (/[a-z]/i.test(c)) {
        const m = /^[a-z]+/i.exec(s.slice(i))[0].toLowerCase();
        out.push({ t: 'id', v: m });
        i += m.length;
        continue;
      }
      if ('+-*/^()!,'.includes(c)) { out.push({ t: c }); i++; continue; }
      throw new Error('unexpected ' + c);
    }
    return out;
  }

  function evaluate(src, opts) {
    const deg = !!(opts && opts.deg);
    const ans = opts && typeof opts.ans === 'number' ? opts.ans : 0;
    const toks = tokenize(String(src));
    let p = 0;
    const peek = () => toks[p];
    const eat = (t) => {
      if (!toks[p] || toks[p].t !== t) throw new Error('expected ' + t);
      return toks[p++];
    };
    const startsFactor = (tk) => tk && (tk.t === 'num' || tk.t === 'id' || tk.t === '(');

    function expr() {
      let v = term();
      while (peek() && (peek().t === '+' || peek().t === '-')) {
        const op = toks[p++].t;
        const r = term();
        v = op === '+' ? v + r : v - r;
      }
      return v;
    }
    function term() {
      let v = unary();
      for (;;) {
        const tk = peek();
        if (tk && (tk.t === '*' || tk.t === '/')) {
          p++;
          const r = unary();
          v = tk.t === '*' ? v * r : v / r;
        } else if (startsFactor(tk)) {
          v *= power(); // implicit multiplication: 2pi, 3(4), 2sin(x)
        } else break;
      }
      return v;
    }
    function unary() {
      const tk = peek();
      if (tk && tk.t === '-') { p++; return -unary(); }
      if (tk && tk.t === '+') { p++; return unary(); }
      return power();
    }
    function power() {
      const base = postfix();
      if (peek() && peek().t === '^') {
        p++;
        return Math.pow(base, unary()); // right-associative, so 2^3^2 = 2^9
      }
      return base;
    }
    function postfix() {
      let v = primary();
      while (peek() && peek().t === '!') {
        p++;
        v = factorial(v);
      }
      return v;
    }
    function primary() {
      const tk = peek();
      if (!tk) throw new Error('unexpected end');
      if (tk.t === 'num') { p++; return tk.v; }
      if (tk.t === '(') { p++; const v = expr(); eat(')'); return v; }
      if (tk.t === 'id') {
        p++;
        if (tk.v === 'ans') return ans;
        if (tk.v in CONSTS) return CONSTS[tk.v];
        if (tk.v in FUNCS) {
          let arg;
          if (peek() && peek().t === '(') { p++; arg = expr(); eat(')'); }
          else arg = power(); // allow "sin 30" and "ln e^2"
          return FUNCS[tk.v](arg, deg);
        }
        throw new Error('unknown ' + tk.v);
      }
      throw new Error('unexpected ' + tk.t);
    }
    function factorial(n) {
      if (n < 0 || !Number.isInteger(n) || n > 170) return NaN;
      let r = 1;
      for (let k = 2; k <= n; k++) r *= k;
      return r;
    }

    const v = expr();
    if (p < toks.length) throw new Error('trailing input');
    return v;
  }

  function format(v) {
    if (!Number.isFinite(v)) return Number.isNaN(v) ? 'Math ERROR' : v > 0 ? '∞' : '-∞';
    if (Math.abs(v) < 1e-12) return '0';
    const a = Math.abs(v);
    if (a >= 1e10 || a < 1e-6) return v.toExponential(6).replace(/\.?0+e/, 'e');
    return String(parseFloat(v.toPrecision(10)));
  }

  window.LovelyCalc = { evaluate, format };

  // ---------- keypad UI ----------
  const root = document.getElementById('calc');
  if (!root) return;
  const exprEl = document.getElementById('calc-expr');
  const resEl = document.getElementById('calc-result');
  const keysEl = document.getElementById('calc-keys');
  let expr = '';
  let last = 0;
  let deg = false;
  let justEvaluated = false;

  // read at press time, so the cheers follow a language switch
  const cheers = () => (window.LovelyI18n ? window.LovelyI18n.t('calc.cheers') : '1 ♡ U|U CAN DO IT|KEEP GOING').split('|');
  const KEYS = [
    ['sin', 'sin(', 'fn'], ['cos', 'cos(', 'fn'], ['tan', 'tan(', 'fn'], ['ln', 'ln(', 'fn'], ['log', 'log(', 'fn'],
    ['√', 'sqrt(', 'fn'], ['x²', '^2', 'fn'], ['^', '^', 'fn'], ['(', '(', 'fn'], [')', ')', 'fn'],
    ['7', '7'], ['8', '8'], ['9', '9'], ['DEL', 'del', 'ac'], ['AC', 'ac', 'ac'],
    ['4', '4'], ['5', '5'], ['6', '6'], ['×', '×', 'op'], ['÷', '÷', 'op'],
    ['1', '1'], ['2', '2'], ['3', '3'], ['+', '+', 'op'], ['−', '−', 'op'],
    ['0', '0'], ['.', '.'], ['π', 'π', 'fn'], ['e', 'e', 'fn'], ['=', '=', 'eq'],
    ['Ans', 'Ans', 'fn'], ['eˣ', 'e^(', 'fn'], ['x!', '!', 'fn'], ['abs', 'abs(', 'fn'], ['♡', 'love', 'op']
  ];

  KEYS.forEach(([label, val, cls]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    if (cls) b.className = cls;
    b.dataset.val = val;
    b.setAttribute('aria-label', label === '♡' ? 'encouragement' : label);
    keysEl.appendChild(b);
  });

  function show(result) {
    exprEl.textContent = expr;
    if (result !== undefined) resEl.textContent = result;
  }

  function press(val) {
    if (val === 'ac') { expr = ''; justEvaluated = false; show('0'); return; }
    if (val === 'del') { expr = expr.slice(0, -1); show(); return; }
    if (val === 'love') { const list = cheers(); show(list[Math.floor(Math.random() * list.length)]); return; }
    if (val === '=') {
      if (!expr.trim()) return;
      try {
        last = evaluate(expr, { deg, ans: last });
        show(format(last));
      } catch (e) {
        show('Syntax ERROR');
      }
      justEvaluated = true;
      return;
    }
    // after "=", typing an operator continues from Ans; typing a number starts fresh
    if (justEvaluated) {
      expr = /^[+\-−×÷*/^!]/.test(val) ? 'Ans' : '';
      justEvaluated = false;
    }
    expr += val;
    show();
  }

  keysEl.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) press(b.dataset.val);
  });

  root.querySelectorAll('.mode-toggle button').forEach((b) => {
    b.addEventListener('click', () => {
      deg = b.dataset.mode === 'deg';
      root.querySelectorAll('.mode-toggle button').forEach((x) => x.classList.toggle('on', x === b));
    });
  });

  // keyboard support while the calculator has focus
  root.tabIndex = 0;
  root.addEventListener('keydown', (e) => {
    const k = e.key;
    const map = { '*': '×', '/': '÷', '-': '−', Enter: '=', '=': '=', Backspace: 'del', Escape: 'ac' };
    if (/^[0-9.+()^!]$/.test(k)) { press(k); e.preventDefault(); }
    else if (k in map) { press(map[k]); e.preventDefault(); }
  });
})();
