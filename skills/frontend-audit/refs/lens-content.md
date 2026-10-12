# Lens: content

Whether each screen gives the right amount of information: too much
(overkill), too little (missing), or elements that fight each other
(conflict). Quote real copy and real numbers.

## Overkill

- Label, helper line and placeholder saying the same thing.
- Instructions for obvious actions; one concept explained on several
  screens.
- Per-field captions. Build a table of fields: keep a caption when the
  option labels are ambiguous or the caption adds a fact (a cap, a cost);
  cut it when it restates the control.
- Gamification copy and stat badges stacked beside the task content.

## Missing

- A count or stat with no unit or scope ("(10)": total, due, or new?).
- An action with no visible result.
- A new concept with no scaffolding at its first appearance.
- An icon-only control with no label, tooltip, or other hint; judge touch
  devices separately, because tooltips need hover.
- An empty or error state with no next step.
- A setup flow whose primary action sits below the fold or under fixed
  chrome; run the chrome-overlap probe and say whether it is a scroll issue
  or a missing action.
- Raw data shown to users (snake_case identifiers, enum values, ids).
- A destructive dialog that understates the action. Read the code for what
  it deletes and compare with the dialog's words and numbers.

## Conflict

- **Competing emphasis:** two prominent actions or banners on one screen.
- **Redundant purpose:** two elements doing one job (a shortcut and a nav
  item, two ways to start the same flow).
- **Overlapping controls:** two fields that look like one dimension
  (difficulty and level) with no copy on how they differ.
- **Numeric reconciliation:** list every count for the same entity across
  every screen (use the numbers probe) and compare. Each difference needs a
  visible reason (excluded items, a cap) or a fix at the source. Check what
  query produces each number.
- **Contradicting information:** a statement versus a state (a celebration
  on an empty queue, "100%" beside "5 due", a strength score on items never
  started).
- **Sequence clashes:** copy that assumes a step that has not happened;
  controls that invite what another control blocks.
- **Tone and intent:** playful elements beside serious moments.
- **Cumulative load:** each element passes alone; the stack does not.
- **Vocabulary drift:** inventory the terms used for each concept across UI
  text (search several patterns) and name one term per concept. Search finds
  strings built from templates only when the search includes them.

## Language-learning apps

When the app teaches words or a language, also read
[language-learning.md](language-learning.md).

## Deliverables

1. Content model per element type: what it always shows, what expands.
2. Voice guide: tone, one term per concept, maximum length per copy type.
3. List of elements to merge, remove, or reconcile.
4. Ordered plan, quick wins first.

Copy-only fixes list before and after text. Fixes that change a number name
the source (query, constant) that changes.
