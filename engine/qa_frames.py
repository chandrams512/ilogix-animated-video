#!/usr/bin/env python3
"""Automatic layout check for a built plan page. Finds text that leaves the frame, collides with the caption bar, or overlaps other text.
Usage: python3 engine/qa_frames.py dist/<name>.html [--styles all|tech-glow,glass] [--aspects both|16x9|9x16]
Exit code 0 = no problems. Samples every scene at a settled moment, in every style and shape you ask for."""
import argparse, asyncio, json, os, sys
from playwright.async_api import async_playwright

HOOK = """
window.__REC = false; window.__T = [];
const ft = CanvasRenderingContext2D.prototype.fillText;
CanvasRenderingContext2D.prototype.fillText = function (t, x, y) {
  if (window.__REC) {
    const s = String(t), m = this.measureText(s), tr = this.getTransform(), al = this.textAlign;
    const x0 = al === 'center' ? x - m.width / 2 : al === 'right' ? x - m.width : x, asc = m.actualBoundingBoxAscent || 0, desc = m.actualBoundingBoxDescent || 0;
    const P = [[x0, y - asc], [x0 + m.width, y + desc]].map(([a, b]) => [tr.a * a + tr.c * b + tr.e, tr.b * a + tr.d * b + tr.f]);
    window.__T.push({ t: s, x1: Math.min(P[0][0], P[1][0]), x2: Math.max(P[0][0], P[1][0]), y1: Math.min(P[0][1], P[1][1]), y2: Math.max(P[0][1], P[1][1]), a: this.globalAlpha, cap: !!window.__CAP });
  }
  return ft.apply(this, arguments);
};
"""

def inter(a, b):
    w = min(a['x2'], b['x2']) - max(a['x1'], b['x1']); h = min(a['y2'], b['y2']) - max(a['y1'], b['y1'])
    return (w, h) if w > 0 and h > 0 else (0, 0)

async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('page'); ap.add_argument('--styles', default='all'); ap.add_argument('--aspects', default='both')
    a = ap.parse_args(); issues = []; seen = set()
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 1400, 'height': 900})
        await pg.add_init_script(HOOK)
        await pg.goto('file://' + os.path.abspath(a.page)); await pg.wait_for_function('typeof window.seek==="function"'); await pg.wait_for_timeout(1200)
        styles = await pg.evaluate('styleList().map(s=>s.id)') if a.styles == 'all' else a.styles.split(',')
        aspects = ['16x9', '9x16'] if a.aspects == 'both' else [a.aspects]
        scenes = await pg.evaluate('PLAN.scenes.map(s=>({t:s.type,t0:s._t0,d:s._d}))')
        for st in styles:
            for asp in aspects:
                await pg.evaluate(f"setStyle('{st}');setAspect('{asp}')")
                W, H = await pg.evaluate('[cv.width, cv.height]')
                for i, sc in enumerate(scenes):
                    lt = min(sc['d'] - 0.5, max(1.8, sc['d'] * 0.8)); t = sc['t0'] + lt
                    recs = await pg.evaluate(f"(()=>{{window.__T=[];window.__REC=true;seek({t});window.__REC=false;return window.__T}})()")
                    recs = [r for r in recs if r['a'] > 0.6 and r['t'].strip()]
                    cap = [r for r in recs if r['cap']]; body = [r for r in recs if not r['cap']]
                    box = None
                    if cap: box = dict(x1=min(r['x1'] for r in cap) - 22, x2=max(r['x2'] for r in cap) + 22, y1=min(r['y1'] for r in cap) - 13, y2=max(r['y2'] for r in cap) + 13)
                    def add(msg, r):
                        k = (st, asp, i, msg, r['t'])
                        if k not in seen: seen.add(k); issues.append('%s %s scene %d (%s) t=%.1f: %s "%s"' % (st, asp, i + 1, sc['t'], t, msg, r['t'][:40]))
                    for r in body:
                        if r['x1'] < -2 or r['x2'] > W + 2 or r['y1'] < -2 or r['y2'] > H + 2: add('text outside the frame:', r)
                        if box:
                            w, h = inter(r, box)
                            if w > 6 and h > 6: add('overlaps the caption bar:', r)
                    for j, r in enumerate(body):
                        for r2 in body[j + 1:]:
                            if r['t'] == r2['t']: continue
                            w, h = inter(r, r2); small = min((r['x2'] - r['x1']) * (r['y2'] - r['y1']), (r2['x2'] - r2['x1']) * (r2['y2'] - r2['y1']))
                            if small > 0 and w * h > 0.3 * small: add('text overlaps "%s":' % r2['t'][:20], r)
        await b.close()
    print('\n'.join('- ' + s for s in issues) if issues else 'No layout problems found.')
    sys.exit(1 if issues else 0)
asyncio.run(main())
