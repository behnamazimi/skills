# Plan and verify

## Plan

Write the plan to the file the harness designates for plans; when none is
designated, put it in the reply. Use these sections:

1. **Context:** the problem, what prompted the work, the intended outcome.
2. **Assumptions:** open questions with the default chosen. Answer from
   code before assuming.
3. **Coverage table:** each finding → the step that fixes it.
4. **Steps:** ordered, quick wins first. Per step: files or file patterns,
   the change, shared utilities to reuse, the checks that prove it. Describe
   a repeated pattern once and list a few representative paths.
5. **Verification:** project checks, tests, browser walk (screens,
   viewports, themes), probes to re-run, and expected results.
6. **Commits:** how steps group, and where the work lands (branch, pull
   request) as the user specified.

Present the plan and wait for approval. Revise on feedback and present
again.

## Implement

1. Re-read the Constraints and the project's instruction files.
2. Work from the approved plan, or from the report's ordered implementation
   plan when no separate plan was requested, one step at a time. After each step run the project's own checks (lint,
   format, types, tests, unused-code checks) and fix what they flag. A size
   or complexity limit means extracting a component or hook, as the project
   intends.
3. Re-observe the changed screens in the browser at the planned viewports
   and themes, after transitions settle. Re-run the probes that produced
   the finding; the number or text now differs.
4. Commit per step group; push and update the pull request when the user
   named one. Describe changes that need deployment (migrations, config) in
   the description.
5. Report: what changed, what was verified, what was not, and each place
   the result differs from the plan, with the reason.

## When the user reports a problem with a fix

Reproduce it in the environment they use (the real pane, their viewport)
before changing anything. Name the cause. When a simpler design removes the
fragility, recommend it and apply it; when two designs are equally valid,
ask which one they prefer.

## Fix hygiene

- Copy built from JSX line breaks can drop a space; render the final string
  in the browser.
- Shared counts, labels and tokens change at their source, then every
  screen that reads them is re-checked.
- Data or schema changes ship with a migration or note, and local test data
  is restored.
- Edit unrelated code only when a check requires it, and report it.
