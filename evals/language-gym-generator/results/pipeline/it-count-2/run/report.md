# Report: Italian | 2

## Settings
| Setting | Value | Source |
|---|---|---|
| domain | Italian (slice: none, slice_type bare) | user |
| count | 2 | user |
| learner | English | default |
| level | A2–B1 (ceiling B1, beginner mode on) | default |
| immersion | off | default |
| pronunciation | none | default (beginner mode) |
| dialect | Standard Italian | default |
| exclude | none | — |

## Path and mode
- Lite path (count ≤ 15).
- **Inline mode**: no subagent tool, so every step (including the "fresh" reviews: list review, sample review, coach, learner test, blind judge, level raters, fact questions, rule check) was run by the same agent. These reviews are not independent.
- Node ran; all `gym.mjs` checks were executed.

## Selection
- Main: essere (identity/description), c'è (existence). Spare: non (negation), unused.
- Pronouns and the modal set (volere/potere/dovere) are closed sets larger than the count, so they were not started (R-SEL-04). Negation, people-reference and want/can/must remain uncovered at this count.
- Exclude items ignored: none (no exclude given).

## Checks
- validate spec: 0 errors. validate exclude: 0. validate list: 0. candidates: 0 pairs. list review: 0 findings.
- validate batch (samples / batch-1): 0 errors. normalize + validate glossary: 0 errors.
- metrics: 1 batch, def 17 words avg, example 12 words avg, 0 plan mismatches, no outliers.
- Coach scores: essere def 4 / example 4 / anti_example 4; c'è def 3 / example 4 / anti_example 4. Averages: definition 3.5, example 4, anti_example 4. Learner test pass rate 2/2. No rewrites.
- Relationships: 1 (c'è builds on essere).
- Level check: 10 tokens rated by rater 1, none above B1, so no rater 2 needed. Level exceptions: none.
- Fact questions: 5 asked; 1 disagreement (gloss of "Piacere" as "Hi").
- Findings: 1 (must_fix, R-FLD-08, t01 example gloss). 0 removed by validate findings.

## Fixes
- Round 1: applied the fix to t01 example ("Nice to meet you, I'm Marco, from Naples."). Rejected: none. Dropped/replaced terms: none.
- Changed entry re-checked (learner test pass; judge preferred the fix; step 9 re-run: 0 findings).

## Unverified
- Nothing unverified by script. All judgment reviews were same-agent (inline).
