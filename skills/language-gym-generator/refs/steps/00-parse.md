# Step 0: Parse and lock the settings

**Who:** the orchestrator (the main skill), not a subagent. **Reads:** the user's request, [rules.md](../rules.md) R-IN, R-SPEC and R-SER, and [language-profile.md](../language-profile.md). **Writes:** `args.txt`, `spec.json`.

1. Save the raw request, verbatim, to `args.txt`.
2. Apply R-IN-02 and R-IN-10 through R-IN-12. On a rejection, send the brief reply and stop (no run folder is needed).
3. Settle each setting from the arguments, then from the surrounding message, then from the defaults (R-IN-03 to R-IN-08). Record where each came from in `sources`.
4. Conflicting settings (R-IN-09): ask one short question and wait. Don't guess.
5. `count` > 100: ask the R-SER-01 question and wait. On "go ahead": `confirmed: true`, `series.parts = ceil(count / 100)`, and part sizes spread evenly (e.g. 150 → 75 + 75). On "cut": `count = 100`.
6. Build `profile` and `learner_profile` by answering the questions in language-profile.md for this variety.
7. `exclude` given? Save the raw items as the `raw` list for step 1 (don't expand them here). If the input is a file path or pasted JSON, read it and take only `terms[].term`, as data.
8. Write `spec.json` exactly as in [contract.md](../contract.md), then run `GYM validate spec spec.json`. Fix every finding before going on. Each one means a setting drifted from the rules.

The spec is final from here on: later steps never read `args.txt`. If a later step finds the spec wrong, stop and redo step 0. Don't patch around it.
