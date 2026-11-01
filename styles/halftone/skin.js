// ===== Halftone skin: printed-magazine look. Cream paper, black ink, one red, dot-screen shading. Original design. =====
(function () {
  const P = { bg0: '#f1e8d6', bg1: '#ece1cb', bg2: '#e5d8bd', cyan: '#e8412f', violet: '#222222', pink: '#e85b4a', green: '#4a4a4a', amber: '#8a8478', red: '#d6281e', ink: '#141414', mute: '#5a5448' };
  const FA = '"Archivo Black", "Nunito", Impact, sans-serif', FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
  function dots(x, X, Y, w, h, step, col, fn) { x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip(); x.fillStyle = col; for (let j = 0, yy = Y; yy < Y + h + step; yy += step, j++) for (let xx = X + (j % 2) * step / 2; xx < X + w + step; xx += step) { const r = fn(xx, yy); if (r > 0.3) { x.beginPath(); x.arc(xx, yy, r, 0, TAU); x.fill(); } } x.restore(); }
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height, m = Math.min(W, Hh) / 720; x.fillStyle = P.bg0; x.fillRect(0, 0, W, Hh); const s = 16 * m, cx = W * 0.96, cy = Hh * 0.04 + Math.sin(t * 0.5) * 6, R = Math.max(W, Hh) * 0.55;
    dots(x, 0, 0, W, Hh, s, 'rgba(214,40,30,0.55)', (X, Y) => Math.max(0, (1 - Math.hypot(X - cx, Y - cy) / R)) * s * 0.55);
    dots(x, 0, 0, W, Hh, s, 'rgba(20,20,20,0.22)', (X, Y) => Math.max(0, (1 - Math.hypot(X - W * 0.02, Y - Hh * 0.98) / (R * 0.8))) * s * 0.5);
    x.fillStyle = P.ink; x.fillRect(0, 0, W, 8 * m);
  }
  function fin(x, t) { finish(x, x.canvas.width, x.canvas.height, t); }
  function text(x, s, cx, cy, px, col, o = {}) { x.save(); let fp = Math.round(px * 0.96); x.font = o.mono ? `600 ${px}px ${FM}` : `400 ${fp}px ${FA}`; if (!o.mono) { const mw = x.measureText(s).width, lim = x.canvas.width / x.getTransform().a - 50; if (mw > lim) { fp = Math.floor(fp * lim / mw); x.font = `400 ${fp}px ${FA}`; } } x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = col; x.fillText(s, cx, cy); x.restore(); }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.red; x.save(); x.font = `400 ${px * 0.95}px ${FA}`; const w = x.measureText(s).width + px * 1.6, h = px * 1.8; x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = o.solid ? col : '#fffaf0'; x.fillRect(cx - w / 2, cy - h / 2, w, h); x.lineWidth = 3; x.strokeStyle = P.ink; x.strokeRect(cx - w / 2, cy - h / 2, w, h); x.fillStyle = o.solid ? '#fffaf0' : P.ink; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) {
    x.save(); x.globalAlpha *= o.a == null ? 1 : o.a; dots(x, X + 10, Y + 10, w, h, 8, P.ink, () => 2.2); x.fillStyle = '#fffaf0'; x.fillRect(X, Y, w, h);
    dots(x, X, Y, w, 10, 6, o.col || P.red, () => 2.2); x.lineWidth = 3.5; x.strokeStyle = P.ink; x.strokeRect(X, Y, w, h); x.restore();
  }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); x.save(); x.beginPath(); x.arc(cx + 7, cy + 7, r, 0, TAU); x.clip(); x.fillStyle = P.ink; for (let yy = cy - r, j = 0; yy < cy + r * 2; yy += 8, j++) for (let xx = cx - r + (j % 2) * 4; xx < cx + r * 2; xx += 8) { x.beginPath(); x.arc(xx, yy, 2.2, 0, TAU); x.fill(); } x.restore();
    x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); x.lineWidth = 4; x.strokeStyle = P.ink; x.stroke();
    if (o.ring) { x.strokeStyle = H.rgba(P.ink, 0.35 * (1 - p)); x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r * (1.2 + 0.3 * p), 0, TAU); x.stroke(); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, '#fffaf0', t); if (o.label) text(x, o.label, cx, cy + r + (o.ly || 34), o.lpx || 24, P.ink, {});
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.strokeStyle = P.ink; x.lineWidth = (o.lw || 3) + 1; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke();
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1, px = lerp(ax, bx, u), py = lerp(ay, by, u); x.fillStyle = col; x.beginPath(); x.arc(px, py, 9, 0, TAU); x.fill(); x.lineWidth = 3; x.strokeStyle = P.ink; x.stroke(); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = P.ink; x.beginPath(); x.moveTo(4, 0); x.lineTo(-18, -12); x.lineTo(-18, 12); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: P.red, orbB: P.amber, outline: 5, outlineCol: P.ink });
  registerStyle('halftone', { label: 'Halftone', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
