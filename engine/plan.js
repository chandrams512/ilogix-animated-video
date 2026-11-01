// ===== Plan runtime: draws a video from a JSON plan (const PLAN, inlined by build.py) =====
// Scene types: hook, steps, stat, chart, compare, timeline, flow, cta. See docs/plan-format.md.
// Everything draws through S (the active style), so any registered style works. Captions and brand kit are built in.
const DURATION = PLAN.scenes.reduce((end, sc) => { sc._t0 = sc.start != null ? sc.start : end; sc._d = sc.dur || 3; return Math.max(end, sc._t0 + sc._d); }, 0);
// Hindi: add the Devanagari font to every canvas font stack as a fallback (Latin text keeps the style's own font).
if (window.HINDI) { const d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'font'); Object.defineProperty(CanvasRenderingContext2D.prototype, 'font', { get: d.get, set(v) { d.set.call(this, /Noto Sans Devanagari/.test(v) ? v : String(v).replace(/(;|$)/, ', "Noto Sans Devanagari"$1')); } }); }
const BRAND = Object.assign({ name: '', logoText: '' }, PLAN.brand || {});
window.HAS_CAPTIONS = false; window.CAPTIONS_ON = true;
(function applyBrand() {
  const c = BRAND.colors || {}; Object.keys(STYLES).forEach((id) => Object.keys(c).forEach((k) => { if (STYLES[id].pal && /^(cyan|violet|pink|green|amber|red)$/.test(k)) STYLES[id].pal[k] = c[k]; }));
})();
const CAPS = (PLAN.captions || PLAN.scenes.filter((s) => s.say).map((s) => ({ t: s._t0 + (s.vdur ? 0.25 : 0.15), dur: s.vdur ? s.vdur + 0.1 : Math.max(1, s._d - 0.4), text: s.say }))).slice();
window.HAS_CAPTIONS = CAPS.length > 0;
let LOGO_IMG = null;
if (BRAND.logo) { LOGO_IMG = new Image(); LOGO_IMG.src = BRAND.logo; }

function popIn(x, cx, cy, u, fn, a) { if (u <= 0) return; x.save(); x.globalAlpha *= (a == null ? 1 : a) * Math.min(1, u * 3); const s = back(Math.min(1, u)); x.translate(cx, cy); x.scale(s, s); x.translate(-cx, -cy); fn(); x.restore(); }
function iPin(x, cx, cy, s, col) { x.save(); x.strokeStyle = col; x.lineWidth = Math.max(2, s * 0.14); x.lineCap = 'round'; x.beginPath(); x.moveTo(cx, cy + s * 0.95); x.bezierCurveTo(cx - s * 1.1, cy - s * 0.1, cx - s * 0.8, cy - s * 0.95, cx, cy - s * 0.95); x.bezierCurveTo(cx + s * 0.8, cy - s * 0.95, cx + s * 1.1, cy - s * 0.1, cx, cy + s * 0.95); x.stroke(); x.beginPath(); x.arc(cx, cy - s * 0.25, s * 0.28, 0, TAU); x.stroke(); x.restore(); }
function iPlane(x, cx, cy, s, col) { x.save(); x.fillStyle = col; x.translate(cx, cy); x.rotate(-0.5); x.beginPath(); x.moveTo(s, 0); x.lineTo(-s * 0.2, -s * 0.22); x.lineTo(-s * 0.55, -s * 0.85); x.lineTo(-s * 0.8, -s * 0.8); x.lineTo(-s * 0.45, -s * 0.12); x.lineTo(-s * 0.8, -s * 0.12); x.lineTo(-s * 0.95, -s * 0.38); x.lineTo(-s * 1.1, -s * 0.34); x.lineTo(-s, 0); x.lineTo(-s * 1.1, s * 0.34); x.lineTo(-s * 0.95, s * 0.38); x.lineTo(-s * 0.8, s * 0.12); x.lineTo(-s * 0.45, s * 0.12); x.lineTo(-s * 0.8, s * 0.8); x.lineTo(-s * 0.55, s * 0.85); x.lineTo(-s * 0.2, s * 0.22); x.closePath(); x.fill(); x.restore(); }
function iCross(x, cx, cy, s, col) { x.save(); x.strokeStyle = col; x.lineWidth = Math.max(2, s * 0.2); x.lineCap = 'round'; x.beginPath(); x.moveTo(cx - s * 0.6, cy - s * 0.6); x.lineTo(cx + s * 0.6, cy + s * 0.6); x.moveTo(cx + s * 0.6, cy - s * 0.6); x.lineTo(cx - s * 0.6, cy + s * 0.6); x.stroke(); x.restore(); }
const ICONS = () => Object.assign({ pin: iPin, plane: iPlane, cross: iCross }, S.icon);
const pickIcon = (n) => (n && ICONS()[n]) || undefined;
const COLS = () => [S.pal.cyan, S.pal.violet, S.pal.pink, S.pal.green, S.pal.amber, S.pal.red];

// geometry helper: fits a design area (720x1280 portrait, 1280x720 landscape) into the canvas
function geo(W, Hh) { const P = Hh > W, bw = P ? 720 : 1280, bh = P ? 1280 : 720; let k = Math.min(W / bw, Hh / bh), oy = (Hh - bh * k) / 2; if (P && PLAN.safe) { k *= 0.77; oy = Hh * (180 / 1280) - 30 * k; } /* safe: keeps text inside the Reels/Shorts safe zone */ return { P, bw, bh, k, C: bw / 2, ox: (W - bw * k) / 2, oy }; }
const wrap = (x, s, maxW) => { const w = String(s).split(' '), out = []; let line = ''; w.forEach((t) => { const test = line ? line + ' ' + t : t; if (x.measureText(test).width > maxW && line) { out.push(line); line = t; } else line = test; }); if (line) out.push(line); return out; };

const SC = {
  hook(x, g, sc, lt) {
    const px = g.P ? 70 : 66, y0 = g.bh * (g.P ? 0.3 : 0.38) - (sc.lines.length - 1) * px * 0.6, pal = S.pal;
    sc.lines.forEach((ln, i) => { const y = y0 + i * px * 1.2, col = i === 0 ? pal.ink : (i % 2 ? pal.cyan : pal.ink); popIn(x, g.C, y, seg(lt, 0.1 + i * 0.35, 0.6 + i * 0.35), () => S.text(x, ln, g.C, y, px, col, { w: 800, glow: i % 2 ? pal.cyan : undefined })); });
    if (sc.sub) { const y = y0 + sc.lines.length * px * 1.2 + 30; x.save(); x.globalAlpha *= seg(lt, 0.9, 1.4); S.text(x, sc.sub, g.C, y, g.P ? 30 : 28, pal.mute, { w: 700 }); x.restore(); }
  },
  steps(x, g, sc, lt) {
    const n = sc.items.length, cols = COLS(), pal = S.pal; if (sc.title) S.text(x, sc.title, g.C, g.P ? 190 : 90, g.P ? 48 : 44, pal.ink, { w: 800 });
    sc.items.forEach((it, i) => {
      const tt = 0.35 + i * 0.5, u = seg(lt, tt, tt + 0.5), col = cols[i % cols.length];
      if (g.P) { const h = n > 3 ? 150 : 190, gap = 24, w = 600, X = g.C - w / 2, Y = 290 + i * (h + gap); popIn(x, g.C, Y + h / 2, u, () => { S.card(x, X, Y, w, h, { col }); S.chip(x, X + 74, Y + 44, it.tag || ('Step ' + (i + 1)), 21, { col, solid: true }); S.text(x, it.title, X + 28, Y + h * 0.6, 30, pal.ink, { align: 'left' }); if (it.sub) S.text(x, it.sub, X + 28, Y + h * 0.6 + 38, 22, pal.mute, { align: 'left', w: 600 }); S.node(x, X + w - 68, Y + h / 2, 36, col, lt, { icon: pickIcon(it.icon || 'check'), ph: i }); }); }
      else { const w = Math.min(360, (1160 - 24 * (n - 1)) / n), h = 300, X = g.C - (n * w + (n - 1) * 24) / 2 + i * (w + 24), Y = 190; popIn(x, X + w / 2, Y + h / 2, u, () => { S.card(x, X, Y, w, h, { col }); S.chip(x, X + 70, Y + 48, it.tag || ('Step ' + (i + 1)), 20, { col, solid: true }); S.node(x, X + w - 60, Y + 56, 34, col, lt, { icon: pickIcon(it.icon || 'check'), ph: i }); S.text(x, it.title, X + 24, Y + 160, 28, pal.ink, { align: 'left' }); if (it.sub) S.text(x, it.sub, X + 24, Y + 205, 21, pal.mute, { align: 'left', w: 600 }); }); }
    });
  },
  stat(x, g, sc, lt) {
    const pal = S.pal, v = sc.value, num = typeof v === 'number', k = seg(lt, 0.3, 1.5), shown = num ? Math.round(v * (1 - Math.pow(1 - k, 3))) : v, txt = (sc.prefix || '') + shown + (sc.suffix || '');
    const y = g.bh * (g.P ? 0.4 : 0.44); popIn(x, g.C, y, seg(lt, 0.1, 0.6), () => S.text(x, txt, g.C, y, g.P ? 190 : 200, pal.cyan, { w: 800, glow: pal.cyan }));
    x.save(); x.globalAlpha *= seg(lt, 0.9, 1.4); S.text(x, sc.label, g.C, y + (g.P ? 150 : 140), g.P ? 42 : 40, pal.ink, { w: 800 }); if (sc.sub) S.text(x, sc.sub, g.C, y + (g.P ? 210 : 196), 26, pal.mute, { w: 700 }); x.restore();
  },
  chart(x, g, sc, lt) {
    const pal = S.pal, cols = COLS(), n = sc.bars.length, max = Math.max.apply(null, sc.bars.map((b) => b.value)), top = g.P ? 300 : 210, rowH = g.P ? Math.min(130, 640 / n) : Math.min(84, 380 / n), left = g.P ? 80 : 280, W = g.P ? 560 : 760;
    if (sc.title) S.text(x, sc.title, g.C, g.P ? 190 : 100, g.P ? 48 : 44, pal.ink, { w: 800 });
    sc.bars.forEach((b, i) => {
      const y = top + i * rowH, u = seg(lt, 0.3 + i * 0.3, 1.1 + i * 0.3), col = cols[i % cols.length], len = (W * b.value / max) * u;
      x.save(); x.globalAlpha *= Math.min(1, u * 3);
      if (g.P) { S.text(x, b.label, left, y - 26, 26, pal.ink, { align: 'left', w: 700 }); } else S.text(x, b.label, left - 20, y + rowH * 0.3, 26, pal.ink, { align: 'right', w: 700 });
      const by = g.P ? y : y + rowH * 0.3 - 20, bh = g.P ? 46 : 40;
      x.fillStyle = H.rgba(col, 0.18); rr(x, left, by, W, bh, bh / 2); x.fill(); x.fillStyle = col; if (len > bh) { rr(x, left, by, len, bh, bh / 2); x.fill(); }
      S.text(x, (b.prefix || '') + Math.round(b.value * u) + (b.suffix || ''), left + Math.max(len, bh) + 14, by + bh / 2, 26, pal.ink, { align: 'left', w: 800 }); x.restore();
    });
  },
  compare(x, g, sc, lt) {
    const pal = S.pal, L = sc.left, R = sc.right, rows = Math.max(L.items.length, R.items.length), w = g.P ? 600 : 540, h = g.P ? 80 + rows * 64 + 40 : 80 + rows * 56 + 50;
    [[L, pal.red, 'cross'], [R, pal.green, 'check']].forEach(([side, col, ic], i) => {
      const X = g.P ? g.C - w / 2 : g.C - w - 20 + i * (w + 40), Y = g.P ? 220 + i * (h + 40) : 170; popIn(x, X + w / 2, Y + h / 2, seg(lt, 0.2 + i * 0.5, 0.8 + i * 0.5), () => {
        S.card(x, X, Y, w, h, { col }); S.text(x, side.title, X + 30, Y + 50, g.P ? 34 : 32, col, { align: 'left', w: 800 });
        side.items.forEach((it, j) => { const yy = Y + 108 + j * (g.P ? 64 : 56), u = seg(lt, 0.7 + i * 0.5 + j * 0.25, 1.0 + i * 0.5 + j * 0.25); x.save(); x.globalAlpha *= u; ICONS()[ic](x, X + 44, yy, 15, col); S.text(x, it, X + 78, yy, g.P ? 27 : 26, pal.ink, { align: 'left', w: 700 }); x.restore(); });
      });
    });
    if (sc.title) S.text(x, sc.title, g.C, g.P ? 130 : 90, g.P ? 46 : 42, pal.ink, { w: 800 });
  },
  timeline(x, g, sc, lt) {
    const pal = S.pal, cols = COLS(), n = sc.points.length; if (sc.title) S.text(x, sc.title, g.C, g.P ? 190 : 100, g.P ? 48 : 44, pal.ink, { w: 800 });
    const p = (i) => g.P ? [150, 320 + i * ((n > 3 ? 560 : 640) / Math.max(1, n - 1))] : [180 + i * (920 / Math.max(1, n - 1)), 330];
    for (let i = 0; i < n - 1; i++) { const a = p(i), b = p(i + 1), u = seg(lt, 0.4 + i * 0.5, 0.9 + i * 0.5); if (u > 0) S.link(x, a[0], a[1], lerp(a[0], b[0], u), lerp(a[1], b[1], u), cols[i % cols.length], lt, { dots: 1 }); }
    sc.points.forEach((pt, i) => { const [cx, cy] = p(i), u = seg(lt, 0.2 + i * 0.5, 0.7 + i * 0.5), col = cols[i % cols.length]; popIn(x, cx, cy, u, () => { S.node(x, cx, cy, 36, col, lt, { ph: i }); S.text(x, String(i + 1), cx, cy, 30, pal.ink, { w: 800 }); if (g.P) { S.text(x, pt.label, cx + 70, cy - (pt.sub ? 12 : 0), 30, pal.ink, { align: 'left', w: 800 }); if (pt.sub) S.text(x, pt.sub, cx + 70, cy + 26, 22, pal.mute, { align: 'left', w: 600 }); } else { S.text(x, pt.label, cx, cy + 80, 26, pal.ink, { w: 800 }); if (pt.sub) S.text(x, pt.sub, cx, cy + 116, 20, pal.mute, { w: 600 }); } }); });
  },
  flow(x, g, sc, lt) {
    const pal = S.pal, cols = COLS(), n = sc.nodes.length; if (sc.title) S.text(x, sc.title, g.C, g.P ? 190 : 100, g.P ? 48 : 44, pal.ink, { w: 800 });
    const p = (i) => g.P ? [g.C - (n > 3 ? 130 : 0), 330 + i * ((n > 3 ? 600 : 540) / Math.max(1, n - 1))] : [170 + i * (940 / Math.max(1, n - 1)), 350];
    for (let i = 0; i < n - 1; i++) { const a = p(i), b = p(i + 1), u = seg(lt, 0.5 + i * 0.5, 1.0 + i * 0.5); if (u > 0) S.link(x, a[0], a[1], lerp(a[0], b[0], u), lerp(a[1], b[1], u), cols[i % cols.length], lt, { head: u > 0.95 }); }
    sc.nodes.forEach((nd, i) => { const [cx, cy] = p(i), u = seg(lt, 0.2 + i * 0.5, 0.7 + i * 0.5); popIn(x, cx, cy, u, () => { S.node(x, cx, cy, g.P ? (n > 3 ? 44 : 56) : 64, cols[i % cols.length], lt, { icon: pickIcon(nd.icon || 'bolt'), label: (g.P && n > 3) ? null : nd.label, ph: i, ring: i === n - 1 }); if (g.P && n > 3) S.text(x, nd.label, cx + 74, cy, 32, pal.ink, { align: 'left' }); }); });
  },
  cta(x, g, sc, lt) {
    const pal = S.pal, ny = g.bh * (g.P ? 0.36 : 0.26); let y = ny;
    if (sc.icon !== false) { popIn(x, g.C, ny, seg(lt, 0.1, 0.7), () => S.node(x, g.C, ny, 80, pal.cyan, lt, { icon: pickIcon(sc.icon || 'bolt'), ring: true })); y = ny + (g.P ? 160 : 135); } else y = g.bh * (g.P ? 0.34 : 0.3);
    sc.lines.forEach((ln, i) => { const yy = y + i * (g.P ? 76 : 68); popIn(x, g.C, yy, seg(lt, 0.4 + i * 0.3, 0.9 + i * 0.3), () => S.text(x, ln, g.C, yy, g.P ? 62 : 58, i === sc.lines.length - 1 && sc.lines.length > 1 ? pal.cyan : pal.ink, { w: 800, glow: i === sc.lines.length - 1 && sc.lines.length > 1 ? pal.cyan : undefined })); });
    const by = y + sc.lines.length * (g.P ? 76 : 68) + (g.P ? 40 : 28);
    if (sc.button) popIn(x, g.C, by, seg(lt, 1.1, 1.6), () => S.chip(x, g.C, by, sc.button, 32, { col: pal.violet, solid: true }));
    if (sc.tag) popIn(x, g.C, by + (g.P ? 80 : 68), seg(lt, 1.4, 1.9), () => S.chip(x, g.C, by + (g.P ? 80 : 68), sc.tag, 24, { col: pal.cyan }));
  },
};

function drawCaptions(x, g, t) {
  const c = CAPS.find((q) => t >= q.t && t < q.t + (q.dur || 2)); if (!c) return;
  const words = c.text.split(/\s+/), u = (t - c.t) / (c.dur || 2), cur = Math.min(words.length - 1, Math.floor(u * words.length * 1.15)), px = g.P ? 38 : 34, maxW = g.P ? 620 : 1000;
  x.save(); x.font = `800 ${px}px "Nunito", "Sora", system-ui, sans-serif`;
  const lines = [], widths = []; let cur2 = [], cw = 0; words.forEach((w, i) => { const ww = x.measureText(w + ' ').width; if (cw + ww > maxW && cur2.length) { lines.push(cur2); widths.push(cw); cur2 = []; cw = 0; } cur2.push([w, i, ww]); cw += ww; }); lines.push(cur2); widths.push(cw);
  const lh = px * 1.35, bh = lines.length * lh + 26, y0 = g.bh * (g.P ? 0.84 : (BRAND.rera || BRAND.disclaimer) ? 0.86 : 0.9) - bh / 2, bw = Math.max.apply(null, widths) + 44;
  x.globalAlpha *= seg(t, c.t, c.t + 0.15) * (1 - seg(t, c.t + (c.dur || 2) - 0.12, c.t + (c.dur || 2)));
  x.fillStyle = 'rgba(4,8,24,0.72)'; rr(x, g.C - bw / 2, y0, bw, bh, 22); x.fill();
  x.textBaseline = 'middle'; x.textAlign = 'left';
  lines.forEach((ln, li) => { let xx = g.C - widths[li] / 2; ln.forEach(([w, i, ww]) => { x.fillStyle = i === cur ? S.pal.cyan : (i < cur ? '#ffffff' : 'rgba(255,255,255,0.62)'); x.fillText(w, xx, y0 + 13 + li * lh + lh / 2); xx += ww; }); });
  x.restore();
}

// Compliance footer (e.g. RERA number, 'artist's impression'): brand.rera and brand.disclaimer, shown on every scene.
function drawFooter(x, g, t) {
  const parts = [BRAND.rera, BRAND.disclaimer].filter(Boolean); if (!parts.length) return;
  x.save(); x.globalAlpha *= seg(t, 0.3, 0.7); const px = g.P ? 21 : 17;
  if (g.P) parts.forEach((p, i) => S.text(x, p, g.C, g.bh - 30 - (parts.length - 1 - i) * 30, px, S.pal.mute, { w: 700 }));
  else S.text(x, parts.join('  \u00b7  '), g.C, g.bh - 14, px, S.pal.mute, { w: 700 });
  x.restore();
}


// ===== Scene motion: transitions, camera drift (plan keys: motion "auto"|"off", transition, camera "drift"|"none"; a scene can set its own transition / camera) =====
const AUTO_TR = { 'tech-glow': 'zoom', glass: 'zoom', isometric: 'slide', 'paper-cut': 'slide', whiteboard: 'wipe', blueprint: 'wipe', 'neo-brutal': 'push', kinetic: 'push', neon: 'zoom', bauhaus: 'slide', pixel: 'wipe', deco: 'zoom', mesh: 'slide' };
function trOf(sc) { if (sc.transition) return sc.transition; if (PLAN.transition && PLAN.transition !== 'auto') return PLAN.transition; return (PLAN.motion === 'auto' || PLAN.transition === 'auto') ? (AUTO_TR[ACTIVE_STYLE] || 'slide') : 'fade'; }
function camOf(sc) { const c = sc.camera || PLAN.camera || (PLAN.motion === 'auto' ? 'drift' : 'none'); return c === 'drift'; }
function motionIn(x, g, tr, pin, pout) {
  const ei = eo(pin), eout = pout * pout, a = Math.min(1, pin * 2.2) * (1 - Math.min(1, pout * 1.4)), W = g.bw, Hh = g.bh;
  if (tr === 'wipe') { x.beginPath(); x.rect(W * eout, 0, W - W * eout, Hh); x.clip(); x.beginPath(); x.rect(0, 0, W * ei + 1, Hh); x.clip(); return; }
  x.globalAlpha *= a;
  if (tr === 'slide') x.translate((1 - ei) * 0.11 * W - eout * 0.11 * W, 0);
  else if (tr === 'push') x.translate(0, (1 - ei) * 0.12 * Hh - eout * 0.12 * Hh);
  else if (tr === 'zoom') { const s = (0.9 + 0.1 * ei) * (1 + 0.1 * eout); x.translate(W / 2, Hh / 2); x.scale(s, s); x.translate(-W / 2, -Hh / 2); }
  const bl = ((1 - ei) + eout) * 5; if (bl > 0.4 && tr !== 'wipe') x.filter = 'blur(' + bl.toFixed(1) + 'px)';
}

function planDraw(x, W, Hh, t) {
  S.bg(x, t); const g = geo(W, Hh), pal = S.pal;
  x.save(); x.translate(g.ox, g.oy); x.scale(g.k, g.k);
  // brand mark
  x.save(); x.globalAlpha *= seg(t, 0.1, 0.5); if (LOGO_IMG && LOGO_IMG.complete && LOGO_IMG.naturalWidth) { const h = 44, w = LOGO_IMG.naturalWidth / LOGO_IMG.naturalHeight * h; x.drawImage(LOGO_IMG, 40, 34, w, h); } else if (BRAND.logoText || BRAND.name) { x.fillStyle = pal.cyan; rr(x, 40, 40, 26, 26, 8); x.fill(); S.text(x, BRAND.logoText || BRAND.name, 78, 53, 26, pal.ink, { align: 'left', w: 800 }); } x.restore();
  PLAN.scenes.forEach((sc, i) => {
    const tr = trOf(sc), lt0 = t - sc._t0, lt = Math.max(0, lt0), OV = tr === 'fade' ? 0 : 0.3; if (lt0 < -OV || lt0 > sc._d + 0.001) return; const last = i === PLAN.scenes.length - 1;
    x.save();
    if (tr === 'fade') x.globalAlpha *= seg(lt, 0, 0.25) * (last ? 1 : 1 - seg(lt, sc._d - 0.3, sc._d));
    else motionIn(x, g, tr, seg(lt0, -OV, 0.25), last ? 0 : seg(lt0, sc._d - 0.3, sc._d));
    if (camOf(sc)) { const u = lt / sc._d, z = 1 + 0.035 * u, dir = i % 2 ? -1 : 1; x.translate(g.bw / 2 + dir * (u - 0.5) * 0.02 * g.bw, g.bh / 2); x.scale(z, z); x.translate(-g.bw / 2, -g.bh / 2); }
    SC[sc.type](x, g, sc, lt); x.restore(); x.filter = 'none';
  });
  if (window.CAPTIONS_ON) { window.__CAP = true; drawCaptions(x, g, t); window.__CAP = false; }
  drawFooter(x, g, t);
  x.restore();
  S.finish(x, t);
}
const explainerL = planDraw, explainerP = planDraw;
window.setCaptions = (on) => { window.CAPTIONS_ON = !!on; };

function scoreSound(k) {
  if (PLAN.music !== false) k.music('pad', 0, DURATION, { bpm: PLAN.bpm || 80, gain: 0.35, chords: PLAN.chords || [['C4', 'E4', 'G4', 'B4'], ['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['G3', 'B3', 'D4', 'F4']] });
  PLAN.scenes.forEach((sc, i) => {
    const T0 = sc._t0, d = sc._d, notes = ['E6', 'G6', 'C7', 'A6', 'D7', 'B6'];
    if (i > 0) k.play('riser', T0 - 0.35, { dur: 0.5, gain: 0.45 });
    const n = (sc.items || sc.bars || sc.points || sc.nodes || sc.lines || []).length;
    switch (sc.type) {
      case 'hook': sc.lines.forEach((_, j) => k.play('pop', T0 + 0.15 + j * 0.35, { gain: 0.9 })); break;
      case 'steps': sc.items.forEach((_, j) => { k.play('pop', T0 + 0.4 + j * 0.5, { gain: 0.9, pan: (j - (n - 1) / 2) * 0.25 }); k.play('ding', T0 + 0.55 + j * 0.5, { f: notes[j % 6], gain: 0.6 }); }); break;
      case 'stat': k.play('riser', T0 + 0.3, { dur: 1.2, gain: 0.6 }); k.play('success', T0 + 1.5, { gain: 0.9 }); break;
      case 'chart': sc.bars.forEach((_, j) => k.play('tick', T0 + 0.35 + j * 0.3, { gain: 0.7 })); k.play('success', T0 + 0.9 + n * 0.3, { gain: 0.7 }); break;
      case 'compare': k.play('pop', T0 + 0.25, { gain: 0.9, pan: -0.3 }); k.play('pop', T0 + 0.75, { gain: 0.9, pan: 0.3 }); k.play('ding', T0 + 1.4, { f: 'E6', gain: 0.6 }); break;
      case 'timeline': case 'flow': (sc.points || sc.nodes).forEach((_, j) => { k.play('pop', T0 + 0.25 + j * 0.5, { gain: 0.8 }); k.play('blip', T0 + 0.4 + j * 0.5, { f: notes[j % 6], dur: 0.1, gain: 0.5, minor: true }); }); break;
      case 'cta': k.play('impact', T0 + 0.12, { gain: 0.5 }); k.play('sparkle', T0 + 0.4, { gain: 0.7, n: 6 }); if (sc.button) k.play('success', T0 + 1.2, { gain: 0.9 }); break;
      default: if (window.SCENE_SOUND && window.SCENE_SOUND[sc.type]) window.SCENE_SOUND[sc.type](k, sc, T0, d);
    }
  });
}
window.DURATION = DURATION; window.scoreSound = scoreSound;
window.PLAN_SAY = PLAN.scenes.filter((s) => s.say).map((s) => ({ t: s._t0, say: s.say }));
