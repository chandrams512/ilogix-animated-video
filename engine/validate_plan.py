#!/usr/bin/env python3
"""Check a JSON plan before building. Usage: python3 engine/validate_plan.py plans/<name>/plan.json
Exit code 0 = valid. Prints every problem found (useful as a retry prompt for a cheap model)."""
import json, sys
STYLES = {'tech-glow', 'isometric', 'whiteboard', 'blueprint', 'neo-brutal', 'glass', 'paper-cut', 'kinetic', 'neon', 'bauhaus', 'pixel', 'deco', 'mesh', 'particles', 'vhs', 'halftone', 'splitflap'}
ICONS = {'phone', 'mail', 'chat', 'cal', 'person', 'doc', 'check', 'bolt', 'plan', 'shield', 'pin', 'plane', 'cross'}
REQ = {'hook': ['lines'], 'steps': ['items'], 'stat': ['value', 'label'], 'chart': ['bars'], 'compare': ['left', 'right'], 'timeline': ['points'], 'flow': ['nodes'], 'cta': ['lines'],
       'testimonial': ['quote', 'name'], 'offer': ['headline'], 'pricing': ['plans'], 'checklist': ['items'], 'beforeafter': ['before', 'after'], 'endcard': ['lines'], 'phone': ['image'], 'clip': [], 'image': ['image']}
LIM = {'hook': (1, 3, 'lines'), 'steps': (2, 4, 'items'), 'chart': (2, 6, 'bars'), 'timeline': (2, 5, 'points'), 'flow': (2, 5, 'nodes'), 'cta': (1, 3, 'lines'),
       'pricing': (2, 3, 'plans'), 'checklist': (2, 5, 'items'), 'endcard': (1, 3, 'lines')}
BANNED = ['assured return', 'guaranteed return', 'guaranteed appreciation', 'assured rental', 'guaranteed rental', 'assured appreciation', 'risk free', 'risk-free']
errs = []
try: plan = json.load(open(sys.argv[1], encoding='utf-8'))
except Exception as e: print('Not valid JSON:', e); sys.exit(1)
if plan.get('style', 'tech-glow') not in STYLES: errs.append('style must be one of %s' % sorted(STYLES))
if plan.get('aspect', '16x9') not in ('16x9', '9x16'): errs.append("aspect must be '16x9' or '9x16'")
TRS = ('fade', 'slide', 'push', 'zoom', 'wipe')
if plan.get('motion', 'off') not in ('off', 'auto'): errs.append("motion must be 'off' or 'auto'")
if plan.get('transition', 'fade') not in TRS + ('auto',): errs.append('transition must be one of %s or auto' % list(TRS))
if plan.get('camera', 'none') not in ('none', 'drift'): errs.append("camera must be 'none' or 'drift'")
for _i, _sc in enumerate(plan.get('scenes') or [], 1):
        if isinstance(_sc, dict) and _sc.get('transition') not in (None,) + TRS: errs.append('scene %d: transition must be one of %s' % (_i, list(TRS)))
        if isinstance(_sc, dict) and _sc.get('camera') not in (None, 'none', 'drift'): errs.append("scene %d: camera must be 'none' or 'drift'" % _i)
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
        if t == 'clip':
            if not (s.get('prompt') or s.get('file')): errs.append('%s: needs a prompt (to generate with engine/clips.py) or a file' % where)
            if s.get('badge') is False and not s.get('real'): errs.append('%s: AI clips must show a badge; set "real": true only for real footage you own' % where)
        if t in ('clip', 'image') and len(s.get('title', '')) > 60: errs.append('%s: title is over 60 characters' % where)
        if t == 'endcard' and not any(s.get(k) for k in ('phone', 'email', 'web', 'qr')): errs.append('%s: add at least one of phone, email, web, qr' % where)
        for key in ('items', 'nodes'):
            for it in s.get(key, []):
                if isinstance(it, dict) and it.get('icon') and it['icon'] not in ICONS: errs.append('%s: unknown icon %r (use %s)' % (where, it['icon'], sorted(ICONS)))
        d = s.get('dur', 3)
        if not (1.5 <= d <= 12): errs.append('%s: dur must be 1.5 to 12 seconds' % where)
        total = max(total, s.get('start', total) + d)
        if len(s.get('say', '')) > 140: errs.append('%s: say is too long for a caption (max 140 characters)' % where)
    if total > 90: errs.append('total length %.0f s is over 90 s' % total)
br = plan.get('brand') or {}
for k in ('rera', 'disclaimer'):
    if len(str(br.get(k, ''))) > 70: errs.append('brand.%s is over 70 characters' % k)
if plan.get('industry') == 'real-estate':
    if not br.get('rera'): errs.append('real-estate plans need brand.rera (the project RERA registration number, shown on every scene). Check your state RERA rules for the exact format')
    blob = json.dumps(plan, ensure_ascii=False).lower()
    for b in BANNED:
        if b in blob: errs.append('real-estate: remove %r (return/appreciation promises are not allowed in ads)' % b)
if plan.get('industry') == 'real-estate':
    for i, s2 in enumerate(plan.get('scenes') or [], 1):
        if s2.get('type') == 'image' and not s2.get('badge'): errs.append('scene %d (image): real-estate images need a badge such as "Artist\'s impression" or "Actual photo"' % i)
print('\n'.join('- ' + e for e in errs) if errs else 'Plan is valid.')
sys.exit(1 if errs else 0)
