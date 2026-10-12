# Report format

## Opening

Three to five lines: where the app is weakest, and the highest-leverage
fixes. Name the lenses used and anything unobserved.

## Each issue

- **Where:** screen and elements involved (component or file when known).
  Name every element in a conflict.
- **The mess:** what is off, with the quote, number, or measurement.
- **Why it matters:** the principle and the effect on the user.
- **Fix:** the smallest specific change: before → after for copy, values for
  styles, the source for numbers. Include a short snippet when it helps.
- **Priority:** High, Medium, or Low (Low only on request).
  - High: blocks or misleads a primary task, harms trust in data or a
    destructive action, or hurts many screens and is cheap to fix.
  - Medium: noticeable friction on a secondary path or one screen.
  - Low: listed only when the user asked for a full inventory.

## Closing sections

- Lens deliverables: tokens (composition, feel) or content model and voice
  guide (content); components or elements to merge, remove, or reconcile.
- Ordered implementation plan, quick wins first.
- Questions that remain open, each with the default the plan assumes.
- Unverified: claims that rest on code only, and screens not reached.
- Test data created and anything changed during observation, with how it
  was restored.

## Corrections

When later evidence disproves a finding, say so in plain words in the next
message and remove it from the plan.
