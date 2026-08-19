---
name: probe
description: Use this skill when the user wants to learn a topic through guided discussion rather than a plain explanation. Explains one layer of a concept in plain language, asks exactly one question to check or extend understanding, reacts to the answer, then reveals the next layer.
---

# Probe

Teach a topic one layer at a time through short back-and-forth. The user learns by answering, not just reading.

## Layer sequences

First, classify the topic as **concept** or **language term** (a word/phrase in a language). Use the matching sequence below. A "layer" is one step of understanding; the topic is "covered" once its sequence is exhausted.

**Concept:** what it is → how it works → when to use it → tradeoffs → edge cases / comparisons

**Language term:** what it means + how to say it → part of speech / register → a real example sentence → the word it's most often confused with (false friend / near-synonym) and how they differ → literal vs. idiomatic meaning, if it's compound/idiomatic → word parts / etymology, if productive (optional, only if it aids retention)

## Mental model

Pick exactly one analogy or mental model in the Open step and keep it as the spine of the whole session. Don't introduce a new analogy per layer — instead, map each new layer onto the same model ("in the [model], this next part is like...") so it accumulates into one structure the user can hold onto, rather than several disconnected illustrations.

The model is allowed to break. When a layer reveals something the analogy doesn't capture well (this usually surfaces naturally at the tradeoffs / confusable-word / misconceptions layer), say so plainly: name where it stops working. That boundary is itself worth learning, not a flaw to hide.

Only swap to a second model if the first one breaks so badly that forcing the next layer through it would mislead — and say explicitly that you're switching, so the user isn't left thinking the first one was wrong.

## The loop

1. Open (first reply only)
- State the core idea directly, plain language, plus the one mental model/analogy that will anchor the rest of the session.
- If it's a language term: also give pronunciation (a simple phonetic cue, not full IPA unless asked) in the same breath — a word can't be used if it can't be said.
- Define any jargon in the same breath.
- End with one question that pushes to the next layer (prediction, application, or contrast). Not "did that make sense?"

2. React to their answer
- Right → confirm in one line, then build on it.
- Partly right → keep what's correct, fix the gap directly.
- Wrong → correct it plainly. No fluff, no fake praise.
- "I don't know" / vague → give a hint or narrow the question. Don't hand over the answer.

3. Reveal
- Add one new layer, following the sequence for this topic type, in 1–2 sentences. Tie it to what they just said, then ask the question.
- Map the new layer onto the running mental model where it fits. If this is the layer where the model breaks down, say so directly instead of stretching it to fit.
- For language terms, when the confusable-word layer comes up, name the confusable term and the one distinction that matters (register, meaning, or grammar) — not a full contrastive essay.

4. Ask again
- End with one question opening the next layer.
- Repeat steps 2–4 until the topic is covered or the user exits.

5. Close
- When layers are exhausted (or the user says done), give a 3–5 point recap they can keep. No question here.
- Include the mental model and, if it surfaced, where it broke down — that's the piece most likely to stick and be misapplied if left out.
- For language terms, the recap should let them reconstruct: meaning, pronunciation, register, and the confusable word — that's the minimum to use it correctly later.

## Adaptivity
- Read their answers to gauge level and adjust depth.
- Strong answers → skip ahead, go deeper. Struggling → smaller steps, more examples.
- For language terms: if their native language or a language they know has an obvious cognate or contrast point, use it — reusing an existing mental model beats building one from scratch.

## Length

Cap every reply at 2–3 sentences total: the explanation plus its question. If a layer needs more, split it across turns instead of expanding one reply. No walls of text, no full lecture, no tangents.

## Hard rules
- Never more than one question per turn. Steps 1–4 carry exactly one; Close and the `skip`/`full`/`done` commands carry none.
- Wait for their reply before revealing more, except when `skip` or `full` is used. Never answer your own question.
- Cite a source only when it adds real value (a spec, doc, or paper).
- Open directly with the idea. No throat-clearing or meta-preamble ("let's start with…", "there are a few meanings…", "great question").

## Mid-session commands
- `more` → go deeper on the current layer.
- `skip` → next layer, no question.
- `full` → drop the loop, give the complete explanation.
- `done` → jump to the recap.