---
name: skill-context-audit
description: Audits an agentic SKILL for context quality. Use when auditing a skill.
alwaysApply: false
---

# Skill Context Audit

The organizing principle: every check serves predictability — the agent taking the same process each run.

## Step 0 — Accept input

The skill input is: `$ARGUMENTS`

Interpret `$ARGUMENTS` as:
- **Web URL** — fetch the raw content
- **File path** — read the file; also read any `modules:` entries in frontmatter and markdown-linked sub-files one level deep
- **Pasted text** — use as-is

If `$ARGUMENTS` is empty, ask: "Please share the skill — paste the text, give a file path, or drop a URL."

---

## Step 1 — Structural checks

Run all sub-checks. Collect findings before reporting.

### 1a · Invocation

**Model-invoked (has a `description` field):**
Confirm an agent or another skill actually needs to reach it autonomously. If it only ever fires by hand, flag: add `disable-model-invocation: true` and trim the context load.

**Manually-invoked (no `description` field):**
Confirm the skill is scoped to a single, named task a human explicitly triggers. If the body contains decision trees that assume model context (e.g. reads `$ARGUMENTS` without a fallback prompt), flag: add a fallback or convert to model-invoked.

PASS: invocation mode is justified and the body's assumptions match it.

### 1b · Description quality (model-invoked only)

- **Front-loaded trigger**: first word carries invocation weight; flag if it doesn't.
- **Distinct branches only**: synonyms renaming one branch ("TDD… test-first development") are duplication; each branch must be a distinct trigger.
- **No body restatement**: description holds triggers and a reach clause only; flag anything the body already covers.

PASS: description triggers reliably and contains nothing the body already says.

### 1c · Completion criteria

For every step or branch:
- Does it end on a checkable completion criterion? ("Every modified model listed" passes; "produce a change list" fails — it names the action, not the outcome state.)
- Are the criteria exhaustive where it matters? A fuzzy criterion invites premature completion; fix the criterion before considering a split.

PASS: every step names the outcome state, not just the action.

### 1d · Splitting

For each split (by-invocation or by-sequence):
- **By-invocation**: justified only by a distinct leading word or external reach that pays the context load.
- **By-sequence**: justified only when a visible later step would tempt the agent to rush the current one.

PASS: every split has an explicit justification of one of the two kinds above.

### 1e · Leading-word compression

- **Restatements collapsed**: a quality spread across a phrase ("fast, deterministic, low-overhead") should be one token ("tight"). Flag every such phrase.
- **Shared vocabulary**: leading words in the skill appear in the user's prompts, docs, and code so invocation links reliably. Flag terms that diverge.

PASS: no multi-word restatements; vocabulary matches the project's language.

---

## Step 2 — Four failure mode checks

Apply every detector. Collect all findings before reporting.

### The four failure modes (reference)

**Poisoning** — erroneous or drifting facts; every session inherits the error.  
**Distraction** — too large or noisy; includes no-op sentences, negations, and sediment (stale/discarded content); the model paraphrases instead of doing the task.  
**Confusion** — too many options or irrelevant sections; model picks the wrong path because signal is buried.  
**Clash** — contradictory instructions; model mixes approaches because it cannot resolve which applies.

### Check 2a · Poisoning

Flag content that:
- States tooling/library-specific facts likely to drift (version numbers, API URLs, config keys) with no source cited
- References external systems without a validation instruction (e.g. "uses Redis cluster mode")
- Makes definitive claims without evidence ("always does X", "the model returns Y")
- Appears copy-pasted from AI output without a human review marker

**Rule**: any fact-like claim that, if wrong, would silently mislead every session this skill runs in.

PASS: no unverified drifting facts; all external references carry a validation instruction.

### Check 2b · Distraction

Estimate token count: lines × 8 tokens/line (prose-heavy) to 15 tokens/line (code/YAML-dense) as a rough proxy. Flag if likely > **3,500 tokens**.

Also flag:
- `## History`, `## Changelog`, `## Previous approach` — retrospective content the model doesn't need
- Descriptions of discarded approaches instead of current guidance (sediment — stale layers left because removing felt risky)
- Tables of Contents with HTML anchor links (model reads sequentially; ToC wastes tokens)
- Preamble that restates what the skill name already conveys
- **No-op sentences**: does the sentence change behavior versus the model's default? If not, delete it — don't trim. Weak leading words ("be thorough") are no-ops; replace with a stronger word, not more prose.
- **Negation**: prohibitions that name the unwanted behavior ("don't think of an elephant"). Rephrase as the positive target; keep a prohibition only as an unavoidable guardrail, paired with what to do instead.

PASS: estimated tokens within limit; no retrospective content, sediment, no-ops, or negations present.

### Check 2c · Confusion

Flag:
- Multiple tools/libraries for the same task with no declared default
- Long "alternatives" lists with no decision guidance
- Sections irrelevant to the skill's stated purpose that a model might act on
- `alwaysApply: true` with `estimated_tokens > 200` — injects noise into every session, not just relevant ones
- **Sprawl**: content that belongs only to some branches kept inline; it should sit behind a context pointer. Material only some paths use, kept inline, is sprawl.
- **Context pointer quality**: judge the pointer's phrasing, not just its target — it must trigger the right branch reliably.
- **Co-location broken**: a concept's definition, rules, and caveats scattered across headings instead of grouped under one.

PASS: one declared default per decision; no irrelevant sections; no sprawl; all context pointers reliably scoped.

### Check 2d · Clash

Flag contradictory pairs within the skill:
- "Use X" then later "Use Y" for the same decision, without a supersession marker.
- Conflicting version pins (e.g. `node >= 18` vs `node >= 20`)
- Contradictory behavioral rules (e.g. "always confirm before deleting" vs "proceed without confirmation")
- Body instructions that contradict frontmatter values (`tags:`, `category:`, `alwaysApply:`)
- **Single-source-of-truth violations**: the same meaning defined in two places; a behavior change should be a one-place edit.

PASS: no contradictory instruction pairs; frontmatter and body agree.

---

## Step 3 — Score each finding

- 🔴 **Critical** — will actively mislead the model in every session this skill runs in
- 🟡 **Warning** — degrades output quality or wastes tokens noticeably
- 🟢 **Advisory** — minor improvement opportunity

---

## Step 4 — Report

Audit is complete when every check has a PASS or at least one flagged finding, and the report covers all check categories.

```
## <skill-name>  [🔴 N critical · 🟡 N warnings · 🟢 N advisories]

### Structural
- <severity> <check-id>: <quoted excerpt> — <reason>.
  Fix: <one-line fix>.

### Poisoning
- <severity> Line <N>: <quoted claim> — <why it silently misleads>.
  Fix: <one-line fix>.

### Distraction
- <severity> <description> — <impact>.
  Fix: <one-line fix>.

### Confusion
- <severity> <description> — <decision left unresolved>.
  Fix: <one-line fix>.

### Clash
(none)
```

If the skill is clean: `✅ No issues found`

End with a **Top actions** list of the 3 highest-priority fixes, ranked by severity then impact.

