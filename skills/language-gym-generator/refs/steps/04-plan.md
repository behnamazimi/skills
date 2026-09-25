# Step 4: Plan every entry and fix the style

**Who:** subagent (on the lite path, the same agent then writes all entries: see step 5). **Reads:** `spec.json`, `exclude.json`, `list.json` (main only), [rules.md](../rules.md) R-FLD, R-LVL, R-IMM, R-PRON and R-TONE, and [rubric.md](../rubric.md). **Writes:** `plan.json`, `style.json`, `samples.json` (formats in [contract.md](../contract.md)).

This step makes every decision that must be the same across the whole glossary, so writers don't make them separately.

## `plan.json`: one entry per term

- `job`: the one job this entry teaches (R-FLD-02).
- `trap`: the most likely mistake *for a speaker of `spec.learner`* (their native language's habits, false friends, the famous other half of a pair). "None" is allowed.
- `scene`: one concrete everyday scene for the example, told with known or at-level words (R-LVL-01). In beginner mode the scene must fit one short sentence with one clause (R-LVL-04, R-LVL-07); a two-line exchange (a question and its answer) is the most it can be. Vary scenes across the glossary; no scene more than twice.
- `fields`: only the optional fields that pass their test for *this* term (R-FLD-08 to R-FLD-12), `example` included. Start from none and add a field only when its test says yes. An empty list is normal: expect it for concrete nouns and obvious verbs whose definition already says everything. There is no target number (R-FLD-01, R-FLD-16). Apply the tests the same way to the last term as to the first (R-FLD-15). With beginner mode off, scan every term for `controversy` (R-FLD-12).
- `why_fields`: one reason per listed field, naming the specific thing it adds for this learner. For example, "example: the verb takes a dative, which the definition can't show", or "anti_example: English speakers say *estoy de acuerdo a*". "Helps understanding" or "shows usage" is not a reason; a field without a specific reason is left out.
- `level_exceptions`: any word one level above the ceiling this entry will need, and why no simpler word works (R-LVL-02). Usually empty.

## `style.json`

- `categories`: the fixed list of category labels, in the learner language (under immersion, the target). Choose it from the list's slots. Every label is used at least twice, or it's merged into a broader one.
- `limits`: words per field, set for this level and mode. Beginner mode: definition ≤ 18, example ≤ 12, sentence ≤ 10. Otherwise definition ≤ 28, example ≤ 18, sentence ≤ 16. Other fields scale the same way.
- `voice`, `gloss_separator` (` — ` unless the learner language's punctuation calls for something else), `ipa_format`. For a tone language, `ipa_format` fixes one tone convention for every entry: citation tones or tones after sandhi, which tone letters, and how neutral tone is written.
- `opening_moves`: 4–6 different ways to open a definition, in the learner language, so that no opening word is used more than 3 times (R-FLD-04).
- `banned_phrases`: AI-cliché filler in the learner language (R-TONE-02).
- `example_markers`: the learner language's words and phrases that introduce an example (e.g. "e.g.", "for example", "such as"; "bijvoorbeeld", "zoals" in Dutch). The R-FLD-18 check uses them to spot examples hidden in definitions.
- `confusion_types`: the relationship type(s) meaning "often confused with", in the language used for relationships.
- `scenes_by_batch`: split the planned scenes so each batch of about 12 has its own set.
- `ceiling`, and `notes` on anything else every writer must do the same way (how to write patterns with slots, how to show politeness levels, the script and marks convention).

## `samples.json`: three model entries

Write three full entries from `main`: pick different slots, with at least one that has an `anti_example`. They follow the plan and the style sheet exactly. Every writer will copy them, so they must be the best entries in the glossary.

**Checks (the orchestrator runs these):**
- `GYM validate batch samples.json --spec spec.json --style style.json --exclude exclude.json`
- a fresh subagent reviews the samples against R-FLD, R-LVL and R-TONE using [rubric.md](../rubric.md). Any score ≤ 2 → fix the samples before step 5.
