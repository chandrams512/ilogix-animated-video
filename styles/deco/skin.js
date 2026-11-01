// ===== Art Deco skin: black and gold, fan shapes, thin double frames, elegant type. Original design. =====
(function () {
  const P = { bg0: '#0b0b10', bg1: '#12121a', bg2: '#08080c', cyan: '#e6c36a', violet: '#9a86e0', pink: '#e0728f', green: '#62c2a2', amber: '#f2d98a', red: '#df6a58', ink: '#f6ecd2', mute: '#b8a77a' };
  const FD = '"Poiret One", "Jost", "Sora", sans-serif', FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace', GOLD = '#d4af37';
  function fan(x, cx, cy, R, a0, a1, n, col, lw) { x.strokeStyle = col; x.lineWidth = lw; for (let i = 1; i <= n; i++) { x.beginPath(); x.arc(cx, cy, R * i / n, a0, a1); x.stroke(); } for (let i = 0; i <= 8; i++) { const a = a0 + (a1 - a0) * i / 8; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); x.stroke(); } }
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height, m = Math.min(W, Hh) / 720, g = x.createLinearGradient(0, 0, 0, Hh); g.addColorStop(0, P.bg1); g.addColorStop(1, P.bg2); x.fillStyle = g; x.fillRect(0, 0, W, Hh);
    x.save(); x.globalAlpha = 0.5 + 0.12 * Math.sin(t * 0.8); fan(x, 0, 0, 260 * m, 0, Math.PI / 2, 6, GOLD, 1.6); fan(x, W, 0, 260 * m, Math.PI / 2, Math.PI, 6, GOLD, 1.6); fan(x, 0, Hh, 260 * m, -Math.PI / 2, 0, 6, GOLD, 1.6); fan(x, W, Hh, 260 * m, Math.PI, Math.PI * 1.5, 6, GOLD, 1.6); x.restore();
    x.strokeStyle = H.rgba(GOLD, 0.7); x.lineWidth = 2; x.strokeRect(22 * m, 22 * m, W - 44 * m, Hh - 44 * m); x.strokeStyle = H.rgba(GOLD, 0.35); x.strokeRect(32 * m, 32 * m, W - 64 * m, Hh - 64 * m);
  }
  function fin(x, t) { const W = x.canvas.width, Hh = x.canvas.height; H.vignette(x, W, Hh, 0.35, '0,0,0'); finish(x, W, Hh, t); }
  function text(x, s, cx, cy, px, col, o = {}) {
    x.save(); x.font = o.mono ? `600 ${px}px ${FM}` : `400 ${Math.round(px * 1.08)}px ${FD}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = col;
    if (!o.mono) { x.strokeStyle = col; x.lineWidth = Math.max(1, px * 0.045); x.lineJoin = 'round'; x.strokeText(s, cx, cy); } x.fillText(s, cx, cy); x.restore();
  }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `400 ${Math.round(px * 1.05)}px ${FD}`; const w = x.measureText(s).width + px * 1.8, h = px * 1.9; x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = o.solid ? col : 'rgba(18,18,26,0.9)'; x.beginPath(); x.moveTo(cx - w / 2 + h / 3, cy - h / 2); x.lineTo(cx + w / 2 - h / 3, cy - h / 2); x.lineTo(cx + w / 2, cy); x.lineTo(cx + w / 2 - h / 3, cy + h / 2); x.lineTo(cx - w / 2 + h / 3, cy + h / 2); x.lineTo(cx - w / 2, cy); x.closePath(); x.fill(); x.strokeStyle = col; x.lineWidth = 2; x.stroke();
    x.fillStyle = o.solid ? '#0b0b10' : col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.strokeStyle = x.fillStyle; x.lineWidth = 1; x.strokeText(s, cx, cy + 1); x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) {
    const col = o.col || P.cyan, c = Math.min(22, h * 0.2); x.save(); x.globalAlpha *= o.a == null ? 1 : o.a;
    const path = (i) => { x.beginPath(); x.moveTo(X + c + i, Y + i); x.lineTo(X + w - c - i, Y + i); x.lineTo(X + w - i, Y + c + i); x.lineTo(X + w - i, Y + h - c - i); x.lineTo(X + w - c - i, Y + h - i); x.lineTo(X + c + i, Y + h - i); x.lineTo(X + i, Y + h - c - i); x.lineTo(X + i, Y + c + i); x.closePath(); };
    x.shadowColor = 'rgba(0,0,0,0.6)'; x.shadowBlur = 24; x.shadowOffsetY = 8; path(0); x.fillStyle = 'rgba(16,16,24,0.94)'; x.fill(); x.shadowColor = 'transparent'; path(0); x.strokeStyle = col; x.lineWidth = 2.5; x.stroke(); path(7); x.strokeStyle = H.rgba(col, 0.4); x.lineWidth = 1.4; x.stroke(); x.restore();
  }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); x.fillStyle = '#12121a'; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); x.strokeStyle = col; x.lineWidth = 3; x.stroke(); x.strokeStyle = H.rgba(col, 0.45); x.lineWidth = 1.5; x.beginPath(); x.arc(cx, cy, r * 0.84, 0, TAU); x.stroke();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8; x.beginPath(); x.moveTo(cx + Math.cos(a) * r * 1.0, cy + Math.sin(a) * r * 1.0); x.lineTo(cx + Math.cos(a) * r * 1.16, cy + Math.sin(a) * r * 1.16); x.stroke(); }
    if (o.ring) { x.strokeStyle = H.rgba(col, 0.5 * (1 - p)); x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, r * (1.25 + 0.3 * p), 0, TAU); x.stroke(); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, col, t); if (o.label) text(x, o.label, cx, cy + r + (o.ly || 36), o.lpx || 26, P.ink, {});
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.strokeStyle = H.rgba(col, 0.85); x.lineWidth = (o.lw || 3) - 0.5; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke();
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1, px = lerp(ax, bx, u), py = lerp(ay, by, u); x.save(); x.translate(px, py); x.rotate(Math.PI / 4); x.fillStyle = col; x.fillRect(-7, -7, 14, 14); x.restore(); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = col; x.beginPath(); x.moveTo(2, 0); x.lineTo(-16, -9); x.lineTo(-16, 9); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: P.violet, orbB: P.cyan });
  registerStyle('deco', { label: 'Art Deco', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
