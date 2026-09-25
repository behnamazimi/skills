# Run report: German modal particles | 8

## Settings
- domain: "German modal particles" (user); slice_type: grammar (inferred)
- count: 8 (user)
- learner: English (default); immersion: off (default)
- level: A2–B1, ceiling B1, beginner mode on (default)
- pronunciation: none (default, beginner mode)
- dialect: Standard German as spoken in Germany, colloquial register (default)
- exclude: none given

## Path and mode
- Lite path (count ≤ 15).
- **Inline mode:** no subagent tool was available, so every step, including the independent reviews (list review, sample review, coach, learner test, blind judge, level raters, fact questions, rule check), was done by the same agent. Treat those reviews as not independent.
- Node ran: all `gym.mjs` checks were executed.
- Step 1 (exclude) skipped: no exclude items. An empty `exclude.json` was written by the orchestrator so the script checks could run.

## Checks run
- validate spec: 0 errors
- validate list: 0 errors; candidates: 0 pairs
- list review (step 3): 0 findings
- validate batch (samples, batch-1): 0 errors
- normalize + validate glossary (steps 6, 7, 8, 10): 0 errors each time
- metrics: 1 batch, 0 outliers, 0 plan mismatches, 0 repeated scenes
- tokens: 32 target-language tokens (examples); rater 1 put none above B1, so rater 2 was not needed
- fact questions: 9 questions, 1 disagreement (t01 placement claim)
- findings: 1 (t01 definition, R-FLD-03, must_fix); validate findings: 0 removed
- emit + validate output: 0 errors

## Coach
- All present fields scored 3–4 (mean ≈ 3.9); no rewrites or drops suggested.
- Learner test: 8/8 pass (simulated inline).

## Fixes
- Round 1: t01 definition rewritten (dropped an inaccurate "sits after the verb and subject" placement note). Learner test and blind judge rerun on t01: pass, rewrite preferred. Round-2 recheck: no findings.
- Rejected findings: none. Dropped/replaced terms: none. Spares unused: eben, ruhig (permission), ja (surprise).

## Level exceptions
- None.

## Not verified
- Every judgment check was self-review in inline mode (see above). German words inside English-language fields (anti_example, discussion, relationship descriptions) are not tokenized by `gym.mjs tokens` outside immersion; they were checked by eye to be ≤ B1.
