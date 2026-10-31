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

Icons: phone, mail, chat, cal, person, doc, check, bolt, plan, shield, pin, plane, cross.

## Outputs
Build writes `dist/<name>.html` (player), `dist/<name>.srt` (captions) and `dist/<name>_script.md` (voiceover lines).
Render: `python3 engine/render.py 9x16 out dist/<name>.html <prefix> <style>`; set `CAPTIONS=0` for a render without burned-in captions.
Each render writes three audio versions: full (with music), voiceover-mix, and `sfx-only` (no music).
