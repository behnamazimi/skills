---
name: book-notes-refiner
description: Enrich a reader's chapter-by-chapter book notes. Use when the user shares book notes (title, author, notes text) and asks to expand or fill gaps in them.
---

Treat the user's book notes as the input to refine. Expand and refine them by adding content that is present in the book but missing from the notes, while preserving the original meaning and flow.

The additions you make are **book evidence**: the concepts, arguments, and conclusions the reader missed; the key examples the author uses to explain ideas; and the numbers, statistics, ratios, timelines, and research findings the book cites.

## Grounding (do this before adding anything)

You are recalling this book from memory, so faithfulness is not automatic — enforce it:

- Add a piece of book evidence only when you recall it with high confidence.
- Mark any addition you are unsure of with a trailing `[verify]` so the reader can check it against the source. Mark every specific figure (statistic, ratio, date, research finding) with `[verify]` by default — precise numbers are the ones a reader most needs to check.
- Prefer working from source text: if the user can paste the relevant book excerpts, use those over memory. If a specific statistic or example won't come to mind reliably, say so rather than inventing one.

## Requirements

- Follow the original chapter structure exactly, chapter by chapter.
- Keep the writing conversational,  in the voice of a thoughtful general reader rather than a formal academic summary.
- Match the reader's existing format. Keep prose for narrative, argument, and explanation — that's where paragraphs carry meaning. Use bullets for genuinely list-like content: enumerated examples, step sequences, clustered stats or figures, or point-by-point contrasts, and wherever a block of prose has grown hard to scan. The notes stay paragraph-led and never collapse into a bullet dump — but a chapter the reader can't skim has failed its purpose.
- Integrate each addition inline where it belongs in the reader's existing notes.
- State each point once, in its most complete form.

## Goal

An enriched version of the user's own notes, faithful to the book: every original chapter and point preserved, and each chapter gains at least the book evidence it previously omitted.