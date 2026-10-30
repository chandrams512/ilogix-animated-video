#!/usr/bin/env python3
"""Render a built player HTML to MP4.
Usage: python3 engine/render.py <16x9|9x16> <outdir> [html_path] [name_prefix]
Defaults: dist/ilogix_voice_agents.html, prefix 'ilogix'.
Renders frames once (silent), renders both audio mixes offline, then muxes:
  ilogix_<aspect>_sound.mp4 (full effects + music pad)  and  ilogix_<aspect>_voiceover-mix.mp4 (quieter, no pad)."""
import asyncio, base64, subprocess, sys, os
from playwright.async_api import async_playwright

ASPECT, OUT = sys.argv[1], sys.argv[2]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_PATH = os.path.abspath(sys.argv[3]) if len(sys.argv) > 3 else os.path.join(ROOT, 'dist', 'ilogix_voice_agents.html')
PREFIX = sys.argv[4] if len(sys.argv) > 4 else 'ilogix'
FPS = 30
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
        await pg.evaluate(f"setAspect('{ASPECT}')")
        dur = await pg.evaluate('window.DURATION')
        n = round(dur * FPS)
        # audio first (offline render, both mixes)
        for name, vo in (('sound', 'false'), ('voiceover-mix', 'true')):
            js = f"""(async()=>{{const r=await SOUND.renderOffline(window.scoreSound,window.DURATION,48000,{{voiceover:{vo}}});
              const by=new Uint8Array(r.inter.buffer);let s='';for(let i=0;i<by.length;i+=0x8000)s+=String.fromCharCode.apply(null,by.subarray(i,i+0x8000));
              return {{peak:r.peak,b64:btoa(s)}};}})()"""
            r = await pg.evaluate(js)
            open(os.path.join(OUT, f'_audio_{name}.f32'), 'wb').write(base64.b64decode(r['b64']))
            print(name, 'audio peak', round(r['peak'], 3), flush=True)
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                               '-vf', SCALE, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', '-movflags', '+faststart', silent],
                              stdin=subprocess.PIPE)
        for i in range(n):
            d = await pg.evaluate(f"(()=>{{seek({i / FPS});return document.getElementById('cv').toDataURL('image/jpeg',0.97).split(',')[1]}})()")
            ff.stdin.write(base64.b64decode(d))
            if i % 150 == 0: print('frame', i, '/', n, flush=True)
        ff.stdin.close(); ff.wait()
        await b.close()
    for name in ('sound', 'voiceover-mix'):
        out = os.path.join(OUT, f'{PREFIX}_{ASPECT}_{name}.mp4')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', silent, '-f', 'f32le', '-ar', '48000', '-ac', '2', '-i', os.path.join(OUT, f'_audio_{name}.f32'),
                        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], check=True)
        print('wrote', out, os.path.getsize(out) // 1024, 'KB', flush=True)

asyncio.run(main())
