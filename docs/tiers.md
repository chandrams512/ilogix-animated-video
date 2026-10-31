# Product tiers

Two kinds of video, made differently, kept apart in the product and in the price.

## Tier 1: Explainer videos (built)
Animated scenes drawn by code from a JSON plan (this repo's engine).
- Deterministic: the same plan gives the same video. No per-video model cost beyond a cheap LLM draft of the plan.
- Seven original styles, fifteen scene types, captions, brand kit, sound effects only (no music).
- Bulk: one template plus a CSV gives a video per row.
- Planned price for influencer reels: Rs 200-300 per 30 s video (a test number, not final).

## Tier 2: AI clips (not built, in testing)
Generated footage from third-party model APIs, for what an animation cannot show.
- Text to video, image to video, brand reel from a URL (see the market notes in the project chat; verify every licence and price before choosing a provider).
- Each clip costs real compute, so it has its own price and queue. Never bundle it into the explainer price.
- Always label the footage as AI-generated, and label real-estate renders as artist's impressions.
- Design: a `clip` or `image` scene type fed by a provider layer (one adapter per provider, a per-job cost cap, results cached by prompt). The engine then treats the clip like any other scene, so captions, end cards and the brand kit still apply.

## Rules that keep the tiers apart
- Different names on the site, different price lines, different turnaround.
- Tier 2 jobs run on a queue with a spend limit; Tier 1 renders run anywhere with Chromium and ffmpeg.
- Check the licence of every model and voice before selling its output (Edge TTS has no published commercial grant; Wan is Apache 2.0; others to be verified).
