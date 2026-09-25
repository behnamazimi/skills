# Report: Turkish | 10

## Settings
- domain: Turkish (user); slice: none, slice_type bare
- count: 10 (user)
- learner: English (default)
- level: A2–B1, ceiling B1 (default); beginner_mode on
- immersion: off (default)
- pronunciation: none (default, beginner mode)
- dialect: Standard Turkish, Istanbul norm (default)

## Path and mode
- Lite path (count ≤ 15).
- Inline mode: no subagent tool, so every step ran in one agent. The "fresh" reviews (list review, sample review, coach, learner test, blind judge, level raters, fact questions, rule check) were done by that same agent, so they are not independent.
- Node ran; all GYM checks are verified.

## Exclude
- None given; step 01 skipped, no candidates check.

## Checks
- validate spec: 0 errors
- validate list: 0 errors
- validate batch (samples, batch-1): 0 errors
- normalize + validate glossary (after steps 6, 8, 10): 0 errors
- metrics: 1 batch, no outliers, 0 plan mismatches, no repeated scenes
- tokens: 29 unknown target tokens; rater 1 put none above B1, so rater 2 was not needed
- fact questions: 10/10 agree
- validate findings: 1 finding, 0 removed
- validate output (via emit): 0 errors

## List review (step 3)
Two should_fix findings, kept as known gaps (no must_fix, no loop):
- Positive identity for I/you (personal "be" endings) has no entry; that is a 6-ending set that doesn't fit in 10 slots. Good first item for a follow-up set.
- Grammatical politeness (sen/siz) not covered; part of the pronoun set, not started at count 10.

## Coach (step 7)
- Average scores: definition 3.8, example 3.8, optional fields 3.8.
- Learner-test pass rate: 10/10. No rewrites proposed.

## Fixes (step 10)
- Round 1: t07 lazım definition reworded (R-FLD-03, should_fix): the ending before lazım is a "my/your" ending, not a verb person ending. Rewrite won the blind judge; entry re-checked.
- Rejected findings: none. Dropped or replaced terms: none.

## Level exceptions
- None.

## Relationships
- 1: değil often confused with yok (backed by değil's anti_example).

## Unverified
- Nothing script-side. Judgment reviews are same-agent (see inline mode).
