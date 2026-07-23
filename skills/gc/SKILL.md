---
name: gc
description: Rewrite text when the user's message starts with "gc:".
---

Rewrite everything after `gc:`. Fix grammar, punctuation, and flow, but the priority is making the result read like a person wrote it, not an AI — apply the rules below.

## Baseline

- Preserve the writer's voice, meaning, and every fact/claim; never add or drop content. If the structure is awkward, improve it without changing that voice.
- Output the revised text only, with no added content, no extra explanations, no summary of what changed.

## Cut inflated significance and canned analysis

- Delete or rewrite sentences that exist only to assert importance: "stands/serves as a testament to," "plays a pivotal/crucial role," "underscores/highlights its significance," "marks a turning point," "reflects broader trends," "contributes to the evolving landscape." If the sentence says the same thing without the puffery, cut the puffery; if it says nothing without it, cut the whole sentence.
- Remove tacked-on present-participle ("-ing") clauses added purely for effect: "...emphasizing its importance," "...fostering community engagement," "...ensuring long-term success." These usually add zero information.
- Cut formulaic "despite these challenges, X continues to..." style wrap-ups. If there's a genuine concrete point about risk or open questions, keep that and drop the generic sentence around it.
- Remove vague weasel attributions: "industry reports suggest," "observers have noted," "experts argue," "many believe." Name the actual source or state the claim plainly — don't launder an unsupported claim through a fake crowd.
- Remove notability-padding like "independent coverage," "profiled in [outlet]," or "maintains an active social media presence," or lists of coverage/outlets that exist just to prove importance, unless the user's input specifically wants that list.
- Remove leftover chatbot artifacts if the input is clearly a pasted AI response rather than the user's own words: collaborative filler ("I hope this helps," "Certainly!," "Would you like...," "let me know," "here is a"), disclaimers ("as of my last knowledge update," "not widely documented," "based on available information," "in summary"/"in conclusion" as a restate-everything closer), and prompt-refusal remnants ("as an AI language model," "I'm sorry, but I can't...").

## Strip AI vocabulary

Replace or remove overused LLM words instead of swapping in a synonym. Common offenders: *delve, boast(s), crucial, pivotal, intricate/intricacies, tapestry, testament, underscore, showcase, garner, bolster, foster, enhance, robust, meticulous(ly), landscape (abstract), align with, key (as filler adjective), vibrant, valuable insights, additionally* (especially sentence-initial).

Default to plain, specific words: "has" instead of "boasts"/"features"/"offers"; "is/are" instead of "serves as"/"functions as"/"represents"; "improve" instead of "enhance"; "explore"/"look at" instead of "delve into."

## Restore "is/are" and vary rhythm

- Don't avoid basic copulas. If the natural sentence is "X is Y," write "X is Y" — don't dress it up as "X serves as Y" or "X functions as Y."
- Break up uniform sentence lengths and matching clause structures. Mix short and long, simple and complex sentences instead of a run of evenly-paced, similarly-shaped ones.
- Let some words repeat rather than forcing "elegant variation" (swapping a repeated term for an awkward synonym just to avoid repetition). Repeating a plain, correct term reads more natural than a thesaurus-driven substitute.
- Rewrite negative-parallelism rhetoric used just for punch: "not just X, but also Y," "it's not X, it's Y," "X rather than Y." State the point directly instead.
- Cut padded rule-of-three lists ("innovative, dynamic, and forward-thinking") down to one specific detail, or make the list genuinely complete — don't leave a decorative triple.
- Keep genuine superlative/definitive claims ("was the first," "is the only") if they're accurate — don't hedge them into mush just to sound cautious; hedging everything is itself an AI tell.

## Fix formatting tics

- **Headings**: sentence case, not title case ("Impact of technology on society," not "Impact Of Technology On Society"). Don't skip heading levels.
- **Boldface**: remove mechanical bolding of every key term or "takeaway" phrase. Bold only what a human editor would genuinely want to draw the eye to, sparingly.
- **Lists**: don't convert prose into "bullet with bolded inline header: description" lists by default. If the content reads fine as prose, keep it as prose; use lists only where the input already used a real list.
- **Em dashes**: use standard punctuation only — hyphens instead of em dashes. Prefer commas, parentheses, or a period over an em dash.
- **Quotation marks/apostrophes**: use straight quotes (`"`/`'`), not curly/typographer's quotes.
- **Emoji**: remove emoji used as heading/bullet decoration.
- **Tables**: don't wrap two or three data points into a table just because they're numbers; write them as a sentence unless there's a real reason for tabular format.
- **Thematic breaks**: remove stray `---`/`----` rules inserted before headings.

## Don't over-correct

These are weak or false AI tells on their own — don't strip them just because they show up:

- Perfect grammar, or formal/academic vocabulary in general (only the specific words listed above are the actual tell).
- A transition word appearing once ("Additionally," "Notably") — only overuse across many sentences counts.
- A mix of casual and formal registers in the same passage — that's normal human writing, not a tell.
- Text simply lacking citations or sources.
- Judging a sentence "sounds robotic" on vibes alone — go by the concrete word/pattern list above.

## Keep it honest

- Never invent facts, sources, or attributions while rewriting — this is a style pass, not new content.
- A sentence that is pure puffery with no factual content can simply be deleted rather than rephrased.
- If a sentence buries a specific, verifiable detail under generic language (e.g., "a revolutionary titan of industry" instead of "inventor of the first train-coupling device"), restore the specific detail if it's present elsewhere in the input; otherwise just remove the vague superlative.
