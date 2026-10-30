#!/bin/sh
# Rebuild every player and copy it into web/v for deployment. Run from the repo root.
set -e
for m in ilogix-voice-agents tripnido-demo edu-sky; do python3 engine/build.py plans/$m/manifest.json >/dev/null; done
cp dist/ilogix_voice_agents.html web/v/ilogix-voice-agents.html
cp dist/tripnido_demo.html web/v/tripnido-demo.html
cp dist/edu_sky.html web/v/edu-sky.html
for p in sample-automation sample-water-cycle; do python3 engine/build.py plans/$p/plan.json >/dev/null; cp dist/$(echo $p | tr - _).html web/v/$p.html; done
echo synced
