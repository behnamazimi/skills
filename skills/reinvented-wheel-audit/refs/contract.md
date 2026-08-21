# Pack contract

Read this file once per run, before globbing packs. Packs live in
`packs/<id>/` beside this file — from the skill root that is
`refs/packs/<id>/`. The core never names a pack id.

## Layout

Each pack is a directory:

```
packs/<id>/           # beside this file (skill root: refs/packs/<id>/)
  PACK.md             # Match, Tools, Workspace
  detectors.md        # detector tables + optional amplifiers
  evidence.md         # native / installed / package recipes
  rollout.md          # pin, lint, rollback, regression
```

`<id>` is the directory name. A pack without `PACK.md` is ignored.

## PACK.md

Required headings, in this order: `## Match`, `## Tools`,
`## Workspace`. Optional: `## Inventory` when LOC or coverage needs a
pack tool. Universal git inventory lives below.

### Match

A list of **signals**. Each signal is a file test or `rg` the agent
runs against the audited tree (`node_modules`, `dist`, `vendor`,
`build`, `coverage` excluded). Record `hit` or `miss` per signal.

The pack **matches** when every **required** signal hits. Optional
signals count only toward the Step 1 tiebreak (most hits wins).

Do not put stack narrative in Match — only tests.

### Tools

One tool per line, name plus how to probe (`--version` or
equivalent). After Match, probe each and record `available` /
`unavailable`. Do not probe tools other packs list.

### Workspace

Manifest filenames. If any exist at a repo root, in-scope members
are that workspace’s packages; else the current repo only. Stay
inside the tree.

## detectors.md

One heading per detector. Every detector fills these fields (names
stable; packs fill values):

| Field | Content |
| --- | --- |
| **id** | slug, unique in the pack |
| **include** | globs and/or symbol greps that nominate files |
| **required** | shape clauses; **all** must hit for a full-shape candidate |
| **optional** | clauses that raise confidence when they also hit |
| **size gate** | LOC and/or file-count floor |
| **delegate drop** | import/require specifiers (or call patterns) that drop the file |
| **bucket hint** | `genuine` / `justified-keep` / `wrapper-seam` / `trivial-keep` / `dangerous` / `internal-extract` |
| **typical replacement** | native first, then installed, then package |
| **keep / wrapper-seam** | when this is not a subsystem |
| **false positives** | named collisions |
| **cheap check** | one `rg` or file test; never a question |
| **cannot-keep** | `yes` or `no` (pack sets this; core never keep a `yes` row) |

Optional **Amplifiers** section: copy-paste, high-LOC, installed-dep
inverse. Amplifiers attach to detector hits (duplication count,
`already-installed`). They do not create a new detector id.

### Definition filter

Among include hits, keep a file only when its basename matches an
include symbol, or `rg` finds a **definition** of that symbol. The
**pattern is pack-supplied** (`detectors.md` § Definition filter).
Call-sites, markup usage, schema methods, and re-export barrels are
not definitions.

### Delegate-import drop

Among definition survivors, drop a file whose import/require
specifier matches that detector’s **delegate drop** cell (or an
equivalent already in the manifest). Call-pattern cells drop on that
`rg` hit too. Dropped files are not candidates, have no verdict, no
ADR. Record the drop count by detector id.

A file that imports the replacement *and* defines a second local
implementation of the same shape stays nominated.

Do not Read a file body to apply definition or delegate filters.

## Inventory (every pack)

Run from each in-scope repo root before detectors.

```bash
git log -1 --format='%ci'
git rev-list --count --since='1 year ago' HEAD
git shortlog -sn --all | wc -l
```

PASS: last-commit date, 12-month commit count, contributor count.
**Frozen** = archived/maintenance-mode, or 12-month commits = 0. Not
a git repo → `git: unavailable`, `frozen: unknown`, continue (do not
ask). Shallow clones: note `shallow`.

LOC and coverage: pack `## Inventory` / Tools. Coverage is `unknown`
unless a cheap on-disk signal exists. Do not run the test suite.

## Internal extract

Route `internal` only. Fill:

```markdown
- Owner (team/repo):
- Versioning (semver in the org registry, or a monorepo path):
- Adopters (repos that would take the package):
```

Owner: `CODEOWNERS`/`OWNERS` at the duplicated paths, else README or
manifest `author`/`maintainers`. None → `owner: unassigned — no
CODEOWNERS/OWNERS/README ownership found`. That value satisfies PASS.

PASS: all three fields on every route-`internal` row.
