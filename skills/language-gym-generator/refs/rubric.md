# Coach rubric

Used in step 7. Score each **present** field from 1 to 4, judged against the spec: this learner's language, this level, this slice. Missing optional fields aren't scored; the plan already decided they add nothing. A score of 3 or 4 means keep. A score of 1 or 2 means write a rewrite suggestion, or `drop_field` if the field shouldn't exist.

**A present field that adds nothing scores 1, however well it's written.** For example, an `example` for "la mesa" that just shows a table, or a `discussion` that restates the definition. The action is `drop_field`, not a rewrite. The same goes for a `definition` that carries an example inside it (R-FLD-18): the example part is removed, and it becomes an `example` only if that field passes its own test.

The example answers use Spanish for an English speaker at A2–B1. Apply the same standard in any language pair.

## definition

- **4**: the plainest statement of what it does, in the learner language; the learner could use the item from this alone.
  > estar → "Says where something is or how someone feels right now."
- **3**: correct and plain, but slightly abstract or a little long.
- **2**: correct but reads like a textbook, is vague, or piles up qualifiers.
  > "A verb used to express states and locations that are generally considered temporary in nature."
- **1**: wrong, restates the term, uses a classroom heading as the meaning, or depends on words that were never taught.
  > "Estar is the copula for non-essential predication."

## example

- **4**: one natural sentence someone would actually say, in a concrete everyday scene, showing *this* job (every slot of a pattern filled), within the level ceiling.
  > "¿Dónde estás? — Estoy en el bus." (Where are you? — I'm on the bus.)
- **3**: natural and on-job, but the scene is generic.
- **2**: a toy drill sentence, a stiff textbook sentence, or it shows a different meaning of the same spelling.
  > "El libro está en la mesa."
- **1**: wrong, above the level, or doesn't use the term's job at all.

## mental_model

- **4**: a comparison that makes the item click faster than the definition does, fitted to this learner's language (never an L1 word under immersion).
  > ser/estar → "ser is the label on the box; estar is a photo of it right now."
- **3**: helpful but generic.
- **2**: restates the definition in fancier words.
- **1**: misleading if taken seriously, or names a textbook chapter.

## discussion

- **4**: one actionable point the learner couldn't get from the definition and example: who you'd say it to, what it goes with, the regional default, or a common mistake.
- **3**: useful but padded.
- **2**: restates the definition, or lists inflections.
- **1**: wrong, or a travel-blog aside.

## anti_example

- **4**: a trap *this learner* will really fall into (from their native language, the famous other half of a pair, or the same spelling with another job), with the correct form given.
  > "Not 'soy cansado' for 'I'm tired': that's 'estoy cansado'."
- **3**: a real near-miss, but not the most likely one for this learner.
- **2**: a confusion few learners would make.
- **1**: not a near-miss at all, or wrong.

## controversy

- **4**: real disagreement (regional, prescriptive or generational) stated fairly, with the practical default.
- **3**: real, but vague about who disagrees.
- **2**: really about misuse or overuse, not disagreement.
- **1**: invented, or a second meaning of the word dressed up as a debate.

## Learner test

This runs as a fresh agent, which may not read the spec's reasoning, the plan or the other fields. It is told:

> You are a speaker of `<learner language>` learning `<target>` at level `<level label>`. Here is a glossary card: term, definition, example. You know nothing else about this term. (1) Write one new sentence in `<target>` that uses the term correctly in a different everyday scene. (2) Answer: `<question>`. (3) List any word on the card you would not know at your level.

- **Who writes the question:** the coach writes it before the test, and it must be something the card should let the learner answer. Examples: "would you say X or Y here?", "which of these two sentences is correct?", "what does the term add to this sentence?".
- **When it fails:** a wrong sentence, a wrong answer, or any unknown word that isn't a known word.
- **A failure is fixed by rewriting the card,** never by making the question easier.

## Blind judge

The judge sees the spec summary (learner language, level, slice), the term, and two versions of the field labelled **A** and **B** in random order. It picks the one that teaches this learner better, and says why in one line. It is never told which version is the rewrite. The rewrite is kept only if it wins; a tie keeps the original.
