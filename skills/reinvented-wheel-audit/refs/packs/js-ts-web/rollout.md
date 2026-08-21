# Rollout: js-ts-web

Read at Step 7 (full-path verdict `replace` or `extract`; short path
when taxonomy risk is `dangerous` or the code touches UI). Skip the
whole file on a keep-only run. Name rollout in the report; leave bots,
lint rules, flags, and CI unchanged.

## Pin + update bot

Name the pin and the bot: Renovate default; Dependabot only when
`.github/dependabot.yml` already exists. Do not write `renovate.json`
or edit the lockfile. Route `installed` rows: name the existing
resolved version. Route `internal` rows: name the pin once the package
exists (semver in the org registry, or the monorepo path from
[contract.md](../../contract.md) Internal extract).

**PASS:** Notes name the exact version to pin and which bot already
exists (or “add Renovate”).
**Skip-if:** Short path and not `dangerous`/UI.
**False positives:** Naming a bot whose glob ignores this package.

## Lint ban

Detect the import-restriction mechanism the repo already runs from
config on disk (`.eslintrc*`, `eslint.config.*`, `.oxlintrc.json`,
`oxlint.config.ts`, `biome.json`). Emit a copy-pasteable deny snippet
for **that** tool only when this file has a recipe whose rule shape
you can confirm from that config or from the snippet below. If the
tool does not support per-import-name restrictions, emit
`lint: unverified` and name the forbidden path in prose.

Route `internal` rows: ban the duplicated local paths across every
adopting repo, pointing at the future internal package name. Do not
add the rule.

**ESLint** (`eslint.config.*` / `.eslintrc*`) and **oxlint**
(`.oxlintrc.json` / `oxlint.config.ts`) share this shape — oxlint
implements `eslint/no-restricted-imports`:

```json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "paths": [{
        "name": "<old-module>",
        "message": "Use <replacement> (see reinvented-wheel ADR)."
      }]
    }]
  }
}
```

**Biome** (`biome.json`): copy the repo's existing
`noRestrictedImports` shape if present; otherwise `lint: unverified`.

**PASS:** Snippet matching the repo’s existing tool, or
`lint: unverified` plus the forbidden path in prose.
**Skip-if:** No such tool → `lint: unavailable` and still name the
forbidden path in prose.
**False positives:** Banning a wrapper-seam import.

## Rollback

Name a feature flag if the repo already has one; otherwise name
“revertible branch / stacked PR.” Do not create the flag.

**PASS:** Rollback path named on the row.
**Skip-if:** Effort S native deletion with no runtime behavior change.
**False positives:** A flag that cannot restore the old path.

## a11y regression (UI)

Name the checks a later PR must run (Tab/Shift+Tab, Enter/Space,
Escape, arrows, one SR pass). Do not add test files.

**PASS:** Those checks named in Notes, or `a11y: not-a-widget`.
**Skip-if:** Swap does not touch UI.

Applies to **styling-runtime** overlay kits and any replace that
owns focus or keyboard.

## SSR compatibility

Name “verify import from the server/runtime entry this app actually
uses.” Do not install the package to test it.

**PASS:** SSR/runtime check named, or `ssr: not-applicable` when there
is no server render.
**Skip-if:** App is not server-rendered.
