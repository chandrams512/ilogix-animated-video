// ===== Transit Map skin: pale paper, 45-degree coloured route lines, station dots, line-badge cards. Original design. =====
(function () {
  const P = { bg0: '#f7f5ef', bg1: '#f1eee5', bg2: '#ebe7db', cyan: '#0a6fc2', violet: '#7a45c9', pink: '#d6336c', green: '#0a8f54', amber: '#e08a00', red: '#d93a2f', ink: '#16233a', mute: '#566277', capHi: '#7fb8ff' };
  const FS = '"Sora", "Helvetica Neue", Arial, sans-serif', FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace', LINES = [P.red, P.cyan, P.green, P.amber];
  function route(x, pts, col, w, a) { x.save(); x.globalAlpha = a; x.strokeStyle = col; x.lineWidth = w; x.lineJoin = 'round'; x.lineCap = 'round'; x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.stroke(); x.restore(); }
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height, m = Math.min(W, Hh) / 720; x.fillStyle = P.bg0; x.fillRect(0, 0, W, Hh);
    const d = 60 * m, off = (t * 6 * m) % d; x.strokeStyle = 'rgba(22,35,58,0.05)'; x.lineWidth = 1.5; for (let X = -Hh; X < W + Hh; X += d) { x.beginPath(); x.moveTo(X + off, 0); x.lineTo(X + off + Hh, Hh); x.stroke(); }
    const s = 110 * m; [[0.008, 0.16, 0], [0.992, 0.3, 1], [0.008, 0.8, 2], [0.992, 0.9, 3]].forEach(([a, b, k]) => { const X = W * a, Y = Hh * b, dir = k % 2 ? -1 : 1; route(x, [[X, Y - s], [X, Y], [X + dir * s * 0.22, Y + s * 0.3], [X + dir * s * 0.22, Y + s * 1.1]], LINES[k], 12 * m, 0.4); x.fillStyle = '#fff'; x.lineWidth = 5 * m; x.strokeStyle = P.ink; x.beginPath(); x.arc(X, Y, 11 * m, 0, TAU); x.fill(); x.stroke(); });
  }
  function fin(x, t) { finish(x, x.canvas.width, x.canvas.height, t); }
  function text(x, s, cx, cy, px, col, o = {}) { x.save(); x.font = `${o.mono ? 600 : 800} ${o.mono ? px : Math.round(px * 0.97)}px ${o.mono ? FM : FS}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = col; x.fillText(s, cx, cy); x.restore(); }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `700 ${px}px ${FS}`; const w = x.measureText(s).width + px * 1.6, h = px * 1.8; x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = o.solid ? col : '#ffffff'; rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); x.fill(); x.lineWidth = 3; x.strokeStyle = o.solid ? col : P.ink; x.stroke();
    x.fillStyle = o.solid ? '#ffffff' : P.ink; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) {
    const col = o.col || P.cyan; x.save(); x.globalAlpha *= o.a == null ? 1 : o.a; x.shadowColor = 'rgba(22,35,58,0.18)'; x.shadowBlur = 22; x.shadowOffsetY = 8; x.fillStyle = '#ffffff'; rr(x, X, Y, w, h, 18); x.fill(); x.shadowBlur = 0; x.shadowOffsetY = 0;
    x.save(); rr(x, X, Y, w, h, 18); x.clip(); x.fillStyle = col; x.fillRect(X, Y, 16, h); x.restore(); x.lineWidth = 2.5; x.strokeStyle = P.ink; rr(x, X, Y, w, h, 18); x.stroke(); x.restore();
  }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); x.lineWidth = 8; x.strokeStyle = col; x.stroke(); x.lineWidth = 3; x.strokeStyle = P.ink; x.beginPath(); x.arc(cx, cy, r + 5, 0, TAU); x.stroke();
    if (o.ring) { x.strokeStyle = H.rgba(col, 0.4 * (1 - p)); x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r * (1.3 + 0.25 * p), 0, TAU); x.stroke(); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, col, t);
    if (o.label) { const ly = cy + r + (o.ly || 34), lp = o.lpx || 25; x.save(); x.font = `800 ${Math.round(lp * 0.97)}px ${FS}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 10; x.strokeStyle = P.bg0; x.strokeText(o.label, cx, ly); x.restore(); text(x, o.label, cx, ly, lp, P.ink, {}); }
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.lineCap = 'round'; x.strokeStyle = P.ink; x.lineWidth = (o.lw || 3) + 9; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); x.strokeStyle = col; x.lineWidth = (o.lw || 3) + 5; x.stroke();
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.4 + i / Math.max(n, 1) + (o.ph || 0)) % 1, px = lerp(ax, bx, u), py = lerp(ay, by, u); x.fillStyle = '#fff'; x.strokeStyle = P.ink; x.lineWidth = 3; x.beginPath(); x.arc(px, py, 9, 0, TAU); x.fill(); x.stroke(); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = P.ink; x.beginPath(); x.moveTo(4, 0); x.lineTo(-18, -12); x.lineTo(-18, 12); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: P.red, orbB: P.cyan, outline: 5, outlineCol: P.ink });
  registerStyle('transit', { label: 'Transit Map', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
