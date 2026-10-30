// ===== Neo-brutalist skin: cream paper, thick black outlines, hard shadows, loud colour. Social look. Original design. =====
(function () {
  const P = { bg0: '#fff4cf', bg1: '#ffeeb8', bg2: '#ffe7a0', cyan: '#2bb8f0', violet: '#8f63ff', pink: '#ff5fa8', green: '#2fd47a', amber: '#ffb800', red: '#ff4d3d', ink: '#111111', mute: '#4a4a4a' };
  const FN = '"Nunito", "Sora", system-ui, sans-serif', FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace', B = 4, SH = 8;
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height; x.fillStyle = P.bg0; x.fillRect(0, 0, W, Hh);
    const m = Math.min(W, Hh) / 720, sh = [[0.97, 0.03, 120 * m, P.pink], [0.02, 0.985, 150 * m, P.cyan], [0.985, 0.93, 90 * m, P.green]]; sh.forEach(([a, b, s, c], i) => { const cx = W * a + Math.sin(t * 0.5 + i) * 10, cy = Hh * b + Math.cos(t * 0.4 + i) * 10; x.fillStyle = c; x.strokeStyle = P.ink; x.lineWidth = B; if (i % 2) { x.beginPath(); x.arc(cx, cy, s * 0.6, 0, TAU); x.fill(); x.stroke(); } else { x.fillRect(cx - s / 2, cy - s / 2, s, s); x.strokeRect(cx - s / 2, cy - s / 2, s, s); } });
    x.fillStyle = 'rgba(17,17,17,0.08)'; for (let X = 20; X < W; X += 32) for (let Y = 20; Y < Hh; Y += 32) x.fillRect(X, Y, 3, 3);
  }
  function fin(x, t) { const W = x.canvas.width, Hh = x.canvas.height; finish(x, W, Hh, t); }
  function text(x, s, cx, cy, px, col, o = {}) { x.save(); x.font = `${o.mono ? 600 : 900} ${px}px ${o.mono ? FM : FN}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = col; x.fillText(s, cx, cy); x.restore(); }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `900 ${px}px ${FN}`; const w = x.measureText(s).width + px * 1.6, h = px * 1.9; x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = P.ink; x.fillRect(cx - w / 2 + 4, cy - h / 2 + 5, w, h); x.fillStyle = o.solid ? col : '#ffffff'; x.fillRect(cx - w / 2, cy - h / 2, w, h); x.lineWidth = 3; x.strokeStyle = P.ink; x.strokeRect(cx - w / 2, cy - h / 2, w, h);
    x.fillStyle = P.ink; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) {
    const col = o.col || P.cyan; x.save(); x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = P.ink; x.fillRect(X + SH, Y + SH, w, h); x.fillStyle = '#ffffff'; x.fillRect(X, Y, w, h);
    x.fillStyle = col; x.fillRect(X, Y, w, Math.max(14, h * 0.1)); x.lineWidth = B; x.strokeStyle = P.ink; x.strokeRect(X, Y, w, h); x.beginPath(); x.moveTo(X, Y + Math.max(14, h * 0.1)); x.lineTo(X + w, Y + Math.max(14, h * 0.1)); x.stroke(); x.restore();
  }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); x.fillStyle = P.ink; x.beginPath(); x.arc(cx + 6, cy + 7, r, 0, TAU); x.fill(); x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); x.lineWidth = B; x.strokeStyle = P.ink; x.stroke();
    if (o.ring) { x.strokeStyle = H.rgba(P.ink, 0.4 * (1 - p)); x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r * (1.2 + 0.3 * p), 0, TAU); x.stroke(); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, P.ink, t);
    if (o.label) text(x, o.label, cx, cy + r + (o.ly || 34), o.lpx || 26, P.ink, {});
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.lineCap = 'butt'; x.strokeStyle = P.ink; x.lineWidth = (o.lw || 3) + 3; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); x.strokeStyle = col; x.lineWidth = (o.lw || 3); x.stroke();
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1, px = lerp(ax, bx, u), py = lerp(ay, by, u); x.fillStyle = col; x.fillRect(px - 8, py - 8, 16, 16); x.lineWidth = 3; x.strokeStyle = P.ink; x.strokeRect(px - 8, py - 8, 16, 16); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = P.ink; x.beginPath(); x.moveTo(4, 0); x.lineTo(-18, -12); x.lineTo(-18, 12); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: P.violet, orbB: P.pink, outline: 5, outlineCol: P.ink });
  registerStyle('neo-brutal', { label: 'Neo-brutalist', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
