#!/bin/sh
# Rebuild players and copy them into web/ for deployment. Run from the repo root.
python3 engine/build.py plans/ilogix-voice-agents/manifest.json && cp dist/ilogix_voice_agents.html web/v/ilogix-voice-agents.html
