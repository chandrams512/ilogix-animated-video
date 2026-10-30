// ===== iLogix explainer: one timeline drives both picture and sound =====
const DURATION = 35;
const TL = {
  hl1: [0.2, 0.45], phone: 0.3, node1: 0.5, clock: 0.9, chipMissed: 1.2, unk: 1.4, chipAfter: 1.7, nobody: 2.1, ring: [0.5, 1.9], answer: 3.2, move1: [3.3, 4.1],
  meet: 3.6, orb: 3.7, link1: [3.9, 4.5], incoming: 4.1, chipAns: 4.2, bubble: 4.9, chipMaya: 5.5,
  move2: [6.9, 7.7], hl3: 7.4, fields: [7.9, 8.5, 9.1], team: 9.8, chipHand: 10.6, handoff: [10.2, 10.7],
  shock: [11.3, 12.1], white: [11.6, 12.0, 12.5],
  ag1: 12.3, ag2: 12.7, ag3: 13.2, agent: 12.4, sats: [13.0, 13.2, 13.4], split: [14.3, 15.1],
  pav: [15.0, 15.5, 16.0], pavLab: [15.1, 15.6, 16.1], pavSub: [15.3, 15.7, 16.1], pl1: [15.4, 15.8], pl2: [15.9, 16.3], loop: [16.5, 17.2], loopChip: 17.0, jobsLab: 17.5, jobs: [17.8, 18.1, 18.4],
  hubMove: [19.3, 20.1], wired: 19.9, spokes: [20.3, 20.6, 20.9, 21.2, 21.5], toolChips: [21.9, 22.1, 22.3, 22.5],
  collapse: [23.9, 24.7], push: [23.8, 24.9], hl7: 24.6, action: 24.9, lk7a: [25.3, 25.8], pass: 25.9, lk7b: [26.0, 26.4], teamCard: 26.2, guardChips: [26.5, 26.75, 27.0],
  morph8: [27.3, 28.4], hl8: 27.9, cardsTxt: 28.3, arrows8: [28.6, 28.8], chip8a: 29.2, chip8b: 29.8,
  conv: [31.2, 31.9], logo: 31.7, chipEng: 32.0, btn: 31.9, btnTxt: 32.2, chipBook: 32.7, url: [33.0, 33.8], tag: 34.0,
};
const pv = (t, a, d = 0.3, s = 1.4) => back(seg(t, a, a + d), s);
const mixc = (a, b, u) => H.mix(a, b, cl(u));
const pop = (x, cx, cy, u, fn, a) => { if (u <= 0.01 || a === 0) return; x.save(); if (a != null) x.globalAlpha *= a; x.translate(cx, cy); x.scale(u, u); x.translate(-cx, -cy); fn(); x.restore(); };
const ptext = (x, s, cx, cy, px, col, u, a, o) => pop(x, cx, cy, u, () => ttext(x, s, cx, cy, px, col, o || {}), a);
const pchip = (x, s, cx, cy, px, u, a, o) => pop(x, cx, cy, u, () => tchip(x, cx, cy, s, px, o || {}), a);
function plink(x, ax, ay, bx, by, col, t, p, o) {
  if (p <= 0.01) return; o = o || {};
  tlink(x, ax, ay, lerp(ax, bx, p), lerp(ay, by, p), col, t, Object.assign({}, o, { head: !!o.head && p > 0.95 }));
}
function twhite(x, a) {
  if (a <= 0) return;
  const cw = x.canvas.width, ch = x.canvas.height, g = x.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, Math.hypot(cw, ch) / 2);
  g.addColorStop(0, H.rgba('#e6fcff', a)); g.addColorStop(0.5, H.rgba(T.cyan, a * 0.95)); g.addColorStop(1, H.rgba(T.violet, a * 0.9));
  x.fillStyle = g; x.fillRect(0, 0, cw, ch);
}
const bezPts = (P, p, n = 60) => { const a = []; for (let i = 0; i <= n; i++) a.push(bez(P, (p * i) / n)); return a; };

function explainerL(ctx, W, Hh, t) {
  const x = ctx;
  x.save();
  const z = 1 + 0.12 * Math.sin(Math.PI * seg(t, TL.push[0], TL.push[1]));
  x.translate(640, 360); x.scale(z, z); x.translate(-640, -360);
  tbg(x, t);

  // wordmark: small header, then the big lockup at the end
  x.save(); x.globalAlpha = seg(t, 0.1, 0.5) * (1 - seg(t, 31.2, 31.6)); wordmark(x, false); x.restore();
  pop(x, 640, 120, pv(t, TL.logo, 0.5, 1.2), () => wordmark(x, true), 1);

  // ---- shared moving objects (beats 1-3) ----
  const m1 = eio(seg(t, TL.move1[0], TL.move1[1])), m2 = eio(seg(t, TL.move2[0], TL.move2[1]));
  let px = lerp(420, 190, m1), py = lerp(400, 440, m1), pr = lerp(52, 60, m1);
  px = lerp(px, 130, m2); py = lerp(py, 400, m2); pr = lerp(pr, 62, m2);
  const pcol = mixc(T.red, T.cyan, m1);
  const ox = lerp(640, 390, m2), oy = lerp(440, 400, m2), orr = lerp(125, 76, m2);

  if (t < 12.05) {
    // BEAT 1
    const a1 = 1 - seg(t, 2.9, 3.4);
    ptext(x, 'Every missed call', 640, 92, 56, T.ink, pv(t, TL.hl1[0], 0.4, 1.3), a1, { w: 800 });
    ptext(x, 'is a missed customer.', 640, 158, 56, T.cyan, pv(t, TL.hl1[1], 0.4, 1.3), a1, { w: 800, glow: T.cyan });
    const ringing = (t > 0.5 && t < 1.5) || (t > 1.9 && t < 2.9) ? 1 : 0.2;
    for (let i = 0; i < 3; i++) {
      x.save(); x.globalAlpha = a1 * ringing * seg(t, 0.4, 0.6) * (0.5 + 0.5 * Math.sin(t * 12 - i * 1.3)); x.strokeStyle = H.rgba(T.red, 0.6 - 0.15 * i); x.lineWidth = 4; x.lineCap = 'round';
      const R = 220 + i * 26; x.beginPath(); x.arc(420, 450, R, -2.45, -2.0); x.stroke(); x.beginPath(); x.arc(420, 450, R, -1.14, -0.69); x.stroke(); x.restore();
    }
    pop(x, 420, 465, pv(t, TL.phone, 0.4), () => tcard(x, 315, 280, 210, 370, { col: T.red, col2: T.pink }), 1 - seg(t, 3.2, 3.6));
    pchip(x, 'Missed call', 420, 492, 20, pv(t, TL.chipMissed), 1 - seg(t, 3.2, 3.5), { col: T.red });
    pop(x, 420, 545, 1, () => ttext(x, 'Unknown caller', 420, 545, 18, T.mute, { mono: true, w: 500 }), seg(t, TL.unk, TL.unk + 0.3) * (1 - seg(t, 3.2, 3.5)));
    const ca = 1 - seg(t, 2.9, 3.3);
    pop(x, 840, 400, pv(t, TL.clock, 0.4), () => { ttext(x, '02:14', 840, 400, 140, T.ink, { mono: true, w: 600, glow: T.cyan }); ttext(x, 'AM', 1090, 440, 40, T.amber, { mono: true, w: 600, align: 'left' }); }, ca);
    pchip(x, 'after hours', 840, 500, 22, pv(t, TL.chipAfter), ca, { col: T.amber });
    ptext(x, 'Nobody picks up.', 840, 580, 36, T.mute, pv(t, TL.nobody), ca, { w: 600 });
    for (let i = 0; i < 2; i++) { const u = seg(t, TL.answer + i * 0.18, TL.answer + 0.9 + i * 0.18); if (u > 0 && u < 1) { x.save(); x.strokeStyle = H.rgba(T.green, 0.8 * (1 - u)); x.lineWidth = 6 * (1 - u) + 1; x.beginPath(); x.arc(420, 400, lerp(52, 420, eo(u)), 0, TAU); x.stroke(); x.restore(); } }

    // phone node (moves through beats 1-3)
    pop(x, px, py, pv(t, TL.node1, 0.35, 1.5), () => tnode(x, px, py, pr, pcol, t, { icon: iPhone, ring: t < 3.3 }), 1);
    x.save(); x.globalAlpha = seg(t, TL.incoming, TL.incoming + 0.3) * (1 - seg(t, 6.6, 6.9)); ttext(x, 'Incoming call', 190, 440 + 60 + 32, 22, T.ink, { w: 700 }); x.restore();
    x.save(); x.globalAlpha = seg(t, 7.5, 7.8); ttext(x, 'Caller', 130, 400 + 62 + 32, 26, T.ink, { w: 700 }); x.restore();

    // BEAT 2
    const a2 = 1 - seg(t, 6.6, 7.0);
    ptext(x, 'Meet Maya', 640, 110, 72, T.ink, pv(t, TL.meet, 0.4, 1.3), a2, { w: 800, glow: T.violet });
    pchip(x, 'answers every call, 24/7', 640, 178, 22, pv(t, TL.chipAns), a2, { col: T.green });
    plink(x, px + pr + 6, py, ox - orr - 6, oy, T.cyan, t, seg(t, TL.link1[0], TL.link1[1]), { head: true });
    pop(x, ox, oy, pv(t, TL.orb, 0.45, 1.3), () => mayaOrb(x, ox, oy, orr, t, null), 1);
    x.save(); x.globalAlpha = seg(t, 7.7, 8.0); ttext(x, 'Maya', ox, oy + orr + 34, 26, T.ink, { w: 700 }); x.restore();
    pchip(x, 'Maya · AI receptionist', 640, 625, 22, pv(t, TL.chipMaya), a2, { col: T.violet });
    pop(x, 1010, 375, pv(t, TL.bubble, 0.4, 1.4), () => {
      tcard(x, 810, 300, 400, 150, { col: T.violet, col2: T.cyan });
      ttext(x, 'MAYA', 842, 332, 16, T.violet, { mono: true, align: 'left' }); ttext(x, 'Hi, you’ve reached iLogix.', 842, 378, 26, T.ink, { align: 'left', w: 600 }); ttext(x, 'How can I help?', 842, 418, 26, T.ink, { align: 'left', w: 600 });
    }, a2);

    // BEAT 3
    ptext(x, 'Maya collects the details', 640, 100, 52, T.ink, pv(t, TL.hl3, 0.4, 1.3), 1, { w: 800 });
    ['Name', 'Phone number', 'Reason for calling'].forEach((s, i) => {
      const y = 250 + i * 110, st = TL.fields[i];
      plink(x, 470, 400, 590, y + 46, T.violet, t, seg(t, st - 0.1, st + 0.3), { dots: 1, ph: i * 0.2 });
      pop(x, 745, y + 46, pv(t, st, 0.35, 1.4), () => {
        tcard(x, 590, y, 310, 92, { col: T.green, col2: T.cyan, r: 18 });
        ttext(x, s, 670, y + 46, 24, T.ink, { align: 'left', w: 600 });
      }, 1);
      pop(x, 632, y + 46, pv(t, st + 0.3, 0.3, 2.0), () => { x.fillStyle = H.rgba(T.green, 0.2); x.beginPath(); x.arc(632, y + 46, 22, 0, TAU); x.fill(); iCheck(x, 632, y + 46, 14, T.green); }, 1);
      plink(x, 900, y + 46, 1052, 400, T.green, t, seg(t, 9.6 + i * 0.12, 10.1 + i * 0.12), { dots: 1, ph: i * 0.3 });
    });
    pop(x, 1130, 400, pv(t, TL.team, 0.45, 1.4), () => tnode(x, 1130, 400, 78, T.green, t, { icon: iPerson, ring: true }), 1);
    x.save(); x.globalAlpha = seg(t, 10.1, 10.4); ttext(x, 'Your team', 1130, 400 + 78 + 32, 26, T.ink, { w: 700 }); x.restore();
    const hu = seg(t, TL.handoff[0], TL.handoff[1]); if (hu > 0 && hu < 1) glow(x, 1130, 400, 160 + 220 * hu, T.green, 0.55 * (1 - hu));
    pchip(x, 'then hands off to your team', 640, 640, 24, pv(t, TL.chipHand), 1, { col: T.green });
  }

  // ---- BEAT 4: agentic AI acts ----
  const S4 = [[1080, 204, iMail, T.violet], [1165, 380, iCal, T.amber], [1080, 556, iCheck, T.green]];
  if (t >= 12.05 && t < 15.7) {
    const a4 = 1 - seg(t, 14.2, 14.6);
    ptext(x, 'Agentic AI', 70, 230, 76, T.ink, pv(t, TL.ag1, 0.4, 1.3), a4, { align: 'left', w: 800 });
    ptext(x, 'doesn’t just answer.', 70, 322, 52, T.mute, pv(t, TL.ag2, 0.4, 1.3), a4, { align: 'left', w: 600 });
    ptext(x, 'It acts.', 70, 448, 104, T.cyan, pv(t, TL.ag3, 0.5, 1.8), a4, { align: 'left', w: 800, glow: T.cyan });
    S4.forEach(([sx, sy, ic, col], i) => {
      const fu = eo(seg(t, TL.sats[i], TL.sats[i] + 0.5)), cx = lerp(930, sx, fu), cy = lerp(380, sy, fu), a = Math.atan2(sy - 380, sx - 930);
      if (fu > 0.9) tlink(x, 930 + Math.cos(a) * 112, 380 + Math.sin(a) * 112, sx - Math.cos(a) * 52, sy - Math.sin(a) * 52, col, t, { head: true, dots: 1, ph: i * 0.25 });
      pop(x, cx, cy, fu > 0 ? 1 : 0, () => tnode(x, cx, cy, 44, col, t, { icon: ic, ph: i }), a4);
    });
    pop(x, 930, 380, pv(t, TL.agent, 0.45, 1.4), () => tnode(x, 930, 380, 100, T.cyan, t, { icon: iBolt, ring: true }), 1 - seg(t, 14.3, 14.6));
  }

  // ---- BEAT 5: plan, act, verify (Verify node becomes the hub in beat 6) ----
  const sp = eio(seg(t, TL.split[0], TL.split[1])), hm = eio(seg(t, TL.hubMove[0], TL.hubMove[1]));
  const NS = [[240, T.cyan, iPlan, 'Plan', 'break the goal into steps'], [640, T.violet, iBolt, 'Act', 'use your tools'], [1040, T.green, iCheck, 'Verify', 'check before it counts']];
  if (t >= TL.split[0] && t < 27.8) {
    const a5 = 1 - seg(t, 19.1, 19.5);
    NS.forEach(([nx, col, ic, lab, sub], i) => {
      let cx = lerp(930, nx, sp), cy = lerp(380, 340, sp), r = lerp(60, 84, sp), ca = col, icon = ic, al = seg(t, TL.split[0], TL.split[0] + 0.25);
      if (i === 2) {
        cx = lerp(cx, 640, hm); cy = lerp(cy, 370, hm); r = lerp(r, 90, hm); ca = mixc(T.green, T.cyan, hm);
        icon = (xx, a, b, s, c) => { xx.save(); xx.globalAlpha *= 1 - hm; iCheck(xx, a, b, s, c); xx.restore(); xx.save(); xx.globalAlpha *= hm; iBolt(xx, a, b, s, c); xx.restore(); };
        if (t >= 20.1 && t < TL.collapse[0]) { cx = 640; cy = 370; r = 90; ca = T.cyan; icon = iBolt; }
        if (t >= TL.collapse[0] && t < 27.8) { const cu = eio(seg(t, TL.collapse[0], TL.collapse[1])); r = lerp(90, 110, cu); ca = mixc(T.cyan, T.green, cu); icon = (xx, a, b, s, c) => { xx.save(); xx.globalAlpha *= 1 - cu; iBolt(xx, a, b, s, c); xx.restore(); xx.save(); xx.globalAlpha *= cu; iShield(xx, a, b, s * 1.5, c); xx.restore(); }; }
      } else al *= a5 * (1 - seg(t, 19.1, 19.6));
      if (i === 2 && t >= 27.3) al = 1 - seg(t, 27.3, 27.7);
      pop(x, cx, cy, 1, () => tnode(x, cx, cy, r, ca, t, { icon, ring: true, ph: i }), al);
      if (t < 19.6) {
        x.save(); x.globalAlpha = seg(t, TL.pavLab[i], TL.pavLab[i] + 0.3) * a5; ttext(x, lab, nx, 340 + 84 + 36, 30, T.ink, { w: 700 }); x.restore();
        x.save(); x.globalAlpha = seg(t, TL.pavSub[i], TL.pavSub[i] + 0.3) * a5; ttext(x, sub, nx, 488, 18, T.mute, { mono: true, w: 500 }); x.restore();
        ptext(x, lab + '.', [395, 640, 885][i], 82, 58, [T.cyan, T.violet, T.green][i], pv(t, TL.pav[i], 0.4, 1.4), a5, { w: 800 });
      }
    });
    if (t < 19.6) {
      x.save(); x.globalAlpha = a5;
      plink(x, 332, 340, 548, 340, T.cyan, t, seg(t, TL.pl1[0], TL.pl1[1]), { head: true });
      plink(x, 732, 340, 948, 340, T.violet, t, seg(t, TL.pl2[0], TL.pl2[1]), { head: true });
      const lp = seg(t, TL.loop[0], TL.loop[1]);
      if (lp > 0) {
        const pts = bezPts([[1040, 246], [1040, 150], [240, 150], [240, 246]], lp);
        x.strokeStyle = H.rgba(T.green, 0.5); x.lineWidth = 3; x.lineCap = 'round'; x.setLineDash([10, 10]); x.beginPath(); pts.forEach((p, k) => (k ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.stroke(); x.setLineDash([]);
        if (lp > 0.97) { x.fillStyle = H.rgba(T.cyan, 0.95); x.beginPath(); x.moveTo(240, 252); x.lineTo(230, 232); x.lineTo(250, 232); x.closePath(); x.fill(); }
      }
      x.restore();
      pchip(x, 'repeat until done', 640, 174, 18, pv(t, TL.loopChip), a5, { col: T.green, solid: true });
      x.save(); x.globalAlpha = seg(t, TL.jobsLab, TL.jobsLab + 0.3) * a5; ttext(x, 'TYPICAL JOBS', 640, 575, 16, T.mute, { mono: true }); x.restore();
      ['qualify leads', 'draft replies', 'triage support'].forEach((s, i) => pchip(x, s, 380 + i * 260, 625, 22, pv(t, TL.jobs[i]), a5, { col: [T.cyan, T.violet, T.green][i] }));
    }
  }

  // ---- BEAT 6: wired into your tools ----
  const S6 = [[220, 250, iPerson, 'CRM', T.cyan], [220, 520, iMail, 'Email', T.violet], [1060, 250, iChat, 'WhatsApp', T.green], [1060, 520, iCal, 'Calendar', T.amber], [640, 590, iDoc, 'Documents', T.pink]];
  const cu6 = eio(seg(t, TL.collapse[0], TL.collapse[1]));
  if (t >= 19.7 && t < 24.9) {
    const a6 = 1 - seg(t, 23.7, 24.1);
    ptext(x, 'Wired into your tools', 640, 82, 54, T.ink, pv(t, TL.wired, 0.4, 1.3), a6, { w: 800 });
    ['n8n', 'Make', 'GoHighLevel', 'Vapi'].forEach((s, i) => pchip(x, s, [440, 560, 740, 905][i], 150, 20, pv(t, TL.toolChips[i]), a6, { col: T.mute }));
    S6.forEach(([sx, sy, ic, lab, col], i) => {
      const st = TL.spokes[i], cx = lerp(sx, 640, cu6), cy = lerp(sy, 370, cu6), al = 1 - seg(t, 24.2, 24.7), a = Math.atan2(sy - 370, sx - 640);
      const lk = seg(t, st, st + 0.3) * (1 - cu6);
      if (lk > 0) tlink(x, 640 + Math.cos(a) * 96, 370 + Math.sin(a) * 96, lerp(640 + Math.cos(a) * 96, cx - Math.cos(a) * 62, lk), lerp(370 + Math.sin(a) * 96, cy - Math.sin(a) * 62, lk), col, t, { dots: 1, ph: i * 0.2 });
      pop(x, cx, cy, pv(t, st + 0.2, 0.35, 1.5), () => tnode(x, cx, cy, 56, col, t, { icon: ic, label: lab, ly: 40, lpx: 22, ph: i }), al * (1 - cu6 * 0.2));
    });
  }

  // ---- BEAT 7: guardrails ----
  if (t >= TL.collapse[1] - 0.2 && t < 27.7) {
    const a7 = 1 - seg(t, 27.2, 27.6);
    ptext(x, 'Guardrails keep it on track', 640, 100, 52, T.ink, pv(t, TL.hl7, 0.4, 1.3), a7, { w: 800 });
    pop(x, 220, 370, pv(t, TL.action, 0.4, 1.4), () => { tcard(x, 70, 300, 300, 140, { col: T.violet, col2: T.cyan }); ttext(x, 'AGENT ACTION', 100, 336, 16, T.violet, { mono: true, align: 'left' }); ttext(x, 'Draft reply', 100, 392, 34, T.ink, { align: 'left', w: 700 }); }, a7);
    x.save(); x.globalAlpha = a7;
    plink(x, 372, 370, 520, 370, T.violet, t, seg(t, TL.lk7a[0], TL.lk7a[1]), { head: true });
    plink(x, 762, 370, 908, 370, T.green, t, seg(t, TL.lk7b[0], TL.lk7b[1]), { head: true });
    const pu = seg(t, TL.pass, TL.pass + 0.8); if (pu > 0 && pu < 1) glow(x, 640, 370, 150 + 260 * pu, T.green, 0.5 * (1 - pu));
    x.restore();
    x.save(); x.globalAlpha = seg(t, 25.0, 25.3) * a7; ttext(x, 'Guardrail check', 640, 370 + 110 + 40, 26, T.ink, { w: 700 }); x.restore();
    pop(x, 1060, 370, pv(t, TL.teamCard, 0.4, 1.4), () => { tcard(x, 910, 300, 300, 140, { col: T.green, col2: T.cyan }); ttext(x, 'YOUR TEAM', 940, 336, 16, T.green, { mono: true, align: 'left' }); ttext(x, 'Stays in control', 940, 392, 28, T.ink, { align: 'left', w: 700 }); }, a7);
    ['allowed actions only', 'approved data only', 'hand-off to a human'].forEach((s, i) => pchip(x, s, 300 + i * 340, 610, 20, pv(t, TL.guardChips[i]), a7, { col: T.green }));
  }

  // ---- BEAT 8: process (cards grow out of the shield) ----
  const S8 = [['DISCOVER', 'Fixed-scope', 'quote', T.cyan, iDoc], ['BUILD', 'Weekly', 'working demos', T.violet, iBolt], ['SCALE', 'Launch, training,', 'improvements', T.green, iCheck]];
  if (t >= TL.morph8[0] && t < 32.0) {
    const mu = eio(seg(t, TL.morph8[0], TL.morph8[1])), cv = eio(seg(t, TL.conv[0], TL.conv[1])), a8 = 1 - seg(t, 31.0, 31.4);
    ptext(x, 'From idea to live in weeks', 640, 100, 54, T.ink, pv(t, TL.hl8, 0.4, 1.3), a8, { w: 800 });
    S8.forEach(([a, b, c, col, ic], i) => {
      const X = 70 + i * 390, fx = X + 180, fy = 340;
      let cx = lerp(640, fx, mu), cy = lerp(370, fy, mu), s = lerp(0.2, 1, mu);
      cx = lerp(cx, 640, cv); cy = lerp(cy, 325, cv); s = lerp(s, 0.3, cv);
      const al = seg(t, TL.morph8[0], TL.morph8[0] + 0.2) * (1 - seg(t, 31.5, 31.9));
      x.save(); x.globalAlpha *= al; x.translate(cx, cy); x.scale(s, s); x.translate(-fx, -fy);
      tcard(x, X, 190, 360, 300, { col, col2: T.cyan });
      x.globalAlpha *= seg(t, TL.cardsTxt + i * 0.1, TL.cardsTxt + 0.3 + i * 0.1) * (1 - cv);
      ic(x, X + 70, 270, 26, col); ttext(x, a, X + 30, 345, 20, col, { mono: true, align: 'left' }); ttext(x, b, X + 30, 400, 32, T.ink, { align: 'left', w: 700 }); ttext(x, c, X + 30, 446, 32, T.ink, { align: 'left', w: 700 });
      x.restore();
      if (i < 2) plink(x, X + 364, 340, X + 386, 340, col, t, seg(t, TL.arrows8[0] + i * 0.2, TL.arrows8[1] + i * 0.2) * (1 - cv), { head: true, dots: 0 });
    });
    pchip(x, 'Fixed price, quoted upfront', 410, 585, 22, pv(t, TL.chip8a, 0.35, 2.2), a8, { col: T.amber });
    pchip(x, 'Delivered in weeks', 890, 585, 22, pv(t, TL.chip8b, 0.35, 1.8), a8, { col: T.green });
  }

  // ---- BEAT 9: call to action ----
  if (t >= 31.2) {
    pchip(x, 'Engineering-led since 2015', 640, 192, 20, pv(t, TL.chipEng), 1, { col: T.mute });
    pop(x, 640, 325, pv(t, TL.btn, 0.45, 1.3), () => { tcard(x, 310, 260, 660, 130, { col: T.cyan, col2: T.violet, r: 65 }); mayaOrb(x, 400, 325, 42, t, null); }, 1);
    ptext(x, 'Talk to Maya', 700, 325, 48, T.ink, pv(t, TL.btnTxt, 0.4, 1.3), 1, { w: 800, glow: T.cyan });
    pchip(x, 'Book a free discovery call', 640, 450, 26, pv(t, TL.chipBook, 0.4, 1.4), 1, { col: T.violet, solid: true });
    const url = 'ilogixdigital.com', n = Math.floor(url.length * seg(t, TL.url[0], TL.url[1]));
    if (n > 0) { x.save(); x.font = mf(600, 36); const full = x.measureText(url).width; x.restore(); ttext(x, url.slice(0, n) + (t < TL.url[1] + 0.3 && Math.floor(t * 6) % 2 ? '|' : ''), 640 - full / 2, 540, 36, T.cyan, { mono: true, w: 600, glow: T.cyan, align: 'left' }); }
    x.save(); x.globalAlpha = seg(t, TL.tag, TL.tag + 0.5); ttext(x, 'Software, AI and growth systems for ambitious businesses.', 640, 615, 24, T.mute, { w: 500 }); x.restore();
  }
  x.restore();

  // beat 3 -> 4 scene change: shock ring from the team node, then the glow whiteout
  const su = seg(t, TL.shock[0], TL.shock[1]);
  if (su > 0 && su < 1) { x.save(); x.strokeStyle = H.rgba(T.cyan, 0.9 * (1 - su)); x.lineWidth = lerp(12, 3, su); x.shadowColor = T.cyan; x.shadowBlur = 24; x.beginPath(); x.arc(1130, 400, lerp(78, 1500, eo(su)), 0, TAU); x.stroke(); x.restore(); }
  twhite(x, seg(t, TL.white[0], TL.white[1]) * (1 - seg(t, TL.white[1], TL.white[2])));
  tfinish(x, t);
}

// ===== Sound: glassy plucks, soft boops, airy whooshes, a warm pad. Built from the same TL times. =====
function scoreSound(k) {
  const D = DURATION, hz = k.hz;
  const pluck = (t, n, g = 1, p = 0, minor = false) => { const f = hz(n); k.tone(t, { f, dur: 0.9, gain: 0.2 * g, a: 0.003, pan: p, verb: 0.28, minor }); k.tone(t, { f: f * 4, dur: 0.09, gain: 0.04 * g, a: 0.001, pan: p, minor }); k.tone(t, { f: f * 2, type: 'triangle', dur: 0.32, gain: 0.045 * g, a: 0.003, pan: p, minor }); };
  const boop = (t, f0, g = 1, p = 0, minor = true) => { k.tone(t, { f: [[0, f0], [0.07, f0 * 1.45], [0.16, f0 * 1.3]], dur: 0.2, gain: 0.17 * g, a: 0.008, pan: p, verb: 0.15, minor }); k.tone(t, { f: [[0, f0 * 0.5], [0.08, f0 * 0.72]], type: 'triangle', dur: 0.14, gain: 0.06 * g, a: 0.006, pan: p, minor }); };
  const air = (t, dur, top, g = 1, p = 0, peak = 0.55, minor = false) => k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: [[0, 260], [dur * peak, top], [dur, 340]], q: 0.55, gain: 0.26 * g, a: dur * peak, pan: p, verb: 0.3, minor });
  const chord = (t, notes, g = 1, dur = 2.2) => notes.forEach((n, i) => { k.tone(t + i * 0.012, { f: n, type: 'triangle', dur, gain: 0.07 * g, a: 0.02, verb: 0.35, filter: 'lowpass', f2: 1800, pan: (i / (notes.length - 1) - 0.5) * 0.6 }); k.tone(t + i * 0.012, { f: hz(n) * 1.003, dur, gain: 0.06 * g, a: 0.03, verb: 0.35 }); });
  const shimmer = (t, notes, g = 1, p = 0) => k.withMinor(() => notes.forEach((n, i) => k.tone(t + i * 0.055, { f: n, dur: 0.7, gain: 0.07 * g, a: 0.004, verb: 0.4, pan: p + (i % 2 ? 0.25 : -0.25) })));
  const ticks = (t0, t1, rate, f0, f1, g = 0.4, p = 0) => { for (let tt = t0; tt < t1; tt += rate) k.play('tock', tt, { f: lerp(f0, f1, (tt - t0) / (t1 - t0)), gain: g, pan: p, minor: true }); };
  const ring = (t0) => [0, 0.55].forEach((d) => { k.tone(t0 + d, { f: 440, dur: 0.42, gain: 0.1, a: 0.01, hold: 0.3, pan: -0.3, verb: 0.15 }); k.tone(t0 + d, { f: 480, dur: 0.42, gain: 0.1, a: 0.01, hold: 0.3, pan: -0.3, verb: 0.15 }); });
  const down = (t, p = 0) => { k.tone(t, { f: 'E3', type: 'triangle', dur: 0.26, gain: 0.2, hold: 0.1, filter: 'lowpass', f2: 900, pan: p }); k.tone(t + 0.2, { f: 'C3', type: 'triangle', dur: 0.5, gain: 0.2, hold: 0.18, filter: 'lowpass', f2: 800, pan: p }); };

  k.music('pad', 0, D, { bpm: 70, gain: 0.45, chords: [['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['D3', 'F3', 'A3', 'C4'], ['E3', 'G3', 'B3', 'D4']] });
  k.bed('room', 0, 3.4, { gain: 0.8 });

  // 1 missed call
  TL.hl1.forEach((tt, i) => pluck(tt + 0.05, ['A3', 'E4'][i], 0.8, i ? 0.2 : -0.2));
  boop(TL.node1 + 0.1, 330, 0.9, -0.2, false); ring(TL.ring[0]); ring(TL.ring[1]);
  pluck(TL.clock + 0.1, 'A3', 0.8, 0.4, true); boop(TL.chipMissed + 0.1, 400, 0.6, -0.2); k.play('tick', TL.chipAfter + 0.1, { gain: 0.5, pan: 0.4, minor: true }); pluck(TL.nobody + 0.1, 'E4', 0.7, 0.4, true);
  k.tone(2.65, { f: [[0, 330], [0.45, 150]], type: 'triangle', dur: 0.55, gain: 0.16, filter: 'lowpass', f2: 900 });
  k.play('click', TL.answer, { gain: 1.2 }); air(TL.answer, 0.9, 1800, 0.7, 0, 0.4); shimmer(TL.answer + 0.1, ['E5', 'A5', 'C6'], 0.9, -0.2);
  // 2 meet Maya
  pluck(TL.meet + 0.1, 'C4', 0.9, 0); k.play('riser', TL.orb - 0.2, { dur: 0.6, gain: 0.7 }); boop(TL.orb + 0.2, 520, 0.9, 0, false);
  ticks(TL.link1[0], TL.link1[1], 0.15, 520, 800, 0.35, -0.2); pluck(TL.chipAns + 0.1, 'G4', 0.7, 0.3, true);
  k.play('pop', TL.bubble + 0.1, { gain: 1.0, pan: 0.5 }); for (let tt = 5.1; tt < 6.8; tt += 0.35) k.play('blip', tt, { f: 'E5', dur: 0.04, gain: 0.5, pan: 0.2, minor: true });
  pluck(TL.chipMaya + 0.1, 'E4', 0.7, 0, true);
  // 3 collects
  air(TL.move2[0], 0.8, 1500, 0.8, -0.3, 0.5, true); pluck(TL.hl3 + 0.1, 'A3', 0.8, 0);
  ['C6', 'E6', 'G6'].forEach((n, i) => k.play('ding', TL.fields[i] + 0.3, { f: n, gain: 0.7, pan: 0.1 * i }));
  TL.fields.forEach((tt, i) => boop(tt + 0.05, 480 + i * 60, 0.5, 0.2, true));
  ticks(9.6, 10.5, 0.12, 600, 900, 0.3, 0.3); boop(TL.team + 0.1, 440, 0.9, 0.5, false); k.play('success', TL.handoff[0] + 0.1, { gain: 0.9, pan: 0.5 }); pluck(TL.chipHand + 0.1, 'C4', 0.7, 0, true);
  // 4 beyond answering
  k.play('riser', 11.0, { dur: 1.0, gain: 0.9 }); k.tone(11.0, { f: [[0, 110], [1.0, 330]], type: 'triangle', dur: 1.05, gain: 0.07, a: 0.8 }); k.play('impact', 12.0, { gain: 0.6 }); chord(12.05, ['A2', 'E3', 'A3'], 0.6, 1.4);
  pluck(TL.ag1 + 0.1, 'A3', 0.8, -0.3); pluck(TL.ag2 + 0.1, 'C4', 0.7, -0.3, true); boop(TL.agent + 0.2, 380, 0.8, 0.4, false);
  TL.sats.forEach((tt, i) => k.play('blip', tt + 0.35, { f: ['E6', 'G6', 'C7'][i], dur: 0.12, gain: 0.8, pan: 0.5, minor: true }));
  chord(TL.ag3, ['A2', 'E3', 'A3', 'C4', 'E4'], 1.1, 1.6); shimmer(TL.ag3 + 0.05, ['E5', 'A5', 'C6', 'E6'], 0.8, -0.3);
  air(TL.split[0], 0.8, 1700, 0.8, 0, 0.5);
  // 5 plan act verify
  ['C4', 'E4', 'G4'].forEach((n, i) => pluck(TL.pav[i] + 0.05, n, 0.9, (i - 1) * 0.35));
  ticks(TL.pl1[0], TL.pl1[1], 0.12, 500, 700, 0.3, -0.2); ticks(TL.pl2[0], TL.pl2[1], 0.12, 600, 800, 0.3, 0.2);
  air(TL.loop[0], 0.8, 1700, 0.7, 0, 0.5, true); pluck(TL.loopChip + 0.05, 'G4', 0.7, 0, true);
  TL.jobs.forEach((tt, i) => boop(tt + 0.1, [440, 520, 600][i], 0.6, (i - 1) * 0.3, true));
  // 6 tools
  air(TL.hubMove[0], 0.9, 1500, 0.8, 0, 0.5); pluck(TL.wired + 0.1, 'D4', 0.8, 0);
  TL.spokes.forEach((tt, i) => k.play('blip', tt + 0.25, { f: ['E5', 'G5', 'A5', 'C6', 'E6'][i], dur: 0.12, gain: 0.7, pan: (i - 2) * 0.3, minor: true }));
  TL.toolChips.forEach((tt, i) => k.play('tick', tt + 0.1, { gain: 0.5, pan: (i - 1.5) * 0.3, minor: true }));
  // 7 guardrails
  air(TL.push[0], 1.1, 1400, 1.1, 0, 0.5); k.play('thud', 24.7, { gain: 0.6, f: 110 }); pluck(TL.hl7 + 0.1, 'G3', 0.8, 0); boop(TL.action + 0.15, 400, 0.8, -0.4, true);
  ticks(TL.lk7a[0], TL.lk7a[1], 0.12, 500, 750, 0.3, -0.2); k.play('success', TL.pass, { gain: 0.9 }); k.play('thud', TL.pass, { gain: 0.4, f: 150 });
  ticks(TL.lk7b[0], TL.lk7b[1], 0.12, 600, 850, 0.3, 0.3); boop(TL.teamCard + 0.15, 460, 0.8, 0.4, true);
  TL.guardChips.forEach((tt, i) => k.play('tick', tt + 0.1, { gain: 0.5, pan: (i - 1) * 0.3, minor: true }));
  // 8 process
  air(TL.morph8[0], 0.9, 1500, 0.9, 0, 0.5); [27.7, 27.9, 28.1].forEach((tt, i) => boop(tt, [420, 500, 600][i], 0.8, (i - 1) * 0.4, true)); pluck(TL.hl8 + 0.1, 'E4', 0.8, 0);
  k.play('stamp', TL.chip8a + 0.1, { gain: 0.8, pan: -0.3 }); k.play('ding', TL.chip8b + 0.1, { f: 'E6', gain: 0.8, pan: 0.3 });
  // 9 call to action
  k.play('riser', TL.conv[0], { dur: 0.7, gain: 0.7 }); pluck(TL.logo + 0.05, 'A4', 0.8, 0); k.play('sparkle', TL.logo + 0.1, { gain: 0.7, n: 6 });
  chord(TL.btn, ['A2', 'E3', 'A3', 'C4', 'E4', 'B4'], 1.2, 2.6); pluck(TL.btnTxt + 0.1, 'E4', 0.8, 0, true); boop(TL.chipBook + 0.1, 520, 0.8, 0, true);
  k.play('typing', TL.url[0], { n: 17, rate: 0.047, gain: 0.8, minor: true }); shimmer(TL.url[1], ['E5', 'A5', 'C6', 'E6'], 0.7, 0);
}
window.DURATION = DURATION;
window.scoreSound = scoreSound;
