# Step 7: Coach for quality

**Who:** three kinds of fresh subagents: coach, learner, judge. **Reads:** `spec.json`, `plan.json`, `draft.json`, [rubric.md](../rubric.md), [rules.md](../rules.md). **Writes:** `coach.json`, updated `draft.json`.

1. **Coach** (one agent, the whole glossary): for every entry, score each present field against [rubric.md](../rubric.md) for *this* learner language, level and slice. Write one learner-test question per entry. For each field scoring 1–2: suggest a rewrite, or `drop_field` if the field shouldn't exist. An optional field that's missing but clearly needed (a real trap with no `anti_example`) → suggest adding it, at most 1 in 5 entries. Coaches tend to add; resist that. Deleting is as valid as adding.
2. **Learner test** (one agent per ~15 entries): run the protocol in [rubric.md](../rubric.md) with the level from `spec.level.label`. The agent sees only term, definition and example. A failure or an unknown word that isn't known → mark the entry for a rewrite, even if its scores were fine.
3. **Rewrite:** the coach writes the rewrite for every marked field. It stays within the plan's job, `style.limits`, the level ceiling and the pronunciation mode.
4. **Blind judge** (one agent per ~15 pairs): the protocol in [rubric.md](../rubric.md). Apply a rewrite only if it wins. A `drop_field` goes to the judge too, as "field present vs field absent".
5. **Record** everything in `coach.json`. Apply the winning changes to `draft.json`, then re-run `GYM normalize` and `GYM validate glossary`.

An entry that failed the learner test **and** lost with its rewrite is marked `must_fix` for step 10 with rule R-FLD-02 (or R-LVL-01 if the problem was unknown words).
