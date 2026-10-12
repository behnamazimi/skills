# Lens: feel

Why the interface reads cold, flat, or generic, fixed through theme
(color, contrast, elevation), typography, and spacing. Structure stays as
it is; when the request names allowed change types, only those change.

## Color and theme

1. **Neutral temperature.** Read computed surface, border and text colors.
   Neutrals with no chroma beside a tinted ink read as a default kit. Tint
   every neutral toward one hue.
2. **Canvas versus card.** When the page background and the cards share a
   color, depth comes only from hairlines. Check computed backgrounds: a
   gradient that references an undefined token can fade to transparent.
3. **Elevation.** Shadows tinted toward the ink read warmer than black
   alpha; a ring plus a wide soft layer reads deeper than a hairline.
4. **Border strength.** Full-strength ink outlines on soft screens outshout
   the primary action. Soften to a tinted hairline.
5. **Status colors.** Success, warning, error and info share chroma and
   lightness; four saturated hues in a row look like a kit.
6. **Accent.** An accent defined but unused leaves one warm element (an
   icon) carrying all personality. Find where it can mark progress or
   highlights without new elements.
7. **Theme parity.** Dark and light share the brand hue. Compare the
   primary and surface hues across themes.
8. **Contrast after tinting.** Re-run the contrast probe in every theme;
   text colors for status and brand need text-safe variants of their
   fill colors.

Choose values in a perceptual space (OKLCH or similar) with one hue per
role, then confirm with the probe. Measured contrast decides.

## Typography

1. **Pairing.** Heading and body faces that look alike give no personality
   contrast; a distinct display face for headings and content terms adds it.
2. **Weights.** Read the weight histogram. One weight carrying every label
   flattens hierarchy: body regular, interface labels medium, emphasis
   semibold. Reading-heavy text can sit slightly heavier than interface
   text.
3. **Line height.** One leading per size step. Mixed leadings for the
   same paragraph style come from per-size defaults versus a body value.
4. **Letter spacing.** Tight tracking belongs to display sizes; small text
   and body stay at zero; uppercase labels take positive tracking.
5. **Scale.** Few distinct sizes with real steps between content levels;
   row titles and body text at the same size lose hierarchy.

## Spacing

1. **Rhythm.** A ladder with meaning: small inside groups, larger between
   groups, larger between cards, largest between sections.
2. **Density.** Rows at minimum height and equal padding on every container
   read utilitarian; give content rows and primary cards more room.
3. **One-offs.** Count half-steps and odd values from the class or style
   usage; list the replacements.

## Deliverables

Consolidated tokens (color roles with values, type scale with weights,
spacing ladder) and an ordered plan, quick wins first. Check that fixes
inside the allowed change types break nothing outside them; list any that
would as side notes.
