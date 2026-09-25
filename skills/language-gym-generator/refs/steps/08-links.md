# Step 8: Relationships

**Who:** subagent. **Reads:** `spec.json`, `style.json`, `draft.json`, [rules.md](../rules.md) R-REL. **Writes:** `relationships` in `draft.json`.

- Add a relationship only for a real link a learner benefits from (R-REL-01). Most terms get none. Both ends must be terms in *this* glossary, written exactly as in `term`.
- Skip a link when one definition already carries it.
- Every relationship from `style.confusion_types` must match an existing `anti_example` on one of the two terms (R-REL-03). If neither has one, either skip the link or flag the term for step 10. Don't write the anti-example here.
- No type used for more than half the links. No pair twice, in either direction. At most as many links as terms, and never more than 100.
- Under immersion, the type and description are in the target.
- Target-language words in descriptions follow the level ceiling (R-LVL-01).

**Check:** `GYM validate glossary draft.json --spec spec.json --style style.json --exclude exclude.json`.
