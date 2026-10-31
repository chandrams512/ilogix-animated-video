#!/usr/bin/env python3
"""Pick brand accent colours from a logo image.  Usage: python3 engine/brand_colors.py logo.png   (prints JSON for plan brand.colors)
In a plan, set  "brand": {"logo": "logo.png", "colorsFromLogo": true}  and build.py fills brand.colors for you (colours you set by hand win)."""
import colorsys, json, sys
from PIL import Image

def palette(path, n=3):
    im = Image.open(path).convert('RGBA'); im.thumbnail((160, 160))
    raw = im.tobytes(); px = [tuple(raw[i:i + 3]) for i in range(0, len(raw), 4) if raw[i + 3] > 200]
    if not px: return []
    q = Image.new('RGB', (len(px), 1)); q.putdata(px)
    q = q.quantize(colors=10, method=Image.Quantize.MEDIANCUT); pal = q.getpalette()[:30]; counts = sorted(q.getcolors(), reverse=True)
    out = []
    for cnt, idx in counts:
        r, g, b = pal[idx * 3:idx * 3 + 3]; h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if s < 0.28 or v < 0.25 or v > 0.97: continue            # skip greys, near-black and near-white
        if any(abs(h - h2) < 0.06 for _, h2 in out): continue     # keep the colours distinct
        v = max(v, 0.78); s = min(max(s, 0.55), 0.9)              # lift so the accent reads on dark and light styles
        r2, g2, b2 = [round(c * 255) for c in colorsys.hsv_to_rgb(h, s, v)]
        out.append(('#%02x%02x%02x' % (r2, g2, b2), h))
        if len(out) == n: break
    return [c for c, _ in out]

def suggest(path):
    cols = palette(path); keys = ['cyan', 'violet', 'pink']
    return {k: c for k, c in zip(keys, cols)}

if __name__ == '__main__': print(json.dumps(suggest(sys.argv[1]), indent=2))
