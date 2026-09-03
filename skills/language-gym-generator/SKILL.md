---
name: language-gym-generator
description: Generate a language-learning glossary as JSON for a language or slice the user names. Use when the user asks for vocabulary, phrases, grammar constructions, or a term list to learn a language (e.g. "make me a Spanish glossary", "French A2 restaurant vocab", "German modal particles"). Same import shape as jargon-gym-generator; not a conversational tutor (that is language-learning) and not for reviewing existing glossary JSON (pair with jargon-gym-review or a language-gym-review sibling).
argument-hint: "[language or slice] | [count=10] | [exclude: term, ...] | [learner=English] | [level] | [immersion] | [pronunciation=ipa|spoken|none]"
---

## Input

`$ARGUMENTS` carries positional parts first, then optional named flags. Parse in order (whitespace- and `|`-flexible):

1. **domain** (required) — language, optionally plus a slice (e.g. `Spanish`, `Spanish A2`, `French restaurants`, `German modal particles`, `Japanese keigo`)
2. **count** (optional) — how many terms to generate; default **10** when omitted or blank. Integer from 1–100.
3. **exclude** (optional) — preexisting items, or terms that must not appear in `terms[]` (comma-separated; optional `exclude:` prefix)

Named flags (anywhere in `$ARGUMENTS` or the surrounding message):

4. **learner** — language of definitions, mental models, discussion, controversy, and any gloss. Tokens: `learner=Dutch`, `learner: French`, or a bare language name after the positional parts. Default **English**. `learner=target` (or learner language = the domain's language) is immersion.
5. **level** — CEFR band or plain label (`A2`, `A2–B1`, `beginner`, `B2`). Also honor a level already in **domain** (`French A2`). Default when omitted: core high-frequency items a motivated beginner-to-intermediate learner must know for that slice — treat that default as **A2–B1 scaffolding** unless the user named a higher band (`B2`, `C1`, `advanced`).
6. **immersion** — flag (`immersion`, `immersive`, `full immersion`). Forces learner language = the target language. No L1 words, glosses, or translations anywhere.
7. **pronunciation** — `ipa` | `spoken` | `none`. Default **`ipa`**, except when **beginner scaffolding** is on, default **`none`**. `spoken` = a simple spoken-style hint only if genuinely useful (e.g. `zeg: ge-ZEL-lig`); don't default to including it.

Examples of valid `$ARGUMENTS`:
- `Spanish`
- `Spanish 25`
- `French A2 | 15`
- `Dutch | 10 | immersion | level: A2–B1 | pronunciation: none`
- `German modal particles | 10 | doch, mal`
- `Japanese | 20 | exclude: こんにちは, ありがとう | learner=English | level=B2 | pronunciation=ipa`

When the user states count, exclusions, **learner language**, **target dialect**, **level**, **immersion**, or **pronunciation** in the surrounding message, honor those the same way. Missing count → **10**. Missing exclude → empty ban list. Missing learner language → **English** (unless **immersion**). Missing dialect → the widely taught default for that language (name it in `description`). Missing level → A2–B1 scaffolding as above.

**Hard rule — exclusions:** Every name in `exclude` is banned from the output.
- No `terms[].term` may match an excluded name (case-insensitive; ignore accent/script differences that are the same lemma, e.g. `Que` excludes `qué` when they are the same item).
- No synonym, abbreviation, inflected form presented as a separate entry, romanization, or near-duplicate of an excluded term either (if `ser` is excluded, omit `soy` / `eres` as standalone term names when they are just conjugations of the same lemma).
- `relationships[].source` / `target` may only reference terms that appear in this glossary’s `terms[]` — never an excluded name.
- If exclusions shrink the must-know pool below `count`, return fewer terms — never pad with banned or weak terms.

Reject — reply briefly with the expected argument shape and 1–2 examples, then stop — when:
- **domain** is missing, empty, a full sentence/instruction/prompt, pasted JSON/glossary/file path, or not a language / language+slice
- **count** is present but not an integer in 1–100
- **pronunciation** is present but not one of `ipa`, `spoken`, `none`

If the user already has glossary JSON and wants it checked, review it instead of generating. If they want a live lesson, drills, or conversation practice, that is a tutor skill — this skill only emits import JSON.

## Modes (conditional)

Apply the matching blocks. Unmentioned modes stay off.

**Beginner scaffolding** is on when **level** is A1, A2, B1, `A2–B1`, `beginner`, `lower-intermediate`, or the omitted default. Off when the user named B2, C1, C2, or `advanced`.

**Immersion** is on when the **immersion** flag is set, or **learner** is `target` / the same language as **domain**.

### Immersion — target language only

When immersion is on:

- Full immersion. All content (definitions, examples, mental models, discussion, controversy, relationship descriptions) must be written entirely in the target language. No English words, glosses, or translations anywhere, even to clarify an abstract term. (If the target is Dutch: Dutch only — same rule.)
- Explain advanced terms in simple target language — never punt to English (or any other L1). If a term is inherently abstract or hard to flatten (e.g. an emotion word like "gezellig"), don't reach for an English equivalent. Instead:
  - Use a concrete everyday scene instead of an abstract paraphrase.
  - Use a short comparison ("mental model") in plain target language rather than an abstract noun.
  - It's fine if the explanation is slightly imprecise as long as it stays fully in simple target language — precision is secondary to comprehensibility at this level.

### Beginner scaffolding — A2–B1

When beginner scaffolding is on:

- Write for a beginner-to-lower-intermediate learner. Use:
  - Simple sentence structures — one clause per sentence wherever possible.
  - Common, high-frequency vocabulary a learner at this level would already know or could reasonably guess.
  - Present tense and simple past tense; avoid complex tenses (perfect combined with subordinate clauses, conditional, passive voice) unless unavoidable.
- No subordinate-clause chains or idioms. Avoid:
  - Concessive/contrastive clauses (Dutch examples: "ook al...", "hoewel...", "ondanks dat..."; same idea in whatever learner language is in use).
  - Negation-of-agreement constructions like "zijn het daarmee niet eens".
  - Idiomatic expressions or fixed phrases a beginner wouldn't recognize literally.
  - Rare or abstract vocabulary (e.g. "sfeer", "weerspiegelt") used to explain a different unfamiliar word — this just trades one unknown for another.
  - Separable/compound verbs buried inside definitions of other terms (e.g. "eruitzien" showing up while defining "gezellig").
- Definitions must be short and must not start with a banned opening.
  - Keep definitions to 1–2 short sentences (plus pronunciation only if that mode requires it).
  - Never start a definition with "Je gebruikt dit woord..." (or equivalent formulaic openers like "Dit woord betekent...", "Dit is wanneer...", or the same formulas in the learner language: "You use this word…", "This word means…", "This is when…").
  - Also never start with meta padding about the item being a word: "This word…", "This simple word…", "This common word…", "A simple word for…", "Dit (simpele/gewone) woord…", "Een eenvoudig woord voor…". The `term` field already is the word — open with meaning.
  - Lead with the plainest possible statement of meaning, then (optionally) one short clarifying sentence.
- Examples and mental models must stay concrete.
  - Examples should describe one clear, everyday scene (people, places, objects a beginner already has vocabulary for) rather than an abstract statement.
  - Mental models should use a simple comparison ("Denk aan..." / "Think of...") in short sentences, not a restatement of the definition in fancier words.
- Drop or drastically simplify debate-register fields. Fields like controversy naturally use hedging and opinion-comparison language ("Veel mensen zeggen dat... anderen denken..."), which is B2+ discourse. Either:
  - Omit the field entirely, or
  - Reduce it to one flat, short sentence with no hedging or comparative clauses.
  - This overrides the usual "a glossary with zero controversy means the scan wasn't done" check: at A2–B1, omit is the correct default.
- Consistency check before finalizing: read every field aloud as if speaking to an A2–B1 learner. If any sentence needs a subordinate clause, an idiom, or a word the learner hasn't seen yet to be understood, rewrite it — don't explain it away in English (or any L1, when immersion is on).

### Pronunciation

- **`ipa`:** after the meaning, end `definition` with IPA in slashes for the `term` as written. Match the dialect named in `description`. No extra sentence ("Pronounced…"); just a space (or a sentence-final period, then a space) and `/…/`. Example: `…the grammar around it picks the sense. /keˈðaɾ/`
- **`spoken`:** IPA transcriptions aren't beginner scaffolding. Replace with a simple spoken-style hint (e.g. "zeg: ge-ZEL-lig") only if genuinely useful — don't default to including it. Put it at the end of `definition` the same way IPA would go.
- **`none`:** no phonetic/IPA notation anywhere. Don't put pronunciation in `term`, `example`, or other fields either.

Don't put IPA in `term`, `example`, or other fields to "also cover" pronunciation — it lives at the end of `definition` only, and only when **pronunciation** is `ipa` or a spoken hint was actually warranted.

## What a term is

Keep the same JSON keys as Jargon Gym. A `term` is **one thing the learner must be able to use or recognize** in the named slice — not a textbook chapter.

Pick the mix from the domain, in this order of preference:

1. **Word or fixed phrase** in the target language — the default for a language or usage slice (`la cuenta`, `en plus`, `doch`, `お疲れ様です`)
2. **Named construction** when the slice is grammar or the item is used as a unit (`passé composé`, `ser`, `〜てしまう`)
3. **Learner-facing contrast label** only when the contrast *is* the thing people study (`ser vs estar` is two terms plus a relationship, not one mega-term — unless the domain is explicitly the contrast)

Do not mix professional jargon-of-linguistics as the main list (`allophone`, `clitic climbing`) unless the domain is linguistics. Write for someone learning to speak and understand, not for a syntax seminar.

Write `term` as learners actually meet it: dictionary lemma or the frozen phrase, in the target script. Do not make separate terms for routine inflections of the same lemma.

## Task

After valid input is accepted, generate a glossary JSON for **domain** (target length **count**, minus hard exclusions) for paste into Jargon Gym.

**Success output:** respond with only the final JSON object — no markdown fences, no preamble, no explanation. Rejection replies above are the exception.

The field shape below is this skill's import contract for Jargon Gym. If the user states different fields, follow theirs. Term count follows **count** (default 10; **100 is the ceiling, not a target**). Relationships: at most 100.

## JSON structure

```json
{
  "domain": "<domain>",
  "description": "One-line summary of this language slice (include dialect default if relevant)",
  "terms": [
    {
      "term": "Form as learners meet it (target language)",
      "category": "Browse label for filters only — e.g. Verb, Idiom, Particle, Grammar, Register",
      "definition": "What it means or does, in the learner language — pronunciation at the end only if pronunciation mode is ipa or a spoken hint is warranted",
      "example": "Optional — one natural sentence in the target language; omit if the definition already shows how to use it",
      "mental_model": "Optional — a comparison that makes the usage click; omit if the definition is already intuitive",
      "discussion": "Optional — in practice: register, collocation, when you'd actually say it, common learner misuse",
      "anti_example": "Optional — a near-miss: false friend, wrong construction, or lookalike learners mix it with",
      "controversy": "Optional — debated: only when speakers, regions, or teachers genuinely disagree on form, meaning, or correctness"
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
- `category` is a browse label, not a learning field — pick whatever helps filter the list later (typical buckets: Verb, Noun, Adjective, Adverb, Particle, Phrase, Idiom, Grammar, Pronoun, Register, Number, Connector). Write category labels in the learner language when immersion is on.
- **`definition` is meaning or function, then pronunciation only if that mode requires it:** what the item IS or DOES, in the learner language. Do not put conjugation tables, full usage guides, dialect essays, or “don't confuse with X” in the definition — those belong in other fields.
  - Never start a definition with "refers to", "is defined as", "can be described as", or the term restated as its own subject (e.g. "`Quedar` is a verb that…"). Open with the substance.
  - Never start by announcing that the item is a word (or a simple/common/small word). Ban openers like "This word…", "This simple word…", "This common word…", "A simple word for…", "You use this word…", "This word means…", "This is when…", and the same in any learner language ("Dit woord…", "Dit simpele woord…", "Dit gewone woord…", "Een eenvoudig woord voor…", "Je gebruikt dit woord…", "Dit woord betekent…", "Dit is wanneer…"). The `term` field already names the item — the definition starts with what it means or does. Do not spend the first clause calling it a noun/verb/adjective either unless that part-of-speech fact *is* the point (rare).
  - Under beginner scaffolding, those formulaic openers stay banned; keep definitions to 1–2 short sentences.
  - Don't repeat the same sentence structure or opening word across terms — that repetition makes a whole glossary read robotic.
  - Don't explain the target language with unexplained extra target-language jargon. If a short everyday comparison in the learner language helps the idea click, use one. Under immersion, never reach for an L1 equivalent — see **Immersion**.
  - Keep sentences short and concrete. If a definition needs two clauses, split it — don't chain qualifiers into one long sentence. Under beginner scaffolding: 1–2 short sentences; one clause per sentence wherever possible.
  - For grammar constructions, state the job (what it marks or lets you say), not a mini-lesson.
  - Apply **Pronunciation** above. Pronounce the whole phrase when `term` is a phrase. For a named construction, pronounce the construction's usual spoken name in the target language.
- `example`, `mental_model`, `discussion`, `anti_example`, and `controversy` are all optional. Omit each one individually when it wouldn't add real value — empty optional fields mean "not needed," not TODO. Do not fill every field on every term.
- **`example`:** add when the definition alone wouldn't let someone say or recognize the item. Prefer **one natural sentence in the target language**. A short learner-language gloss after an em dash or in parentheses is fine when the sentence wouldn't be obvious — **except under immersion: no gloss in another language**. Don't turn the example into a parallel-text paragraph. Skip toy drill sentences (`The cat is on the table`) unless the slice is literally that beginner set. Under beginner scaffolding, the sentence must be one clear everyday scene (people, places, objects a beginner already has vocabulary for).
- **`mental_model`:** add when a comparison would make the item click faster than the definition alone — mapping onto a learner-language habit, a physical picture, or "think of it as the knob that does X" / "Denk aan...". Skip it when the gloss is already obvious (`agua` → water) unless immersion forbids that L1 gloss and a tiny comparison still helps. Under beginner scaffolding: simple comparison in short sentences, not a restatement of the definition in fancier words.
- **`discussion`:** register (who you'd say this to), collocation, regional default, or the learner pitfall that isn't a different term — usage nuance that isn't obvious from definition and example. Do not restate the definition. When included, make it actionable — not a dump of every conjugation or a travel-blog aside. Under beginner scaffolding, keep it as short and clause-simple as the definition; omit if it would need hedging or B2+ discourse.
- **`anti_example`:** only when there's a real near-miss — false friend, calque, the other word in a famous pair, or the construction learners produce instead. Skip when there's no genuine risk of confusion. Under immersion, describe the near-miss in the target language with no L1 name-dropping unless that L1 word *is* the false friend and immersion is off.
- **`controversy`:** when beginner scaffolding is **off**: before finalizing, scan the full term list once specifically looking for items where speakers, regions, or reputable teachers genuinely dispute form, meaning, politeness, or "correctness" — not "beginners overuse this," not "this word has two senses." Expect this to be rare, but confirm that by checking each term against the trigger, not by skipping the field by default. Most terms should NOT have this field, but "most" is not "none" — a glossary that comes out with zero `controversy` fields is a sign the scan wasn't done (languages are full of dialect and prescription fights; some lists will still honestly have none). When beginner scaffolding is **on**: omit the field, or one flat short sentence with no hedging or comparative clauses — do not run the "zero controversy = failed scan" check.
- **`relationships`:** the array as a whole is optional. Add a relationship when two terms have any real connection worth naming — prerequisite of, subtype of, contrasts with, synonym of, depends on, builds on, often confused with, etc. Most terms won't need one, and that's expected. `relationship_type` should read naturally in a sentence; don't default to "often confused with" for every pair — pick whichever type actually describes the connection. `source`/`target` must match term names exactly. Cap: 100. Under immersion, write `relationship_type` and `description` in the target language.
  - Cross-check against `anti_example`: if a relationship is "often confused with" (or similar near-miss framing), at least one of the two terms' own `anti_example` should capture that same confusion. Don't let a relationship name a mix-up that neither term's entry reflects.
- A term is complete when someone could use or recognize it correctly in conversation — not when every optional field is filled.
- **Consistency at scale:** apply the same per-term optional-field evaluation to the last term on the list that you applied to the first. On longer runs it's easy to get more careful early and coast on bare `term`/`category`/`definition`/`example` toward the end — that's a rigor drop, not a judgment call, and it should not happen. For runs over ~30 terms, treat it as a sanity check that roughly a quarter to a third of terms end up with at least one optional field beyond `example`; if the back half of the list is noticeably sparser than the front half with no substantive reason, that's a signal to re-pass it, not ship it.
  - For **count** over 40, draft in batches of roughly 20 terms and re-apply the full optional-field evaluation (including the `controversy` scan when beginner scaffolding is off) within each batch, rather than doing one evaluation pass at the very end. This keeps rigor even across the list instead of front-loading it.
- **`category` consistency:** reuse the same category label verbatim across terms that belong to the same group (always "Verb", never a mix of "Verb" and "Verbs" in one glossary). Near-duplicate category strings fragment the filter view in Jargon Gym.
- **No duplicate relationships:** don't add both directions of the same pair (A→B and B→A) as separate relationships, and don't add more than one relationship entry for the same source/target pair.

## Tone

- Write like a sharp tutor (or a native friend) explaining an item to a smart adult over messages — not like a textbook, a phrasebook, or a CEFR checklist. Under beginner scaffolding, still be a tutor, but with the sentence/vocab limits in **Beginner scaffolding**.
- Be direct and slightly opinionated — say how people actually talk, including the annoying caveat, instead of staying textbook-neutral. Under beginner scaffolding, drop opinionated hedging if it needs contrastive clauses; prefer one plain caveat sentence or omit.
- Prefer plain words in the learner language (`use` not `utilize`).
- Ban AI-cliché filler entirely: "it's important to note", "in today's fast-paced world", "leverage", "utilize", "robust", "seamless", "delve into", "unlock", "game-changer", "cutting-edge".
- Ground examples in one concrete, realistic thing someone would actually say — café, transit, work chat, family, not "Object A meets Object B."

## Selection

- Include up to **count** must-know items for **domain** (default 10; max 100). **100 is the ceiling, not a target.** Only include items a learner absolutely must know to follow or join a conversation in this slice — high-frequency words, phrases, and constructions that come up constantly.
- Skip rare, literary-only, exam-trivia, or "nice to know" items, even if they're technically in the language. If unsure whether an item is common enough for this slice, leave it out. Prefer fewer terms over padding with weaker ones just to approach **count** or the cap.
- For a bare language name (`Spanish`), prefer a balanced core: greetings and politeness only if they're truly load-bearing; then high-frequency verbs, connectors, and a few constructions — not 10 nouns for furniture.
- Apply the **Hard rule — exclusions** before finalizing the list; re-check the finished `terms[]` against `exclude` and drop any accidental hits.
- Term names must be unique within the import.
- Write for someone learning the language, not for linguists skimming glosses.

## Example (valid format, domain: Spanish, count: 3)

Default modes for this sample: learner=English, pronunciation=ipa, beginner scaffolding off (so IPA and a controversy field are allowed). Under `Dutch | immersion | level: A2–B1 | pronunciation: none`, every learner-facing string would be simple Dutch, IPA would be absent, and `controversy` would be omitted or one flat sentence.

```json
{
  "domain": "Spanish",
  "description": "Core items for following everyday conversation in broadly Latin American Spanish.",
  "terms": [
    {
      "term": "quedar",
      "category": "Verb",
      "definition": "A Swiss-army verb whose job depends on the construction: remain, fit, arrange to meet, or suit — the grammar around it picks the sense. /keˈðaɾ/",
      "example": "¿Quedamos a las ocho frente al metro? — Shall we meet at eight in front of the metro?",
      "mental_model": "Think of it as 'end up in a state / arrangement,' then let the sentence tell you which state.",
      "discussion": "Learners often freeze because dictionaries list many senses. In conversation, 'quedamos + time/place' (meet up) and 'me queda + adjective' (fits / looks on me) cover a huge share of real use.",
      "anti_example": "Not a drop-in for English 'stay' as in remaining overnight — that's usually 'quedarse' or 'hospedarse,' not bare 'quedar.'"
    },
    {
      "term": "usted",
      "category": "Pronoun",
      "definition": "The grammatically third-person form you use to address someone with distance or respect, instead of intimate 'tú' (or 'vos' where that's the informal norm). /usˈteð/",
      "example": "¿Usted me puede ayudar con esta maleta?",
      "discussion": "In much of Latin America, service encounters and first meetings default here longer than many Spain-taught courses imply. Matching the other person's choice matters more than a textbook rule.",
      "controversy": "How fast you switch to 'tú,' and whether 'usted' even sounds cold among younger speakers, varies hard by country and class — teachers from Spain vs Colombia will give you conflicting defaults."
    },
    {
      "term": "ser",
      "category": "Verb",
      "definition": "The 'be' used for identity, origin, time of the clock, and qualities you treat as the thing's character rather than its mood-of-the-moment. /seɾ/",
      "example": "Soy ingeniera; la reunión es a las tres.",
      "anti_example": "Feelings, location of people/things, and temporary states are 'estar' territory — 'estoy cansada,' not 'soy cansada.'"
    }
  ],
  "relationships": [
    {
      "source": "ser",
      "target": "usted",
      "relationship_type": "builds on",
      "description": "Usted takes third-person agreement, so 'usted es' / 'usted está' — the ser/estar choice still applies."
    }
  ]
}
```

(If the list also includes `estar`, add `ser` → `estar` as `often confused with` and put the same mix-up in at least one `anti_example`.)

## Done when

Before responding, walk through the checklist below against the drafted JSON — don't treat it as background spec, actually verify each line.

- Input parsed (domain valid; count defaulted to 10 if omitted; exclude list applied; learner / level / immersion / pronunciation resolved) — or rejection already returned.
- Success response is only the JSON object matching the structure above.
- `terms.length` is ≤ **count**, and equals **count** when enough must-know terms remain after exclusions — never pad with niche or weak terms.
- No term (nor synonym/inflection/near-duplicate) from **exclude** appears in `terms[]` or as a relationship endpoint.
- Terms are unique; every relationship `source`/`target` resolves to a term name in this glossary; `relationships.length` ≤ 100.
- Each included term is usable or recognizable in conversation; optional fields omitted when they add no value; relationships only where a real connection is worth naming.
- Definitions are in the learner language; `term` and `example` sentences are in the target language. No definition starts with meta padding ("this word", "this simple word", "dit woord", part-of-speech throat-clearing, "refers to", "you use this word").
- Pronunciation matches the resolved mode: IPA at end of every `definition` iff `ipa`; spoken hint only if `spoken` and useful; nothing phonetic iff `none`.
- If immersion: no L1 words, glosses, or translations in any field.
- If beginner scaffolding: short simple sentences; no subordinate-clause chains, idioms, or rare explaining-vocab; definitions 1–2 sentences without banned openers; examples/mental models concrete; controversy omitted or one flat sentence; consistency check read-aloud as if to an A2–B1 learner passed.
