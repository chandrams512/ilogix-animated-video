// ===== Style registry =====
// A style ("skin") registers one object with the same shape, then scenes draw only through S:
//   pal {bg0,bg1,bg2,cyan,violet,pink,green,amber,red,ink,mute}   semantic palette (names are roles, not literal colours)
//   bg(x,t)  finish(x,t)  text(x,s,cx,cy,px,col,o)  chip(x,cx,cy,s,px,o)  card(x,X,Y,w,h,o)
//   node(x,cx,cy,r,col,t,o)  link(x,ax,ay,bx,by,col,t,o)  wordmark(x,big)  orb(x,cx,cy,r,t,label)
//   icon {phone,mail,chat,cal,person,doc,check,bolt,plan,shield}   each (x,cx,cy,size,col)
// Switch with useStyle(name); the player redraws.
const STYLES = {};
let ACTIVE_STYLE = null;
function registerStyle(name, def) { STYLES[name] = def; def.id = name; if (!ACTIVE_STYLE) ACTIVE_STYLE = name; }
function useStyle(name) { if (!STYLES[name]) throw new Error('Unknown style: ' + name); ACTIVE_STYLE = name; }
function styleList() { return Object.keys(STYLES).map((id) => ({ id, label: STYLES[id].label || id })); }
const S = new Proxy({}, { get(_, k) { return STYLES[ACTIVE_STYLE][k]; } });

// Shared pieces for skins: wordmark and the voice-agent orb, built on a skin's own text() and palette.
function commonParts(text, pal, o) {
  o = o || {};
  const ink = o.ink || pal.ink, a = o.orbA || pal.violet, b = o.orbB || pal.cyan;
  return {
    wordmark(x, big) {
      if (big) { text(x, 'iLogix Digital', 640, 120, 66, ink, { w: 800 }); return; }
      x.fillStyle = pal.cyan; rr(x, 42, 33, 26, 26, 8); x.fill(); text(x, 'iLogix Digital', 80, 47, 22, ink, { align: 'left', w: 700 });
    },
    orb(x, cx, cy, r, t, label) {
      for (let i = 0; i < 3; i++) { const u = (t * 0.6 + i / 3) % 1; x.strokeStyle = H.rgba(b, 0.5 * (1 - u)); x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r * (1 + 0.7 * u), 0, TAU); x.stroke(); }
      const g = x.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r); g.addColorStop(0, b); g.addColorStop(1, a);
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); if (o.outline) { x.lineWidth = o.outline; x.strokeStyle = o.outlineCol || ink; x.stroke(); }
      for (let i = 0, n = 11; i < n; i++) { const k = 1 - Math.abs(i - (n - 1) / 2) / (n / 2) * 0.6, hg = r * (0.16 + 0.5 * Math.abs(Math.sin(t * 4 + i * 0.8)) * k); x.fillStyle = '#ffffff'; rr(x, cx - r * 0.62 + i * (r * 1.24 / (n - 1)) - r * 0.045, cy - hg / 2, r * 0.09, hg, r * 0.045); x.fill(); }
      if (label) text(x, label, cx, cy + r + 34, 26, ink, { w: 700 });
    },
  };
}
