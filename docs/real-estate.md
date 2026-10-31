# Real estate videos

Same engine, same scene types. What is specific to real estate:

## Formats that fit
| Format | Scenes |
|---|---|
| Project launch reel | hook, timeline (location), checklist (amenities), pricing, endcard with QR |
| Price and payment plan | pricing, chart, compare |
| Location and commute | timeline, flow |
| Rent or buy | beforeafter, checklist |
| Buyer story | testimonial, endcard |
| One video per unit | bulk CSV: hook, offer, endcard |
Real-footage walkthroughs and agent-on-camera clips are shot by the client; the studio adds captions, an end card and a QR code (a `phone` scene can show a floor plan or app screen).

## RERA footer
Set `"industry": "real-estate"` and `"brand": { "rera": "<registration number>", "disclaimer": "Artist's impression." }`. The line prints on every scene. The validator then refuses plans with no `brand.rera` and flags "assured returns" style phrases.
Sources read for this (blog summaries, not the Act): ads for a registered project should show its RERA number (some state rules add the state RERA website), claims should match the registered details, artist's impressions should be labelled, and assured-return claims should stay out. Meta may also treat housing ads as a special ad category. Confirm every rule for the state in question before publishing.

## Samples (all content fictional)
- `plans/re-launch-reel/` project launch reel (Isometric, 21.5 s)
- `plans/re-emi-vs-rent/` rent or buy (Glass, 17 s)
- `plans/re-bulk-units/` template plus `units.csv`; run `python3 engine/bulk.py plans/re-bulk-units/plan.json plans/re-bulk-units/units.csv --name re-bulk-out`
