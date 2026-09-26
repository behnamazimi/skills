---
name: jargon-gym-review
description: Review an existing jargon glossary JSON. Use when the user pastes or uploads glossary JSON and asks to review, audit, or fact-check it — or asks what's wrong with, missing from, or worth cutting (including "check this glossary" / "does this look right" alongside JSON). Not for generating a new glossary — that is jargon-gym-generator.
argument-hint: "[glossary JSON or path to .json]"
---

## Input

The existing jargon list is: `$ARGUMENTS`

Interpret `$ARGUMENTS` as:
- **Pasted JSON** — use as-is
- **File path** — read that `.json` file and use its contents
- **Attached / uploaded file** — use the attached glossary content

If `$ARGUMENTS` is empty and no glossary is otherwise attached, ask: "Please paste the glossary JSON or give a path to the `.json` file."

If the user wants a brand-new glossary for a domain they don't have yet, use `jargon-gym-generator` instead of reviewing.

**Import contract** (this skill's expected shape for Jargon Gym). If the user states different fields, follow theirs:

```json
{
  "domain": "...",
  "description": "...",
  "terms": [
    { "term": "...", "category": "...", "definition": "...", "example": "...", "mental_model": "...", "discussion": "...", "anti_example": "...", "controversy": "...", "note": "..." }
  ],
  "relationships": [
    { "source": "...", "target": "...", "relationship_type": "...", "description": "..." }
  ]
}
```

Required per term: `term`, `category`, `definition`. Other fields are optional — absence is normal, not a defect by itself.

If the resolved input isn't valid JSON or doesn't roughly match this shape, say so plainly and ask for the glossary JSON rather than guessing.

## Scale to size

Default chunk ~30 terms so each pass keeps reliable per-term attention (not a hard product limit).

- **≤ ~30 terms**: review in one pass.
- **> ~30 terms**: chunk ~30 for per-term checks (accuracy, field placement, tone). Run structural checks (duplicates, relationship references, repetitive patterns) once across the *full* list. Merge chunks into one Step 1 overview before responding.

## Validation criteria

Audit against the Jargon Gym glossary rules below (same field/tone/selection rules as the original generator prompt). Flag only real defects. A clean glossary → a clear verdict and no issues listed in Step 1.

**Completeness bar:** a term is fine when someone could use the word correctly in conversation — not when every optional field is filled.

### 1. Accuracy (highest priority)
- Definition wrong, outdated, or misleading vs how practitioners use the term today → `factual_error`, `must_fix`.
- Example wrong or implausible → `factual_error`, `must_fix`.
- Mental model teaches the wrong intuition if taken seriously → `factual_error`, `must_fix` (field: `mental_model`).

### 2. Field placement (`misplaced_content`)
- `definition` = meaning only: what the term IS. When-to-use, disagreement, how it differs from a related term, and application nuance belong in `discussion`, `controversy`, or `anti_example` — not in `definition`.
- `category` is a browse/filter label only — not a learning field; don't treat a weak category as a content defect unless required shape is broken.
- `discussion` that only restates the definition (not tradeoffs, conventions, reach-for-it, or common misuse) → `vague_or_generic`.
- `controversy` used for loose usage, overuse caution, or misuse rather than genuine disagreement on meaning or scope → `misplaced_content` (most terms should omit this field).
- `anti_example` that isn't a real near-miss people commonly confuse with this term → `misplaced_content` or `unnecessary_field`.
- `mental_model` that isn't a comparison/analogy ("think of it like X") — e.g. just restates the definition → `misplaced_content` or `unnecessary_field`.
- `note` is freeform text for something that does not belong in the other fields. Do not grade it against a job. Do not flag it as `misplaced_content`, `missing_field`, or `unnecessary_field`.

### 3. Optional-field judgment

Required fields stay `term`, `category`, `definition`. `example`, `mental_model`, `discussion`, `anti_example`, `controversy`, `note`, and the `relationships` array as a whole are optional. Omit each when it wouldn't add real value — absence means "not needed," not TODO. Do not flag sparse terms that already clear the completeness bar. A missing `note` is always fine.

- **Missing is fine** when the term is already usable from what is there (definition alone is enough to use the word; definition already intuitive → no `mental_model`; no real near-miss → no `anti_example`; no genuine disagreement → no `controversy`; no usage nuance beyond definition/example → no `discussion`). Do not flag those gaps.
- **`missing_field`:** flag only when adding that field would clearly help learning. Match the original add-when rules:
  - `example` — definition alone wouldn't let someone use the word in conversation (concrete work scene **or** natural spoken sentence — one is enough).
  - `mental_model` — a comparison/analogy would make it click faster than the definition alone; skip if the definition is already intuitive.
  - `discussion` — tradeoffs, conventions, when you'd reach for the word, or common misuse aren't obvious from definition/example.
  - `anti_example` — real risk of confusing this term with a near-miss.
  - `controversy` — practitioners genuinely disagree on meaning or scope (rare).
  In the overview, name the term, the missing field, and why adding it adds value; include paste-ready text for Step 2.
- **`unnecessary_field`:** present optional field adds nothing or hurts (example that only rewords the definition or is neither a concrete scene nor natural speech; mental model for an already-intuitive term; discussion that restates the definition; controversy that isn't one; empty filler). Flag to remove or rewrite. Do not apply this to `note`.

### 4. Tone (`tone_violation` / `cliche_filler`)
- Voice target: sharp senior practitioner to a smart colleague over Slack — direct, slightly opinionated, including the annoying caveat. Textbook, dictionary, or corporate-blog tone → `tone_violation` / `should_fix`.
- Definitions that open with "refers to," "is defined as," "can be described as," or "\<Term\> is when…" → `tone_violation`.
- AI-cliché filler (`leverage`, `utilize`, `robust`, `seamless`, `delve into`, `unlock`, `game-changer`, `cutting-edge`, "it's important to note," "in today's fast-paced world") → `cliche_filler`. Prefer plain words (`use` not `utilize`).
- Same opening word/pattern or sentence structure across many terms → one `structural_issue` naming the pattern and affected terms.
- Newcomer couldn't follow because the definition leans on other jargon → `jargon_explained_with_jargon` (use a plainer everyday comparison when needed).
- Qualifier-chained sentences that should split into two short concrete ones → `tone_violation` / `should_fix`.
- Examples grounded in toy abstractions ("Object A calls Object B") instead of one realistic practitioner scene or natural spoken sentence → `tone_violation` / `should_fix`.

### 5. Structural checks (`structural_issues`)
- Term names unique within the import.
- Required shape present (`term`, `category`, `definition` on every term).
- `terms.length` ≤ 100 and `relationships.length` ≤ 100 (ceiling, not a target).
- Every relationship `source`/`target` exactly matches a term name.
- `relationship_type` reads naturally in a sentence (e.g. prerequisite of, subtype of, contrasts with, synonym of, depends on, builds on, often confused with) and describes the real link — flag lists that default everything to "often confused with."
- Relationships are optional overall. Flag a **missing** relationship only when two listed terms have a real connection worth naming (confuse-pair, prerequisite/order, subtype, contrast, etc.) and a learner would benefit — most terms need none; do not invent a dense graph.
- Write for someone learning the field, not experts skimming acronyms.

### 6. Coverage
- `missing_terms`: must-know, high-frequency terms a newcomer needs to follow real conversations in this domain (core vocabulary that comes up constantly — not a drive toward 100).
- `cut_candidates`: niche, rarely used, obscure, or "nice to know" terms that dilute the must-know list — when unsure a term is common enough, prefer cutting.

## Output format

Two-step success path (ask/reject replies above are the exception). Do **not** dump the full glossary or a full review-report JSON on the first reply.

### Step 1 — Overview, then ask

Respond in plain prose (not JSON):

1. **Verdict** — one short paragraph: accurate, well-scoped, rule-compliant?
2. **Issues** — only real defects, grouped lightly:
   - Per-term problems: term name, field, severity, what's wrong, and the suggested fix (paste-ready field text, or "remove this field" / "add: …").
   - Structural issues (duplicates, bad relationship endpoints, repetitive openings, etc.).
   - Coverage: missing must-know terms; cut candidates.
3. **Ask** (exactly once, then stop and wait): whether they want the structured fix JSON.

If there are no defects, say the glossary looks clean and skip the ask.

Severity labels in the overview:
- `must_fix` — factually wrong, or breaks the import/structure.
- `should_fix` — field or tone rule violation that hurts learning.
- `nitpick` — stylistic, safe to ignore.

Every suggested fix uses glossary tone: sharp senior practitioner to a smart colleague over Slack — short concrete sentences, plain words, substance-first openings.

### Step 2 — Structured fix JSON (only if the user says yes)

Respond with only the JSON object — no markdown fences, no preamble, no explanation. Shape matches `jargon-gym-generator` (import contract above).

**Hard rule — apply every fixable Step 1 suggestion.** If the overview said it can be fixed, Step 2 must fix it. Do not drop, soften, or leave any suggested fix only in the prose. Invent nothing beyond what Step 1 already suggested.

**Partial patch, not a full re-export:**
- Preserve `domain` and `description` from the input (echo unchanged unless Step 1 specifically called for fixing them — then use the corrected text).
- `terms[]`: every term Step 1 said to fix or add (including coverage `missing_terms`), each as the full corrected term object. Omit terms that were fine. For "remove this field," omit that field on the corrected object.
- `relationships[]`: every relationship Step 1 said to fix, add, or replace. Omit relationships that were fine.
- Cut candidates stay out of the JSON (removals were advice in Step 1 only — nothing to emit).
- Do not restate clean terms/relationships.

```json
{
  "domain": "<echoed from input>",
  "description": "<echoed from input>",
  "terms": [
    {
      "term": "Term that needed a fix",
      "category": "...",
      "definition": "Corrected meaning-only definition",
      "example": "Optional — only if it belongs after the fix"
    }
  ],
  "relationships": [
    {
      "source": "Term A",
      "target": "Term B",
      "relationship_type": "corrected or new type",
      "description": "Optional"
    }
  ]
}
```

If Step 1 found nothing to fix, do not emit this JSON.

## Done when

- Input resolved to glossary JSON (or ask/reject already returned).
- Step 1 overview delivered; asked about structured fix JSON only when there is something to fix; waited for the user's answer.
- On yes: Step 2 is only the partial fix JSON above — every fixable Step 1 suggestion applied; fine terms/relationships omitted; domain and description preserved (or corrected if Step 1 said so); invent nothing beyond Step 1.
- If the user asked for a fully rewritten glossary: still do Step 1; note in the verdict that a full rewrite is a follow-up (they can ask after, or use `jargon-gym-generator` for a fresh domain glossary).
