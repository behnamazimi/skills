# Detectors: js-ts-web

Read at Step 2 (full path) and Step 3 (short path: match the named
file against include globs/symbols). Exclude `node_modules`, `dist`,
`vendor`, `build`, `coverage`, `*.md`. Delegate-import drop:
[contract.md](../../contract.md).

## Definition filter

```bash
rg -l -g '!node_modules' -g '!vendor' -g '!dist' -g '!build' \
  -e '^(export )?((default|async) )*(function|const|class|type|interface|enum) NAME\b'
```

Call-sites, JSX usage, schema methods, and re-export barrels are not
definitions.

Catch-all trees (`lib/`, `common/`, `pkg/`, `internal/`, `shared/`):
a file is a candidate only when include/required hits; listing every
file in those trees is a fail. `utils/` and `helpers/` are not a
detector — only files that hit a detector below.

Lodash-style names (`debounce`, `deepClone`, `isEmpty`) are not
detectors on the full path.

---

## router

| Field | Content |
| --- | --- |
| **id** | `router` |
| **include** | globs `**/router.{js,ts,jsx,tsx}`, `**/routes.{js,ts,jsx,tsx}`, `**/src/router/**`, `**/src/routes/**`; symbols `createBrowserHistory`, `pathToRegexp`, `path-to-regexp`, `matchPath`, `popstate`, `hashchange` |
| **required** | (defines `match` **and** `navigate`) **or** ((`popstate` or `hashchange` listener) **and** a locally defined `Link`/`NavLink` component) **or** (`src/router/` or `src/routes/` with 2+ files that define path matching) |
| **optional** | custom history stack; `path-to-regexp`; nested route config object |
| **size gate** | ≥80 LOC across detector files, or 2+ files in the router folder |
| **delegate drop** | `react-router`, `react-router-dom`, `next/navigation`, `next/router`, `@tanstack/react-router`, `vue-router`, `wouter`, `expo-router`, `@reach/router` |
| **bucket hint** | `genuine` |
| **typical replacement** | file-based routing when Next/Nuxt/Remix/SvelteKit already owns `app/`/`pages/`/`routes/`; else `@tanstack/react-router` or `react-router` |
| **keep / wrapper-seam** | thin re-export of a delegate library; or the framework’s own `app/`/`pages/` files |
| **false positives** | Next `app/` or `pages/` trees; Nuxt `pages/`; Remix `app/routes/`; SvelteKit `src/routes/`; CSS `router` classes |
| **cheap check** | `rg --files -g '**/app/**/page.{js,jsx,ts,tsx}' -g '**/pages/**/*.{js,jsx,ts,tsx}' -g '**/src/routes/**/+page.{js,ts,svelte}'`. Hit on the candidate path → `not-a-system` (framework file routing). |
| **cannot-keep** | no |

---

## store

| Field | Content |
| --- | --- |
| **id** | `store` |
| **include** | globs `**/store.{js,ts,jsx,tsx}`, `**/src/store/**`, `**/src/stores/**`; symbols `createStore`, `getState`, `subscribe`, `StoreContext`, `useStore` |
| **required** | (`getState` **and** `setState` **and** `subscribe` defined) **or** (a React/Vue context whose value is an object with ≥4 app-data keys) **or** (`src/store/` or `src/stores/` with 2+ modules exporting mutators) |
| **optional** | middleware; persist-to-storage; time-travel; cross-tab sync |
| **size gate** | ≥100 LOC across detector files, or context value with ≥4 keys |
| **delegate drop** | `zustand`, `@reduxjs/toolkit`, `redux`, `jotai`, `recoil`, `valtio`, `mobx`, `mobx-state-tree`, `pinia`, `nanostores` |
| **bucket hint** | `genuine` |
| **typical replacement** | `zustand`; `@reduxjs/toolkit` only if the repo already uses Redux |
| **keep / wrapper-seam** | theme/locale/auth-user context with a few fields; thin bind around a delegate store |
| **false positives** | UI “store locator”; cookie shops; single-purpose `useTheme` |
| **cheap check** | `rg` the candidate for `createContext` / `Vue.provide` with ≤3 value keys and no `subscribe` → `not-a-system`. |
| **cannot-keep** | no |

---

## data-fetch

| Field | Content |
| --- | --- |
| **id** | `data-fetch` |
| **include** | globs `**/apiClient.*`, `**/fetcher.*`, `**/httpClient.*`, `**/useFetch.*`, `**/useQuery.*`, `**/src/api/**`; symbols `apiClient`, `fetchWrapper`, `interceptor`, `createQuery`, `useFetch`, `useApi` |
| **required** | (URL- or key-keyed `Map`/`cache` **and** (retry or interceptor)) **or** a locally defined `useQuery` / `useFetch` / `createQuery` with loading/error/data state |
| **optional** | dedupe in-flight; stale-while-revalidate; request cancellation via `AbortController` |
| **size gate** | ≥80 LOC, or cache+retry in the same module |
| **delegate drop** | `@tanstack/react-query`, `@tanstack/vue-query`, `swr`, `@apollo/client`, `urql`, `@reduxjs/toolkit/query`, `ky`, `axios`, `ofetch` |
| **bucket hint** | `genuine` |
| **typical replacement** | native `fetch` + thin wrapper-seam when only base URL/headers; else `@tanstack/react-query` or `swr` if already in tree |
| **keep / wrapper-seam** | `lib/api.ts` (or equivalent) that only sets base URL, headers, or credentials and calls `fetch`/`ky`/`axios` |
| **false positives** | generated OpenAPI clients; Next `app/api` route handlers (product endpoints, not a client library) |
| **cheap check** | file ≤60 LOC **and** no cache/`useQuery` definition → wrapper-seam keep. `app/api` / `pages/api` path → `not-a-system`. |
| **cannot-keep** | no |

`ky`/`axios`/`ofetch` drop only when the file is a thin wrapper around
them. A local cache+retry **beside** those imports stays nominated.

---

## auth

| Field | Content |
| --- | --- |
| **id** | `auth` |
| **include** | globs `**/auth/**`, `**/AuthProvider.*`, `**/session.*`; symbols `AuthProvider`, `jwtDecode`, `jwtVerify`, `parseJwt`, `refreshToken`, `csrf`, `csrfToken`, `encrypt`, `decrypt`, `simpleEncrypt`, `sanitize`, `xss`, `escapeHtml`, `escapeXSS` |
| **required** | (token refresh loop **or** JWT parse/verify defined **or** session-owning `AuthProvider`) **or** (`src/auth/` with 2+ files) **or** (local `encrypt`/`decrypt`/`jwtVerify`/`escapeHtml`/`csrfToken` **definition**) |
| **optional** | cookie session rolling; role/permission graph; CSRF token helper |
| **size gate** | ≥60 LOC, or any cannot-keep definition |
| **delegate drop** | `next-auth`, `@auth/core`, `@clerk/`, `@clerk/nextjs`, `better-auth`, `lucia`, `firebase/auth`, `@supabase/auth-js`, `@supabase/supabase-js`, `auth0`, `jose`, `jsonwebtoken`, `dompurify`, `isomorphic-dompurify`, `sanitize-html`, `node:crypto` (or `crypto.subtle` / `createCipheriv` call) |
| **bucket hint** | `dangerous` |
| **typical replacement** | Auth.js / Better Auth / Clerk when the app needs hosted auth; `jose` for JWT; `node:crypto` / WebCrypto for crypto; `DOMPurify` or the framework escaper for HTML |
| **keep / wrapper-seam** | thin wrapper that only calls a delegate auth SDK |
| **false positives** | Clerk/Auth.js config files; Firebase init |
| **cheap check** | `rg` definition of `jwtVerify`/`parseJwt`/`encrypt`/`decrypt`/`escapeHtml`/`escapeXSS`/`csrf` without a delegate import. Hit → cannot-keep stands. Miss and file only re-exports a delegate → drop. |
| **cannot-keep** | **yes** when the surviving definition is hand-rolled JWT verify, CSRF, XSS escaping, or encrypt/decrypt. Other auth (session provider over a delegate) is not cannot-keep. |

Already-delegating crypto/JWT/XSS files drop at Step 2 (not a keep
row). Remaining hand-rolled those four cannot resolve to `keep`.

---

## i18n

| Field | Content |
| --- | --- |
| **id** | `i18n` |
| **include** | globs `**/i18n/**`, `**/locales/**`, `**/messages/**`, `**/lang/**`; symbols `translate`, `\bt(`, `pluralize`, `formatCurrency`, `formatMoney`, `Intl.PluralRules` polyfill |
| **required** | (locally defined `t` / `translate` **and** a dictionary tree `locales/` / `messages/` / `lang/` / `i18n/`) **or** homemade plural rules (`pluralize` / `plural` definition) **or** homemade `formatCurrency` / `formatMoney` |
| **optional** | ICU message syntax; locale switcher; lazy locale load |
| **size gate** | ≥40 LOC of runtime helper, or 2+ locale JSON/YAML files plus a `t()` |
| **delegate drop** | `i18next`, `react-i18next`, `next-intl`, `react-intl`, `vue-i18n`, `@lingui/core`, `@lingui/react`, `typesafe-i18n`, `@formatjs/intl` |
| **bucket hint** | `dangerous` when locale infra exists; else `genuine` |
| **typical replacement** | `Intl.PluralRules` / `Intl.NumberFormat` when in baseline; else `next-intl` (Next) or `i18next` |
| **keep / wrapper-seam** | single-locale string map with no `t()` engine |
| **false positives** | one `en.json` used as copy deck; CMS translation exports |
| **cheap check** | manifest `rg` for `i18next`, `next-intl`, `@lingui/`, `react-intl`, `vue-i18n`, `formatjs`, `typesafe-i18n` **or** a catalog tree `locales/`, `messages/`, `lang/`, `i18n/`. Both empty → `no-i18n`; keep allowed; residual hazard “breaks if a locale is added.” Either hit → hint `dangerous` stands. |
| **cannot-keep** | no |

---

## form-engine

| Field | Content |
| --- | --- |
| **id** | `form-engine` |
| **include** | globs `**/form/**`, `**/useForm.*`, `**/FormProvider.*`; symbols `useForm`, `register`, `FormProvider`, `validateField`, `touched` |
| **required** | reusable `register` **and** (`touched` or `dirty`) **and** (`errors` or `validate`) defined in a shared module (not a single page file) |
| **optional** | schema adapter; field arrays; wizard/stepper |
| **size gate** | ≥80 LOC in the shared module, or 2+ consuming form pages |
| **delegate drop** | `react-hook-form`, `formik`, `@tanstack/react-form`, `final-form`, `vee-validate`, `@angular/forms` |
| **bucket hint** | `genuine` |
| **typical replacement** | `react-hook-form`; `@tanstack/react-form` if TanStack is already in tree |
| **keep / wrapper-seam** | one page with native `required`/`pattern`/`constraint validation`; thin adapter over a delegate |
| **false positives** | HTML `<form>` pages; server actions that only parse `FormData` |
| **cheap check** | single file, ≤40 LOC, no `register` export used from 2+ files → `not-a-system`. |
| **cannot-keep** | no |

---

## styling-runtime

| Field | Content |
| --- | --- |
| **id** | `styling-runtime` |
| **include** | symbols `styled(`, `css\``, `createTheme`, `document.createElement('style')`; globs `**/styled.*`, `**/theme.*`, `**/css-in-js/**`; overlay kit names `Modal`, `Dialog`, `Dropdown`, `Combobox`, `DatePicker`, `Tooltip`, `Popover` **defined** in-repo (2+ of those names) |
| **required** | (homemade `styled` / `css` tagged template / `createTheme` **or** runtime `<style>` injection) **or** (2+ of Modal/Dialog/Dropdown/Combobox/DatePicker/Tooltip/Popover **defined** locally as a reusable kit) |
| **optional** | token pipeline; className runtime hash; focus-trap inside the overlay kit |
| **size gate** | ≥80 LOC for runtime CSS; overlay kit = 2+ widget definitions |
| **delegate drop** | `styled-components`, `@emotion/react`, `@emotion/styled`, `@stitches/core`, `@vanilla-extract/css`, `linaria`, `@pandacss/dev`, `tailwindcss`; overlay: `react-aria-components`, `@react-aria/`, `@radix-ui/`, `@headlessui/`, `@ariakit/` |
| **bucket hint** | `genuine` for CSS runtime; `dangerous` for overlay kit (keyboard/focus); `trivial-keep` for `cn`/`classNames`/`clsx` joiners ≤20 LOC with no untrusted-input branch |
| **typical replacement** | existing CSS modules / Tailwind if already the system; else `@vanilla-extract/css` or the repo’s CSS tool. Overlay: `<dialog>` / popover when in baseline; else Radix (Headless UI or Ariakit only if already in tree) |
| **keep / wrapper-seam** | `cn()`/`clsx` ≤20 LOC; CSS modules + a few variables; one page-local modal |
| **false positives** | Tailwind config; a single page `<dialog>`; `classNames` on a component that already imports `clsx` |
| **cheap check** | (1) `cn`/`classNames`/`clsx` local definition ≤20 LOC, no untrusted HTML → trivial-keep. (2) exactly one of Modal/Dialog/… defined, used in one file → `not-a-system`. (3) `tailwind.config.*` or `postcss` tailwind plugin present **and** candidate is a `css()` runtime → still a candidate (parallel systems). |
| **cannot-keep** | no |

Overlay kit sanitize/XSS definitions are classified under **auth**
(`cannot-keep`), not here.

---

## Amplifiers

Do not invent a new detector id. Attach to rows that already have an
id from the tables above.

### jscpd

```bash
npx jscpd . --min-lines 5 --min-tokens 50 \
  --format javascript,typescript \
  --reporters console \
  --output "${TMPDIR:-/tmp}/jscpd-reinvented-wheel" \
  --ignore '**/node_modules/**,**/dist/**,**/coverage/**,**/*.min.js,**/migrations/**,**/*.md,**/__tests__/**,**/*.test.*,**/*.spec.*,**/fixtures/**,**/generated/**'
```

`--output` outside the audited tree. Do not wrap in `timeout`. If
still running with no clone output after two minutes, kill and record
`jscpd: truncated`. Multi-repo: extra path per root. PASS: clone pairs
after dropping docs, migrations, tests, fixtures, generated sources,
license headers. Raise **duplication count** on the matching detector
row. Skip-if: no JS/TS, or `npx` unavailable → `jscpd: unavailable`.

### High-LOC, no third-party import

```bash
rg --files -g '*.ts' -g '*.tsx' -g '*.js' -g '*.jsx' \
  -g '!node_modules' -g '!dist' -g '!coverage' -g '!**/*.d.ts' |
while IFS= read -r f; do
  n=$(wc -l < "$f")
  [ "$n" -ge 200 ] || continue
  rg -q "from ['\"][@a-zA-Z0-9]" "$f" && continue
  rg -q "require\\(['\"][@a-zA-Z0-9]" "$f" && continue
  printf '%s\t%s\n' "$n" "$f"
done
```

Then definition filter + delegate drop + **must still match an
include glob or symbol of a detector above**. Confidence starts
**low** if required clauses miss. Skip-if: `rg` or `wc` missing →
`high-loc: unavailable`.

### Installed-dep inverse

Read `package.json` `dependencies` (not `devDependencies`). For each
detector’s **delegate drop** / **typical replacement** names, if the
package is in the manifest and a hand-rolled candidate for that
detector survived, flag the row `already-installed`. Notes: blame
question for Step 6. Skip-if: no `package.json` →
`installed-deps: unavailable`. False positives: optional/peer; lockfile
major that predates the API — check resolved version.

### knip (Notes only)

`npx knip --dependencies`; fallback `npx depcheck`. Unused-dep list
is Notes on matching candidate rows, not a new source. Skip-if: no
`package.json` or `npx` unavailable.
