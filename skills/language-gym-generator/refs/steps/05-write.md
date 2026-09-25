# Step 5: Write entries in batches

**Who:** one subagent per batch. **Reads:** `spec.json`, the **full** `list.json` main names (so you know what the glossary teaches), `plan.json` entries for your ids, `style.json`, `samples.json`, and [rules.md](../rules.md) R-FLD, R-LVL, R-IMM, R-PRON, R-TONE and R-TERM. **Writes:** `batch-N.json` = `{"terms": [...]}` in the draft format from [contract.md](../contract.md).

**How batches are made (orchestrator):**
- Batches are about 12 terms, and each batch mixes slots: never "the noun batch".
- **Batch 1 runs alone.** Once it passes its checks, its entries are added to the model entries given to every later batch.
- The other batches then run in parallel.
- **Lite path:** one batch holds everything, and the step 4 agent writes it right after planning.

**For each of your ids:**
1. Follow the plan: its `job`, its `scene` (from your batch's `scenes_by_batch`), and **exactly** its `fields`. If the plan is wrong for an entry, write it as planned and explain in `meta.notes`. Don't silently change it.
2. Match the model entries in voice, length (`style.limits`), gloss format and category labels (`style.categories` only).
3. Level: every target-language word at or below `style.ceiling`, apart from known words (the list's terms and the exclude items) and the plan's `level_exceptions` (R-LVL).
4. Beginner mode: every target-language sentence has one clause (one verb phrase, apart from a short tag like "please" or a name), at most one comma, and fits `style.limits.sentence` words. An example is at most 2 sentences (R-LVL-04, R-LVL-07). Split, don't chain.
5. Pronunciation exactly as `spec.pronunciation` says (R-PRON). For a pattern with a slot, transcribe the filled form your `example` uses, in `style.ipa_format`. Immersion: nothing in any other language (R-IMM).
6. Leave out unused optional fields entirely. Set `id` and `batch` on every entry.

**Check (orchestrator):** `GYM validate batch batch-N.json --spec spec.json --style style.json --exclude exclude.json`. Fails → one retry with the findings. Fails again → the batch's terms are swapped for approved spares, which get written in a new batch. The run continues.
