// ===== Dark Keynote skin: near-black stage, soft spotlight glow, big white type, dark rounded cards with hairline borders. Original design for product-launch videos. =====
(function () {
  const P = { bg0: '#09090b', bg1: '#101014', bg2: '#0b0b10', cyan: '#2997ff', violet: '#bf5af2', pink: '#ff4f81', green: '#30d158', amber: '#ff9f0a', red: '#ff6a5f', ink: '#f5f5f7', mute: '#9a9aa3' };
  const FS = '"Sora", "Helvetica Neue", Arial, sans-serif', FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height, m = Math.min(W, Hh) / 720; x.fillStyle = P.bg0; x.fillRect(0, 0, W, Hh);
    const cx = W * (0.5 + 0.12 * Math.sin(t * 0.35)), cy = Hh * 0.18; glow(x, cx, cy, Math.max(W, Hh) * 0.55, '#3a5bff', 0.28); glow(x, W * (0.2 + 0.1 * Math.cos(t * 0.3)), Hh * 0.95, Math.max(W, Hh) * 0.5, '#a14bff', 0.16);
    const g = x.createLinearGradient(0, Hh * 0.7, 0, Hh); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)'); x.fillStyle = g; x.fillRect(0, Hh * 0.7, W, Hh * 0.3);
  }
  function fin(x, t) { const W = x.canvas.width, Hh = x.canvas.height; H.vignette(x, W, Hh, 0.3, '0,0,0'); finish(x, W, Hh, t); }
  function text(x, s, cx, cy, px, col, o = {}) { x.save(); x.font = `${o.mono ? 600 : 700} ${o.mono ? px : Math.round(px * 0.98)}px ${o.mono ? FM : FS}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = col; x.fillText(s, cx, cy); x.restore(); }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `600 ${px}px ${FS}`; const w = x.measureText(s).width + px * 1.6, h = px * 1.9; x.globalAlpha *= o.a == null ? 1 : o.a;
    if (o.solid) { x.fillStyle = col; rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); x.fill(); } else { x.fillStyle = 'rgba(255,255,255,0.08)'; rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); x.fill(); x.lineWidth = 1.5; x.strokeStyle = 'rgba(255,255,255,0.28)'; x.stroke(); }
    x.fillStyle = o.solid ? '#ffffff' : P.ink; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) {
    const col = o.col || P.cyan; x.save(); x.globalAlpha *= o.a == null ? 1 : o.a; x.shadowColor = 'rgba(0,0,0,0.6)'; x.shadowBlur = 40; x.shadowOffsetY = 18; x.fillStyle = '#17171c'; rr(x, X, Y, w, h, o.r || 28); x.fill(); x.shadowBlur = 0; x.shadowOffsetY = 0;
    const g = x.createLinearGradient(X, Y, X, Y + h); g.addColorStop(0, 'rgba(255,255,255,0.09)'); g.addColorStop(0.4, 'rgba(255,255,255,0)'); x.fillStyle = g; rr(x, X, Y, w, h, o.r || 28); x.fill();
    x.lineWidth = 1.6; x.strokeStyle = 'rgba(255,255,255,0.14)'; rr(x, X, Y, w, h, o.r || 28); x.stroke(); x.fillStyle = col; rr(x, X + 22, Y + 1, Math.min(60, w * 0.2), 4, 2); x.fill(); x.restore();
  }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); glow(x, cx, cy, r * 2.2, col, 0.2 + 0.06 * p); x.fillStyle = '#1b1b21'; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); x.lineWidth = 4; x.strokeStyle = col; x.stroke();
    if (o.ring) { x.strokeStyle = H.rgba(col, 0.4 * (1 - p)); x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, r * (1.2 + 0.25 * p), 0, TAU); x.stroke(); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, col, t); if (o.label) text(x, o.label, cx, cy + r + (o.ly || 34), o.lpx || 25, P.ink, {});
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.lineCap = 'round'; x.strokeStyle = 'rgba(255,255,255,0.22)'; x.lineWidth = o.lw || 3; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke();
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1, px = lerp(ax, bx, u), py = lerp(ay, by, u); glow(x, px, py, 18, col, 0.8); x.fillStyle = '#fff'; x.beginPath(); x.arc(px, py, 3.6, 0, TAU); x.fill(); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = 'rgba(255,255,255,0.7)'; x.beginPath(); x.moveTo(2, 0); x.lineTo(-15, -9); x.lineTo(-15, 9); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: '#2997ff', orbB: '#bf5af2' });
  registerStyle('keynote', { label: 'Dark Keynote', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
