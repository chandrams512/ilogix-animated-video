// ===== Paper Cut skin: layered paper on deep teal, soft cut-out shadows, warm coral and mustard. Original design. =====
(function () {
  const P = { bg0: '#0f4a52', bg1: '#0b3a44', bg2: '#082d38', cyan: '#5fd6c8', violet: '#a897f2', pink: '#ff8a7a', green: '#9bdc74', amber: '#ffc95a', red: '#ff6f61', ink: '#fff6e2', mute: '#a9c9c6' };
  const FN = '"Nunito", "Sora", system-ui, sans-serif', FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
  const PAPER = '#17636b', EDGE = '#0a2e36';
  function hills(x, W, Hh, t, base, amp, col, ph, k) {
    x.beginPath(); x.moveTo(0, Hh); for (let X = 0; X <= W + 20; X += 20) x.lineTo(X, Hh * base + Math.sin(X / (W * k) + ph + t * 0.18) * amp); x.lineTo(W, Hh); x.closePath();
    x.save(); x.shadowColor = 'rgba(0,0,0,0.35)'; x.shadowBlur = 24; x.shadowOffsetY = -6; x.fillStyle = col; x.fill(); x.restore();
  }
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height, m = Math.min(W, Hh) / 720, g = x.createLinearGradient(0, 0, 0, Hh);
    g.addColorStop(0, P.bg0); g.addColorStop(1, P.bg2); x.fillStyle = g; x.fillRect(0, 0, W, Hh);
    // paper sun and moons
    const sx = W * 0.9, sy = Hh * (W > Hh ? 0.14 : 0.07) + Math.sin(t * 0.4) * 5;
    [[100, '#ffb76b', 0.3], [74, '#ffc95a', 0.5], [48, '#ffe08a', 0.8]].forEach(([r, c, a]) => { x.save(); x.shadowColor = 'rgba(0,0,0,0.3)'; x.shadowBlur = 16; x.shadowOffsetY = 5; x.globalAlpha = a * 0.55; x.fillStyle = c; x.beginPath(); x.arc(sx, sy, r * m, 0, TAU); x.fill(); x.restore(); });
    hills(x, W, Hh, t, 0.84, 26 * m, '#14606a', 0.5, 0.17);
    hills(x, W, Hh, t, 0.90, 22 * m, '#0f4f59', 2.1, 0.13);
    hills(x, W, Hh, t, 0.96, 16 * m, '#0a3d47', 4.0, 0.1);
    const r = H.rng(21); for (let i = 0; i < 14; i++) { const px = r() * W, py = r() * Hh * 0.8, s = 2 + r() * 4; x.fillStyle = H.rgba(P.ink, 0.1 + 0.12 * Math.abs(Math.sin(t * 0.8 + i))); x.beginPath(); x.arc(px, py, s, 0, TAU); x.fill(); }
  }
  function fin(x, t) { const W = x.canvas.width, Hh = x.canvas.height; H.vignette(x, W, Hh, 0.3, '0,18,24'); finish(x, W, Hh, t); }
  function text(x, s, cx, cy, px, col, o = {}) {
    x.save(); x.font = `${o.mono ? 600 : 800} ${px}px ${o.mono ? FM : FN}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = 'rgba(0,0,0,0.28)'; x.fillText(s, cx + 2, cy + 3); x.fillStyle = col; x.fillText(s, cx, cy); x.restore();
  }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `800 ${px}px ${FN}`; const w = x.measureText(s).width + px * 1.6, h = px * 1.9; x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = 'rgba(0,0,0,0.3)'; rr(x, cx - w / 2 + 2, cy - h / 2 + 5, w, h, h / 2); x.fill();
    x.fillStyle = o.solid ? col : PAPER; rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); x.fill();
    if (!o.solid) { x.strokeStyle = col; x.lineWidth = 2; x.stroke(); }
    x.fillStyle = o.solid ? '#0a2e36' : col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) {
    const col = o.col || P.cyan, r = o.r || 20; x.save(); x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = EDGE; rr(x, X + 8, Y + 10, w, h, r); x.fill();                                  // under layer
    x.shadowColor = 'rgba(0,0,0,0.4)'; x.shadowBlur = 22; x.shadowOffsetY = 10; x.fillStyle = PAPER; rr(x, X, Y, w, h, r); x.fill(); x.shadowColor = 'transparent';
    x.save(); rr(x, X, Y, w, h, r); x.clip(); x.fillStyle = col; x.fillRect(X, Y, 10, h); x.fillStyle = 'rgba(255,255,255,0.05)'; x.fillRect(X, Y, w, h * 0.45); x.restore(); x.restore();
  }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0));
    x.fillStyle = 'rgba(0,0,0,0.35)'; x.beginPath(); x.arc(cx + 3, cy + 9, r, 0, TAU); x.fill();
    x.fillStyle = EDGE; x.beginPath(); x.arc(cx, cy + 5, r, 0, TAU); x.fill();
    x.fillStyle = PAPER; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
    x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r * 0.8, 0, TAU); x.fill();
    if (o.ring) { x.strokeStyle = H.rgba(col, 0.55 * (1 - p)); x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r * (1.18 + 0.3 * p), 0, TAU); x.stroke(); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, '#0a2e36', t);
    if (o.label) text(x, o.label, cx, cy + r + (o.ly || 36), o.lpx || 26, P.ink, {});
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.lineCap = 'round'; x.strokeStyle = 'rgba(0,0,0,0.3)'; x.lineWidth = (o.lw || 3) + 3; x.beginPath(); x.moveTo(ax, ay + 4); x.lineTo(bx, by + 4); x.stroke();
    x.strokeStyle = H.rgba(col, 0.85); x.lineWidth = (o.lw || 3) + 1; x.setLineDash([14, 10]); x.lineDashOffset = -t * 18; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); x.setLineDash([]);
    const n = o.dots == null ? 2 : o.dots;
    for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1, px = lerp(ax, bx, u), py = lerp(ay, by, u); x.fillStyle = 'rgba(0,0,0,0.35)'; x.beginPath(); x.arc(px + 1, py + 4, 8, 0, TAU); x.fill(); x.fillStyle = P.ink; x.beginPath(); x.arc(px, py, 8, 0, TAU); x.fill(); x.fillStyle = col; x.beginPath(); x.arc(px, py, 4.5, 0, TAU); x.fill(); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = col; x.beginPath(); x.moveTo(2, 0); x.lineTo(-16, -10); x.lineTo(-16, 10); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: P.pink, orbB: P.amber });
  registerStyle('paper-cut', { label: 'Paper Cut', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
