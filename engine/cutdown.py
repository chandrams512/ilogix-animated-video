#!/usr/bin/env python3
"""Make a shorter version of a plan (for 15 s or 6 s placements).
Usage: python3 engine/cutdown.py plans/<name>/plan.json --max 15      -> plans/<name>-15s/plan.json
Keeps scenes marked  "short": true.  If none are marked: the first scene, the last scene, and middle scenes (in order of the plan) while they fit.
Scene lengths are squeezed to fit --max (never below 2 s). Assets next to the plan are copied."""
import argparse, json, os, shutil
ap = argparse.ArgumentParser(); ap.add_argument('plan'); ap.add_argument('--max', type=float, default=15); a = ap.parse_args()
d = os.path.dirname(os.path.abspath(a.plan)); plan = json.load(open(a.plan, encoding='utf-8')); sc = plan['scenes']
for s in sc: s.pop('start', None)
marked = [s for s in sc if s.get('short')]
if marked: keep = marked
else:
    keep = [sc[0]] if len(sc) > 1 else sc[:]; tail = sc[-1] if len(sc) > 1 else None; budget = a.max - sum(s.get('dur', 3) for s in keep) - (tail.get('dur', 3) if tail else 0)
    for s in sc[1:-1]:
        if s.get('dur', 3) <= budget + 0.01: keep.append(s); budget -= s.get('dur', 3)
    if tail: keep.append(tail)
tot = sum(s.get('dur', 3) for s in keep)
if tot > a.max:
    k = a.max / tot
    for s in keep: s['dur'] = round(max(2.0, s.get('dur', 3) * k), 1)
plan['scenes'] = keep; label = '%ds' % round(a.max); plan['title'] = plan.get('title', 'video') + ' (%s)' % label
for s in keep: s.pop('short', None)
out = d + '-' + label; os.makedirs(out, exist_ok=True)
for f in os.listdir(d):
    if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.svg')): shutil.copy(os.path.join(d, f), out)
json.dump(plan, open(os.path.join(out, 'plan.json'), 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print('wrote', os.path.join(out, 'plan.json'), '%d scenes, %.1f s' % (len(keep), sum(s['dur'] for s in keep)))
