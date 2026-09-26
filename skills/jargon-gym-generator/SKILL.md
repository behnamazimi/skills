---
name: jargon-gym-generator
description: Generate a jargon glossary as JSON for a domain the user names. Use when the user asks for a glossary, vocabulary list, or term list for a field (e.g. "make me a glossary for X", "I need to learn the vocabulary of X"). Not for reviewing an existing glossary — that is jargon-gym-review.
argument-hint: "[domain] | [count=10] | [exclude: term, ...]"
---

## Input

`$ARGUMENTS` carries up to three parts. Parse in order (whitespace- and `|`-flexible):

1. **domain** (required) — short field/topic label (e.g. `Software Engineering`, `Kubernetes`, `Wine Tasting`)
2. **count** (optional) — how many terms to generate; default **10** when omitted or blank. Integer from 1–100.
3. **exclude** (optional) — preexisting jargon, or terms that must not appear in `terms[]` (comma-separated; optional `exclude:` prefix)

Examples of valid `$ARGUMENTS`:
- `Kubernetes`
- `Kubernetes 25`
- `Kubernetes | 25`
- `Software Engineering | 10 | Coupling, Cohesion`
- `Kubernetes 20 | exclude: Pod, Service, Ingress`

When the user states count or exclusions in the surrounding message (not only in `$ARGUMENTS`), honor those the same way. Missing count → **10**. Missing exclude → empty ban list.

**Hard rule — exclusions:** Every name in `exclude` is banned from the output.
- No `terms[].term` may match an excluded name (case-insensitive).
- No synonym, abbreviation, expanded form, or near-duplicate of an excluded term either (e.g. if `K8s` is excluded, omit `Kubernetes` as a term name too when it is the same concept).
- `relationships[].source` / `target` may only reference terms that appear in this glossary’s `terms[]` — never an excluded name.
- If exclusions shrink the must-know pool below `count`, return fewer terms — never pad with banned or weak terms.

Reject — reply briefly with the expected argument shape and 1–2 examples, then stop — when:
- **domain** is missing, empty, a full sentence/instruction/prompt, pasted JSON/glossary/file path, or longer than a short phrase
- **count** is present but not an integer in 1–100

If the user already has glossary JSON and wants it checked or audited, use `jargon-gym-review` instead of generating.

## Task

After valid input is accepted, generate a glossary JSON for **domain** (target length **count**, minus hard exclusions) for paste into Jargon Gym.

**Success output:** respond with only the final JSON object — no markdown fences, no preamble, no explanation. Rejection replies above are the exception.

The field shape below is this skill's import contract for Jargon Gym. If the user states different fields, follow theirs. Term count follows **count** (default 10; **100 is the ceiling, not a target**). Relationships: at most 100.

## JSON structure

```json
{
  "domain": "<domain>",
  "description": "One-line summary of this domain",
  "terms": [
    {
      "term": "Term name",
      "category": "Browse label for filters only — e.g. Architecture, Testing",
      "definition": "What the term means, in plain language — meaning only",
      "example": "Optional — concrete scene or natural sentence; omit if definition alone is enough to use the word",
      "mental_model": "Optional — a comparison or analogy that makes the term click; omit if the definition is already intuitive",
      "discussion": "Optional — in practice: tradeoffs, conventions, when you'd reach for it, common misuse",
      "anti_example": "Optional — a near-miss: something that looks like this term but isn't, only when there's real risk of confusing the two",
      "controversy": "Optional — debated: only when practitioners genuinely disagree on meaning or scope",
      "note": "Optional — freeform text for something that does not belong in the other fields; omit when unused"
    }
  ],
  "relationships": [
    {
      "source": "Term name A",
      "target": "Term name B",
      "relationship_type": "prerequisite of",
      "description": "Optional — explanation of the link"
    }
  ]
}
```

## Field rules

- `term`, `category`, and `definition` are the only required fields per term.
- `category` is a browse label, not a learning field — pick whatever helps filter the list later.
- **`definition` is meaning only:** what the term IS. Do not put when to use it, how people disagree, how it differs from a related term, or application nuance in the definition — those belong in other fields.
  - Never start a definition with "refers to", "is defined as", "can be described as", or the term restated as its own subject (e.g. "Coupling is when…"). Open with the substance.
  - Don't repeat the same sentence structure or opening word across terms — that repetition makes a whole glossary read robotic.
  - Don't explain jargon with more jargon. If a plainer everyday comparison helps the idea click, use one.
  - Keep sentences short and concrete. If a definition needs two clauses, split it — don't chain qualifiers into one long sentence.
- `example`, `mental_model`, `discussion`, `anti_example`, `controversy`, and `note` are all optional. Omit each one individually when it wouldn't add real value — empty optional fields mean "not needed," not TODO. Do not fill every field on every term.
- **`example`:** add when the definition alone wouldn't let someone use the word in conversation. Use a concrete scene (where it applies in real work) or a natural sentence (the word used in speech) — whichever makes the term click; one is enough.
- **`mental_model`:** add when a comparison or analogy would make the term click faster than the definition alone — a memorable "think of it like X" framing. Skip it when the definition is already intuitive on its own.
- **`discussion`:** tradeoffs, team conventions, when you'd reach for the word, or common misuse — usage nuance that isn't obvious from the definition and example. Do not restate the definition. When included, make it actionable nuance, a tradeoff, or a common misuse — not filler.
- **`anti_example`:** only when there's a real near-miss — something people commonly mistake for this term or confuse it with — worth naming to sharpen the boundary. Skip when there's no genuine risk of confusion.
- **`controversy`:** before finalizing, scan the full term list once specifically looking for terms where practitioners genuinely dispute meaning or scope — not loose usage, not a caution about overuse. Expect this to be rare, but confirm that by checking each term against the trigger, not by skipping the field by default. Most terms should NOT have this field, but "most" is not "none" — a glossary that comes out with zero `controversy` fields is a sign the scan wasn't done.
- **`note`:** freeform text for something that does not belong in the other fields. The collection decides what it holds. There is no fixed job. Omit it when unused. Do not fill it on every term, and do not use it as a second definition, example, or mental model.
- **`relationships`:** the array as a whole is optional. Add a relationship when two terms have any real connection worth naming — prerequisite of, subtype of, contrasts with, synonym of, depends on, builds on, often confused with, etc. Most terms won't need one, and that's expected. `relationship_type` should read naturally in a sentence; don't default to "often confused with" for every pair — pick whichever type actually describes the connection. `source`/`target` must match term names exactly. Cap: 100.
  - Cross-check against `anti_example`: if a relationship is "often confused with" (or similar near-miss framing), at least one of the two terms' own `anti_example` should capture that same confusion. Don't let a relationship name a mix-up that neither term's entry reflects.
- A term is complete when someone could use the word correctly in conversation — not when every optional field is filled.
- **Consistency at scale:** apply the same per-term optional-field evaluation to the last term on the list that you applied to the first. On longer runs it's easy to get more careful early and coast on bare `term`/`category`/`definition`/`example` toward the end — that's a rigor drop, not a judgment call, and it should not happen. For runs over ~30 terms, treat it as a sanity check that roughly a quarter to a third of terms end up with at least one optional field beyond `example`; if the back half of the list is noticeably sparser than the front half with no substantive reason, that's a signal to re-pass it, not ship it.
  - For **count** over 40, draft in batches of roughly 20 terms and re-apply the full optional-field evaluation (including the `controversy` scan) within each batch, rather than doing one evaluation pass at the very end. This keeps rigor even across the list instead of front-loading it.
- **`category` consistency:** reuse the same category label verbatim across terms that belong to the same group (e.g. always "Architecture", never a mix of "Architecture" and "Software Architecture" in one glossary). Near-duplicate category strings fragment the filter view in Jargon Gym.
- **No duplicate relationships:** don't add both directions of the same pair (A→B and B→A) as separate relationships, and don't add more than one relationship entry for the same source/target pair.

## Tone

- Write like a sharp senior practitioner explaining a term to a smart colleague over Slack — not like a textbook, a dictionary, or a corporate blog post.
- Be direct and slightly opinionated — say what's actually true in practice, including the annoying caveat, instead of staying neutral.
- Prefer plain words (`use` not `utilize`).
- Ban AI-cliché filler entirely: "it's important to note", "in today's fast-paced world", "leverage", "utilize", "robust", "seamless", "delve into", "unlock", "game-changer", "cutting-edge".
- Ground examples in one concrete, realistic scenario a practitioner would recognize — no toy abstractions ("Object A" and "Object B"). A natural sentence showing the word in speech is also fine when that's what makes the term click.

## Selection

- Include up to **count** must-know terms for **domain** (default 10; max 100). **100 is the ceiling, not a target.** Only include terms a newcomer absolutely must know to follow a conversation in this field — core, high-frequency terms that come up constantly in real work.
- Skip niche, rarely used, obscure, or "nice to know" terms, even if they're technically part of the domain. If unsure whether a term is common enough, leave it out. Prefer fewer terms over padding with weaker ones just to approach **count** or the cap.
- Apply the **Hard rule — exclusions** before finalizing the list; re-check the finished `terms[]` against `exclude` and drop any accidental hits.
- Term names must be unique within the import.
- Write for someone learning the field, not for experts skimming acronyms.

## Example (valid format, domain: Software Engineering, count: 3)

```json
{
  "domain": "Software Engineering",
  "description": "Core vocabulary for software architecture, design, and delivery.",
  "terms": [
    {
      "term": "Coupling",
      "category": "Architecture",
      "definition": "The degree to which one component depends on another's internals — the tighter the coupling, the more a change on one side risks breaking the other.",
      "example": "Billing code that directly reads fields from the user-profile table breaks if that table changes.",
      "mental_model": "Think of it like two people sharing a single house key — convenient until one of them changes the lock.",
      "discussion": "Teams usually reduce coupling by communicating through a stable API or event contract instead of reaching into another service's internal data model directly.",
      "note": "The word is borrowed from physics, where coupling is how strongly two systems influence each other."
    },
    {
      "term": "Cohesion",
      "category": "Architecture",
      "definition": "How tightly a module's responsibilities relate to one single purpose, rather than being a grab-bag of unrelated tasks.",
      "example": "A module that only sends emails is more cohesive than one that also handles payments.",
      "anti_example": "A 'utils' file that handles date formatting, API calls, and validation isn't cohesive — those are unrelated concerns bundled together."
    },
    {
      "term": "Technical Debt",
      "category": "Process",
      "definition": "Shortcuts taken to ship faster that add friction to future changes, the way a real loan adds interest.",
      "example": "Hardcoding a config value to hit a deadline, then dealing with it whenever that value needs to change per environment.",
      "controversy": "Some practitioners use it only for deliberate shortcuts with a known payoff plan; others use it for any code that's just gotten messy over time — the two camps disagree on whether \"debt\" implies intent."
    }
  ],
  "relationships": [
    {
      "source": "Coupling",
      "target": "Cohesion",
      "relationship_type": "often confused with",
      "description": "High cohesion and low coupling often go together, but they describe different things."
    }
  ]
}
```

## Done when

Before responding, walk through the checklist below against the drafted JSON — don't treat it as background spec, actually verify each line.

- Input parsed (domain valid; count defaulted to 10 if omitted; exclude list applied) — or rejection already returned.
- Success response is only the JSON object matching the structure above.
- `terms.length` is ≤ **count**, and equals **count** when enough must-know terms remain after exclusions — never pad with niche or weak terms.
- No term (nor synonym/abbreviation/near-duplicate) from **exclude** appears in `terms[]` or as a relationship endpoint.
- Terms are unique; every relationship `source`/`target` resolves to a term name in this glossary; `relationships.length` ≤ 100.
- Each included term is usable in conversation; optional fields omitted when they add no value; relationships only where a real connection is worth naming.
