// ===== Flat Vector skin (warm paper, flat shapes, hard shadows). Education look. =====
// Uses kit helpers from style.js (rr, glow, finish, TAU, lerp, H) and the line icons from Tech Glow.
(function () {
  const P = { bg0: '#fbf3e4', bg1: '#f6e9d0', bg2: '#f0dcbb', cyan: '#1b93cf', violet: '#7451d6', pink: '#e2477a', green: '#25a866', amber: '#e89a10', red: '#d9413a', ink: '#1c2441', mute: '#66708f' };
  const FN = '"Nunito", "Sora", system-ui, sans-serif', FMONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
  const dark = (c, k) => { const m = /^#?([0-9a-f]{6})$/i.exec(c); if (!m) return c; const n = parseInt(m[1], 16); return `rgb(${Math.round(((n >> 16) & 255) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k)})`; };
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height, g = x.createLinearGradient(0, 0, W * 0.3, Hh);
    g.addColorStop(0, P.bg0); g.addColorStop(0.6, P.bg1); g.addColorStop(1, P.bg2); x.fillStyle = g; x.fillRect(0, 0, W, Hh);
    const r = H.rng(5); x.save();
    for (let i = 0; i < 14; i++) { const px = r() * W, py = r() * Hh, s = 30 + r() * 90, drift = Math.sin(t * 0.4 + i) * 10; x.fillStyle = H.rgba([P.cyan, P.pink, P.amber, P.green][i % 4], 0.07); x.beginPath(); x.arc(px, py + drift, s, 0, TAU); x.fill(); }
    x.fillStyle = 'rgba(28,36,65,0.06)'; for (let X = 24; X < W; X += 48) for (let Y = 24; Y < Hh; Y += 48) { x.beginPath(); x.arc(X, Y, 1.6, 0, TAU); x.fill(); }
    x.restore();
  }
  function fin(x, t) { const W = x.canvas.width, Hh = x.canvas.height; H.vignette(x, W, Hh, 0.18, '120,80,30'); finish(x, W, Hh, t); }
  function text(x, s, cx, cy, px, col, o = {}) {
    x.save(); x.font = `${o.mono ? 600 : 800} ${px}px ${o.mono ? FMONO : FN}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle';
    x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = col; x.fillText(s, cx, cy); x.restore();
  }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `800 ${px}px ${FN}`;
    const w = x.measureText(s).width + px * 1.6, h = px * 2; x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = 'rgba(28,36,65,0.16)'; rr(x, cx - w / 2 + 3, cy - h / 2 + 4, w, h, h / 2); x.fill();
    x.fillStyle = o.solid ? col : '#fffdf8'; rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); x.fill();
    x.lineWidth = 2.5; x.strokeStyle = o.solid ? dark(col, 0.7) : col; rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); x.stroke();
    x.fillStyle = o.solid ? '#ffffff' : dark(col, 0.75); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) {
    const col = o.col || P.cyan, r = o.r || 22; x.save(); x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = 'rgba(28,36,65,0.18)'; rr(x, X + 7, Y + 9, w, h, r); x.fill();
    x.fillStyle = '#fffdf8'; rr(x, X, Y, w, h, r); x.fill();
    x.save(); rr(x, X, Y, w, h, r); x.clip(); x.fillStyle = H.rgba(col, 0.85); x.fillRect(X, Y, w, Math.max(10, h * 0.08)); x.restore();
    x.lineWidth = 3.5; x.strokeStyle = P.ink; rr(x, X, Y, w, h, r); x.stroke(); x.restore();
  }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0));
    x.fillStyle = 'rgba(28,36,65,0.18)'; x.beginPath(); x.arc(cx + 5, cy + 7, r, 0, TAU); x.fill();
    x.fillStyle = H.rgba(col, 0.2); x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); x.fillStyle = '#fffdf8'; x.beginPath(); x.arc(cx, cy, r * 0.86, 0, TAU); x.fill();
    x.lineWidth = 4; x.strokeStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.stroke();
    if (o.ring) { x.save(); x.lineWidth = 2.5; x.strokeStyle = H.rgba(col, 0.5 * (1 - p)); x.beginPath(); x.arc(cx, cy, r * (1.15 + 0.25 * p), 0, TAU); x.stroke(); x.restore(); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, Array.isArray(col) ? hexOf(col) : dark(col, 0.85), t);
    if (o.label) text(x, o.label, cx, cy + r + (o.ly || 32), o.lpx || 26, P.ink, { w: 800 });
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.lineCap = 'round'; x.strokeStyle = H.rgba(col, 0.55); x.lineWidth = (o.lw || 3) + 1; x.setLineDash([10, 9]); x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); x.setLineDash([]);
    const n = o.dots == null ? 2 : o.dots;
    for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1, px = lerp(ax, bx, u), py = lerp(ay, by, u); x.fillStyle = col; x.beginPath(); x.arc(px, py, 7, 0, TAU); x.fill(); x.lineWidth = 2.5; x.strokeStyle = '#fffdf8'; x.stroke(); }
    if (o.head) { const ang = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(ang); x.fillStyle = col; x.beginPath(); x.moveTo(2, 0); x.lineTo(-15, -9); x.lineTo(-15, 9); x.closePath(); x.fill(); }
    x.restore();
  }
  function wordmark(x, big) {
    if (big) { text(x, 'iLogix Digital', 640, 120, 66, P.ink, {}); return; }
    x.fillStyle = P.cyan; rr(x, 42, 33, 28, 28, 8); x.fill(); x.lineWidth = 3; x.strokeStyle = P.ink; rr(x, 42, 33, 28, 28, 8); x.stroke();
    text(x, 'iLogix Digital', 82, 47, 22, P.ink, { align: 'left' });
  }
  function orb(x, cx, cy, r, t, label) {
    for (let i = 0; i < 3; i++) { const u = (t * 0.6 + i / 3) % 1; x.strokeStyle = H.rgba(P.violet, 0.5 * (1 - u)); x.lineWidth = 3.5; x.beginPath(); x.arc(cx, cy, r * (1 + 0.7 * u), 0, TAU); x.stroke(); }
    x.fillStyle = 'rgba(28,36,65,0.18)'; x.beginPath(); x.arc(cx + 6, cy + 8, r, 0, TAU); x.fill();
    x.fillStyle = P.violet; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); x.lineWidth = 4; x.strokeStyle = P.ink; x.stroke();
    const n = 11;
    for (let i = 0; i < n; i++) { const k = 1 - Math.abs(i - (n - 1) / 2) / (n / 2) * 0.6, hg = r * (0.16 + 0.5 * Math.abs(Math.sin(t * 4 + i * 0.8)) * k); x.fillStyle = '#fffdf8'; rr(x, cx - r * 0.62 + i * (r * 1.24 / (n - 1)) - r * 0.045, cy - hg / 2, r * 0.09, hg, r * 0.045); x.fill(); }
    if (label) text(x, label, cx, cy + r + 34, 26, P.ink, {});
  }
  registerStyle('flat-vector', { label: 'Flat Vector', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark, orb, icon: STYLES['tech-glow'].icon });
})();
