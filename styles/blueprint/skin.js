// ===== Blueprint skin: white line-work on deep blue, mono labels. Technical look. Original design. =====
(function () {
  const P = { bg0: '#0a2a5c', bg1: '#0c3170', bg2: '#0a2a5c', cyan: '#8fe3ff', violet: '#b9a8ff', pink: '#ffa7cf', green: '#9dffcf', amber: '#ffe08a', red: '#ff9a9a', ink: '#eaf4ff', mute: '#8fb4e8' };
  const FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace', FS = '"Sora", "Segoe UI", system-ui, sans-serif';
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height, g = x.createRadialGradient(W * 0.5, Hh * 0.4, 50, W * 0.5, Hh * 0.5, Math.max(W, Hh) * 0.8); g.addColorStop(0, '#0f3d86'); g.addColorStop(1, '#071f47'); x.fillStyle = g; x.fillRect(0, 0, W, Hh);
    x.lineWidth = 1; for (let X = 0; X < W; X += 24) { x.strokeStyle = (X % 120 === 0) ? 'rgba(180,215,255,0.22)' : 'rgba(180,215,255,0.07)'; x.beginPath(); x.moveTo(X, 0); x.lineTo(X, Hh); x.stroke(); }
    for (let Y = 0; Y < Hh; Y += 24) { x.strokeStyle = (Y % 120 === 0) ? 'rgba(180,215,255,0.22)' : 'rgba(180,215,255,0.07)'; x.beginPath(); x.moveTo(0, Y); x.lineTo(W, Y); x.stroke(); }
    x.strokeStyle = 'rgba(200,225,255,0.5)'; x.lineWidth = 2; x.strokeRect(18, 18, W - 36, Hh - 36);
  }
  function fin(x, t) { const W = x.canvas.width, Hh = x.canvas.height; H.vignette(x, W, Hh, 0.4, '2,10,30'); finish(x, W, Hh, t); }
  function text(x, s, cx, cy, px, col, o = {}) { x.save(); x.font = `${o.mono ? 600 : (o.w >= 800 ? 700 : 600)} ${o.mono ? px : Math.round(px * 0.95)}px ${o.mono ? FM : FS}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = col; x.fillText(s, cx, cy); x.restore(); }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `600 ${px}px ${FM}`; const w = x.measureText(s).width + px * 1.6, h = px * 1.9; x.globalAlpha *= o.a == null ? 1 : o.a;
    if (o.solid) { x.fillStyle = col; x.fillRect(cx - w / 2, cy - h / 2, w, h); } x.lineWidth = 2; x.strokeStyle = col; x.strokeRect(cx - w / 2, cy - h / 2, w, h);
    x.fillStyle = o.solid ? '#0a2a5c' : col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function ticks(x, X, Y, w, h, c, L) { x.strokeStyle = c; x.lineWidth = 3; [[X, Y, 1, 1], [X + w, Y, -1, 1], [X, Y + h, 1, -1], [X + w, Y + h, -1, -1]].forEach(([a, b, dx, dy]) => { x.beginPath(); x.moveTo(a, b + dy * L); x.lineTo(a, b); x.lineTo(a + dx * L, b); x.stroke(); }); }
  function card(x, X, Y, w, h, o = {}) {
    const col = o.col || P.cyan; x.save(); x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = 'rgba(10,42,92,0.88)'; x.fillRect(X, Y, w, h);
    x.strokeStyle = 'rgba(234,244,255,0.85)'; x.lineWidth = 2; x.strokeRect(X, Y, w, h); ticks(x, X - 6, Y - 6, w + 12, h + 12, col, 16);
    x.fillStyle = H.rgba(col, 0.22); x.fillRect(X + 2, Y + 2, w - 4, Math.max(10, h * 0.09)); x.restore();
  }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); x.fillStyle = 'rgba(10,42,92,0.9)'; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
    x.strokeStyle = col; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.stroke(); x.lineWidth = 1.5; x.strokeStyle = H.rgba(col, 0.55); x.beginPath(); x.moveTo(cx - r * 1.3, cy); x.lineTo(cx - r * 1.05, cy); x.moveTo(cx + r * 1.05, cy); x.lineTo(cx + r * 1.3, cy); x.moveTo(cx, cy - r * 1.3); x.lineTo(cx, cy - r * 1.05); x.moveTo(cx, cy + r * 1.05); x.lineTo(cx, cy + r * 1.3); x.stroke();
    if (o.ring) { x.strokeStyle = H.rgba(col, 0.45 * (1 - p)); x.beginPath(); x.arc(cx, cy, r * (1.2 + 0.3 * p), 0, TAU); x.stroke(); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, Array.isArray(col) ? hexOf(col) : col, t);
    if (o.label) text(x, o.label, cx, cy + r + (o.ly || 34), o.lpx || 24, P.ink, { mono: true });
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.strokeStyle = H.rgba(col, 0.8); x.lineWidth = o.lw || 2.5; x.setLineDash([12, 8]); x.lineDashOffset = -t * 20; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); x.setLineDash([]);
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1; x.fillStyle = col; x.fillRect(lerp(ax, bx, u) - 4, lerp(ay, by, u) - 4, 8, 8); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = col; x.beginPath(); x.moveTo(2, 0); x.lineTo(-16, -9); x.lineTo(-16, 9); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: '#3f6fe0', orbB: '#8fe3ff', outline: 3, outlineCol: '#8fe3ff' });
  registerStyle('blueprint', { label: 'Blueprint', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
