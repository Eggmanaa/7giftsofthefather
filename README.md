# The 7 Gifts of the Father

Static site for **7giftsofthefather.pages.dev** — the 7 Motivational Giftings of the Father (Romans 12), the 35 Personality Archetypes of the Soul, and the Comprehensive Integrated Assessment.

## Structure

- `site/` — the deployable static site (what Cloudflare Pages serves)
  - 52 prerendered pages in the "Garnet & Vellum" hybrid design system (wine-dark garnet chrome, candlelight gold, parchment reading surfaces, Fraunces + Inter, gift-color ink): home, 7 gift pages, 35 archetype pages, archetype library, biblical foundation, profile guide, **under pressure**, **how gifts meet**, assessment, results
  - `js/data.js` — generated content bundle + official scoring engine (`window.computeScores`)
  - `js/assessment.js` — 77-question wizard (autosave to localStorage, resume support)
  - `js/results.js` — intensity bar chart, archetype reveal, top-3 deep dives
- `pipeline/` — content extraction + build scripts
  - `content/*.json` — structured content (7 gifts, 35 archetypes, 77 questions + scoring maps, distress model, interaction model)
    - `pressure.json` — the Three Descents model (Strain / Distortion / Captivity), per-gift flare signature, chronic pattern, and re-entry path
    - `interaction.json` — the Gap model (0–24 score, four bands), the Blind Exchange, all 21 pair collisions, and the 7 same-gift mirrors
    - `archetype-pressure.json` — all 35 archetypes under pressure: composite pattern name, the three parallel descents, the earliest tell, the synchronisation pattern, and the primary missing brake
  - `build.js` — generates all HTML from the JSON
  - `fix_links.py` — post-build link rewrite for Cloudflare pretty URLs
  - `test_scoring.js` — scoring test-suite (max profiles, spec arithmetic, 500 random runs)

## Scoring

Implements the official Unified Scoring Instructions:
Likert 1–5 → 0–4 pts; forced-choice win → 4 pts; scenario MOST → 4 pts, LEAST → 0, others → 1 pt.
Seven balanced scenarios give every gift exactly 4 scenario appearances, so all gifts share a uniform 68-point maximum; final scores are normalized to 0–100. If gifts tie exactly at the rank-3 boundary, a one-question tiebreaker (direct core-drive choice) resolves the archetype without altering scores. Intensity bands: 85+ Very High, 61–84 High, 41–60 Medium, 16–40 Low, 0–15 Very Low.
The top three gifts (set, not order) map to one of the 35 archetypes.

## Rebuild & deploy

```bash
node pipeline/build.js        # regenerate site/ from pipeline/content
python3 pipeline/fix_links.py # pretty URLs
node pipeline/test_scoring.js # verify scoring engine
npx wrangler pages deploy site --project-name=7giftsofthefather --branch=main
```

## Distress & interaction model

Each gift carries a three-stage descent — **Strain** (the gift intensified), **Distortion** (the gift weaponized), **Captivity** (the gift inverted) — with one flare verb per stage, a chronic pattern if it settles in, and a named way back. Rendered on `/under-pressure`, on every gift page, and into the top-three deep dives on `/results`.

Archetypes descend differently from single gifts. A gift runs Strain → Distortion → Captivity inside itself. An archetype runs **three descents in parallel** — all three gifts strain together, distort together, go captive together. The top three are a set, not a sequence, so nothing depends on gift order. Each of the 35 carries a composite pattern name, an authored synthesis of what its particular three flares produce at each stage, the earliest externally visible tell, a synchronisation pattern (how the three interact: Amplifying, Hardening, Rotating, Oscillating, Silent Drift, Vanishing, Sealing), its three internal collisions, and the **missing brake** — which of the four quiet gifts would have caught it.

The **Gap** measures how two profiles interact: sum the rank difference for all seven gifts (0–24), read the band, then check the inversion count. `/how-gifts-meet` carries the interactive calculator, the 21 pair collisions, and the same-gift mirrors. `/results` surfaces the collisions that live *inside* a person's own top three.

Assessment answers and results live only in the visitor's browser (localStorage) — no server, no accounts.
