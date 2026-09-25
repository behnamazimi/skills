# Report: German | 10 | learner=Persian

## Settings
- domain: German (user); slice: none, slice_type bare
- count: 10 (user); learner: Persian (user)
- level: A2–B1 (default), ceiling B1, beginner mode on
- immersion: off (default); pronunciation: none (default for beginner mode)
- dialect: Standard German (Germany) (default)
- path: lite

## Execution
- Inline mode: no subagent tool, so every step (including the "fresh" reviews: list review, sample review, coach, learner test, blind judge, level raters, fact questions, rule check) was done by the same agent. The independent reviews were not independent.
- Node ran: all gym.mjs checks executed.

## Exclude
- None given; nothing ignored.

## Checks
- validate spec: 0 errors; validate exclude: 0; validate list: 0; candidates: 0 pairs
- list review: 1 should_fix (spare s03 term shape; spare unused)
- validate batch (samples, batch-1): 0 errors
- normalize + metrics: 1 batch, def 11.7 words avg, example 8.4 words avg, 0 plan mismatches, no outliers, no repeated scenes
- validate glossary (after coach, links, fixes): 0 errors
- tokens: 37 unknown target tokens, all rated A1 by rater 1; nothing above ceiling, so rater 2 not needed
- findings: 2 (1 must_fix facts on haben anti_example, 1 should_fix on nicht definition), both valid and both applied in round 1
- emit / validate output: passed

## Coach
- All present fields scored 3–4 (mean ≈ 3.9); no rewrites or drops
- Learner test: 10/10 pass

## Level exceptions
- None

## Rejected findings
- None

## Dropped / replaced terms
- None

## Selection notes
- The 10 slots are taken by building blocks: sein, haben, nicht + kein (negation pair) and the full modal set (können, müssen, möchten, wollen, dürfen, sollen), which is all-or-nothing.
- Jobs not covered at this count: existence (es gibt), questions, go/come, du/Sie politeness. Good first picks for a follow-up set (pass this glossary as exclude).

## Unverified
- Nothing script-side. All judgment checks were self-reviewed (inline mode).
