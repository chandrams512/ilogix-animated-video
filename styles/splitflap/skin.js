// ===== Split-flap skin: departures-board letters on dark charcoal; text flips through random letters as it appears. Original design. =====
(function () {
  const P = { bg0: '#14151a', bg1: '#1b1c22', bg2: '#0e0f13', cyan: '#ffb000', violet: '#9aa4b2', pink: '#ff6b57', green: '#5ad17a', amber: '#ffd24d', red: '#ff5a4d', ink: '#f4f1e8', mute: '#9a978c' };
  const FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace', FS = '"Sora", system-ui, sans-serif', GL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height, m = Math.min(W, Hh) / 720; x.fillStyle = P.bg0; x.fillRect(0, 0, W, Hh); x.fillStyle = 'rgba(255,255,255,0.025)'; for (let X = 0; X < W; X += 44 * m) x.fillRect(X, 0, 2, Hh);
    x.fillStyle = P.cyan; x.fillRect(0, 0, W, 6 * m); x.fillStyle = '#2a2b33'; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(W * (0.04 + i * 0.0), Hh * (0.2 + i * 0.2), 5 * m, 0, TAU); x.arc(W * 0.96, Hh * (0.2 + i * 0.2), 5 * m, 0, TAU); x.fill(); }
  }
  function fin(x, t) { const W = x.canvas.width, Hh = x.canvas.height; H.vignette(x, W, Hh, 0.35, '4,4,6'); finish(x, W, Hh, t); }
  function text(x, s, cx, cy, px, col, o = {}) {
    x.save(); const a0 = x.globalAlpha * (o.a == null ? 1 : o.a);
    if (px < 46 || o.mono || (o.align && o.align !== 'center')) { x.globalAlpha = a0; x.font = o.mono ? `600 ${px}px ${FM}` : `700 ${Math.round(px * 0.95)}px ${FS}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.fillStyle = col === P.ink ? '#f4f1e8' : col; x.fillText(s, cx, cy); x.restore(); return; }
    const str = s.toUpperCase(), n = str.length, design = x.canvas.width / x.getTransform().a, fs = Math.round(px * 0.9); let tw = fs * 0.74, gap = Math.max(3, fs * 0.07); const total = n * (tw + gap) - gap, al = o.align || 'center', lim = (al === 'left' ? design - cx - 40 : al === 'right' ? cx - 40 : Math.min(cx, design - cx) * 2 - 40); if (total > lim) { const k = lim / total; tw *= k; gap *= k; }
    const h = fs * 1.34, th = tw, startX = (o.align === 'left' ? cx : o.align === 'right' ? cx - n * (th + gap) + gap : cx - (n * (th + gap) - gap) / 2), ff = Math.min(fs, tw * 1.25);
    x.font = `600 ${ff}px ${FM}`; x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const ch = str[i], X = startX + i * (th + gap), Y = cy - h / 2; if (ch === ' ') continue; const th0 = (i + 1) / (n + 1) * 0.92, flipping = a0 < th0 && a0 < 0.98; let g = ch; if (flipping) g = GL[Math.floor(((a0 * 53 + i * 7.3) % 1) * GL.length)]; x.globalAlpha = Math.min(1, a0 * 2.5);
      x.fillStyle = '#0c0c10'; rr(x, X, Y + 3, th, h, 6); x.fill(); x.fillStyle = '#23242c'; rr(x, X, Y, th, h, 6); x.fill(); x.fillStyle = 'rgba(255,255,255,0.04)'; x.fillRect(X, Y, th, h / 2);
      x.fillStyle = col === P.ink ? '#f4f1e8' : col; x.fillText(g, X + th / 2, cy + ff * 0.03); x.fillStyle = '#0a0a0d'; x.fillRect(X, cy - 1.4, th, 2.8);
    }
    x.restore();
  }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `600 ${px}px ${FM}`; const w = x.measureText(s).width + px * 1.6, h = px * 1.8; x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = o.solid ? col : '#23242c'; rr(x, cx - w / 2, cy - h / 2, w, h, 6); x.fill(); x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(cx - w / 2, cy - 1, w, 2); x.fillStyle = o.solid ? '#14151a' : col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) {
    x.save(); x.globalAlpha *= o.a == null ? 1 : o.a; x.shadowColor = 'rgba(0,0,0,0.6)'; x.shadowBlur = 24; x.shadowOffsetY = 10; x.fillStyle = '#23242c'; rr(x, X, Y, w, h, 12); x.fill(); x.shadowColor = 'transparent'; x.strokeStyle = '#34353f'; x.lineWidth = 2; x.stroke();
    x.fillStyle = o.col || P.cyan; x.fillRect(X + 12, Y, Math.min(70, w * 0.3), 6); x.fillStyle = '#34353f'; [[X + 10, Y + 12], [X + w - 10, Y + 12], [X + 10, Y + h - 12], [X + w - 10, Y + h - 12]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 3, 0, TAU); x.fill(); }); x.restore();
  }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); x.fillStyle = '#0c0c10'; x.beginPath(); x.arc(cx, cy + 4, r, 0, TAU); x.fill(); x.fillStyle = '#23242c'; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); x.strokeStyle = col; x.lineWidth = 4; x.stroke(); x.fillStyle = '#0a0a0d'; x.fillRect(cx - r, cy - 1.4, r * 2, 2.8);
    if (o.ring) { x.strokeStyle = H.rgba(col, 0.45 * (1 - p)); x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r * (1.2 + 0.3 * p), 0, TAU); x.stroke(); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, col, t); if (o.label) text(x, o.label, cx, cy + r + (o.ly || 34), o.lpx || 24, P.ink, {});
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.strokeStyle = '#34353f'; x.lineWidth = (o.lw || 3) + 3; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); x.strokeStyle = col; x.lineWidth = (o.lw || 3) - 0.5; x.setLineDash([14, 10]); x.lineDashOffset = -t * 24; x.stroke(); x.setLineDash([]);
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1; x.fillStyle = col; rr(x, lerp(ax, bx, u) - 8, lerp(ay, by, u) - 10, 16, 20, 3); x.fill(); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = col; x.beginPath(); x.moveTo(2, 0); x.lineTo(-16, -10); x.lineTo(-16, 10); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: P.cyan, orbB: P.amber });
  registerStyle('splitflap', { label: 'Split-flap', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
