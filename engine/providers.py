"""Video-clip providers for the AI clips tier. Each provider turns a prompt (and optionally a still image) into an MP4 file.
Used by engine/clips.py. Add a provider by writing a function generate(prompt, image_path, secs, aspect, out_path) and listing it in PROVIDERS.

  mock   makes an abstract animated gradient with ffmpeg. Free; for testing the whole pipeline (scene, frames, badge, render) without any account.
  fal    fal.ai queue API (https://fal.ai). Needs FAL_KEY, a model id in FAL_MODEL_T2V (text to video) and/or FAL_MODEL_I2V (image to video).
         Pick the model from fal's catalogue yourself and check its price and commercial licence first; this repo does not choose one for you.
         FAL_QUEUE_URL overrides the endpoint (for tests).

Prices are never guessed here: clips.py needs --usd-per-clip (or CLIPS_USD_PER_CLIP) for any paid provider, and refuses to run past --max-usd."""
import base64, hashlib, json, mimetypes, os, subprocess, sys, time, urllib.request, urllib.error


def _run(cmd): subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def mock(prompt, image, secs, aspect, out):
    h = hashlib.sha1((prompt or image or 'x').encode()).hexdigest(); c0, c1 = '0x' + h[:6], '0x' + h[6:12]
    size = '540x960' if aspect == '9x16' else '960x540'
    _run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'gradients=size=%s:duration=%.2f:rate=24:speed=0.05:c0=%s:c1=%s:nb_colors=2' % (size, secs, c0, c1),
          '-c:v', 'libx264', '-pix_fmt', 'yuv420p', out])


def _http(url, data=None, headers=None, method=None, timeout=120):
    req = urllib.request.Request(url, data, headers or {}, method=method)
    try: return urllib.request.urlopen(req, timeout=timeout).read()
    except urllib.error.HTTPError as e: sys.exit('%s returned %s: %s' % (url.split('/')[2], e.code, e.read()[:300].decode('utf-8', 'replace')))
    except urllib.error.URLError as e: sys.exit('Could not reach %s: %s' % (url.split('/')[2], e.reason))


def fal(prompt, image, secs, aspect, out):
    key = os.environ.get('FAL_KEY')
    if not key: sys.exit('Set FAL_KEY (and FAL_MODEL_T2V / FAL_MODEL_I2V).')
    model = os.environ.get('FAL_MODEL_I2V' if image else 'FAL_MODEL_T2V')
    if not model: sys.exit('Set %s to the fal model id you chose.' % ('FAL_MODEL_I2V' if image else 'FAL_MODEL_T2V'))
    base = os.environ.get('FAL_QUEUE_URL', 'https://queue.fal.run').rstrip('/'); hdr = {'Authorization': 'Key ' + key, 'Content-Type': 'application/json'}
    body = {'prompt': prompt, 'duration': str(int(round(secs))), 'aspect_ratio': '9:16' if aspect == '9x16' else '16:9'}
    if image: body['image_url'] = 'data:%s;base64,%s' % (mimetypes.guess_type(image)[0] or 'image/jpeg', base64.b64encode(open(image, 'rb').read()).decode())
    job = json.loads(_http('%s/%s' % (base, model), json.dumps(body).encode(), hdr))
    for _ in range(180):  # up to about 15 minutes
        st = json.loads(_http(job['status_url'], headers=hdr))
        if st.get('status') == 'COMPLETED': break
        if st.get('status') in ('FAILED', 'ERROR'): sys.exit('fal job failed: %s' % json.dumps(st)[:300])
        time.sleep(5)
    else: sys.exit('fal job timed out')
    res = json.loads(_http(job['response_url'], headers=hdr)); url = (res.get('video') or {}).get('url')
    if not url: sys.exit('fal returned no video: %s' % json.dumps(res)[:300])
    open(out, 'wb').write(_http(url))


PROVIDERS = {'mock': mock, 'fal': fal}
FREE = {'mock'}
