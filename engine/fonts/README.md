# Embedded fonts
Caveat, Nunito, Sora and IBM Plex Mono, latin subset, from the @fontsource packages. All four are licensed under the SIL Open Font License 1.1,
which allows embedding and commercial use. build.py inlines them into every page so videos render the same offline and on any machine.
Noto Sans Devanagari (600, 700, 800), also OFL 1.1, from @fontsource/noto-sans-devanagari. It is inlined only when a plan contains Hindi (Devanagari) text, and it is added to every canvas font stack as a fallback, so Latin text keeps the style's own font.
