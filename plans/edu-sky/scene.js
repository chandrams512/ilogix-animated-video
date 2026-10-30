// ===== Education demo (10 s): why is the sky blue? Draws through S, so any style works. =====
const DURATION = 10;
const TL = { title: 0.2, sun: 0.8, atmo: 1.3, beam: [1.8, 2.8], split: 2.8, straight: [2.9, 3.9], scat: 3.1, chipA: 4.3, eye: 4.8, arrive: [5.4, 6.6], chipB: 5.2, out: [7.8, 8.3], card: 8.3, chipC: 9.1 };
function popIn(x, cx, cy, u, fn, a) { if (u <= 0) return; x.save(); x.globalAlpha *= (a == null ? 1 : a) * Math.min(1, u * 3); const s = back(Math.min(1, u)); x.translate(cx, cy); x.scale(s, s); x.translate(-cx, -cy); fn(); x.restore(); }
const BLUE = '#2f7bff';

function skyDraw(x, W, Hh, t) {
  S.bg(x, t);
  const bw = 1280, bh = 720, k = Math.min(W / bw, Hh / bh), pal = S.pal, u = (a, d) => seg(t, a, a + (d || 0.5));
  x.save(); x.translate((W - bw * k) / 2, (Hh - bh * k) / 2); x.scale(k, k);
  popIn(x, 640, 70, u(TL.title, 0.6), () => S.text(x, 'Why is the sky blue?', 640, 70, 56, pal.ink, { w: 800 }));
  const a1 = 1 - seg(t, TL.out[0], TL.out[1]) * 0.78;
  x.save(); x.globalAlpha *= a1;
  // sun
  popIn(x, 170, 260, u(TL.sun, 0.6), () => {
    glow(x, 170, 260, 150, pal.amber, 0.35);
    x.save(); x.translate(170, 260); x.rotate(t * 0.3); x.strokeStyle = pal.amber; x.lineWidth = 6; x.lineCap = 'round';
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; x.beginPath(); x.moveTo(Math.cos(a) * 84, Math.sin(a) * 84); x.lineTo(Math.cos(a) * 108, Math.sin(a) * 108); x.stroke(); } x.restore();
    x.fillStyle = pal.amber; x.beginPath(); x.arc(170, 260, 66, 0, TAU); x.fill();
    S.text(x, 'Sunlight', 170, 372, 26, pal.ink, { w: 800 });
  });
  // atmosphere
  popIn(x, 710, 330, u(TL.atmo, 0.6), () => {
    x.fillStyle = H.rgba(BLUE, 0.18); rr(x, 520, 150, 380, 360, 40); x.fill();
    x.save(); x.setLineDash([10, 9]); x.lineWidth = 3; x.strokeStyle = H.rgba(BLUE, 0.5); rr(x, 520, 150, 380, 360, 40); x.stroke(); x.restore();
    S.text(x, 'ATMOSPHERE', 710, 178, 18, pal.mute, { mono: true });
  });
  // incoming sunlight beam
  const bp = u(TL.beam[0], TL.beam[1] - TL.beam[0]);
  if (bp > 0) { x.save(); x.lineCap = 'round'; const ex = lerp(236, 520, bp), ey = lerp(268, 330, bp); x.strokeStyle = H.rgba(pal.amber, 0.35); x.lineWidth = 16; x.beginPath(); x.moveTo(236, 268); x.lineTo(ex, ey); x.stroke(); x.strokeStyle = pal.amber; x.lineWidth = 7; x.stroke(); x.restore(); }
  // inside the atmosphere: beam carries colours straight on, blue scatters
  const sp = u(TL.straight[0], TL.straight[1] - TL.straight[0]);
  if (sp > 0) {
    x.save(); x.lineCap = 'round';
    [[pal.red, 318], [pal.green, 338]].forEach(([c, y]) => { x.strokeStyle = c; x.lineWidth = 6; x.beginPath(); x.moveTo(520, 330); x.lineTo(520, y); x.lineTo(lerp(520, 1190, sp), y); x.stroke(); });
    x.restore();
    x.save(); x.globalAlpha *= u(TL.chipA, 0.4); S.chip(x, 1040, 262, 'Red and green pass straight', 22, { col: pal.red }); x.restore();
  }
  const angs = [-95, 70, -135, 110, -55, 140, -160, 85, -110, 125];
  if (t > TL.scat) {
    x.save(); x.lineCap = 'round';
    angs.forEach((deg, i) => {
      const p = seg(t, TL.scat + i * 0.07, TL.scat + 0.5 + i * 0.07); if (p <= 0) return;
      const ox = 560 + i * 33, a = deg * Math.PI / 180, L = 74 * p, wob = 0.6 + 0.4 * Math.sin(t * 5 + i);
      x.strokeStyle = H.rgba(BLUE, 0.9 * wob + 0.1); x.lineWidth = 5; x.beginPath(); x.moveTo(ox, 330); x.lineTo(ox + Math.cos(a) * L, 330 + Math.sin(a) * L); x.stroke();
      x.fillStyle = BLUE; x.beginPath(); x.arc(ox, 330, 5, 0, TAU); x.fill();
    });
    x.restore();
    x.save(); x.globalAlpha *= u(TL.chipB, 0.4); S.chip(x, 330, 570, 'Blue scatters in every direction', 22, { col: pal.cyan }); x.restore();
  }
  // ground and observer
  popIn(x, 710, 650, u(TL.eye, 0.5), () => {
    x.fillStyle = H.rgba(pal.green, 0.35); x.beginPath(); x.ellipse(710, 770, 600, 150, 0, 0, TAU); x.fill();
    S.node(x, 710, 628, 34, pal.ink, t, { icon: S.icon.person });
  });
  const ap = u(TL.arrive[0], TL.arrive[1] - TL.arrive[0]);
  if (ap > 0) { x.save(); x.lineCap = 'round'; [0, 3, 5, 7].forEach((i, j) => { const ox = 560 + i * 33, q = seg(ap, j * 0.18, 0.55 + j * 0.15); if (q <= 0) return; x.strokeStyle = H.rgba(BLUE, 0.75); x.lineWidth = 3.5; x.setLineDash([8, 8]); x.beginPath(); x.moveTo(ox, 336); x.lineTo(lerp(ox, 710, q), lerp(336, 596, q)); x.stroke(); }); x.restore(); }
  x.restore();
  // answer card
  const cp = u(TL.card, 0.6);
  popIn(x, 640, 360, cp, () => {
    S.card(x, 190, 250, 900, 230, { col: pal.cyan });
    S.text(x, 'Short blue waves scatter the most,', 640, 340, 46, pal.ink, { w: 800 });
    S.text(x, 'so the whole sky looks blue.', 640, 410, 46, pal.cyan, { w: 800 });
  });
  popIn(x, 640, 540, u(TL.chipC, 0.5), () => S.chip(x, 640, 540, 'Rayleigh scattering', 28, { col: pal.violet, solid: true }));
  x.restore();
  S.finish(x, t);
}
const explainerL = skyDraw, explainerP = skyDraw;

function scoreSound(k) {
  k.music('pad', 0, DURATION, { bpm: 76, gain: 0.35, chords: [['D3', 'A3', 'D4', 'F#4'], ['B2', 'F#3', 'B3', 'D4'], ['G3', 'D4', 'G4', 'B4'], ['A2', 'E3', 'A3', 'C#4']] });
  k.play('pop', TL.title + 0.1, { gain: 1.0 }); k.play('sparkle', TL.sun + 0.1, { gain: 0.6, n: 5 }); k.play('pop', TL.atmo + 0.1, { gain: 0.8 });
  k.play('riser', TL.beam[0], { dur: 1.0, gain: 0.6 }); k.play('impact', TL.split, { gain: 0.45 });
  for (let i = 0; i < 10; i++) k.play('blip', TL.scat + i * 0.07 + 0.1, { f: ['E6', 'G6', 'C7', 'A6', 'D7'][i % 5], dur: 0.07, gain: 0.5, pan: (i - 4.5) * 0.12, minor: true });
  k.play('pop', TL.chipA, { gain: 0.8, pan: 0.4 }); k.play('pop', TL.chipB, { gain: 0.8 }); k.play('pop', TL.eye, { gain: 0.8 });
  k.play('riser', TL.out[0] - 0.4, { dur: 0.6, gain: 0.6 }); k.play('success', TL.card + 0.1, { gain: 0.9 }); k.play('pop', TL.chipC + 0.1, { gain: 0.9 });
}
window.DURATION = DURATION; window.scoreSound = scoreSound;
