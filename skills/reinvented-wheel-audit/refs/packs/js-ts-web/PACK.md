# Pack: js-ts-web

## Match

**Required** (all must hit):

1. `package.json` exists at the repo or package root (or a workspace
   member root).
2. Web signal — at least one of 2a/2b/2c hits (counts as one required
   signal; each of 2a–2c also counts toward the Step 1 tiebreak):
   - **2a.** `package.json` `dependencies` / `devDependencies` /
     `peerDependencies` contains a name matching `react`, `vue`,
     `svelte`, `solid-js`, `@angular/core`, `next`, `nuxt`,
     `@remix-run/`, `astro`, `vite`, `webpack`, `gatsby`,
     `@sveltejs/kit`, `preact`, `qwik`.
   - **2b.** `browserslist` key in `package.json`, or `.browserslistrc`.
   - **2c.** At least one `*.tsx` or `*.jsx` file outside
     `node_modules`, `dist`, `vendor`, `build`, `coverage`.

The pack matches when required signals 1 and 2 both hit. Tiebreak
count = 1 plus how many of 2a–2c hit.

Pure Node CLI or library trees with `package.json` and none of 2a–2c
do not match.

```bash
# signal 1
test -f package.json

# signal 2a (package root)
rg -q '"(react|vue|svelte|solid-js|@angular/core|next|nuxt|astro|vite|webpack|gatsby|preact|qwik|@remix-run/|@sveltejs/kit)' package.json

# signal 2b
rg -q '"browserslist"' package.json || test -f .browserslistrc

# signal 2c
rg --files -g '*.tsx' -g '*.jsx' -g '!node_modules' -g '!dist' -g '!vendor' -g '!build' -g '!coverage' | head -n 1
```

For a workspace, find members with `## Workspace` manifests. Run Match
on the workspace root; if the root misses 2a–2c, run on each member
until one member matches, then the pack is active for the workspace.

## Tools

- `npx --version` — gates jscpd / knip / depcheck
- package manager: `pnpm --version`, else `yarn --version`, else
  `npm --version`
- `tokei --version`, else `cloc --version`
- `scorecard` plus env `GITHUB_AUTH_TOKEN` or `GH_TOKEN` (presence
  only; leave the value unread)

## Workspace

Look at the current tree root for, in order: `pnpm-workspace.yaml`,
`lerna.json`, `nx.json`, `turbo.json`. First file found wins. Members
are that tool’s package list. None found → current repo only.

## Inventory

`tokei .` from the repo root; if unavailable: `cloc .`; if both
unavailable: `unofficial` `wc` on tracked files. Exclude `node_modules`,
`dist`, `vendor`, `build`, `coverage`. Coverage: `unknown` unless
`codecov.yml`, a `coverage/` artifact, or a CI coverage step exists.
Do not run the test suite.
