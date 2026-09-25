# Report: Arabic | 10

## Settings (spec.json)
| Setting | Value | Source |
|---|---|---|
| domain | Arabic | user |
| count | 10 | user |
| learner | English | default |
| level | A2–B1 (ceiling B1, beginner mode on) | default |
| immersion | off | default |
| pronunciation | none | default (beginner mode) |
| dialect | Modern Standard Arabic (fuṣḥā), Arabic script, vowelled terms | default (R-IN-08) |
| slice_type | bare | inferred |

Path: **lite** (count ≤ 15).

## How it ran
- **Inline mode:** no subagent tool, so every step (including the "fresh" reviews: list review, sample review, coach, learner test, blind judge, level raters, fact questions, rule check) was done by the same agent. The independent reviews were not truly independent.
- Node ran; every `gym.mjs` check was run for real.
- Exclude: none given; nothing ignored.

## Checks
- validate spec / exclude / list: 0 errors. candidates: 0 pairs.
- List review (step 3): 1 should_fix (R-SEL-07): the jobs *can*, *must*, *go*, *come* are not covered at count 10. The 4-member negator set (لَيْسَ, لَا, لَمْ, لَنْ) was completed instead (R-SEL-04). Next in line, already approved as spares: يَجِبُ أَنْ, يَسْتَطِيعُ أَنْ, ذَهَبَ إِلَى.
- Sets not started (too big for count 10): independent pronouns (12 with dual), wh-question words.
- Samples (t01, t02, t10) validated; rubric scores all ≥ 3.
- validate batch / glossary: 0 errors at every stage. Normalize applied.
- Metrics: one batch; def 13.6 words, example 9.9 words, 2.1 optional fields per term, 0 plan mismatches, no outliers, no repeated scenes.
- Editor: 1 wording change (t07 definition).
- Coach: all field scores 3–4 (definition avg 3.8, example 3.8, discussion 3.4, anti_example 3.8). Learner test pass rate 10/10. No rewrites, so no judge rounds.
- Relationships: 2 (often confused with; negative of).
- Level check: 34 unknown tokens; rater 1 put none above B1 (أَحْجِزَ rated B1), so rater 2 had nothing to rate. 0 level findings.
- Fact questions: 12 questions, all agree, none unsure. 0 drops.
- Rule check: 1 should_fix (R-FLD-11, t01 anti_example: quote the learner word order أَنَا لَا مَشْغُولٌ). Applied in fix round 1; t01 re-checked (learner test pass, judge preferred the fix, step 9 clean).
- validate findings: 0 invalid findings removed.
- emit / validate output: ok.

## Level exceptions
None.

## Rejected findings
None.

## Dropped / replaced terms
None. 10/10 terms delivered.

## Not verified
- Independence of reviews (inline mode, see above).
