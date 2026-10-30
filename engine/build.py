#!/usr/bin/env python3
"""Assemble one self-contained player HTML.
Usage: python3 engine/build.py plans/<name>/manifest.json   (hand-written scenes)
       python3 engine/build.py plans/<name>/plan.json       (JSON plan, see docs/plan-format.md)
Writes dist/<out>.html, and for plans also dist/<out>.srt and dist/<out>_script.md (captions and voiceover lines)."""
import base64, glob, json, mimetypes, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path = os.path.abspath(sys.argv[1])
rd = lambda p: open(os.path.join(root, p), encoding='utf-8').read()
src = json.load(open(path, encoding='utf-8'))
plan = None
if 'scenes' in src:  # a JSON plan: derive the manifest
    plan = src
    slug = os.path.basename(os.path.dirname(path))
    logo = (plan.get('brand') or {}).get('logo')
    if logo and not logo.startswith('data:'):
        lp = os.path.join(os.path.dirname(path), logo)
        plan['brand']['logo'] = 'data:%s;base64,%s' % (mimetypes.guess_type(lp)[0] or 'image/png', base64.b64encode(open(lp, 'rb').read()).decode())
    skins = sorted(os.path.relpath(p, root) for p in glob.glob(os.path.join(root, 'styles', '*', 'skin.js')))
    m = {'title': plan.get('title', slug), 'out': slug.replace('-', '_') + '.html',
         'scripts': ['engine/harness.js', 'engine/styles.js', 'styles/flat-vector/style.js', 'styles/tech-glow/style.js'] + skins +
                    ['styles/_sound/sound.js', 'inline:const PLAN = ' + json.dumps(plan, ensure_ascii=False) + ';', 'engine/plan.js',
                     "inline:useStyle('%s');" % plan.get('style', 'tech-glow'), 'engine/player.js',
                     "inline:setAspect('%s');" % plan.get('aspect', '16x9')]}
else:
    m = src
js = '\n'.join(p[7:] if p.startswith('inline:') else rd(p) for p in m['scripts'])
FONTS = [('Caveat', 600), ('Caveat', 700), ('Nunito', 700), ('Nunito', 800), ('Nunito', 900), ('Sora', 500), ('Sora', 600), ('Sora', 700), ('Sora', 800), ('IBM Plex Mono', 500), ('IBM Plex Mono', 600)]
def font_css():
    out = ''
    for fam, w in FONTS:
        f = os.path.join(root, 'engine', 'fonts', '%s-latin-%d-normal.woff2' % (fam.lower().replace(' ', '-'), w))
        if os.path.exists(f): out += "@font-face{font-family:'%s';font-weight:%d;font-style:normal;font-display:block;src:url(data:font/woff2;base64,%s) format('woff2');}\n" % (fam, w, base64.b64encode(open(f, 'rb').read()).decode())
    return '<style>\n' + out + '</style>\n'
html = rd('engine/page_head.html') + rd('engine/page_body.html') + '<script>\n' + js + '\n</script>\n'
html = html.replace('<style>', font_css() + '<style>', 1).replace('<title>iLogix Voice Agents Explainer</title>', f"<title>{m['title']}</title>").replace('Animated explainer: iLogix voice agents and agentic AI', 'Animated explainer: ' + m['title'])
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
out = os.path.join(root, 'dist', m['out'])
open(out, 'w', encoding='utf-8').write(html)
print('built', out, len(html) // 1024, 'KB')
if plan:
    t = 0.0; caps = plan.get('captions'); items = []
    for sc in plan['scenes']:
        t0 = sc.get('start', t); d = sc.get('dur', 3); t = t0 + d
        if sc.get('say'): items.append((t0, sc['say'], d))
    if caps: items = [(c['t'], c['text'], c.get('dur', 2)) for c in caps]
    ts = lambda s: '%02d:%02d:%02d,%03d' % (int(s // 3600), int(s % 3600 // 60), int(s % 60), int(round((s % 1) * 1000)) % 1000)
    srt = ''.join('%d\n%s --> %s\n%s\n\n' % (i + 1, ts(a + 0.15), ts(a + max(1, d - 0.4)), txt) for i, (a, txt, d) in enumerate(items))
    base = out[:-5]
    open(base + '.srt', 'w', encoding='utf-8').write(srt)
    open(base + '_script.md', 'w', encoding='utf-8').write('# Voiceover script: %s\n\n' % m['title'] + ''.join('- %.1f s: %s\n' % (a, txt) for a, txt, d in items))
    print('wrote captions and script:', os.path.basename(base) + '.srt')
