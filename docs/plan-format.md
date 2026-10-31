# Plan format (JSON)

A video is one JSON file at `plans/<name>/plan.json`. Build it with `python3 engine/build.py plans/<name>/plan.json`.
Check it first with `python3 engine/validate_plan.py plans/<name>/plan.json` (the error list can be sent back to a cheap model to retry).

```json
{
  "title": "Why automate follow-ups",
  "style": "tech-glow",
  "aspect": "9x16",
  "brand": { "name": "iLogix Digital", "logo": "logo.png", "colors": { "cyan": "#38e8ff", "violet": "#8b6bff" } },
  "music": true,
  "scenes": [ { "type": "hook", "dur": 3, "lines": ["Slow replies", "lose leads."], "say": "Caption and voiceover line." } ]
}
```

- **style**: `tech-glow`, `glass`, `isometric`, `paper-cut`, `whiteboard`, `blueprint`, `neo-brutal`.
- **aspect**: the shape the player opens in (`9x16` or `16x9`); every plan renders in both.
- **brand**: `name` (or `logoText`) shows top-left; `logo` is an image file next to the plan (inlined at build); `colors` overrides accent colours (cyan, violet, pink, green, amber, red) in every style.
- **music**: `false` removes the pad from the full mix. The no-music render always drops it.
- **scenes** play one after another (`dur` seconds, default 3; optional `start` to place one explicitly).
- **say** on a scene becomes the caption (word by word) and a line in the voiceover script. For exact timing use a top-level `captions`: `[{ "t": 0.4, "dur": 2.2, "text": "..." }]`.

## Scene types
| type | fields | limits |
|---|---|---|
| `hook` | `lines[]`, optional `sub` | 1 to 3 lines |
| `steps` | `title`, `items[{title, sub, tag, icon}]` | 2 to 4 items |
| `stat` | `value` (number counts up, or text), `prefix`, `suffix`, `label`, `sub` | |
| `chart` | `title`, `bars[{label, value, prefix, suffix}]` | 2 to 6 bars |
| `compare` | `title`, `left{title, items[]}`, `right{title, items[]}` | 1 to 4 items per side |
| `timeline` | `title`, `points[{label, sub}]` | 2 to 5 points |
| `flow` | `title`, `nodes[{label, icon}]` | 2 to 5 nodes |
| `cta` | `lines[]`, `button`, `tag`, `icon` (or `false`) | 1 to 3 lines |
| `testimonial` | `quote`, `name`, `role`, `stars` (0 to 5, default 5) | quote up to 160 characters |
| `offer` | `headline`, `was`, `price`, `code`, `deadline`, `button` | headline up to 70 characters |
| `pricing` | `title`, `plans[{name, price, per, hot, items[]}]` | 2 to 3 plans, up to 3 short items each |
| `checklist` | `title`, `items[]` (text, up to 30 characters) | 2 to 5 items |
| `beforeafter` | `title`, `before{label, value, note}`, `after{...}` | value up to 9 characters |
| `endcard` | `lines[]`, `phone`, `email`, `web`, `qr` (a URL, made into a QR code at build), `tagline` | needs at least one contact or qr |
| `phone` | `image` (file next to the plan), `title`, `caption` | screenshot shown in a phone frame |
| `clip` | `prompt` (made by `engine/clips.py`) or `file` (a video you have), `title`, `badge` (default "AI-generated"), `full`, `fps` | up to 12 s; an AI clip must keep its badge |
| `image` | `image` (file next to the plan), `title`, `badge`, `full` | a still with a slow zoom; real-estate plans need a badge such as "Artist's impression" |

Icons: phone, mail, chat, cal, person, doc, check, bolt, plan, shield, pin, plane, cross.

## Extras
- `"safe": true` (top level): shrinks vertical layouts into the Reels/Shorts safe zone, so text stays clear of the app's buttons and captions.
- `"brand": { "logo": "logo.png", "colorsFromLogo": true }`: picks accent colours from the logo (colours you set by hand win). Check with `python3 engine/brand_colors.py logo.png`.
- `"short": true` on a scene marks it for the short cut: `python3 engine/cutdown.py plans/<name>/plan.json --max 15` writes `plans/<name>-15s/`.
- Bulk and personalised videos: `python3 engine/bulk.py plans/<template>/plan.json data.csv --name <batch> [--render 9x16 --out out/]`. Use `{{column}}` in any text of the template. See `plans/bulk-template/`.
- QR codes need `pip install segno`.
- Compliance footer: `"brand": { "rera": "RERA No. ...", "disclaimer": "Artist's impression." }` prints one small line (two in vertical) at the bottom of every scene; each is up to 70 characters. Wide captions move up a little to make room.
- `"industry": "real-estate"` makes the validator require `brand.rera` and reject phrases such as "assured returns", "guaranteed appreciation" and "risk free". It is a safety net, not legal advice: check your state RERA rules. See `docs/real-estate.md`.

- Hindi: write the text in Devanagari and set `"lang": "hi"`. The Noto Sans Devanagari font is embedded automatically when the plan contains Hindi, and it backs up every style's font. `python3 engine/gen_plan.py brief.txt out.json --lang hi` asks the model for Hindi. End sentences with the danda (।).
- Voiceover: `python3 engine/tts.py plans/<name>/plan.json --provider estimate|azure|elevenlabs|edge|file`, then build. See `docs/voiceover.md`. `"voice": false` in the plan ignores an existing voice folder.
- AI clips: add a `clip` scene with a `prompt`, then `python3 engine/clips.py plans/<name>/plan.json --provider mock` (free test) or a paid provider with `--usd-per-clip` and `--max-usd`. See `docs/tiers.md`.

## Checks
- `python3 engine/validate_plan.py plan.json` checks the plan.
- `python3 engine/qa_frames.py dist/<name>.html` draws every scene in every style and shape and lists any text that leaves the frame, hits the caption bar or overlaps other text.

## Outputs
Build writes `dist/<name>.html` (player), `dist/<name>.srt` (captions) and `dist/<name>_script.md` (voiceover lines).
Render: `python3 engine/render.py 9x16 out dist/<name>.html <prefix> <style>`; set `CAPTIONS=0` for a render without burned-in captions.
Each render writes three audio versions: full (with music), voiceover-mix, and `sfx-only` (no music); set `MIXES=sfx-only` to render just one. It also writes `<prefix>_<aspect>_cover.jpg` and a small `_preview.gif` (first 6 s) for emails.
