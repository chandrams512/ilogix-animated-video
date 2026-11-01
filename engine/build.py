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
import re
plan = None; HINDI = False
if 'scenes' in src:  # a JSON plan: derive the manifest
    plan = src
    HINDI = bool(re.search('[\u0900-\u097f]', json.dumps(plan, ensure_ascii=False)))  # Devanagari text: embed the Hindi font
    slug = os.path.basename(os.path.dirname(path))
    logo = (plan.get('brand') or {}).get('logo')
    if logo and (plan.get('brand') or {}).get('colorsFromLogo') and not logo.startswith('data:'):
        sys.path.insert(0, os.path.join(root, 'engine')); import brand_colors
        auto = brand_colors.suggest(os.path.join(os.path.dirname(path), logo)); plan['brand']['colors'] = dict(auto, **(plan['brand'].get('colors') or {}))
        print('brand colours from logo:', plan['brand']['colors'])
    if logo and not logo.startswith('data:'):
        lp = os.path.join(os.path.dirname(path), logo)
        plan['brand']['logo'] = 'data:%s;base64,%s' % (mimetypes.guess_type(lp)[0] or 'image/png', base64.b64encode(open(lp, 'rb').read()).decode())
    for sc in plan['scenes']:
        if sc.get('image') and sc.get('type') in ('phone', 'image') and not str(sc['image']).startswith('data:'):  # phone screenshot or still image
            ip = os.path.join(os.path.dirname(path), sc['image'])
            sc['image'] = 'data:%s;base64,%s' % (mimetypes.guess_type(ip)[0] or 'image/png', base64.b64encode(open(ip, 'rb').read()).decode())
        if sc.get('type') == 'endcard' and sc.get('qr') and not sc.get('qrMatrix'):  # QR code as a matrix of 0/1 rows
            try: import segno
            except ImportError: sys.exit('QR codes need the segno package: pip install segno')
            sc['qrMatrix'] = [''.join('1' if bit else '0' for bit in row) for row in segno.make(sc['qr'], error='m', micro=False).matrix]
    cidx = os.path.join(os.path.dirname(path), 'clips', 'index.json'); cidx = json.load(open(cidx)) if os.path.exists(cidx) else {}
    for i, sc in enumerate(plan['scenes'], 1):  # AI / video clips: sample the file into small JPEG frames (the canvas draws frame by frame)
        if sc.get('type') != 'clip': continue
        import subprocess, tempfile, glob as _g
        f = sc.get('file') or cidx.get(str(i))
        if not f: sys.exit('scene %d (clip) has no file yet: run  python3 engine/clips.py %s' % (i, os.path.relpath(path)))
        fp = os.path.join(os.path.dirname(path), f); fps = int(sc.get('fps', 12)); d = sc.get('dur', 4)
        with tempfile.TemporaryDirectory() as td:
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-t', '%.2f' % d, '-i', fp, '-vf', "fps=%d,scale='if(gt(iw,ih),-2,540)':'if(gt(iw,ih),540,-2)'" % fps, '-q:v', '7', os.path.join(td, '%04d.jpg')], check=True)
            fr = sorted(_g.glob(os.path.join(td, '*.jpg')))
            if not fr: sys.exit('scene %d: no frames could be read from %s' % (i, f))
            sc['frames'] = ['data:image/jpeg;base64,' + base64.b64encode(open(x, 'rb').read()).decode() for x in fr]; sc['fps'] = fps
        print('scene %d: %d clip frames (%d KB)' % (i, len(sc['frames']), sum(len(x) for x in sc['frames']) // 1024))
    voice_src = None; vjson = os.path.join(os.path.dirname(path), 'voice', 'voice.json')
    if os.path.exists(vjson) and plan.get('voice') is not False:  # a voiceover exists: stretch scenes to fit each line, then mix the track
        import subprocess
        V = json.load(open(vjson, encoding='utf-8')); by = {it['scene']: it for it in V['items']}; vdir = os.path.dirname(vjson)
        for i, sc in enumerate(plan['scenes'], 1):
            it = by.get(i)
            if not it: continue
            sc['vdur'] = it['dur']
            if sc.get('start') is None: sc['dur'] = max(sc.get('dur', 3), round(it['dur'] + 0.7, 2))
            if sc.get('dur', 3) > 12: print('warning: scene %d is %.1f s (the validator allows 12): shorten its say line' % (i, sc['dur']))
        t = 0.0; starts = {}; total = 0.0
        for i, sc in enumerate(plan['scenes'], 1):
            t0 = sc.get('start', t); d = sc.get('dur', 3); t = t0 + d; starts[i] = t0; total = max(total, t0 + d)
        cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-t', '%.2f' % total, '-i', 'anullsrc=r=48000:cl=stereo']; flt = []; ins = ['[0:a]']
        for n, it in enumerate([x for x in V['items'] if x['scene'] in starts], 1):
            cmd += ['-i', os.path.join(vdir, it['file'])]; ms = int((starts[it['scene']] + 0.25) * 1000)
            flt.append('[%d:a]aresample=48000,aformat=channel_layouts=stereo,adelay=%d|%d[v%d]' % (n, ms, ms, n)); ins.append('[v%d]' % n)
        wav = os.path.join(root, 'dist', slug.replace('-', '_') + '_voice.wav'); os.makedirs(os.path.dirname(wav), exist_ok=True)
        subprocess.run(cmd + ['-filter_complex', ';'.join(flt + [''.join(ins) + 'amix=inputs=%d:duration=first:normalize=0[o]' % len(ins)]), '-map', '[o]', '-ar', '48000', wav], check=True)
        print('voice track:', os.path.relpath(wav, root), '(placeholder, silent)' if V.get('placeholder') else '')
        if not V.get('placeholder'):
            mp3 = wav[:-4] + '.mp3'; subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '64k', mp3], check=True)
            voice_src = 'data:audio/mpeg;base64,' + base64.b64encode(open(mp3, 'rb').read()).decode()
    # sound: effect map always; library pack (plan "sfx": auto | synth | <pack>) embedded only for the cues this plan can use
    smap = json.load(open(os.path.join(root, 'engine', 'sfx_map.json'))); mode = plan.get('sfx', 'auto'); sfx_js = 'window.SFX_MAP = ' + json.dumps(smap) + ';'
    if mode != 'synth':
        pack = mode.split(':')[-1] if mode != 'auto' else smap['packByStyle'].get(plan.get('style', 'tech-glow'), 'minimal'); pdir = os.path.join(root, 'sounds', 'uisfx', pack)
        cues = set(smap['roleCue'].values()) | set(smap['always'])
        for sc in plan['scenes']: cues |= set(smap['sceneCues'].get(sc['type'], []))
        vols = json.load(open(os.path.join(root, 'sounds', 'uisfx', 'cues.json'))); packd = {}
        for c in sorted(cues):
            f = os.path.join(pdir, c + '.mp3')
            if os.path.exists(f): packd[c] = 'data:audio/mpeg;base64,' + base64.b64encode(open(f, 'rb').read()).decode()
        if packd: sfx_js += 'window.SFX_VOL = ' + json.dumps(vols) + ';window.SFX_PACK = ' + json.dumps(packd) + ';'; print('sound library:', pack, len(packd), 'cues,', sum(len(v) for v in packd.values()) // 1024, 'KB')
        else: print('warning: no sound files found for pack', mode)
    skins = sorted(os.path.relpath(p, root) for p in glob.glob(os.path.join(root, 'styles', '*', 'skin.js')))
    m = {'title': plan.get('title', slug), 'out': slug.replace('-', '_') + '.html',
         'scripts': ['engine/harness.js', 'engine/styles.js', 'styles/flat-vector/style.js', 'styles/tech-glow/style.js'] + skins +
                    ['styles/_sound/sound.js', 'inline:const PLAN = ' + json.dumps(plan, ensure_ascii=False) + ';' + ('window.HINDI = true;' if HINDI else ''), 'inline:' + sfx_js, 'engine/plan.js', 'engine/scenes_extra.js',
                     "inline:useStyle('%s');" % plan.get('style', 'tech-glow')] + (['inline:window.VOICE_SRC = ' + json.dumps(voice_src) + ';'] if voice_src else []) + ['engine/player.js',
                     "inline:setAspect('%s');" % plan.get('aspect', '16x9')]}
else:
    m = src
js = '\n'.join(p[7:] if p.startswith('inline:') else rd(p) for p in m['scripts'])
FONTS = [('Caveat', 600), ('Caveat', 700), ('Nunito', 700), ('Nunito', 800), ('Nunito', 900), ('Sora', 500), ('Sora', 600), ('Sora', 700), ('Sora', 800), ('IBM Plex Mono', 500), ('IBM Plex Mono', 600), ('Anton', 400), ('Press Start 2P', 400), ('Poiret One', 400), ('Jost', 500), ('Jost', 700), ('Archivo Black', 400)]
if HINDI: FONTS += [('Noto Sans Devanagari', 600), ('Noto Sans Devanagari', 700), ('Noto Sans Devanagari', 800)]
def font_css():
    out = ''
    for fam, w in FONTS:
        sub = 'devanagari' if fam == 'Noto Sans Devanagari' else 'latin'
        f = os.path.join(root, 'engine', 'fonts', '%s-%s-%d-normal.woff2' % (fam.lower().replace(' ', '-'), sub, w))
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
        if sc.get('say'): items.append((t0, sc['say'], d) if not sc.get('vdur') else (t0 + 0.1, sc['say'], sc['vdur'] + 0.55))
    if caps: items = [(c['t'], c['text'], c.get('dur', 2)) for c in caps]
    ts = lambda s: '%02d:%02d:%02d,%03d' % (int(s // 3600), int(s % 3600 // 60), int(s % 60), int(round((s % 1) * 1000)) % 1000)
    srt = ''.join('%d\n%s --> %s\n%s\n\n' % (i + 1, ts(a + 0.15), ts(a + max(1, d - 0.4)), txt) for i, (a, txt, d) in enumerate(items))
    base = out[:-5]
    open(base + '.srt', 'w', encoding='utf-8').write(srt)
    open(base + '_script.md', 'w', encoding='utf-8').write('# Voiceover script: %s\n\n' % m['title'] + ''.join('- %.1f s: %s\n' % (a, txt) for a, txt, d in items))
    print('wrote captions and script:', os.path.basename(base) + '.srt')
