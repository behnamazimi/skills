# Report: Dutch, 10 terms, immersion, A2–B1

## Settings (spec.json)
| Setting | Value | Source |
|---|---|---|
| domain / language | Dutch | user |
| count | 10 | user |
| learner | Dutch (immersion) | inferred from the `immersion` flag (R-IN-05) |
| immersion | true | user |
| level | A2–B1 (ceiling B1, beginner mode on) | user |
| pronunciation | none | user |
| dialect | Standard Dutch as spoken in the Netherlands | default |
| slice_type | bare | default |
| exclude | none | — |

## Path and mode
- Lite path (count ≤ 15).
- **Inline mode**: no subagent tool, so every step ran in this one agent. The independent reviews (list review, sample review, coach, learner test, blind judge, level raters, fact questions, rule check) were done by that same agent, after re-reading only each step's inputs. So they are not truly independent.
- Node ran: every `gym.mjs` check really ran.

## Checks run
- `validate spec`: 0 errors. `validate exclude`: 0 errors (no exclude items, 0 ignored).
- `validate list` ×2, `candidates` ×2: 0 errors, 0 candidate pairs.
- Step 3 list review, round 1: 1 must_fix (R-SEL-05). `hebben + voltooid deelwoord` (construction slot) had been claimed while the identity job was still uncovered. Step 2 re-ran once: spare `zijn` (s02) was promoted and the perfect construction moved to spares (s04). Round 2: 0 findings.
- Samples: `validate batch` 0 errors. Rubric review: all scores 3–4.
- Batch 1 (all 10): `validate batch` 0 errors.
- normalize, single editor pass (no changes needed), metrics: 0 outliers, 0 plan mismatches, 0 repeated scenes. def 12.5 words avg, example 8.8.
- `validate glossary`: 0 errors, both before and after links and after the fix.
- Step 9: 155 tokens rated by rater 1 (2 more after the fix: zwemmen, koken, both A1). None were above B1, so rater 2 had nothing to rate. Fact questions: 10 of 10 agree, 0 unsure. Rule check: 1 should_fix (R-LVL-04, two dat-clauses in the `kunnen` definition). `validate findings`: 0 invalid.
- Step 10 round 1: 1 applied, 0 rejected, 0 dropped. The changed entry got the learner test (pass), the blind judge (rewrite won) and step 9 again (clean).
- `emit` → `validate output`: 0 errors.

## Coach
- Learner-test pass rate: 10/10.
- Average scores: definition 3.5, example 3.8, optional fields 4.0.
- Rewrites: none from the coach. One from step 10 (kunnen definition).

## Level exceptions
- None.

## Rejected findings / dropped terms
- None rejected, none dropped. Spare promoted in step 2: `zijn` (s02).

## Coverage gaps (not verified away)
- With 10 terms, the complete modal set (5) and negation set (2) leave room for only three more spine jobs: zijn, er is / er zijn, and gaan + infinitief.
- Not covered: hebben (possession), komen, personal pronouns, question words, and u/jij politeness.
- Pronouns and question words are closed sets larger than the remaining room, so they were not started (R-SEL-04).
- Good next glossary: pass this one as exclude and ask for 10–15 more (spares ready: omdat, hoeven + te, hebben + voltooid deelwoord).
