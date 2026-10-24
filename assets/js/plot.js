/* Lovely Math — a tiny SVG plotting helper used by the labs. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';

  function niceStep(range, target) {
    const raw = range / (target || 8);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
  }
  const fmt = (v) => String(parseFloat(v.toPrecision(6)));

  class Plot {
    constructor(svg, o) {
      o = o || {};
      this.svg = svg;
      this.W = o.width || 560;
      this.H = o.height || 400;
      this.pad = o.pad == null ? 34 : o.pad;
      svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`);
      svg.classList.add('plot');
      this.view(o.xmin ?? -5, o.xmax ?? 5, o.ymin ?? -5, o.ymax ?? 5);
    }
    view(xmin, xmax, ymin, ymax) {
      this.xmin = xmin; this.xmax = xmax; this.ymin = ymin; this.ymax = ymax;
      return this;
    }
    X(x) { return this.pad + ((x - this.xmin) / (this.xmax - this.xmin)) * (this.W - 2 * this.pad); }
    Y(y) { return this.H - this.pad - ((y - this.ymin) / (this.ymax - this.ymin)) * (this.H - 2 * this.pad); }
    invX(px) { return this.xmin + ((px - this.pad) / (this.W - 2 * this.pad)) * (this.xmax - this.xmin); }
    invY(py) { return this.ymin + ((this.H - this.pad - py) / (this.H - 2 * this.pad)) * (this.ymax - this.ymin); }
    clear() { while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild); return this; }
    el(tag, attrs, parent) {
      const n = document.createElementNS(NS, tag);
      for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      (parent || this.svg).appendChild(n);
      return n;
    }
    grid() {
      const g = this.el('g', { stroke: 'rgba(222,128,158,.16)', 'stroke-width': 1 });
      const sx = niceStep(this.xmax - this.xmin, 10), sy = niceStep(this.ymax - this.ymin, 8);
      for (let x = Math.ceil(this.xmin / sx) * sx; x <= this.xmax + 1e-9; x += sx) this.el('line', { x1: this.X(x), x2: this.X(x), y1: this.Y(this.ymin), y2: this.Y(this.ymax) }, g);
      for (let y = Math.ceil(this.ymin / sy) * sy; y <= this.ymax + 1e-9; y += sy) this.el('line', { y1: this.Y(y), y2: this.Y(y), x1: this.X(this.xmin), x2: this.X(this.xmax) }, g);
      return this;
    }
    axes(o) {
      o = o || {};
      const ax = this.ymin <= 0 && this.ymax >= 0 ? 0 : this.ymin;
      const ay = this.xmin <= 0 && this.xmax >= 0 ? 0 : this.xmin;
      const g = this.el('g', { stroke: '#2e2337', 'stroke-width': 1.4, fill: 'none' });
      this.el('line', { x1: this.X(this.xmin), x2: this.X(this.xmax), y1: this.Y(ax), y2: this.Y(ax) }, g);
      this.el('line', { x1: this.X(ay), x2: this.X(ay), y1: this.Y(this.ymin), y2: this.Y(this.ymax) }, g);
      const sx = o.xstep || niceStep(this.xmax - this.xmin, 8), sy = o.ystep || niceStep(this.ymax - this.ymin, 6);
      const t = this.el('g', {});
      for (let x = Math.ceil(this.xmin / sx) * sx; x <= this.xmax + 1e-9; x += sx) {
        if (Math.abs(x - ay) < 1e-9) continue;
        this.el('line', { x1: this.X(x), x2: this.X(x), y1: this.Y(ax) - 3, y2: this.Y(ax) + 3, stroke: '#2e2337' }, t);
        const lab = this.el('text', { x: this.X(x), y: this.Y(ax) + 16, 'text-anchor': 'middle' }, t);
        lab.textContent = fmt(x);
      }
      for (let y = Math.ceil(this.ymin / sy) * sy; y <= this.ymax + 1e-9; y += sy) {
        if (Math.abs(y - ax) < 1e-9) continue;
        this.el('line', { x1: this.X(ay) - 3, x2: this.X(ay) + 3, y1: this.Y(y), y2: this.Y(y), stroke: '#2e2337' }, t);
        const lab = this.el('text', { x: this.X(ay) - 7, y: this.Y(y) + 4, 'text-anchor': 'end' }, t);
        lab.textContent = fmt(y);
      }
      if (o.xlabel) { const l = this.el('text', { x: this.X(this.xmax) - 4, y: this.Y(ax) - 8, 'text-anchor': 'end', class: 'hand-label' }); l.textContent = o.xlabel; }
      if (o.ylabel) { const l = this.el('text', { x: this.X(ay) + 8, y: this.Y(this.ymax) + 16, class: 'hand-label' }); l.textContent = o.ylabel; }
      return this;
    }
    fn(f, o) {
      o = o || {};
      const n = o.samples || 360;
      const a = o.from ?? this.xmin, b = o.to ?? this.xmax;
      const yr = this.ymax - this.ymin;
      let d = '', pen = false, prev = null;
      for (let i = 0; i <= n; i++) {
        const x = a + ((b - a) * i) / n;
        let y;
        try { y = f(x); } catch (e) { y = NaN; }
        const ok = Number.isFinite(y) && y > this.ymin - 4 * yr && y < this.ymax + 4 * yr;
        if (!ok || (prev !== null && Math.abs(y - prev) > 2.5 * yr)) { pen = false; prev = ok ? y : null; if (!ok) continue; }
        d += (pen ? 'L' : 'M') + this.X(x).toFixed(2) + ',' + this.Y(y).toFixed(2);
        pen = true;
        prev = y;
      }
      return this.el('path', { d, fill: 'none', stroke: o.color || '#d76a8b', 'stroke-width': o.width || 2.6, 'stroke-dasharray': o.dash, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: o.opacity });
    }
    poly(points, o) {
      o = o || {};
      const d = points.map((p, i) => (i ? 'L' : 'M') + this.X(p[0]).toFixed(2) + ',' + this.Y(p[1]).toFixed(2)).join('');
      return this.el('path', { d, fill: o.fill || 'none', stroke: o.color || '#8b6fc6', 'stroke-width': o.width || 1.8, 'stroke-dasharray': o.dash, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: o.opacity });
    }
    line(x1, y1, x2, y2, o) {
      o = o || {};
      return this.el('line', { x1: this.X(x1), y1: this.Y(y1), x2: this.X(x2), y2: this.Y(y2), stroke: o.color || '#8b6fc6', 'stroke-width': o.width || 1.8, 'stroke-dasharray': o.dash, 'stroke-linecap': 'round', opacity: o.opacity });
    }
    dot(x, y, o) {
      o = o || {};
      return this.el('circle', { cx: this.X(x), cy: this.Y(y), r: o.r || 5, fill: o.fill || '#fff', stroke: o.color || '#d76a8b', 'stroke-width': o.width || 2.4 });
    }
    text(x, y, str, o) {
      o = o || {};
      const t = this.el('text', { x: this.X(x) + (o.dx || 0), y: this.Y(y) + (o.dy || 0), 'text-anchor': o.anchor || 'start', class: o.cls || 'hand-label', fill: o.color });
      t.textContent = str;
      return t;
    }
    // data coordinates of a pointer event (works with any CSS size of the svg)
    pointer(evt) {
      const pt = this.svg.createSVGPoint();
      const src = evt.touches ? evt.touches[0] : evt;
      pt.x = src.clientX; pt.y = src.clientY;
      const p = pt.matrixTransform(this.svg.getScreenCTM().inverse());
      return { x: this.invX(p.x), y: this.invY(p.y) };
    }
  }

  window.LovelyPlot = Plot;
})();
