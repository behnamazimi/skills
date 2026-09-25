# Report: Spanish | 10 | exclude: lunes, martes, miércoles

## Settings
- domain Spanish (user); count 10 (user); learner English (default); level A2–B1, ceiling B1 (default); beginner_mode on; immersion off (default); pronunciation none (default, beginner mode); dialect Latin American Spanish, broadly neutral (default; exclude items gave no dialect hint).
- Path: lite. Mode: **inline** (no subagent tool) — the independent reviews (list review, sample review, coach, learner test, judge, level raters, fact check, rule check) were done by the same agent. Node ran; all script checks verified.

## Exclude
- lunes, martes, miércoles expanded as lemma-scope nouns. None ignored. Candidates: 0 pairs.
- The excluded items start the weekday closed set, so it was finished (R-EX-05, R-SEL-04): jueves, viernes, sábado, domingo.

## Selection
- 4 slots finish the weekday set; 6 claim building blocks: ser, estar, hay, no + verbo, querer, poder.
- Jobs not covered in this set (deferred): must (tener que + infinitivo), near future (ir a + infinitivo), have (tener), subject pronouns / tú–usted. Spares s01–s03 approved but unused.

## Checks
- validate spec/exclude/list/batch(samples, batch-1)/glossary: 0 errors each. metrics: no outliers, 0 plan mismatches.
- Coach: all fields scored 3–4; learner test 10/10 pass.
- Level: 32 tokens, all A1–A2; no rater-2 items; no level exceptions.
- Findings round 1: 2 should_fix on domingo (discussion repeated the definition; calendar claim stated as absolute) — both applied. Round-1 recheck: 0 findings. 0 invalid findings removed. 0 rejected, 0 dropped.
- Relationships: 2 (ser–estar, hay–estar, both "often confused with", each backed by an anti_example).
