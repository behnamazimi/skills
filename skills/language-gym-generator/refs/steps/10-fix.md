# Step 10: Fix, batch by batch

**Who:** a subagent per batch that has findings (one agent may take several batches in sequence). **Reads:** `spec.json`, `style.json`, `plan.json`, `draft.json`, `findings.json`, `GYM rules --step 10`, plus `GYM rules <the rule IDs your findings cite>`, `GYM contract fixes.json`. **Writes:** updated `draft.json`, `fixes.json`.

**Rules:** R-FIND-01 R-FIND-02 R-FIND-03 R-PRON-04

Work through all the findings of a batch in one pass.

1. For an R-PRON-04 finding, decide which transcription is right for this dialect and `style.ipa_format`. Keep the original if it's right, and give the reason as a rejection. Otherwise use the correct one; it may differ from both.
2. For each other finding: apply its fix, or a better fix for the same problem. Or reject it with a one-line reason if it's wrong (the quote misread, the rule doesn't apply). Rejecting is allowed only for judgment findings. Script findings (`source: "script"`) are always fixed.
3. Keep each fix minimal and within the plan's job, `style.limits`, the level ceiling and the pronunciation mode.
4. Record `applied`, `rejected` and `dropped` in `fixes.json`.

**Round loop (orchestrator):**
- **Changed entries are re-checked together:** all entries changed in a round go through step 7's learner test and blind judge (new vs pre-fix text) as one batch, then through step 9 as one batch. Entries that didn't change aren't checked again.
- **At most 2 rounds.** Entries still with `must_fix` findings after round 2 are dropped. **Replacements are one batch:** all dropped entries of the round are replaced by the next approved spares, which are written together as one batch and taken through steps 5 → 6 (normalize and the editor) → 7 → 9. Never a single-entry batch: a lone replacement joins the batch of re-checked entries.
- **Out of spares:** the glossary comes out shorter, and the report says why.
- **A finding that flips back and forth between rounds** (fixed in round 1, reversed in round 2) → keep the version the blind judge preferred, and note it in the report.
