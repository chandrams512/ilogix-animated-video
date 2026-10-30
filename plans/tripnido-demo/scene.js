// ===== TripNido demo (10 s): plan a trip in seconds. Draws through S, so any style works. =====
const DURATION = 10;
const TL = { logo: 0.1, h1: 0.3, h2: 0.7, card: 1.4, type: [1.9, 3.8], btn: 3.95, press: [4.0, 4.15], out: [4.3, 4.7], b0: 4.7, d: [5.0, 5.5, 6.0], note: 6.5, out2: [7.2, 7.6], c0: 7.6, cta: 8.6 };
const TRIP_TEXT = 'Goa · 3 days · beaches & food';
const DAYS = [['Day 1', 'Beach morning,', 'seafood lunch'], ['Day 2', 'Old Goa churches', 'and café stops'], ['Day 3', 'Sunset market,', 'slow evening']];

function popIn(x, cx, cy, u, fn, a) { if (u <= 0) return; x.save(); x.globalAlpha *= (a == null ? 1 : a) * Math.min(1, u * 3); const s = back(Math.min(1, u)); x.translate(cx, cy); x.scale(s, s); x.translate(-cx, -cy); fn(); x.restore(); }
function iPin(x, cx, cy, s, col) { x.save(); x.strokeStyle = col; x.lineWidth = Math.max(2, s * 0.14); x.lineCap = 'round'; x.beginPath(); x.moveTo(cx, cy + s * 0.95); x.bezierCurveTo(cx - s * 1.1, cy - s * 0.1, cx - s * 0.8, cy - s * 0.95, cx, cy - s * 0.95); x.bezierCurveTo(cx + s * 0.8, cy - s * 0.95, cx + s * 1.1, cy - s * 0.1, cx, cy + s * 0.95); x.stroke(); x.beginPath(); x.arc(cx, cy - s * 0.25, s * 0.28, 0, TAU); x.stroke(); x.restore(); }
function iPlane(x, cx, cy, s, col) { x.save(); x.fillStyle = col; x.translate(cx, cy); x.rotate(-0.5); x.beginPath(); x.moveTo(s * 1.0, 0); x.lineTo(-s * 0.2, -s * 0.22); x.lineTo(-s * 0.55, -s * 0.85); x.lineTo(-s * 0.8, -s * 0.8); x.lineTo(-s * 0.45, -s * 0.12); x.lineTo(-s * 0.8, -s * 0.12); x.lineTo(-s * 0.95, -s * 0.38); x.lineTo(-s * 1.1, -s * 0.34); x.lineTo(-s * 1.0, 0); x.lineTo(-s * 1.1, s * 0.34); x.lineTo(-s * 0.95, s * 0.38); x.lineTo(-s * 0.8, s * 0.12); x.lineTo(-s * 0.45, s * 0.12); x.lineTo(-s * 0.8, s * 0.8); x.lineTo(-s * 0.55, s * 0.85); x.lineTo(-s * 0.2, s * 0.22); x.closePath(); x.fill(); x.restore(); }

function tripDraw(x, W, Hh, t) {
  S.bg(x, t);
  const P = Hh > W, cx = W / 2, u = (a, d) => seg(t, a, a + (d || 0.5));
  // design area: portrait 720x1280 or landscape 1280x720
  const bw = P ? 720 : 1280, bh = P ? 1280 : 720, k = Math.min(W / bw, Hh / bh);
  x.save(); x.translate((W - bw * k) / 2, (Hh - bh * k) / 2); x.scale(k, k);
  const C = bw / 2, pal = S.pal;
  // brand
  x.save(); x.globalAlpha = u(TL.logo, 0.4) * (1 - seg(t, 9.6, 9.9)); iPlane(x, 58, 56, 15, pal.cyan); S.text(x, 'TripNido', 84, 56, 28, pal.ink, { align: 'left' }); x.restore();

  // Scene A: hook + search
  const aA = 1 - seg(t, TL.out[0], TL.out[1]);
  if (aA > 0) {
    x.save(); x.globalAlpha *= aA;
    const y1 = P ? 330 : 190, px = P ? 66 : 60;
    popIn(x, C, y1, u(TL.h1), () => S.text(x, 'Plan your trip', C, y1, px, pal.ink, { w: 800, glow: pal.cyan }));
    popIn(x, C, y1 + px * 1.2, u(TL.h2), () => S.text(x, 'in seconds.', C, y1 + px * 1.2, px, pal.cyan, { w: 800, glow: pal.cyan }));
    const cw = P ? 600 : 700, ch = 160, cX = C - cw / 2, cY = P ? 650 : 360;
    popIn(x, C, cY + ch / 2, u(TL.card, 0.6), () => {
      S.card(x, cX, cY, cw, ch, { col: pal.cyan });
      S.text(x, 'WHERE TO?', cX + 30, cY + 40, 17, pal.mute, { mono: true, align: 'left' });
      const n = Math.floor(TRIP_TEXT.length * seg(t, TL.type[0], TL.type[1])), s = TRIP_TEXT.slice(0, n);
      S.text(x, s, cX + 30, cY + 96, P ? 31 : 34, pal.ink, { align: 'left' });
      x.save(); x.font = `800 ${P ? 31 : 34}px "Nunito", "Sora", sans-serif`; const tw = x.measureText(s).width; x.restore();
      if (Math.floor(t * 2.4) % 2 === 0 && t < TL.btn + 0.1) { x.fillStyle = pal.cyan; x.fillRect(cX + 32 + tw, cY + 74, 4, 44); }
    });
    const pr = Math.sin(Math.PI * seg(t, TL.press[0], TL.press[1])), by = cY + ch + 80;
    popIn(x, C, by, u(TL.btn, 0.4), () => { x.save(); x.translate(C, by); x.scale(1 - 0.06 * pr, 1 - 0.06 * pr); x.translate(-C, -by); S.chip(x, C, by, 'Plan my trip', 30, { col: pal.violet, solid: true }); x.restore(); });
    x.restore();
  }

  // Scene B: itinerary cards
  const aB = seg(t, TL.b0, TL.b0 + 0.3) * (1 - seg(t, TL.out2[0], TL.out2[1]));
  if (aB > 0) {
    x.save(); x.globalAlpha *= aB;
    S.text(x, 'Your day-by-day plan', C, P ? 190 : 90, P ? 50 : 46, pal.ink, { w: 800 });
    const cols = [pal.cyan, pal.pink, pal.amber], ic = [iPin, S.icon.cal, S.icon.check];
    DAYS.forEach((d, i) => {
      const w = P ? 600 : 360, h = P ? 200 : 300, X = P ? C - w / 2 : C - 560 + i * 380, Y = P ? 300 + i * 250 : 210;
      popIn(x, X + w / 2, Y + h / 2, u(TL.d[i], 0.55), () => {
        S.card(x, X, Y, w, h, { col: cols[i] });
        S.chip(x, X + 84, Y + 52, d[0], 22, { col: cols[i], solid: true });
        S.text(x, d[1], X + 30, Y + (P ? 112 : 150), P ? 30 : 30, pal.ink, { align: 'left' });
        S.text(x, d[2], X + 30, Y + (P ? 154 : 194), P ? 30 : 30, pal.ink, { align: 'left' });
        S.node(x, X + w - 72, Y + (P ? h / 2 : 60), 38, cols[i], t, { icon: ic[i], ph: i });
      });
    });
    x.save(); x.globalAlpha *= u(TL.note, 0.4); S.text(x, 'Sample itinerary', C, P ? 1100 : 590, 20, pal.mute, { mono: true }); x.restore();
    x.restore();
  }

  // Scene C: call to action
  if (t >= TL.c0 - 0.05) {
    const ny = P ? 560 : 250;
    popIn(x, C, ny, u(TL.c0, 0.7), () => S.node(x, C, ny, 84, pal.cyan, t, { icon: iPlane, ring: true }));
    const ty = ny + 170;
    popIn(x, C, ty, u(TL.c0 + 0.3, 0.5), () => S.text(x, 'Your trip,', C, ty, P ? 66 : 60, pal.ink, { w: 800 }));
    popIn(x, C, ty + 76, u(TL.c0 + 0.6, 0.5), () => S.text(x, 'planned.', C, ty + 76, P ? 66 : 60, pal.cyan, { w: 800, glow: pal.cyan }));
    popIn(x, C, ty + 190, u(TL.cta, 0.5), () => S.chip(x, C, ty + 190, 'tripnido.com', 32, { col: pal.violet, solid: true }));
    popIn(x, C, ty + 270, u(TL.cta + 0.3, 0.5), () => S.chip(x, C, ty + 270, 'AI trip planner', 24, { col: pal.cyan }));
  }
  x.restore();
  S.finish(x, t);
}
const explainerL = tripDraw, explainerP = tripDraw;

function scoreSound(k) {
  k.music('pad', 0, DURATION, { bpm: 84, gain: 0.35, chords: [['C4', 'E4', 'G4', 'B4'], ['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['G3', 'B3', 'D4', 'F4']] });
  k.play('pop', TL.h1 + 0.1, { gain: 0.9 }); k.play('pop', TL.h2 + 0.1, { gain: 0.9 });
  k.play('pop', TL.card + 0.1, { gain: 0.9, pan: 0.2 });
  k.play('typing', TL.type[0], { n: 28, rate: 0.066, gain: 0.8, minor: true });
  k.play('click', TL.btn + 0.15, { gain: 1.1 }); k.play('riser', TL.out[0] - 0.3, { dur: 0.7, gain: 0.7 });
  TL.d.forEach((tt, i) => { k.play('pop', tt + 0.1, { gain: 0.9, pan: i === 1 ? 0 : (i - 1) * 0.3 }); k.play('ding', tt + 0.25, { f: ['E6', 'G6', 'C7'][i], gain: 0.7 }); });
  k.play('impact', TL.c0 + 0.05, { gain: 0.5 }); k.play('sparkle', TL.c0 + 0.3, { gain: 0.8, n: 7 }); k.play('success', TL.cta + 0.1, { gain: 0.9 });
}
window.DURATION = DURATION; window.scoreSound = scoreSound;
