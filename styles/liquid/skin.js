// ===== Liquid Glass skin: glass lenses that bend whatever sits behind them (refraction faked in 2D canvas), over colourful drifting shapes. Original design. =====
(function () {
  const P = { bg0: '#0a0d2c', bg1: '#161046', bg2: '#08183a', cyan: '#6fe0ff', violet: '#b69cff', pink: '#ff8fd0', green: '#7dffc9', amber: '#ffd98a', red: '#ffc4c4', ink: '#ffffff', mute: '#c3caee' };
  const FS = '"Sora", "Segoe UI", system-ui, sans-serif', FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace'; let tmp = null;
  function bg(x, t) {
    const W = x.canvas.width, Hh = x.canvas.height, m = Math.min(W, Hh) / 720, g = x.createLinearGradient(0, 0, W, Hh); g.addColorStop(0, P.bg0); g.addColorStop(0.55, P.bg1); g.addColorStop(1, P.bg2); x.fillStyle = g; x.fillRect(0, 0, W, Hh);
    [[0.18, 0.25, 210, '#ff5fb8'], [0.82, 0.2, 170, '#41b6ff'], [0.7, 0.8, 230, '#8f63ff'], [0.12, 0.85, 150, '#35f0c0'], [0.5, 0.5, 120, '#ffb347']].forEach(([a, b, r, c], i) => {
      const cx = W * a + Math.sin(t * 0.45 + i * 1.7) * 60 * m, cy = Hh * b + Math.cos(t * 0.4 + i * 2.1) * 50 * m; glow(x, cx, cy, r * 2.2 * m, c, 0.4); const gg = x.createRadialGradient(cx - r * 0.3 * m, cy - r * 0.3 * m, 4, cx, cy, r * m); gg.addColorStop(0, H.rgba(c, 0.95)); gg.addColorStop(1, H.rgba(c, 0.35)); x.fillStyle = gg; x.beginPath(); x.arc(cx, cy, r * m, 0, TAU); x.fill();
    });
    x.strokeStyle = 'rgba(255,255,255,0.10)'; x.lineWidth = 2; for (let i = -3; i < 14; i++) { x.beginPath(); x.moveTo(i * 120 * m + ((t * 8 * m) % (120 * m)), 0); x.lineTo(i * 120 * m + 300 * m + ((t * 8 * m) % (120 * m)), Hh); x.stroke(); }
  }
  function fin(x, t) { const W = x.canvas.width, Hh = x.canvas.height; H.vignette(x, W, Hh, 0.25, '6,6,30'); finish(x, W, Hh, t); }
  function text(x, s, cx, cy, px, col, o = {}) { x.save(); x.font = `${o.mono ? 600 : 700} ${o.mono ? px : Math.round(px * 0.95)}px ${o.mono ? FM : FS}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.globalAlpha *= o.a == null ? 1 : o.a; if (!o.mono) { x.shadowColor = 'rgba(10,6,50,0.55)'; x.shadowBlur = px * 0.25; x.shadowOffsetY = 2; } x.fillStyle = col; x.fillText(s, cx, cy); x.restore(); }
  // The lens: copy what is already drawn under the shape, redraw it magnified toward the rim (3 rings), then add tint, rim light and colour fringes.
  function lens(x, X, Y, w, h, r, o) {
    o = o || {}; const m = x.getTransform(), cv = x.canvas, dx = m.a * X + m.e, dy = m.d * Y + m.f, dw = m.a * w, dh = m.d * h, a0 = x.globalAlpha;
    if (a0 > 0.02 && dw > 8 && dh > 8) {
      if (!tmp) tmp = document.createElement('canvas'); tmp.width = Math.ceil(dw); tmp.height = Math.ceil(dh); const q = tmp.getContext('2d'); q.drawImage(cv, dx, dy, dw, dh, 0, 0, dw, dh);
      const rim = Math.min(w, h) * 0.2 * m.a, cxp = dx + dw / 2, cyp = dy + dh / 2, mag = o.mag || 1.2; x.save(); x.shadowColor = 'rgba(6,4,40,0.5)'; x.shadowBlur = 34; x.shadowOffsetY = 14; x.fillStyle = 'rgba(20,16,70,0.5)'; rr(x, X, Y, w, h, r); x.fill(); x.restore();
      for (let i = 0; i < 3; i++) {
        const inset = rim * i / 3, k = mag - (mag - 1) * (i / 3) * 1.0; x.save(); rr(x, X + inset / m.a, Y + inset / m.d, w - 2 * inset / m.a, h - 2 * inset / m.d, Math.max(2, r - inset / m.a)); x.clip(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = a0; if (i === 0) x.filter = 'blur(1.6px) saturate(1.35) brightness(1.1)'; else x.filter = 'saturate(1.2) brightness(1.06)';
        const sw = dw / k, sh = dh / k; x.drawImage(tmp, (dw - sw) / 2, (dh - sh) / 2, sw, sh, dx, dy, dw, dh); x.restore();
      }
      x.filter = 'none';
    }
    x.save(); x.fillStyle = 'rgba(255,255,255,0.09)'; rr(x, X, Y, w, h, r); x.fill();
    const sh = x.createLinearGradient(X, Y, X, Y + h * 0.55); sh.addColorStop(0, 'rgba(255,255,255,0.28)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); x.save(); rr(x, X, Y, w, h, r); x.clip(); x.fillStyle = sh; x.fillRect(X, Y, w, h * 0.55); x.restore();
    x.lineWidth = 2.2; x.strokeStyle = 'rgba(255,70,130,0.5)'; rr(x, X - 1.4, Y, w, h, r); x.stroke(); x.strokeStyle = 'rgba(70,190,255,0.5)'; rr(x, X + 1.4, Y, w, h, r); x.stroke();
    const eg = x.createLinearGradient(X, Y, X + w, Y + h); eg.addColorStop(0, 'rgba(255,255,255,0.95)'); eg.addColorStop(0.35, 'rgba(255,255,255,0.25)'); eg.addColorStop(0.7, 'rgba(255,255,255,0.18)'); eg.addColorStop(1, H.rgba(o.col || '#ffffff', 0.7)); x.lineWidth = 2; x.strokeStyle = eg; rr(x, X, Y, w, h, r); x.stroke(); x.restore();
  }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `700 ${px}px ${FS}`; const w = x.measureText(s).width + px * 1.6, h = px * 1.9; x.globalAlpha *= o.a == null ? 1 : o.a;
    if (o.solid) { x.shadowColor = H.rgba(col, 0.6); x.shadowBlur = 18; x.fillStyle = H.rgba(col, 0.92); rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); x.fill(); x.shadowBlur = 0; }
    else { x.fillStyle = 'rgba(255,255,255,0.14)'; rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); x.fill(); x.lineWidth = 1.8; x.strokeStyle = 'rgba(255,255,255,0.55)'; x.stroke(); }
    x.fillStyle = o.solid ? '#14103a' : '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) { x.save(); x.globalAlpha *= o.a == null ? 1 : o.a; lens(x, X, Y, w, h, o.r || 30, { col: o.col, mag: 1.16 }); x.restore(); }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); glow(x, cx, cy, r * 2, col, 0.18 + 0.06 * p); lens(x, cx - r, cy - r, r * 2, r * 2, r, { col, mag: 1.35 });
    if (o.ring) { x.strokeStyle = H.rgba(col, 0.45 * (1 - p)); x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, r * (1.18 + 0.25 * p), 0, TAU); x.stroke(); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, '#ffffff', t); if (o.label) text(x, o.label, cx, cy + r + (o.ly || 34), o.lpx || 25, P.ink, {});
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.lineCap = 'round'; x.strokeStyle = H.rgba(col, 0.55); x.lineWidth = (o.lw || 3) + 1; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 1.2; x.stroke();
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1, px = lerp(ax, bx, u), py = lerp(ay, by, u); glow(x, px, py, 16, col, 0.7); x.fillStyle = '#fff'; x.beginPath(); x.arc(px, py, 3.6, 0, TAU); x.fill(); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.fillStyle = col; x.beginPath(); x.moveTo(2, 0); x.lineTo(-15, -9); x.lineTo(-15, 9); x.closePath(); x.fill(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: '#8f63ff', orbB: '#6fe0ff' });
  registerStyle('liquid', { label: 'Liquid Glass', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
