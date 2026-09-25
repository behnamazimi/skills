# Run report: Spanish, 12 terms (repeat request)

## Settings
- domain: Spanish (user); slice: none, slice_type bare
- count: 12 (user)
- exclude: pasted glossary JSON, 12 terms (user); ignored items: none
- learner: English (default); immersion: off (default)
- level: A2–B1, ceiling B1, beginner mode on (default)
- pronunciation: none (default; beginner mode)
- dialect: Latin American Spanish (broadly neutral) (default; confirmed by the excluded glossary's description, no vosotros)
- path: lite

## Mode
- Inline: no subagent tool, so every step ran in this one agent. The independent reviews (list review, sample review, coach, learner tests, blind judge, level raters, fact questions, rule check) were not independent.
- Node ran; every GYM check ran for real.

## Selection
- Repeat request moved forward from the excluded set. Started sets finished: 'you' (ustedes), modals (deber), negative words used with no (nadie, nunca, ninguno). New jobs: go/come (ir, venir), reason/purpose (porque, para + infinitivo), recent past (acabar de + infinitivo), knowing (saber, conocer).
- Left out on purpose: estar + gerundio (excluded estar is lemma scope), question words (8-member A1 set, not started), hay que (overlaps excluded hay and tener que).
- Spares approved, unused: necesitar, hace + tiempo, entonces, decir.
- candidates.json flagged ir vs 'ir a + infinitivo' (phrase scope, different job) and saber vs haber (different words): no findings.

## Checks
- validate spec / exclude / list / batch (samples, batch-1) / glossary / findings / output: 0 errors each.
- metrics: 1 batch, 0 outliers, 0 plan mismatches, 0 repeated scenes.
- Coach: 12 entries, all field scores 3–4 (avg ≈ 3.9); 1 rewrite (nadie definition), which the judge preferred. Learner test pass rate 12/12.
- Level: 43 tokens, none rated above B1, so no second-rater pass. Level exceptions: none.
- Facts: 13 questions, 13 agree, 0 unsure.
- Findings: 0 (step 10 not needed). Rejected findings: none. Dropped or replaced terms: none.

## Not verified
- Nothing unverified by script. The judgment reviews were done inline by the same agent (see Mode).
