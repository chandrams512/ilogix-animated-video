# Sound

Every video gets sound effects and (unless you turn it off) a quiet music bed, all made inside the page. Nothing is recorded or sampled
from outside except the optional CC0 library below. Voiceovers are separate (see voiceover.md).

## Three layers
1. **Built-in synthesized effects** (`styles/_sound/sound.js`): original code, no files. About 35 presets: pop, tick, click, ding, success,
   impact, thud, stamp, sparkle, typing, riser, whoosh, swipe, snap, clack, flap, thock, bubble, drip, zap, laser, coin, jump, powerup, glitch,
   tapestop, shutter, paper, scribble, kaching, bell, boom, chime, error.
2. **Library sounds** (`sounds/uisfx/`): 44 interface cues in 12 packs from the open-source `uisfx` package (https://uisfx.com), released as
   CC0 (public domain): commercial use is fine, no attribution needed. Each style uses a pack that suits it (see `engine/sfx_map.json`):
   Tech Glow and Neon use `scifi`, Glass uses `glass`, Paper Cut and Whiteboard `organic`, Pixel and VHS `arcade`, Split-flap, Blueprint and
   Halftone `mechanical`, Neo-brutal `rubber`, Deco `cinematic`, Mesh `dreamy`, Particles `zen`, Isometric `soft`, Kinetic `minimal`, Bauhaus `studio`.
3. **Music bed**: `pad` (slow chords), `pulse` (soft kick, hat and bass), `chip` (8-bit arpeggio), `wave` (synth bass and arpeggio).

## Plan keys
- `"sfx"`: `"auto"` (default: the library pack for the style, built-in effects where the pack has none), `"synth"` (built-in effects only, the earlier sound),
  or a pack name such as `"glass"`.
- `"music"`: `"auto"` (default: by style), `"pad"`, `"pulse"`, `"chip"`, `"wave"`, or `false` for none. `"bpm"` and `"chords"` still work.
- With `"motion": "auto"`, each scene change gets a swipe or whoosh that matches its transition.

## Notes
- Only the cues a plan can use are embedded in its page (about 50 KB), so pages stay small.
- A plan's style can be switched live on the site; effects change with the style, the embedded library pack stays the one built for the plan's style.
- Not listened to by the author of the code (no audio device in the build environment). Layout of the mix was checked offline: peak level, no
  clipping, no silent or NaN output. Listen before publishing and change `engine/sfx_map.json` (roles, packs, aliases) to taste.
- To add another library: put CC0 files in `sounds/<name>/<pack>/<cue>.mp3`, list the cue volumes in a `cues.json`, and point `build.py` at it.
  Check the licence of every file you add; keep the licence file next to the sounds.
