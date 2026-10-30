// ===== Glass UI skin: frosted translucent panels over soft colour blurs. App / SaaS look. Original design. =====
(function () {
  const P = { bg0: '#1b1446', bg1: '#2a1d6b', bg2: '#10305f', cyan: '#6fe6ff', violet: '#b79bff', pink: '#ff8cc6', green: '#7dffc0', amber: '#ffd57a', red: '#ff8a9a', ink: '#ffffff', mute: '#c3c6ee' };
  const FS = '"Sora", "Segoe UI", system-ui, sans-serif', FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height, g = x.createLinearGradient(0, 0, W, Hh); g.addColorStop(0, P.bg0); g.addColorStop(0.55, P.bg1); g.addColorStop(1, P.bg2); x.fillStyle = g; x.fillRect(0, 0, W, Hh);
    [[0.2, 0.2, 380, '#ff5fd0', 0.5], [0.85, 0.35, 420, '#4aa8ff', 0.5], [0.5, 0.9, 460, '#8f63ff', 0.45], [0.1, 0.8, 300, '#3dffd0', 0.3]].forEach(([a, b, r, c, al], i) => glow(x, W * a + Math.sin(t * 0.35 + i * 1.7) * 40, Hh * b + Math.cos(t * 0.3 + i) * 40, r, c, al));
  }
  function fin(x, t) { const W = x.canvas.width, Hh = x.canvas.height; H.vignette(x, W, Hh, 0.3, '10,6,40'); finish(x, W, Hh, t); }
  function text(x, s, cx, cy, px, col, o = {}) { x.save(); x.font = `${o.mono ? 600 : (o.w >= 800 ? 700 : 600)} ${o.mono ? px : Math.round(px * 0.95)}px ${o.mono ? FM : FS}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.globalAlpha *= o.a == null ? 1 : o.a; if (o.glow) { x.shadowColor = H.rgba(o.glow, 0.6); x.shadowBlur = px * 0.5; } x.fillStyle = col; x.fillText(s, cx, cy); x.restore(); }
  function panel(x, X, Y, w, h, r, col, a) {
    x.save(); x.shadowColor = 'rgba(8,4,40,0.45)'; x.shadowBlur = 36; x.shadowOffsetY = 14; x.fillStyle = 'rgba(255,255,255,' + (a || 0.14) + ')'; rr(x, X, Y, w, h, r); x.fill(); x.restore();
    const g = x.createLinearGradient(X, Y, X + w, Y + h); g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.5, 'rgba(255,255,255,0.12)'); g.addColorStop(1, H.rgba(col || '#ffffff', 0.45)); x.lineWidth = 1.8; x.strokeStyle = g; rr(x, X, Y, w, h, r); x.stroke();
    x.save(); rr(x, X, Y, w, h, r); x.clip(); const sh = x.createLinearGradient(X, Y, X, Y + h * 0.5); sh.addColorStop(0, 'rgba(255,255,255,0.18)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = sh; x.fillRect(X, Y, w, h * 0.5); x.restore();
  }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `600 ${px}px ${FM}`; const w = x.measureText(s).width + px * 1.6, h = px * 1.9; x.globalAlpha *= o.a == null ? 1 : o.a;
    if (o.solid) { x.shadowColor = H.rgba(col, 0.6); x.shadowBlur = 20; x.fillStyle = H.rgba(col, 0.92); rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); x.fill(); x.shadowBlur = 0; } else panel(x, cx - w / 2, cy - h / 2, w, h, h / 2, col, 0.12);
    x.fillStyle = o.solid ? '#150d3a' : col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) { x.save(); x.globalAlpha *= o.a == null ? 1 : o.a; panel(x, X, Y, w, h, o.r || 26, o.col || P.cyan, 0.15); x.restore(); }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); glow(x, cx, cy, r * 2.2, col, 0.22 + 0.08 * p); panel(x, cx - r, cy - r, r * 2, r * 2, r, col, 0.18);
    if (o.ring) { x.strokeStyle = H.rgba(col, 0.45 * (1 - p)); x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, r * (1.15 + 0.25 * p), 0, TAU); x.stroke(); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, Array.isArray(col) ? hexOf(col) : col, t);
    if (o.label) text(x, o.label, cx, cy + r + (o.ly || 34), o.lpx || 25, P.ink, { w: 700 });
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.lineCap = 'round'; x.strokeStyle = H.rgba(col, 0.5); x.lineWidth = (o.lw || 3) + 1; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke();
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1, px = lerp(ax, bx, u), py = lerp(ay, by, u); glow(x, px, py, 16, col, 0.7); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(px, py, 3.5, 0, TAU); x.fill(); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = col; x.beginPath(); x.moveTo(2, 0); x.lineTo(-15, -9); x.lineTo(-15, 9); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: '#7a4fff', orbB: '#6fe6ff' });
  registerStyle('glass', { label: 'Glass UI', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
