#!/usr/bin/env python3
"""Render a built player HTML to MP4.
Usage: python3 engine/render.py <16x9|9x16> <outdir> [html_path] [name_prefix] [style]
Defaults: dist/ilogix_voice_agents.html, prefix 'ilogix'.
Env: FPS=60 (default 30)   MBLUR=4 (motion blur, sub-frames per frame; default off)   CAPTIONS=0 (no burned-in captions)   MIXES=sfx-only (render only these audio mixes, comma separated; default all three; also voice-only = the voice alone, no music or effects, needs a voiceover; and silent = picture only, no audio)
With a voiceover (see engine/tts.py) it also writes <prefix>_<aspect>_voiceover.mp4: the quiet effects mix plus the voice.
Also writes <prefix>_<aspect>_cover.jpg (a settled still for thumbnails) and <prefix>_<aspect>_preview.gif (first 6 s, small, for emails).
Renders frames once (silent), renders both audio mixes offline, then muxes:
  ilogix_<aspect>_sound.mp4 (full effects + music pad)  and  voiceover-mix (quieter, no pad) and sfx-only (full effects, no music, for laying your own track)."""
import asyncio, base64, subprocess, sys, os
from playwright.async_api import async_playwright

ASPECT, OUT = sys.argv[1], sys.argv[2]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_PATH = os.path.abspath(sys.argv[3]) if len(sys.argv) > 3 else os.path.join(ROOT, 'dist', 'ilogix_voice_agents.html')
PREFIX = sys.argv[4] if len(sys.argv) > 4 else 'ilogix'
STYLE = sys.argv[5] if len(sys.argv) > 5 else None
CAPS = os.environ.get('CAPTIONS', '1') != '0'
FPS = int(os.environ.get('FPS', '30'))
MBLUR = int(os.environ.get('MBLUR', '0'))   # sub-frames per frame for real motion blur (0 = off, 4 is a good start); slower to render
MIXES = [m for m in os.environ.get('MIXES', 'sound,voiceover-mix,sfx-only').split(',') if m]
HTML = 'file://' + HTML_PATH
os.makedirs(OUT, exist_ok=True)
SCALE = 'scale=1920:1080:flags=lanczos' if ASPECT == '16x9' else 'scale=1080:1920:flags=lanczos'
silent = os.path.join(OUT, f'_silent_{ASPECT}.mp4')

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width': 1400, 'height': 900})
        await pg.goto(HTML)
        await pg.wait_for_function('typeof window.seek === "function" && typeof window.DURATION === "number"')
        await pg.wait_for_timeout(3000)  # let fonts settle
        await pg.evaluate('Promise.all(window.PRELOAD || [])')  # images, clip frames and library sounds decoded
        if not CAPS: await pg.evaluate('setCaptions && setCaptions(false)')
        if STYLE: await pg.evaluate(f"setStyle('{STYLE}')")
        await pg.evaluate(f"setAspect('{ASPECT}')")
        dur = await pg.evaluate('window.DURATION')
        n = round(dur * FPS)
        # audio first (offline render, both mixes)
        for name, vo in [m for m in (('sound', '{voiceover:false}'), ('voiceover-mix', '{voiceover:true}'), ('sfx-only', '{voiceover:false,nomusic:true}')) if m[0] in MIXES]:
            js = f"""(async()=>{{const r=await SOUND.renderOffline(window.scoreSound,window.DURATION,48000,{vo});
              const by=new Uint8Array(r.inter.buffer);let s='';for(let i=0;i<by.length;i+=0x8000)s+=String.fromCharCode.apply(null,by.subarray(i,i+0x8000));
              return {{peak:r.peak,b64:btoa(s)}};}})()"""
            r = await pg.evaluate(js)
            open(os.path.join(OUT, f'_audio_{name}.f32'), 'wb').write(base64.b64decode(r['b64']))
            print(name, 'audio peak', round(r['peak'], 3), flush=True)
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                               '-vf', SCALE, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', '-movflags', '+faststart', silent],
                              stdin=subprocess.PIPE)
        for i in range(n):
            d = await pg.evaluate(f"(()=>{{{('seekBlur(%s,%d,%s)' % (i / FPS, MBLUR, 0.5 / FPS)) if MBLUR > 1 else 'seek(%s)' % (i / FPS)};return document.getElementById('cv').toDataURL('image/jpeg',0.97).split(',')[1]}})()")
            ff.stdin.write(base64.b64decode(d))
            if i % 150 == 0: print('frame', i, '/', n, flush=True)
        ff.stdin.close(); ff.wait()
        ct = await pg.evaluate('''(()=>{const P=window.PLAN&&PLAN.scenes;if(!P)return DURATION*0.35;const sc=P.find(s=>s.type!=='hook')||P[0];return sc._t0+Math.min(2.2,sc._d*0.75)})()''')
        d = await pg.evaluate(f"(()=>{{seek({ct});return document.getElementById('cv').toDataURL('image/jpeg',0.93).split(',')[1]}})()")
        open(os.path.join(OUT, f'{PREFIX}_{ASPECT}_cover.jpg'), 'wb').write(base64.b64decode(d))
        await b.close()
    gw = 420 if ASPECT == '16x9' else 240
    gif = os.path.join(OUT, f'{PREFIX}_{ASPECT}_preview.gif')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-t', '6', '-i', silent, '-vf', f'fps=8,scale={gw}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4', gif], check=True)
    print('wrote', gif, os.path.getsize(gif) // 1024, 'KB', flush=True)
    vwav = HTML_PATH[:-5] + '_voice.wav'  # written by build.py when the plan has a voiceover
    if 'voiceover-mix' in MIXES and os.path.exists(vwav):
        out = os.path.join(OUT, f'{PREFIX}_{ASPECT}_voiceover.mp4')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', silent, '-f', 'f32le', '-ar', '48000', '-ac', '2', '-i', os.path.join(OUT, '_audio_voiceover-mix.f32'), '-i', vwav,
                        '-filter_complex', '[1:a][2:a]amix=inputs=2:weights=0.55 1.3:duration=first:normalize=0,alimiter=limit=0.95[o]', '-map', '0:v', '-map', '[o]',
                        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], check=True)
        print('wrote', out, os.path.getsize(out) // 1024, 'KB', flush=True)
    if 'silent' in MIXES:  # picture only, no audio track at all, for laying your own sound
        out = os.path.join(OUT, f'{PREFIX}_{ASPECT}_silent.mp4'); subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', silent, '-c', 'copy', '-an', out], check=True)
        print('wrote', out, os.path.getsize(out) // 1024, 'KB', flush=True)
    if 'voice-only' in MIXES and os.path.exists(vwav):  # the voice on its own: no music, no effects
        out = os.path.join(OUT, f'{PREFIX}_{ASPECT}_voice-only.mp4')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', silent, '-i', vwav, '-map', '0:v', '-map', '1:a', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000',
                        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], check=True)
        print('wrote', out, os.path.getsize(out) // 1024, 'KB', flush=True)
    for name in [m for m in ('sound', 'voiceover-mix', 'sfx-only') if m in MIXES]:
        out = os.path.join(OUT, f'{PREFIX}_{ASPECT}_{name}.mp4')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', silent, '-f', 'f32le', '-ar', '48000', '-ac', '2', '-i', os.path.join(OUT, f'_audio_{name}.f32'),
                        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], check=True)
        print('wrote', out, os.path.getsize(out) // 1024, 'KB', flush=True)

asyncio.run(main())
