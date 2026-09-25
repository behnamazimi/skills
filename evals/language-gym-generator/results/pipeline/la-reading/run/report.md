# Report: Latin | 10

## Settings
- domain: Latin (user); slice: none; slice_type: reading (inferred: classical language)
- count: 10 (user); learner: English (default); level: A2–B1, ceiling B1 (default); beginner_mode: on
- immersion: off (default); pronunciation: none (default, beginner mode)
- dialect: Classical Latin, Ciceronian/Caesarian prose norms, macrons on long vowels (default)
- path: lite

## Execution
- Inline mode: no subagent tool, so every step ran in the same agent. The "independent" reviews (step 3 list review, sample review, step 7 coach/learner/judge, step 9 raters, fact questions and rule check) were done by the same agent that wrote the entries, so they are not truly independent.
- Node ran; all GYM checks executed.
- Step 1 (exclude) skipped: no exclude items. Nothing ignored.

## Checks
- validate spec: 0 errors
- validate list: 0 errors; candidates: 0 pairs
- step 3 list review: 0 findings
- validate batch samples.json: 0 errors
- validate batch batch-1.json: 1 error on first write (R-FLD-07: the quis/quid definition counted as 3 sentences because of question marks); fixed on the one retry, then 0
- normalize + metrics: 1 batch, def 10.5 words avg, example 10.3 words avg, 1.6 optional fields per term, 0 plan mismatches, 0 outliers, 0 repeated scenes
- validate glossary: 0 errors (after edit, coach, links and fix)
- tokens: 30 target-language tokens; rater 1 put none above B1, so no rater 2 pass was needed
- fact questions: 10 of 10 agree, 0 unsure, 0 dropped
- rule check: 1 finding (should_fix R-FLD-13 on "in + ablative": the card didn't show what an ablative looks like); validate findings: 0 removed
- step 10: 1 round, 1 applied, 0 rejected; changed entry re-tested (learner test passed, blind judge preferred the rewrite)
- emit / validate output: 0 errors

## Coach
- All fields scored 3 or 4 (definition avg 3.8, example avg 3.7, optional fields 4.0); no rewrites or drops.
- Learner test pass rate: 10/10.

## Level exceptions
- None.

## Rejected findings, dropped or replaced terms
- None. Spares (in + accusative, volō/velle, ubi) not used.

## Not verified
- Level ratings, fact answers and rubric scores were made by the writing agent itself (inline mode), not by independent reviewers.
- The pronoun set (ego, tū, nōs, vōs) and the question particles (-ne, nōnne, num) were deliberately not started: a 10-term list can't hold them in full (R-SEL-04).
