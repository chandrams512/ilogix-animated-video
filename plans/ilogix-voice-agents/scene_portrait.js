// ===== 9:16 layout (720x1280). Same timeline TL and the same sound score as the 16:9 cut; only positions change. =====
function explainerP(ctx, W, Hh, t) {
  const x = ctx;
  x.save();
  const z = 1 + 0.12 * Math.sin(Math.PI * seg(t, TL.push[0], TL.push[1]));
  x.translate(360, 640); x.scale(z, z); x.translate(-360, -640);
  S.bg(x, t);
  x.save(); x.globalAlpha = seg(t, 0.1, 0.5) * (1 - seg(t, 31.2, 31.6)); x.translate(0, 44); S.wordmark(x, false); x.restore();
  pop(x, 360, 210, pv(t, TL.logo, 0.5, 1.2), () => { x.save(); x.translate(-280, 90); S.wordmark(x, true); x.restore(); }, 1);

  const m1 = eio(seg(t, TL.move1[0], TL.move1[1])), m2 = eio(seg(t, TL.move2[0], TL.move2[1]));
  let py = lerp(440, 360, m1), pr = 50; py = lerp(py, 340, m2); pr = lerp(pr, 46, m2);
  const px = 360, pcol = mixc(S.pal.red, S.pal.cyan, m1);
  const ox = 360, oy = lerp(650, 490, m2), orr = lerp(115, 60, m2);
  const TEAM = [360, 900, 48];

  if (t < 12.05) {
    // BEAT 1
    const a1 = 1 - seg(t, 2.9, 3.4);
    ptext(x, 'Every missed call', 360, 205, 50, S.pal.ink, pv(t, TL.hl1[0], 0.4, 1.3), a1, { w: 800 });
    ptext(x, 'is a missed customer.', 360, 268, 50, S.pal.cyan, pv(t, TL.hl1[1], 0.4, 1.3), a1, { w: 800, glow: S.pal.cyan });
    const ringing = (t > 0.5 && t < 1.5) || (t > 1.9 && t < 2.9) ? 1 : 0.2;
    for (let i = 0; i < 3; i++) {
      x.save(); x.globalAlpha = a1 * ringing * seg(t, 0.4, 0.6) * (0.5 + 0.5 * Math.sin(t * 12 - i * 1.3)); x.strokeStyle = H.rgba(S.pal.red, 0.6 - 0.15 * i); x.lineWidth = 4; x.lineCap = 'round';
      const R = 205 + i * 26; x.beginPath(); x.arc(360, 490, R, -2.35, -1.95); x.stroke(); x.beginPath(); x.arc(360, 490, R, -1.19, -0.79); x.stroke(); x.restore();
    }
    pop(x, 360, 495, pv(t, TL.phone, 0.4), () => S.card(x, 255, 330, 210, 330, { col: S.pal.red, col2: S.pal.pink }), 1 - seg(t, 3.2, 3.6));
    pchip(x, 'Missed call', 360, 530, 20, pv(t, TL.chipMissed), 1 - seg(t, 3.2, 3.5), { col: S.pal.red });
    pop(x, 360, 585, 1, () => S.text(x, 'Unknown caller', 360, 585, 18, S.pal.mute, { mono: true, w: 500 }), seg(t, TL.unk, TL.unk + 0.3) * (1 - seg(t, 3.2, 3.5)));
    const ca = 1 - seg(t, 2.9, 3.3);
    pop(x, 300, 780, pv(t, TL.clock, 0.4), () => { S.text(x, '02:14', 300, 780, 120, S.pal.ink, { mono: true, w: 600, glow: S.pal.cyan }); S.text(x, 'AM', 492, 812, 36, S.pal.amber, { mono: true, w: 600, align: 'left' }); }, ca);
    pchip(x, 'after hours', 360, 870, 22, pv(t, TL.chipAfter), ca, { col: S.pal.amber });
    ptext(x, 'Nobody picks up.', 360, 945, 36, S.pal.mute, pv(t, TL.nobody), ca, { w: 600 });
    for (let i = 0; i < 2; i++) { const u = seg(t, TL.answer + i * 0.18, TL.answer + 0.9 + i * 0.18); if (u > 0 && u < 1) { x.save(); x.strokeStyle = H.rgba(S.pal.green, 0.8 * (1 - u)); x.lineWidth = 6 * (1 - u) + 1; x.beginPath(); x.arc(360, 440, lerp(50, 420, eo(u)), 0, TAU); x.stroke(); x.restore(); } }

    pop(x, px, py, pv(t, TL.node1, 0.35, 1.5), () => S.node(x, px, py, pr, pcol, t, { icon: S.icon.phone, ring: t < 3.3 }), 1);
    x.save(); x.globalAlpha = seg(t, TL.incoming, TL.incoming + 0.3) * (1 - seg(t, 6.6, 6.9)); S.text(x, 'Incoming call', 360 + 50 + 24, 360, 22, S.pal.ink, { w: 700, align: 'left' }); x.restore();
    x.save(); x.globalAlpha = seg(t, 7.5, 7.8); S.text(x, 'Caller', 360 + 46 + 24, 340, 26, S.pal.ink, { w: 700, align: 'left' }); x.restore();

    // BEAT 2
    const a2 = 1 - seg(t, 6.6, 7.0);
    ptext(x, 'Meet Maya', 360, 195, 66, S.pal.ink, pv(t, TL.meet, 0.4, 1.3), a2, { w: 800, glow: S.pal.violet });
    pchip(x, 'answers every call, 24/7', 360, 262, 22, pv(t, TL.chipAns), a2, { col: S.pal.green });
    plink(x, px, py + pr + 6, ox, oy - orr - 6, S.pal.cyan, t, seg(t, TL.link1[0], TL.link1[1]), { head: true });
    pop(x, ox, oy, pv(t, TL.orb, 0.45, 1.3), () => S.orb(x, ox, oy, orr, t, null), 1);
    x.save(); x.globalAlpha = seg(t, 7.7, 8.0); S.text(x, 'Maya', ox + orr + 24, oy, 26, S.pal.ink, { w: 700, align: 'left' }); x.restore();
    pchip(x, 'Maya · AI receptionist', 360, 800, 22, pv(t, TL.chipMaya), a2, { col: S.pal.violet });
    pop(x, 360, 905, pv(t, TL.bubble, 0.4, 1.4), () => {
      S.card(x, 100, 845, 520, 120, { col: S.pal.violet, col2: S.pal.cyan });
      S.text(x, 'MAYA', 135, 875, 16, S.pal.violet, { mono: true, align: 'left' }); S.text(x, 'Hi, you’ve reached iLogix.', 135, 912, 26, S.pal.ink, { align: 'left', w: 600 }); S.text(x, 'How can I help?', 135, 946, 26, S.pal.ink, { align: 'left', w: 600 });
    }, a2);

    // BEAT 3
    ptext(x, 'Maya collects', 360, 195, 54, S.pal.ink, pv(t, TL.hl3, 0.4, 1.3), 1, { w: 800 });
    ptext(x, 'the details', 360, 255, 54, S.pal.ink, pv(t, TL.hl3 + 0.1, 0.4, 1.3), 1, { w: 800 });
    ['Name', 'Phone number', 'Reason for calling'].forEach((s, i) => {
      const Y = 590 + i * 75, st = TL.fields[i];
      if (i === 0) plink(x, 360, 556, 360, 590, S.pal.violet, t, seg(t, st - 0.1, st + 0.3), { dots: 1 });
      pop(x, 360, Y + 31, pv(t, st, 0.35, 1.4), () => { S.card(x, 140, Y, 440, 62, { col: S.pal.green, col2: S.pal.cyan, r: 16 }); S.text(x, s, 215, Y + 31, 24, S.pal.ink, { align: 'left', w: 600 }); }, 1);
      pop(x, 177, Y + 31, pv(t, st + 0.3, 0.3, 2.0), () => { x.fillStyle = H.rgba(S.pal.green, 0.2); x.beginPath(); x.arc(177, Y + 31, 19, 0, TAU); x.fill(); S.icon.check(x, 177, Y + 31, 12, S.pal.green); }, 1);
    });
    plink(x, 360, 806, 360, TEAM[1] - TEAM[2] - 6, S.pal.green, t, seg(t, 9.6, 10.1), { dots: 1 });
    pop(x, TEAM[0], TEAM[1], pv(t, TL.team, 0.45, 1.4), () => S.node(x, TEAM[0], TEAM[1], TEAM[2], S.pal.green, t, { icon: S.icon.person, ring: true }), 1);
    x.save(); x.globalAlpha = seg(t, 10.1, 10.4); S.text(x, 'Your team', TEAM[0] + TEAM[2] + 22, TEAM[1], 26, S.pal.ink, { w: 700, align: 'left' }); x.restore();
    const hu = seg(t, TL.handoff[0], TL.handoff[1]); if (hu > 0 && hu < 1) glow(x, TEAM[0], TEAM[1], 130 + 200 * hu, S.pal.green, 0.55 * (1 - hu));
    pchip(x, 'then hands off to your team', 360, 990, 22, pv(t, TL.chipHand), 1, { col: S.pal.green });
  }

  // BEAT 4
  const S4 = [[110, 720, S.icon.mail, S.pal.violet], [610, 720, S.icon.cal, S.pal.amber], [360, 925, S.icon.check, S.pal.green]];
  if (t >= 12.05 && t < 15.7) {
    const a4 = 1 - seg(t, 14.2, 14.6);
    ptext(x, 'Agentic AI', 360, 230, 70, S.pal.ink, pv(t, TL.ag1, 0.4, 1.3), a4, { w: 800 });
    ptext(x, 'doesn’t just answer.', 360, 308, 44, S.pal.mute, pv(t, TL.ag2, 0.4, 1.3), a4, { w: 600 });
    ptext(x, 'It acts.', 360, 415, 96, S.pal.cyan, pv(t, TL.ag3, 0.5, 1.8), a4, { w: 800, glow: S.pal.cyan });
    S4.forEach(([sx, sy, ic, col], i) => {
      const fu = eo(seg(t, TL.sats[i], TL.sats[i] + 0.5)), cx = lerp(360, sx, fu), cy = lerp(720, sy, fu), a = Math.atan2(sy - 720, sx - 360);
      if (fu > 0.9) S.link(x, 360 + Math.cos(a) * 106, 720 + Math.sin(a) * 106, sx - Math.cos(a) * 52, sy - Math.sin(a) * 52, col, t, { head: true, dots: 1, ph: i * 0.25 });
      pop(x, cx, cy, fu > 0 ? 1 : 0, () => S.node(x, cx, cy, 44, col, t, { icon: ic, ph: i }), a4);
    });
    pop(x, 360, 720, pv(t, TL.agent, 0.45, 1.4), () => S.node(x, 360, 720, 96, S.pal.cyan, t, { icon: S.icon.bolt, ring: true }), 1 - seg(t, 14.3, 14.6));
  }

  // BEAT 5 (Verify becomes the hub in beat 6)
  const sp = eio(seg(t, TL.split[0], TL.split[1])), hm = eio(seg(t, TL.hubMove[0], TL.hubMove[1]));
  const NS = [[360, S.pal.cyan, S.icon.plan, 'Plan', 'break the goal into steps'], [560, S.pal.violet, S.icon.bolt, 'Act', 'use your tools'], [760, S.pal.green, S.icon.check, 'Verify', 'check before it counts']];
  if (t >= TL.split[0] && t < 27.8) {
    const a5 = 1 - seg(t, 19.1, 19.5);
    NS.forEach(([ny, col, ic, lab, sub], i) => {
      let cx = lerp(360, 300, sp), cy = lerp(720, ny, sp), r = lerp(56, 68, sp), ca = col, icon = ic, al = seg(t, TL.split[0], TL.split[0] + 0.25);
      if (i === 2) {
        cx = lerp(cx, 360, hm); cy = lerp(cy, 640, hm); r = lerp(r, 86, hm); ca = mixc(S.pal.green, S.pal.cyan, hm);
        icon = (xx, a, b, s, c) => { xx.save(); xx.globalAlpha *= 1 - hm; S.icon.check(xx, a, b, s, c); xx.restore(); xx.save(); xx.globalAlpha *= hm; S.icon.bolt(xx, a, b, s, c); xx.restore(); };
        if (t >= 20.1 && t < TL.collapse[0]) { cx = 360; cy = 640; r = 86; ca = S.pal.cyan; icon = S.icon.bolt; }
        if (t >= TL.collapse[0] && t < 27.8) { const cu = eio(seg(t, TL.collapse[0], TL.collapse[1])); cx = 360; cy = lerp(640, 560, cu); r = lerp(86, 90, cu); ca = mixc(S.pal.cyan, S.pal.green, cu); icon = (xx, a, b, s, c) => { xx.save(); xx.globalAlpha *= 1 - cu; S.icon.bolt(xx, a, b, s, c); xx.restore(); xx.save(); xx.globalAlpha *= cu; S.icon.shield(xx, a, b, s * 1.5, c); xx.restore(); }; }
      } else al *= a5 * (1 - seg(t, 19.1, 19.6));
      if (i === 2 && t >= 27.3) al = 1 - seg(t, 27.3, 27.7);
      pop(x, cx, cy, 1, () => S.node(x, cx, cy, r, ca, t, { icon, ring: true, ph: i }), al);
      if (t < 19.6) {
        x.save(); x.globalAlpha = seg(t, TL.pavLab[i], TL.pavLab[i] + 0.3) * a5; S.text(x, lab, 392, ny - 16, 34, S.pal.ink, { w: 700, align: 'left' }); x.restore();
        x.save(); x.globalAlpha = seg(t, TL.pavSub[i], TL.pavSub[i] + 0.3) * a5; S.text(x, sub, 392, ny + 26, 16, S.pal.mute, { mono: true, w: 500, align: 'left' }); x.restore();
        ptext(x, lab + '.', [130, 340, 570][i], 200, 50, [S.pal.cyan, S.pal.violet, S.pal.green][i], pv(t, TL.pav[i], 0.4, 1.4), a5, { w: 800 });
      }
    });
    if (t < 19.6) {
      x.save(); x.globalAlpha = a5;
      plink(x, 300, 360 + 68 + 6, 300, 560 - 68 - 6, S.pal.cyan, t, seg(t, TL.pl1[0], TL.pl1[1]), { head: true });
      plink(x, 300, 560 + 68 + 6, 300, 760 - 68 - 6, S.pal.violet, t, seg(t, TL.pl2[0], TL.pl2[1]), { head: true });
      const lp = seg(t, TL.loop[0], TL.loop[1]);
      if (lp > 0) {
        const pts = bezPts([[232, 760], [50, 760], [50, 360], [232, 360]], lp);
        x.strokeStyle = H.rgba(S.pal.green, 0.5); x.lineWidth = 3; x.lineCap = 'round'; x.setLineDash([10, 10]); x.beginPath(); pts.forEach((p, k) => (k ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.stroke(); x.setLineDash([]);
        if (lp > 0.97) { x.fillStyle = H.rgba(S.pal.cyan, 0.95); x.beginPath(); x.moveTo(228, 360); x.lineTo(208, 350); x.lineTo(208, 370); x.closePath(); x.fill(); }
      }
      x.restore();
      pchip(x, 'repeat until done', 150, 560, 18, pv(t, TL.loopChip), a5, { col: S.pal.green, solid: true });
      x.save(); x.globalAlpha = seg(t, TL.jobsLab, TL.jobsLab + 0.3) * a5; S.text(x, 'TYPICAL JOBS', 360, 905, 16, S.pal.mute, { mono: true }); x.restore();
      ['qualify leads', 'draft replies', 'triage support'].forEach((s, i) => pchip(x, s, [120, 350, 590][i], 960, 20, pv(t, TL.jobs[i]), a5, { col: [S.pal.cyan, S.pal.violet, S.pal.green][i] }));
    }
  }

  // BEAT 6
  const S6 = [[130, 470, S.icon.person, 'CRM', S.pal.cyan], [130, 810, S.icon.mail, 'Email', S.pal.violet], [590, 470, S.icon.chat, 'WhatsApp', S.pal.green], [590, 810, S.icon.cal, 'Calendar', S.pal.amber], [360, 900, S.icon.doc, 'Documents', S.pal.pink]];
  const cu6 = eio(seg(t, TL.collapse[0], TL.collapse[1]));
  if (t >= 19.7 && t < 24.9) {
    const a6 = 1 - seg(t, 23.7, 24.1);
    ptext(x, 'Wired into your tools', 360, 200, 48, S.pal.ink, pv(t, TL.wired, 0.4, 1.3), a6, { w: 800 });
    ['n8n', 'Make', 'GoHighLevel', 'Vapi'].forEach((s, i) => pchip(x, s, [187, 271, 398, 525][i], 275, 18, pv(t, TL.toolChips[i]), a6, { col: S.pal.mute }));
    const hy = lerp(640, 560, cu6);
    S6.forEach(([sx, sy, ic, lab, col], i) => {
      const st = TL.spokes[i], cx = lerp(sx, 360, cu6), cy = lerp(sy, hy, cu6), al = 1 - seg(t, 24.2, 24.7), a = Math.atan2(sy - 640, sx - 360);
      const lk = seg(t, st, st + 0.3) * (1 - cu6);
      if (lk > 0) S.link(x, 360 + Math.cos(a) * 92, 640 + Math.sin(a) * 92, lerp(360 + Math.cos(a) * 92, cx - Math.cos(a) * 58, lk), lerp(640 + Math.sin(a) * 92, cy - Math.sin(a) * 58, lk), col, t, { dots: 1, ph: i * 0.2 });
      pop(x, cx, cy, pv(t, st + 0.2, 0.35, 1.5), () => S.node(x, cx, cy, 50, col, t, { icon: ic, label: lab, ly: 38, lpx: 22, ph: i }), al * (1 - cu6 * 0.2));
    });
  }

  // BEAT 7
  if (t >= TL.collapse[1] - 0.2 && t < 27.7) {
    const a7 = 1 - seg(t, 27.2, 27.6);
    ptext(x, 'Guardrails keep', 360, 195, 52, S.pal.ink, pv(t, TL.hl7, 0.4, 1.3), a7, { w: 800 });
    ptext(x, 'it on track', 360, 255, 52, S.pal.ink, pv(t, TL.hl7 + 0.1, 0.4, 1.3), a7, { w: 800 });
    pop(x, 360, 380, pv(t, TL.action, 0.4, 1.4), () => { S.card(x, 110, 330, 500, 100, { col: S.pal.violet, col2: S.pal.cyan }); S.text(x, 'AGENT ACTION', 140, 356, 16, S.pal.violet, { mono: true, align: 'left' }); S.text(x, 'Draft reply', 140, 400, 32, S.pal.ink, { align: 'left', w: 700 }); }, a7);
    x.save(); x.globalAlpha = a7;
    plink(x, 360, 434, 360, 466, S.pal.violet, t, seg(t, TL.lk7a[0], TL.lk7a[1]), { head: true });
    plink(x, 360, 652, 360, 726, S.pal.green, t, seg(t, TL.lk7b[0], TL.lk7b[1]), { head: true });
    const pu = seg(t, TL.pass, TL.pass + 0.8); if (pu > 0 && pu < 1) glow(x, 360, 560, 130 + 230 * pu, S.pal.green, 0.5 * (1 - pu));
    x.restore();
    pchip(x, 'Guardrail check', 360, 690, 20, pv(t, 25.0, 0.3), a7, { col: S.pal.green, solid: true });
    pop(x, 360, 780, pv(t, TL.teamCard, 0.4, 1.4), () => { S.card(x, 110, 730, 500, 100, { col: S.pal.green, col2: S.pal.cyan }); S.text(x, 'YOUR TEAM', 140, 756, 16, S.pal.green, { mono: true, align: 'left' }); S.text(x, 'Stays in control', 140, 800, 32, S.pal.ink, { align: 'left', w: 700 }); }, a7);
    ['allowed actions only', 'approved data only', 'hand-off to a human'].forEach((s, i) => pchip(x, s, 360, 890 + i * 60, 20, pv(t, TL.guardChips[i]), a7, { col: S.pal.green }));
  }

  // BEAT 8
  const S8 = [['DISCOVER', 'Fixed-scope', 'quote', S.pal.cyan, S.icon.doc], ['BUILD', 'Weekly', 'working demos', S.pal.violet, S.icon.bolt], ['SCALE', 'Launch, training,', 'improvements', S.pal.green, S.icon.check]];
  if (t >= TL.morph8[0] && t < 32.0) {
    const mu = eio(seg(t, TL.morph8[0], TL.morph8[1])), cv = eio(seg(t, TL.conv[0], TL.conv[1])), a8 = 1 - seg(t, 31.0, 31.4);
    ptext(x, 'From idea to live', 360, 195, 52, S.pal.ink, pv(t, TL.hl8, 0.4, 1.3), a8, { w: 800 });
    ptext(x, 'in weeks', 360, 255, 52, S.pal.ink, pv(t, TL.hl8 + 0.1, 0.4, 1.3), a8, { w: 800 });
    S8.forEach(([a, b, c, col, ic], i) => {
      const Y = 320 + i * 180, fx = 360, fy = Y + 75;
      let cx = lerp(360, fx, mu), cy = lerp(560, fy, mu), s = lerp(0.2, 1, mu);
      cx = lerp(cx, 360, cv); cy = lerp(cy, 485, cv); s = lerp(s, 0.3, cv);
      const al = seg(t, TL.morph8[0], TL.morph8[0] + 0.2) * (1 - seg(t, 31.5, 31.9));
      x.save(); x.globalAlpha *= al; x.translate(cx, cy); x.scale(s, s); x.translate(-fx, -fy);
      S.card(x, 60, Y, 600, 150, { col, col2: S.pal.cyan });
      x.globalAlpha *= seg(t, TL.cardsTxt + i * 0.1, TL.cardsTxt + 0.3 + i * 0.1) * (1 - cv);
      ic(x, 590, Y + 75, 26, col); S.text(x, a, 95, Y + 36, 20, col, { mono: true, align: 'left' }); S.text(x, b, 95, Y + 82, 30, S.pal.ink, { align: 'left', w: 700 }); S.text(x, c, 95, Y + 120, 30, S.pal.ink, { align: 'left', w: 700 });
      x.restore();
      if (i < 2) plink(x, 360, Y + 152, 360, Y + 178, col, t, seg(t, TL.arrows8[0] + i * 0.2, TL.arrows8[1] + i * 0.2) * (1 - cv), { head: true, dots: 0 });
    });
    pchip(x, 'Fixed price, quoted upfront', 360, 880, 20, pv(t, TL.chip8a, 0.35, 2.2), a8, { col: S.pal.amber });
    pchip(x, 'Delivered in weeks', 360, 940, 20, pv(t, TL.chip8b, 0.35, 1.8), a8, { col: S.pal.green });
  }

  // BEAT 9
  if (t >= 31.2) {
    pchip(x, 'Engineering-led since 2015', 360, 290, 20, pv(t, TL.chipEng), 1, { col: S.pal.mute });
    pop(x, 360, 485, pv(t, TL.btn, 0.45, 1.3), () => { S.card(x, 60, 420, 600, 130, { col: S.pal.cyan, col2: S.pal.violet, r: 65 }); S.orb(x, 140, 485, 42, t, null); }, 1);
    ptext(x, 'Talk to Maya', 410, 485, 44, S.pal.ink, pv(t, TL.btnTxt, 0.4, 1.3), 1, { w: 800, glow: S.pal.cyan });
    pchip(x, 'Book a free discovery call', 360, 610, 24, pv(t, TL.chipBook, 0.4, 1.4), 1, { col: S.pal.violet, solid: true });
    const url = 'ilogixdigital.com', n = Math.floor(url.length * seg(t, TL.url[0], TL.url[1]));
    if (n > 0) { x.save(); x.font = mf(600, 32); const full = x.measureText(url).width; x.restore(); S.text(x, url.slice(0, n) + (t < TL.url[1] + 0.3 && Math.floor(t * 6) % 2 ? '|' : ''), 360 - full / 2, 695, 32, S.pal.cyan, { mono: true, w: 600, glow: S.pal.cyan, align: 'left' }); }
    x.save(); x.globalAlpha = seg(t, TL.tag, TL.tag + 0.5); S.text(x, 'Software, AI and growth systems', 360, 775, 22, S.pal.mute, { w: 500 }); S.text(x, 'for ambitious businesses.', 360, 810, 22, S.pal.mute, { w: 500 }); x.restore();
  }
  x.restore();

  const su = seg(t, TL.shock[0], TL.shock[1]);
  if (su > 0 && su < 1) { x.save(); x.strokeStyle = H.rgba(S.pal.cyan, 0.9 * (1 - su)); x.lineWidth = lerp(12, 3, su); x.shadowColor = S.pal.cyan; x.shadowBlur = 24; x.beginPath(); x.arc(TEAM[0], TEAM[1], lerp(TEAM[2], 1600, eo(su)), 0, TAU); x.stroke(); x.restore(); }
  twhite(x, seg(t, TL.white[0], TL.white[1]) * (1 - seg(t, TL.white[1], TL.white[2])));
  S.finish(x, t);
}
