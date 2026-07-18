---
name: book-notes-refiner
description: Fix and fill gaps in a reader's chapter-by-chapter book notes without bloating them. Use when the user shares book notes (title, author, notes text) and asks to expand, fill gaps in, or fix them.
---

Treat the user's book notes as the input to refine. The notes' job is to stay skimmable, so the goal is not "add everything you can recall" — it's "make sure nothing important is missing or wrong." Fix numbers, examples, or claims the notes got wrong or fuzzy, and add the concepts, points, examples, and figures that matter but are missing, whether or not the notes already gesture at them, while preserving the skimmability, length.

Book evidence is: the concepts, arguments, and conclusions from a chapter; the key example the author uses to explain an idea; and the numbers, statistics, ratios, timelines, or research findings the book cites.

## Importance filter (apply before adding anything)

Not every true, in-the-book fact belongs. Rank each candidate addition, not just whether it's real:

- **Add it**: a concept, point, number, or example that a reader would need to actually understand or use that part of the chapter, i.e. the notes would be misleading or incomplete without it. This includes points, numbers, or explanations the notes skip entirely, not just details for points already there. Missing the author's core mechanism, definition, or the number the whole argument hinges on are the clearest cases.
- **Skip it**: supporting color, a second or third example once one is on the page, minor anecdotes, tangents, or restating something the notes already convey just with more texture. This is true-but-inessential, and it's what causes bloat.
- One example per point, max, even when adding a point from scratch. If the book gives three, pick the single best one.

## Fix, don't just add

Notes can be wrong, not just incomplete. Correct these in place rather than appending a caveat but only do so when you’re confident enough that you’d bet on the correction being accurate:

- A number, date, or name that's misremembered or garbled.
- An example attributed to the wrong concept, or a cause/effect reversed.
- A point stated so vaguely it no longer means what the author meant.

Replace or tighten the existing text; don't leave the old wrong version next to a correction.

## Grounding (do this before adding anything)

You are recalling this book from memory, so faithfulness is not automatic — enforce it:

- Add a piece of book evidence only if you'd bet money it's actually in the book; otherwise mark it `[verify]` or leave it out.
- Mark any addition you are unsure of with a trailing `[verify]` so the reader can check it against the source. Mark every specific figure (statistic, ratio, date, research finding) with `[verify]` by default — precise numbers are the ones a reader most needs to check.
- Prefer working from source text: if the user can paste the relevant book excerpts, use those over memory. If a specific statistic or example won't come to mind reliably, say so rather than inventing one.

## Requirements

- Follow the original chapter structure exactly, chapter by chapter.
- Integrate each addition inline where it belongs in the reader's existing notes, in the fewest words that make the point land. A missing detail on an existing point usually fits in the same sentence or clause; a genuinely missing concept, example, or point earns its own sentence, but not more than that.
- State each point once, in its most complete form. Don't restate a point just to append one more detail, fold the detail into the existing sentence instead.
- If a chapter's notes have no gaps and nothing to fix, leave that chapter untouched. Not every chapter needs a change.

## Voice — write like a person's own notes, not a summary of them

- Never use em-dashes (—). Use a period, comma, or parentheses instead.
- Use contractions and short fragments where useful. Drop in a first-person aside ("worth remembering:", "the part I keep coming back to is…") every 2-3 paragraphs. Don't remove these parts if they exist in the notes already.
- Vary sentence length. Uniform, evenly-claused sentences are the biggest tell of AI-written prose — break the rhythm.
- Use plain connectors more than formal connectors: "also," "so," "but," or nothing at all.
- Avoid academic-summary phrasing ("the author argues that," "this illustrates the concept of," "furthermore," "additionally," "notably," "this highlights"). Write it the way the reader would say it to a friend.

## Format — prose by default, bullets by threshold

- Default to prose for narrative, argument, and explanation — that's where paragraphs carry meaning.
- Convert to bullets when a paragraph would otherwise list 3+ of: examples, steps, stats/figures, or point-by-point contrasts. Otherwise, keep it in prose.
- Notes stay paragraph-led overall. Bullets are the exception for genuinely list-like content, not the default structure.
- Keep the notes skimmable: a reader scanning just the first line of each paragraph should still get the point. Don't bury a fixed number or key example mid-paragraph if it's the reason the paragraph exists — lead with it.

## Before finalizing

Reread your draft against the Voice and Format rules above and fix any violations. Then reread it once more against the Importance filter, sentence by sentence: for each one you added, would the reader be missing or wrong about something real without it? If not, cut it, regardless of how much the chapter grew. Growth itself isn't the problem, unearned growth is: a chapter that gained five essential facts should look different from one padded with five optional ones.

## Output

End by giving back the complete refined notes as a whole, not a summary, excerpt, or just the changed parts. The reader needs one finished markdown they can save and use, not a diff to reassemble themselves.

## Goal

A corrected, gap-filled version of the user's own notes that's still easy to skim: every original chapter and point preserved, wrong or fuzzy details fixed, each chapter gains the important concepts, numbers, and examples it was actually missing (and nothing it wasn't), unclear or overlong sentences read clean without losing meaning or turning into jargon, and the result reads like the reader's own voice, not an AI summary padding out a book report.