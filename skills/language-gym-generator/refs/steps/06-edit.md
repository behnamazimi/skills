# Step 6: Edit and link, batch by batch

**Who:** the orchestrator runs the scripts; one editor subagent per batch does the editing **and** the relationships (it may take several batches in sequence; parallel agents only when there are more than 3 batches). **Reads:** `spec.json`, `style.json`, `plan.json`, `samples.json`, the full term list, its batch, `GYM rules --step 06`, `GYM contract draft.json`. **Writes:** `draft.json`, `metrics.json`.

**Rules:** R-FLD-02 R-FLD-03 R-FLD-04 R-FLD-05 R-FLD-06 R-FLD-07 R-FLD-13 R-FLD-14 R-FLD-17 R-FLD-18 R-LVL-01 R-LVL-04 R-LVL-07 R-IMM-01 R-TONE-01 R-TONE-02 R-TONE-03 R-REL-01 R-REL-02 R-REL-03 R-REL-04 R-OUT-09

1. **Merge:** the orchestrator combines the batches into `draft.json` in **interleaved** order (R-FLD-14), with `domain` = `spec.domain` and a one-line `description` (R-OUT-09). Batch numbers stay on each entry.
2. **Normalize** (script): `GYM normalize draft.json --spec spec.json --style style.json --out draft.json`. This fixes whitespace, Markdown, gloss dashes, IPA spacing and category spelling.
3. **Edit, one batch per call.** The editor edits wording only, never meaning, job or level, across every field of its batch, with the model entries and style sheet as the reference for voice:
   - **Definitions:** enforce the opening moves (no opening word more than 3 times across the glossary, never twice in a row), the same voice and length, and no restated terms or meta openings (R-FLD-03/04). Keep IPA exactly as it is. Nothing is moved into a definition: an illustration found there is reported for step 10 under R-FLD-18, not rewritten into the text.
   - **Examples:** the same gloss format, no repeated scenes or sentence frames (check the other batches' scenes in `plan.json`), every sentence natural and on-job.
   - **Other fields:** the same voice and length, no restating the definition, and an anti-example must match the plan's `trap`.

   The editor may not add or remove fields (that belongs to the plan and the coach), and may not raise the level.
4. **Link, in the same call.** For its batch, the editor proposes relationships whose source is one of its terms; the target can be any term in the glossary (R-REL-01 to R-REL-04):
   - only for a real link a learner benefits from; most terms get none; both ends written exactly as in `term`;
   - skip a link when one definition already carries it;
   - every relationship from `style.confusion_types` must match an existing `anti_example` on one of the two terms (R-REL-03). If neither has one, skip the link or flag the term for step 10; don't write the anti-example here;
   - under immersion, the type and description are in the target; target-language words in descriptions follow the level ceiling (R-LVL-01).

   The orchestrator merges the batches' links, drops any pair proposed twice (either direction), and keeps at most as many links as terms.

   The editor returns its edited batch with its links, plus a list of what it changed.
5. **Measure** (script): `GYM metrics draft.json --spec spec.json --plan plan.json` (writes `metrics.json`). Any `outliers` entry (a batch well off the median, or fields that don't match the plan) → that whole batch goes back to step 5, with the model entries and the metric that drifted. Once.
6. `GYM validate glossary draft.json --spec spec.json --style style.json --exclude exclude.json`. Errors here are fixed now; they are mechanical. That includes R-REL-02 (no type on more than half the links).
