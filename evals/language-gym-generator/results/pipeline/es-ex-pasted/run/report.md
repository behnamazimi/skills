# Report: Spanish, 10 terms

## Settings
- domain: Spanish (user)
- count: 10 (user)
- exclude: pasted glossary JSON (user); 4 terms taken from `terms[].term`: estar, ser, hay, ir a + infinitivo. Its relationships and other fields were ignored as data.
- learner: English (default)
- level: A2–B1, ceiling B1, beginner mode on (default)
- immersion: off (default)
- pronunciation: none (default for beginner mode)
- dialect: Latin American Spanish, broadly neutral (default; matches the pasted glossary's description, so no change)

## Path and mode
- Lite path (count ≤ 15).
- **Inline mode**: no subagent tool, so every step ran in one agent. The "independent" reviews (step 3 list review, the step 4 sample review, step 7 coach / learner test / judge, step 9 raters, fact questions and rule check) were done by the same agent that wrote the entries, not by fresh reviewers.
- Node ran; all `gym.mjs` checks were executed.

## Exclude
- 4 raw items, 4 expanded, 0 ignored.
- `hay` and `ir a + infinitivo` treated as phrase scope (only that job blocked); `estar`, `ser` as lemma scope.
- Candidates flagged: `ir` vs excluded `ir a + infinitivo` (different job: movement vs plans, allowed); spare `hacer` vs `haber` (different word).

## Checks run
- validate spec: 0 errors
- validate exclude: 0 errors
- validate list: 0 errors; candidates: 2 pairs, both judged different items
- list review: 0 findings
- validate batch (samples, batch 1): 0 errors
- normalize + validate glossary: 0 errors (after steps 6, 7, 8)
- metrics: 1 batch, def 13.2 words avg, example 12.3 words avg (Spanish + gloss), 2 optional fields per term, 0 plan mismatches, no outliers, no repeated scenes
- tokens: 39 unknown target-language tokens; all rated A1–A2 (rater 1), none above B1, so no rater 2 pass and no level findings
- fact questions: 11 asked, 11 agree, 0 unsure
- rule check: 0 findings; findings.json validated
- emit / validate output: 0 errors

## Selection notes
- All 10 slots went to building blocks (R-SEL-05): address forms (tú, usted, ustedes as a complete closed set), negation, want, can, must, have, go, come. Known items cover identity, location/state, existence and plans.
- Question words were not started: that closed set is bigger than the remaining count. Yes/no questions work by intonation. Good candidate for the next set.
- Spares not used: me gusta, porque, hacer.

## Coach
- Scores: all present fields 3 or 4 (averages: definition 3.9, example 3.9, optional fields 4.0).
- Learner test: 10/10 pass. No rewrites, so no judge rounds.

## Other
- Level exceptions: none.
- Rejected findings: none. Dropped or replaced terms: none.
- Unverified: nothing mechanical; the judgment reviews were not independent (inline mode).
