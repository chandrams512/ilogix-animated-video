# ilogix-animated-video

Animated explainer videos drawn on an HTML canvas. One function of time draws every frame, so the browser
preview and the MP4 render match. Sound is synthesized (no audio files). Private repo.

## Layout
- `engine/` harness, player page, build and render scripts
- `styles/` one folder per look (`flat-vector`, `tech-glow`); `_sound/` is the sound kit (see its README, licence unchecked)
- `plans/<name>/` one folder per video: `manifest.json` (script order), scene code, storyboard
- `archive/earth-water/` the first video, kept as built
- `docs/` workflow notes

## Build a player
    python3 engine/build.py plans/ilogix-voice-agents/manifest.json   # writes dist/ilogix_voice_agents.html

## Render MP4 (needs Python Playwright with Chromium, and ffmpeg)
    python3 engine/render.py 16x9 out        # also: 9x16
    # writes out/ilogix_<aspect>_sound.mp4 and out/ilogix_<aspect>_voiceover-mix.mp4

`engine/export_mp4.js` is a Node (puppeteer) alternative for a local machine.

## Rules
- Keys go in environment variables, never in the repo. MP4s and voiceover clips are git-ignored.
- Planned: JSON plan files and a style switcher (`--style`), so a new video needs a plan, not new code.
