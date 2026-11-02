# Voiceover

The voice comes from each scene's `say` line. One audio file per line, then the video is timed to the voice.

1. `python3 engine/tts.py plans/<name>/plan.json --provider <p>` writes `plans/<name>/voice/scene-NN.mp3` and `voice.json` (the length of each line).
2. `python3 engine/build.py plans/<name>/plan.json` stretches any scene shorter than its line (line length + 0.7 s), times the captions to the voice, and writes `dist/<name>_voice.wav`. The player gets a "Voice on" button and plays the voice in step with the picture.
3. `python3 engine/render.py 9x16 out dist/<name>.html <prefix> <style>` also writes `<prefix>_9x16_voiceover.mp4`: quiet sound effects plus the voice. The other versions (sound, voiceover-mix, sfx-only) stay as they were.
   Other mixes (set with `MIXES=`): `voice-only` is the voice alone with no music and no effects; `sfx-only` is effects only (no voice, no music); `silent` is the picture with no audio at all. Example: `MIXES=voice-only,silent python3 engine/render.py 9x16 out dist/<name>.html <prefix>`.

## Providers
| provider | needs | note |
|---|---|---|
| `estimate` | nothing | silent files of an estimated length. Use it to see the timing and layout before you spend anything. |
| `azure` | `AZURE_TTS_KEY`, `AZURE_TTS_REGION` | default voices `en-IN-NeerjaNeural`, `hi-IN-SwaraNeural`; change with `--voice`. Check the current terms and price. |
| `elevenlabs` | `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE` | multilingual model, handles Hindi. Check the plan's commercial rights. |
| `edge` | `pip install edge-tts` | testing only: no published commercial licence. |
| `kokoro` | `pip install kokoro soundfile`, espeak-ng | free, offline, no key. English voices `af_heart` etc.; Hindi `hf_alpha` with `--lang hi`. Tried on a Mac with the sample-motion plan and judged good for explainer videos. Needs Python 3.10 to 3.12; the first run downloads the model. |
| `piper` | `pip install piper-tts` + a voice `.onnx` | free, offline. Pass `--voice path/to/voice.onnx` (or set `PIPER_MODEL`). Licences differ per voice: check the voice card before selling. |
| `file` | recordings named `scene-01.mp3` (or .wav, .m4a, .ogg) in the voice folder | your own voice, no service involved. |
Lines are cached by text, voice and provider, so running again costs nothing unless a line changed (`--force` redoes all).

## What has been tested
The timing, mixing and player were tested with generated tones (the tones land at the right second in the rendered MP4). The Azure, ElevenLabs and fal request code was tested against a local fake server, not the real services. No real synthesized voice has been heard yet: listen to the first real output before relying on it.
