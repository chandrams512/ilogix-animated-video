// ===== Player =====
(function () {
  const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
  const $ = (id) => document.getElementById(id);
  const scrub = $('scrub'), timeEl = $('time'), playBtn = $('play'), big = $('big');
  scrub.max = String(DURATION);
  let cur = 0, playing = false, last = 0, stopSound = null, soundOn = true, music = true, loop = true, vo = false, poster = true;
  function draw(t) {
    cur = t;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, cv.width, cv.height);
    (window.ASPECT === '9x16' ? explainerP : explainerL)(ctx, cv.width, cv.height, t);
    scrub.value = String(t); timeEl.textContent = t.toFixed(1) + ' / ' + DURATION.toFixed(1) + ' s';
  }
  // recorded voiceover (only when the plan has one): an audio element kept in step with the timeline
  const va = window.VOICE_SRC ? new Audio(window.VOICE_SRC) : null; let voiceOn = true;
  function syncVoice() { if (!va) return; if (playing && voiceOn && soundOn) { try { va.currentTime = cur; const pr = va.play(); if (pr && pr.catch) pr.catch(() => {}); } catch (e) { /* not seekable yet */ } } else va.pause(); }
  if (va) { vo = true; $('vo').setAttribute('aria-pressed', 'true'); $('vc').hidden = false; $('vc').onclick = (e) => { voiceOn = !voiceOn; e.target.setAttribute('aria-pressed', voiceOn); e.target.textContent = voiceOn ? 'Voice on' : 'Voice off'; syncVoice(); }; }
  window.ASPECT = '16x9';
  window.setAspect = (a) => { window.ASPECT = a; cv.width = a === '9x16' ? 720 : 1280; cv.height = a === '9x16' ? 1280 : 720; draw(cur); };
  window.setStyle = (n) => { useStyle(n); const sel = $('style'); if (sel) sel.value = n; draw(cur); };
  (function initStyles() {
    const sel = $('style'); styleList().forEach((o) => { const e = document.createElement('option'); e.value = o.id; e.textContent = o.label; sel.appendChild(e); });
    sel.value = ACTIVE_STYLE; sel.onchange = () => window.setStyle(sel.value);
    try { const q = new URLSearchParams(location.search).get('style'); if (q && STYLES[q]) { useStyle(q); sel.value = q; } } catch (e) { /* default style */ }
  })();
  // seekBlur: average n sub-frames across a shutter window, for real motion blur when rendering
  let acc = null; window.seekBlur = (t, n, sh) => { if (!acc || acc.width !== cv.width || acc.height !== cv.height) { acc = document.createElement('canvas'); acc.width = cv.width; acc.height = cv.height; } const a = acc.getContext('2d'); a.setTransform(1, 0, 0, 1, 0, 0); a.clearRect(0, 0, acc.width, acc.height); for (let j = 0; j < n; j++) { draw(Math.max(0, Math.min(DURATION, t + ((j + 0.5) / n - 0.5) * sh))); a.globalAlpha = 1 / (j + 1); a.drawImage(cv, 0, 0); } ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(acc, 0, 0); cur = t; };
  window.seek = (t) => draw(Math.max(0, Math.min(DURATION, t)));
  function stopSnd() { if (stopSound) { stopSound(); stopSound = null; } }
  function startSnd() { syncVoice(); stopSnd(); if (soundOn && playing) { try { stopSound = SOUND.live(scoreSound, cur, { voiceover: vo, nomusic: !music }); } catch (e) { stopSound = null; } } }
  function setPlaying(p) {
    playing = p; playBtn.textContent = p ? 'Pause' : 'Play'; playBtn.setAttribute('aria-label', p ? 'Pause' : 'Play'); big.hidden = p || !poster;
    if (p) { if (poster) { poster = false; draw(0); } last = performance.now(); startSnd(); requestAnimationFrame(frame); } else stopSnd();
    if (!p && va) va.pause();
  }
  function frame(ts) {
    if (!playing) return;
    let t = cur + (ts - last) / 1000; last = ts;
    if (t >= DURATION) {
      if (loop) { t = 0; draw(0); startSnd(); } else { draw(DURATION); setPlaying(false); return; }
    }
    draw(t); requestAnimationFrame(frame);
  }
  playBtn.onclick = big.onclick = () => { if (!playing && cur >= DURATION) draw(0); setPlaying(!playing); };
  scrub.oninput = () => { poster = false; big.hidden = true; draw(parseFloat(scrub.value)); if (playing) { last = performance.now(); startSnd(); } else { stopSnd(); if (va) va.pause(); } };
  $('snd').onclick = (e) => { soundOn = !soundOn; e.target.setAttribute('aria-pressed', soundOn); e.target.textContent = soundOn ? 'Sound on' : 'Sound off'; if (soundOn) startSnd(); else stopSnd(); };
  if (window.HAS_CAPTIONS) { $('cap').hidden = false; $('cap').onclick = (e) => { window.CAPTIONS_ON = !window.CAPTIONS_ON; e.target.setAttribute('aria-pressed', window.CAPTIONS_ON); e.target.textContent = window.CAPTIONS_ON ? 'Captions on' : 'Captions off'; draw(cur); }; }
  try { if (new URLSearchParams(location.search).get('captions') === '0') window.CAPTIONS_ON = false; } catch (e) { /* default */ }
  $('mus').onclick = (e) => { music = !music; e.target.setAttribute('aria-pressed', music); e.target.textContent = music ? 'Music on' : 'Music off'; if (playing) startSnd(); };
  $('fs').onclick = () => { const st = $('stage'); try { if (document.fullscreenElement) document.exitFullscreen(); else (st.requestFullscreen || st.webkitRequestFullscreen).call(st); } catch (e) { /* not supported */ } };
  $('vo').onclick = (e) => { vo = !vo; e.target.setAttribute('aria-pressed', vo); if (playing) startSnd(); };
  $('ar').onclick = (e) => { const v = window.ASPECT !== '9x16'; setAspect(v ? '9x16' : '16x9'); e.target.setAttribute('aria-pressed', v); e.target.textContent = v ? '16:9 wide' : '9:16 vertical'; };
  $('loop').onclick = (e) => { loop = !loop; e.target.setAttribute('aria-pressed', loop); };
  document.addEventListener('keydown', (e) => { if (e.code === 'Space' && e.target.tagName !== 'BUTTON') { e.preventDefault(); playBtn.click(); } });
  (async function init() {
    try { await Promise.all(['800 66px "Sora"', '700 26px "Sora"', '600 20px "IBM Plex Mono"'].map((f) => document.fonts.load(f, 'AaZz09?')).concat(window.HINDI ? ['600', '700', '800'].map((w) => document.fonts.load(w + ' 30px "Noto Sans Devanagari"', '\u0915\u093e\u0939')) : [])); await document.fonts.ready; if (window.PRELOAD) await Promise.all(window.PRELOAD); } catch (e) { /* draw with fallback */ }
    draw(1.2); scrub.value = '0'; timeEl.textContent = '0.0 / ' + DURATION.toFixed(1) + ' s'; cur = 0;
  })();
})();
