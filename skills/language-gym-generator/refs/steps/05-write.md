# Step 5: Write entries in batches

**Who:** a subagent per batch (see "How batches are made"). **Reads:** `spec.json`, the **full** `list.json` main names (so you know what the glossary teaches), `plan.json` entries for your ids, `style.json`, `samples.json`, `GYM rules --step 05`, `GYM contract draft.json`. **Writes:** `batch-N.json` = `{"terms": [...]}` in the draft format.

**Rules:** R-FLD-01 R-FLD-02 R-FLD-03 R-FLD-04 R-FLD-05 R-FLD-06 R-FLD-07 R-FLD-08 R-FLD-09 R-FLD-10 R-FLD-11 R-FLD-12 R-FLD-13 R-FLD-14 R-FLD-15 R-FLD-16 R-FLD-17 R-FLD-18 R-LVL-01 R-LVL-02 R-LVL-03 R-LVL-04 R-LVL-05 R-LVL-07 R-IMM-01 R-IMM-02 R-IMM-03 R-PRON-01 R-PRON-02 R-PRON-03 R-TONE-01 R-TONE-02 R-TONE-03

**How batches are made (orchestrator):**
- Batches are about 12 terms, and each batch mixes slots: never "the noun batch". Never a single term: a batch that would have one term is merged into another.
- **Batch 1 runs alone.** Once it passes its checks, its entries are added to the model entries given to every later batch.
- The other batches then run: one agent may take several batches in sequence; start agents in parallel only when there are more than 3 batches.
- **Lite path:** one batch holds everything, and the step 4 agent writes it right after planning.

**For each of your ids:**
1. Follow the plan: its `job`, its `scene` (from your batch's `scenes_by_batch`), and **exactly** its `fields`: no more, even if a field seems nice to have. A definition-only entry is a finished entry. If the plan is wrong for an entry, write it as planned and explain in `meta.notes`. Don't silently change it.
2. Match the model entries in voice, length (`style.limits`), gloss format and category labels (`style.categories` only).
3. Level: every target-language word at or below `style.ceiling`, apart from known words (the list's terms and the exclude items) and the plan's `level_exceptions` (R-LVL-01, R-LVL-02).
4. Beginner mode: every target-language sentence has one clause (one verb phrase, apart from a short tag like "please" or a name), at most one comma, and fits `style.limits.sentence` words. An example is at most 2 sentences (R-LVL-04, R-LVL-07). Split, don't chain.
5. Pronunciation exactly as `spec.pronunciation` says (R-PRON-01 to R-PRON-03). For a pattern with a slot, transcribe the filled form your `example` uses, in `style.ipa_format`. Immersion: nothing in any other language (R-IMM-01).
6. The definition says what the item means or does, and nothing else: no example sentences, quoted phrases or "e.g." lists (R-FLD-18). Leave out unused optional fields entirely. Set `id` and `batch` on every entry.

**Check (orchestrator):** `GYM validate batch batch-N.json --spec spec.json --style style.json --exclude exclude.json`. Fails → one retry of the whole batch with the findings. Fails again → the batch's terms are swapped for approved spares, which are written together as a new batch. The run continues.
