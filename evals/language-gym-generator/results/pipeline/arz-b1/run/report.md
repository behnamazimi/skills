# Report: Egyptian Arabic | 10 | level=B1

## Settings
| Setting | Value | Source |
|---|---|---|
| domain | Egyptian Arabic (slice: none, slice_type bare) | user |
| count | 10 | user |
| learner | English | default |
| level | B1 (floor B1, ceiling B1), beginner_mode on | user |
| immersion | off | default |
| pronunciation | none (beginner mode on) | default |
| dialect | Cairene colloquial, Arabic script without vowel marks | user (named in domain) |
| profile | arz, Arab, rtl | from language-profile.md |

## Path and mode
- Lite path (count 10, no series).
- **Inline mode**: no subagent tool, so every step ran in this one agent. The "independent" reviews (list review, sample review, coach, learner test, blind judge, level raters, fact questions, rule check) were done by the same agent that wrote the entries, so they are not truly independent.
- Node ran; every GYM check executed.

## Exclude
None given; nothing ignored.

## Checks
- validate spec: 0 errors. validate exclude: 0. validate list: 0. candidates: 0 pairs.
- list review (step 3): 0 findings.
- validate batch (samples, batch-1): 0 errors.
- normalize + validate glossary after steps 6, 7, 8, 10: 0 errors each.
- metrics: 1 batch, def 15.2 words avg, example 10.7, 0 plan mismatches, no outliers, no repeated scenes.
- tokens: 38 target tokens (example fields). Rater 1 put none above B1 (highest: شاحن, فصل at B1), so rater 2 had nothing to rate.
- facts: 10 questions, 10 agree, 0 unsure.
- rule check: 1 should_fix (R-FLD-03, t03 مش definition contradicted itself about the future). validate findings: 1 valid, 0 removed.
- step 10: 1 round, 1 applied, 0 rejected, 0 dropped. Changed entry re-checked (learner test pass, judge preferred rewrite, step 9 clean).
- emit / validate output: 0 errors.

## Coach
- Average scores: definition 3.6, example 4.0, discussion 3.6, anti_example 4.0.
- Learner test: 10/10 passed. No rewrites proposed.

## Selection notes
- All ten slots went to building blocks (existence, have, two negators, four modals, present and future prefixes), since nothing was excluded. Three closed sets were completed: negators, modal words, present/future prefixes.
- Pronouns (8) and question words (8) were deliberately not started: each set would take most of a 10-term count (R-SEL-04). Go/come verbs also not claimed. Spares approved but unused: كان + بـ + مضارع, لسه, يعني, خلاص.
- Items are mostly A1–A2, at or below the B1 ceiling; a follow-up set with these as exclude would move on to B1 material.

## Level exceptions
None.

## Rejected findings
None.

## Dropped or replaced terms
None.

## Not verified
- Nothing unverified by script. Judgment checks were done inline (see above).
