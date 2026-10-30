#!/usr/bin/env python3
"""Assemble one self-contained player HTML from a plan manifest.
Usage: python3 engine/build.py plans/<name>/manifest.json   ->  dist/<out>"""
import json, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
m = json.load(open(sys.argv[1]))
rd = lambda p: open(os.path.join(root, p), encoding='utf-8').read()
js = '\n'.join(p[7:] if p.startswith('inline:') else rd(p) for p in m['scripts'])
html = rd('engine/page_head.html') + rd('engine/page_body.html') + '<script>\n' + js + '\n</script>\n'
html = html.replace('<title>iLogix Voice Agents Explainer</title>', f"<title>{m['title']}</title>").replace('Animated explainer: iLogix voice agents and agentic AI', 'Animated explainer: ' + m['title'])
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
out = os.path.join(root, 'dist', m['out'])
open(out, 'w', encoding='utf-8').write(html)
print('built', out, len(html) // 1024, 'KB')
