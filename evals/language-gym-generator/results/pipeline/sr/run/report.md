# Report: Serbian | 10

## Settings (spec.json)
- domain: Serbian (user); count: 10 (user); learner: English (default); level: A2–B1, beginner mode on (default); immersion: off (default); pronunciation: none (default, beginner mode); dialect: standard ekavian Serbian, Latin script (default; one script chosen per language-profile.md, Latin rather than Cyrillic).
- slice_type: bare. Path: lite.

## Execution
- Inline mode: no subagent tool, so every step (including the independent reviews: list review, sample review, coach/learner test/blind judge, level raters, fact questions, rule check) was done by the same agent. These reviews are therefore not truly independent.
- Node ran: all gym.mjs checks executed.

## Exclude
- No exclude items; nothing ignored.

## Checks run
- validate spec: 0 errors. validate list: 0 errors (twice). candidates: 0 pairs.
- Step 3 list review: 1 must_fix (R-SEL-05: building-block job "come" uncovered while construction "ću + infinitiv" took a slot). Sent back to step 2 once: doći (s02) promoted, ću + infinitiv moved to spares (s04).
- validate batch samples: 0 errors. validate batch-1: 1 error first time (R-FLD-07, moći definition 3 sentences), fixed on the one retry; then 0.
- normalize + validate glossary: 0 errors. validate findings: 0. emit / validate output: 0 errors.

## Metrics
- One batch, 10 terms: avg definition 14 words, example 12.3 words, 1.9 optional fields per term, 0 plan mismatches, no outliers, no repeated scenes.

## Coach
- Average scores: definition 3.8, example 3.9, anti_example 4.0, discussion 4.0.
- Learner test: 10/10 pass.
- Rewrites: 1 (ima / nema definition), won the blind judge and applied.

## Level check
- 39 tokens rated; none above B1, so no second rater was needed. No level exceptions.

## Facts / rule check
- 10 fact questions, all agree, none unsure. Rule check: no findings. Step 10 not needed.

## Dropped / replaced
- t10 ću + infinitiv replaced by s02 doći at list review. No terms dropped after writing.

## Not verified
- Independent reviews were not independent (inline mode). No levellist given; CEFR ratings are judgment.
