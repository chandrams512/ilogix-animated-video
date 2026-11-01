// ===== Bauhaus skin: cream paper, strict grid, flat red / yellow / blue circles, squares and triangles. Original design. =====
(function () {
  const P = { bg0: '#f2ead8', bg1: '#ece3ce', bg2: '#e6dcc3', cyan: '#3d6fe8', violet: '#7a3fa0', pink: '#d62b1f', green: '#1f8a5b', amber: '#f4b400', red: '#d62b1f', ink: '#1a1a1a', mute: '#5a554a' };
  const FJ = '"Jost", "Nunito", system-ui, sans-serif', FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace', RYB = [P.red, P.amber, P.cyan];
  function shape(x, k, cx, cy, s, col) {
    x.fillStyle = col; x.beginPath();
    if (k % 3 === 0) x.arc(cx, cy, s / 2, 0, TAU); else if (k % 3 === 1) x.rect(cx - s / 2, cy - s / 2, s, s); else { x.moveTo(cx, cy - s / 2); x.lineTo(cx + s / 2, cy + s / 2); x.lineTo(cx - s / 2, cy + s / 2); x.closePath(); } x.fill();
  }
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height, m = Math.min(W, Hh) / 720; x.fillStyle = P.bg0; x.fillRect(0, 0, W, Hh);
    x.strokeStyle = 'rgba(26,26,26,0.10)'; x.lineWidth = 2; const g = 90 * m; for (let X = g; X < W; X += g) { x.beginPath(); x.moveTo(X, 0); x.lineTo(X, Hh); x.stroke(); } for (let Y = g; Y < Hh; Y += g) { x.beginPath(); x.moveTo(0, Y); x.lineTo(W, Y); x.stroke(); }
    const dr = Math.sin(t * 0.5) * 6; shape(x, 0, W * 0.93, Hh * 0.1 + dr, 110 * m, P.red); shape(x, 1, W * 0.04, Hh * 0.9 - dr, 64 * m, P.amber); shape(x, 2, W * 0.965, Hh * 0.9, 60 * m, P.cyan);
    x.fillStyle = P.ink; x.fillRect(0, 0, W, 8 * m);
  }
  function fin(x, t) { finish(x, x.canvas.width, x.canvas.height, t); }
  function text(x, s, cx, cy, px, col, o = {}) { x.save(); x.font = `${o.mono ? 600 : 700} ${o.mono ? px : Math.round(px * 1.02)}px ${o.mono ? FM : FJ}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = col; x.fillText(s, cx, cy); x.restore(); }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `700 ${px}px ${FJ}`; const w = x.measureText(s).width + px * 1.6, h = px * 1.8; x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = o.solid ? col : '#ffffff'; x.fillRect(cx - w / 2, cy - h / 2, w, h); x.lineWidth = 3; x.strokeStyle = P.ink; x.strokeRect(cx - w / 2, cy - h / 2, w, h);
    x.fillStyle = o.solid ? '#ffffff' : P.ink; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) {
    const col = o.col || P.cyan; x.save(); x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = '#fffdf6'; x.fillRect(X, Y, w, h); x.fillStyle = col; x.fillRect(X, Y, 14, h);
    x.lineWidth = 3; x.strokeStyle = P.ink; x.strokeRect(X, Y, w, h); const s = Math.min(34, h * 0.22); shape(x, Math.round((X + Y) / 40), X + w - s, Y + s, s, col); x.restore();
  }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); x.lineWidth = 4; x.strokeStyle = P.ink; const k = Math.abs(Math.round(cx / 97 + cy / 53)) % 3;
    if (k === 0) { x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); x.stroke(); } else if (k === 1) { x.fillStyle = col; x.fillRect(cx - r, cy - r, r * 2, r * 2); x.strokeRect(cx - r, cy - r, r * 2, r * 2); } else { x.fillStyle = col; x.beginPath(); x.moveTo(cx, cy - r * 1.1); x.lineTo(cx + r * 1.05, cy + r * 0.85); x.lineTo(cx - r * 1.05, cy + r * 0.85); x.closePath(); x.fill(); x.stroke(); }
    if (o.ring) { x.strokeStyle = H.rgba(P.ink, 0.35 * (1 - p)); x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r * (1.25 + 0.3 * p), 0, TAU); x.stroke(); }
    if (o.icon) o.icon(x, cx, cy + (k === 2 ? r * 0.15 : 0), r * 0.45, '#ffffff', t); if (o.label) text(x, o.label, cx, cy + r + (o.ly || 34), o.lpx || 26, P.ink, {});
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.lineCap = 'butt'; x.strokeStyle = P.ink; x.lineWidth = (o.lw || 3) + 1; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke();
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1; shape(x, i, lerp(ax, bx, u), lerp(ay, by, u), 18, col); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = P.ink; x.beginPath(); x.moveTo(4, 0); x.lineTo(-18, -12); x.lineTo(-18, 12); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: P.red, orbB: P.amber, outline: 5, outlineCol: P.ink });
  registerStyle('bauhaus', { label: 'Bauhaus', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
