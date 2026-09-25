# Step 2: Select the term list

**Who:** subagent. **Reads:** `spec.json`, `exclude.json`, [rules.md](../rules.md) R-SEL, R-TERM and R-EX-05/06, and `spec.profile.grammar_notes`. **Writes:** `list.json` (names only, no content fields).

1. **Settle the job** of the glossary from `slice_type` (R-SEL-03).
2. **Work out what's already known.** Every excluded item counts as known. Mark which required jobs (R-SEL-12) it already covers, and which closed sets it has started.
3. **Claim slots in R-SEL-05 order**, describing jobs as this language actually has them (see `grammar_notes`). Repeat requests move *forward*:
   - skip jobs that are already covered;
   - finish sets that were started (R-SEL-04);
   - then move up in frequency and level.

   Stop at `count` (or `series.part_count`), or earlier if the must-know items run out (R-EX-06). Never pad.
4. **Write each item** as the spoken form (R-TERM-01..05, R-TERM-07/08) in `profile.scripts`, using `profile.noun_citation`.
5. **Rate each item** with an honest CEFR `level`, at or below `spec.level.ceiling` (R-SEL-08).
6. **Declare every closed set** you touch in `sets[]` with its full member list. List it even when some members come from `exclude`.
7. **Map the required jobs** (R-SEL-12, `bare` slices with a ceiling of B1 or lower): in `shape.jobs`, give every job for this ceiling an exact `main` term, `known: <excluded item>`, `n/a: <reason>`, or `deferred`. Defer only when every slot is taken, and only from the end of the priority list. A job with no entry means the list is missing a building block: claim a slot for it before any glue, phrase or noun.
8. **Run the shape check** once on the full list (R-SEL-07) and record it in `shape`. Fix failures with the R-SEL-10 cut order, then fill from the next slot. Never add nouns just to look balanced.
9. **Add about 30% spares** (R-SEL-11), drawn from the same slots, next in line.

Nothing useful left at all (R-EX-06)? Write `{"main": [], "spares": [], "sets": [], "shape": {"notes": "<why>"}}`, and the orchestrator sends the short reply.

**Checks (the orchestrator runs these):**
- `GYM validate list list.json --spec spec.json --exclude exclude.json`
- `GYM candidates list.json --exclude exclude.json --spec spec.json > candidates.json`

On `validate` errors, send them back to this step once.
