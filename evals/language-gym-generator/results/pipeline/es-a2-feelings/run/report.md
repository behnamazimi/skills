# Report: Spanish A2 feelings

## Settings
- domain: "Spanish A2 feelings" (user); language Spanish; slice "feelings", slice_type usage (inferred)
- count: 10 (user)
- level: A2 (floor A2, ceiling A2) (user, named in domain); beginner_mode: true
- learner: English (default); immersion: false (default)
- pronunciation: none (default, beginner mode)
- dialect: Latin American Spanish, broadly neutral (default)

## Path and mode
- Lite path (count <= 15).
- Inline mode: no subagent tool, so every step, including the "fresh" reviews (list review, sample review, coach, learner test, blind judge, level raters, fact questions, rule check), was run by the same agent. The independent reviews are therefore not truly independent.
- Node ran; all gym.mjs checks were executed.

## Exclude
- None given; nothing ignored.

## Checks
- validate spec: 0 errors. validate exclude: 0. validate list: 0. candidates: 0 pairs.
- list review: 0 findings.
- validate batch samples: 0. validate batch batch-1: 1 error first pass (R-FLD-06, t10 example 17 words), fixed on the one allowed retry; 0 errors after.
- normalize, validate glossary: 0 errors. metrics: no outliers, 0 plan mismatches, no repeated scenes.
- tokens: 46 target tokens; rater 1 rated all at A1-A2, none above ceiling, so rater 2 not needed. 0 level findings.
- fact questions: 10/10 agree, 0 unsure.
- rule check: 0 findings. validate findings: 0 removed.
- emit / validate output: ok.

## Batch metrics
- 1 batch, 10 terms; mean definition 14.9 words, example 11.3 words, 2 optional fields per term.

## Coach
- Mean scores: definition 3.8, example 3.7, anti_example 4.0, discussion 3.6.
- Learner test: 9/10 passed first time. t09 failed ("conseguiste" unknown at A2); example rewritten to "¿Te dieron el trabajo? ¡Me alegro mucho!", which won the blind judge.

## Level exceptions
- None.

## Rejected findings / dropped terms
- None. Spares (nervioso, tener ganas de, contento) unused.

## Unverified
- Nothing unverified by script; the judgment reviews were inline (see above).
