// ===== SOUND: original synthesized sound kit (plain Web Audio, no audio files) =====
// Written from scratch for this repo. API used by scoreSound(k) functions:
//   k.hz(note)                      note name ("A3", "C#4", "Eb5") or number -> Hz
//   k.tone(t, o)                    pitched voice: f (Hz | note | [[sec, f], ...] glide), type, dur, gain, a, hold,
//                                   pan, verb, filter ('lowpass'|'highpass'|'bandpass'), f2 (cutoff), q, minor
//   k.noise(t, o)                   filtered noise: color ('white'|'pink'|'brown'), filter, f (Hz | glide), q, dur, gain, a, pan, verb, minor
//   k.play(name, t, o)              presets: tick tock click pop blip ding success impact thud stamp sparkle typing riser
//   k.bed('room', t0, t1, o)        quiet room tone (dropped in voiceover mode)
//   k.music('pad', t0, t1, o)       slow chord pad: bpm, gain, chords (dropped in voiceover mode)
//   k.withMinor(fn)                 everything scheduled inside fn counts as minor
//   k.vo                            true in voiceover mix
// Options: voiceover (quieter effects) and nomusic (drop bed and pad only, effects at full level, for laying your own music).
// Voiceover mix: no bed or music, minor sounds at 60%, all effects a little lower.
// Entry points: SOUND.live(score, fromT, {voiceover}) -> stop(); SOUND.renderOffline(score, dur, sampleRate, {voiceover}).
(function () {
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function hz(n) {
    if (typeof n === 'number') return n;
    const m = /^([A-Ga-g])([#b]?)(-?\d)$/.exec(String(n));
    if (!m) return 440;
    const semis = NOTE[m[1].toUpperCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) + 1) * 12;
    return 440 * Math.pow(2, (semis - 69) / 12);
  }
  // Deterministic random so live playback, seeking and offline render agree.
  function rng(seed) {
    let s = (seed >>> 0) || 1;
    return function () { s = (s + 0x6d2b79f5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  }
  const seedOf = (name, t, i) => { let h = 2166136261; for (const ch of name) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return (h ^ Math.round(t * 1000) ^ (i || 0) * 7919) >>> 0; };

  const cache = new WeakMap();
  function assets(ctx) {
    let a = cache.get(ctx);
    if (a) return a;
    const sr = ctx.sampleRate, len = sr * 2, r = rng(12345);
    const mk = (fn) => { const b = ctx.createBuffer(1, len, sr), d = b.getChannelData(0); fn(d); return b; };
    const white = mk((d) => { for (let i = 0; i < len; i++) d[i] = r() * 2 - 1; });
    const pink = mk((d) => { let b0 = 0, b1 = 0, b2 = 0; for (let i = 0; i < len; i++) { const w = r() * 2 - 1; b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2; } });
    const brown = mk((d) => { let l = 0; for (let i = 0; i < len; i++) { l = (l + 0.02 * (r() * 2 - 1)) / 1.02; d[i] = l * 3.5; } });
    const irLen = Math.floor(sr * 1.6), ir = ctx.createBuffer(2, irLen, sr);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c), rr = rng(777 + c); for (let i = 0; i < irLen; i++) d[i] = (rr() * 2 - 1) * Math.pow(1 - i / irLen, 3.2); }
    a = { white, pink, brown, ir };
    cache.set(ctx, a);
    return a;
  }

  // Build a kit on ctx. base = ctx time that score time 0 maps to; from = score time to start at (live seeking).
  function kit(ctx, opts) {
    opts = opts || {};
    const vo = !!opts.voiceover, nomusic = vo || !!opts.nomusic, base = opts.base || 0, from = opts.from || 0, A = assets(ctx);
    const master = ctx.createGain(); master.gain.value = opts.master == null ? 0.85 : opts.master;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 14; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
    master.connect(comp); comp.connect(ctx.destination);
    const conv = ctx.createConvolver(); conv.buffer = A.ir;
    const wet = ctx.createGain(); wet.gain.value = 0.8; conv.connect(wet); wet.connect(master);
    const nodes = []; let minorDepth = 0;
    const abs = (t) => base + t;
    const live = (t, dur) => t + (dur || 0) >= from - 0.01 && t >= from - 0.01;
    const level = (o) => { const minor = o.minor || minorDepth > 0; return vo ? (minor ? 0.6 : 0.85) : 1; };

    // pan -> dry out + reverb send
    function out(node, o, t) {
      let n = node;
      if (o.pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, o.pan)); n.connect(p); n = p; nodes.push(p); }
      n.connect(master);
      if (o.verb) { const s = ctx.createGain(); s.gain.value = o.verb; n.connect(s); s.connect(conv); nodes.push(s); }
    }
    function glide(param, f, s, dur) {
      if (Array.isArray(f)) {
        param.setValueAtTime(Math.max(1, hz(f[0][1])), s + f[0][0]);
        for (let i = 1; i < f.length; i++) param.exponentialRampToValueAtTime(Math.max(1, hz(f[i][1])), s + Math.min(dur, f[i][0]));
      } else param.setValueAtTime(Math.max(1, hz(f)), s);
    }
    function env(g, s, dur, peak, a, hold) {
      a = Math.min(Math.max(a, 0.001), dur * 0.8);
      g.gain.setValueAtTime(0.0001, s);
      g.gain.linearRampToValueAtTime(peak, s + a);
      const h = Math.min(hold || 0, dur - a - 0.01);
      if (h > 0) g.gain.setValueAtTime(peak, s + a + h);
      g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    }

    const k = {
      vo, hz, nodes,
      withMinor(fn) { minorDepth++; try { fn(); } finally { minorDepth--; } },
      tone(t, o) {
        o = o || {}; const dur = o.dur || 0.3;
        if (!live(t, dur)) return;
        const s = abs(t), osc = ctx.createOscillator(); osc.type = o.type || 'sine';
        glide(osc.frequency, o.f == null ? 440 : o.f, s, dur);
        if (o.detune) osc.detune.value = o.detune;
        const g = ctx.createGain(); env(g, s, dur, (o.gain == null ? 0.2 : o.gain) * level(o), o.a == null ? 0.005 : o.a, o.hold);
        osc.connect(g);
        let n = g;
        if (o.filter || o.f2) { const f = ctx.createBiquadFilter(); f.type = o.filter || 'lowpass'; f.Q.value = o.q || 0.7; f.frequency.value = o.f2 || 2000; g.connect(f); n = f; nodes.push(f); }
        out(n, o, t); osc.start(s); osc.stop(s + dur + 0.05); nodes.push(osc, g);
      },
      noise(t, o) {
        o = o || {}; const dur = o.dur || 0.3;
        if (!live(t, dur)) return;
        const s = abs(t), src = ctx.createBufferSource(); src.buffer = A[o.color] || A.white; src.loop = true;
        const r = rng(seedOf('n', t, Math.round(dur * 100)));
        const g = ctx.createGain(); env(g, s, dur, (o.gain == null ? 0.2 : o.gain) * level(o), o.a == null ? 0.004 : o.a, 0);
        src.connect(g);
        let n = g;
        if (o.filter) {
          const f = ctx.createBiquadFilter(); f.type = o.filter; f.Q.value = o.q || 0.7;
          glide(f.frequency, o.f == null ? 1000 : o.f, s, dur);
          g.connect(f); n = f; nodes.push(f);
        }
        out(n, o, t); src.start(s, r() * 1.5); src.stop(s + dur + 0.05); nodes.push(src, g);
      },
      bed(name, t0, t1, o) {
        if (nomusic || t1 <= from) return; o = o || {};
        const a = Math.max(t0, from), s = abs(a), dur = t1 - a, fade = Math.min(0.4, dur / 3);
        const src = ctx.createBufferSource(); src.buffer = A.brown; src.loop = true;
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420;
        const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, s);
        g.gain.linearRampToValueAtTime(0.09 * (o.gain == null ? 1 : o.gain), s + fade);
        g.gain.setValueAtTime(0.09 * (o.gain == null ? 1 : o.gain), s + dur - fade);
        g.gain.linearRampToValueAtTime(0.0001, s + dur);
        src.connect(f); f.connect(g); g.connect(master); src.start(s); src.stop(s + dur + 0.05); nodes.push(src, f, g);
      },
      music(name, t0, t1, o) {
        if (nomusic || t1 <= from) return; o = o || {};
        const bpm = o.bpm || 70, bar = (60 / bpm) * 4, chords = o.chords || [['A3', 'C4', 'E4', 'G4']], gain = (o.gain == null ? 1 : o.gain) * 0.028;
        for (let i = 0, t = t0; t < t1; i++, t += bar) {
          const len = Math.min(bar * 1.25, t1 - t); if (t + len <= from) continue;
          const st = Math.max(t, from), s = abs(st), d = t + len - st;
          chords[i % chords.length].forEach((n, j) => {
            const osc = ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.value = hz(n); osc.detune.value = (j - 1.5) * 4;
            const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1100;
            const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, s);
            g.gain.linearRampToValueAtTime(gain, s + Math.min(1.2, d * 0.4));
            g.gain.setValueAtTime(gain, s + Math.max(0.01, d - 1.0)); g.gain.linearRampToValueAtTime(0.0001, s + d);
            osc.connect(f); f.connect(g); g.connect(master); const sv = ctx.createGain(); sv.gain.value = 0.35; g.connect(sv); sv.connect(conv);
            osc.start(s); osc.stop(s + d + 0.05); nodes.push(osc, f, g, sv);
          });
        }
      },
      play(name, t, o) {
        o = o || {}; const gn = o.gain == null ? 1 : o.gain, m = !!o.minor, mk = (x) => Object.assign({ minor: m }, x);
        switch (name) {
          case 'tick': k.noise(t, mk({ dur: 0.03, filter: 'highpass', f: 4000, gain: 0.16 * gn, a: 0.001, pan: o.pan })); k.tone(t, mk({ f: 2600, dur: 0.025, gain: 0.05 * gn, a: 0.001, pan: o.pan })); break;
          case 'tock': k.tone(t, mk({ f: [[0, (o.f || 700) * 1.2], [0.04, o.f || 700]], dur: 0.07, gain: 0.14 * gn, a: 0.002, pan: o.pan })); break;
          case 'click': k.noise(t, mk({ dur: 0.02, filter: 'highpass', f: 3000, gain: 0.3 * gn, a: 0.001, pan: o.pan })); k.tone(t, mk({ f: 1500, dur: 0.03, gain: 0.1 * gn, a: 0.001, pan: o.pan })); break;
          case 'pop': k.tone(t, mk({ f: [[0, 380], [0.07, 980]], dur: 0.14, gain: 0.22 * gn, a: 0.003, pan: o.pan, verb: 0.12 })); break;
          case 'blip': k.tone(t, mk({ f: o.f || 'E5', type: 'triangle', dur: o.dur || 0.09, gain: 0.16 * gn, a: 0.003, pan: o.pan, verb: 0.2 })); break;
          case 'ding': { const f = hz(o.f || 'C6'); k.tone(t, mk({ f, dur: 1.0, gain: 0.14 * gn, a: 0.002, pan: o.pan, verb: 0.35 })); k.tone(t, mk({ f: f * 2.76, dur: 0.4, gain: 0.04 * gn, a: 0.002, pan: o.pan, verb: 0.3 })); break; }
          case 'success': k.play('ding', t, { f: 'C6', gain: 0.8 * gn, pan: o.pan, minor: m }); k.play('ding', t + 0.11, { f: 'G6', gain: 0.9 * gn, pan: o.pan, minor: m }); break;
          case 'impact': k.tone(t, mk({ f: [[0, 90], [0.5, 34]], dur: 0.9, gain: 0.5 * gn, a: 0.004, pan: o.pan, verb: 0.2 })); k.noise(t, mk({ dur: 0.5, filter: 'lowpass', f: [[0, 2400], [0.45, 200]], gain: 0.28 * gn, a: 0.002, color: 'brown' })); break;
          case 'thud': { const f = o.f || 90; k.tone(t, mk({ f: [[0, f * 1.5], [0.25, f * 0.55]], dur: 0.4, gain: 0.4 * gn, a: 0.003, pan: o.pan })); break; }
          case 'stamp': k.noise(t, mk({ dur: 0.06, filter: 'bandpass', f: 1800, q: 0.9, gain: 0.3 * gn, a: 0.001, pan: o.pan })); k.play('thud', t, { f: 140, gain: 0.7 * gn, minor: m }); break;
          case 'sparkle': { const n = o.n || 5, r = rng(seedOf('sp', t)); for (let i = 0; i < n; i++) k.tone(t + i * 0.05 + r() * 0.02, mk({ f: 2200 + r() * 3600, dur: 0.22, gain: 0.07 * gn, a: 0.002, verb: 0.4, pan: (r() - 0.5) * 0.8 })); break; }
          case 'typing': { const n = o.n || 8, rate = o.rate || 0.06, r = rng(seedOf('ty', t)); for (let i = 0; i < n; i++) { const tt = t + i * rate + r() * 0.012; k.noise(tt, mk({ dur: 0.025, filter: 'highpass', f: 2500 + r() * 1500, gain: 0.13 * gn, a: 0.001 })); k.tone(tt, mk({ f: 1100 + r() * 500, dur: 0.02, gain: 0.04 * gn, a: 0.001 })); } break; }
          case 'riser': { const d = o.dur || 0.8; k.noise(t, mk({ dur: d, color: 'pink', filter: 'bandpass', f: [[0, 300], [d, 4200]], q: 0.8, gain: 0.3 * gn, a: d * 0.85, pan: o.pan, verb: 0.2 })); k.tone(t, mk({ f: [[0, 160], [d, 640]], type: 'triangle', dur: d, gain: 0.07 * gn, a: d * 0.85 })); break; }
        }
      },
    };
    k.stop = function () { try { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0, ctx.currentTime, 0.02); } catch (e) {} setTimeout(() => { nodes.forEach((n) => { try { if (n.stop) n.stop(); } catch (e) {} try { n.disconnect(); } catch (e) {} }); try { master.disconnect(); comp.disconnect(); conv.disconnect(); wet.disconnect(); } catch (e) {} }, 120); };
    return k;
  }

  let liveCtx = null;
  const SOUND = {
    kit,
    hz,
    // Start the score from explainer time fromT right now; returns stop().
    live(fn, fromT, opts) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!liveCtx) liveCtx = new Ctx();
      if (liveCtx.state === 'suspended') liveCtx.resume();
      const k = kit(liveCtx, { voiceover: !!(opts && opts.voiceover), base: liveCtx.currentTime + 0.06 - (fromT || 0), from: fromT || 0 });
      fn(k);
      return function () { k.stop(); };
    },
    // Render the whole score offline. Returns { inter: Float32Array (interleaved stereo), peak }.
    async renderOffline(fn, duration, sampleRate, kitOpts) {
      const sr = sampleRate || 48000, ctx = new OfflineAudioContext(2, Math.ceil(duration * sr), sr);
      const k = kit(ctx, Object.assign({}, kitOpts, { base: 0, from: 0 }));
      fn(k);
      const buf = await ctx.startRendering(), L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length, inter = new Float32Array(n * 2);
      let peak = 0;
      for (let i = 0; i < n; i++) { inter[2 * i] = L[i]; inter[2 * i + 1] = R[i]; const a = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (a > peak) peak = a; }
      if (peak > 0.95) { const s = 0.95 / peak; for (let i = 0; i < inter.length; i++) inter[i] *= s; peak = 0.95; }
      return { inter, peak };
    },
  };
  window.SOUND = SOUND;
})();
