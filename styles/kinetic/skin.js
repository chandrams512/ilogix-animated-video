// ===== Kinetic Type skin: cream paper, huge condensed black type, one red accent, flat blocks. Original design. =====
(function () {
  const P = { bg0: '#f4efe6', bg1: '#efe8da', bg2: '#e8e0cf', cyan: '#e5432d', violet: '#2b4cff', pink: '#ff7a59', green: '#1f9d63', amber: '#ffc400', red: '#e5432d', ink: '#111111', mute: '#555048' };
  const FA = '"Anton", "Nunito", Impact, sans-serif', FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height, m = Math.min(W, Hh) / 720; x.fillStyle = P.bg0; x.fillRect(0, 0, W, Hh);
    x.fillStyle = P.ink; x.fillRect(0, 0, W, 10 * m); x.fillRect(0, Hh - 22 * m, W, 22 * m);                         // top rule, bottom strip
    x.fillStyle = P.bg0; const d = 44 * m, off = (t * 40 * m) % d; for (let X = -off; X < W; X += d) { x.save(); x.translate(X + d / 2, Hh - 11 * m); x.rotate(Math.PI / 4); x.fillRect(-4 * m, -4 * m, 8 * m, 8 * m); x.restore(); }
    x.strokeStyle = 'rgba(17,17,17,0.07)'; x.lineWidth = 2; for (let X = W * 0.1; X < W; X += W * 0.2) { x.beginPath(); x.moveTo(X, 10 * m); x.lineTo(X, Hh - 22 * m); x.stroke(); }
    x.fillStyle = P.red; x.beginPath(); x.arc(W * 0.94, Hh * 0.1 + Math.sin(t * 0.6) * 6, 22 * m, 0, TAU); x.fill();
  }
  function fin(x, t) { finish(x, x.canvas.width, x.canvas.height, t); }
  function text(x, s, cx, cy, px, col, o = {}) {
    x.save(); const big = px >= 54 && !o.mono; x.font = o.mono ? `600 ${px}px ${FM}` : `400 ${Math.round(px * 1.12)}px ${FA}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = col; x.fillText(big ? s.toUpperCase() : s, cx, cy); x.restore();
  }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.red; x.save(); x.font = `400 ${Math.round(px * 1.1)}px ${FA}`; const w = x.measureText(s).width + px * 1.5, h = px * 1.8; x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = o.solid ? col : P.ink; x.fillRect(cx - w / 2, cy - h / 2, w, h); x.fillStyle = o.solid ? '#ffffff' : P.bg0; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) {
    const col = o.col || P.red; x.save(); x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = '#ffffff'; x.fillRect(X, Y, w, h); x.fillStyle = col; x.fillRect(X, Y, Math.max(12, w * 0.025), h);
    x.lineWidth = 4; x.strokeStyle = P.ink; x.strokeRect(X, Y, w, h); x.restore();
  }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); x.lineWidth = 5; x.strokeStyle = P.ink; x.stroke();
    if (o.ring) { x.strokeStyle = H.rgba(P.ink, 0.35 * (1 - p)); x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r * (1.2 + 0.3 * p), 0, TAU); x.stroke(); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, '#ffffff', t); if (o.label) text(x, o.label, cx, cy + r + (o.ly || 34), o.lpx || 26, P.ink, {});
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.lineCap = 'butt'; x.strokeStyle = P.ink; x.lineWidth = (o.lw || 3) + 2; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke();
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1, px = lerp(ax, bx, u), py = lerp(ay, by, u); x.fillStyle = col; x.fillRect(px - 9, py - 9, 18, 18); x.lineWidth = 3; x.strokeStyle = P.ink; x.strokeRect(px - 9, py - 9, 18, 18); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = P.ink; x.beginPath(); x.moveTo(4, 0); x.lineTo(-20, -13); x.lineTo(-20, 13); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: P.red, orbB: P.amber, outline: 6, outlineCol: P.ink });
  registerStyle('kinetic', { label: 'Kinetic Type', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
