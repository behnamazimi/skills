# Step 3: Review the list

**Who:** a **fresh** subagent that didn't write the list. **Reads:** `spec.json`, `exclude.json`, `list.json`, `candidates.json`, [rules.md](../rules.md) R-SEL, R-TERM and R-EX. **Writes:** `list-findings.json` (the `findings.json` format, with `term_id` = list id and `field` = `"term"`, `quote` = the term).

Review `main` **and** `spares`. Spares approved now can later replace terms without another review.

1. **Every pair in `candidates.json`:** is it the same item as the excluded one (same lemma for a `lemma` scope, same phrase or pattern for a `phrase` scope)? Accents or marks that make a different word are *not* the same (R-EX-04). Same → a `must_fix` finding (R-EX-01). Different → no finding.
2. **Undeclared closed sets:** does any item belong to a small set that isn't in `sets[]`? → R-SEL-04.
3. **Jobs:** for `bare`, the script has already checked that `shape.jobs` maps every R-SEL-12 job. Check that each mapped term really does that job in this language: e.g. a future construction mapped to `go` doesn't cover plain "go", and a politeness formula doesn't cover `questions`. For `usage` and `grammar`, check the equivalents (R-SEL-07). A job that is wrongly mapped → `must_fix` R-SEL-12, naming the job.
4. **Level:** is each `level` honest? Anything above the ceiling → R-SEL-08.
5. **Spoken-form test and noun format:** R-TERM-01 to R-TERM-05.
6. **Frequency:** anything rare, trivia, or nice-to-know → R-SEL-02.

Return `{"findings": []}` if nothing is wrong. Never praise, never pad.

**Loop:** if there are `must_fix` findings, the orchestrator sends list + findings back to step 2 **once**. After that, remaining findings are settled by cutting the item and promoting an approved spare.
