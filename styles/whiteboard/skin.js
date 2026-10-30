// ===== Whiteboard skin: marker on white, wobbly hand-drawn outlines. Teaching look. Original design. =====
(function () {
  const P = { bg0: '#fbfbf7', bg1: '#f4f6f8', bg2: '#eef1f4', cyan: '#1b78d0', violet: '#7a4fd0', pink: '#d4417a', green: '#25995a', amber: '#e08a06', red: '#d33a3a', ink: '#1d2230', mute: '#6a7183' };
  const FH = '"Caveat", "Segoe Print", "Comic Sans MS", cursive';
  let T0 = 0; const seed = () => Math.floor(T0 * 6);
  const jit = (i, s) => { const v = Math.sin((i + 1) * 12.9898 + s * 78.233) * 43758.5453; return (v - Math.floor(v)) - 0.5; };
  function wobblyPath(x, pts, amp, s) { x.beginPath(); pts.forEach((p, i) => { const X = p[0] + jit(i * 2, s) * amp, Y = p[1] + jit(i * 2 + 1, s) * amp; if (!i) x.moveTo(X, Y); else x.lineTo(X, Y); }); }
  function rrPts(X, Y, w, h, r) { const o = []; const seg = (cx, cy, a0) => { for (let k = 0; k <= 4; k++) { const a = a0 + k * Math.PI / 8; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } }; seg(X + r, Y + r, Math.PI); seg(X + w - r, Y + r, Math.PI * 1.5); seg(X + w - r, Y + h - r, 0); seg(X + r, Y + h - r, Math.PI * 0.5); o.push(o[0]); return o; }
  function circPts(cx, cy, r) { const o = []; for (let k = 0; k <= 28; k++) { const a = k / 28 * TAU + 0.3; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } o.push([cx + Math.cos(0.3 + 0.35) * r * 1.02, cy + Math.sin(0.3 + 0.35) * r * 1.02]); return o; }
  function bg(x, t) {
    T0 = t; const W = x.canvas.width, Hh = x.canvas.height; x.fillStyle = P.bg0; x.fillRect(0, 0, W, Hh);
    x.strokeStyle = 'rgba(60,100,170,0.09)'; x.lineWidth = 1.5; for (let Y = 90; Y < Hh; Y += 64) { x.beginPath(); x.moveTo(0, Y); x.lineTo(W, Y); x.stroke(); }
    x.fillStyle = 'rgba(214,58,58,0.18)'; x.fillRect(Math.min(W * 0.06, 70), 0, 3, Hh);
  }
  function fin(x, t) { const W = x.canvas.width, Hh = x.canvas.height; H.vignette(x, W, Hh, 0.1, '90,90,80'); finish(x, W, Hh, t); }
  function text(x, s, cx, cy, px, col, o = {}) { x.save(); x.font = `${o.mono ? 700 : 700} ${Math.round(px * 1.4)}px ${FH}`; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; x.globalAlpha *= o.a == null ? 1 : o.a; x.fillStyle = col; x.fillText(s, cx, cy); x.restore(); }
  function chip(x, cx, cy, s, px, o = {}) {
    const col = o.col || P.cyan; x.save(); x.font = `700 ${Math.round(px * 1.4)}px ${FH}`; const w = x.measureText(s).width + px * 1.5, h = px * 1.9; x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = o.solid ? H.rgba(col, 0.9) : H.rgba(col, 0.14); rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); x.fill();
    x.strokeStyle = P.ink; x.lineWidth = 2.5; x.lineJoin = 'round'; wobblyPath(x, rrPts(cx - w / 2, cy - h / 2, w, h, h / 2), 2, seed()); x.stroke();
    x.fillStyle = o.solid ? '#ffffff' : P.ink; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 2); x.restore(); return w;
  }
  function card(x, X, Y, w, h, o = {}) {
    const col = o.col || P.cyan, r = o.r || 18; x.save(); x.globalAlpha *= o.a == null ? 1 : o.a;
    x.fillStyle = '#ffffff'; rr(x, X, Y, w, h, r); x.fill(); x.fillStyle = H.rgba(col, 0.18); rr(x, X + 4, Y + 4, w - 8, Math.max(14, h * 0.14), 10); x.fill();
    x.strokeStyle = P.ink; x.lineWidth = 3.5; x.lineJoin = 'round'; x.lineCap = 'round'; wobblyPath(x, rrPts(X, Y, w, h, r), 3, seed()); x.stroke();
    x.strokeStyle = col; x.lineWidth = 4; wobblyPath(x, [[X + 22, Y + h - 12], [X + w * 0.5, Y + h - 10], [X + w - 22, Y + h - 13]], 2, seed() + 3); x.stroke(); x.restore();
  }
  function node(x, cx, cy, r, col, t, o = {}) {
    const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0)); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); x.fillStyle = H.rgba(col, 0.2); x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
    x.strokeStyle = P.ink; x.lineWidth = 3.5; x.lineJoin = 'round'; wobblyPath(x, circPts(cx, cy, r), 2.5, seed()); x.stroke();
    if (o.ring) { x.strokeStyle = H.rgba(col, 0.5 * (1 - p)); x.lineWidth = 2.5; x.beginPath(); x.arc(cx, cy, r * (1.15 + 0.25 * p), 0, TAU); x.stroke(); }
    if (o.icon) o.icon(x, cx, cy, r * 0.5, Array.isArray(col) ? hexOf(col) : col, t);
    if (o.label) text(x, o.label, cx, cy + r + (o.ly || 34), o.lpx || 26, P.ink, {});
  }
  function link(x, ax, ay, bx, by, col, t, o = {}) {
    x.save(); x.strokeStyle = col; x.lineWidth = (o.lw || 3) + 1; x.lineCap = 'round'; wobblyPath(x, [[ax, ay], [(ax + bx) / 2, (ay + by) / 2], [bx, by]], 2.5, seed() + 7); x.stroke();
    const n = o.dots == null ? 2 : o.dots; for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1; x.fillStyle = col; x.beginPath(); x.arc(lerp(ax, bx, u), lerp(ay, by, u), 6, 0, TAU); x.fill(); }
    if (o.head) { const a = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(a); x.beginPath(); x.moveTo(-18, -11); x.lineTo(2, 0); x.lineTo(-18, 11); x.lineWidth = 4; x.stroke(); } x.restore();
  }
  const cp = commonParts(text, P, { orbA: P.violet, orbB: P.cyan, outline: 4 });
  registerStyle('whiteboard', { label: 'Whiteboard', pal: P, bg, finish: fin, text, chip, card, node, link, wordmark: cp.wordmark, orb: cp.orb, icon: STYLES['tech-glow'].icon });
})();
