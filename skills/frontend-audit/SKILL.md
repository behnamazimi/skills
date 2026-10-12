---
name: frontend-audit
description: >-
  Audits a running frontend app for layout and visual composition, theme and
  type feel, copy, and element conflicts, then plans and verifies the fixes.
  Use when asked to audit, critique, polish, or fix the UI, UX, copy, or
  design of an app, screen, or flow.
---

# Frontend audit

Evidence from the running app outranks opinion. Every finding names a
screen, an element, and one of: a measurement, a quote, or a code
location.

## Path

Three phases, in order. Each phase ends at a stop.

- **A. Audit** (Steps 0–4): observe, analyse, report. Stop after the report.
- **B. Plan** (Step 5): runs when the user asks for a plan. Stop for approval.
- **C. Implement** (Step 6): runs after approval, then verify.

Phases A and B leave the project's files unchanged; the only files written
are the plan file the harness designates and a report file the user asked
for. App data touched during observation is restored
([observation.md](refs/observation.md) §4). An instruction to fix counts as
approval for the findings it names and nothing wider; with no separate plan,
Phase C works from the report's ordered implementation plan.

## Step 0 — Scope

1. Pick lenses from the request. Several lenses → one report.

   | Lens | Reads | Request words |
   | --- | --- | --- |
   | composition | [lens-composition.md](refs/lens-composition.md) | spacing, layout, hierarchy, consistency, robustness, accessibility, polish |
   | feel | [lens-feel.md](refs/lens-feel.md) | cold, flat, soulless, theme, color, font, typography, warmth |
   | content | [lens-content.md](refs/lens-content.md) | copy, text, information, overwhelming, confusing, conflicting, microcopy |

   No lens named → composition.

2. Write the **Constraints** list from the request and the project's
   instruction files (agent instructions, README, design docs): what stays
   fixed (layout, navigation, brand, features), which kinds of change are
   allowed, the project's lint, test and format commands, and the
   exceptions the user declared. Every finding and fix honors it.

3. Questions: ask when code and the running app cannot answer screen
   intent, target audience or proficiency, or how two elements relate. Read
   the code first. Send all questions in one batch.

PASS: lenses chosen; Constraints written, including declared exceptions.

## Step 1 — Observe

Follow [observation.md](refs/observation.md); probes live in
[probes.md](refs/probes.md).

PASS: coverage table lists every screen and state examined (screen, state,
viewport, theme) and every overlay opened, plus what was out of reach and why.

## Step 2 — Analyse

Apply each chosen lens's checklist to the observations. Write every
candidate as: where, the mess, why it matters, fix, priority.

PASS: each candidate cites evidence from Step 1 or the code.

## Step 3 — Filter

Keep a candidate when a real user's session goes worse: they misunderstand,
distrust the data, feel overwhelmed, stall, make a mistake, or cannot use
the element (contrast, target size, label). Drop taste-only items. Report
High and Medium; add Low only when the user asks for a full inventory. A
short list is a good result.

PASS: each kept item states its concrete user effect.

## Step 4 — Report

Format: [report.md](refs/report.md). End the turn after it.

PASS: report follows the format; unverified claims are labeled as such.

## Step 5 — Plan

Follow the Plan section of [plan-and-verify.md](refs/plan-and-verify.md).

PASS: every kept finding maps to a plan step; plan awaits approval.

## Step 6 — Implement

Follow the Implement section of [plan-and-verify.md](refs/plan-and-verify.md).

PASS: each step's checks passed; deviations and unverified items reported.
