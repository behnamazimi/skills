# Step 6: Make it consistent (normalize, edit each field, measure)

**Who:** the orchestrator runs the scripts; one subagent per field group does the editing. **Reads:** `spec.json`, `style.json`, `plan.json`, `samples.json`, all batches. **Writes:** `draft.json`, `metrics.json`.

1. **Merge:** the orchestrator combines the batches into `draft.json` in **interleaved** order (R-FLD-14), with `domain` = `spec.domain` and a one-line `description` (R-OUT-09).
2. **Normalize** (script): `GYM normalize draft.json --spec spec.json --style style.json --out draft.json`. This fixes whitespace, Markdown, gloss dashes, IPA spacing and category spelling.
3. **Field editors** (full path; the lite path uses a single editor). Each editor gets **one field across all entries** and edits wording only, never meaning, job or level:
   - **Definition editor:** all `definition`s, read top to bottom. Enforce the opening moves (no opening word more than 3 times, never twice in a row), the same voice and length, and no restated terms or meta openings (R-FLD-03/04). Keep IPA exactly as it is.
   - **Example editor:** all `example`s. Same gloss format, no repeated scenes or sentence frames, every sentence natural and on-job.
   - **Optional-field editor:** `mental_model`, `discussion`, `anti_example`, `controversy`. Same voice and length, no restating the definition, and an anti-example must match the plan's `trap`.

   An editor may not add or remove fields (that belongs to the plan and the coach). The definition editor also moves nothing into a definition: an illustration found there is reported for step 10 under R-FLD-18, not rewritten into the text and may not raise the level. It returns the edited `draft.json` together with a list of what it changed.
4. **Measure** (script): `GYM metrics draft.json --spec spec.json --plan plan.json > metrics.json`. Any `outliers` entry (a batch well off the median, or fields that don't match the plan) → that batch's entries go back to step 5, with the model entries and the metric that drifted. Once.
5. `GYM validate glossary draft.json --spec spec.json --style style.json --exclude exclude.json`. Errors here are fixed now; they are mechanical.
