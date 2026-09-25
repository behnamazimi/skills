# language-gym-generator evals

These live outside the skill folder, so they aren't installed along with the skill.

| File | What it is |
|---|---|
| `gym.test.mjs` + `fixtures/` | unit tests for `skills/language-gym-generator/scripts/gym.mjs`: `node --test evals/language-gym-generator/gym.test.mjs` |
| `cases.json` | the test set: arguments, required properties (`expect`), judged criteria (`judge`) and a minimal `spec` used for scoring |
| `score.mjs` | scores one run: `node score.mjs results/<run>` → prints and writes `score.md` and `score.json` |
| `collect.mjs` | builds each case's `messages.json` from its `reply-N.txt` files: `node collect.mjs results/<run>` |
| `prepare-judge.mjs`, `unblind.mjs` | blind pairwise comparison of two runs (see below) |

Run the scripts from this folder. Run output goes in `results/`, which isn't committed.

## Running a case

Run each case in a **fresh** agent session with the skill loaded, passing `args` as the skill's arguments. Save every assistant reply, in order, as `results/<run>/<case-id>/reply-N.txt`, then run `collect.mjs`.

- `answer` (e.g. `pt-150`): the user's reply to the skill's question.
- `{output:<case-id>}` in `args` (e.g. `es-repeat-2`): replace it with that case's final JSON reply from the same run, pasted as the exclude list. Run that case after the one it depends on.

To compare against the previous single-pass skill, take `skills/language-gym-generator/SKILL.md` from the commit before the pipeline rebuild (`git show 61daf93^:skills/language-gym-generator/SKILL.md`).

## Scoring

**Hard properties** are computed by the script and must pass: reply type, the import schema, term counts, excluded items and their forms, closed sets, scripts, overlap between runs, and series parts. No definition may carry an example inside it (R-FLD-18). Optional fields are judged by the blind judges (earned vs padded vs missing), not by a count: any numeric target turned into a quota in testing. The reply must be *only* JSON: code fences or text around it fail the "reply is json" check, because the user pastes the reply straight into Jargon Gym.

**Mechanical violations** are the `gym.mjs validate glossary` rules that need no style sheet: opening words, restated terms, pronunciation mode, beginner-mode shape, banned phrases, relationships, immersion scripts. Lower is better.

**Blind pairwise comparison:**
1. `node prepare-judge.mjs results/<a> results/<b> <judgeDir>` writes each case's two outputs as `X.txt` / `Y.txt` in random order, plus a `brief.md` with the case criteria. It keeps the key in `mapping.json`.
2. Judge agents read only the case folders (never `mapping.json`) and write `verdict.json`: criteria pass/fail, words above the level ceiling, field scores, consistency, errors, winner.
3. `node unblind.mjs <judgeDir> results/compare-<a>-vs-<b>.json` maps the verdicts back to the runs and prints the summary table.

## Last result (pipeline vs the single-pass skill, 27 cases, 15 languages)

- **Hard properties:** 92/92 vs 90/95.
- **Import-schema passes:** 24/24 vs 23/25.
- **Mechanical violations:** 0 vs 13.
- **Blind wins:** 16 of 23 for the pipeline, with fewer errors (15 vs 21) and fewer above-level words (4 vs 6).
- **Round 2** (after the required-jobs, beginner-clause and IPA fixes, on the 4 cases the pipeline had lost): 2 wins, 1 tie, 1 loss (Turkish: verb negation and `must` missing; the negation rule now says the verb negation is what counts). Consistency 4.00 vs 3.50, example score 3.72 vs 3.47.
- **Caveats:** the pipeline ran in its inline fallback (no nested subagents were available), one run per case, and the judges were the same model family as the generator.
