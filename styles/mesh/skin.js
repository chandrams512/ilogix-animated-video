// ===== Soft Mesh skin: slowly flowing pastel gradient mesh, white soft cards, calm dark-navy type. Original design. =====
(function () {
  const P = { bg0: '#fdf3ec', bg1: '#f1ecfb', bg2: '#e6f0fc', cyan: '#3d8bff', violet: '#8a5cf5', pink: '#ff6b9a', green: '#2fc08a', amber: '#ffab40', red: '#ff5b5b', ink: '#1b2240', mute: '#5d6485' };
  const FS = '"Sora", system-ui, sans-serif', FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height, m = Math.min(W, Hh) / 720; x.fillStyle = P.bg0; x.fillRect(0, 0, W, Hh);
    [[0.15, 0.2, 560, '#ffb08a', 0.75], [0.85, 0.15, 520, '#b79bff', 0.7], [0.8, 0.85, 600, '#7fc4ff', 0.7], [0.1, 0.9, 520, '#ff9ec4', 0.6], [0.5, 0.5, 420, '#ffe3a8', 0.5]].forEach(([a, b, r, c, al], i) => glow(x, W * a + Math.sin(t * 0.3 + i * 1.9) * 70 * m, Hh * b + Math.cos(t * 0.27 + i * 1.3) * 60 * m, r * m, c, al));
    x.fillStyle = 'rgba(255,255,255,0.28)'; x.fillRect(0, 0, W, Hh);
  }
  function fin(x, t) { finish(x, x.canvas.width, x.canvas.height, t); }
  function text(x, s, cx, cy, px, col, o = {}) { x.save(); x.font = `${o.mono ? 600 : 700} ${o.mono ? px : Math.round(px * 0.95)}px ${o.mono ? FM : FS}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = col; x.fillText(s, cx, cy); x.restore(); }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `700 ${px}px ${FS}`; const w = x.measureText(s).width + px * 1.6, h = px * 1.9; x.globalAlpha *= o.a == null ? 1 : o.a;
    x.shadowColor = 'rgba(40,40,100,0.18)'; x.shadowBlur = 14; x.shadowOffsetY = 5; x.fillStyle = o.solid ? col : 'rgba(255,255,255,0.92)'; rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); x.fill(); x.shadowColor = 'transparent';
    x.fillStyle = o.solid ? '#ffffff' : col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) { x.save(); x.globalAlpha *= o.a == null ? 1 : o.a; x.shadowColor = 'rgba(50,50,120,0.2)'; x.shadowBlur = 40; x.shadowOffsetY = 16; x.fillStyle = 'rgba(255,255,255,0.88)'; rr(x, X, Y, w, h, o.r || 28); x.fill(); x.shadowColor = 'transparent'; x.fillStyle = o.col || P.cyan; rr(x, X + 20, Y + 16, 44, 7, 3.5); x.fill(); x.restore(); }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); x.save(); x.shadowColor = H.rgba(col, 0.45); x.shadowBlur = 30; x.shadowOffsetY = 12; const g = x.createLinearGradient(cx - r, cy - r, cx + r, cy + r); g.addColorStop(0, col); g.addColorStop(1, H.rgba(col, 0.7)); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); x.restore();
    if (o.ring) { x.strokeStyle = H.rgba(col, 0.5 * (1 - p)); x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r * (1.2 + 0.3 * p), 0, TAU); x.stroke(); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, '#ffffff', t); if (o.label) text(x, o.label, cx, cy + r + (o.ly || 34), o.lpx || 25, P.ink, {});
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.lineCap = 'round'; x.strokeStyle = H.rgba(col, 0.55); x.lineWidth = (o.lw || 3) + 1; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke();
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1, px = lerp(ax, bx, u), py = lerp(ay, by, u); x.shadowColor = H.rgba(col, 0.6); x.shadowBlur = 12; x.fillStyle = '#ffffff'; x.beginPath(); x.arc(px, py, 7, 0, TAU); x.fill(); x.shadowBlur = 0; x.fillStyle = col; x.beginPath(); x.arc(px, py, 3.5, 0, TAU); x.fill(); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = col; x.beginPath(); x.moveTo(2, 0); x.lineTo(-15, -9); x.lineTo(-15, 9); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: P.violet, orbB: P.pink });
  registerStyle('mesh', { label: 'Soft Mesh', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
