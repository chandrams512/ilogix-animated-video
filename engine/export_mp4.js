// export_mp4.js: renders earth_water_explainer.html to an MP4 (1280x720, 30 fps) with its synthesized sound.
// Usage:  node export_mp4.js earth_water_explainer.html earth_water.mp4 [--vo] [--fps=30]
//   --vo   use the quieter "voiceover mix" (no music bed) so you can lay a voiceover on top
// Needs: Node 18+, `npm i puppeteer`, and ffmpeg on your PATH.
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flags = process.argv.slice(2).filter((a) => a.startsWith('--'));
const input = path.resolve(args[0] || 'earth_water_explainer.html');
const output = path.resolve(args[1] || 'earth_water.mp4');
const vo = flags.includes('--vo');
const fps = Number((flags.find((f) => f.startsWith('--fps=')) || '--fps=30').split('=')[1]);

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.goto('file://' + input, { waitUntil: 'networkidle0' });
  await page.waitForFunction('typeof window.seek === "function" && typeof window.DURATION === "number"');
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1500)); // let the web fonts settle
  const duration = await page.evaluate(() => window.DURATION);
  const frames = Math.round(duration * fps);

  // 1. Render the sound offline and save it as raw 32-bit stereo floats.
  console.log('Rendering audio...');
  const b64 = await page.evaluate(async (voice) => {
    const r = await SOUND.renderOffline(window.scoreSound, window.DURATION, 48000, { voiceover: voice });
    const bytes = new Uint8Array(r.inter.buffer); let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }, vo);
  const audioPath = path.join(os.tmpdir(), 'earth_water_audio.f32');
  fs.writeFileSync(audioPath, Buffer.from(b64, 'base64'));

  // 2. Pipe every video frame into ffmpeg together with the audio.
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-f', 'f32le', '-ar', '48000', '-ac', '2', '-i', audioPath,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-preset', 'medium',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', output], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => { ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg exited with ' + c)))); ff.on('error', rej); });

  for (let i = 0; i < frames; i++) {
    const png = await page.evaluate((t) => { window.seek(t); return document.getElementById('cv').toDataURL('image/png').split(',')[1]; }, i / fps);
    if (!ff.stdin.write(Buffer.from(png, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 30 === 0) process.stdout.write('\rFrame ' + i + ' / ' + frames);
  }
  ff.stdin.end();
  await done;
  await browser.close();
  console.log('\nDone: ' + output);
})().catch((e) => { console.error(e); process.exit(1); });
