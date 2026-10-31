# ilogix-animated-video

Animated explainer videos drawn on an HTML canvas. One function of time draws every frame, so the browser
preview and the MP4 render match. Sound is synthesized (no audio files). Private repo.

## Layout
- `engine/` harness, player page, build and render scripts
- `styles/` one folder per look (`tech-glow`, `isometric`, `paper-cut`, `whiteboard`, `blueprint`, `neo-brutal`, `glass`); `_sound/` is the sound kit (original kit, see its README)
- `plans/<name>/` one folder per video: `manifest.json` (script order), scene code, storyboard
- `archive/earth-water/` the first video, kept as built
- `docs/` workflow notes

## Build a player
    python3 engine/build.py plans/ilogix-voice-agents/manifest.json   # writes dist/ilogix_voice_agents.html

## Render MP4 (needs Python Playwright with Chromium, and ffmpeg)
    python3 engine/render.py 16x9 out        # also: 9x16
    # writes out/ilogix_<aspect>_sound.mp4 and out/ilogix_<aspect>_voiceover-mix.mp4

`engine/export_mp4.js` is a Node (puppeteer) alternative for a local machine.

## Styles
Scenes draw through the style object `S` (see `engine/styles.js`), so one plan renders in any registered style:
`tech-glow` (dark neon), `glass` (frosted panels), `isometric` (pastel slabs, travel), `paper-cut` (layered paper on teal, education), `whiteboard` (hand-drawn), `blueprint` (technical), `neo-brutal` (loud social). All are original designs.
The player has a style dropdown; `?style=isometric` in the URL preselects one.
Render a style: `python3 engine/render.py 9x16 out dist/ilogix_voice_agents.html ilogix_iso isometric`.
New style = one file that calls `registerStyle(name, {...})` with the same shape (documented in `engine/styles.js`).
Skins reuse the line icons from `styles/tech-glow/style.js` and shared drawing helpers from `styles/flat-vector/style.js` (kept as a helper file; the old Flat Vector look is archived).

## Rules
- Keys go in environment variables, never in the repo. MP4s and voiceover clips are git-ignored.
- Planned: JSON plan files, so a new video needs a plan, not new code.


## Plan videos (fast path)
1. Write a brief (`brief.txt`).
2. `python3 engine/gen_plan.py brief.txt plans/<name>/plan.json --style paper-cut --aspect 9x16` drafts the JSON with any OpenAI-compatible LLM (Groq, Gemini and OpenRouter have free tiers; set `LLM_API_KEY`, optional `LLM_BASE_URL`, `LLM_MODEL`). It validates and retries on its own.
3. `python3 engine/build.py plans/<name>/plan.json`, check frames, then `python3 engine/render.py 9x16 out dist/<name>.html <prefix> <style>`.
The `sfx-only` render has captions and sound effects but no music, ready for your own track.

## More tools
- `engine/qa_frames.py` automatic layout check (text outside the frame, caption overlap).
- `engine/bulk.py` one template plus a CSV makes a video per row (also for personalised videos).
- `engine/cutdown.py` makes a 15 s or 6 s version of a plan.
- `engine/brand_colors.py` accent colours from a logo.
- Scene types: hook, steps, stat, chart, compare, timeline, flow, cta, testimonial, offer, pricing, checklist, beforeafter, endcard, phone (see `docs/plan-format.md`).
- Real estate: `docs/real-estate.md` (RERA footer, sample plans `plans/re-*`). Product tiers (explainers vs AI clips): `docs/tiers.md`.
