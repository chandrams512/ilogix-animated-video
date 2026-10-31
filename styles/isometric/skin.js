// ===== Isometric Pastel skin (soft pastel slabs and discs with a 3D edge). Travel / lifestyle look. =====
(function () {
  const P = { bg0: '#eef6ff', bg1: '#f1eaff', bg2: '#fff0f5', cyan: '#2fa8d4', violet: '#8a74e8', pink: '#ee6f9f', green: '#3fbf86', amber: '#f2b13a', red: '#ec6a6a', ink: '#2c3764', mute: '#7a86ad' };
  const FN = '"Nunito", "Sora", system-ui, sans-serif', FMONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace', D = 14;
  const shade = (c, k) => { const m = /^#?([0-9a-f]{6})$/i.exec(c); if (!m) return c; const n = parseInt(m[1], 16); return `rgb(${Math.round(((n >> 16) & 255) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k)})`; };
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height, g = x.createLinearGradient(0, 0, W, Hh);
    g.addColorStop(0, P.bg0); g.addColorStop(0.55, P.bg1); g.addColorStop(1, P.bg2); x.fillStyle = g; x.fillRect(0, 0, W, Hh);
    x.save(); x.strokeStyle = 'rgba(120,130,190,0.12)'; x.lineWidth = 1.5; const s = 86, off = (t * 8) % s;
    for (let i = -Hh; i < W + Hh; i += s) { x.beginPath(); x.moveTo(i + off, 0); x.lineTo(i + off + Hh * 1.7, Hh); x.stroke(); x.beginPath(); x.moveTo(i - off, 0); x.lineTo(i - off - Hh * 1.7, Hh); x.stroke(); }
    x.restore();
    const r = H.rng(9); for (let i = 0; i < 8; i++) { const px = r() * W, py = r() * Hh, s2 = 22 + r() * 40; x.fillStyle = H.rgba([P.cyan, P.pink, P.amber, P.violet][i % 4], 0.12); x.beginPath(); x.ellipse(px, py + Math.sin(t * 0.6 + i) * 8, s2, s2 * 0.5, 0, 0, TAU); x.fill(); }
  }
  function fin(x, t) { const W = x.canvas.width, Hh = x.canvas.height; H.vignette(x, W, Hh, 0.12, '110,100,170'); finish(x, W, Hh, t); }
  function text(x, s, cx, cy, px, col, o = {}) {
    x.save(); x.font = `${o.mono ? 600 : 800} ${px}px ${o.mono ? FMONO : FN}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle';
    x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = col; x.fillText(s, cx, cy); x.restore();
  }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `800 ${px}px ${FN}`;
    const w = x.measureText(s).width + px * 1.6, h = px * 2; x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = shade(col, 0.78); rr(x, cx - w / 2, cy - h / 2 + 5, w, h, h / 2); x.fill();
    x.fillStyle = o.solid ? col : '#ffffff'; rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); x.fill();
    x.fillStyle = o.solid ? '#ffffff' : shade(col, 0.8); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) {
    const col = o.col || P.cyan, r = o.r || 22; x.save(); x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = 'rgba(80,90,150,0.16)'; rr(x, X + D + 6, Y + D + 14, w, h, r); x.fill();
    x.fillStyle = shade(col, 0.82); rr(x, X + D, Y + D, w, h, r); x.fill();
    x.beginPath(); x.moveTo(X + w, Y + r); x.lineTo(X + w + D, Y + D + r); x.lineTo(X + w + D, Y + D + h - r); x.lineTo(X + w, Y + h - r); x.closePath(); x.fill();
    x.fillStyle = '#ffffff'; rr(x, X, Y, w, h, r); x.fill();
    x.save(); rr(x, X, Y, w, h, r); x.clip(); x.fillStyle = H.rgba(col, 0.28); x.fillRect(X, Y, w, Math.max(10, h * 0.1)); x.restore(); x.restore();
  }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)), ry = r * 0.66, d = r * 0.3;
    x.fillStyle = 'rgba(80,90,150,0.16)'; x.beginPath(); x.ellipse(cx + 6, cy + d + 14, r * 1.05, ry * 1.05, 0, 0, TAU); x.fill();
    x.fillStyle = shade(col, 0.8); x.beginPath(); x.ellipse(cx, cy + d, r, ry, 0, 0, TAU); x.fill(); x.fillRect(cx - r, cy, r * 2, d);
    x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(cx, cy, r, ry, 0, 0, TAU); x.fill();
    x.fillStyle = H.rgba(col, 0.28); x.beginPath(); x.ellipse(cx, cy, r * 0.8, ry * 0.8, 0, 0, TAU); x.fill();
    if (o.ring) { x.save(); x.lineWidth = 2.5; x.strokeStyle = H.rgba(col, 0.55 * (1 - p)); x.beginPath(); x.ellipse(cx, cy, r * (1.15 + 0.3 * p), ry * (1.15 + 0.3 * p), 0, 0, TAU); x.stroke(); x.restore(); }
    if (o.icon) o.icon(x, cx, cy - 1, r * 0.46, shade(col, 0.78), t);
    if (o.label) text(x, o.label, cx, cy + r + (o.ly || 38), o.lpx || 26, P.ink, {});
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.lineCap = 'round'; x.strokeStyle = H.rgba(col, 0.6); x.lineWidth = (o.lw || 3) + 2; x.setLineDash([2, 12]); x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); x.setLineDash([]);
    const n = o.dots == null ? 2 : o.dots;
    for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1, px = lerp(ax, bx, u), py = lerp(ay, by, u); x.fillStyle = shade(col, 0.8); x.beginPath(); x.ellipse(px, py + 4, 9, 5, 0, 0, TAU); x.fill(); x.fillStyle = col; x.beginPath(); x.ellipse(px, py, 9, 5, 0, 0, TAU); x.fill(); }
    if (o.head) { const ang = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(ang); x.fillStyle = col; x.beginPath(); x.moveTo(2, 0); x.lineTo(-15, -9); x.lineTo(-15, 9); x.closePath(); x.fill(); }
    x.restore();
  }
  function wordmark(x, big) {
    if (big) { text(x, 'iLogix Digital', 640, 120, 66, P.ink, {}); return; }
    x.fillStyle = shade(P.violet, 0.8); x.beginPath(); x.ellipse(56, 52, 15, 8, 0, 0, TAU); x.fill(); x.fillStyle = P.violet; x.beginPath(); x.ellipse(56, 46, 15, 8, 0, 0, TAU); x.fill();
    text(x, 'iLogix Digital', 82, 46, 22, P.ink, { align: 'left' });
  }
  function orb(x, cx, cy, r, t, label) {
    for (let i = 0; i < 3; i++) { const u = (t * 0.6 + i / 3) % 1; x.strokeStyle = H.rgba(P.violet, 0.45 * (1 - u)); x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r * (1 + 0.7 * u), 0, TAU); x.stroke(); }
    x.fillStyle = 'rgba(80,90,150,0.16)'; x.beginPath(); x.ellipse(cx + 5, cy + r + 10, r * 0.9, r * 0.28, 0, 0, TAU); x.fill();
    const g = x.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r); g.addColorStop(0, '#d9ceff'); g.addColorStop(1, P.violet);
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
    const n = 11;
    for (let i = 0; i < n; i++) { const k = 1 - Math.abs(i - (n - 1) / 2) / (n / 2) * 0.6, hg = r * (0.16 + 0.5 * Math.abs(Math.sin(t * 4 + i * 0.8)) * k); x.fillStyle = '#ffffff'; rr(x, cx - r * 0.62 + i * (r * 1.24 / (n - 1)) - r * 0.045, cy - hg / 2, r * 0.09, hg, r * 0.045); x.fill(); }
    if (label) text(x, label, cx, cy + r + 34, 26, P.ink, {});
  }
  registerStyle('isometric', { label: 'Isometric Pastel', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark, orb, icon: STYLES['tech-glow'].icon });
})();
