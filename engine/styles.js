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
