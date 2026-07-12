# The 7 Gifts of the Father

Static site for **7giftsofthefather.pages.dev** — the 7 Motivational Giftings of the Father (Romans 12), the 35 Personality Archetypes of the Soul, and the Comprehensive Integrated Assessment.

## Structure

- `site/` — the deployable static site (what Cloudflare Pages serves)
  - 50 prerendered pages in a light editorial design system (Fraunces + Inter, hairline rules, gift-color ink): home, 7 gift pages, 35 archetype pages, archetype library, biblical foundation, profile guide, assessment, results
  - `js/data.js` — generated content bundle + official scoring engine (`window.computeScores`)
  - `js/assessment.js` — 77-question wizard (autosave to localStorage, resume support)
  - `js/results.js` — intensity bar chart, archetype reveal, top-3 deep dives
- `pipeline/` — content extraction + build scripts
  - `content/*.json` — structured content (7 gifts, 35 archetypes, 77 questions + scoring maps)
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

Assessment answers and results live only in the visitor's browser (localStorage) — no server, no accounts.
