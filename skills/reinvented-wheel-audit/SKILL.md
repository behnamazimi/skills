---
name: reinvented-wheel-audit
description: >-
  Audits hand-rolled subsystems against stack packs that duplicate a
  platform API, an already-installed library, or a package worth adding.
  Use when the user asks to find reinvented wheels, or to check a helper,
  folder, or repo for a library replacement.
---

# Reinvented wheel audit

A package existing is not a recommendation. Keep verdicts are in-scope.

**Report only.** Read and scan. Write nothing in the audited repos
(source, lockfiles, CI, lint, git). Registry probes and the deliverable
markdown file may use a throwaway directory *outside* those trees. The
deliverable is that markdown file plus the same report in chat, not a
PR or a file in the repo.

**One shot.** Invoke → report. No mid-run questions, candidate review,
or continue gates. Cheap checks, pack ties, and author identity are
agent-side or Notes. The only early exit is `no stack pack matched`.

Read [contract.md](refs/contract.md) once. Glob `refs/packs/*/PACK.md`
relative to this skill directory. Read only each file’s `## Match`
block until a pack is active, then read that pack’s other files at the
steps that name them. The core never names a pack id.

## Path

**Full** (default): a repo, several repos, or unspecified scope →
Steps 0–8.

**Short**: the user named one function, file, or folder → Steps 0–1
(git/rg + pack match + that path only), skip Step 2’s detector union,
then Steps 3–8 for one row. Skip the 2×2. Match the named path against
the active pack’s detectors.md (include globs/symbols). No detector
match → one row, bucket hint `none`, confidence `low`.

## Step 0 — Universal probe

Probe `git` and `rg` (fallback `git grep`), each `--version` or
equivalent, touching nothing in the audited tree. Record
`available` / `unavailable` once.

PASS: both tools labeled. Later `X: unavailable` assumes this map.

## Step 1 — Pack match and triage

Glob `refs/packs/*/PACK.md`. Run each `## Match` recipe. Outcomes:

- **One match** → that pack is active.
- **None** → stop. Chat is one line: `no stack pack matched`. Not a
  table.
- **Several** → pick the pack with the most Match signals hit; tie →
  directory name A–Z. Do not union packs. Do not ask.

Read the active pack’s `## Tools` and `## Workspace`. Probe those
tools. Workspace manifests from the pack decide in-scope members; if
none exist, scope is the current repo. Stay inside that tree.

Inventory: [contract.md](refs/contract.md) § Inventory, plus the pack’s
Inventory/Tools for LOC. For every in-scope repo record:
language/framework, build tooling, LOC, last-commit date, commit
frequency, contributor count, test coverage (`unknown` if no cheap
signal), `frozen: yes/no/unknown`.

**Frozen** (yes): taxonomy-risk hint `dangerous` or detector
`cannot-keep: yes` continues to route; every other hint short-circuits
to verdict `keep`, note `frozen — revisit if development resumes`. A
repo with one contributor and low 12-month frequency, not frozen, gets
note `at-risk` — same path as active.

PASS: active pack id recorded, or the run stopped with
`no stack pack matched`; every in-scope repo has the fields above.

## Step 2 — Candidates (full path)

Read the active pack’s `detectors.md`. Union that pack’s detectors
after **shape gate → definition filter → delegate-import drop**
([contract.md](refs/contract.md)). Amplifiers run only if the pack
defines them; they annotate hits, they do not add detector ids.

Do not hunt conceptual dupes outside a detector’s signals and
amplifier clone pairs. An unfiltered catch-all tree (`lib/`, `pkg/`,
…) is a fail.

Each candidate: detector **id**, **duplication count** (distinct files
in the same detector id after filters; clone pairs raise the count
when names differ; else `1`).

PASS: candidate list + already-delegating drop count by detector id.

## Step 3 — Shape and confidence

No verdict yet. If a Step 2 filter missed a delegate import, drop the
row here (no verdict, no ADR).

Per candidate, separate cells:

1. **Detector id**
2. **Taxonomy risk** — that detector’s bucket hint, or `none`
3. **Confidence** — from the pack’s required/optional clauses, not
   vibe:
   - **high** — every required clause + size gate clearly met + no
     listed false-positive signal
   - **medium** — required + size gate, but optional clauses mostly
     miss or a false-positive signal is present
   - **low** — amplifier-only or folder glob without the full API shape
4. **Keep/wrapper flags** — pack keep / wrapper-seam rule matched or
   not
5. **Cheap check** — always run the detector’s named `rg`/file test.
   Record the result in Notes.

**Effort** (sort key later): **S** drop-in, import-only, < 1 day;
**M** API mismatch or several call sites, 1–3 days; **L**
behavior/security/UI, feature flag, > 3 days. Coverage `unknown`
bumps **S→M** when hint is `dangerous`.

PASS: every remaining candidate has detector id, taxonomy risk,
confidence, cheap-check Notes, and effort. No verdict cell yet.

## Step 4 — Route proposal

**Short-circuit keep** (skip evidence, route `n/a`): wrapper-seam or
pack keep-rule matched; or frozen non-dangerous / non-cannot-keep.

Remaining rows, first match:

1. **`internal`** — same detector id in 2+ workspace members and no
   typical replacement fits → skip native/installed/package.
2. **`native`** — platform API in the pack evidence baseline. Outside
   baseline, continue.
3. **`installed`** — manifest dependency (amplifier
   `already-installed`) whose pinned version covers the headline API.
4. **`package`** — neither of the above.

Route is a proposal, not a verdict.

PASS: every non-short-circuit row has a proposed route; short-circuit
rows have `n/a`.

## Step 5 — Evidence

Skip when every row is short-circuit keep. Else read the active pack’s
`evidence.md` (and [contract.md](refs/contract.md) § Internal extract
for `internal`).

- `package` — eight-field pack in evidence.md
- `installed` — three-field installed-library check
- `internal` — owner / versioning / adopters
- `native` — baseline check only

**Veto** (license blocker, below-baseline with no fallback,
supply-chain fail): try the next route in Step 4 order. None left →
leave route empty for Step 6 (`keep`, hint `justified-keep`), except
`cannot-keep: yes` rows, which stay on the last attempted route and
name an unverified fallback in Notes.

PASS: every `package` row has the eight fields; every `installed` row
has the three-field check; every `internal` row has owner/versioning/
adopters; vetoes either advanced to another route or are marked for
Step 6.

## Step 6 — Verdict

Exactly one of `keep`, `replace`, `extract`. Hint and confidence are
not the verdict.

| Verdict | When |
| --- | --- |
| **keep** | Short-circuit keep; evidence veto with no remaining route; confidence `low` after a cheap check that failed or is `not-a-system`; library a bad fit (bundle, license, 3 of 40 functions, wrong runtime); frozen non-dangerous. Short ADR required. `cannot-keep: yes` never keep. Other `dangerous` may keep: ADR and **Risk if left alone** name the residual hazard and the check. |
| **replace** | Evidence passed on native/installed/package; or frozen + `dangerous` / cannot-keep with note `frozen — replace-on-touch`; or cannot-keep after veto with unverified fallback in Notes. Confidence `low` cannot be replace unless the cheap check ran **and passed**, except `cannot-keep: yes` (still replace). |
| **extract** | Route `internal`. Confidence `low` cannot be extract unless the cheap check ran and passed. |

**Author-ask is Notes only.** On `replace` / `extract`, `git blame` the
original author; record name, date, and the question in Notes. Never
block or wait. States: `author-is-requester` (blame is the invoker),
`author-question-recorded` (resolvable person), `author-unreachable`
(bot, squash, gone). Skip on keep. Same Notes line for the
installed-dep inverse question.

When keep + hint `dangerous`, **Risk if left alone** names the
residual hazard.

PASS: every candidate has exactly one verdict and a route (`native` /
`installed` / `package` / `internal` / `n/a`); every replace/extract
has an author Notes state; cannot-keep is not `keep`; `low` replace
or extract has a passing cheap check.

## Step 7 — Spike and rollout

Skip when every verdict is keep.

**Spike:** read the pack’s evidence.md § spike. Paper only — no branch,
tests, or install. Top `replace` row only (Step 8 sort among routes
`native` / `installed` / `package`). `extract` is not this spike.
Label figures `estimated` unless they came from a read-only scan of
what already ships.

**Rollout:** read the pack’s `rollout.md`. Full path: every `replace`
and `extract` row. Short path: rollback, regression, and lint only,
and only when hint is `dangerous` or the code touches UI. Name the
rollout; leave bots, lint, flags, and CI unchanged. Lint is a snippet
for the repo’s actual tool, or `lint: unverified` plus the forbidden
path in prose.

PASS: one paper-spike write-up when any row is `replace`; pin,
rollback, regression, and lint named on rows this step covers.

## Step 8 — Deliverable

Write a self-contained markdown file under the OS temp directory.
Filename: `reinvented-wheel-audit-<unique>.md` (`YYYYMMDD-HHMMSS` if
`date` works, else epoch or a random suffix). Temp dir: `$TMPDIR`,
else `/tmp`, else `%TEMP%` / `$env:TEMP`.

```bash
dir="${TMPDIR:-/tmp}"
path="$dir/reinvented-wheel-audit-<unique>.md"
```

If the requester names an output path, use that instead of temp. Print
the absolute path as the first line of the chat reply, then emit the
same markdown in chat. Leave the file unopened.

Sort rows: (1) confidence `high` → `medium` → `low`; (2) taxonomy
risk `dangerous` → `genuine` → `internal-extract` → `none` → keep
hints last; (3) verdict `replace` / `extract` before `keep`; (4)
effort `S` → `M` → `L`. A `dangerous` hint with verdict `keep` still
sorts with `dangerous`.

| Item | Location | Detector | Taxonomy risk | Confidence | Verdict | Route | Duplication count | Risk if left alone | Proposed replacement | Maintenance evidence | Migration effort | Blast radius | Notes |

Route cells: `native` / `installed` / `package` / `internal` / `n/a`.
`Proposed replacement` for `native` or `installed` is suffixed
`(native)` / `(already installed)`.

**Blast radius**: grep the candidate’s exported symbol for imports and
usages; record distinct-file count, labeled `counted`. `estimated`
only when re-export/rename breaks grep; say so in Notes.

Full path only — effort × impact 2×2. **Impact High**: hint
`dangerous`, or blast radius ≥3 call sites, or a user-facing surface,
or duplication across 2+ repos; **Low**: everything else.

|  | **S effort** | **M effort** | **L effort** |
| --- | --- | --- | --- |
| **High impact** | Quick wins | Planned work | Planned work |
| **Low impact** | Fill-ins | Fill-ins | Skip / keep |

After the table:

- Already-delegating drop count from Step 2 (one line, by detector id)
- A short ADR for every `keep`. Cite `justified-keep`, `wrapper-seam`,
  `trivial-keep`, frozen, cheap-check fail, or evidence veto.
  `cannot-keep` has no keep ADR. Delegate drops have no ADR.
- The Step 7 paper-spike write-up (omit on short path when keep)
- The named lint/rollback

**Self-check** (mechanical): grep the written file for the fourteen
table header names (`Item`, `Location`, `Detector`, `Taxonomy risk`,
`Confidence`, `Verdict`, `Route`, `Duplication count`,
`Risk if left alone`, `Proposed replacement`,
`Maintenance evidence`, `Migration effort`, `Blast radius`, `Notes`)
and for an ADR heading per keep row. Any miss → fix the file before
printing the path in chat.

PASS: file at the resolved path; separate Detector, Confidence,
Taxonomy risk, Verdict, Route columns; 2×2 on the full path; drop
count on the full path; every keep has an ADR; spike present when any
row is `replace`; named lint/rollback on rows Step 7 covers. Path
printed; full report in the same message. No OS file-opener. No repo
files changed.
