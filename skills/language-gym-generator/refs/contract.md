# Contract: run folder and handoff files

Every step reads and writes files in the run folder. It never passes data only through chat. `gym.mjs` checks each file before the next step starts. A file that fails its check gets **one** retry from the step that wrote it; if it fails again, handle it as its step file says.

`GYM` below means `node <skill dir>/scripts/gym.mjs`.

## Run folder

`${TMPDIR:-/tmp}/language-gym/<domain-slug>-<YYYYMMDD-HHMMSS>-<4 random hex>/`

| File | Written by | Checked by |
|---|---|---|
| `args.txt` | 0 | — (the raw request, verbatim) |
| `state.json` | orchestrator | — |
| `spec.json` | 0 | `GYM validate spec` |
| `exclude.json` | 1 | `GYM validate exclude` |
| `list.json` | 2 | `GYM validate list --spec --exclude` |
| `candidates.json` | orchestrator | output of `GYM candidates` |
| `list-findings.json` | 3 | `GYM validate findings list-findings.json --draft list.json --rules refs/rules.md` |
| `style.json`, `plan.json` | 4 | shape below |
| `samples.json` | 4 | `GYM validate batch --spec --style` |
| `batch-N.json` | 5 | `GYM validate batch --spec --style --exclude` |
| `draft.json` | 6, 7, 8, 10 | `GYM validate glossary --spec --style --exclude` |
| `metrics.json` | orchestrator | output of `GYM metrics --plan` |
| `coach.json` | 7 | shape below |
| `tokens.json` | orchestrator | output of `GYM tokens` |
| `level.json`, `facts.json` | 9 | shape below |
| `ipa-check.json` | 9 | compared by `GYM ipa draft.json --against ipa-check.json` |
| `findings.json` | 9 | `GYM validate findings --draft --rules refs/rules.md` |
| `fixes.json` | 10 | shape below |
| `glossary.json` / `glossary-part-N.json` | orchestrator | output of `GYM emit` (runs `validate output` itself) |
| `report.md` | orchestrator | — |

## `state.json`

```json
{ "step": "05-write", "done": ["00-parse", "01-exclude", "02-select", "03-review-list", "04-plan"], "retries": {"05-write:batch-3": 1}, "inline": false, "node": true, "warnings": [] }
```

To resume a run, read `state.json` and continue from `step`. `inline: true` means the steps ran without subagents; `node: false` means the script checks were done by hand. Both go in the report.

## `spec.json`

```json
{
  "version": 1,
  "domain": "Spanish",
  "language": "Spanish",
  "slice": null,
  "slice_type": "bare",
  "count": 10,
  "series": null,
  "confirmed": false,
  "learner": "English",
  "level": { "label": "A2–B1", "floor": "A2", "ceiling": "B1" },
  "beginner_mode": true,
  "immersion": false,
  "pronunciation": "none",
  "dialect": "Latin American Spanish (broadly neutral)",
  "fields": null,
  "levellist": null,
  "path": "lite",
  "profile": { "locale": "es-419", "scripts": ["Latn"], "direction": "ltr", "cased": true, "word_separated": true, "diacritics_meaningful": true, "articles": ["el", "la", "los", "las", "un", "una"], "noun_citation": "bare lemma", "pronunciation_convention": "IPA", "grammar_notes": "..." },
  "learner_profile": { "locale": "en", "scripts": ["Latn"], "direction": "ltr", "cased": true, "word_separated": true },
  "sources": { "count": "default", "learner": "default", "level": "default", "immersion": "default", "pronunciation": "default", "dialect": "default" }
}
```

- `series`: `null`, or `{ "parts": K, "part": n, "part_count": <terms in this part, ≤ 100> }`.
- `fields`: `null`, or `{ "rename": {"anti_example": "near_miss"}, "drop": ["controversy"] }`.
- `slice_type` is one of `bare | usage | grammar | reading`.
- `sources` values are `user | default | inferred`.

## `exclude.json`

```json
{
  "raw": ["tener", "la cuenta", "sí"],
  "items": [
    { "raw": "tener", "term": "tener", "lemma": "tener", "job": null, "forms": ["tengo", "tiene", "tuve"], "scope": "lemma" },
    { "raw": "la cuenta", "term": "la cuenta", "lemma": "cuenta", "job": "the bill", "forms": [], "scope": "phrase" }
  ],
  "ignored": [ { "raw": "???", "reason": "not a word" } ],
  "hints": { "dialect": "Spain (vosotros present)", "noun_citation": "lemma + article", "categories": ["Verbo", "Frase"] }
}
```

- `raw` holds every item the user gave, after splitting, trimming and de-duplicating. Each one ends up in `items` or in `ignored`.
- `forms` lists the common inflections and spelling variants of a `lemma`-scope item: enough for exact matching, not a full paradigm.
- `hints` (optional) holds what the excluded items reveal about the earlier runs (**R-IN-08**).

## `list.json`

```json
{
  "main":   [ { "id": "t01", "term": "estar", "job": "location and temporary state", "slot": "spine", "level": "A1", "why": "..." } ],
  "spares": [ { "id": "s01", "term": "querer", "job": "want", "slot": "spine", "level": "A1", "why": "..." } ],
  "sets":   [ { "name": "subject pronouns", "members": ["yo", "tú", "usted", "él", "ella", "nosotros", "ustedes", "ellos", "ellas"] } ],
  "shape":  { "jobs": { "identity": "ser", "existence": "hay", "location": "estar", "negation": "known: no", "questions": "¿dónde?", "past": "pretérito: -é / -ó", "want": "querer", "can": "poder", "go": "ir", "must": "tener que + infinitivo", "future": "deferred" }, "concrete_nouns": 1, "notes": "..." }
}
```

- `slot` is one of `spine | construction | glue | verb_adj | phrase | noun`.
- Ids are `t01…` for main items and `s01…` for spares. A promoted spare keeps its id.
- `shape.jobs` is required on a `bare` glossary: every job from R-SEL-12 maps to an exact `main` term, `known: <excluded item>`, `n/a: <reason>`, or `deferred`.

## `style.json`

```json
{
  "voice": "second person, present tense, plain",
  "categories": ["Verb", "Pronoun", "Connector", "Phrase", "Grammar", "Noun", "Adjective", "Adverb", "Particle"],
  "gloss_separator": " — ",
  "limits": { "definition": 22, "example": 14, "sentence": 10, "mental_model": 22, "discussion": 30, "anti_example": 24, "controversy": 20 },
  "opening_moves": ["action verb: 'Says…', 'Marks…'", "scene: 'When you…'", "contrast-free plain meaning"],
  "banned_phrases": ["…learner-language list…"],
  "confusion_types": ["often confused with"],
  "scenes_by_batch": { "1": ["café order", "bus stop", "family dinner"], "2": ["…"] },
  "ceiling": "B1",
  "ipa_format": "space + /…/ at the end of definition; tones: citation tones with Chao letters, neutral tone unmarked",
  "notes": "…anything a writer must do the same way every time…"
}
```

- `limits` are words per field (a soft ceiling; `validate` flags anything more than 25% over).
- Categories and banned phrases are written in the learner language.

## `plan.json`

```json
{ "terms": [ {
  "id": "t01",
  "job": "location and temporary state",
  "trap": "English speakers use ser for everything 'be'",
  "scene": "phone call: where are you?",
  "fields": ["example", "anti_example"],
  "why_fields": "anti_example: the ser/estar mix-up is the #1 trap",
  "level_exceptions": [ { "word": "…", "level": "B2", "reason": "no simpler word for …" } ]
} ] }
```

## Draft entries (`samples.json`, `batch-N.json`, `draft.json`)

```json
{ "domain": "Spanish", "description": "…",
  "terms": [ { "id": "t01", "batch": 1, "term": "estar", "category": "Verb", "definition": "…", "example": "…", "anti_example": "…", "meta": { "notes": "…" } } ],
  "relationships": [ { "source": "ser", "target": "estar", "relationship_type": "often confused with", "description": "…" } ] }
```

- Only `id`, `batch` and `meta` may appear besides the import fields. `GYM emit` drops them.
- Optional fields that aren't used are **absent**, never `""` or `null`.
- A batch file holds only `{ "terms": [...] }`.

## `coach.json`

```json
{ "results": [ {
  "id": "t01",
  "learner_test": { "pass": true, "sentence": "…", "question": "…", "answer": "…", "unknown_words": [] },
  "scores": { "definition": 4, "example": 3, "anti_example": 4 },
  "action": "keep | rewrite | drop_field",
  "rewrite": { "field": "example", "text": "…" },
  "judge": { "winner": "rewrite | original", "reason": "…" }
} ] }
```

## `level.json` and `facts.json`

```json
{ "rater": 1, "ratings": [ { "token": "esquina", "level": "A2", "occurrences": [ { "term_id": "t03", "field": "example" } ] } ], "structures": [ { "term_id": "t04", "field": "example", "structure": "future with ir a", "level": "A2" } ] }
```

```json
{ "answers": [ { "term_id": "t01", "question": "Gender of 'mapa'?", "answer": "masculine", "writer_claim": "feminine", "agree": false, "unsure": false } ] }
```

`ipa-check.json` (only when `pronunciation` is `ipa`): the fact agent's own transcription of each term, made without seeing the entry's IPA.

```json
{ "answers": [ { "term_id": "t01", "ipa": "pa˨˩˦", "form": "the filled form transcribed, for patterns" } ] }
```

## `findings.json`

```json
{ "findings": [ { "term_id": "t01", "field": "definition", "rule": "R-FLD-03", "severity": "must_fix", "quote": "exact text from the field", "problem": "…", "fix": "…", "source": "script | facts | level | rules" } ] }
```

For a relationship, `term_id` is `relationships[N]` (its index in `draft.json`) and `field` is `relationship_type` or `description`.

## `fixes.json`

```json
{ "round": 1, "applied": [ { "finding": 0, "term_id": "t01", "field": "definition" } ], "rejected": [ { "finding": 3, "reason": "…" } ], "dropped": [ { "term_id": "t07", "replaced_by": "s02", "reason": "…" } ] }
```

## `report.md`

This is for the user and for debugging; it's never printed in chat. It covers:
- the settings and where each came from;
- the path (lite or full);
- inline or subagents, and whether Node ran;
- exclude items that were ignored;
- the checks run, with counts;
- batch metrics and outliers;
- coach score averages and the learner-test pass rate;
- level exceptions;
- rejected findings;
- dropped and replaced terms;
- anything that wasn't verified.
