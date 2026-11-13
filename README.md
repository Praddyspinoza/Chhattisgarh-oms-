# Chhattisgarh Political Intelligence Terminal (V12.2)

**Website:** https://praddyspinoza.github.io/Chhattisgarh-oms-/index.html

**Source window:** 5 August–5 November 2026. **Research update:** 13 November 2026.

## Contents

- **BJP/Government:** 10 leader dossiers and 149 dated, source-linked research entries. They include public statements, reported activities, decisions, legislative records, and independent reporting; they are not 149 distinct speeches or authenticated social posts.
- **Opposition:** Existing 182-item source-linked research archive and historical explorer remain embedded.
- **Issues:** 10 issue categories. Source items receive a primary issue when the text supports it; general organisational events may remain unclassified.
- **Geography:** Original interactive 33-district map, source-linked drill-down and motion-flow visualisation preserved.
- **Social:** 24 publisher-recovered original X status URLs; 18 public account references across X, Facebook and Instagram; date-scoped X and indexed Facebook/Instagram discovery links for each of the 10 BJP figures.
- **Meta original posts:** Zero API-verified historical posts. Public Facebook/Instagram profile and discovery links are not post-level evidence.

## Methodological limits

A record is one indexed source entry, not necessarily a unique event or statement. Two reports may document the same event, and an announced programme is not evidence of implementation. Contested allegations remain attributed to their source. BJP and opposition raw totals use different capture criteria, so do not interpret the totals as a comparable measure of activity.

The BJP records are mirrored in the homepage HTML and v12_data.json. Social links are mirrored in the homepage HTML and social_discovery.json. Historical X/Meta collection would require authorised API access and further editorial validation. No stealth scraping, credential bypass or fabricated platform posts are included.

## Open on MacBook

Open https://praddyspinoza.github.io/Chhattisgarh-oms-/index.html in Safari or Chrome. For a cached version, use Command+Shift+R.

## QA

GitHub Actions workflow **Chhattisgarh terminal integrity** runs the script scripts/qa-terminal.cjs on every push. It checks embedded data equality, record boundaries and IDs, source URL formats, preserved map/motion modules, social references, and JavaScript syntax. Static validation is not a substitute for full browser QA or checking every publisher page.

## Deployment history

This repository previously served a V11 downloader or partial overlay. The full V12.1 build was recovered from the separate opposition-monitoring-system- repository and deployed here, then expanded. The original motion script was preserved byte-for-byte in this release.
