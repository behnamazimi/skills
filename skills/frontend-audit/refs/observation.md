# Observation

Goal: a coverage table backed by measurements and captured text.

## 1. Environment

- Find how the app runs from the project docs and scripts. Use the
  harness's browser or preview tool on the dev server.
- Sign-in belongs to the user. When the session is logged out, ask the user
  to sign in, then continue. Credentials stay with the user.
- No browser tool available → review from code, ask the user for
  screenshots, and label every visual claim `unverified`.

## 2. Viewports and themes

- Primary target first (phone 375×812 unless the project says otherwise).
  Add 320 wide for robustness claims, and a desktop width when the layout
  differs.
- When theme code exists, observe each theme. Set it the way the app does
  (toggle, attribute, class), then wait about a second so color transitions
  finish before measuring.
- Layout claims that depend on scroll containers, sticky or fixed chrome
  (bottom nav, keyboards) need a check in the emulated viewport and in the
  real, unemulated pane. They differ.

## 3. Sweep

1. Inventory routes from the router files, then visit each.
2. Per screen: first paint, loaded state (wait about two seconds), after the
   primary action, then empty, loading, error and long-text states where
   reachable.
3. Open every modal, sheet, drawer, menu, popover, tooltip and accordion.
   Read its full text, then close it.
4. Capture copy as text (page text or DOM reads). Use screenshots for
   composition.
5. Read the code behind anything you will question: where a count comes
   from, what a destructive action deletes, where a string is defined.
   Search for UI strings by several patterns (JSX text, template literals,
   constants, translation files).

## 4. Safe interaction

Allowed without asking: navigation, opening and closing overlays, typing
into forms without submitting, reversible toggles, and creating test data
that you remove at once (record it in the coverage table).

Skip or ask first: deleting, signing out, sending messages, purchases, paid
or metered API calls, entering credentials, permanent changes, generating
tokens or links. Confirm dialogs for these are read, then cancelled.

Restore anything you changed (marks, toggles, theme) before moving on, and
list what you touched in the report.

## 5. Capture hygiene

- Facts come from text and DOM reads; screenshots show composition. A
  screenshot may lag one action; re-capture before trusting it.
- Coordinates come from the latest screenshot's scale. A click that does
  nothing may have landed on a neighbor: read the event target before
  calling it a bug.
- Scripted clicks find elements by container, because several controls can
  share a label (a dock "More" and a header "More").
- Measure with [probes.md](probes.md) and record numbers beside the
  screen, state, viewport, and theme.

## 6. Coverage table

| Screen | State | Viewport | Theme | Overlays opened | Notes |
| --- | --- | --- | --- | --- | --- |

Close with a list of what stayed unobserved and why.
