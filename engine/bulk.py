#!/usr/bin/env python3
"""Make many videos from one template plan and a spreadsheet (CSV). Also used for personalised videos (a name or company per row).

Usage:  python3 engine/bulk.py plans/<template>/plan.json data.csv [--name bulk-offers] [--render 9x16] [--style tech-glow] [--out out/]
Template: a normal plan.json where any text can contain {{column}} placeholders, e.g. "headline": "{{shop}} festive offer".
          If a value is exactly "{{column}}" and the cell is a number, it becomes a number (so a stat can count up).
CSV:      first row = column names. An optional 'slug' column names each video; otherwise the first column is used.
Output:   plans/<name>/<slug>/plan.json for every row (assets next to the template are copied), validated and built into dist/.
          With --render, also renders each one to MP4 (sound effects only, no music) plus cover and GIF into --out.
Rows that fail validation are skipped and listed at the end."""
import argparse, csv, json, os, re, shutil, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PH = re.compile(r'\{\{\s*([^}|]+?)\s*\}\}')

def fill(node, row, missing):
    if isinstance(node, str):
        m = PH.fullmatch(node.strip())
        if m:
            k = m.group(1)
            if k not in row: missing.add(k); return node
            v = row[k].strip()
            try: return int(v) if re.fullmatch(r'-?\d+', v) else float(v) if re.fullmatch(r'-?\d+\.\d+', v) else v
            except ValueError: return v
        def sub(m2):
            k = m2.group(1)
            if k not in row: missing.add(k); return m2.group(0)
            return row[k].strip()
        return PH.sub(sub, node)
    if isinstance(node, list): return [fill(n, row, missing) for n in node]
    if isinstance(node, dict): return {k: fill(v, row, missing) for k, v in node.items()}
    return node

def slugify(s): return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-') or 'video'

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('template'); ap.add_argument('csv'); ap.add_argument('--name', default='bulk')
    ap.add_argument('--render'); ap.add_argument('--style'); ap.add_argument('--out', default='out')
    a = ap.parse_args(); tdir = os.path.dirname(os.path.abspath(a.template)); tpl = json.load(open(a.template, encoding='utf-8'))
    rows = list(csv.DictReader(open(a.csv, encoding='utf-8-sig'))); ok, bad = [], []
    for n, row in enumerate(rows, 1):
        missing = set(); plan = fill(tpl, row, missing)
        slug = slugify(row.get('slug') or row[next(iter(row))] or 'row%d' % n)
        if a.style: plan['style'] = a.style
        if missing: bad.append((slug, ['unknown column(s) in template: ' + ', '.join(sorted(missing))])); continue
        d = os.path.join(ROOT, 'plans', a.name, slug); os.makedirs(d, exist_ok=True)
        for f in os.listdir(tdir):  # copy logo / screenshots next to the new plan
            if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.svg')): shutil.copy(os.path.join(tdir, f), d)
        plan['title'] = plan.get('title') or slug; p = os.path.join(d, 'plan.json'); json.dump(plan, open(p, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
        r = subprocess.run([sys.executable, os.path.join(ROOT, 'engine', 'validate_plan.py'), p], capture_output=True, text=True)
        if r.returncode: bad.append((slug, r.stdout.strip().splitlines())); continue
        b = subprocess.run([sys.executable, os.path.join(ROOT, 'engine', 'build.py'), p], capture_output=True, text=True)
        if b.returncode: bad.append((slug, ['build failed: ' + b.stderr.strip()[-200:]])); continue
        html = os.path.join(ROOT, 'dist', slug.replace('-', '_') + '.html'); ok.append((slug, html)); print('built', slug, flush=True)
        if a.render:
            env = dict(os.environ, MIXES='sfx-only')
            subprocess.run([sys.executable, os.path.join(ROOT, 'engine', 'render.py'), a.render, a.out, html, slug, plan.get('style', 'tech-glow')], check=True, env=env, stdout=subprocess.DEVNULL)
            print('rendered', slug, flush=True)
    print('\n%d built, %d skipped.' % (len(ok), len(bad)))
    for slug, errs in bad: print('- %s: %s' % (slug, '; '.join(errs)))
    sys.exit(1 if bad else 0)
main()
