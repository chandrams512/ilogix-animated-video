// ===== Retro VHS skin: 80s sunset grid, chrome-pink type with colour fringing, scan lines and tape noise. Original design. =====
(function () {
  const P = { bg0: '#1a0b3a', bg1: '#2a0f55', bg2: '#12062b', cyan: '#33e8ff', violet: '#a56bff', pink: '#ff4fa3', green: '#5dffb0', amber: '#ffd34d', red: '#ff5a5a', ink: '#fff3fb', mute: '#c9a9e8' };
  const FA = '"Archivo Black", "Nunito", Impact, sans-serif', FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace'; let T = 0;
  function bg(x, t) {
    T = t; const W = x.canvas.width, Hh = x.canvas.height, m = Math.min(W, Hh) / 720, hz = Hh * 0.72, g = x.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, '#12062b'); g.addColorStop(0.7, '#3a1070'); g.addColorStop(1, '#ff5f9e'); x.fillStyle = g; x.fillRect(0, 0, W, hz);
    const sr = 92 * m, sy = hz - sr * 0.25, sg = x.createLinearGradient(0, sy - sr, 0, sy + sr); sg.addColorStop(0, '#ffe45c'); sg.addColorStop(1, '#ff3f8e'); x.save(); x.globalAlpha = 0.6; x.beginPath(); x.arc(W / 2, sy, sr, 0, TAU); x.clip(); x.fillStyle = sg; x.fillRect(W / 2 - sr, sy - sr, sr * 2, sr * 2); x.fillStyle = '#3a1070'; for (let i = 0; i < 6; i++) x.fillRect(W / 2 - sr, sy + sr * (0.05 + i * 0.16), sr * 2, (1 + i) * 2.4 * m); x.restore();
    x.fillStyle = '#120629'; x.fillRect(0, hz, W, Hh - hz); x.strokeStyle = 'rgba(255,79,163,0.55)'; x.lineWidth = 2;
    for (let i = -14; i <= 14; i++) { x.beginPath(); x.moveTo(W / 2 + i * 14 * m, hz); x.lineTo(W / 2 + i * 150 * m, Hh); x.stroke(); }
    const off = (t * 0.5) % 1; for (let i = 0; i < 12; i++) { const u = (i + off) / 12, y = hz + (Hh - hz) * u * u; x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
  }
  function fin(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height; H.vignette(x, W, Hh, 0.35, '10,0,24'); finish(x, W, Hh, t);
    x.fillStyle = 'rgba(0,0,0,0.13)'; for (let Y = 0; Y < Hh; Y += 4) x.fillRect(0, Y, W, 1.6);
    const by = ((t * 0.23) % 1) * (Hh + 120) - 60; x.fillStyle = 'rgba(255,255,255,0.045)'; x.fillRect(0, by, W, 38); const r = H.rng(Math.floor(t * 12) + 5); x.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 24; i++) x.fillRect(r() * W, by + r() * 38, 20 + r() * 80, 2);
  }
  function text(x, s, cx, cy, px, col, o = {}) {
    x.save(); x.globalAlpha *= o.a == null ? 1 : o.a; if (o.mono) { x.font = `600 ${px}px ${FM}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.fillStyle = col; x.fillText(s, cx, cy); x.restore(); return; }
    let fp = Math.round(px * 0.98); x.font = `400 ${fp}px ${FA}`; { const mw = x.measureText(s).width, lim = x.canvas.width / x.getTransform().a - 50; if (mw > lim) { fp = Math.floor(fp * lim / mw); x.font = `400 ${fp}px ${FA}`; } } x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; const f = px * 0.045 + 1;
    x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(255,40,90,0.55)'; x.fillText(s, cx - f, cy); x.fillStyle = 'rgba(30,230,255,0.55)'; x.fillText(s, cx + f, cy); x.globalCompositeOperation = 'source-over';
    if (px >= 40) { const g = x.createLinearGradient(0, cy - px * 0.5, 0, cy + px * 0.5); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, col === P.ink ? '#ffd0f0' : col); g.addColorStop(0.52, col === P.ink ? '#ff7ac8' : col); g.addColorStop(1, '#ffffff'); x.fillStyle = g; } else x.fillStyle = col; x.fillText(s, cx, cy); x.restore();
  }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `400 ${px}px ${FA}`; const w = x.measureText(s).width + px * 1.6, h = px * 1.8; x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = o.solid ? col : 'rgba(18,6,43,0.85)'; rr(x, cx - w / 2, cy - h / 2, w, h, 6); x.fill(); x.strokeStyle = col; x.lineWidth = 2.5; x.stroke(); x.fillStyle = o.solid ? '#12062b' : col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) { const col = o.col || P.pink; x.save(); x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = 'rgba(18,6,43,0.88)'; rr(x, X, Y, w, h, 10); x.fill(); x.shadowColor = col; x.shadowBlur = 16; x.strokeStyle = col; x.lineWidth = 3; x.stroke(); x.shadowBlur = 0; x.fillStyle = H.rgba(col, 0.18); x.fillRect(X + 4, Y + 4, w - 8, Math.max(10, h * 0.1)); x.restore(); }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); x.fillStyle = 'rgba(18,6,43,0.9)'; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); x.save(); x.shadowColor = col; x.shadowBlur = 16; x.strokeStyle = col; x.lineWidth = 5; x.stroke(); x.restore();
    if (o.ring) { x.strokeStyle = H.rgba(col, 0.5 * (1 - p)); x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r * (1.2 + 0.3 * p), 0, TAU); x.stroke(); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, '#ffffff', t); if (o.label) text(x, o.label, cx, cy + r + (o.ly || 34), o.lpx || 24, P.ink, {});
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.lineCap = 'round'; x.shadowColor = col; x.shadowBlur = 10; x.strokeStyle = col; x.lineWidth = (o.lw || 3) + 1; x.setLineDash([16, 8]); x.lineDashOffset = -t * 30; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); x.setLineDash([]); x.shadowBlur = 0;
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1; x.fillStyle = '#fff'; x.beginPath(); x.arc(lerp(ax, bx, u), lerp(ay, by, u), 5, 0, TAU); x.fill(); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = col; x.beginPath(); x.moveTo(2, 0); x.lineTo(-16, -10); x.lineTo(-16, 10); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: P.pink, orbB: P.amber });
  registerStyle('vhs', { label: 'Retro VHS', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
