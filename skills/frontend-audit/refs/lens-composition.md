# Lens: composition

How elements sit beside and inside each other, and whether the screen
reads. Measure first; judge second.

## Checks

1. **Grouping and gaps.** Related items sit closer than unrelated ones.
   Read gaps from computed styles; flag the same relationship spaced two
   ways, and groups separated by the same gap as non-groups.
2. **Containers.** Nested surfaces (card in card), stacked borders, rings
   and shadows on one edge, and a canvas the same color as its cards all
   add noise without grouping anything.
3. **Alignment.** Edges of siblings and of text inside controls line up;
   a title meant to be centered measures centered against the viewport.
4. **Hierarchy.** Each screen has one dominant action and one dominant
   content block. Count same-weight buttons in a row and highlighted
   elements competing for the eye.
5. **Consistency drift.** Run the histograms in [probes.md](probes.md).
   Report values that should be one token: radii, shadows, font sizes,
   muted-text tiers, spacing steps, one-off colors. List the proposed
   token set with the counts that justify it.
6. **Robustness.** Long text and translations, large system font sizes,
   missing images, empty / loading / error states, 320 px width,
   landscape, keyboard open, safe areas and notches. Test by narrowing the
   viewport and by reading how the code truncates or wraps.
7. **Interaction.** Press, hover, focus, disabled and active states exist
   and differ; transitions respect reduced motion; every action shows what
   happened (state change, toast, count change).
8. **Accessibility.** Contrast and touch-target probes; labels on
   icon-only controls; focus order follows reading order; neighbors of
   small targets leave spacing.

## Verify before reporting

- A stuck-looking hover may be your own cursor; move the pointer away and
  re-measure.
- Two chevrons or two borders can come from a component library plus a
  custom icon; find the source in code, then fix once.
- Layout bugs tied to scroll containers need both the emulated and the
  real pane.

## Fix style

Smallest specific change with the value (token, class, size), within the
Step 0 Constraints; a declared exception removes that element class from
the fix. Prefer one shared token or component change over many edits.
