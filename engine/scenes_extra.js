// ===== Extra scene types: testimonial, offer, pricing, checklist, beforeafter, endcard, phone =====
// Loaded after plan.js. Draws through S (the active style), so every style works. See docs/plan-format.md.
(function () {
  const font = (x, px) => { x.font = `800 ${px}px "Nunito", "Sora", system-ui, sans-serif`; };
  function star(x, cx, cy, r, col) { x.save(); x.fillStyle = col; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.45 : r; x.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); } x.closePath(); x.fill(); x.restore(); }
  const fade = (x, u, fn) => { x.save(); x.globalAlpha *= Math.min(1, Math.max(0, u)); fn(); x.restore(); };

  // draws an image/frame to cover a rounded card (or the whole frame with sc.full), with an optional title above and badge chip at the top right
  function mediaScene(x, g, sc, lt, im, badge, zoom) {
    const pal = S.pal, P = g.P, full = !!sc.full, W = g.bw, Hh = g.bh;
    const X = full ? 0 : (P ? 60 : 190), Y = full ? 0 : (sc.title ? (P ? 200 : 125) : (P ? 150 : 100)), w = full ? W : (P ? 600 : 900), h = full ? Hh : (P ? (sc.title ? 760 : 820) : (sc.title ? 440 : 480));
    if (sc.title && !full) fade(x, seg(lt, 0.1, 0.5), () => S.text(x, sc.title, g.C, P ? 150 : 90, P ? 44 : 40, pal.ink, { w: 800 }));
    popIn(x, X + w / 2, Y + h / 2, seg(lt, 0.05, 0.55), () => {
      x.save(); rr(x, X, Y, w, h, full ? 0 : 28); x.clip(); x.fillStyle = '#0b0d12'; x.fillRect(X, Y, w, h);
      if (im && im.complete && im.naturalWidth) { const k = Math.max(w / im.naturalWidth, h / im.naturalHeight) * (1 + zoom), dw = im.naturalWidth * k, dh = im.naturalHeight * k; x.drawImage(im, X + (w - dw) / 2, Y + (h - dh) / 2, dw, dh); }
      x.restore();
      if (!full) { x.save(); x.strokeStyle = H.rgba(pal.ink, 0.18); x.lineWidth = 2; rr(x, X, Y, w, h, 28); x.stroke(); x.restore(); }
    });
    if (badge) fade(x, seg(lt, 0.4, 0.8), () => S.chip(x, W - 40 - (String(badge).length * 6.2 + 24), P ? 56 : 54, badge, 22, { col: pal.amber, solid: true }));
  }


  // ---- stickman: code-drawn stick figures with poses, faces, props and speech bubbles (see docs/plan-format.md). Everything is a function of time.
  const POSES = ['idle', 'walk', 'run', 'wave', 'point', 'think', 'cheer', 'shock', 'dance', 'scroll', 'faint'];
  function rig(pose, t) {
    const B = { bob: 0, rot: 0, dx: 0, la: [-0.14, -0.1], ra: [0.14, 0.1], ll: [-0.07, 0], rl: [0.07, 0], face: 'smile', big: false };
    const sw = (w, a) => Math.sin(w) * a, w = pose === 'run' ? t * 13 : t * 7;
    if (pose === 'idle') { B.la = [-0.14 + sw(t * 2, 0.05), -0.1]; B.ra = [0.14 - sw(t * 2, 0.05), 0.1]; B.bob = sw(t * 2, 2); }
    else if (pose === 'walk' || pose === 'run') { const a = pose === 'run' ? 1.0 : 0.65, k = Math.sin(w); B.ll = [k * a, Math.max(0, -k) * 1.0]; B.rl = [-k * a, Math.max(0, k) * 1.0]; B.la = [-k * a * 0.9, -0.5 - Math.abs(k) * (pose === 'run' ? 0.9 : 0.2)]; B.ra = [k * a * 0.9, 0.5 + Math.abs(k) * (pose === 'run' ? 0.9 : 0.2)]; B.bob = -Math.abs(k) * (pose === 'run' ? 9 : 4); B.rot = pose === 'run' ? 0.14 : 0; }
    else if (pose === 'wave') { B.ra = [2.5, 2.5 + sw(t * 12, 0.6)]; B.la = [-0.16, -0.1]; }
    else if (pose === 'point') { B.ra = [1.5, 1.5]; B.la = [-0.2, -0.1]; B.face = 'grin'; }
    else if (pose === 'think') { B.ra = [0.9, -2.5]; B.la = [-0.2, -0.1]; B.face = 'flat'; B.bob = sw(t * 2, 1.5); }
    else if (pose === 'cheer') { B.la = [-2.1 - sw(t * 10, 0.15), -2.75]; B.ra = [2.1 + sw(t * 10, 0.15), 2.75]; B.ll = [-0.3, -0.1]; B.rl = [0.3, 0.1]; B.bob = -Math.abs(Math.sin(t * 8)) * 26; B.face = 'grin'; }
    else if (pose === 'shock') { B.la = [-2.2 + sw(t * 40, 0.08), -2.6]; B.ra = [2.2 - sw(t * 40, 0.08), 2.6]; B.ll = [-0.18, 0]; B.rl = [0.18, 0]; B.dx = sw(t * 70, 3); B.face = 'o'; B.big = true; }
    else if (pose === 'dance') { const k = Math.sin(t * 9); B.la = [-2.4 + k * 0.6, -2.6 + k * 0.5]; B.ra = [2.4 + k * 0.6, 2.6 + k * 0.5]; B.ll = [k * 0.4, Math.max(0, -k) * 0.6]; B.rl = [k * 0.4 + 0.2, Math.max(0, k) * 0.6]; B.rot = k * 0.1; B.bob = -Math.abs(k) * 14; B.face = 'grin'; }
    else if (pose === 'scroll') { B.la = [-0.9, 1.86 + sw(t * 5, 0.04)]; B.ra = [0.9, -1.86]; B.face = 'flat'; B.big = false; }
    else if (pose === 'faint') { const u = Math.min(1, Math.max(0, (t - 0.5) / 0.5)); B.rot = (u * u * (3 - 2 * u)) * 1.5; B.drop = (u * u * (3 - 2 * u)) * 82; B.la = [-0.5, -0.4]; B.ra = [0.5, 0.4]; B.face = u > 0.4 ? 'x' : 'o'; }
    return B;
  }
  function limb(x, px, py, a1, l1, a2, l2) { const mx = px + Math.sin(a1) * l1, my = py + Math.cos(a1) * l1, ex = mx + Math.sin(a2) * l2, ey = my + Math.cos(a2) * l2; x.beginPath(); x.moveTo(px, py); x.lineTo(mx, my); x.lineTo(ex, ey); x.stroke(); return [ex, ey]; }
  function drawStick(x, cx, hipY, s, f, t) {
    const pal = S.pal, B = rig(f.pose || 'idle', t), col = pal[f.col] || f.col || pal.ink, lw = 5.6 * s;
    x.save(); x.translate(cx + B.dx, hipY + (B.bob + (B.drop || 0)) * s); x.rotate(B.rot + (f.tilt || 0)); x.scale(s, s); x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = col; x.lineWidth = lw / s;
    limb(x, 0, 0, B.ll[0], 46, B.ll[1], 46); limb(x, 0, 0, B.rl[0], 46, B.rl[1], 46);
    x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -66); x.stroke();
    limb(x, 0, -60, B.la[0], 38, B.la[1], 36); const hand = limb(x, 0, -60, B.ra[0], 38, B.ra[1], 36);
    if ((f.pose === 'scroll') || f.prop === 'phone') { const sy = f.pose === 'scroll' ? -50 : hand[1], sx = f.pose === 'scroll' ? 0 : hand[0]; x.save(); x.translate(sx, sy); x.fillStyle = '#111'; x.strokeStyle = '#111'; rr(x, -13, -22, 26, 44, 5); x.fill(); const k = Math.floor(t * 6) % 4; x.fillStyle = [pal.cyan, pal.pink, pal.amber, pal.green][k]; rr(x, -10, -18, 20, 36, 3); x.fill(); x.restore(); }
    x.fillStyle = '#ffffff'; x.strokeStyle = col; x.lineWidth = lw / s; x.beginPath(); x.arc(0, -92, 24, 0, TAU); x.fill(); x.stroke();
    const d = '#111', face = f.face || B.face, er = B.big || f.big ? 6.5 : 3, ey = -96; x.fillStyle = d; x.strokeStyle = d; x.lineWidth = 3;
    if (face === 'x') { [-8, 8].forEach(ex => { x.beginPath(); x.moveTo(ex - 4, ey - 4); x.lineTo(ex + 4, ey + 4); x.moveTo(ex + 4, ey - 4); x.lineTo(ex - 4, ey + 4); x.stroke(); }); }
    else if (B.big || f.big) { [-8, 8].forEach(ex => { x.fillStyle = '#fff'; x.beginPath(); x.arc(ex, ey, er, 0, TAU); x.fill(); x.stroke(); x.fillStyle = d; x.beginPath(); x.arc(ex + Math.sin(t * 25) * 1.5, ey, 2.4, 0, TAU); x.fill(); }); }
    else if (face === 'flat' && f.pose === 'scroll') { [-8, 8].forEach(ex => { x.beginPath(); x.moveTo(ex - 4, ey + 1); x.lineTo(ex + 4, ey + 1); x.stroke(); }); }
    else { [-8, 8].forEach(ex => { x.beginPath(); x.arc(ex, ey, er, 0, TAU); x.fill(); }); }
    x.beginPath(); const my = -83;
    if (face === 'smile') { x.arc(0, my - 3, 8, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke(); }
    else if (face === 'grin') { x.arc(0, my - 4, 10, 0, Math.PI); x.closePath(); x.fill(); }
    else if (face === 'o') { x.arc(0, my, 5 + Math.abs(Math.sin(t * 20)) * 2, 0, TAU); x.fill(); }
    else if (face === 'sad') { x.arc(0, my + 6, 8, 1.15 * Math.PI, 1.85 * Math.PI); x.stroke(); }
    else { x.moveTo(-7, my); x.lineTo(7, my); x.stroke(); }
    x.restore();
  }
  function bubble(x, cx, cy, text, px, think) {
    x.save(); font(x, px); const w = x.measureText(text).width + 44, h = px + 34;
    x.fillStyle = '#ffffff'; x.strokeStyle = '#111'; x.lineWidth = 5; rr(x, cx - w / 2, cy - h / 2, w, h, 22); x.fill(); x.stroke();
    if (think) { [[cx - 10, cy + h / 2 + 14, 9], [cx - 24, cy + h / 2 + 34, 6]].forEach(([a, b, r]) => { x.beginPath(); x.arc(a, b, r, 0, TAU); x.fill(); x.stroke(); }); }
    else { x.beginPath(); x.moveTo(cx - 18, cy + h / 2 - 2); x.lineTo(cx - 6, cy + h / 2 + 26); x.lineTo(cx + 12, cy + h / 2 - 2); x.closePath(); x.fill(); x.stroke(); x.fillRect(cx - 16, cy + h / 2 - 5, 26, 6); }
    x.fillStyle = '#111'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, cx, cy + 2); x.restore();
  }
  function prop(x, k, cx, cy, s, t, p, sc) {
    const pal = S.pal; x.save(); x.translate(cx, cy); x.scale(s, s);
    if (k === 'clock') { x.fillStyle = '#fff'; x.strokeStyle = '#111'; x.lineWidth = 7; x.beginPath(); x.arc(0, 0, 60, 0, TAU); x.fill(); x.stroke(); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; x.beginPath(); x.moveTo(Math.sin(a) * 50, -Math.cos(a) * 50); x.lineTo(Math.sin(a) * 56, -Math.cos(a) * 56); x.stroke(); } const sp = p.fast ? 5 : 1; [[t * 0.6 * sp, 30, 6], [t * 7 * sp, 44, 4]].forEach(([a, l, w]) => { x.lineWidth = w; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.sin(a) * l, -Math.cos(a) * l); x.stroke(); }); }
    else if (k === 'brain') { const f = p.anim === 'shrink' ? 1 - 0.55 * Math.min(1, t / (sc._d * 0.8)) : 1; x.scale(f, f); x.fillStyle = '#ff9fc2'; x.strokeStyle = '#111'; x.lineWidth = 6; x.beginPath(); [[-28, -6, 32], [14, -16, 34], [34, 10, 28], [-8, 20, 32], [-34, 18, 24]].forEach(([a, b, r]) => x.arc(a, b, r, 0, TAU)); x.fill(); x.beginPath(); x.moveTo(-6, -34); x.quadraticCurveTo(10, -10, -4, 6); x.quadraticCurveTo(-18, 18, -2, 34); x.stroke(); }
    else if (k === 'sun') { x.rotate(t * 0.8); x.strokeStyle = pal.amber; x.lineWidth = 8; x.lineCap = 'round'; for (let i = 0; i < 10; i++) { const a = i * TAU / 10; x.beginPath(); x.moveTo(Math.cos(a) * 62, Math.sin(a) * 62); x.lineTo(Math.cos(a) * 84, Math.sin(a) * 84); x.stroke(); } x.fillStyle = pal.amber; x.beginPath(); x.arc(0, 0, 48, 0, TAU); x.fill(); }
    else if (k === 'heart') { const pu = 1 + Math.sin(t * 8) * 0.08; x.scale(pu, pu); x.fillStyle = pal.red; x.beginPath(); x.moveTo(0, 30); x.bezierCurveTo(-60, -10, -30, -52, 0, -22); x.bezierCurveTo(30, -52, 60, -10, 0, 30); x.fill(); }
    else if (k === 'coin') { x.rotate(Math.sin(t * 4) * 0.2); x.fillStyle = pal.amber; x.strokeStyle = '#111'; x.lineWidth = 6; x.beginPath(); x.arc(0, 0, 46, 0, TAU); x.fill(); x.stroke(); x.fillStyle = '#111'; x.font = '800 54px "Nunito", system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('₹', 0, 3); }
    else if (k === 'phone') { x.rotate(Math.sin(t * 30) * 0.05); x.fillStyle = '#111'; rr(x, -26, -46, 52, 92, 10); x.fill(); x.fillStyle = [pal.cyan, pal.pink, pal.amber][Math.floor(t * 6) % 3]; rr(x, -20, -38, 40, 76, 6); x.fill(); }
    x.restore();
  }

  Object.assign(SC, {
    testimonial(x, g, sc, lt) {
      const pal = S.pal, P = g.P, w = P ? 620 : 900, px = P ? 36 : 38, lh = px * 1.38, X = g.C - w / 2;
      x.save(); font(x, px); const lines = wrap(x, '“' + sc.quote + '”', w - 110); x.restore();
      const h = 80 + lines.length * lh + 120, Y = P ? Math.max(200, (980 - h) / 2) : Math.max(110, (580 - h) / 2);
      popIn(x, g.C, Y + h / 2, seg(lt, 0.1, 0.6), () => {
        S.card(x, X, Y, w, h, { col: pal.amber });
        const n = sc.stars == null ? 5 : sc.stars; for (let i = 0; i < n; i++) star(x, g.C - (n - 1) * 22 + i * 44, Y + 48, 17, pal.amber);
      });
      lines.forEach((ln, i) => fade(x, seg(lt, 0.5 + i * 0.22, 0.9 + i * 0.22), () => S.text(x, ln, g.C, Y + 80 + lh * (i + 0.5), px, pal.ink, { w: 800 })));
      const ny = Y + h - 62; fade(x, seg(lt, 0.9 + lines.length * 0.22, 1.3 + lines.length * 0.22), () => { S.text(x, sc.name, g.C, ny, P ? 32 : 32, pal.cyan, { w: 800 }); if (sc.role) S.text(x, sc.role, g.C, ny + 36, 22, pal.mute, { w: 700 }); });
    },
    offer(x, g, sc, lt) {
      const pal = S.pal, P = g.P, px = P ? 58 : 54, lh = px * 1.2;
      x.save(); font(x, px); const lines = wrap(x, sc.headline, P ? 620 : 1000); x.restore();
      const y0 = P ? 210 : 120, yEnd = y0 + (lines.length - 1) * lh;
      lines.forEach((ln, i) => popIn(x, g.C, y0 + i * lh, seg(lt, 0.1 + i * 0.25, 0.6 + i * 0.25), () => S.text(x, ln, g.C, y0 + i * lh, px, pal.ink, { w: 800 })));
      const py = yEnd + (P ? 200 : 150);
      if (sc.was) fade(x, seg(lt, 0.6, 1.0), () => S.text(x, 'Was ' + sc.was, g.C, py - (P ? 108 : 92), 30, pal.mute, { w: 700 }));
      if (sc.price) popIn(x, g.C, py, seg(lt, 0.7, 1.3), () => S.text(x, sc.price, g.C, py, P ? 150 : 130, pal.cyan, { w: 800, glow: pal.cyan }));
      let cy = py + (P ? 130 : 100);
      const chips = []; if (sc.code) chips.push(['Code ' + sc.code, pal.violet, true]); if (sc.deadline) chips.push([sc.deadline, pal.pink, false]);
      if (P) chips.forEach((c, i) => { const yy = cy + i * 78; popIn(x, g.C, yy, seg(lt, 1.2 + i * 0.3, 1.7 + i * 0.3), () => S.chip(x, g.C, yy, c[0], 28, { col: c[1], solid: c[2] })); }), cy += chips.length * 78;
      else chips.forEach((c, i) => { const xx = g.C + (i - (chips.length - 1) / 2) * 340; popIn(x, xx, cy, seg(lt, 1.2 + i * 0.3, 1.7 + i * 0.3), () => S.chip(x, xx, cy, c[0], 28, { col: c[1], solid: c[2] })); }), cy += chips.length ? 82 : 0;
      if (sc.button) popIn(x, g.C, cy + 8, seg(lt, 1.8, 2.3), () => S.chip(x, g.C, cy + 8, sc.button, 32, { col: pal.green, solid: true }));
    },
    pricing(x, g, sc, lt) {
      const pal = S.pal, cols = COLS(), P = g.P, n = sc.plans.length;
      if (sc.title) S.text(x, sc.title, g.C, P ? 150 : 80, P ? 48 : 42, pal.ink, { w: 800 });
      sc.plans.forEach((pl, i) => {
        const col = cols[i % cols.length], u = seg(lt, 0.3 + i * 0.35, 0.9 + i * 0.35);
        if (P) { const h = n === 3 ? 238 : 300, w = 620, X = g.C - w / 2, Y = 220 + i * (h + 24);
          popIn(x, g.C, Y + h / 2, u, () => { S.card(x, X, Y, w, h, { col }); S.text(x, pl.name, X + 32, Y + 58, 36, pal.ink, { align: 'left', w: 800 }); if (pl.hot) S.chip(x, X + w - 100, Y + 52, 'Popular', 20, { col: pal.pink, solid: true });
            S.text(x, pl.price, X + 32, Y + 128, 62, col, { align: 'left', w: 800 }); if (pl.per) S.text(x, pl.per, X + 32 + 14 + (String(pl.price).length * 34), Y + 140, 24, pal.mute, { align: 'left', w: 700 });
            if ((pl.items || []).length) S.text(x, pl.items.join('  \u00b7  '), X + 32, Y + h - 38, 23, pal.mute, { align: 'left', w: 700 }); }); }
        else { const w = Math.min(380, (1160 - 24 * (n - 1)) / n), h = 400, X = g.C - (n * w + (n - 1) * 24) / 2 + i * (w + 24), Y = 140;
          popIn(x, X + w / 2, Y + h / 2, u, () => { S.card(x, X, Y, w, h, { col }); S.text(x, pl.name, X + 28, Y + 56, 32, pal.ink, { align: 'left', w: 800 }); if (pl.hot) S.chip(x, X + w - 84, Y + 52, 'Popular', 18, { col: pal.pink, solid: true });
            S.text(x, pl.price, X + 28, Y + 130, 64, col, { align: 'left', w: 800 }); if (pl.per) S.text(x, pl.per, X + 28, Y + 182, 24, pal.mute, { align: 'left', w: 700 });
            (pl.items || []).forEach((it, j) => { ICONS().check(x, X + 36, Y + 245 + j * 46, 12, col); S.text(x, it, X + 62, Y + 245 + j * 46, 24, pal.ink, { align: 'left', w: 700 }); }); }); }
      });
    },
    checklist(x, g, sc, lt) {
      const pal = S.pal, cols = COLS(), P = g.P, n = sc.items.length, rowH = P ? 92 : 70, w = P ? 620 : 860, X = g.C - w / 2, Y = P ? 240 : 150, h = n * rowH + 56;
      if (sc.title) S.text(x, sc.title, g.C, P ? 150 : 80, P ? 48 : 42, pal.ink, { w: 800 });
      popIn(x, g.C, Y + h / 2, seg(lt, 0.1, 0.6), () => S.card(x, X, Y, w, h, { col: pal.green }));
      sc.items.forEach((it, i) => { const yy = Y + 28 + rowH * (i + 0.5), u = seg(lt, 0.5 + i * 0.4, 0.95 + i * 0.4), txt = typeof it === 'string' ? it : it.text;
        popIn(x, X + 56, yy, u, () => S.node(x, X + 56, yy, P ? 26 : 22, cols[i % cols.length], lt, { icon: pickIcon('check'), ph: i }));
        fade(x, u, () => S.text(x, txt, X + 100, yy, P ? 31 : 30, pal.ink, { align: 'left', w: 800 })); });
    },
    beforeafter(x, g, sc, lt) {
      const pal = S.pal, P = g.P, B = sc.before, A = sc.after;
      if (sc.title) S.text(x, sc.title, g.C, P ? 140 : 80, P ? 46 : 42, pal.ink, { w: 800 });
      const w = P ? 600 : 520, h = P ? 270 : 330, pos = (i) => P ? [g.C - w / 2, 220 + i * (h + 130)] : [g.C - w - 70 + i * (w + 140), 150];
      [[B, pal.red], [A, pal.green]].forEach(([s, col], i) => { const [X, Y] = pos(i); popIn(x, X + w / 2, Y + h / 2, seg(lt, 0.2 + i * 0.7, 0.8 + i * 0.7), () => {
        S.card(x, X, Y, w, h, { col }); S.chip(x, X + 80, Y + 46, s.label, 22, { col, solid: true }); S.text(x, s.value, X + w / 2, Y + h * 0.55, P ? 104 : 96, col, { w: 800, glow: col }); if (s.note) S.text(x, s.note, X + w / 2, Y + h - 44, 26, pal.mute, { w: 700 }); }); });
      const a = pos(0), b = pos(1), u = seg(lt, 0.9, 1.4);
      if (u > 0) { if (P) S.link(x, g.C, a[1] + h + 14, g.C, lerp(a[1] + h + 14, b[1] - 14, u), pal.cyan, lt, { head: u > 0.95, dots: 1 }); else S.link(x, a[0] + w + 14, a[1] + h / 2, lerp(a[0] + w + 14, b[0] - 14, u), a[1] + h / 2, pal.cyan, lt, { head: u > 0.95, dots: 1 }); }
    },
    endcard(x, g, sc, lt) {
      const pal = S.pal, P = g.P, qr = sc.qrMatrix, rows = [['phone', sc.phone], ['mail', sc.email], ['chat', sc.web]].filter((r) => r[1]);
      const px = P ? 60 : 56, lh = px * 1.2, ax = P ? g.C : 120, al = P ? 'center' : 'left', y0 = P ? 190 : 150;
      sc.lines.forEach((ln, i) => popIn(x, ax, y0 + i * lh, seg(lt, 0.1 + i * 0.3, 0.6 + i * 0.3), () => S.text(x, ln, ax, y0 + i * lh, px, i === sc.lines.length - 1 && sc.lines.length > 1 ? pal.cyan : pal.ink, { align: al, w: 800, glow: i === sc.lines.length - 1 && sc.lines.length > 1 ? pal.cyan : undefined })));
      let yy = y0 + sc.lines.length * lh + (P ? 20 : 30);
      if (qr) { const size = P ? 250 : 300, n = qr.length, m = size / n, qx = P ? g.C - size / 2 : 880, qy = P ? yy : 190;
        popIn(x, qx + size / 2, qy + size / 2, seg(lt, 0.7, 1.2), () => { x.fillStyle = '#ffffff'; rr(x, qx - 16, qy - 16, size + 32, size + 32, 16); x.fill(); x.fillStyle = '#101218'; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr[r][c] === '1') x.fillRect(qx + c * m, qy + r * m, m + 0.6, m + 0.6); });
        if (P) yy += size + 70; }
      rows.forEach((r, i) => { const ry = P ? yy + i * 66 : yy + 20 + i * 70, rx = P ? g.C - 270 : 120; fade(x, seg(lt, 1.0 + i * 0.25, 1.4 + i * 0.25), () => { ICONS()[r[0]](x, rx + 18, ry, 17, pal.cyan); S.text(x, r[1], rx + 54, ry, P ? 30 : 32, pal.ink, { align: 'left', w: 700 }); }); });
      if (sc.tagline) fade(x, seg(lt, 1.6, 2.0), () => S.text(x, sc.tagline, ax, P ? Math.min(960, yy + rows.length * 66 + 30) : 480, 26, pal.mute, { align: al, w: 700 }));
    },
    // ---- media scenes: 'clip' (video, sampled into frames by build.py) and 'image' (a still with a slow zoom). Both can carry a badge.
    clip(x, g, sc, lt) { mediaScene(x, g, sc, lt, sc._fr ? sc._fr[Math.min(sc._fr.length - 1, Math.floor(lt * sc.fps))] : null, sc.badge === undefined ? 'AI-generated' : sc.badge, 0.03); },
    image(x, g, sc, lt) { mediaScene(x, g, sc, lt, sc._img, sc.badge || '', 0.08 * Math.min(1, lt / sc._d)); },
    // ---- product: the real product photo (ideally a transparent PNG cut-out) floating over a glow, with callouts, a price and a badge. The photo is only moved and scaled, never redrawn, so packaging, logo and label stay exact.
    product(x, g, sc, lt) {
      const pal = S.pal, P = g.P, im = sc._img, cols = COLS(), calls = (sc.callouts || []).slice(0, 3);
      const bw = P ? 560 : 400, bh = P ? 450 : 400, cx = P ? g.C : 340, cy = P ? 425 : 330, u = seg(lt, 0.1, 0.8), bob = Math.sin(lt * 1.7) * (P ? 9 : 8), sway = Math.sin(lt * 1.1) * 0.025, zoom = 1 + 0.05 * Math.min(1, lt / sc._d);
      const colX = P ? g.C : 940;  // callouts and price share one column: centred under the product (portrait) or to its right (landscape)
      if (sc.title) fade(x, seg(lt, 0.1, 0.5), () => S.text(x, sc.title, P ? g.C : cx + 50, P ? 150 : 90, P ? 46 : 40, pal.ink, { w: 800 }));
      fade(x, u, () => { const r = bw * 0.8, gr = x.createRadialGradient(cx, cy, 10, cx, cy, r); gr.addColorStop(0, H.rgba(pal.cyan, 0.32)); gr.addColorStop(1, H.rgba(pal.cyan, 0)); x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(cx, cy + bh / 2 + 24, bw * 0.34 * (1 - bob / 90), 14, 0, 0, TAU); x.fill(); });
      popIn(x, cx, cy, u, () => {
        if (!(im && im.complete && im.naturalWidth)) return;
        const k = Math.min(bw / im.naturalWidth, bh / im.naturalHeight) * zoom, dw = im.naturalWidth * k, dh = im.naturalHeight * k;
        x.save(); x.translate(cx, cy + bob); x.rotate(sway); x.shadowColor = 'rgba(0,0,0,0.38)'; x.shadowBlur = 36; x.shadowOffsetY = 18; x.drawImage(im, -dw / 2, -dh / 2, dw, dh); x.restore();
      });
      const c0 = P ? 722 : 190, cstep = P ? 56 : 74;
      calls.forEach((c, i) => { const t0 = 0.9 + i * 0.45, y = c0 + i * cstep; popIn(x, colX, y, seg(lt, t0, t0 + 0.45), () => S.chip(x, colX, y, c.text || c, P ? 26 : 28, { col: cols[i % cols.length], solid: true })); });
      if (sc.price) {
        const py = P ? 935 : 480; popIn(x, colX, py, seg(lt, 1.2 + calls.length * 0.15, 1.7 + calls.length * 0.15), () => { if (sc.was) S.text(x, 'Was ' + sc.was, colX, py - (P ? 50 : 62), 26, pal.mute, { w: 700 }); S.text(x, sc.price, colX, py, P ? 74 : 84, pal.cyan, { w: 800, glow: pal.cyan }); });
      }
      if (sc.badge) fade(x, seg(lt, 0.4, 0.8), () => S.chip(x, g.bw - 40 - (String(sc.badge).length * 6.2 + 24), P ? 56 : 54, sc.badge, 22, { col: pal.amber, solid: true }));
    },
    // ---- logo: the brand logo large on a white plate (works on any style, even with dark lettering), with optional lines under it. For greetings, sign-offs and festival posts.
    logo(x, g, sc, lt) {
      const pal = S.pal, P = g.P, im = LOGO_IMG, cw = P ? 600 : 560, ch = P ? 300 : 280, cx = g.C, cy = P ? 500 : 280, u = seg(lt, 0.1, 0.7);
      popIn(x, cx, cy, u, () => {
        x.save(); x.shadowColor = H.rgba(pal.cyan, 0.55); x.shadowBlur = 60; x.fillStyle = '#ffffff'; rr(x, cx - cw / 2, cy - ch / 2, cw, ch, 38); x.fill(); x.restore();
        if (im && im.complete && im.naturalWidth) { const k = Math.min((cw - 90) / im.naturalWidth, (ch - 60) / im.naturalHeight), dw = im.naturalWidth * k, dh = im.naturalHeight * k; x.drawImage(im, cx - dw / 2, cy - dh / 2, dw, dh); }
        else S.text(x, BRAND.logoText || BRAND.name || '', cx, cy, 64, '#1c2540', { w: 800 });
      });
      (sc.lines || []).forEach((ln, i, a) => { const y = cy + ch / 2 + (P ? 110 : 80) + i * (P ? 64 : 56); popIn(x, g.C, y, seg(lt, 0.7 + i * 0.3, 1.2 + i * 0.3), () => S.text(x, ln, g.C, y, P ? 44 : 40, i === a.length - 1 && a.length > 1 ? pal.cyan : pal.ink, { w: 800, glow: i === a.length - 1 && a.length > 1 ? pal.cyan : undefined })); });
    },
    stickman(x, g, sc, lt) {
      const pal = S.pal, P = g.P, figs = (sc.figures || []).slice(0, 3), gy = P ? 880 : 560, s = (sc.size || 1) * (P ? (figs.length > 1 ? 1.8 : 2.6) : 1.6), hipY = gy - 92 * s;
      const sh = sc.shake ? Math.sin(lt * 90) * sc.shake : 0, zm = 1 + (sc.zoom || 0) * Math.min(1, lt / sc._d);
      x.save(); x.translate(g.C + sh, gy - 300); x.scale(zm, zm); x.translate(-g.C, -(gy - 300));
      if (sc.ground !== false) { x.save(); x.strokeStyle = H.rgba(pal.ink, 0.35); x.lineWidth = 5; x.lineCap = 'round'; x.beginPath(); x.moveTo(g.C - (P ? 330 : 520), gy + 4); x.lineTo(g.C + (P ? 330 : 520), gy + 4); x.stroke(); x.restore(); }
      (sc.props || []).forEach(p => { const u = seg(lt, p.at || 0.2, (p.at || 0.2) + 0.4); popIn(x, p.x * g.bw, p.y * g.bh, u, () => prop(x, p.k, p.x * g.bw, p.y * g.bh, (p.s || 1) * (P ? 1 : 0.8), lt, p, sc)); });
      if ((sc.props || []).some(p => p.k === 'grass')) { x.save(); x.fillStyle = pal.green; for (let i = -9; i <= 9; i++) { const bx = g.C + i * 38, hh = 26 + ((i * 7) % 5 + 5) * 3 + Math.sin(lt * 3 + i) * 3; x.beginPath(); x.moveTo(bx - 12, gy + 4); x.lineTo(bx - 2, gy + 4 - hh); x.lineTo(bx + 4, gy + 4); x.lineTo(bx + 10, gy + 4 - hh * 0.7); x.lineTo(bx + 18, gy + 4); x.fill(); } x.restore(); }
      figs.forEach((f, i) => {
        const at = f.at == null ? (figs.length === 1 ? 0.5 : 0.25 + i * 0.5 / Math.max(1, figs.length - 1)) : f.at, to = f.to == null ? at : f.to, mv = seg(lt, 0, sc._d * 0.9), fx = (at + (to - at) * mv) * g.bw, u = seg(lt, 0.05 + i * 0.1, 0.45 + i * 0.1);
        popIn(x, fx, gy - 150 * s, u, () => drawStick(x, fx, hipY, s * (f.size || 1), f, lt));
        if (f.say) {
          const fs = s * (f.size || 1), headY = gy - 184 * fs, above = headY - 26 * fs - 110, bu = seg(lt, (f.sayAt || 0.5), (f.sayAt || 0.5) + 0.3);
          const top = above > (P ? 340 : 190), bxc = top ? Math.min(g.bw - 170, Math.max(170, fx)) : fx + (fx > g.bw / 2 ? -1 : 1) * (P ? 230 : 220), byc = top ? above : headY - 30;
          popIn(x, bxc, byc, bu, () => bubble(x, bxc, byc, f.say, P ? 34 : 32, f.think));
        }
      });
      x.restore();
      const px = (P ? 62 : 54) * (sc.scale || 1), lines = (sc.lines || []).slice(0, 2);
      lines.forEach((ln, i) => { const y = (P ? 190 : 80) + i * px * 1.12, hot = i === lines.length - 1 && lines.length > 1; popIn(x, g.C, y, seg(lt, 0.02 + i * 0.12, 0.35 + i * 0.12), () => S.text(x, ln, g.C + (sc.shake ? Math.sin(lt * 80 + i) * sc.shake * 0.6 : 0), y, px, hot ? pal.cyan : pal.ink, { w: 800, glow: hot ? pal.cyan : undefined })); });
      if (sc.flash) { const fa = 1 - seg(lt, 0, 0.18); if (fa > 0) { x.save(); x.globalAlpha = fa * 0.9; x.fillStyle = '#fff'; x.fillRect(0, 0, g.bw, g.bh); x.restore(); } }
    },
    // ---- shot: a full-bleed still for story videos (horror, mystery, documentary). Slow push/pull/pan, shake, flashes, fog, flicker, tint and a vignette. Captions come from the scene's `say` line as usual. A missing image shows a labelled dark placeholder.
    shot(x, g, sc, lt) {
      const W = g.bw, Hh = g.bh, d = sc._d, u = Math.min(1, lt / d), im = sc._img, amt = sc.amt == null ? 0.12 : sc.amt, mv = sc.move || 'in', pal = S.pal;
      const ok = im && im.complete && im.naturalWidth;
      let sx = 0, sy = 0, zoom = 1;
      if (mv === 'in') zoom = 1 + amt * u; else if (mv === 'out') zoom = 1 + amt * (1 - u); else zoom = 1 + amt;
      const pan = (u - 0.5) * amt * (mv === 'left' || mv === 'up' ? -1 : 1);
      if (mv === 'left' || mv === 'right') sx = pan * W; if (mv === 'up' || mv === 'down') sy = pan * Hh;
      if (sc.shake && lt >= (sc.shakeFrom || 0) && lt <= (sc.shakeTo == null ? d : sc.shakeTo)) { sx += Math.sin(lt * 91) * sc.shake; sy += Math.cos(lt * 77) * sc.shake; }
      x.save(); x.beginPath(); x.rect(0, 0, W, Hh); x.clip();
      const tint = sc.tint; if (ok && tint === 'sepia') x.filter = 'sepia(0.95) contrast(1.05)'; else if (ok && tint === 'night') x.filter = 'grayscale(1) contrast(1.25) brightness(0.9)'; else if (ok && tint === 'cold') x.filter = 'saturate(0.7) hue-rotate(10deg)';
      if (ok) { const k = Math.max(W / im.naturalWidth, Hh / im.naturalHeight) * zoom, dw = im.naturalWidth * k, dh = im.naturalHeight * k; x.drawImage(im, (W - dw) / 2 + sx, (Hh - dh) / 2 + sy, dw, dh); }
      else { const gr = x.createLinearGradient(0, 0, 0, Hh); gr.addColorStop(0, '#0d1b24'); gr.addColorStop(1, '#05070b'); x.fillStyle = gr; x.fillRect(0, 0, W, Hh); x.fillStyle = 'rgba(255,255,255,0.35)'; x.font = '700 34px "Nunito", system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('[image: ' + (sc.imageName || sc.label || 'missing') + ']', W / 2, Hh / 2); }
      x.filter = 'none';
      if (ok && tint === 'night') { x.save(); x.globalCompositeOperation = 'multiply'; x.fillStyle = 'rgb(120,255,150)'; x.fillRect(0, 0, W, Hh); x.restore(); }
      if (sc.fog) { for (let i = 0; i < 3; i++) { const fx = ((lt * 18 * (i + 1) + i * 400) % (W + 600)) - 300, fy = Hh * (0.55 + i * 0.15), gr = x.createRadialGradient(fx, fy, 10, fx, fy, 420); gr.addColorStop(0, 'rgba(205,215,225,' + 0.13 * sc.fog + ')'); gr.addColorStop(1, 'rgba(205,215,225,0)'); x.fillStyle = gr; x.fillRect(0, 0, W, Hh); } }
      const vg = sc.vignette == null ? 0.6 : sc.vignette; if (vg > 0) { const gr = x.createRadialGradient(W / 2, Hh / 2, Math.min(W, Hh) * 0.25, W / 2, Hh / 2, Math.max(W, Hh) * 0.75); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,' + vg + ')'); x.fillStyle = gr; x.fillRect(0, 0, W, Hh); }
      if (sc.flicker) { const a = sc.flicker * Math.max(0, Math.sin(lt * 37) * Math.sin(lt * 13) + 0.2); x.fillStyle = 'rgba(0,0,0,' + a + ')'; x.fillRect(0, 0, W, Hh); }
      (sc.flashAt || []).forEach(t => { const a = 1 - (lt - t) / 0.2; if (lt >= t && a > 0) { x.fillStyle = 'rgba(255,255,255,' + 0.85 * a + ')'; x.fillRect(0, 0, W, Hh); } });
      const fi = sc.fadeIn == null ? 0.4 : sc.fadeIn; if (fi > 0 && lt < fi) { x.fillStyle = 'rgba(0,0,0,' + (1 - lt / fi) + ')'; x.fillRect(0, 0, W, Hh); }
      x.restore();
      if (sc.text) { const ta = sc.textAt || 0.6, v = seg(lt, ta, ta + 0.4); if (v > 0) popIn(x, g.C, g.P ? 360 : 200, v, () => S.text(x, sc.text, g.C, g.P ? 360 : 200, (g.P ? 84 : 76) * (sc.textScale || 1), '#f2f2f2', { w: 800, glow: pal.red })); }
    },
    phone(x, g, sc, lt) {
      const pal = S.pal, P = g.P; 
      const pw = P ? 380 : 232, ph = P ? 760 : 470, px0 = P ? g.C - pw / 2 : 280, py0 = P ? 190 : 80;
      popIn(x, px0 + pw / 2, py0 + ph / 2, seg(lt, 0.1, 0.7), () => {
        x.fillStyle = 'rgba(0,0,0,0.35)'; rr(x, px0 + 8, py0 + 18, pw, ph, 44); x.fill();
        x.fillStyle = '#12151c'; rr(x, px0, py0, pw, ph, 44); x.fill();
        x.save(); rr(x, px0 + 14, py0 + 14, pw - 28, ph - 28, 32); x.clip(); x.fillStyle = '#ffffff'; x.fillRect(px0, py0, pw, ph);
        const im = sc._img; if (im.complete && im.naturalWidth) { const sw = pw - 28, sh = ph - 28, k = Math.max(sw / im.naturalWidth, sh / im.naturalHeight) * (1 + 0.04 * seg(lt, 0.6, sc._d)); const dw = im.naturalWidth * k, dh = im.naturalHeight * k; x.drawImage(im, px0 + 14 + (sw - dw) / 2, py0 + 14 + (sh - dh) * 0.15, dw, dh); }
        x.restore(); x.fillStyle = '#12151c'; rr(x, px0 + pw / 2 - 52, py0 + 22, 104, 24, 12); x.fill(); });
      if (sc.title) fade(x, seg(lt, 0.6, 1.1), () => { if (P) S.text(x, sc.title, g.C, 120, 46, pal.ink, { w: 800 }); else { x.save(); font(x, 52); const ls = wrap(x, sc.title, 560); x.restore(); ls.forEach((l, i) => S.text(x, l, 640, 190 + i * 62, 52, pal.ink, { align: 'left', w: 800 })); if (sc.caption) S.text(x, sc.caption, 640, 190 + ls.length * 62 + 20, 28, pal.mute, { align: 'left', w: 700 }); } });
      if (P && sc.caption) fade(x, seg(lt, 0.9, 1.4), () => S.text(x, sc.caption, g.C, 990, 28, pal.mute, { w: 700 }));
    },
  });
  window.PRELOAD = window.PRELOAD || [];
  // library sounds (plan "sfx"): decode the embedded pack once; AudioBuffers can be used by any audio context
  if (window.SFX_PACK) { window.SFX_BUF = {}; const AC = window.OfflineAudioContext || window.webkitOfflineAudioContext; Object.keys(window.SFX_PACK).forEach((c) => { try { const bin = atob(window.SFX_PACK[c].split(',')[1]), u8 = new Uint8Array(bin.length); for (let q = 0; q < bin.length; q++) u8[q] = bin.charCodeAt(q); window.PRELOAD.push(new AC(1, 1, 44100).decodeAudioData(u8.buffer).then((b) => { window.SFX_BUF[c] = b; }).catch(() => {})); } catch (e) { /* missing cue: synthesized fallback plays */ } }); }
  const load = (src) => { const im = new Image(); im.src = src; window.PRELOAD.push(im.decode ? im.decode().catch(() => {}) : Promise.resolve()); return im; };
  PLAN.scenes.forEach((sc) => { if ((sc.type === 'phone' || sc.type === 'image' || sc.type === 'product' || sc.type === 'shot') && sc.image) { sc.imageName = String(sc.imageName || sc.label || ''); sc._img = load(sc.image); } if (sc.type === 'clip' && sc.frames) sc._fr = sc.frames.map(load); });
  const SND = {
    testimonial: (k, sc, T0) => { k.play('cue:receive', T0 + 0.2, { gain: 0.8 }); k.play('sparkle', T0 + 0.6, { gain: 0.6, n: 5 }); },
    offer: (k, sc, T0) => { k.play('impact', T0 + 0.15, { gain: 0.5 }); k.play('riser', T0 + 0.5, { dur: 0.8, gain: 0.5 }); k.play('cue:coupon', T0 + 1.3, { gain: 0.9 }); if (sc.button) k.play('ding', T0 + 1.9, { f: 'E6', gain: 0.6 }); },
    pricing: (k, sc, T0) => sc.plans.forEach((_, j) => { k.play('pop', T0 + 0.35 + j * 0.35, { gain: 0.9, pan: (j - (sc.plans.length - 1) / 2) * 0.3 }); k.play('ding', T0 + 0.5 + j * 0.35, { f: ['E6', 'G6', 'C7'][j % 3], gain: 0.55 }); }),
    checklist: (k, sc, T0) => { sc.items.forEach((_, j) => k.play('cue:check', T0 + 0.55 + j * 0.4, { gain: 0.8 })); k.play('success', T0 + 0.9 + sc.items.length * 0.4, { gain: 0.8 }); },
    beforeafter: (k, sc, T0) => { k.play('pop', T0 + 0.25, { gain: 0.8 }); k.play('riser', T0 + 0.6, { dur: 0.6, gain: 0.45 }); k.play('cue:undo', T0 + 0.95, { gain: 0.9 }); k.play('success', T0 + 1.5, { gain: 0.8 }); },
    endcard: (k, sc, T0) => { k.play('impact', T0 + 0.12, { gain: 0.5 }); k.play('sparkle', T0 + 0.5, { gain: 0.7, n: 6 }); k.play('cue:achievement', T0 + 1.3, { gain: 0.8 }); },
    clip: (k, sc, T0) => { k.play('pop', T0 + 0.15, { gain: 0.8 }); k.play('sparkle', T0 + 0.5, { gain: 0.5, n: 4 }); },
    image: (k, sc, T0) => { k.play('pop', T0 + 0.15, { gain: 0.8 }); },
    product: (k, sc, T0) => { k.play('impact', T0 + 0.1, { gain: 0.45 }); k.play('sparkle', T0 + 0.5, { gain: 0.6, n: 5 }); (sc.callouts || []).forEach((_, j) => k.play('pop', T0 + 0.95 + j * 0.5, { gain: 0.7, pan: j % 2 ? 0.25 : -0.25 })); if (sc.price) k.play('ding', T0 + 1.3, { f: 'E6', gain: 0.6 }); },
    logo: (k, sc, T0) => { k.play('pop', T0 + 0.1, { gain: 0.8 }); k.play('sparkle', T0 + 0.5, { gain: 0.6, n: 6 }); },
    stickman: (k, sc, T0) => { k.play('pop', T0 + 0.05, { gain: 0.8 }); const ps = (sc.figures || []).map(f => f.pose); if (ps.includes('shock') || ps.includes('faint')) k.play('impact', T0 + 0.1, { gain: 0.9 }); if (ps.includes('cheer') || ps.includes('dance')) k.play('sparkle', T0 + 0.3, { gain: 0.7, n: 5 }); if (sc.flash) k.play('impact', T0, { gain: 0.5 }); },
    shot: (k, sc, T0) => { (sc.flashAt || []).forEach(t => k.play('impact', T0 + t, { gain: 0.9 })); },
    phone: (k, sc, T0) => { k.play('cue:open', T0 + 0.2, { gain: 0.9 }); k.play('blip', T0 + 0.8, { f: 'E6', dur: 0.1, gain: 0.5 }); },
  };
  window.SCENE_SOUND = SND;
})();
