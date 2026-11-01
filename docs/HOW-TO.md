# How to make a video: step by step

Read this first. It covers everything in plain steps. Details for each topic are in the other files in this folder.

## What you need
- The repo (this folder) and the Claude chat for this project. Claude does the building; you give the brief and approve.
- Nothing else for a normal video. An API key is needed only for a paid voice or AI clips (see steps 6 and 7).

## The short version (a normal video)
1. **Write the brief.** Open the studio site, go to "Request a video", fill the form, press "Copy brief", and paste it into the Claude chat. (Or just type it: topic, length, shape, style, key points.)
2. **Approve the storyboard.** Claude replies with the scenes and the words. Say "OK" or ask for changes. Nothing is built until you approve.
3. **Claude builds it.** It writes a plan file (`plans/<name>/plan.json`), checks it, builds the player, runs the automatic layout check on every style and shape, and looks at the frames.
4. **Claude renders and pushes.** You get MP4s (captions and sound effects, no music) in the chat, and the video appears on the site after Vercel redeploys.
5. **Add your own music** over the MP4 in any editor or in Instagram.

## Choosing the options
| You want | Say or set |
|---|---|
| A look | one of: Tech Glow, Glass UI, Isometric Pastel, Paper Cut, Whiteboard, Blueprint, Neo-brutalist, Kinetic Type, Neon Tubes, Bauhaus, Pixel Arcade, Art Deco, Soft Mesh (`"style"` in the plan) |
| Reels or Shorts | 9:16 vertical, and `"safe": true` keeps text clear of the app buttons |
| YouTube | 16:9 wide |
| Your brand | `"brand": { "name": ..., "logo": "logo.png", "colorsFromLogo": true }` |
| Fifteen kinds of scene | hook, steps, stat, chart, compare, timeline, flow, cta, testimonial, offer, pricing, checklist, beforeafter, phone, endcard (see `plan-format.md`) |

## 5. Many videos from one template (offers, units, names)
1. Make one plan with placeholders such as `{{shop}}` and `{{price}}`.
2. Put one row per video in a CSV file.
3. Run: `python3 engine/bulk.py plans/<template>/plan.json data.csv --name <batch> --render 9x16 --out out/`
Example: `plans/re-bulk-units/` (real estate) and `plans/bulk-template/` (shop offers).

## 6. Hindi
1. Write the text in Hindi (Devanagari) and add `"lang": "hi"` to the plan. Nothing else to set: the Hindi font is added by itself.
2. Or let the free language model draft it: `python3 engine/gen_plan.py brief.txt plans/<name>/plan.json --lang hi`.
3. Have a Hindi reader check the wording before posting.
Example: `plans/sample-hindi/`.

## 7. Voiceover (a voice reading each line)
Each scene's `say` line is what gets spoken. Three ways to get the voice:
- **Test the timing for free:** `python3 engine/tts.py plans/<name>/plan.json --provider estimate` (silent, only checks lengths).
- **Your own voice:** record each line, save as `plans/<name>/voice/scene-01.mp3`, `scene-02.mp3`, ... then `python3 engine/tts.py plans/<name>/plan.json --provider file`.
- **An AI voice:** set the key as an environment variable, then run `--provider azure` (`AZURE_TTS_KEY`, `AZURE_TTS_REGION`) or `--provider elevenlabs` (`ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE`). Add `--lang hi` for Hindi. Check the provider's commercial terms before selling.
Then run `python3 engine/build.py plans/<name>/plan.json` again (it fits the scenes to the voice) and render. You get an extra `*_voiceover.mp4`. More: `voiceover.md`.

## 8. AI clips (generated footage), a separate paid tier
1. Add a scene: `{ "type": "clip", "prompt": "what the shot shows", "dur": 4, "title": "..." }` (or `"image": "photo.jpg"` to animate a photo). It always shows an "AI-generated" badge.
2. Free test: `python3 engine/clips.py plans/<name>/plan.json --provider mock` (makes a plain colour clip).
3. Real clips: choose a model on fal.ai, check its price and licence, set `FAL_KEY` and `FAL_MODEL_T2V`, then run `python3 engine/clips.py plans/<name>/plan.json --provider fal --usd-per-clip <price> --max-usd 2`. It stops before spending if the cost would pass `--max-usd`.
4. Build and render as normal. Clips are saved, so re-running costs nothing. More: `tiers.md`.
Example: `plans/sample-ai-clips/`.

## 9. Real estate
Set `"industry": "real-estate"` and `"brand": { "rera": "<registration number>" }`. The number prints on every scene, and the checker refuses plans that promise "assured returns". Rules differ by state: confirm yours. More: `real-estate.md`.

## Checking a video yourself (before you post)
- `python3 engine/validate_plan.py plans/<name>/plan.json` says "Plan is valid." or lists what to fix.
- `python3 engine/qa_frames.py dist/<name>.html` lists any text that runs off the frame or overlaps. "No layout problems found." is the goal.
- Watch the MP4 once, with sound on. The checks cannot judge whether the audio sounds right.

## If something goes wrong
| Problem | Do this |
|---|---|
| The validator lists errors | Fix each line it prints (it names the scene), or paste the list into the chat |
| "QR codes need the segno package" | `pip install segno` |
| "Set AZURE_TTS_KEY ..." (or another key) | Set that environment variable. Never put keys in the repo |
| A clip scene says "no file yet" | Run `engine/clips.py` for that plan first |
| The site did not change after a push | Wait for Vercel to redeploy, then refresh without cache |
| A voice line makes a scene longer than 12 s | Shorten the `say` line |

## Where things are
`engine/` the tools · `styles/` the thirteen looks · `plans/` one folder per video · `web/` the studio site (Vercel serves this) · `dist/` built players (not committed) · `docs/` these guides.
