# Swahili, 12 terms, A2: run report

## Settings
- domain: Swahili (user); slice: none, slice_type bare
- count: 12 (user)
- level: A2, floor A2, ceiling A2 (user); beginner mode on
- learner: English (default); immersion: off (default)
- pronunciation: none (default for beginner mode)
- dialect: Standard Swahili (Kiswahili sanifu), Tanzania and Kenya (default)
- exclude: none

## Path and mode
- Lite path (count ≤ 15).
- Inline mode: no subagent tool, so every step (including the "fresh" reviews: list review, sample review, coach, learner test, level raters, fact questions, rule check) was run by the same agent. The independent reviews were therefore not truly independent.
- Node ran; all GYM checks are verified.

## Checks
- validate spec: 0 errors
- validate exclude: 0 errors (no exclude items)
- validate list: 0 errors; candidates: 0 pairs
- list review: 1 should_fix finding (R-SEL-05: go/come not covered), kept by design; see below
- validate batch (samples, batch-1): 0 errors
- metrics: 1 batch, no outliers, 0 plan mismatches, no repeated scenes
- validate glossary (after edit, coach, links): 0 errors
- tokens: 38 unknown target tokens; rater 1 put none above A2, so no rater 2 pass was needed; 0 level findings
- fact questions: 8 asked, 8 agree, 0 unsure
- rule check: 0 findings; validate findings: 0 removed
- step 10: no rounds needed
- emit / validate output: 0 errors

## Edit pass
- t12 example changed from "Nimefika! Uko wapi?" to "Tumefika nyumbani salama." because it repeated the "Uko wapi?" frame from t04.

## Coach
- All present fields scored 3 or 4 (mean about 3.8); no rewrites, no drop_field.
- Learner test: 12/12 pass.

## Level exceptions
- None.

## Rejected findings
- None.

## Dropped / replaced terms
- None.

## Gaps and notes
- Go/come (kwenda, kuja) and the wh-question word set (nini, nani, wapi, lini, gani, vipi, -ngapi) are not taught: the four core tense markers (a closed set) and want/can/must took the slots. Spares s01 kwenda, s02 kuja, s03 je, s04 lakini are approved and first in line for a follow-up set.
- Some example sentences use untaught but A2-level words (wapi, sokoni, chenji, niondoke); each is covered by the English gloss.
