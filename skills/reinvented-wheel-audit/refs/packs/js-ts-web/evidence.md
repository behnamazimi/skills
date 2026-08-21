# Evidence: js-ts-web

Read at Steps 4–6 when a row still has a proposed route (not
short-circuit keep). Skip the whole file on a keep-only run. Route
`internal`: [contract.md](../../contract.md) § Internal extract. Pin
command shape, not tool versions.

## Platform

**Purpose:** A native API is a recommendation only inside this
project's declared baseline.

Read `package.json` `engines`, `.browserslistrc` / `browserslist` in
package.json, `tsconfig.json` `compilerOptions.target` and `lib`.
Compare the API's MDN/Node baseline to those numbers.

**cwd:** Package root.
**PASS:** Each proposed native API tagged `in-baseline` or
`below-baseline`. Below-baseline → continue to installed or package;
do not recommend the native API.
**Skip-if:** No engines/browserslist/tsconfig → infer from the
*primary* CI workflow file only (the one that runs the main
test/build job). If that file doesn't name a version either, treat as
`below-baseline`.
**False positives:** `lib` in tsconfig can include APIs the runtime
does not have. Runtime (`engines`) wins over `lib`.

Check these before a package: `Intl.*` (date/number/plural),
`<dialog>` / popover, CSS `:has()`, `AbortController`,
`crypto.randomUUID`, `structuredClone`, `URLSearchParams`.

Detector → native first: **router** file-based `app/`/`pages/` when
that framework already owns routing; **styling-runtime** overlay
`<dialog>` / popover; **i18n** `Intl.PluralRules` /
`Intl.NumberFormat`; **data-fetch** `fetch` + `AbortController` when
the candidate is only headers (that case is wrapper-seam keep, not
native replace).

## Installed-library check

Route `installed`. Fill:

```markdown
- Version in tree supports the API (lockfile-resolved version vs the API's since-version):
- License already accepted (it ships today — record it, no new review):
- Bundle note (already bundled → ~zero delta; server-only dep pulled into a client bundle → flag):
```

**cwd:** Package root (lockfile alongside the manifest).
**PASS:** All three fields on every route-`installed` row.
**Skip-if:** Route is not `installed`.
**False positives:** The dependency itself has gone unmaintained since
adoption — note it, and re-route the row to `package`.

## Replacement evidence

Fill once per row whose **route** is `package`:

```markdown
- Releases (12 months):
- Issue/PR response / bus factor:
- Org-backed vs solo:
- Transitive count vs lines replaced:
- License:
- Supply-chain (new package):
- Bundle / tree-shake / types:
- Cost to remove later:
```

Fetch from the registry, Scorecard, and a supply-chain scan of the
*new* package. Scratch installs stay *outside* the audited tree.

**License field — decision table:**

| Candidate's license | Audited repo is | Call |
| --- | --- | --- |
| Permissive (MIT, Apache-2.0, BSD-\*, ISC, 0BSD) | any | compatible |
| Copyleft (GPL-\*, AGPL-\*, LGPL-\*) | proprietary/closed | veto — next route or keep (`justified-keep`) |
| Copyleft (GPL-\*, AGPL-\*, LGPL-\*) | same or compatible copyleft license | compatible |
| Unlicensed / no SPDX identifier found | any | veto — next route or keep (`justified-keep`) |
| Dual-licensed | any | compatible if *any* listed license is permissive; else apply the copyleft row |

Read SPDX from registry metadata (deps.dev / `npm view <package>
license`), not README prose. Read the audited repo the same way
(`LICENSE` / `package.json` `license`) before applying the table.
Cannot-keep rows: veto does not become `keep` — last route stays,
Notes name `unverified` fallback.

Typical **package** names when native and installed miss: router
`@tanstack/react-router` or `react-router`; store `zustand`;
data-fetch `@tanstack/react-query`; auth `better-auth` or
`next-auth`; i18n `i18next` or `next-intl`; form-engine
`react-hook-form`; styling-runtime overlay `@radix-ui/react-dialog`
(or Headless UI / Ariakit if already in tree).

### deps.dev

Fetch `https://deps.dev/npm/<package>` (scoped:
`https://deps.dev/npm/%40scope%2Fname`). Record versions in the last
12 months, license, dependency count.

**PASS:** Eight evidence-pack fields this page covers are filled. A
README-only commit is not a release.
**Skip-if:** No network to deps.dev → `npm view <package> time
license dependencies`. No network at all → `registry: unavailable`,
every evidence field `unverified` in Notes; a `package`
recommendation on unverified fields must say so.
**False positives:** Daily bot tags. Count human releases.

### OpenSSF Scorecard

`scorecard --repo=github.com/<org>/<repo> --format json`

Needs `GITHUB_AUTH_TOKEN` or `GH_TOKEN`. **PASS:** JSON against the
row. Single maintainer = flag in Notes, still eligible.
**Skip-if:** Not on GitHub, or no token and `https://scorecard.dev`
has no card → skip Scorecard, keep deps.dev + registry.
**False positives:** A high score is not a license or transitive pass.

### npm audit

In a throwaway directory **outside** the audited repo:

`npm init -y && npm install <package> --ignore-scripts && npm audit --json`

Or fetch advisories from the registry / osv.dev (no install). Use
socket.dev only when `.socket/` or a Socket CI step already exists.

**cwd:** Throwaway dir, never the app package root.
**PASS:** Known-vuln count recorded. Copyleft into proprietary is a
veto (see license table).
**Skip-if:** Candidate is not an npm package (native API).
**False positives:** Dev-only advisories on a prod dependency.
Separate them. Do not trade 50 lines for ~40 transitives.

## Spike

Paper spike only. No branch, tests, or install.

1. List existing tests that already cover the subsystem (read-only).
2. Characterization cases a later spike must add (in the report, not
   as files).
3. Estimated LOC delta: current lines vs a one-line import (`wc -l`
   on the candidate files).
4. Estimated bundle: `https://bundlephobia.com/package/<name>` labeled
   `package-cost`, or current production artifact size if already
   built. Label every figure `estimated` unless it came from a
   read-only scan of what already ships.

**cwd:** Repo root (read-only).
**PASS:** Write-up with estimated LOC and bundle/`package-cost`
whenever any row has verdict `replace`.
**Skip-if:** Every verdict is keep.
**False positives:** Treating bundlephobia as an app-delta. Call it
`package-cost`.
