# Report: Mandarin Chinese, B2, 10 terms

## Settings
| Setting | Value | Source |
|---|---|---|
| domain | Mandarin Chinese (bare) | user |
| count | 10 | user |
| level | B2 (floor B2, ceiling B2); beginner mode off | user |
| learner | English | default |
| immersion | off | default |
| pronunciation | ipa (IPA with Chao tone letters) | default (beginner mode off) |
| dialect | Standard Mandarin (Putonghua, mainland norm), Simplified characters | default |

## Path and mode
- Lite path (count ≤ 15).
- **Inline mode:** no subagent tool was available, so every step (selection, list review, plan, writing, editing, coach, learner test, blind judge, level raters, fact questions, rule check, fix) was run by the same agent. The "independent" reviews were not independent.
- Node ran; all `gym.mjs` checks are verified.

## Exclude
- No exclude items. Nothing ignored.

## Selection notes
- At B2 the A1 building blocks (是, 有, 在, 不/没, 吗) are treated as known (R-SEL-06); the slots went to constructions and discourse markers that still block fluent understanding.
- No closed set started. 4 approved spares unused (恐怕, 毕竟, ……起来, 不得不).
- List review: 1 should_fix (R-TERM-05, 到底 has several jobs). Handled in the plan: the definition is tied to the question job, the other jobs are in discussion.

## Checks run
- validate spec / exclude / list: 0 errors each; candidates: 0 pairs.
- validate batch (samples, batch 1): 0 errors.
- normalize: no changes. Editor: 2 wording changes (t06 anti_example jargon, t10 example gloss repeating the definition).
- metrics: 1 batch, def 19.3 words, example 16.7 words, 2.0 optional fields per term, 0 plan mismatches, no outliers, no repeated scenes.
- validate glossary: 0 errors (after steps 6, 7, 8, 10).
- tokens: 55 target-language tokens; rater 1 rated all at B2 or below, so rater 2 was not needed. 0 level findings.
- facts: 11 questions, 1 disagreement (t01 anti_example overstated what 不能吃 means), 0 unsure, 0 drops.
- rule check: no further findings.
- validate findings: 1 finding, 0 removed.
- validate output (emit): 0 errors.

## Coach
- Scores (1-4): definition avg 3.6, example avg 3.9, optional fields avg 3.8. No field scored 1-2.
- Learner test pass rate: 10/10.
- No rewrites, so nothing went to the blind judge in step 7.

## Fixes
- Round 1: 1 applied (t01 anti_example: 不能吃 now also covers "your body can't take it"). 0 rejected, 0 dropped. Round 2: no findings.

## Relationships
- None added: no pair had a real link that the definitions didn't already carry.

## Level exceptions
- None.

## Not verified
- Nothing script-checked was skipped. All judgment checks were done inline by one agent (see above).
