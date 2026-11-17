# Chhattisgarh Political Intelligence Terminal (V12.2)

**Website:** https://praddyspinoza.github.io/Chhattisgarh-oms-/index.html

**Source window:** 5 August–5 November 2026. **Research update:** 17 November 2026.

## Three-state comparative source library (5 August–5 November 2026)

**Live comparative dashboard:** https://praddyspinoza.github.io/Chhattisgarh-oms-/comparative.html

- **17 November district-boundary upgrade:** Replaced approximate map silhouettes and point-only diagrams with real OSM-derived district boundary polygons for all **55 Madhya Pradesh, 30 Odisha and 24 Jharkhand districts**, viewable directly in the comparative dashboard. Clicking a polygon opens original publisher/source links. A district selector supports **CM or LoP + district → all ten issue categories**. The separate **CM or LoP + issue → matched geographic districts** view uses the same filter system and highlights only source-matched polygons, leaving the others neutral. Selected states/leaders expand to a readable full-width map, with zoom buttons.
- **Distinct institutional navigation:** Government circulars and Vidhan Sabha records have separate top tabs, separate source/provenance types and prominent shortcuts beside the district selector. The original 54 official records and 12 legislative accounts remain.
- **Social evidence update:** The research ledger now includes **209 directly linked social/video items** (208 individual X status permalinks and one direct video) and date-scoped **leader × district X discovery searches**. Discovery searches are not counted as original posts or treated as verified tweets.

- **17 November X archive expansion and review:** 208 individually linked original X statuses and one separately recorded direct video. Public-source discovery checked 171 candidate status URLs, accessed 161 full original posts with matching handle and timestamp, and added separately checked posts without reusing duplicate URLs. Original X page excerpts are condensed into short clickable source headings. Access and date checks do not make the collection a complete export of six accounts. An explicit **Other / general and ceremonial** category prevents unrelated posts from being misrepresented as statements on the ten policy issues. New issue assignments were derived with keyword-assisted classification and should be reviewed editorially; unverified posts and account-search pages are not counted as original statuses.
- **Leader analytics:** The **LEADER ISSUE PIE CHARTS · X VS NEWS** tab has two clickable SVG issue pies for each of six leaders (12 interactive charts total): distribution among individually indexed original X post URLs, and distribution among indexed news/broadcast articles about the leader. Both figures display denominators and the latter is emphatically **media coverage about the leader**, not inferred speech or observed full social-platform output.
- **District naming:** All active district polygons have linked map callouts (collision-aware where possible) and a complete expanded list of clickable district names and source counts directly below their state map. A selected leader continues to expand the corresponding state into a focus map.
- **Assembly source correctness:** Madhya Pradesh held no identified plenary session in the research interval. Odisha held the 22–28 September 2026 session and Jharkhand the 6–12 August 2026 monsoon session. Zero issue-level indexed records must not be read as zero questions/debates: the interface labels this explicitly and links official Assembly question indexes. The 12 existing legislative accounts are not a transcript census.
- **Boundary licensing:** The geographic data is OpenStreetMap-derived under ODbL 1.0, © OpenStreetMap contributors, with detailed credits and limits in `COMPARATIVE_GEO_DATA_LICENSE.md`; it is not an official Survey of India map or an event-coordinate dataset.


- **Interactive comparative command map (17 November expansion):** Three in-dashboard actual district-boundary maps with **109 named district polygons** (55 Madhya Pradesh, 30 Odisha, 24 Jharkhand). All states, CM/LoP leader buttons, all 10 issues, district points and source headlines are clickable. State + leader + issue filters work together: only districts with explicit name matches or declared city-to-district aliases glow; all others are neutral. Selecting a district opens a clickable source dossier without leaving the comparative page. The animated evidence-flow track runs **state → leader → issue → district → publisher/source**. These are real OSM-derived district boundaries (not official Survey of India cartography); highlighted regions indicate named mentions, **not exact incident coordinates or a rate-of-violence map**.
- **Implementation safety:** Original V12 Chhattisgarh homepage, source panels, tabs, institution-ledger distinctions, embedded original source fallback and full geographic district atlas remain intact. The new map is an additive comparative-only component.

- **Six leaders:** Mohan Yadav and Umang Singhar (Madhya Pradesh); Mohan Charan Majhi and Naveen Patnaik (Odisha); Hemant Soren and Babulal Marandi (Jharkhand).
- **Visible evidence:** `comparative.html` has an embedded and pre-rendered **issue → leader → source type → clickable publisher headline** index. It is readable even if a browser blocks the JSON fetch, and it includes a separately grouped **issue → leader → clickable original X post** archive.
- **Integrated dossier view:** The default screen shows the governance issue with six leader-specific panels and three institution-specific panels. Each panel places **newspaper/broadcast headlines and individual X/video permalinks side-by-side**, with clickable headings, publication dates and source-status labels. The prominent ten-issue selector and state/office/leader filters allow comparisons; selecting **All 10 issues** renders every indexed original link.
- **Link-status audit:** `comparative_link_audit.json` checked 212 distinct original URLs on 16 November 2026: 201 reachable, 9 restricted/rate-limited and 2 unconfirmed. **New entries added on 17 November have not yet undergone this older HTTP audit**. HTTP availability is not verification of underlying news or statements.
- **Browser QA:** `scripts/qa-comparative-browser.cjs` uses real Chromium to check **439 news/social source links**, all issue/leader filters, 109 polygon district nodes and highlighted-district name callouts, combined leader-plus-issue highlights, district-to-source clicks and navigation from the original OMS; screenshots are attached to the GitHub Actions run.
- **Research dataset:** `comparative_states_2026.json` (currently **230 source-linked reporting entries, 208 original individual X status permalinks and one direct video URL**). Count each sourced item, not each unique event; multiple reports can concern the same event.
- **Government and Vidhan Sabha:** `comparative_government_2026.json` holds **54 dated state/Union government source records**, consisting of 47 official-register items, two link references to one original Union Tribal Affairs PDF, four original government press releases and one MP court-described tribal-hostel circular whose original PDF was not recovered. It separately records **12 source-backed legislative accounts** (9 proceedings reports, 2 ministerial-answer reports, 1 protest at the House premises), and links the state-specific NeVA question indexes. The 12 reports are **not verified verbatim Assembly transcripts**. Madhya Pradesh did not hold a plenary sitting in the target window; Odisha sat 22–28 September; Jharkhand sat 6–12 August. Some official links point to **archives**, not individual signed circular PDFs.
- **Newspaper and channel coverage:** includes dated examples from regional dailies, national papers and television/digital newsrooms (NDTV MPCG, Bansal News, Odisha TV and NDTV). Publisher directory also lists inaccessible or partly indexed newspapers with their limitations.
- **Coverage warning:** This is **not every article or every X post** published in the 93-day period. It is a defensible source-linked sample. Headlines derived from newspaper reporting must not be represented as verbatim social post text. Direct historical Facebook/Instagram/X timelines require suitably authorised platform data or independently verifiable public records.
- **Automation and QA:** `scripts/sync_comparative_data.cjs` generates the embedded, static fallback source index when the JSON archive changes. `scripts/qa-comparative.cjs` validates categories, dates, original X author handles and source links; `scripts/qa-comparative-dom.cjs` checks that every link is actually rendered in the issue/leader interface.

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

### Comparative map provenance and limits

The 109 district polygons are OSM-derived approximate district boundaries, not official Survey of India geometry. They cover every named district in the three states, but their geometry is not a substitute for government GIS. Each glow comes from a district string in the date-scoped original news/social/official records, an explicitly stored location tag or a declared alias such as Bhubaneswar → Khordha. Source datelines can also mention a district without implying the incident happened there; click the original source for context. Unlocated statewide stories remain linked in their usual tab but do not create a geographic marker. Official orders and Assembly accounts can light a district in the all-leaders view, but are **not** represented as a named politician's personal statement. No scraping bypass or fabricated tweet text is used.
