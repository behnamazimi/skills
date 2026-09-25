# Step 10: Fix

**Who:** subagent. **Reads:** `spec.json`, `style.json`, `plan.json`, `draft.json`, `findings.json`, [rules.md](../rules.md). **Writes:** updated `draft.json`, `fixes.json`.

1. For each finding: apply its fix, or a better fix for the same problem. Or reject it with a one-line reason if it's wrong (the quote misread, the rule doesn't apply). Rejecting is allowed only for judgment findings. Script findings (`source: "script"`) are always fixed.
2. Keep each fix minimal and within the plan's job, `style.limits`, the level ceiling and the pronunciation mode.
3. Record `applied`, `rejected` and `dropped` in `fixes.json`.

**Round loop (orchestrator):**
- Every changed entry goes back through step 7's learner test and blind judge (new vs pre-fix text), then all of step 9. Entries that didn't change aren't checked again.
- **At most 2 rounds.** An entry still with `must_fix` findings after round 2 is dropped and replaced by the next approved spare. The spare goes through steps 5 → 6 (normalize and that field's editor) → 7 → 9, in a single-entry batch.
- **Out of spares:** the glossary comes out shorter, and the report says why.
- **A finding that flips back and forth between rounds** (fixed in round 1, reversed in round 2) → keep the version the blind judge preferred, and note it in the report.
