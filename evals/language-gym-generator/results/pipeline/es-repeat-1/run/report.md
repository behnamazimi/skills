# Run report: Spanish | 12

## Settings
| Setting | Value | Source |
|---|---|---|
| domain | Spanish (bare slice) | user |
| count | 12 | user |
| learner | English | default |
| level | A2–B1 (ceiling B1, beginner mode on) | default |
| immersion | off | default |
| pronunciation | none (beginner mode) | default |
| dialect | Latin American Spanish (broadly neutral), es-419 | default |

Path: **lite** (count ≤ 15). Exclude: none given, so step 1 was skipped and nothing was ignored.

## Execution
- **Inline mode:** no subagent tool was available. All steps (select, list review, plan/samples, write, edit, coach, learner test, blind judge, links, level raters, fact questions, rule check) were run by the same agent. The "independent" reviews were therefore not independent.
- **Node:** ran. All `gym.mjs` checks were executed.

## Checks run
- validate spec: 0 errors
- validate list: 0 errors; candidates: 0 pairs
- list review (step 3): 0 findings
- validate batch (samples, batch-1): 0 errors
- metrics: 1 batch, def 13.7 words avg, example 12 words avg, 2 optional fields per term, 0 plan mismatches, 0 outliers, 0 repeated scenes
- validate glossary: 0 errors (after steps 6, 7, 8, 9)
- tokens: 49 target-language tokens in examples; rater 1 put none above B1, so rater 2 was not needed
- fact questions: 13 asked, 13 agree, 0 unsure
- rule check: 0 findings; validate findings: 0 removed
- emit / validate output: 0 errors

## Coach
- Average scores: definition 3.6, example 3.9 (after rewrite), optional fields 3.7.
- Learner test pass rate: 12/12.
- One rewrite: `tú` example ("¿Tú quieres un café o un té?" scored 2 because it used tú where speakers drop it) replaced by "Yo quiero té, ¿y tú?"; the blind judge (same agent) preferred the rewrite.

## Other notes
- Level exceptions: none.
- Rejected findings: none. Dropped or replaced terms: none.
- One mechanical fix after first emit: the ser/estar relationship description had lost its quote marks around 'be'; the draft was corrected and re-emitted (see fixes.json).
- Coverage: 12 terms cover the spine only. Question words (a closed set of about 8) and 'come' (venir) did not fit and were not started; spares approved for a follow-up: venir, es que, acabar de + infinitivo, deber.
- Unverified: none by script; all agent judgments were made inline by one agent.
