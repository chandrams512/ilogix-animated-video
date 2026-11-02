// ===== Swiss skin: warm white, strict grid, heavy black rules, one red accent, flat geometry. Original design in the International Typographic tradition. =====
(function () {
  const P = { bg0: '#f4f2ed', bg1: '#efece5', bg2: '#e9e5dc', cyan: '#1b4fd8', violet: '#6a3fd0', pink: '#e5322d', green: '#0c8a5a', amber: '#f2a900', red: '#e5322d', ink: '#111111', mute: '#55524c', capHi: '#8fb0ff' };
  const FS = '"Sora", "Helvetica Neue", Arial, sans-serif', FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height, m = Math.min(W, Hh) / 720; x.fillStyle = P.bg0; x.fillRect(0, 0, W, Hh);
    const g = 120 * m; x.strokeStyle = 'rgba(17,17,17,0.07)'; x.lineWidth = 1.5; for (let X = g; X < W; X += g) { x.beginPath(); x.moveTo(X, 0); x.lineTo(X, Hh); x.stroke(); } for (let Y = g; Y < Hh; Y += g) { x.beginPath(); x.moveTo(0, Y); x.lineTo(W, Y); x.stroke(); }
    const sw = Math.sin(t * 0.5) * 8 * m; x.fillStyle = P.red; x.beginPath(); x.arc(W - 26 * m, 4 * m + sw, 66 * m, 0, TAU); x.fill();
    x.fillStyle = P.ink; x.fillRect(0, 0, W, 10 * m); x.fillRect(0, Hh - 10 * m, W * 0.34, 10 * m);
  }
  function fin(x, t) { finish(x, x.canvas.width, x.canvas.height, t); }
  function text(x, s, cx, cy, px, col, o = {}) { x.save(); x.font = `${o.mono ? 600 : 800} ${o.mono ? px : Math.round(px * 0.97)}px ${o.mono ? FM : FS}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = col; x.fillText(s, cx, cy); x.restore(); }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `700 ${px}px ${FS}`; const w = x.measureText(s).width + px * 1.5, h = px * 1.8; x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = o.solid ? col : '#ffffff'; x.fillRect(cx - w / 2, cy - h / 2, w, h); x.lineWidth = 3; x.strokeStyle = P.ink; x.strokeRect(cx - w / 2, cy - h / 2, w, h);
    x.fillStyle = o.solid ? '#ffffff' : P.ink; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) {
    const col = o.col || P.red; x.save(); x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = '#ffffff'; x.fillRect(X, Y, w, h);
    x.fillStyle = P.ink; x.fillRect(X, Y, w, 8); x.fillStyle = col; x.fillRect(X, Y, Math.min(70, w * 0.22), 8);
    x.lineWidth = 2; x.strokeStyle = 'rgba(17,17,17,0.55)'; x.strokeRect(X, Y, w, h); x.restore();
  }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); x.lineWidth = 4; x.strokeStyle = P.ink; x.stroke();
    if (o.ring) { x.strokeStyle = H.rgba(P.ink, 0.35 * (1 - p)); x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r * (1.25 + 0.3 * p), 0, TAU); x.stroke(); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, '#ffffff', t); if (o.label) { const ly = cy + r + (o.ly || 34), lp = o.lpx || 26; x.save(); x.font = `800 ${Math.round(lp * 0.97)}px ${FS}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 10; x.strokeStyle = P.bg0; x.globalAlpha *= 0.96; x.strokeText(o.label, cx, ly); x.restore(); text(x, o.label, cx, ly, lp, P.ink, {}); }
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.lineCap = 'butt'; x.strokeStyle = P.ink; x.lineWidth = (o.lw || 3) + 1; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke();
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1, px = lerp(ax, bx, u), py = lerp(ay, by, u); x.fillStyle = col; x.fillRect(px - 8, py - 8, 16, 16); x.lineWidth = 2; x.strokeStyle = P.ink; x.strokeRect(px - 8, py - 8, 16, 16); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = P.ink; x.beginPath(); x.moveTo(4, 0); x.lineTo(-18, -12); x.lineTo(-18, 12); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: P.red, orbB: P.ink, outline: 5, outlineCol: P.ink });
  registerStyle('swiss', { label: 'Swiss Grid', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
