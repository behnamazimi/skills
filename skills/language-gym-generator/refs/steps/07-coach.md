# Step 7: Coach for quality, batch by batch

**Who:** fresh subagents in three roles: coach, learner, judge. Each works on whole batches (one agent may take several batches in sequence; parallel only above 3 batches). **Reads:** `spec.json`, `plan.json`, `draft.json`, [rubric.md](../rubric.md) (only this step reads it), `GYM rules --step 07`, `GYM contract coach.json`. **Writes:** `coach.json`, updated `draft.json`.

**Rules:** R-FLD-01 R-FLD-02 R-FLD-03 R-FLD-08 R-FLD-09 R-FLD-10 R-FLD-11 R-FLD-12 R-FLD-13 R-FLD-16 R-FLD-17 R-FLD-18 R-LVL-01 R-LVL-02 R-LVL-04 R-TONE-01 R-TONE-03

1. **Coach, per batch, in one pass:**
   1. **Delete pass first:** for every present optional field, `example` included, ask "if this field were removed, would this learner lose anything the definition doesn't already give them?" If the answer is no or unsure, action `drop_field`. Also treat any R-FLD-17/18 warnings from `GYM validate glossary` here. There is no quota either way (R-FLD-16): keep every field that passes its test, however many terms that is.
   2. **Score** each remaining field against the rubric for *this* learner language, level and slice. Write one learner-test question per entry. For each field scoring 1–2: suggest a rewrite, or `drop_field` if the field shouldn't exist. An optional field that's missing but clearly needed (a real trap with no `anti_example`) → suggest adding it, at most 1 in 5 entries. Coaches tend to add; resist that. Deleting is as valid as adding.
2. **Learner test, per batch** (a blind agent): run the rubric's protocol with the level from `spec.level.label`. The agent sees only each entry's term, definition and example. A failure, or an unknown word that isn't known → mark the entry for a rewrite, even if its scores were fine.
3. **Rewrite, per batch:** the coach writes all marked rewrites for the batch in one pass. Each stays within the plan's job, `style.limits`, the level ceiling and the pronunciation mode.
4. **Blind judge, per batch, only when there are rewrites or drops:** the rubric's protocol, for all the batch's pairs in one pass. Apply a change only if it wins. A `drop_field` goes to the judge too, as "field present vs field absent".
5. **Record** everything in `coach.json`. Apply the winning changes to `draft.json`, then re-run `GYM normalize` and `GYM validate glossary`.

An entry that failed the learner test **and** lost with its rewrite is marked `must_fix` for step 10 with rule R-FLD-02 (or R-LVL-01 if the problem was unknown words).
