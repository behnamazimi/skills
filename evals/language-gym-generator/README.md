# language-gym-generator evals

These live outside the skill folder, so they aren't installed along with the skill.

| File | What it is |
|---|---|
| `gym.test.mjs` + `fixtures/` | unit tests for `skills/language-gym-generator/scripts/gym.mjs`: `node --test evals/language-gym-generator/gym.test.mjs` |
| `cases.json` | the test set: arguments, required properties (`expect`), judged criteria (`judge`) and a minimal `spec` used for scoring |
| `score.mjs` | scores one run: `node evals/language-gym-generator/score.mjs results/<run>` → prints and writes `score.md` and `score.json` |
| `baseline/SKILL.md` | a snapshot of the single-pass skill the pipeline replaced, kept for comparison |
| `results/` | one folder per run |

## Running a case

Run each case in a **fresh** agent session with the skill loaded, passing `args` as the skill's arguments. Save every assistant reply, in order, as a JSON array of strings in `results/<run>/<case-id>/messages.json`.

- `answer` (e.g. `pt-150`): the user's reply to the skill's question.
- `{output:<case-id>}` in `args` (e.g. `es-repeat-2`): replace it with that case's final JSON reply from the same run, pasted as the exclude list. Run that case after the one it depends on.

## Scoring

**Hard properties** are computed by the script and must pass: reply type, the import schema, term counts, excluded items and their forms, closed sets, scripts, overlap between runs, and series parts. The reply must be *only* JSON: code fences or text around it fail the "reply is json" check, because the user pastes the reply straight into Jargon Gym.

**Mechanical violations** are the `gym.mjs validate glossary` rules that need no style sheet: opening words, restated terms, pronunciation mode, beginner-mode shape, banned phrases, relationships, immersion scripts. Lower is better.

**Judged criteria** are recorded by a judge agent in `results/<run>/judgments.json` as `{ "<case-id>": { "<criterion>": { "pass": bool, "note": "…" } } }`. The judge must not be the agent that produced the output.

**Blind pairwise comparison:** `results/compare-<a>-vs-<b>.json` = `{ "a": "<run>", "b": "<run>", "results": { "<case-id>": { "winner": "<run> | tie", "reason": "…" } } }`. The judge sees the two outputs as X and Y in random order. Show the tally with `score.mjs <run> --compare <file>`.
