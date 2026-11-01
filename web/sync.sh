#!/bin/sh
# Rebuild every player and copy it into web/v for deployment. Run from the repo root.
set -e
for m in ilogix-voice-agents tripnido-demo edu-sky; do python3 engine/build.py plans/$m/manifest.json >/dev/null; done
cp dist/ilogix_voice_agents.html web/v/ilogix-voice-agents.html
cp dist/tripnido_demo.html web/v/tripnido-demo.html
cp dist/edu_sky.html web/v/edu-sky.html
for p in sample-automation sample-water-cycle earth-water; do python3 engine/build.py plans/$p/plan.json >/dev/null; cp dist/$(echo $p | tr - _).html web/v/$p.html; done
python3 engine/build.py plans/sample-showcase/plan.json >/dev/null; cp dist/sample_showcase.html web/v/sample-showcase.html
python3 engine/build.py plans/bulk-offers/sharma-sweets/plan.json >/dev/null; cp dist/sharma_sweets.html web/v/offer-bulk.html
python3 engine/build.py plans/scene-gallery/plan.json >/dev/null 2>&1; cp dist/scene_gallery.html web/v/scene-gallery.html
for p in speed-of-light re-launch-reel re-emi-vs-rent; do python3 engine/build.py plans/$p/plan.json >/dev/null; cp dist/$(echo $p | tr - _).html web/v/$p.html; done
python3 engine/build.py plans/re-bulk-out/skyline-2bhk/plan.json >/dev/null; cp dist/skyline_2bhk.html web/v/re-unit-skyline.html
python3 engine/build.py plans/sample-hindi/plan.json >/dev/null; cp dist/sample_hindi.html web/v/sample-hindi.html
python3 engine/build.py plans/sample-motion/plan.json >/dev/null; cp dist/sample_motion.html web/v/sample-motion.html
python3 engine/build.py plans/sample-liquid/plan.json >/dev/null; cp dist/sample_liquid.html web/v/sample-liquid.html
echo synced
