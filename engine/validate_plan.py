#!/usr/bin/env python3
"""Check a JSON plan before building. Usage: python3 engine/validate_plan.py plans/<name>/plan.json
Exit code 0 = valid. Prints every problem found (useful as a retry prompt for a cheap model)."""
import json, sys
STYLES = {'tech-glow', 'isometric', 'whiteboard', 'blueprint', 'neo-brutal', 'glass', 'paper-cut'}
ICONS = {'phone', 'mail', 'chat', 'cal', 'person', 'doc', 'check', 'bolt', 'plan', 'shield', 'pin', 'plane', 'cross'}
REQ = {'hook': ['lines'], 'steps': ['items'], 'stat': ['value', 'label'], 'chart': ['bars'], 'compare': ['left', 'right'], 'timeline': ['points'], 'flow': ['nodes'], 'cta': ['lines'],
       'testimonial': ['quote', 'name'], 'offer': ['headline'], 'pricing': ['plans'], 'checklist': ['items'], 'beforeafter': ['before', 'after'], 'endcard': ['lines'], 'phone': ['image']}
LIM = {'hook': (1, 3, 'lines'), 'steps': (2, 4, 'items'), 'chart': (2, 6, 'bars'), 'timeline': (2, 5, 'points'), 'flow': (2, 5, 'nodes'), 'cta': (1, 3, 'lines'),
       'pricing': (2, 3, 'plans'), 'checklist': (2, 5, 'items'), 'endcard': (1, 3, 'lines')}
errs = []
try: plan = json.load(open(sys.argv[1], encoding='utf-8'))
except Exception as e: print('Not valid JSON:', e); sys.exit(1)
if plan.get('style', 'tech-glow') not in STYLES: errs.append('style must be one of %s' % sorted(STYLES))
if plan.get('aspect', '16x9') not in ('16x9', '9x16'): errs.append("aspect must be '16x9' or '9x16'")
sc = plan.get('scenes')
if not isinstance(sc, list) or not sc: errs.append('scenes must be a non-empty list')
else:
    total = 0
    for i, s in enumerate(sc):
        t = s.get('type'); where = 'scene %d (%s)' % (i + 1, t)
        if t not in REQ: errs.append('scene %d: unknown type %r (use %s)' % (i + 1, t, sorted(REQ))); continue
        for k in REQ[t]:
            if k not in s: errs.append('%s: missing %r' % (where, k))
        if t in LIM:
            lo, hi, key = LIM[t]
            if key in s and not (lo <= len(s[key]) <= hi): errs.append('%s: %s must have %d to %d entries' % (where, key, lo, hi))
        if t == 'compare':
            for side in ('left', 'right'):
                v = s.get(side) or {}
                if 'title' not in v or not (1 <= len(v.get('items', [])) <= 4): errs.append('%s: %s needs a title and 1 to 4 items' % (where, side))
        if t == 'testimonial' and len(s.get('quote', '')) > 160: errs.append('%s: quote is over 160 characters' % where)
        if t == 'offer' and len(s.get('headline', '')) > 70: errs.append('%s: headline is over 70 characters' % where)
        if t == 'pricing':
            for j, pl in enumerate(s.get('plans', [])):
                if not all(k in pl for k in ('name', 'price')): errs.append('%s: plan %d needs name and price' % (where, j + 1))
                if len(pl.get('items', [])) > 3: errs.append('%s: plan %d has more than 3 items' % (where, j + 1))
                if len('  \u00b7  '.join(pl.get('items', []))) > 44: errs.append('%s: plan %d items are too long together (max 44 characters joined)' % (where, j + 1))
                if any(len(i) > 26 for i in pl.get('items', [])): errs.append('%s: plan %d items must be 26 characters or fewer' % (where, j + 1))
        if t == 'checklist':
            for it in s.get('items', []):
                txt = it if isinstance(it, str) else it.get('text', '')
                if len(txt) > 30: errs.append('%s: item %r is over 30 characters' % (where, txt))
        if t == 'beforeafter':
            for side in ('before', 'after'):
                v2 = s.get(side) or {}
                if not all(k in v2 for k in ('label', 'value')): errs.append('%s: %s needs label and value' % (where, side))
                if len(str(v2.get('value', ''))) > 9: errs.append('%s: %s value is too long (max 9 characters)' % (where, side))
        if t == 'endcard' and not any(s.get(k) for k in ('phone', 'email', 'web', 'qr')): errs.append('%s: add at least one of phone, email, web, qr' % where)
        for key in ('items', 'nodes'):
            for it in s.get(key, []):
                if isinstance(it, dict) and it.get('icon') and it['icon'] not in ICONS: errs.append('%s: unknown icon %r (use %s)' % (where, it['icon'], sorted(ICONS)))
        d = s.get('dur', 3)
        if not (1.5 <= d <= 12): errs.append('%s: dur must be 1.5 to 12 seconds' % where)
        total = max(total, s.get('start', total) + d)
        if len(s.get('say', '')) > 140: errs.append('%s: say is too long for a caption (max 140 characters)' % where)
    if total > 90: errs.append('total length %.0f s is over 90 s' % total)
print('\n'.join('- ' + e for e in errs) if errs else 'Plan is valid.')
sys.exit(1 if errs else 0)
