# Report: Spanish restaurants

## Settings
- domain: Spanish restaurants (user); slice: restaurants, slice_type usage
- count: 10 (user); learner: English (default); level: A2–B1 (default), beginner mode on
- immersion: off (default); pronunciation: none (default, beginner mode)
- dialect: Peninsular (Spain) Spanish, **inferred** from excluded "el camarero" (Latin America says mesero/mozo); locale es-ES
- noun citation: lemma + article, **inferred** from the exclude items' format
- path: lite

## Mode
- inline: true. No subagent tool was available, so every step ran in the same agent. The independent reviews (list review, sample review, coach, learner test, blind judge, level raters, fact questions, rule check) were done by the same agent that wrote the entries, re-reading only each step's inputs. They are not truly independent.
- node: true. All GYM checks ran.

## Exclude
- raw: la cuenta, el menú, la mesa, el camarero. All expanded, none ignored.
- el menú blocks la carta / menú del día; el camarero blocks mesero, mozo, garzón; la cuenta is phrase scope (the bill).

## Checks
- validate spec: 0 errors (run twice, before and after the dialect inference)
- validate exclude: 0; validate list: 0; candidates: 0 pairs
- list review: 0 findings
- validate batch (samples, batch-1): 0 errors
- normalize, metrics: 1 batch, def 13.4 words avg, example 10.8, 0 plan mismatches, 0 outliers, 0 repeated scenes
- validate glossary: 0 errors (after steps 6, 7, 8, 9)
- tokens: 35 target tokens; rater 1 put none above B1, so rater 2 had nothing to rate; 0 level findings
- fact questions: 11 asked, 11 agree, 0 unsure, 0 dropped
- rule check: 0 findings; validate findings: 0 removed
- emit: validate output passed

## Coach
- average scores: definition 3.9, example 3.9, anti_example 3.7, discussion 3.75
- learner test: 10/10 pass
- 1 rewrite: t07 estar rico anti_example (original overstated that ser + rico means rich for food); judge chose the rewrite

## Level exceptions
- none

## Rejected findings / dropped terms
- none; step 10 not needed (no findings)
- spares unused: la propina, para llevar, ser alérgico a, quería + cosa

## Not verified
- nothing unverified by script; agent reviews were not independent (inline mode)
