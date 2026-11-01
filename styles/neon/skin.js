// ===== Neon Tubes skin: dark brick wall, glowing pink and cyan tube lettering and outlines. Original design. =====
(function () {
  const P = { bg0: '#0d0812', bg1: '#140a1c', bg2: '#0a0610', cyan: '#31e6ff', violet: '#b07bff', pink: '#ff3d9a', green: '#5dffa0', amber: '#ffc94d', red: '#ff5a5a', ink: '#fff4fb', mute: '#c9a9d6' };
  const FS = '"Sora", system-ui, sans-serif', FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height, m = Math.min(W, Hh) / 720; x.fillStyle = P.bg0; x.fillRect(0, 0, W, Hh);
    const bh = 46 * m, bw = 120 * m; x.strokeStyle = 'rgba(255,90,170,0.10)'; x.lineWidth = 2;
    for (let r = 0, Y = 0; Y < Hh; Y += bh, r++) { x.beginPath(); x.moveTo(0, Y); x.lineTo(W, Y); x.stroke(); for (let X = (r % 2) * bw / 2; X < W; X += bw) { x.beginPath(); x.moveTo(X, Y); x.lineTo(X, Y + bh); x.stroke(); } }
    glow(x, W * 0.15, Hh * 0.2, 420 * m, '#ff3d9a', 0.22 + 0.04 * Math.sin(t * 2)); glow(x, W * 0.88, Hh * 0.8, 460 * m, '#31e6ff', 0.2 + 0.04 * Math.sin(t * 1.7 + 1));
  }
  function fin(x, t) { const W = x.canvas.width, Hh = x.canvas.height; H.vignette(x, W, Hh, 0.55, '4,0,10'); finish(x, W, Hh, t); }
  function tube(x, s, cx, cy, px, col, align, a) {
    x.save(); x.font = `700 ${px}px ${FS}`; x.textAlign = align; x.textBaseline = 'middle'; x.globalAlpha *= a;
    x.shadowColor = col; x.shadowBlur = px * 0.7; x.fillStyle = col; x.fillText(s, cx, cy); x.shadowBlur = px * 0.25; x.fillText(s, cx, cy); x.shadowBlur = 0; x.fillStyle = 'rgba(255,255,255,0.82)'; x.fillText(s, cx, cy); x.restore();
  }
  function text(x, s, cx, cy, px, col, o = {}) {
    if (o.mono) { x.save(); x.font = `600 ${px}px ${FM}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = col; x.fillText(s, cx, cy); x.restore(); return; }
    const c = (col === P.ink || col === '#ffffff') ? P.pink : col; tube(x, s, cx, cy, Math.round(px * 0.92), c, o.align || 'center', o.a == null ? 1 : o.a);
  }
  function outline(x, X, Y, w, h, r, col, lw) { x.save(); x.shadowColor = col; x.shadowBlur = 18; x.strokeStyle = col; x.lineWidth = lw; rr(x, X, Y, w, h, r); x.stroke(); x.shadowBlur = 0; x.strokeStyle = 'rgba(255,255,255,0.75)'; x.lineWidth = lw * 0.35; rr(x, X, Y, w, h, r); x.stroke(); x.restore(); }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `700 ${px}px ${FS}`; const w = x.measureText(s).width + px * 1.6, h = px * 1.9; x.globalAlpha *= o.a == null ? 1 : o.a;
    if (o.solid) { x.fillStyle = H.rgba(col, 0.25); rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); x.fill(); } outline(x, cx - w / 2, cy - h / 2, w, h, h / 2, col, 3);
    x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) { x.save(); x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = 'rgba(14,6,22,0.82)'; rr(x, X, Y, w, h, o.r || 22); x.fill(); outline(x, X, Y, w, h, o.r || 22, o.col || P.pink, 4); x.restore(); }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); x.fillStyle = 'rgba(14,6,22,0.85)'; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
    x.save(); x.shadowColor = col; x.shadowBlur = 20 + 8 * p; x.strokeStyle = col; x.lineWidth = 5; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.stroke(); x.shadowBlur = 0; x.strokeStyle = 'rgba(255,255,255,0.75)'; x.lineWidth = 1.8; x.stroke(); x.restore();
    if (o.icon) o.icon(x, cx, cy, r * 0.5, '#ffffff', t); if (o.label) text(x, o.label, cx, cy + r + (o.ly || 34), o.lpx || 25, col, {});
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.lineCap = 'round'; x.shadowColor = col; x.shadowBlur = 16; x.strokeStyle = col; x.lineWidth = (o.lw || 3) + 1; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); x.shadowBlur = 0; x.strokeStyle = 'rgba(255,255,255,0.7)'; x.lineWidth = 1.4; x.stroke();
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1, px = lerp(ax, bx, u), py = lerp(ay, by, u); glow(x, px, py, 18, col, 0.8); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(px, py, 4, 0, TAU); x.fill(); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = col; x.beginPath(); x.moveTo(2, 0); x.lineTo(-16, -10); x.lineTo(-16, 10); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: P.pink, orbB: P.cyan });
  registerStyle('neon', { label: 'Neon Tubes', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
