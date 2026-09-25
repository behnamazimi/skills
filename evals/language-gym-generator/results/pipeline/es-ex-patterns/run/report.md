# Run report: Spanish | 10 | exclude: estar + gerundio, ir a + infinitivo

## Settings (source)
- domain: Spanish (user); slice_type: bare (inferred from a domain with no slice)
- count: 10 (user); path: lite
- learner: English (default); immersion: off (default)
- level: A2–B1, ceiling B1 (default); beginner mode on
- pronunciation: none (default for beginner mode)
- dialect: Latin American Spanish, broadly neutral (default; the excluded items carry no dialect hints)

## Mode
- Inline: this harness has no subagent tool, so every step ran in one agent. The independent reviews (step 3 list review, sample review, step 7 coach / learner test / judge, step 9 level raters, fact check and rule check) were done by the same agent that wrote the entries, re-reading only each step's inputs. They are not truly independent.
- Node ran: all `gym.mjs` checks are verified.

## Exclusions
- Both items expanded as `scope: phrase` (constructions): `estar + gerundio`, `ir a + infinitivo`. None ignored.
- Per R-EX-03 they block only those patterns, so `estar` (location/state) and `ir` (movement) were selected for their own jobs. `gym candidates` flagged both pairs; the step 3 review judged them different items (no finding). Neither example uses the excluded patterns.

## Checks run
- validate spec: 0 errors; validate exclude: 0; validate list: 0; candidates: 2 pairs, both cleared
- validate batch (samples, batch 1): 0 errors
- normalize + validate glossary (steps 6, 8, 9): 0 errors
- metrics: 1 batch, 0 plan mismatches, 0 outliers, no repeated scenes
- tokens: 44 unknown target tokens, all rated A1–A2 by rater 1; nothing above B1, so rater 2 had nothing to rate
- fact questions: 12 asked, 12 agree, 0 unsure
- rule check: 0 findings; validate findings: ok
- emit / validate output: ok

## Coach
- All 10 entries kept; no rewrites, so no blind-judge rounds.
- Average scores: definition 3.8, example 3.9, optional fields 3.9.
- Learner-test pass rate: 10/10.

## List review findings
- should_fix (R-SEL-07): the politeness / addressing-people job (tú / usted / ustedes) isn't covered. That set needs 3 slots and would push out core verbs at count 10, so per R-SEL-04 it was not started. Questions (the question-word set) were left out for the same reason. Good first picks for a follow-up set.

## Other
- Level exceptions: none. Rejected findings: none. Dropped or replaced terms: none (spares unused: acabar de + infinitivo, deber, saber).
- Relationships: 3 (ser/estar often confused with; tener → tener que + infinitivo builds on; ir/venir contrasts with).
