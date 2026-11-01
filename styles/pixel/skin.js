// ===== Pixel Arcade skin: dark night sky, blocky pixel borders, 8-bit type, chunky square nodes. Original design. =====
(function () {
  const P = { bg0: '#14122b', bg1: '#1b1740', bg2: '#0e0c20', cyan: '#4de2ff', violet: '#9b6bff', pink: '#ff5ea8', green: '#5df06a', amber: '#ffd24d', red: '#ff5a4d', ink: '#f8f4e8', mute: '#a9a4c8' };
  const FP = '"Press Start 2P", "IBM Plex Mono", monospace', FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace', Q = 6;
  function pbox(x, X, Y, w, h, fill, line, q) {   // rectangle with stair-stepped corners
    q = q || Q; X = Math.round(X); Y = Math.round(Y); w = Math.round(w); h = Math.round(h);
    if (line) { x.fillStyle = line; x.fillRect(X + q, Y, w - 2 * q, h); x.fillRect(X, Y + q, w, h - 2 * q); }
    x.fillStyle = fill; x.fillRect(X + q * 2, Y + q, w - 4 * q, h - 2 * q); x.fillRect(X + q, Y + q * 2, w - 2 * q, h - 4 * q);
  }
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height, m = Math.min(W, Hh) / 720; x.fillStyle = P.bg0; x.fillRect(0, 0, W, Hh); x.fillStyle = P.bg1; x.fillRect(0, Hh * 0.55, W, Hh * 0.45);
    const r = H.rng(9), s = 6 * m; for (let i = 0; i < 46; i++) { const X = Math.floor(r() * W / s) * s, Y = Math.floor(r() * Hh * 0.6 / s) * s; x.fillStyle = H.rgba(P.ink, 0.25 + 0.55 * Math.abs(Math.sin(t * 1.6 + i))); x.fillRect(X, Y, s, s); }
    x.fillStyle = '#241e57'; const base = Hh * 0.9; for (let X = 0, i = 0; X < W; X += 54 * m, i++) { const hh = (30 + ((i * 37) % 70)) * m; x.fillRect(X, base - hh, 48 * m, hh + Hh); }
    x.fillStyle = P.amber; x.fillRect(W * 0.9, Hh * 0.12, 36 * m, 36 * m); x.fillStyle = P.bg0; x.fillRect(W * 0.9 + 12 * m, Hh * 0.12 - 0, 24 * m, 24 * m);
  }
  function fin(x, t) { const W = x.canvas.width, Hh = x.canvas.height; finish(x, W, Hh, t); x.fillStyle = 'rgba(0,0,0,0.10)'; for (let Y = 0; Y < Hh; Y += 4) x.fillRect(0, Y, W, 1); }
  function text(x, s, cx, cy, px, col, o = {}) {
    x.save(); let fp = Math.round(px * 0.56); x.font = o.mono ? `600 ${px}px ${FM}` : `400 ${fp}px ${FP}`; if (!o.mono) { const mw = x.measureText(s).width, lim = x.canvas.width / x.getTransform().a - 60; if (mw > lim) { fp = Math.max(8, Math.floor(fp * lim / mw)); x.font = `400 ${fp}px ${FP}`; } } x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.globalAlpha *= o.a == null ? 1 : o.a;
    if (!o.mono) { x.fillStyle = 'rgba(0,0,0,0.55)'; x.fillText(s, cx + 3, cy + 3); } x.fillStyle = col; x.fillText(s, cx, cy); x.restore();
  }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `400 ${Math.round(px * 0.6)}px ${FP}`; const w = x.measureText(s).width + px * 1.6, h = px * 1.9; x.globalAlpha *= o.a == null ? 1 : o.a;
    pbox(x, cx - w / 2, cy - h / 2, w, h, o.solid ? col : '#1b1740', col, 4); x.fillStyle = o.solid ? '#14122b' : col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) { x.save(); x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(X + 10, Y + 10, w, h); pbox(x, X, Y, w, h, '#201a4d', o.col || P.cyan, Q); x.fillStyle = H.rgba(o.col || P.cyan, 0.35); x.fillRect(X + Q * 2, Y + Q, w - Q * 4, 6); x.restore(); }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(cx - r + 8, cy - r + 8, r * 2, r * 2); pbox(x, cx - r, cy - r, r * 2, r * 2, '#201a4d', col, Math.max(6, r / 5));
    if (o.ring) { x.strokeStyle = H.rgba(col, 0.6 * (1 - p)); x.lineWidth = 4; x.strokeRect(cx - r * (1.2 + 0.25 * p), cy - r * (1.2 + 0.25 * p), r * 2 * (1.2 + 0.25 * p), r * 2 * (1.2 + 0.25 * p)); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, col, t); if (o.label) text(x, o.label, cx, cy + r + (o.ly || 34), o.lpx || 26, P.ink, {});
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.lineCap = 'butt'; x.strokeStyle = H.rgba(col, 0.9); x.lineWidth = (o.lw || 3) + 2; x.setLineDash([12, 12]); x.lineDashOffset = -t * 30; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); x.setLineDash([]);
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1, px = Math.round(lerp(ax, bx, u) / 6) * 6, py = Math.round(lerp(ay, by, u) / 6) * 6; x.fillStyle = P.ink; x.fillRect(px - 9, py - 9, 18, 18); x.fillStyle = col; x.fillRect(px - 5, py - 5, 10, 10); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = col; x.beginPath(); x.moveTo(2, 0); x.lineTo(-16, -11); x.lineTo(-16, 11); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: P.violet, orbB: P.cyan });
  registerStyle('pixel', { label: 'Pixel Arcade', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
