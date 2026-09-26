---
name: language-gym-generator
description: Generate a language-learning glossary as JSON for a language or slice the user names. Use when the user asks for vocabulary, phrases, grammar constructions, or a term list to learn a language (e.g. "make me a Spanish glossary", "French A2 restaurant vocab", "German modal particles"). Same import shape as jargon-gym-generator; not a conversational tutor (that is language-learning) and not for reviewing existing glossary JSON (pair with jargon-gym-review or a language-gym-review sibling).
argument-hint: "[language or slice] | [count=10] | [exclude: term, ...] | [learner=English] | [level] | [immersion] | [pronunciation=ipa|spoken|none] | [terms_to_generate: term, ...] | [meaning_in=language]"
---

## Input

`$ARGUMENTS` carries positional parts first, then optional named flags. Parse in order (whitespace- and `|`-flexible):

1. **domain** (required) — language, optionally plus a slice (e.g. `Spanish`, `Spanish A2`, `French restaurants`, `German modal particles`, `Japanese keigo`)
2. **count** (optional) — how many terms to generate; default **10** when omitted or blank. 1–100 runs straight through; a larger number needs one confirmation first (see **Counts above 100**). Ignored completely when **terms_to_generate** is set: it is not a length target, the default of 10 does not apply, and do not pad up to it or trim the list down to it.
3. **exclude** (optional) — preexisting items, or terms that must not appear in `terms[]` (comma-separated; optional `exclude:` prefix)

Named flags (anywhere in `$ARGUMENTS` or the surrounding message):

4. **learner** — language of definitions, mental models, discussion, controversy, and any gloss except the **meaning_in** gloss in `note`. Tokens: `learner=Dutch`, `learner: French`, or a bare language name after the positional parts. Default **English**. `learner=target` (or learner language = the domain's language) is immersion.
5. **level** — CEFR band or plain label (`A2`, `A2–B1`, `beginner`, `B2`). Also honor a level already in **domain** (`French A2`). Default when omitted: core high-frequency items a motivated beginner-to-intermediate learner must know for that slice — treat that default as **A2–B1 scaffolding** unless the user named a higher band (`B2`, `C1`, `advanced`).
6. **immersion** — flag (`immersion`, `immersive`, `full immersion`). Forces learner language = the target language. No L1 words, glosses, or translations anywhere, except `note` when **meaning_in** is set.
7. **pronunciation** — `ipa` | `spoken` | `none`. Default **`ipa`**, except when **beginner scaffolding** is on, default **`none`**. `spoken` = a simple spoken-style hint only if genuinely useful (e.g. `zeg: ge-ZEL-lig`); don't default to including it.
8. **terms_to_generate** — the exact terms to write. Named flag only, so a bare third positional stays **exclude**. Tokens: `terms_to_generate: quedar, usted, ser` or `terms_to_generate=quedar, usted`. Split on commas, trim each token, and drop empties (`a,, b` is `a` and `b`). Spaces inside a token stay (`il y a`, `estar + gerundio`). When this flag is present, **count is ignored** (including the default of 10 and **Counts above 100**). `terms[]` is exactly this list: one entry per name, the user's spelling and order, trimmed only. Nothing else is generated.
9. **meaning_in** — language of a short gloss in each term's `note`. Tokens: `meaning_in=Persian` or `meaning_in: Dutch`. When absent, omit `note` on every term. When present, every term's `note` is only that gloss.

Examples of valid `$ARGUMENTS`:
- `Spanish`
- `Spanish 25`
- `French A2 | 15`
- `Dutch | 10 | immersion | level: A2–B1 | pronunciation: none`
- `German modal particles | 10 | doch, mal`
- `Japanese | 20 | exclude: こんにちは, ありがとう | learner=English | level=B2 | pronunciation=ipa`
- `Spanish | terms_to_generate: quedar, usted, ser | learner=English | meaning_in=Persian`
- `French | terms_to_generate: il y a, estar + gerundio`

When the user states count, exclusions, **learner language**, **target dialect**, **level**, **immersion**, **pronunciation**, **terms_to_generate**, or **meaning_in** in the surrounding message, honor those the same way. Missing count → **10**, unless **terms_to_generate** is set, in which case count is unused. Missing exclude → empty ban list. Missing learner language → **English** (unless **immersion**). Missing dialect → the widely taught default for that language (name it in `description`). Missing level → A2–B1 scaffolding as above. Missing **terms_to_generate** → select terms as usual. Missing **meaning_in** → omit `note`.

If the user asks for “all” / “full” / “complete” vocabulary, a CEFR wordlist, a textbook index, or any unbounded dump without naming a number, treat **count as 100** and run the **Selection procedure**. Do not emit an open-ended lexicon. **terms_to_generate** beats this path: if both appear, the list is the glossary, count stays ignored, and do not run the Selection procedure.

**Counts above 100.** Don't reject, and don't silently comply. Stop and say plainly what gets worse at that size: the back of the list thins out, near-duplicates creep in to reach the number, and weaker items dilute the must-know core. Ask whether to go ahead anyway or cut to 100, and generate only after an answer. Once the user confirms, honor their number — the confirmation is the gate, so don't re-litigate it later. This gate does not run when **terms_to_generate** is set. The user already named each term; generate the whole list, even past 100.

**Hard rule — exclusions:** Every name in `exclude` is banned from the output.
- No `terms[].term` may match an excluded name (case-insensitive; ignore accent/script differences that are the same lemma, e.g. `Que` excludes `qué` when they are the same item).
- No synonym, abbreviation, inflected form presented as a separate entry, romanization, or near-duplicate of an excluded term either (if `ser` is excluded, omit `soy` / `eres` as standalone term names when they are just conjugations of the same lemma).
- `relationships[].source` / `target` may only reference terms that appear in this glossary’s `terms[]` — never an excluded name.
- If exclusions shrink the must-know pool below `count`, return fewer terms — never pad with banned or weak terms.

When **terms_to_generate** is set, emit every listed string. The synonym, inflection, and near-duplicate ban does not delete a listed name (`exclude: ser` does not drop listed `soy`). A listed name that is also in `exclude` under the same case-insensitive accent/script folding is a reject before generation — exact overlap only, not `soy` versus `ser`. Do not backfill, and do not return fewer terms because exclusions shrank a pool. Length is the list. `relationships[].source` / `target` may only use those listed spellings exactly.

Reject — reply briefly with the expected argument shape and 1–2 examples, then stop — when:
- **domain** is missing, empty, a full sentence/instruction/prompt, pasted JSON/glossary/file path, or not a language / language+slice
- **count** is present but not a positive integer. When **terms_to_generate** is set, a valid count is ignored for length; a non-integer count is still a reject.
- **pronunciation** is present but not one of `ipa`, `spoken`, `none`
- **terms_to_generate** is present but nothing remains after trim, or the list contains a duplicate name under the same folding as exclusions (do not silently dedupe)
- **meaning_in** is present but has no language
- a **terms_to_generate** name is also in **exclude** under that same folding

If the user already has glossary JSON and wants it checked, review it instead of generating. If they want a live lesson, drills, or conversation practice, that is a tutor skill — this skill only emits import JSON.

## Modes (conditional)

Apply the matching blocks. Unmentioned modes stay off.

**Beginner scaffolding** is on when **level** is A1, A2, B1, `A2–B1`, `beginner`, `lower-intermediate`, or the omitted default. Off when the user named B2, C1, C2, or `advanced`.

**Immersion** is on when the **immersion** flag is set, or **learner** is `target` / the same language as **domain**.

### Immersion — target language only

When immersion is on:

- Full immersion. All content (definitions, examples, mental models, discussion, controversy, relationship descriptions) must be written entirely in the target language. No English words, glosses, or translations anywhere, even to clarify an abstract term. (If the target is Dutch: Dutch only — same rule.) The only exception is `note` when **meaning_in** is set: that field is the short gloss in the **meaning_in** language, and no other field may carry it.
- Explain advanced terms in simple target language — never punt to English (or any other L1). If a term is inherently abstract or hard to flatten (e.g. an emotion word like "gezellig"), don't reach for an English equivalent. Instead:
  - Use a concrete everyday scene instead of an abstract paraphrase.
  - Use a short comparison ("mental model") in plain target language rather than an abstract noun.
  - It's fine if the explanation is slightly imprecise as long as it stays fully in simple target language — precision is secondary to comprehensibility at this level.
  - If a field still won't work in simple target language, **omit that field**. Omitting is the correct move; an L1 gloss is not. This matters most for `mental_model`, where naming the L1 equivalent ("think of English 'there is'", "denk aan het Engelse '-ing'") is the tempting shortcut — leave it out instead. Do not use this omit rule on `note` when **meaning_in** is set: that gloss stays.

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
- Definitions stay short: 1–2 short sentences (plus pronunciation only if that mode requires it). Lead with the plainest statement of meaning, then at most one clarifying sentence. The opener rules in **Field rules** apply here unchanged.
- Examples and mental models must stay concrete.
  - Examples should describe one clear, everyday scene (people, places, objects a beginner already has vocabulary for) rather than an abstract statement.
  - Mental models should use a simple comparison ("Denk aan..." / "Think of...") in short sentences, not a restatement of the definition in fancier words.
- Drop or drastically simplify debate-register fields. Fields like controversy naturally use hedging and opinion-comparison language ("Veel mensen zeggen dat... anderen denken..."), which is B2+ discourse. Either:
  - Omit the field entirely, or
  - Reduce it to one flat, short sentence with no hedging or comparative clauses.
  - This overrides the usual "a glossary with zero controversy means the scan wasn't done" check: at A2–B1, omit is the correct default.
- Consistency check before finalizing: read every field aloud as if speaking to an A2–B1 learner. If any sentence needs a subordinate clause, an idiom, or a word the learner hasn't seen yet to be understood, rewrite it — don't explain it away in English (or any L1, when immersion is on). Do not rewrite a **meaning_in** gloss in `note` to meet these sentence limits.

### Pronunciation

The resolved mode comes from **Input**: `ipa` by default, but `none` whenever beginner scaffolding is on and the user didn't ask for pronunciation. Check which one is live before adding anything phonetic.

- **`ipa`:** after the meaning, end `definition` with IPA in slashes for the `term` as written. Match the dialect named in `description`. No extra sentence ("Pronounced…"); just a space (or a sentence-final period, then a space) and `/…/`. Example: `…the grammar around it picks the sense. /keˈðaɾ/`
- **`spoken`:** IPA transcriptions aren't beginner scaffolding. Replace with a simple spoken-style hint (e.g. "zeg: ge-ZEL-lig") only if genuinely useful — don't default to including it. Put it at the end of `definition` the same way IPA would go.
- **`none`:** no phonetic/IPA notation anywhere. Don't put pronunciation in `term`, `example`, or other fields either.

Don't put IPA in `term`, `example`, `note`, or other fields to "also cover" pronunciation — it lives at the end of `definition` only, and only when **pronunciation** is `ipa` or a spoken hint was actually warranted.

## What a term is

Keep the same JSON keys as Jargon Gym. A `term` is **one thing the learner must be able to use or recognize** in the named slice — not a textbook chapter, not a contents-page heading, not a metalanguage label.

**Fixed term list.** When **terms_to_generate** is set, each listed string is `term` as written (trimmed only). Do not rewrite, split, merge, inflect, or re-cite it. The spoken-form test, citation consistency, framed-function-word rewrite, and one-pattern-one-entry merge below do not change `term`. Put framing or citation teaching in `definition` or `discussion` if it is still useful. Unit lock still applies: every field teaches the job of that string. The rest of this section applies only when **terms_to_generate** is absent.

**Spoken-form test (hard):** `term` must be a string the learner will **say, hear, or read as language**, or a **productive pattern with a slot** written in the target language (`estar + gerundio`, `avoir/être + participe passé`, `〜てしまう`). If the English gloss of the term is a pedagogy heading — inversion, the comparative, the diminutive, separable verbs, subordinate clause, adjective agreement, “the perfect tense” as a title — it is **not** a term unless **domain** is explicitly that grammar slice (or linguistics). Rewrite it as the form used in speech, or drop it.

Pick the mix from the domain, in this order of preference:

1. **Word or fixed phrase** in the target language — the default for a language or usage slice (`la cuenta`, `en plus`, `doch`, `お疲れ様です`)
2. **Pattern-as-unit** when the item is used as a construction (`estar + gerundio`, `ser`, `〜てしまう`). A school name (`passé composé`) is allowed only when the domain is a grammar slice; on a conversation/language slice prefer the pattern speakers produce.
3. **Learner-facing contrast label** only when the contrast *is* the thing people study (`ser vs estar` is two terms plus a relationship, not one mega-term — unless the domain is explicitly the contrast)

Do not mix professional jargon-of-linguistics as the main list (`allophone`, `clitic climbing`) unless the domain is linguistics. Write for someone learning to speak and understand, not for a syntax seminar. Do not use the target language’s classroom names for chapters as `term` either (`inversie`, `la proposition subordonnée`, `el pretérito` as a heading) on a non-grammar slice — same ban, any language.

Write `term` as learners actually meet it: dictionary lemma or the frozen phrase, in the target script. Do not make separate terms for routine inflections of the same lemma.

**Citation consistency:** pick **one** noun citation convention for the whole glossary (bare lemma, or lemma plus article/classifier if that is the language’s normal dictionary form) and apply it to every noun. Do not prefix a random subset with an article to sneak gender/class teaching.

**Framed function words:** if a short function word does several unrelated jobs at this level, `term` must identify **one** job (`il y a`, `there is/are`, `se` + impersonal) or split into separate terms. A bare particle/pronoun/preposition as the whole `term` is allowed only when that form has essentially one load-bearing job in this slice. Put related jobs in `discussion` or a second term plus a relationship — do not emit an unframed stub.

**One pattern, one entry:** if several drafted entries would carry essentially the same definition, they are instances of one pattern — merge them into the pattern and show the variants in `example`. Three near-identical cards for the same slot-filling is padding, not coverage.

## Task

After valid input is accepted, generate a glossary JSON for **domain** for paste into Jargon Gym. When **terms_to_generate** is set, the target length is that list and **count** is unused. Otherwise the target length is **count**, minus hard exclusions.

**Success output:** respond with only the final JSON object — no markdown fences, no preamble, no explanation. Rejection replies above are the exception.

The field shape below is this skill's import contract for Jargon Gym. If the user states different fields, follow theirs. When **terms_to_generate** is set, term count is the length of that list and **count** is unused, including past 100. Otherwise term count follows **count** (default 10; past 100 only after the user confirmed). Relationships: at most 100. `source` and `target` must match `term` spellings exactly; on a fixed list those are the listed strings.

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
      "controversy": "Optional — debated: only when speakers, regions, or teachers genuinely disagree on form, meaning, or correctness",
      "note": "Only when meaning_in is set — a short gloss of this term's job in that language; omit the field otherwise"
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
- **Don't lean on words you didn't teach.** A word carrying the weight of a `definition`, `anti_example`, or relationship description should either be a term in this glossary or be understandable without one. If the explanation only works once the learner knows some other item, teach that item or rewrite the explanation. When **terms_to_generate** is set, do not add a term to satisfy this rule — rewrite the sentence in the learner language or omit the field.
- **Unit lock (hard):** every field on an entry is about the **same spoken unit** named in `term`. Do not pick a good `term` and then write a grammar-chapter `definition`, a different-sense `example`, or a `mental_model` that names the lesson instead of the job. If `term` is `omdat` / `porque` / `because` as a connector, the fields teach that connector — not “the subordinate clause.”
- `category` is a browse label, not a learning field and not a measure of the glossary's mix — pick whatever helps filter the list later (typical buckets: Verb, Noun, Adjective, Adverb, Particle, Phrase, Idiom, Grammar, Pronoun, Register, Number, Connector). Write category labels in the learner language when immersion is on. Use **Grammar** only for a real construction/pattern on a grammar slice — not as a bucket for classroom headings.
- **`definition` is meaning or function, then pronunciation only if that mode requires it:** what the item IS or DOES, in the learner language. Do not put conjugation tables, full usage guides, dialect essays, or “don't confuse with X” in the definition — those belong in other fields.
  - Open with the substance. Never restate the term as its own subject — not "`Quedar` is a verb that…", and not the same shape carrying the target language's article ("De man is een volwassen persoon…", "Le train est un véhicule…"). Never open by announcing the item is a word ("this word…", "a simple word for…", "you use this word…", "dit woord…", the same formula in any learner language), with "refers to" / "is defined as", or by naming the part of speech unless that fact *is* the point (rare).
  - **No template per category.** Cap any opening word at roughly three entries across the whole glossary, and never use it twice in a row. If every noun, or every question word, or every adjective opens the same way, that is a template — rewrite them, even though each sentence is fine on its own.
  - Don't explain the target language with unexplained extra target-language jargon. If a short everyday comparison in the learner language helps the idea click, use one. Under immersion, never reach for an L1 equivalent — see **Immersion**.
  - Keep sentences short and concrete. If a definition needs two clauses, split it — don't chain qualifiers into one long sentence. Under beginner scaffolding: 1–2 short sentences; one clause per sentence wherever possible.
  - For a **pattern-as-unit**, define the job of the pattern (what it lets you mark or say), not a mini-lesson and not the school-book name. For a **framed function word**, define **only the framed job**. Other jobs go in `discussion` or a second term. When **terms_to_generate** is set, other jobs stay in `discussion` — do not add the second term.
  - Do not use a classroom heading as the meaning (“this is inversion,” “introduces a subordinate clause,” “the comparative,” or the same idea in any learner language). Name the job in ordinary words: reason, contrast, completed event, extra emphasis, polite distance.
  - Apply **Pronunciation** above. Pronounce the whole phrase when `term` is a phrase. For a pattern with a slot, transcribe one filled form of it or omit the pronunciation entirely — never just the fixed fragment, and never an L1 grammar label.
- `example`, `mental_model`, `discussion`, `anti_example`, `controversy`, and `note` are all optional. Omit each one individually when it wouldn't add real value — empty optional fields mean "not needed," not TODO. Do not fill every field on every term.
- **`note`:** not a freeform field in this skill. When **meaning_in** is absent, omit `note` on every term. Do not invent another use for it. When **meaning_in** is set, every term gets `note`, and that field is only a short gloss of this term's framed job in that language — a word or short phrase, not a second copy of `definition`, not an example sentence, not pronunciation, and not a second lesson. `definition` stays in the learner language. This gloss is the one exception to "not a second definition." Beginner-scaffolding sentence limits do not rewrite it. It does not count toward the "quarter to a third of terms have an optional field beyond `example`" check below.
- **`example`:** add when the definition alone wouldn't let someone say or recognize the item. Prefer **one natural sentence in the target language**. A short learner-language gloss after an em dash or in parentheses is fine when the sentence wouldn't be obvious — **except under immersion: no gloss in another language**. Don't turn the example into a parallel-text paragraph. Skip toy drill sentences (`The cat is on the table`) unless the slice is literally that beginner set. Under beginner scaffolding, the sentence must be one clear everyday scene (people, places, objects a beginner already has vocabulary for).
  - The example must **instantiate this `term`’s job**. If `term` is a pattern, fill every slot in one sentence. If `term` is a framed particle, show that job — not a different sense of the same spelling.
- **`mental_model`:** add when a comparison would make the item click faster than the definition alone — mapping onto a learner-language habit, a physical picture, or "think of it as the knob that does X" / "Denk aan...". Skip it when the gloss is already obvious (`agua` → water) unless immersion forbids that L1 gloss and a tiny comparison still helps. Under beginner scaffolding: simple comparison in short sentences, not a restatement of the definition in fancier words. Do not analogize to a textbook chapter name.
- **`discussion`:** register (who you'd say this to), collocation, regional default, or the learner pitfall that isn't a different term — usage nuance that isn't obvious from definition and example. Do not restate the definition. When included, make it actionable — not a dump of every conjugation or a travel-blog aside. Under beginner scaffolding, keep it as short and clause-simple as the definition; omit if it would need hedging or B2+ discourse. Extra senses of a framed word belong here (briefly) or as separate terms — not piled into `definition`. When **terms_to_generate** is set, keep extra senses in `discussion`; do not add a separate term.
- **`anti_example`:** only when there's a real near-miss — false friend, calque, the other word in a famous pair, the other job of the same spelling, or the construction learners produce instead. Skip when there's no genuine risk of confusion. Under immersion, describe the near-miss in the target language with no L1 name-dropping unless that L1 word *is* the false friend and immersion is off. Framed function words, copula/auxiliary pairs, and lookalike connectors should usually get one — this is where “wrong job / wrong twin” lives, not in `definition`.
- **`controversy`:** when beginner scaffolding is **off**: before finalizing, scan the full term list once specifically looking for items where speakers, regions, or reputable teachers genuinely dispute form, meaning, politeness, or "correctness" — not "beginners overuse this," not "this word has two senses." Expect this to be rare, but confirm that by checking each term against the trigger, not by skipping the field by default. Most terms should NOT have this field, but "most" is not "none" — a glossary that comes out with zero `controversy` fields is a sign the scan wasn't done (languages are full of dialect and prescription fights; some lists will still honestly have none). When beginner scaffolding is **on**: omit the field, or one flat short sentence with no hedging or comparative clauses — do not run the "zero controversy = failed scan" check.
- **`relationships`:** the array as a whole is optional. Add a relationship when two terms have any real connection worth naming — prerequisite of, subtype of, contrasts with, synonym of, depends on, builds on, often confused with, etc. Conventional pairs (this vs that, want vs can, arrive vs leave) should be one relationship, not a third near-duplicate lemma. When **terms_to_generate** is set, do not add that lemma — link only names already on the list, using those spellings exactly. Most terms won't need one, and that's expected. `relationship_type` should read naturally in a sentence, and no single type may cover more than half the array — if one label fits everything, you're labelling rather than connecting. Skip pairs whose definitions already carry the link: when one definition says "the negative form of X", a `contrasts with` edge adds nothing. `source`/`target` must match term names exactly. Cap: 100. Under immersion, write `relationship_type` and `description` in the target language.
  - Cross-check against `anti_example`: if a relationship is "often confused with" (or similar near-miss framing), at least one of the two terms' own `anti_example` should capture that same confusion. Don't let a relationship name a mix-up that neither term's entry reflects.
- A term is complete when someone could use or recognize it correctly in conversation — not when every optional field is filled.
- **Don't group `terms[]` by category.** Interleave them, so verbs, constructions, connectors, phrases and nouns alternate down the list. A long contiguous run of one category concentrates every later shortcut in one place and invites filling that block to a round number. When **terms_to_generate** is set, do not interleave or otherwise reorder `terms[]` — keep the user's order.
- **Consistency at scale:** apply the same per-term optional-field evaluation to the last term on the list that you applied to the first. On longer runs it's easy to get more careful early and coast on bare `term`/`category`/`definition`/`example` toward the end — that's a rigor drop, not a judgment call, and it should not happen. For runs over ~30 terms, treat it as a sanity check that roughly a quarter to a third of terms end up with at least one optional field beyond `example`; if the back half of the list is noticeably sparser than the front half with no substantive reason, that's a signal to re-pass it, not ship it.
  - For **count** over 40, settle the whole `terms[]` name list first (Selection procedure steps 1–5), then write the fields in passes of roughly 20, re-applying the full optional-field evaluation (including the `controversy` scan when beginner scaffolding is off) within each pass rather than one pass at the very end. This keeps rigor even across the list instead of front-loading it. When **terms_to_generate** is set, do not settle names with Selection steps 1–5. If that list is longer than about 40, still write the fields in passes of roughly 20 over those fixed names only. A **meaning_in** `note` does not satisfy the quarter-to-a-third check.
  - These passes are a **field-writing** device only. Selection, shape, and closed sets are properties of the whole glossary, judged once on the full name list — never per pass. A pass of 20 is not required to cover the jobs, hit the noun ratio, or complete a paradigm on its own.
- **`category` consistency:** reuse the same category label verbatim across terms that belong to the same group (always "Verb", never a mix of "Verb" and "Verbs" in one glossary). Near-duplicate category strings fragment the filter view in Jargon Gym.
- **No duplicate relationships:** don't add both directions of the same pair (A→B and B→A) as separate relationships, and don't add more than one relationship entry for the same source/target pair.

## Tone

- Write like a sharp tutor (or a native friend) explaining an item to a smart adult over messages — not like a textbook, a phrasebook, or a CEFR checklist. Under beginner scaffolding, still be a tutor, but with the sentence/vocab limits in **Beginner scaffolding**.
- Be direct and slightly opinionated — say how people actually talk, including the annoying caveat, instead of staying textbook-neutral. Under beginner scaffolding, drop opinionated hedging if it needs contrastive clauses; prefer one plain caveat sentence or omit.
- Prefer plain words in the learner language (`use` not `utilize`).
- Ban AI-cliché filler entirely: "it's important to note", "in today's fast-paced world", "leverage", "utilize", "robust", "seamless", "delve into", "unlock", "game-changer", "cutting-edge".
- Ground examples in one concrete, realistic thing someone would actually say — café, transit, work chat, family, not "Object A meets Object B."

## Selection

When **terms_to_generate** is set, skip this section, including the procedure below, closed sets, the shape check, and the cut order. The user already chose the terms. **Count is ignored completely:** do not pad up to count or the default of 10, do not trim the list because count is smaller, and do not treat any ceiling here as a target. `Spanish | 25 | terms_to_generate: quedar, usted` emits exactly `quedar` and `usted`. The bullets and procedure below apply only when **terms_to_generate** is absent.

- Include up to **count** must-know items for **domain** (default 10; past 100 only after the user confirmed). Only include items a learner absolutely must know to follow or join a conversation in this slice — high-frequency words, phrases, and constructions that come up constantly.
- **Every number here is a ceiling, not a target.** Landing exactly on one — the term count, the noun share in step 5, the relationship cap — is evidence you filled to the line instead of earning each slot. Cut.
- Skip rare, literary-only, exam-trivia, or "nice to know" items, even if they're technically in the language. If unsure whether an item is common enough for this slice, leave it out. Prefer fewer terms over padding with weaker ones just to approach **count** or the cap.
- Apply the **Hard rule — exclusions** before finalizing the list; re-check the finished `terms[]` against `exclude` and drop any accidental hits.
- Term names must be unique within the import.
- Write for someone learning the language, not for linguists skimming glosses.

### Selection procedure (do this in order; do not alphabetize a textbook index)

Skip this procedure entirely when **terms_to_generate** is set. It chooses terms; the user already chose them. Do not fill to count, expand closed sets, run the shape check, or cut the list.

This procedure is language-agnostic. Instantiating it means naming **this language’s** equivalents — not copying examples from another language.

**1. Decide the job of the glossary**

- **Bare language** (`Spanish`, `Dutch A2`, `Japanese`): conversation core at the named level.
- **Usage slice** (`French restaurants`, `German airports`): must-know for that situation only. Spine items appear only if the situation cannot work without them.
- **Grammar slice** (`Japanese keigo`, `German modal particles`, `ser vs estar`): constructions and the words that realize them. Classroom names are allowed here when learners actually study under that name.

**2. Fill in this order until `count` is met** (stop early rather than pad). This is the order you *claim slots* in, not the order entries appear in `terms[]` — the finished array is interleaved, per **Field rules**:

1. **Sentence spine** — the closed-class gear needed to parse and produce a basic sentence at this level in **this** language: how existence/identity is conjugated (copula / existence verb / equivalent), core person reference (the subject pronouns or person-marking the taught variety actually uses), negation, question formation, the core “go / come / have / want / can / must” set (or this language’s real equivalents — not a translated English list). If any of these are load-bearing at this level, they outrank every concrete noun.
2. **Unlocking constructions** — patterns that let the learner say things this level requires (progressive, perfect/completed past as used in speech, comparison as used forms, polite request, future-as-used). Write them as spoken patterns, not chapter titles.
3. **Discourse glue** — high-frequency connectors and particles **as framed units**.
4. **High-frequency verbs and state adjectives** that carry everyday talk.
5. **Frozen survival phrases** that are actually load-bearing (not a phrasebook dump of every greeting).
6. **Content nouns last**, and only if frequency in this slice earns the slot.

**3. Level is a filter, not a permission to dump everything “up through” that band**

- **A1 / beginner / omitted default:** from-zero spine, including greetings only if they are truly load-bearing.
- **A2 / A2–B1 / B1:** do **not** spend slots on A1-only **content** (elementary concrete nouns, phrasebook hellos) unless this is a usage slice that needs them or they remain a famous trap. Still include spine items that sentences at this level cannot work without — even if A1 also teaches them. Never drop the copula/existence verb to keep “sandwich” / “umbrella” / “receipt”.
- **B2+:** traps, register, and constructions that still block fluent comprehension — not a second copy of the A2 noun list.

**4. Closed sets are all-or-nothing**

If you include any member of a **small closed paradigm** that learners treat as a set, include every member that is in-scope for this level **and this variety** — or include none. Typical paradigms (instantiate per language; skip those the language does not have): subject pronouns of the taught variety; yes/no pair; weekday names; the core article/classifier set; the core copula/auxiliary/modal set you opened. Do not emit four weekdays, or `I/you/he` without this variety’s “we/they”.

If you open a **small theme** with a conventional core set (kinship at this level, urban transit modes, basic meals), fill that core or drop the theme. Random members from a set are a sampling error, not a glossary.

**5. Shape check — gear vs content**

Run this once, on the complete `terms[]` name list, before writing any fields. It is a whole-glossary property: on a long run, do not re-run it per field-writing pass or per section of the list.

Judge the mix from the `term` strings themselves. Not from JSON `category` (retagging changes nothing), not by part-of-speech percentages, and not against a topic pie — uneven themes are fine when the jobs below are covered.

On a **bare-language** glossary, verify two things:

- **The jobs are covered.** Could a learner at this level introduce themselves, negate, ask a question, say that something exists or where it is, and express want / can / must / go — using only these terms plus morphology they can infer? Instantiate each job in **this** language. A missing job beats any noun: cut content and add the missing gear.
- **Content stays the minority.** Concrete nouns (objects, foods, rooms, jobs, body parts) stay **under a quarter** of `terms[]`. The rest is gear: spine, constructions, glue, frequent verbs and state adjectives, plus the few genuinely load-bearing frozen phrases. Count a greeting stack as content — at A2+, a pile of hello / bye / good-night formulas is padding.

On a **usage slice**, replace the jobs above with that situation's must-do acts (order, pay, ask where, board). Nouns may dominate and the quarter cap is off. On a **grammar slice**, cover different jobs of the pattern rather than a side list of nouns.

All three still obey step 4 and carry zero classroom headings.

**6. Cut order when over `count`**

1. Classroom headings and linguistics labels  
2. Extra greeting/leave-taking formulas (especially at A2+)  
3. A1 content nouns (if level is A2+)  
4. Theme extras beyond the closed/core set  
5. Low-frequency content  
6. Never leave a closed set incomplete — complete it or remove every member  
7. Never cut sentence-spine items or an uncovered required job to save a noun  

**7. Final pass over the drafted list**

Re-read `terms[]` once against steps 3–5: spoken-form, consistent noun citation, framed function words, whole closed sets, jobs covered, content a minority. On a long list this is still **one** pass over the finished glossary — the field-writing passes in **Field rules** do not multiply it. Then check each entry for unit lock — `definition` gives this unit's job in ordinary words, `example` shows that same job with pattern slots filled, `discussion` doesn't smuggle a second lesson, and `anti_example` agrees with any mix-up a relationship names.

Fix a failure by cutting and backfilling from step 2, or by rewriting the offending field. Never by adding topic nouns to look balanced, and never by turning a `term` back into a chapter title.

## Example (valid format, domain: Spanish, count: 3)

Default modes for this sample: learner=English, pronunciation=ipa, beginner scaffolding off (so IPA and a controversy field are allowed), no **terms_to_generate**, no **meaning_in**. Under `Dutch | immersion | level: A2–B1 | pronunciation: none`, every learner-facing string would be simple Dutch, IPA would be absent, and `controversy` would be omitted or one flat sentence. This sample has no `note`. With `meaning_in=Persian`, each term would add `note` as a short Persian gloss of that term's job and nothing else. With `terms_to_generate: quedar, usted`, the glossary would be those two strings in that order, and `ser` would not be added to complete a pair.

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

- Input parsed (domain valid; count defaulted to 10 if omitted and **terms_to_generate** is absent; exclude list applied; learner / level / immersion / pronunciation / **terms_to_generate** / **meaning_in** resolved) — or rejection already returned. A count above 100 was confirmed with the user before generating, unless **terms_to_generate** is set, in which case count was unused and the confirmation did not run.
- Success response is only the JSON object matching the structure above.
- When **terms_to_generate** is absent: `terms.length` is ≤ **count**, and equals **count** when enough must-know terms remain after exclusions — never pad with niche or weak terms. When it is set: `terms.length` equals that list, same strings and order, and count was not used to add or drop terms.
- When **terms_to_generate** is absent: no term (nor synonym/inflection/near-duplicate) from **exclude** appears in `terms[]` or as a relationship endpoint. When it is set: every listed string is present, including a near-duplicate of an exclusion (`soy` stays if `ser` is excluded), and the only exclusion failure is the pre-generation exact-overlap reject.
- Terms are unique; every relationship `source`/`target` resolves to a term name in this glossary, and on a fixed list those names are the listed spellings; `relationships.length` ≤ 100.
- Each included term is usable or recognizable in conversation; optional fields omitted when they add no value; relationships only where a real connection is worth naming.
- When **terms_to_generate** is absent: every `term` passes the **spoken-form test**; no worksheet/chapter headings on a non-grammar slice; noun citation style is consistent; function words are framed when polysemous. When it is set: listed strings were not rewritten, split, merged, or reordered.
- **Unit lock** holds on every entry: definition, example, mental_model, discussion, and anti_example all teach the job named in `term`. On a fixed list, `note` does too when **meaning_in** is set.
- When **terms_to_generate** is absent: the selection procedure was followed (spine → constructions → glue → verbs → phrases → nouns), closed sets are whole, and the step 5 shape check passes — jobs covered, concrete nouns under a quarter on a bare-language glossary. No alphabetized textbook dump, no category blocks in `terms[]`, and no count or ratio sitting exactly on its ceiling. When it is set: those checks do not apply, and the user's order was kept.
- Definitions are in the learner language; `term` and `example` sentences are in the target language. No definition restates the term as its own subject, opens with meta padding ("this word", "dit woord", "refers to", part-of-speech throat-clearing), or repeats one category's opening word as a template.
- Pronunciation matches the resolved mode: IPA at end of every `definition` iff `ipa`; spoken hint only if `spoken` and useful; nothing phonetic iff `none`. No pronunciation in `note`.
- If **meaning_in** is set: every term's `note` is only the short gloss in that language. If it is absent: no `note` fields.
- If immersion: no L1 words, glosses, or translations in any field — fields that would need one were omitted instead. The only exception is `note` when **meaning_in** is set.
- If beginner scaffolding: short simple sentences; no subordinate-clause chains, idioms, or rare explaining-vocab; definitions 1–2 sentences without banned openers; examples/mental models concrete; controversy omitted or one flat sentence; consistency check read-aloud as if to an A2–B1 learner passed. The **meaning_in** gloss was left as a short gloss.
