# Report: Spanish, 10 terms

## Settings
| Setting | Value | Source |
|---|---|---|
| domain | Spanish (slice_type bare) | user |
| count | 10 | user |
| exclude | sí, no, qué | user |
| learner | English | default |
| level | A2–B1 (ceiling B1, beginner mode on) | default |
| immersion | off | default |
| pronunciation | none | default (beginner mode) |
| dialect | Latin American Spanish (broadly neutral), es-419 | default (no dialect hints in the exclude items) |

Path: **lite** (count ≤ 15). **Inline mode**: no subagent tool was available, so every step, including the "independent" reviews (list review, sample review, coach, learner test, blind judge, level raters, fact check, rule check), was done by the same agent. Node ran; every `gym.mjs` check ran for real.

## Exclude
- sí, no, qué expanded as lemma-scope items; nothing ignored.
- `candidates` flagged three pairs: `si`/`sí`, `que`/`qué`, `tener que`/`qué`. All judged **different items** (R-EX-04: the accent makes a different word; `tener que` is the must-pattern, not the question word), so no findings. `si` and `que` were kept on purpose, with anti-example/discussion notes on the accent difference.
- The yes/no pair is complete through the excludes. The question-word set that `qué` started (quién, dónde, cuándo, cómo, cuánto, cuál, por qué) would take 7 of the 10 slots and leave want/can/must/go/have uncovered, so it was not started here. It's the natural next run.

## Checks run
- validate spec, exclude, list: 0 errors each.
- list review: 0 findings.
- validate batch (samples, batch 1): 0 errors.
- normalize + validate glossary: 0 errors (after steps 6, 7, 8, 10).
- metrics: 1 batch, def 12.4 words, example 12.1 words, 1.9 optional fields per term, 0 plan mismatches, no outliers, no repeated scenes.
- tokens: 47 target-language tokens; rater 1 put none above B1 (highest: lista, temprano, tarjeta at A2), so rater 2 was not needed. No level exceptions.
- fact questions: 13 asked, 13 agree, 0 unsure, 0 dropped.
- rule check: 1 finding (t08 `ir` definition: "put a before the place" reads as the English article; R-FLD-03, should_fix). Fixed in round 1; learner test passed and the blind judge preferred the fix.
- validate findings: 0 removed.
- emit / validate output: ok.

## Coach
- Average scores: definition 3.6, example 4.0, optional fields 3.9.
- Learner test: 9/10 passed on the first pass. `tener` failed (the card mentioned age but showed no age sentence); definition rewritten to include "tengo 30 años", the rewrite won the judge, and it passes.

## Not done / unverified
- Rejected findings: none. Dropped or replaced terms: none. Spares (pero, porque, necesitar) were not used.
- The independent-review steps weren't independent (inline mode); treat those judgments as one reviewer's view.
