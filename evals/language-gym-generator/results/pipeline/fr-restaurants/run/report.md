# Run report: French restaurants

## Settings
| Setting | Value | Source |
|---|---|---|
| domain | French restaurants (slice_type: usage) | user |
| count | 12 | user |
| learner | English | default |
| level | A2–B1 (ceiling B1, beginner mode on) | default |
| immersion | off | default |
| pronunciation | none | default (beginner mode) |
| dialect | Standard metropolitan French (France), fr-FR | default |
| exclude | none | — |

## Path and mode
- Path: lite (count ≤ 15). One batch; the step 4 plan also wrote batch 1.
- **Inline mode:** no subagent tool, so every step (including the "fresh" reviews: list review, sample review, coach, learner test, blind judge, level raters, fact questions, rule check) ran in the same agent. Independent reviews were done by the same agent.
- Node ran: all `gym.mjs` checks are verified.
- Step 01 skipped (no exclude); an empty `exclude.json` was written so checks could take `--exclude`.

## Checks run
- validate spec: 0 errors
- validate exclude / list: 0 errors; candidates: 0 pairs
- list review (step 3): 0 findings
- validate batch (samples, batch-1): 0 errors
- normalize + metrics: 1 batch, 12 terms, def 12.9 words avg, example 8 words avg, 2 optional fields per entry avg, 0 plan mismatches, 0 outliers, 0 repeated scenes
- validate glossary: 0 errors (after steps 6, 7, 8, 10)
- tokens: 39 target-language tokens (examples only); rater 1 put none above B1, so rater 2 was not needed
- fact questions: 14, all agree, none unsure
- validate findings: 1 finding, valid
- emit / validate output: 0 errors

Note: `normalize` removed the French typographic space before `?` and `!`.

## Coach (step 7)
- Averages: definition 3.75, example 3.67 before rewrites, optional fields 3.75.
- Learner test pass rate: 11/12 (t08 failed on "a l'air" in its example).
- Rewrites that won the blind judge: t08 example (removed "avoir l'air"), t07 example (removed redundant "aujourd'hui").

## Relationships
2: la carte / le menu (often confused with, backed by le menu's anti_example), je voudrais… / je vais prendre… (alternative to).

## Step 9 / 10
- 1 finding (R-FLD-13, should_fix, t11 discussion: "Menus" clashed with the le menu false friend). Applied in round 1. No rejected findings.
- Level exceptions: none.
- Dropped or replaced terms: none. Spares unused: excusez-moi, sans…, on peut payer par carte ?, le pourboire.

## Not verified
- The agent-judged checks (level ratings, fact answers, rule check, coach scores) were not independent because they ran inline.
