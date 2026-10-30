# Sound kit

`sound.js` is an original synthesized kit written from scratch for this repo (plain Web Audio, no audio files, no
third-party code). It replaces the earlier version that was copied from the Futurepedia style package.

API (used by `scoreSound(k)` in each plan): `k.tone`, `k.noise`, `k.play(name)`, `k.bed`, `k.music`, `k.withMinor`,
`k.hz`, `k.vo`; entry points `SOUND.live` and `SOUND.renderOffline`. Details are in the header comment of `sound.js`.

Checked: offline render of both mixes matches the old kit's loudness profile (peak about 0.57, no errors, no NaN),
and live playback starts, seeks and stops without errors. It has not been listened to by the author of the code,
so give it a listen before publishing.

Note: `archive/earth-water/` pages are kept as originally built and still contain the earlier copied sound code.
Rebuild that video on this kit before selling it.
