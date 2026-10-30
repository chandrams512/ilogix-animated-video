// ===== Tech Glow: palette, helpers and the nine key frames (uses H, glow, rr, seg, back, finish from the kit) =====
const W_ = 1280, H_ = 720;
const T = { bg0: '#050816', bg1: '#0a1030', bg2: '#140f3d', cyan: '#38e8ff', violet: '#8b6bff', pink: '#ff5fa8', green: '#3dffa0', amber: '#ffc94a', red: '#ff4d6d', ink: '#eaf1ff', mute: '#8fa3d8' };
const FS = '"Sora", "Segoe UI", system-ui, sans-serif', FM = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
const tf = (w, px) => `${w} ${px}px ${FS}`, mf = (w, px) => `${w} ${px}px ${FM}`;

const hexOf = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
function tbg(x, t) {
  const CW = x.canvas.width, CH = x.canvas.height;
  const g = x.createLinearGradient(0, 0, CW * 0.4, CH);
  g.addColorStop(0, T.bg0); g.addColorStop(0.6, T.bg1); g.addColorStop(1, T.bg2);
  x.fillStyle = g; x.fillRect(0, 0, CW, CH);
  glow(x, CW * 0.86, CH * 0.08, 640, '#6a3df0', 0.28); glow(x, CW * 0.06, CH * 0.98, 580, '#1aa7e8', 0.24);
  x.save(); x.strokeStyle = 'rgba(120,160,255,0.07)'; x.lineWidth = 1;
  for (let X = 0; X < CW; X += 64) { x.beginPath(); x.moveTo(X, 0); x.lineTo(X, CH); x.stroke(); }
  for (let Y = 0; Y < CH; Y += 64) { x.beginPath(); x.moveTo(0, Y); x.lineTo(CW, Y); x.stroke(); }
  x.restore();
  const r = H.rng(31);
  for (let i = 0; i < 70; i++) {
    const px = (r() * CW + t * 6 * (0.3 + r())) % CW, py = (r() * CH + CH * 2 - t * 4 * (0.3 + r())) % CH, s = r.range(0.8, 2.2), ph = r.range(0, TAU);
    x.globalAlpha = 0.25 + 0.35 * Math.sin(t * 1.6 + ph) ** 2; x.fillStyle = r.pick(['#8fe9ff', '#b9a8ff', '#ffffff']); x.beginPath(); x.arc(px, py, s, 0, TAU); x.fill();
  }
  x.globalAlpha = 1;
}
function tfinish(x, t) { const CW = x.canvas.width, CH = x.canvas.height; H.vignette(x, CW, CH, 0.5, '2,4,16'); finish(x, CW, CH, t); }
function ttext(x, s, cx, cy, px, col, o = {}) {
  x.save(); x.font = o.mono ? mf(o.w || 600, px) : tf(o.w || 700, px); x.textAlign = o.align || 'center'; x.textBaseline = 'middle';
  x.globalAlpha *= o.a == null ? 1 : o.a;
  if (o.glow) { x.shadowColor = H.rgba(o.glow, 0.75); x.shadowBlur = px * 0.55; }
  x.fillStyle = col; x.fillText(s, cx, cy); x.restore();
}
function tchip(x, cx, cy, s, px, o = {}) {
  const col = o.col || T.cyan; x.save(); x.font = mf(600, px);
  const w = x.measureText(s).width + px * 1.6, h = px * 2; x.globalAlpha *= o.a == null ? 1 : o.a;
  if (o.solid) { x.shadowColor = H.rgba(col, 0.7); x.shadowBlur = 22; }
  x.fillStyle = H.rgba(col, o.solid ? 0.95 : 0.14); rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); x.fill(); x.shadowBlur = 0;
  x.lineWidth = 1.5; x.strokeStyle = H.rgba(col, 0.9); rr(x, cx - w / 2, cy - h / 2, w, h, h / 2); x.stroke();
  x.fillStyle = o.solid ? '#06102a' : col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy + 1); x.restore(); return w;
}
function tcard(x, X, Y, w, h, o = {}) {
  const col = o.col || T.cyan, r = o.r || 22; x.save(); x.globalAlpha *= o.a == null ? 1 : o.a;
  x.shadowColor = H.rgba(col, 0.5); x.shadowBlur = 28; x.fillStyle = 'rgba(13,21,56,0.92)'; rr(x, X, Y, w, h, r); x.fill(); x.shadowBlur = 0;
  const g = x.createLinearGradient(X, Y, X + w, Y + h); g.addColorStop(0, H.rgba(col, 0.95)); g.addColorStop(1, H.rgba(o.col2 || T.violet, 0.85));
  x.lineWidth = 2.5; x.strokeStyle = g; rr(x, X, Y, w, h, r); x.stroke();
  x.fillStyle = 'rgba(255,255,255,0.05)'; rr(x, X + 4, Y + 4, w - 8, h * 0.28, Math.max(2, r - 4)); x.fill(); x.restore();
}
function tnode(x, cx, cy, r, col, t, o = {}) {
  const p = 0.5 + 0.5 * Math.sin(t * 3 + (o.ph || 0));
  glow(x, cx, cy, r * (2.4 + 0.3 * p), col, 0.3 + 0.12 * p);
  const g = x.createRadialGradient(cx, cy - r * 0.3, r * 0.1, cx, cy, r); g.addColorStop(0, H.rgba(col, 0.38)); g.addColorStop(1, 'rgba(10,16,48,0.96)');
  x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
  x.save(); x.lineWidth = 3; x.strokeStyle = H.rgba(col, 0.95); x.shadowColor = H.rgba(col, 0.8); x.shadowBlur = 18; x.stroke(); x.restore();
  if (o.ring) { x.save(); x.lineWidth = 1.5; x.strokeStyle = H.rgba(col, 0.4 * (1 - p)); x.beginPath(); x.arc(cx, cy, r * (1.15 + 0.25 * p), 0, TAU); x.stroke(); x.restore(); }
  if (o.icon) o.icon(x, cx, cy, r * 0.5, Array.isArray(col) ? hexOf(col) : col, t);
  if (o.label) ttext(x, o.label, cx, cy + r + (o.ly || 32), o.lpx || 26, T.ink, { w: 700 });
}
function tlink(x, ax, ay, bx, by, col, t, o = {}) {
  x.save(); x.lineCap = 'round'; x.strokeStyle = H.rgba(col, 0.38); x.lineWidth = o.lw || 3; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke();
  const n = o.dots == null ? 2 : o.dots;
  for (let i = 0; i < n; i++) { const u = (t * 0.45 + i / Math.max(n, 1) + (o.ph || 0)) % 1, px = lerp(ax, bx, u), py = lerp(ay, by, u); glow(x, px, py, 18, col, 0.8); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(px, py, 3.5, 0, TAU); x.fill(); }
  if (o.head) { const ang = Math.atan2(by - ay, bx - ax); x.translate(bx, by); x.rotate(ang); x.fillStyle = H.rgba(col, 0.95); x.beginPath(); x.moveTo(2, 0); x.lineTo(-15, -9); x.lineTo(-15, 9); x.closePath(); x.fill(); }
  x.restore();
}
function wordmark(x, big) {
  if (big) { ttext(x, 'iLogix Digital', 640, 120, 66, T.ink, { w: 800, glow: T.cyan }); return; }
  glow(x, 56, 46, 22, T.cyan, 0.8); x.fillStyle = T.cyan; x.beginPath(); x.arc(56, 46, 7, 0, TAU); x.fill();
  ttext(x, 'iLogix Digital', 76, 46, 22, T.ink, { w: 700, align: 'left' });
}
// icons: (x, cx, cy, s, col)
const ln = (x, col, s) => { x.strokeStyle = col; x.lineWidth = Math.max(2, s * 0.11); x.lineCap = 'round'; x.lineJoin = 'round'; };
function iPhone(x, cx, cy, s, col) { x.save(); ln(x, col, s); rr(x, cx - s * 0.5, cy - s * 0.9, s, s * 1.8, s * 0.18); x.stroke(); x.beginPath(); x.moveTo(cx - s * 0.14, cy + s * 0.7); x.lineTo(cx + s * 0.14, cy + s * 0.7); x.stroke(); x.restore(); }
function iMail(x, cx, cy, s, col) { x.save(); ln(x, col, s); rr(x, cx - s * 0.9, cy - s * 0.62, s * 1.8, s * 1.24, s * 0.14); x.stroke(); x.beginPath(); x.moveTo(cx - s * 0.85, cy - s * 0.5); x.lineTo(cx, cy + s * 0.1); x.lineTo(cx + s * 0.85, cy - s * 0.5); x.stroke(); x.restore(); }
function iChat(x, cx, cy, s, col) { x.save(); ln(x, col, s); x.fillStyle = col; rr(x, cx - s * 0.9, cy - s * 0.7, s * 1.8, s * 1.2, s * 0.35); x.stroke(); x.beginPath(); x.moveTo(cx - s * 0.4, cy + s * 0.5); x.lineTo(cx - s * 0.65, cy + s * 0.95); x.lineTo(cx - s * 0.05, cy + s * 0.5); x.stroke(); for (let i = -1; i <= 1; i++) { x.beginPath(); x.arc(cx + i * s * 0.45, cy - s * 0.1, s * 0.09, 0, TAU); x.fill(); } x.restore(); }
function iCal(x, cx, cy, s, col) { x.save(); ln(x, col, s); x.fillStyle = col; rr(x, cx - s * 0.85, cy - s * 0.7, s * 1.7, s * 1.5, s * 0.16); x.stroke(); x.beginPath(); x.moveTo(cx - s * 0.85, cy - s * 0.25); x.lineTo(cx + s * 0.85, cy - s * 0.25); x.moveTo(cx - s * 0.4, cy - s * 0.95); x.lineTo(cx - s * 0.4, cy - s * 0.5); x.moveTo(cx + s * 0.4, cy - s * 0.95); x.lineTo(cx + s * 0.4, cy - s * 0.5); x.stroke(); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { x.beginPath(); x.arc(cx - s * 0.45 + i * s * 0.45, cy + s * 0.12 + j * s * 0.4, s * 0.07, 0, TAU); x.fill(); } x.restore(); }
function iPerson(x, cx, cy, s, col) { x.save(); ln(x, col, s); x.beginPath(); x.arc(cx, cy - s * 0.35, s * 0.38, 0, TAU); x.stroke(); x.beginPath(); x.arc(cx, cy + s * 1.0, s * 0.85, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); x.restore(); }
function iDoc(x, cx, cy, s, col) { x.save(); ln(x, col, s); x.beginPath(); x.moveTo(cx - s * 0.65, cy - s * 0.9); x.lineTo(cx + s * 0.25, cy - s * 0.9); x.lineTo(cx + s * 0.65, cy - s * 0.5); x.lineTo(cx + s * 0.65, cy + s * 0.9); x.lineTo(cx - s * 0.65, cy + s * 0.9); x.closePath(); x.stroke(); x.beginPath(); x.moveTo(cx - s * 0.35, cy - s * 0.1); x.lineTo(cx + s * 0.35, cy - s * 0.1); x.moveTo(cx - s * 0.35, cy + s * 0.25); x.lineTo(cx + s * 0.35, cy + s * 0.25); x.moveTo(cx - s * 0.35, cy + s * 0.6); x.lineTo(cx + s * 0.1, cy + s * 0.6); x.stroke(); x.restore(); }
function iCheck(x, cx, cy, s, col) { x.save(); ln(x, col, s * 1.1); x.beginPath(); x.moveTo(cx - s * 0.6, cy + s * 0.05); x.lineTo(cx - s * 0.15, cy + s * 0.5); x.lineTo(cx + s * 0.65, cy - s * 0.45); x.stroke(); x.restore(); }
function iBolt(x, cx, cy, s, col) { x.save(); ln(x, col, s); x.fillStyle = H.rgba(col, 0.25); x.beginPath(); x.moveTo(cx + s * 0.2, cy - s); x.lineTo(cx - s * 0.55, cy + s * 0.1); x.lineTo(cx - s * 0.05, cy + s * 0.1); x.lineTo(cx - s * 0.2, cy + s); x.lineTo(cx + s * 0.55, cy - s * 0.2); x.lineTo(cx + s * 0.05, cy - s * 0.2); x.closePath(); x.fill(); x.stroke(); x.restore(); }
function iPlan(x, cx, cy, s, col) { x.save(); ln(x, col, s); x.fillStyle = col; for (let i = -1; i <= 1; i++) { x.beginPath(); x.arc(cx - s * 0.65, cy + i * s * 0.6, s * 0.1, 0, TAU); x.fill(); x.beginPath(); x.moveTo(cx - s * 0.3, cy + i * s * 0.6); x.lineTo(cx + s * 0.7, cy + i * s * 0.6); x.stroke(); } x.restore(); }
function iShield(x, cx, cy, s, col) { x.save(); ln(x, col, s); x.beginPath(); x.moveTo(cx, cy - s); x.lineTo(cx + s * 0.85, cy - s * 0.6); x.lineTo(cx + s * 0.85, cy + s * 0.1); x.quadraticCurveTo(cx + s * 0.8, cy + s * 0.75, cx, cy + s); x.quadraticCurveTo(cx - s * 0.8, cy + s * 0.75, cx - s * 0.85, cy + s * 0.1); x.lineTo(cx - s * 0.85, cy - s * 0.6); x.closePath(); x.stroke(); x.beginPath(); x.moveTo(cx - s * 0.38, cy); x.lineTo(cx - s * 0.08, cy + s * 0.3); x.lineTo(cx + s * 0.42, cy - s * 0.28); x.stroke(); x.restore(); }
function mayaOrb(x, cx, cy, r, t, label) {
  glow(x, cx, cy, r * 2.8, T.violet, 0.35);
  for (let i = 0; i < 3; i++) { const u = (t * 0.6 + i / 3) % 1; x.strokeStyle = H.rgba(T.cyan, 0.5 * (1 - u)); x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r * (1 + 0.7 * u), 0, TAU); x.stroke(); }
  const g = x.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r); g.addColorStop(0, '#9ff6ff'); g.addColorStop(0.5, '#4a7cff'); g.addColorStop(1, '#5a2fd0');
  x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
  x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, r - 3, Math.PI * 1.05, Math.PI * 1.55); x.stroke();
  const n = 11;
  for (let i = 0; i < n; i++) { const k = 1 - Math.abs(i - (n - 1) / 2) / (n / 2) * 0.6, hg = r * (0.16 + 0.5 * Math.abs(Math.sin(t * 4 + i * 0.8)) * k); x.fillStyle = 'rgba(255,255,255,0.93)'; rr(x, cx - r * 0.62 + i * (r * 1.24 / (n - 1)) - r * 0.045, cy - hg / 2, r * 0.09, hg, r * 0.045); x.fill(); }
  if (label) ttext(x, label, cx, cy + r + 34, 26, T.ink, { w: 700 });
}
const hd = (x, s, y, px, col, o) => ttext(x, s, 640, y, px, col || T.ink, Object.assign({ w: 800 }, o));

const PANELS = [
  // 1 HOOK
  (x, t) => {
    tbg(x, t); wordmark(x);
    hd(x, 'Every missed call', 92, 56); hd(x, 'is a missed customer.', 158, 56, T.cyan, { glow: T.cyan });
    for (let i = 0; i < 3; i++) { x.save(); x.strokeStyle = H.rgba(T.red, 0.55 - 0.15 * i); x.lineWidth = 4; x.lineCap = 'round'; const R = 220 + i * 26; x.beginPath(); x.arc(420, 450, R, -2.45, -2.0); x.stroke(); x.beginPath(); x.arc(420, 450, R, -1.14, -0.69); x.stroke(); x.restore(); }
    tcard(x, 315, 280, 210, 370, { col: T.red, col2: T.pink });
    tnode(x, 420, 400, 52, T.red, t, { icon: iPhone, ring: true });
    tchip(x, 420, 492, 'Missed call', 20, { col: T.red });
    ttext(x, 'Unknown caller', 420, 545, 18, T.mute, { mono: true, w: 500 });
    ttext(x, '02:14', 840, 400, 140, T.ink, { mono: true, w: 600, glow: T.cyan });
    ttext(x, 'AM', 1090, 440, 40, T.amber, { mono: true, w: 600, align: 'left' });
    tchip(x, 840, 500, 'after hours', 22, { col: T.amber });
    ttext(x, 'Nobody picks up.', 840, 580, 36, T.mute, { w: 600 });
  },
  // 2 MEET MAYA
  (x, t) => {
    tbg(x, t); wordmark(x);
    hd(x, 'Meet Maya', 110, 72, T.ink, { glow: T.violet });
    tchip(x, 640, 178, 'answers every call, 24/7', 22, { col: T.green });
    tnode(x, 190, 440, 60, T.cyan, t, { icon: iPhone, label: 'Incoming call', lpx: 22 });
    tlink(x, 255, 440, 495, 440, T.cyan, t, { head: true });
    mayaOrb(x, 640, 440, 125, t, null);
    tchip(x, 640, 625, 'Maya · AI receptionist', 22, { col: T.violet });
    tcard(x, 810, 300, 400, 150, { col: T.violet, col2: T.cyan });
    ttext(x, 'MAYA', 842, 332, 16, T.violet, { mono: true, align: 'left' });
    ttext(x, 'Hi, you’ve reached iLogix.', 842, 378, 26, T.ink, { align: 'left', w: 600 });
    ttext(x, 'How can I help?', 842, 418, 26, T.ink, { align: 'left', w: 600 });
  },
  // 3 WHAT MAYA CAPTURES
  (x, t) => {
    tbg(x, t); wordmark(x);
    hd(x, 'Maya collects the details', 100, 52);
    tnode(x, 130, 400, 62, T.cyan, t, { icon: iPhone, label: 'Caller' });
    tlink(x, 195, 400, 308, 400, T.cyan, t, { head: true });
    mayaOrb(x, 390, 400, 76, t, 'Maya');
    const F3 = ['Name', 'Phone number', 'Reason for calling'];
    F3.forEach((s, i) => {
      const y = 250 + i * 110; tlink(x, 470, 400, 590, y + 46, T.violet, t, { ph: i * 0.2, dots: 1 });
      tcard(x, 590, y, 310, 92, { col: T.green, col2: T.cyan, r: 18 });
      x.save(); x.fillStyle = H.rgba(T.green, 0.2); x.beginPath(); x.arc(632, y + 46, 22, 0, TAU); x.fill(); x.restore(); iCheck(x, 632, y + 46, 14, T.green);
      ttext(x, s, 670, y + 46, 24, T.ink, { align: 'left', w: 600 });
      tlink(x, 900, y + 46, 1052, 400, T.green, t, { ph: i * 0.3, dots: 1 });
    });
    tnode(x, 1130, 400, 78, T.green, t, { icon: iPerson, label: 'Your team', ring: true });
    tchip(x, 640, 640, 'then hands off to your team', 24, { col: T.green });
  },
  // 4 BEYOND CALLS
  (x, t) => {
    tbg(x, t); wordmark(x);
    ttext(x, 'Agentic AI', 70, 230, 76, T.ink, { align: 'left', w: 800 });
    ttext(x, 'doesn’t just answer.', 70, 322, 52, T.mute, { align: 'left', w: 600 });
    ttext(x, 'It acts.', 70, 448, 104, T.cyan, { align: 'left', w: 800, glow: T.cyan });
    const A = [930, 380], S = [[1080, 204, iMail, T.violet], [1165, 380, iCal, T.amber], [1080, 556, iCheck, T.green]];
    S.forEach(([sx, sy, ic, col], i) => { const a = Math.atan2(sy - A[1], sx - A[0]); tlink(x, A[0] + Math.cos(a) * 112, A[1] + Math.sin(a) * 112, sx - Math.cos(a) * 52, sy - Math.sin(a) * 52, col, t, { head: true, ph: i * 0.25, dots: 1 }); tnode(x, sx, sy, 44, col, t, { icon: ic, ph: i }); });
    tnode(x, A[0], A[1], 100, T.cyan, t, { icon: iBolt, ring: true });
  },
  // 5 PLAN ACT VERIFY
  (x, t) => {
    tbg(x, t); wordmark(x);
    ttext(x, 'Plan.', 395, 82, 58, T.cyan, { w: 800 }); ttext(x, 'Act.', 640, 82, 58, T.violet, { w: 800 }); ttext(x, 'Verify.', 885, 82, 58, T.green, { w: 800 });
    const N = [[240, T.cyan, iPlan, 'Plan', 'break the goal into steps'], [640, T.violet, iBolt, 'Act', 'use your tools'], [1040, T.green, iCheck, 'Verify', 'check before it counts']];
    N.forEach(([nx, col, ic, lab, sub], i) => { tnode(x, nx, 340, 84, col, t, { icon: ic, label: lab, ly: 36, lpx: 30, ring: true, ph: i }); ttext(x, sub, nx, 488, 18, T.mute, { mono: true, w: 500 }); });
    tlink(x, 332, 340, 548, 340, T.cyan, t, { head: true }); tlink(x, 732, 340, 948, 340, T.violet, t, { head: true });
    x.save(); x.strokeStyle = H.rgba(T.green, 0.5); x.lineWidth = 3; x.lineCap = 'round'; x.setLineDash([10, 10]); x.beginPath(); x.moveTo(1040, 246); x.bezierCurveTo(1040, 150, 240, 150, 240, 246); x.stroke(); x.restore();
    x.fillStyle = H.rgba(T.cyan, 0.95); x.beginPath(); x.moveTo(240, 252); x.lineTo(230, 232); x.lineTo(250, 232); x.closePath(); x.fill();
    tchip(x, 640, 174, 'repeat until done', 18, { col: T.green, solid: true });
    ttext(x, 'TYPICAL JOBS', 640, 575, 16, T.mute, { mono: true });
    ['qualify leads', 'draft replies', 'triage support'].forEach((s, i) => tchip(x, 380 + i * 260, 625, s, 22, { col: [T.cyan, T.violet, T.green][i] }));
  },
  // 6 CONNECTED TO YOUR TOOLS
  (x, t) => {
    tbg(x, t); wordmark(x);
    hd(x, 'Wired into your tools', 82, 54);
    ['n8n', 'Make', 'GoHighLevel', 'Vapi'].forEach((s, i) => tchip(x, [440, 560, 740, 905][i], 150, s, 20, { col: T.mute }));
    const S6 = [[220, 250, iPerson, 'CRM', T.cyan], [220, 520, iMail, 'Email', T.violet], [1060, 250, iChat, 'WhatsApp', T.green], [1060, 520, iCal, 'Calendar', T.amber], [640, 590, iDoc, 'Documents', T.pink]];
    S6.forEach(([sx, sy, ic, lab, col], i) => { const a = Math.atan2(sy - 370, sx - 640); tlink(x, 640 + Math.cos(a) * 96, 370 + Math.sin(a) * 96, sx - Math.cos(a) * 62, sy - Math.sin(a) * 62, col, t, { ph: i * 0.2, dots: 1 }); tnode(x, sx, sy, 56, col, t, { icon: ic, label: lab, ly: 40, lpx: 22, ph: i }); });
    tnode(x, 640, 370, 90, T.cyan, t, { icon: iBolt, label: null, ring: true });
  },
  // 7 GUARDRAILS
  (x, t) => {
    tbg(x, t); wordmark(x);
    hd(x, 'Guardrails keep it on track', 100, 52);
    tcard(x, 70, 300, 300, 140, { col: T.violet, col2: T.cyan });
    ttext(x, 'AGENT ACTION', 100, 336, 16, T.violet, { mono: true, align: 'left' }); ttext(x, 'Draft reply', 100, 392, 34, T.ink, { align: 'left', w: 700 });
    tlink(x, 372, 370, 520, 370, T.violet, t, { head: true });
    tnode(x, 640, 370, 110, T.green, t, { icon: iShield, label: 'Guardrail check', ly: 40, ring: true });
    tlink(x, 762, 370, 908, 370, T.green, t, { head: true });
    tcard(x, 910, 300, 300, 140, { col: T.green, col2: T.cyan });
    ttext(x, 'YOUR TEAM', 940, 336, 16, T.green, { mono: true, align: 'left' }); ttext(x, 'Stays in control', 940, 392, 28, T.ink, { align: 'left', w: 700 });
    ['allowed actions only', 'approved data only', 'hand-off to a human'].forEach((s, i) => tchip(x, 300 + i * 340, 610, s, 20, { col: T.green }));
  },
  // 8 PROCESS
  (x, t) => {
    tbg(x, t); wordmark(x);
    hd(x, 'From idea to live in weeks', 100, 54);
    const S8 = [['DISCOVER', 'Fixed-scope', 'quote', T.cyan, iDoc], ['BUILD', 'Weekly', 'working demos', T.violet, iBolt], ['SCALE', 'Launch, training,', 'improvements', T.green, iCheck]];
    S8.forEach(([a, b, c, col, ic], i) => { const X = 70 + i * 390; tcard(x, X, 190, 360, 300, { col, col2: T.cyan }); ic(x, X + 70, 270, 26, col); ttext(x, a, X + 30, 345, 20, col, { mono: true, align: 'left' }); ttext(x, b, X + 30, 400, 32, T.ink, { align: 'left', w: 700 }); ttext(x, c, X + 30, 446, 32, T.ink, { align: 'left', w: 700 }); if (i < 2) tlink(x, X + 364, 340, X + 386, 340, col, t, { head: true, dots: 0 }); });
    tchip(x, 410, 585, 'Fixed price, quoted upfront', 22, { col: T.amber }); tchip(x, 890, 585, 'Delivered in weeks', 22, { col: T.green });
  },
  // 9 CTA
  (x, t) => {
    tbg(x, t); wordmark(x, true);
    tchip(x, 640, 192, 'Engineering-led since 2015', 20, { col: T.mute });
    tcard(x, 310, 260, 660, 130, { col: T.cyan, col2: T.violet, r: 65 });
    mayaOrb(x, 400, 325, 42, t, null);
    ttext(x, 'Talk to Maya', 700, 325, 48, T.ink, { w: 800, glow: T.cyan });
    tchip(x, 640, 450, 'Book a free discovery call', 26, { col: T.violet, solid: true });
    ttext(x, 'ilogixdigital.com', 640, 540, 36, T.cyan, { mono: true, w: 600, glow: T.cyan });
    ttext(x, 'Software, AI and growth systems for ambitious businesses.', 640, 615, 24, T.mute, { w: 500 });
  },
];
const PANEL_T = [1.8, 5.0, 9.0, 12.6, 17.0, 21.0, 24.8, 28.5, 33.0];
