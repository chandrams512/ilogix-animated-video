// ===== Particles skin: big text, outlines and rings are built from thousands of glowing points on deep navy. Original design. =====
(function () {
  const P = { bg0: '#050914', bg1: '#0a1226', bg2: '#04070f', cyan: '#4da3ff', violet: '#a98bff', pink: '#ff7ac8', green: '#5df0b8', amber: '#ffd27a', red: '#ff7a7a', ink: '#eaf2ff', mute: '#8da2c8' };
  const FS = '"Sora", system-ui, sans-serif', FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace'; let T = 0; const CACHE = new Map(), hs = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  function bg(x, t) {
    T = t; const W = x.canvas.width, Hh = x.canvas.height, m = Math.min(W, Hh) / 720; const g = x.createRadialGradient(W * 0.5, Hh * 0.45, 10, W * 0.5, Hh * 0.5, Math.max(W, Hh) * 0.75); g.addColorStop(0, P.bg1); g.addColorStop(1, P.bg2); x.fillStyle = g; x.fillRect(0, 0, W, Hh);
    for (let i = 0; i < 170; i++) { const z = 0.3 + hs(i + 9) * 0.9, X = (hs(i) * W + t * 6 * z * m) % W, Y = (hs(i + 50) * Hh - t * 4 * z * m + Hh) % Hh; x.fillStyle = H.rgba(i % 5 ? '#9fc4ff' : '#ffd9f0', (0.18 + 0.5 * Math.abs(Math.sin(t * 0.8 + i))) * z); x.beginPath(); x.arc(X, Y, 1.2 * z * m + 0.4, 0, TAU); x.fill(); }
  }
  function fin(x, t) { const W = x.canvas.width, Hh = x.canvas.height; H.vignette(x, W, Hh, 0.4, '2,4,10'); finish(x, W, Hh, t); }
  function pts(s, px, col, bold) {
    const k = s + '|' + px + '|' + bold; if (CACHE.has(k)) return CACHE.get(k);
    const c = document.createElement('canvas'), q = c.getContext('2d'), font = `${bold ? 700 : 600} ${px}px ${FS}`; q.font = font; const w = Math.ceil(q.measureText(s).width) + 8, h = Math.ceil(px * 1.5); c.width = w; c.height = h; q.font = font; q.textBaseline = 'middle'; q.fillStyle = '#fff'; q.fillText(s, 4, h / 2);
    const d = q.getImageData(0, 0, w, h).data, st = Math.max(3, Math.round(px / 19)), out = []; for (let Y = 1; Y < h; Y += st) for (let X = 1; X < w; X += st) if (d[(Y * w + X) * 4 + 3] > 120) out.push([X - w / 2, Y - h / 2, hs(X * 7 + Y * 13 + px)]);
    const r = { out, st, w }; CACHE.set(k, r); return r;
  }
  function text(x, s, cx, cy, px, col, o = {}) {
    x.save(); x.globalAlpha *= o.a == null ? 1 : o.a;
    if (px < 34 || o.mono) { x.font = `${o.mono ? 600 : 700} ${o.mono ? px : Math.round(px * 0.95)}px ${o.mono ? FM : FS}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.fillStyle = col; x.fillText(s, cx, cy); x.restore(); return; }
    const { out, st, w } = pts(s, Math.round(px * 0.95), col, true), ox = (o.align === 'left' ? w / 2 : o.align === 'right' ? -w / 2 : 0), a0 = x.globalAlpha, sc = 1 + (1 - Math.min(1, a0)) * 0.35;
    x.fillStyle = col; for (let i = 0; i < out.length; i++) { const p = out[i], tw = 0.55 + 0.45 * Math.sin(T * 3 + p[2] * 40), sx = (cx + ox + p[0] * sc), sy = cy + p[1] * sc + (1 - Math.min(1, a0)) * (p[2] - 0.5) * 40; x.globalAlpha = a0 * (0.75 + 0.25 * tw); x.beginPath(); x.arc(sx, sy, st * 0.5, 0, TAU); x.fill(); }
    x.fillStyle = 'rgba(0,0,0,0)'; x.font = `700 ${Math.round(px * 0.95)}px ${FS}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy);   // invisible: lets the layout check see the word
    x.restore();
  }
  function dotted(x, path, col, st) { x.save(); x.strokeStyle = col; x.lineWidth = st; x.lineCap = 'round'; x.setLineDash([0.1, st * 2.4]); path(); x.stroke(); x.restore(); }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `600 ${px}px ${FS}`; const w = x.measureText(s).width + px * 1.6, h = px * 1.9; x.globalAlpha *= o.a == null ? 1 : o.a;
    if (o.solid) { x.fillStyle = H.rgba(col, 0.9); rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); x.fill(); } else dotted(x, () => rr(x, cx - w / 2, cy - h / 2, w, h, h / 2), col, 3);
    x.fillStyle = o.solid ? '#050914' : col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) { x.save(); x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = 'rgba(12,20,44,0.8)'; rr(x, X, Y, w, h, o.r || 20); x.fill(); dotted(x, () => rr(x, X, Y, w, h, o.r || 20), o.col || P.cyan, 3.4); x.restore(); }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); x.fillStyle = 'rgba(12,20,44,0.85)'; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); const n = Math.round(r * 0.9);
    for (let i = 0; i < n; i++) { const a = i / n * TAU + t * 0.4; x.fillStyle = H.rgba(col, 0.55 + 0.45 * Math.sin(t * 2 + i)); x.beginPath(); x.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.6, 0, TAU); x.fill(); }
    if (o.ring) { x.strokeStyle = H.rgba(col, 0.4 * (1 - p)); x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, r * (1.25 + 0.3 * p), 0, TAU); x.stroke(); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, '#eaf2ff', t); if (o.label) text(x, o.label, cx, cy + r + (o.ly || 34), o.lpx || 25, P.ink, {});
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.strokeStyle = H.rgba(col, 0.9); x.lineWidth = (o.lw || 3) + 0.6; x.lineCap = 'round'; x.setLineDash([0.1, 9]); x.lineDashOffset = -t * 20; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); x.setLineDash([]);
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1, px = lerp(ax, bx, u), py = lerp(ay, by, u); glow(x, px, py, 16, col, 0.7); x.fillStyle = '#fff'; x.beginPath(); x.arc(px, py, 3.4, 0, TAU); x.fill(); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = col; x.beginPath(); x.moveTo(2, 0); x.lineTo(-15, -9); x.lineTo(-15, 9); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: P.violet, orbB: P.cyan });
  registerStyle('particles', { label: 'Particles', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
