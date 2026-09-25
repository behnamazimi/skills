# Run report: Spanish

## Settings
| Setting | Value | Source |
|---|---|---|
| domain | Spanish (bare slice) | user |
| count | 10 | default |
| learner | English | default |
| level | A2–B1 (ceiling B1, beginner mode on) | default |
| immersion | off | default |
| pronunciation | none | default (beginner mode) |
| dialect | Latin American Spanish, broadly neutral (ustedes, no vosotros) | default |
| exclude | none | — |

Path: **lite** (count ≤ 15).

## Execution
- **Inline mode:** no subagent tool was available, so every step (including the "fresh" reviews: list review, sample review, coach, learner test, blind judge, level rater, fact questions, rule check) was done by the same agent. Independent review was not truly independent.
- Node ran; all `gym.mjs` checks were executed.
- Step 1 (exclude) skipped: no exclude items. `validate list`/`validate glossary` ran without `--exclude`; `candidates` ran against an empty exclude file (0 pairs).

## Checks
- `validate spec`: 0 errors.
- `validate list`: 0 errors. `candidates`: 0 pairs.
- Step 3 list review: 1 should_fix (R-SEL-04: ser/estar copula set complete in main but not declared in `sets[]`). No must_fix, so no loop to step 2; list unchanged.
- `validate batch samples.json`: first run 3 errors (R-FLD-06, examples with English gloss over the 12-word limit). Retried once: glosses dropped from simple examples, style note updated. Then 0 errors.
- Sample review: all fields scored 3–4.
- `validate batch batch-1.json`: 0 errors.
- `normalize`, `metrics`: 1 batch, def 12.5 words avg, example 7.7 words avg, 2.2 optional fields avg, 0 plan mismatches, 0 outliers, 0 repeated scenes.
- `validate glossary`: 0 errors (after steps 6, 7, 8 and in step 9).
- `validate findings`: 0 findings, 0 removed.
- `emit`: passed `validate output`.

## Coach (step 7)
- Score averages: definition 3.8, example 3.9, mental_model 4.0, anti_example 4.0, discussion 4.0.
- Learner test: 9/10 passed first time. `querer` failed ("quiero a comer"): the definition described the verb + verb use abstractly. Rewrite with a filled form ('quiero comer') won the blind judge and was applied.

## Relationships
2 links, both "often confused with": ser–estar, hay–estar (each backed by an anti_example).

## Level check (step 9)
59 unknown tokens rated; none above B1 (highest A2: preterite forms, disculpe, farmacia, temprano). No rater-2 pass needed. Level exceptions: none.

## Facts
11 fact questions, all agree, none unsure.

## Findings / fixes
Step 9 produced 0 findings, so step 10 did not run. No rejected findings. No dropped or replaced terms.

## Coverage notes
Subject pronouns (incl. tú/usted politeness) and question words are closed sets too big for a 10-term glossary, so they were deferred whole rather than started. `tener` (have), `porque`, `o sea` are approved spares for a follow-up set.

## Not verified
Nothing script-checked was skipped. Judgment reviews were done inline by the writing agent (see Execution).
