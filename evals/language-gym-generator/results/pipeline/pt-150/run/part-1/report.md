# Report: Portuguese, part 1 of 2

## Settings
| Setting | Value | Source |
|---|---|---|
| domain | Portuguese (bare slice: conversation core) | user |
| count | 150 → series of 2 parts, 75 + 75 (confirmed by the user) | user |
| learner | English | default |
| level | A2–B1 (ceiling B1, beginner mode on) | default |
| immersion | off | default |
| pronunciation | none | default (beginner mode) |
| dialect | Brazilian Portuguese, everyday spoken standard (pt-BR) | default |

Path: full. Mode: **inline**, since the harness has no subagent tool. The independent reviews (list review, sample review, coach, learner test, blind judge, both level raters, fact check, rule check) were done by the same agent, each pass re-reading only its own inputs. Node ran, and every `gym.mjs` check ran for real.

## Exclude
No exclude items for part 1.

## Checks run
- `validate spec`: 0 errors.
- `validate list`: 0 errors, run twice. `candidates`: 1 pair (o que / que). The review judged them different items, so there was no finding.
- List review (step 3): 1 must_fix (modal set undeclared, dever missing) and 1 should_fix (copula set undeclared). The list went back to step 2 once: dever was added, pode ser moved to spares, and both sets were declared. The second review found nothing.
- Samples (ser, então, tudo bem): `validate batch` returned 0 errors. The rubric review scored every field 3–4.
- Batches: 6 batches (13/13/13/13/11/12). First validation failed batches 1, 3, 5 and 6 (opening word repeated or overused, the banned phrase "refers to", and one example over the length limit). Each got one retry. Batch 6's retry still had one over-length example (ver). Because the error was mechanical, it was fixed in step 6 instead of swapping the batch for spares.
- Step 6 editors: the definition editor rewrote 23 openings so that no opening word appears more than 3 times. The example editor changed 4 examples: one for length, and three that repeated a sentence frame ("onde fica", "quanto custa", "filme … ontem"). Log: `edit-log-step6.json`.
- `metrics`: no outliers and no repeated scenes. Batch means: definition 8.4–11.4 words, example 10.1–11.6 words, optional fields 1.67–2.08 per entry, 0 plan mismatches.
- `validate glossary`: 0 errors after every step.

## Coach (step 7)
- Every present field scored 3 or 4, except t48 (se) discussion, which scored 2.
- Learner test: 73/75 passed. t10 failed on the unknown word "carregador" and t71 on "carona".
- 3 rewrites went to the blind judge (t48 discussion, t10 example, t71 example), and all 3 won. No `drop_field`.

## Relationships
17 relationships. Types: often confused with 6, contrasts with 6, builds on 3, synonym of 1, works with 1.

## Step 9
- Level check: `tokens` found 172 unknown target tokens. Rater 1 put none above B1 (1 at B1: atendeu), so rater 2 had nothing to rate and there were 0 level findings.
- Level exceptions: none.
- Fact check: 76 questions, 1 disagreement (t65 conseguir: the anti_example overstated 'não posso' as 'not allowed'), 0 unsure.
- Rule check: 1 should_fix (t34 ninguém anti_example repeated nada's trap).
- `validate findings`: 2 findings valid, 0 removed.

## Step 10
Round 1 applied both findings (t65, t34). The changed entries passed the learner test, both rewrites won the blind judge, and the step 9 recheck found nothing. Rejected findings: none. Dropped or replaced terms: none.

## Not verified
- CEFR levels are the agent's judgment. No levellist was given.
- Every review ran inline and was not independent.
