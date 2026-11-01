// ===== SOUND: original synthesized sound kit (plain Web Audio, no audio files) =====
// Written from scratch for this repo. API used by scoreSound(k) functions:
//   k.hz(note)                      note name ("A3", "C#4", "Eb5") or number -> Hz
//   k.tone(t, o)                    pitched voice: f (Hz | note | [[sec, f], ...] glide), type, dur, gain, a, hold,
//                                   pan, verb, filter ('lowpass'|'highpass'|'bandpass'), f2 (cutoff), q, minor
//   k.noise(t, o)                   filtered noise: color ('white'|'pink'|'brown'), filter, f (Hz | glide), q, dur, gain, a, pan, verb, minor
//   k.play(name, t, o)              presets: tick tock click pop blip ding success impact thud stamp sparkle typing riser
//   k.sample(t, cue, o)             play a library sound (window.SFX_BUF[cue]); k.play("cue:NAME") falls back to a preset
//   k.music("pulse"|"chip"|"wave", ...) rhythmic beds as well as the "pad"
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


    // Rhythmic beds: pulse (soft kick, hat and bass), chip (square arpeggio), wave (saw bass and arpeggio). All quiet; dropped in voiceover mode.
    function music2(name, t0, t1, o) {
      const bpm = o.bpm || (name === 'chip' ? 120 : name === 'wave' ? 96 : 100), beat = 60 / bpm, g0 = (o.gain == null ? 1 : o.gain), chords = o.chords || [['C4', 'E4', 'G4', 'B4'], ['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['G3', 'B3', 'D4', 'F4']];
      const bar = beat * 4; let step = 0;
      for (let t = t0; t < t1 - 0.05; t += beat / 2, step++) {
        if (t + beat < from) continue; const ch = chords[Math.floor(t / bar) % chords.length], b8 = step % 8, rt = ch[0];
        if (name === 'pulse') {
          if (b8 % 2 === 0 && (b8 === 0 || b8 === 4 || b8 === 2 && step % 16 === 10)) k.tone(t, { f: [[0, 110], [0.12, 46]], dur: 0.2, gain: 0.2 * g0, a: 0.002, minor: true });
          if (b8 % 2 === 1) k.noise(t, { dur: 0.04, filter: 'highpass', f: 7000, gain: 0.05 * g0, a: 0.001, minor: true });
          if (b8 === 0 || b8 === 3 || b8 === 6) k.tone(t, { f: hz(rt) / 2, type: 'triangle', dur: beat * 0.9, gain: 0.07 * g0, a: 0.01, minor: true });
        } else if (name === 'chip') {
          k.tone(t, { f: ch[b8 % ch.length], type: 'square', dur: beat * 0.45, gain: 0.025 * g0, a: 0.003, filter: 'lowpass', f2: 3200, minor: true });
          if (b8 === 0 || b8 === 4) k.tone(t, { f: hz(rt) / 2, type: 'triangle', dur: beat * 1.6, gain: 0.06 * g0, a: 0.005, minor: true });
          if (b8 === 2 || b8 === 6) k.noise(t, { dur: 0.03, filter: 'highpass', f: 6000, gain: 0.04 * g0, a: 0.001, minor: true });
        } else {
          k.tone(t, { f: ch[(b8 >> 1) % ch.length], type: 'sawtooth', dur: beat * 0.9, gain: 0.022 * g0, a: 0.01, filter: 'lowpass', f2: 1700, verb: 0.15, minor: true });
          if (b8 === 0 || b8 === 3 || b8 === 4 || b8 === 7) k.tone(t, { f: hz(rt) / 2, type: 'sawtooth', dur: beat * 0.7, gain: 0.05 * g0, a: 0.01, filter: 'lowpass', f2: 380, minor: true });
          if (b8 === 0) k.tone(t, { f: [[0, 100], [0.14, 44]], dur: 0.22, gain: 0.16 * g0, a: 0.002, minor: true });
        }
      }
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
        if (name === 'pulse' || name === 'chip' || name === 'wave') { music2(name, t0, t1, o); return; }
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
      // sample(t, cue, o): play a decoded library sound (window.SFX_BUF[cue]); returns false if that cue is not loaded
      sample(t, cue, o) {
        o = o || {}; const B = window.SFX_BUF && window.SFX_BUF[cue]; if (!B) return false;
        const dur = B.duration / (o.rate || 1); if (!live(t, dur)) return true;
        const s = abs(t), src = ctx.createBufferSource(); src.buffer = B; if (o.rate) src.playbackRate.value = o.rate;
        const vol = (window.SFX_VOL && window.SFX_VOL[cue]) || 0.2, g = ctx.createGain(); window.SFX_NORM = window.SFX_NORM || {};
        if (window.SFX_NORM[cue] == null) { let pk = 0.0001; for (let c = 0; c < B.numberOfChannels; c++) { const d = B.getChannelData(c); for (let i = 0; i < d.length; i++) { const v = d[i] < 0 ? -d[i] : d[i]; if (v > pk) pk = v; } } window.SFX_NORM[cue] = 0.3 / pk; }   // every library sound is levelled to the same peak, then scaled by its own recommended volume
        g.gain.value = (o.gain == null ? 1 : o.gain) * (vol / 0.2) * window.SFX_NORM[cue] * level(o);
        src.connect(g); out(g, o, t); src.start(s); nodes.push(src, g); return true;
      },
      play(name, t, o) {
        o = o || {}; const gn = o.gain == null ? 1 : o.gain, m = !!o.minor, mk = (x) => Object.assign({ minor: m }, x);
        if (name.indexOf('cue:') === 0) { const c = name.slice(4); if (k.sample(t, c, o)) return; name = (window.CUE_FALLBACK && window.CUE_FALLBACK[c]) || 'pop'; }
        else if (!o.synth) { const cue = window.ROLE_CUE && window.ROLE_CUE[name]; if (cue && window.SFX_BUF && window.SFX_BUF[cue]) { k.sample(t, cue, o); if (!(window.ROLE_LAYER && window.ROLE_LAYER[name])) return; o = Object.assign({}, o, { gain: gn * 0.6 }); } }
        if (window.SYNTH_ALIAS && window.SYNTH_ALIAS[name] && !o.noalias) name = window.SYNTH_ALIAS[name];
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
          case 'whoosh': { const d = o.dur || 0.5; k.noise(t, mk({ dur: d, color: 'pink', filter: 'bandpass', f: [[0, 400], [d * 0.45, 3800], [d, 700]], q: 0.9, gain: 0.34 * gn, a: d * 0.4, pan: o.pan, verb: 0.15 })); k.tone(t, mk({ f: [[0, 220], [d, 90]], dur: d, gain: 0.05 * gn, a: d * 0.4, pan: o.pan })); break; }
          case 'swipe': k.noise(t, mk({ dur: 0.22, filter: 'bandpass', f: [[0, 1200], [0.2, 4200]], q: 0.8, gain: 0.26 * gn, a: 0.05, pan: o.pan })); break;
          case 'snap': k.noise(t, mk({ dur: 0.03, filter: 'highpass', f: 2500, gain: 0.3 * gn, a: 0.001, pan: o.pan })); k.tone(t, mk({ f: [[0, 1300], [0.05, 650]], dur: 0.06, gain: 0.14 * gn, a: 0.001, pan: o.pan })); break;
          case 'clack': k.noise(t, mk({ dur: 0.035, filter: 'bandpass', f: 2600, q: 1.2, gain: 0.3 * gn, a: 0.001, pan: o.pan })); k.tone(t, mk({ f: [[0, 260], [0.05, 150]], dur: 0.07, gain: 0.16 * gn, a: 0.001, pan: o.pan })); break;
          case 'flap': { const n = o.n || 5, r = rng(seedOf('fl', t)); for (let i = 0; i < n; i++) k.play('clack', t + i * 0.045 + r() * 0.012, { gain: (0.5 + 0.4 * r()) * gn, pan: o.pan, minor: m, noalias: true }); break; }
          case 'thock': k.tone(t, mk({ f: [[0, 190], [0.06, 95]], dur: 0.1, gain: 0.26 * gn, a: 0.001, pan: o.pan })); k.noise(t, mk({ dur: 0.04, filter: 'lowpass', f: 900, gain: 0.2 * gn, a: 0.001, pan: o.pan })); break;
          case 'bubble': k.tone(t, mk({ f: [[0, 320], [0.1, 980]], dur: 0.14, gain: 0.2 * gn, a: 0.004, pan: o.pan, verb: 0.2 })); k.tone(t + 0.07, mk({ f: [[0, 520], [0.08, 1400]], dur: 0.1, gain: 0.1 * gn, a: 0.003, pan: o.pan, verb: 0.2 })); break;
          case 'drip': k.tone(t, mk({ f: [[0, 1500], [0.09, 520]], dur: 0.16, gain: 0.2 * gn, a: 0.002, pan: o.pan, verb: 0.35 })); break;
          case 'zap': k.tone(t, mk({ f: [[0, 2000], [0.15, 180]], type: 'sawtooth', dur: 0.17, gain: 0.12 * gn, a: 0.002, filter: 'lowpass', f2: 3500, pan: o.pan })); k.noise(t, mk({ dur: 0.05, filter: 'highpass', f: 5000, gain: 0.12 * gn, a: 0.001, pan: o.pan })); break;
          case 'laser': k.tone(t, mk({ f: [[0, 2600], [0.22, 380]], type: 'square', dur: 0.24, gain: 0.14 * gn, a: 0.002, filter: 'lowpass', f2: 4000, pan: o.pan, verb: 0.1 })); break;
          case 'coin': k.tone(t, mk({ f: 'B5', type: 'square', dur: 0.07, gain: 0.14 * gn, a: 0.002, pan: o.pan })); k.tone(t + 0.07, mk({ f: 'E6', type: 'square', dur: 0.3, gain: 0.14 * gn, a: 0.002, pan: o.pan })); break;
          case 'jump': k.tone(t, mk({ f: [[0, 230], [0.16, 760]], type: 'square', dur: 0.18, gain: 0.14 * gn, a: 0.002, filter: 'lowpass', f2: 3000, pan: o.pan })); break;
          case 'powerup': ['C5', 'E5', 'G5', 'C6', 'E6', 'G6'].forEach((nn, i) => k.tone(t + i * 0.055, mk({ f: nn, type: 'square', dur: 0.1, gain: 0.12 * gn, a: 0.002, pan: o.pan }))); break;
          case 'glitch': { const r = rng(seedOf('gl', t)); for (let i = 0; i < 6; i++) { const tt = t + i * 0.03 + r() * 0.015; k.noise(tt, mk({ dur: 0.03, filter: 'bandpass', f: 800 + r() * 4000, q: 4, gain: 0.4 * gn, a: 0.001, pan: (r() - 0.5) * 0.8 })); if (i % 2) k.tone(tt, mk({ f: 300 + r() * 1500, type: 'square', dur: 0.025, gain: 0.1 * gn, a: 0.001 })); } break; }
          case 'tapestop': k.tone(t, mk({ f: [[0, 520], [o.dur || 0.5, 38]], type: 'sawtooth', dur: o.dur || 0.5, gain: 0.1 * gn, a: 0.01, filter: 'lowpass', f2: 1800, pan: o.pan })); k.noise(t, mk({ dur: o.dur || 0.5, color: 'pink', filter: 'lowpass', f: [[0, 3000], [o.dur || 0.5, 200]], gain: 0.08 * gn, a: 0.01 })); break;
          case 'shutter': k.noise(t, mk({ dur: 0.025, filter: 'highpass', f: 3500, gain: 0.3 * gn, a: 0.001, pan: o.pan })); k.noise(t + 0.07, mk({ dur: 0.03, filter: 'highpass', f: 2500, gain: 0.26 * gn, a: 0.001, pan: o.pan })); k.tone(t, mk({ f: 160, dur: 0.05, gain: 0.1 * gn, a: 0.001 })); break;
          case 'paper': k.noise(t, mk({ dur: o.dur || 0.22, color: 'pink', filter: 'bandpass', f: [[0, 3200], [o.dur || 0.22, 1400]], q: 0.6, gain: 0.2 * gn, a: 0.02, pan: o.pan })); break;
          case 'scribble': { const n = o.n || 4; for (let i = 0; i < n; i++) k.noise(t + i * 0.07, mk({ dur: 0.08, filter: 'highpass', f: [[0, 2200 + (i % 2) * 1200], [0.08, 3800 - (i % 2) * 900]], gain: 0.14 * gn, a: 0.01, pan: o.pan })); break; }
          case 'kaching': k.play('click', t, { gain: 0.6 * gn, minor: m }); k.play('ding', t + 0.05, { f: 'E6', gain: 0.8 * gn, minor: m, noalias: true }); k.play('ding', t + 0.16, { f: 'A6', gain: 0.9 * gn, minor: m, noalias: true }); break;
          case 'bell': { const f = hz(o.f || 'A5'); [1, 2.4, 3.1, 5.2].forEach((pp, i) => k.tone(t, mk({ f: f * pp, dur: 1.6 / (1 + i * 0.6), gain: 0.12 * gn / (1 + i), a: 0.002, pan: o.pan, verb: 0.4 }))); break; }
          case 'boom': k.tone(t, mk({ f: [[0, 80], [1.0, 26]], dur: 1.3, gain: 0.55 * gn, a: 0.005, pan: o.pan, verb: 0.3 })); k.noise(t, mk({ dur: 0.7, color: 'brown', filter: 'lowpass', f: [[0, 1800], [0.6, 120]], gain: 0.35 * gn, a: 0.004 })); break;
          case 'chime': ['C6', 'E6', 'G6'].forEach((nn, i) => k.tone(t + i * 0.09, mk({ f: nn, dur: 0.8, gain: 0.1 * gn, a: 0.002, pan: o.pan, verb: 0.4 }))); break;
          case 'error': k.tone(t, mk({ f: 'A3', type: 'square', dur: 0.12, gain: 0.07 * gn, a: 0.003, filter: 'lowpass', f2: 1800 })); k.tone(t + 0.13, mk({ f: 'E3', type: 'square', dur: 0.2, gain: 0.07 * gn, a: 0.003, filter: 'lowpass', f2: 1500 })); break;
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
