#!/usr/bin/env python3
"""Make the AI clips a plan asks for (scenes of type 'clip' that have a 'prompt'), with a hard spending cap and a cache.

Usage:  python3 engine/clips.py plans/<name>/plan.json [--provider mock|fal] [--usd-per-clip 0.40] [--max-usd 1.00] [--dry-run] [--force]
Output: plans/<name>/clips/<id>.mp4 and clips/index.json (scene number -> file) and clips/ledger.json (what each clip cost). build.py reads index.json.
A clip scene may also point at a file you already have: { "type": "clip", "file": "clips/my.mp4" }; those are never generated.
Rules: clips already made are reused (same prompt, image, length, shape and provider), so a re-run costs nothing. A paid provider needs --usd-per-clip
(or CLIPS_USD_PER_CLIP): look the price up yourself, it is not guessed here. The run stops before it starts if the new clips would cost more than --max-usd.
Every clip scene shows an 'AI-generated' badge. See docs/tiers.md and engine/providers.py."""
import argparse, hashlib, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import providers


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('plan'); ap.add_argument('--provider', default='mock', choices=sorted(providers.PROVIDERS))
    ap.add_argument('--usd-per-clip', type=float, default=None); ap.add_argument('--max-usd', type=float, default=1.0); ap.add_argument('--dry-run', action='store_true'); ap.add_argument('--force', action='store_true')
    a = ap.parse_args(); pdir = os.path.dirname(os.path.abspath(a.plan)); plan = json.load(open(a.plan, encoding='utf-8'))
    cdir = os.path.join(pdir, 'clips'); os.makedirs(cdir, exist_ok=True)
    ipath = os.path.join(cdir, 'index.json'); index = json.load(open(ipath)) if os.path.exists(ipath) else {}
    lpath = os.path.join(cdir, 'ledger.json'); ledger = json.load(open(lpath)) if os.path.exists(lpath) else []
    price = a.usd_per_clip if a.usd_per_clip is not None else float(os.environ.get('CLIPS_USD_PER_CLIP', 'nan'))
    if a.provider in providers.FREE: price = 0.0
    jobs = []
    for i, sc in enumerate(plan['scenes'], 1):
        if sc.get('type') != 'clip' or sc.get('file') or not sc.get('prompt'): continue
        aspect = sc.get('aspect') or plan.get('aspect', '9x16'); secs = round(min(float(sc.get('clipSecs', sc.get('dur', 4))), 10), 1)
        img = os.path.join(pdir, sc['image']) if sc.get('image') else None
        key = hashlib.sha1('|'.join([a.provider, sc['prompt'], sc.get('image') or '', str(secs), aspect]).encode()).hexdigest()[:12]
        out = os.path.join(cdir, key + '.mp4'); jobs.append((i, sc, img, secs, aspect, out, os.path.exists(out) and not a.force))
    new = [j for j in jobs if not j[6]]
    if new and price != price: sys.exit('Set --usd-per-clip (or CLIPS_USD_PER_CLIP) to the price you checked for this provider/model.')
    cost = price * len(new) if new else 0.0
    print('%d clip scene(s): %d cached, %d to make, estimated cost $%.2f (cap $%.2f)' % (len(jobs), len(jobs) - len(new), len(new), cost, a.max_usd))
    if cost > a.max_usd: sys.exit('Stopped: the estimated cost is over --max-usd. Nothing was generated.')
    if a.dry_run: return
    for i, sc, img, secs, aspect, out, cached in jobs:
        if not cached:
            print('scene %d: generating with %s ...' % (i, a.provider), flush=True); providers.PROVIDERS[a.provider](sc['prompt'], img, secs, aspect, out)
            ledger.append({'scene': i, 'file': os.path.basename(out), 'provider': a.provider, 'usd': price, 'prompt': sc['prompt']})
        index[str(i)] = os.path.relpath(out, pdir)
    json.dump(index, open(ipath, 'w'), indent=1); json.dump(ledger, open(lpath, 'w'), indent=1)
    print('done. spent this run: $%.2f, all time for this plan: $%.2f' % (cost, sum(e['usd'] for e in ledger)))


if __name__ == '__main__': main()
