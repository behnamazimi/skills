| case | reply | schema | hard | mechanical | judged | terms | opt/term |
| --- | --- | --- | --- | --- | --- | --- | --- |
| es-default | json | ok | 4/4 | 0 | — | 10 | 2.2 |
| es-a2-feelings | json | ok | 3/3 | 0 | — | 10 | 2.6 |
| nl-immersion | json | ok | 3/3 | 0 | — | 10 | 2.1 |
| ja-b2 | json | ok | 3/3 | 0 | — | 12 | 3.08 |
| zh-b2 | json | ok | 3/3 | 0 | — | 10 | 3.8 |
| ar-msa | json | ok | 3/3 | 0 | — | 10 | 2.3 |
| arz-b1 | json | ok | 3/3 | R-FLD-07×2 | — | 10 | 2.4 |
| tr | json | ok | 3/3 | 0 | — | 10 | 2.8 |
| sw-a2 | json | ok | 3/3 | 0 | — | 12 | 2.42 |
| sr | json | ok | 4/4 | 0 | — | 10 | 2.7 |
| la-reading | json | ok | 3/3 | R-FLD-07×1 | — | 10 | 2.2 |
| de-persian | json | ok | 4/4 | 0 | — | 10 | 2.1 |
| fr-restaurants | json | ok | 3/3 | 0 | — | 12 | 2.08 |
| de-particles | json | ok | 3/3 | 0 | — | 8 | 3.5 |
| it-count-2 | json | ok | 4/4 | 0 | — | 2 | 3.5 |
| pt-150 | got question,json | FAIL | 3/6 | R-SEL-09×1 R-FLD-07×7 | — | 148 | 1.61 |
| es-ex-ser | json | ok | 4/4 | 0 | — | 10 | 3 |
| es-ex-accent | json | ok | 4/4 | R-FLD-04×1 | — | 10 | 1.8 |
| es-ex-articles | json | ok | 4/4 | 0 | — | 10 | 2.3 |
| es-ex-patterns | json | ok | 4/4 | 0 | — | 10 | 2.3 |
| es-ex-weekdays | json | ok | 5/5 | 0 | — | 10 | 2.3 |
| es-nothing-left | json | FAIL | 3/4 | 0 | — | 0 | 0 |
| es-ex-pasted | json | ok | 4/4 | 0 | — | 10 | 2.4 |
| es-repeat-1 | json | ok | 3/3 | 0 | — | 12 | 2.08 |
| es-repeat-2 | not run |  |  |  |  |  |  |
| reject-sentence | text | — | 1/1 | 0 | — |  |  |
| ask-conflict | question | — | 1/1 | 0 | — |  |  |

**Totals:** 26/27 cases ran · schema 22/24 · hard properties 85/89 · mechanical violations 12 · judged 0/0

**Failed hard properties:**
- pt-150: 2 parts → 1
- pt-150: matches import schema → ["R-OUT-04 terms: has 148 terms; max 100 per glossary"]
- pt-150: each part ≤ 100
- es-nothing-left: matches import schema → ["R-OUT-04 terms: must contain at least one term"]
