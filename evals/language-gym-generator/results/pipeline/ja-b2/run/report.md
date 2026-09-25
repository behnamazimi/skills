# Run report: Japanese, 12 terms, B2

## Settings
| Setting | Value | Source |
|---|---|---|
| domain | Japanese (bare slice) | user |
| count | 12 | user |
| level | B2 (floor B2, ceiling B2); beginner mode off | user |
| learner | English | default |
| immersion | off | default |
| pronunciation | ipa (broad Tokyo IPA, no pitch marks) | user |
| dialect | Standard Japanese (hyōjungo, Tokyo-based), kanji + kana | default |
| exclude | none | — |

## Path and mode
- Path: **lite** (count ≤ 15).
- **Inline mode:** no subagent tool was available, so every step ran in the same agent. The "independent" reviews (step 3 list review, step 4 sample review, step 7 coach/learner test/blind judge, step 9 level raters, fact questions and rule check) were done by the same agent that wrote the entries, after re-reading only that step's inputs. They are not truly independent.
- Node ran: yes. All `gym.mjs` checks were executed.

## Checks run
- `validate spec`: 0 errors.
- `validate exclude`: 0 errors (no exclude items; ignored: none).
- `validate list`: 0 errors. `candidates`: 0 pairs.
- Step 3 list review: 0 findings.
- `validate batch samples.json`: 0 errors. Sample review: no score ≤ 2.
- `validate batch batch-1.json`: first pass 1 error (R-FLD-06, t03 example 25 words > 18 × 1.25); retry 1 shortened it; second pass 0 errors.
- `normalize` + single editor (lite): one wording change (t10 definition trimmed its overlap with the discussion).
- `metrics`: 1 batch, def 19.0 words, example 17.7 words, 2.17 optional fields/term, 0 plan mismatches, 0 outliers, 0 repeated scenes.
- `validate glossary`: 0 errors (after steps 6, 7, 8 and in step 9).
- `tokens`: 66 unknown target tokens; rater 1 put none above B2 (highest: 転勤, 不良, and the humble causative structure at B2), so rater 2 had nothing to rate. Level findings: 0.
- Fact questions: 15 asked, 15 agree, 0 unsure, 0 dropped.
- Rule check: 0 findings. `validate findings`: 0 findings, 0 removed.
- `emit`: output valid.

## Coach
- Scores (1–4): definition avg 3.67, example avg 3.92, anti_example avg 3.71, discussion avg 3.6, mental_model 3, controversy 4.
- Learner test: 12/12 passed, no unknown words.
- Rewrites: 1 (t02 `〜させていただく` anti_example: the original said "verbs ending in -u", which also covers ru-verbs; the rewrite gives the u-verb/ru-verb split). The blind judge preferred the rewrite, and it was applied.

## Relationships
- 1: 〜ことにする ↔ 〜ことになる (often confused with). The anti_example on 〜ことにする carries it.

## Other
- Level exceptions: none.
- Rejected findings: none.
- Dropped or replaced terms: none. Spares unused: 〜とは限らない, 〜わりに, さすが, 〜っぽい.
- Controversy scan: done on all 12. One real disagreement found (overuse of 〜させていただく).
- IPA for patterns uses one filled form taken from the example (e.g. 〜んです → /tomattetandesɯ/), per R-PRON-01.
- Unverified: none by script. Because of inline mode, the review judgments are single-agent.
