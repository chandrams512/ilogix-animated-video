#!/bin/sh
# Rebuild players and copy them into web/ for deployment. Run from the repo root.
python3 engine/build.py plans/ilogix-voice-agents/manifest.json && cp dist/ilogix_voice_agents.html web/v/ilogix-voice-agents.html
python3 engine/build.py plans/tripnido-demo/manifest.json && cp dist/tripnido_demo.html web/v/tripnido-demo.html
python3 engine/build.py plans/edu-sky/manifest.json && cp dist/edu_sky.html web/v/edu-sky.html
