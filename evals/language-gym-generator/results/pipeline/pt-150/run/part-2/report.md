# Report: Portuguese, part 2 of 2

## Settings
The settings are the same as part 1 (see `../part-1/report.md`). Only `series.part` changes, to 2. The style sheet and model entries are part 1's.

Path: full. Mode: **inline** (no subagent tool). Every independent review was done by the same agent, each pass re-reading only its own inputs. Node ran, and every `gym.mjs` check ran for real.

## Exclude
- Part 1's 75 terms were expanded into `exclude.json` (R-SER-02). The user gave no exclude items of their own. Nothing was ignored.
- Hints matched the spec (Brazilian Portuguese, bare lemma), so the spec did not change.
- Step 1 bug: the first write split multi-word forms into single words (e.g. "por quê" became "por" and "quê"). `validate list` caught it through a false R-EX-01 hit on "por", and the forms were corrected before selection.

## Checks run
- `validate list`: 0 errors after the exclude fix. `candidates`: 18 pairs.
- Candidate judgments:
  - One pair was judged the same item: vamos + infinitivo is the nós form of the excluded ir + infinitivo (R-EX-01 must_fix).
  - All other pairs were judged different items: às vezes vs vez, estar com vs estar, por isso vs isso, quer dizer, que pena, sei lá, tanto faz, mais … do que vs que, and the near-spellings acontecer/conhecer and pagar/pegar.
- List review (step 3): 1 must_fix (vamos + infinitivo) and 2 should_fix (por and de repente, each tied to one job, R-TERM-05). The list went back to step 2 once: faz + tempo was promoted from spares, and both jobs were narrowed. The second review found nothing.
- Samples: part 1's model entries. They pass `validate batch` without `--exclude`. With it they fail by design, since their terms are part 1 terms.
- Batches: 6 batches (13/13/13/13/11/12). Batches 2 and 4 failed R-FLD-03 (hoje and sem restated the term). Both passed on one retry.
- Step 6 example editor: 3 examples changed to remove repeated frames ("vamos …?", "te ligo …", "posso … coisa").
- `metrics`: no outliers and no repeated scenes. 0 plan mismatches.
- `validate glossary`: 0 errors after every step.

## Coach (step 7)
- Every field scored 3 or 4, except t50 (acontecer) definition, which scored 2. Its rewrite won the blind judge.
- Learner test: 75/75 passed.

## Relationships
16 relationships. Types: contrasts with 5, often confused with 4, opposite of 4, same pattern as 1, exception to 1, similar to 1.

## Step 9
- Level check: 119 unknown tokens. Rater 1 put none above B1 (1 at B1: atraso), so rater 2 had nothing to rate and there were 0 level findings.
- Level exceptions: none.
- Fact check: 76 questions, 1 disagreement (às vezes anti_example was too absolute about 'algumas vezes'), 0 unsure.
- Rule check: 1 should_fix (ruim discussion leaned on the untaught word mal).
- `validate findings`: 2 findings valid, 0 removed.

## Step 10
Round 1 applied both findings. Both changed entries passed the learner test, both rewrites won the blind judge, and the step 9 recheck found nothing. Rejected findings: none. Dropped or replaced terms: none.

## Not verified
- CEFR levels are the agent's judgment. No levellist was given.
- Every review ran inline and was not independent.
