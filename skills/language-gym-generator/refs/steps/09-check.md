# Step 9: Final check

This step runs **last**. After it, only step 10 fixes may change the draft, and every fixed entry comes back here. **Writes:** `tokens.json`, `level.json` (rater 1 and 2), `facts.json`, `findings.json`.

Run these in parallel (the IPA check only in `ipa` mode):

1. **Script:** `GYM validate glossary draft.json --spec spec.json --style style.json --exclude exclude.json`. Each error becomes a finding with `source: "script"`, `severity: "must_fix"`, and `quote` = the offending text (or the term).
2. **Level check** (R-LVL-06):
   1. `GYM tokens draft.json --spec spec.json --exclude exclude.json --style style.json [--levellist <file>] > tokens.json`.
   2. **Rater 1** (a fresh subagent) rates **every** token, plus the grammar structures in target-language text, with a CEFR level. It sees only the tokens, their fields, and the level scale. In beginner mode it also counts the clauses in every target-language sentence the script flagged under R-LVL-07 (and in every example): more than one clause, apart from a short tag, is a `must_fix` R-LVL-04 finding.
   3. Every token or structure rater 1 puts above the ceiling goes to **rater 2** (another fresh subagent, not shown rater 1's ratings).
   4. Findings only for items **both** rate above the ceiling:
      - one level above and listed in the plan's `level_exceptions` → no finding;
      - one level above and not listed → `should_fix` R-LVL-02;
      - two or more levels above → `must_fix` R-LVL-02.
   5. With a `levellist`, the list's levels decide instead, and the raters only rate words the list doesn't have.
3. **Fact questions** (a fresh subagent, which is not shown the definitions' wording). For each entry, ask 1–3 specific questions its content depends on:
   - the meaning of the term;
   - gender, class or counter;
   - back-translating the example into the learner language;
   - "is this used in `<dialect>`?";
   - the IPA of the term.

   The agent answers each one, or says `unsure`. The orchestrator compares the answers with the entry:
   - disagreement → `must_fix`, with the rule of the field involved (e.g. R-FLD-03 for a wrong meaning);
   - `unsure` on the core meaning → drop the entry (replace it from spares);
   - more than 20% of entries dropped → the glossary comes out shorter, and the report explains why.
4. **IPA check** (only when `pronunciation` is `ipa`, R-PRON-04): a fresh subagent sees the terms and, for patterns, the filled form in each example, but **not** the definitions. It writes its own transcription of each into `ipa-check.json`, using `style.ipa_format`. Then run `GYM ipa draft.json --against ipa-check.json`: each `mismatch` becomes a `must_fix` finding and each `stress_or_length` a `should_fix` one, quoting the entry's IPA.
5. **Rule check** (a fresh subagent): read the whole glossary against [rules.md](../rules.md) for the `agent`-checked rules: R-FLD-02/03/08–13, R-TERM, R-LVL-03/04, R-IMM-01/03, R-TONE-01/03, R-REL-01. Look at the whole glossary together for R-FLD-13 ("don't lean on words you didn't teach"), repeated scenes, and the same trap used twice.

Every finding has to quote the text it's about. Combine all findings into `findings.json`, then run `GYM validate findings findings.json --draft draft.json --rules <skill dir>/refs/rules.md`. Findings that fail (a quote not in the text, an unknown rule) are removed, and the count goes in the report.

No findings → go to assembly.
