# Report: Spanish | 10 | exclude: ser, estar, tener

## Settings (spec.json)
- domain: Spanish (user); slice: none, slice_type bare
- count: 10 (user)
- exclude: ser, estar, tener (user), all expanded as lemma scope; none ignored
- learner: English (default)
- level: A2–B1, ceiling B1 (default); beginner_mode on
- pronunciation: none (default, because beginner mode is on)
- immersion: off (default)
- dialect: Latin American Spanish, broadly neutral (default; exclude items gave no dialect hints)

## Run
- Path: lite
- Inline mode: yes. No subagent tool was available, so every step (including the "fresh" reviews: list review, sample review, coach, learner test, blind judge, raters, fact check, rule check) was done by the same agent. The independent reviews were therefore not truly independent.
- Node: yes, all gym.mjs checks ran.

## Checks
- validate spec: 0 errors
- validate exclude: 0 errors
- validate list: 0 errors; candidates: 0 pairs
- list review: 0 findings
- validate batch (samples): 1 error on the first try (R-FLD-06, example 16 words > 12); fixed on the one retry
- validate batch (batch-1): 1 error on the first try (R-FLD-06, t08 example 16 words); fixed on the one retry
- normalize + validate glossary: 0 errors
- metrics: 1 batch, 0 outliers, 0 plan mismatches, no repeated scenes
- coach: all fields scored 3–4 (mean about 3.9); no rewrites or drops suggested
- learner test: 10/10 pass, no unknown words
- level check: 44 tokens, all rated A1–A2 by rater 1; nothing above B1, so rater 2 had nothing to rate
- fact questions: 13 asked, 13 agree, 0 unsure
- rule check: 2 should_fix findings (R-FLD-03 usage notes in t04 and t05 definitions); both applied in fix round 1 and both won the blind judge; the changed entries passed re-check
- findings removed by validate findings: 0

## Level exceptions
- none

## Rejected findings
- none

## Dropped or replaced terms
- none. Spares (hay que + infinitivo, pero, saber, hacer) were not used

## Notes
- The tú/usted politeness job and the question-word set were left out on purpose: each is a closed set (subject pronouns, question words) bigger than a 10-term list allows (R-SEL-04). Yes/no questions need no term, since Spanish makes them with intonation alone.
- Example word limits count the English gloss, so glosses were kept short.

## Unverified
- Nothing was checked by hand instead of by script. Judgment checks were not independent (inline mode).
