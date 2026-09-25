# Step 9: Final check

This step runs **last**. After it, only step 10 fixes may change the draft, and every changed batch comes back here. **Writes:** `tokens.json`, `level.json`, `questions.json`, `facts.json`, `ipa-check.json` (ipa mode), `findings.json`.

**Rules:** R-FLD-02 R-FLD-03 R-FLD-08 R-FLD-09 R-FLD-10 R-FLD-11 R-FLD-12 R-FLD-13 R-FLD-17 R-FLD-18 R-TERM-01 R-TERM-02 R-TERM-03 R-TERM-04 R-TERM-05 R-TERM-06 R-TERM-07 R-TERM-08 R-LVL-01 R-LVL-02 R-LVL-03 R-LVL-04 R-LVL-06 R-LVL-07 R-IMM-01 R-IMM-02 R-IMM-03 R-TONE-01 R-TONE-03 R-REL-01 R-REL-03 R-PRON-01 R-PRON-04 R-FIND-01 R-FIND-02

Two fresh agents do the judging, in this order. Neither wrote any entry.

1. **Script** (orchestrator): `GYM validate glossary draft.json --spec spec.json --style style.json --exclude exclude.json`. Each error becomes a finding with `source: "script"`, `severity: "must_fix"`, and `quote` = the offending text (or the term). Each **warning** (R-FLD-17/18 and other flag-only checks) goes to the checker below, which turns it into a finding only if it holds up. Then `GYM tokens draft.json --spec spec.json --exclude exclude.json --style style.json [--levellist <file>]` (writes `tokens.json`).

2. **Checker** (fresh subagent; sees the whole glossary). Three jobs in one pass:
   - **Rule check:** read the whole glossary against the `agent`-checked rules: R-FLD-02/03/08–13/17/18, R-TERM, R-LVL-03/04, R-IMM-01/03, R-TONE-01/03, R-REL-01. Look at the whole glossary together for R-FLD-13 ("don't lean on words you didn't teach"), repeated scenes, and the same trap used twice. Decide each script warning.
   - **Level rater 1** (R-LVL-06): rate **every** token in `tokens.json`, plus the grammar structures in target-language text, with a CEFR level; write `level.json`. In beginner mode, also count the clauses in every target-language sentence the script flagged under R-LVL-07 (and in every example): more than one clause, apart from a short tag, is a `must_fix` R-LVL-04 finding.
   - **Fact questions:** for each entry, write 1–3 specific questions its content depends on, into `questions.json`: the meaning of the term; gender, class or counter; back-translating the example into the learner language; "is this used in `<dialect>`?". The checker writes the questions only; it doesn't answer them.

3. **Blind checker** (fresh subagent; never sees the definitions, the entries' IPA, or the checker's ratings). It gets: the term list, the questions, the examples' filled forms for patterns, `style.ipa_format`, and the words rater 1 put above the ceiling. Three jobs in one pass:
   - **Answer the fact questions** into `facts.json`, or say `unsure`.
   - **Level rater 2:** rate only the words and structures rater 1 put above the ceiling (skip this part when there are none).
   - **IPA check** (only when `pronunciation` is `ipa`, R-PRON-04): write its own transcription of each term into `ipa-check.json`.

4. **Combine** (orchestrator):
   - **Facts:** compare answers with the entries. Disagreement → `must_fix`, with the rule of the field involved (e.g. R-FLD-03 for a wrong meaning). `unsure` on the core meaning → drop the entry (replaced in step 10's replacement batch). More than 20% of entries dropped → the glossary comes out shorter, and the report explains why.
   - **Level:** findings only for items **both** raters put above the ceiling. One level above and listed in the plan's `level_exceptions` → no finding. One level above and not listed → `should_fix` R-LVL-02. Two or more levels above → `must_fix` R-LVL-02. With a `levellist`, the list's levels decide instead, and the raters only rate words the list doesn't have.
   - **IPA:** `GYM ipa draft.json --against ipa-check.json`. Each `mismatch` becomes a `must_fix` finding and each `stress_or_length` a `should_fix` one, quoting the entry's IPA.

Every finding has to quote the text it's about. Combine all findings into `findings.json`, then run `GYM validate findings findings.json --draft draft.json --rules SKILL_DIR/refs/rules.md`. Findings that fail (a quote not in the text, an unknown rule) are removed, and the count goes in the report.

No findings → go to assembly.
