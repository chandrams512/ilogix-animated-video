#!/usr/bin/env python3
"""Make a voiceover for a plan: one audio file per scene 'say' line, and the timings build.py needs.

Usage:  python3 engine/tts.py plans/<name>/plan.json [--provider estimate|azure|elevenlabs|edge|kokoro|piper|file] [--voice NAME] [--lang en|hi] [--rate 1.0] [--force]
Output: plans/<name>/voice/scene-01.mp3 ... and voice/voice.json (durations). Then run build.py: it stretches each scene to fit its line,
        times the captions to the voice, and writes dist/<name>_voice.wav (and .mp3 for the player). render.py adds a *_voiceover.mp4.

Providers (set the keys as environment variables; none are stored in the repo):
  estimate    no audio engine: writes silent files of an estimated length. For checking timing and layout before you spend anything.
  azure       Azure AI Speech REST.  AZURE_TTS_KEY, AZURE_TTS_REGION (e.g. centralindia). Default voices: en-IN-NeerjaNeural, hi-IN-SwaraNeural.
  elevenlabs  ElevenLabs REST.       ELEVENLABS_API_KEY, ELEVENLABS_VOICE (voice id). Model eleven_multilingual_v2 (override ELEVENLABS_MODEL); handles Hindi.
  edge        the edge-tts package (pip install edge-tts). TESTING ONLY: Microsoft publishes no commercial licence for it.
  kokoro      free, offline, no key (pip install kokoro soundfile; needs espeak-ng). Open Apache-2.0 model, runs on your computer. --voice af_heart (default),
              Hindi: hf_alpha / hf_beta (set --lang hi). Check the licence of the voice pack you use before selling.
  piper       free, offline (pip install piper-tts). Needs a voice file: --voice path/to/voice.onnx or PIPER_MODEL. Licences differ per voice: check the voice's card.
  file        your own recordings: put scene-01.mp3 (or .wav/.m4a/.ogg) in the voice folder. Nothing is sent anywhere.
Lines already made are reused (cache in voice/cache.json) unless --force, so a re-run costs nothing. The plan's 'lang' key picks the default language.
Check the commercial terms of the provider and the voice before you sell videos that use it."""
import argparse, asyncio, hashlib, json, os, re, subprocess, sys, urllib.request, urllib.error
from xml.sax.saxutils import escape

AZURE_VOICES = {'en': 'en-IN-NeerjaNeural', 'hi': 'hi-IN-SwaraNeural'}

def duration(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True)
    return round(float(r.stdout.strip()), 3)

def post(url, data, headers, timeout=120):
    req = urllib.request.Request(url, data, headers)
    try: return urllib.request.urlopen(req, timeout=timeout).read()
    except urllib.error.HTTPError as e: sys.exit('%s returned %s: %s' % (url.split('/')[2], e.code, e.read()[:300].decode('utf-8', 'replace')))
    except urllib.error.URLError as e: sys.exit('Could not reach %s: %s' % (url.split('/')[2], e.reason))

def estimate(text, out, lang, rate):
    words = len(text.split()); secs = max(1.2, words / (2.2 if lang == 'hi' else 2.6) / rate + 0.3)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '%.2f' % secs, '-c:a', 'libmp3lame', '-b:a', '32k', out], check=True)

def azure(text, out, lang, rate, voice):
    key = os.environ.get('AZURE_TTS_KEY'); region = os.environ.get('AZURE_TTS_REGION', 'centralindia')
    if not key: sys.exit('Set AZURE_TTS_KEY (and AZURE_TTS_REGION).')
    voice = voice or AZURE_VOICES.get(lang, AZURE_VOICES['en']); loc = '-'.join(voice.split('-')[:2])
    ssml = ("<speak version='1.0' xml:lang='%s' xmlns='http://www.w3.org/2001/10/synthesis'><voice name='%s'><prosody rate='%+d%%'>%s</prosody></voice></speak>"
            % (loc, voice, round((rate - 1) * 100), escape(text)))
    url = os.environ.get('AZURE_TTS_ENDPOINT') or 'https://%s.tts.speech.microsoft.com/cognitiveservices/v1' % region
    open(out, 'wb').write(post(url, ssml.encode('utf-8'), {'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml',
                                                          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'User-Agent': 'ilogix-animated-video'}))

def elevenlabs(text, out, lang, rate, voice):
    key = os.environ.get('ELEVENLABS_API_KEY'); vid = voice or os.environ.get('ELEVENLABS_VOICE')
    if not key or not vid: sys.exit('Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE (or pass --voice <voice id>).')
    base = os.environ.get('ELEVENLABS_BASE_URL', 'https://api.elevenlabs.io').rstrip('/')
    body = {'text': text, 'model_id': os.environ.get('ELEVENLABS_MODEL', 'eleven_multilingual_v2'), 'voice_settings': {'stability': 0.5, 'similarity_boost': 0.75, 'speed': max(0.7, min(1.2, rate))}}
    open(out, 'wb').write(post('%s/v1/text-to-speech/%s?output_format=mp3_44100_64' % (base, vid), json.dumps(body).encode(), {'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'}))

def edge(text, out, lang, rate, voice):
    try: import edge_tts
    except ImportError: sys.exit('pip install edge-tts (testing only, no commercial licence).')
    voice = voice or AZURE_VOICES.get(lang, AZURE_VOICES['en'])
    asyncio.run(edge_tts.Communicate(text, voice, rate='%+d%%' % round((rate - 1) * 100)).save(out))

def _to_mp3(wav, out):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '64k', out], check=True)

def kokoro(text, out, lang, rate, voice):
    try: import kokoro as K, soundfile as sf, numpy as np
    except ImportError: sys.exit('pip install kokoro soundfile  (and install espeak-ng). Free and offline; first run downloads the model.')
    voice = voice or ('hf_alpha' if lang == 'hi' else 'af_heart'); code = {'hi': 'h'}.get(lang, voice[0] if voice[0] in 'abefhijpz' else 'a')
    pipe = K.KPipeline(lang_code=code); parts = [np.asarray(a) for _, _, a in pipe(text, voice=voice, speed=rate)]
    if not parts: sys.exit('kokoro made no audio for: %s' % text[:60])
    wav = out + '.tmp.wav'; sf.write(wav, np.concatenate(parts), 24000); _to_mp3(wav, out); os.remove(wav)

def piper(text, out, lang, rate, voice):
    model = voice or os.environ.get('PIPER_MODEL')
    if not model or not os.path.exists(model): sys.exit('Piper needs a voice file: pass --voice path/to/voice.onnx or set PIPER_MODEL. (pip install piper-tts; voices: the Piper voice list.)')
    wav = out + '.tmp.wav'; cmd = [os.environ.get('PIPER_BIN', 'piper'), '--model', model, '--output_file', wav, '--length_scale', '%.3f' % (1.0 / max(0.5, rate))]
    try: subprocess.run(cmd, input=text.encode('utf-8'), check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except FileNotFoundError: sys.exit('The piper command was not found: pip install piper-tts (or set PIPER_BIN).')
    except subprocess.CalledProcessError: sys.exit('piper failed: check the voice file and that it has its .onnx.json next to it.')
    _to_mp3(wav, out); os.remove(wav)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('plan'); ap.add_argument('--provider', default='estimate', choices=['estimate', 'azure', 'elevenlabs', 'edge', 'kokoro', 'piper', 'file'])
    ap.add_argument('--voice'); ap.add_argument('--lang'); ap.add_argument('--rate', type=float, default=1.0); ap.add_argument('--force', action='store_true')
    a = ap.parse_args(); plan = json.load(open(a.plan, encoding='utf-8')); lang = a.lang or plan.get('lang', 'en')
    vdir = os.path.join(os.path.dirname(os.path.abspath(a.plan)), 'voice'); os.makedirs(vdir, exist_ok=True)
    cpath = os.path.join(vdir, 'cache.json'); cache = json.load(open(cpath)) if os.path.exists(cpath) else {}
    items = []; made = 0
    for i, sc in enumerate(plan['scenes'], 1):
        text = (sc.get('say') or '').strip()
        if not text: continue
        name = 'scene-%02d.mp3' % i; path = os.path.join(vdir, name)
        if a.provider == 'file':
            found = [f for ext in ('mp3', 'wav', 'm4a', 'ogg') for f in [os.path.join(vdir, 'scene-%02d.%s' % (i, ext))] if os.path.exists(f)]
            if not found: print('scene %d: no recording (expected %s)' % (i, name)); continue
            path = found[0]; name = os.path.basename(path)
        else:
            key = hashlib.sha1('|'.join([a.provider, a.voice or '', lang, str(a.rate), text]).encode('utf-8')).hexdigest()
            if a.force or cache.get(name) != key or not os.path.exists(path):
                if a.provider == 'estimate': estimate(text, path, lang, a.rate)
                elif a.provider == 'azure': azure(text, path, lang, a.rate, a.voice)
                elif a.provider == 'elevenlabs': elevenlabs(text, path, lang, a.rate, a.voice)
                elif a.provider == 'kokoro': kokoro(text, path, lang, a.rate, a.voice)
                elif a.provider == 'piper': piper(text, path, lang, a.rate, a.voice)
                else: edge(text, path, lang, a.rate, a.voice)
                cache[name] = key; made += 1
        items.append({'scene': i, 'file': name, 'dur': duration(path)})
    json.dump(cache, open(cpath, 'w'), indent=1)
    json.dump({'provider': a.provider, 'voice': a.voice or '', 'lang': lang, 'placeholder': a.provider == 'estimate', 'items': items}, open(os.path.join(vdir, 'voice.json'), 'w'), indent=1)
    print('%d line(s) ready (%d new) -> %s' % (len(items), made, os.path.relpath(vdir)))
    if a.provider == 'estimate': print('Placeholder timing only (silent). Run again with a real provider or your own recordings.')

if __name__ == '__main__': main()
