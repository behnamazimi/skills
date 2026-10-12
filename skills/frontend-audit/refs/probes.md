# Probes

Run in the page context (browser console or the harness's script tool).
Return plain objects so results can be logged. Each probe is a starting
point; adapt selectors to the app.

Thresholds come from public guidelines: WCAG 2.x SC 1.4.3 (text contrast
4.5:1, or 3:1 for large text) and SC 1.4.11 (3:1 for UI components); touch
target guidance of 44 pt (Apple HIG) or 48 dp (Material); WCAG 2.2 SC 2.5.8
sets a 24 px minimum. Confirm against the guideline the project follows
before citing a number.

## Viewport and overflow

```js
({ innerWidth, innerHeight, dpr: devicePixelRatio,
   scrollWidth: document.documentElement.scrollWidth,
   scrollHeight: document.documentElement.scrollHeight,
   overflowX: document.documentElement.scrollWidth > innerWidth })
```

## Type, radius, shadow histograms

```js
(() => {
  const count = (m, k) => (m[k] = (m[k] || 0) + 1);
  const out = { sizes: {}, weights: {}, families: {}, radii: {}, shadows: {} };
  document.querySelectorAll('*').forEach((e) => {
    const s = getComputedStyle(e);
    if ([...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) {
      count(out.sizes, s.fontSize); count(out.weights, s.fontWeight);
      count(out.families, s.fontFamily.split(',')[0]);
    }
    if (s.borderRadius !== '0px') count(out.radii, s.borderRadius);
    if (s.boxShadow !== 'none') count(out.shadows, s.boxShadow.slice(0, 60));
  });
  return out;
})()
```

## Contrast scan

Covers solid backgrounds; gradients and images need a manual look.

```js
(() => {
  const ctx = document.createElement('canvas').getContext('2d');
  const rgba = (c) => { ctx.clearRect(0,0,1,1); ctx.fillStyle = '#fff'; ctx.fillStyle = c;
    ctx.fillRect(0,0,1,1); const d = ctx.getImageData(0,0,1,1).data; return [d[0],d[1],d[2],d[3]/255]; };
  const lum = ([r,g,b]) => { const f = (v) => { v/=255; return v<=.03928 ? v/12.92 : ((v+.055)/1.055)**2.4; };
    return .2126*f(r)+.7152*f(g)+.0722*f(b); };
  const bg = (e) => { for (let x = e; x; x = x.parentElement) { const b = rgba(getComputedStyle(x).backgroundColor);
    if (b[3] > .9) return b; } return [255,255,255,1]; };
  const low = {};
  document.querySelectorAll('body *').forEach((e) => {
    if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
    const s = getComputedStyle(e), f = rgba(s.color), b = bg(e);
    const mix = [0,1,2].map((i) => f[i]*f[3] + b[i]*(1-f[3]));
    const [a, c] = [lum(mix), lum(b)], ratio = (Math.max(a,c)+.05)/(Math.min(a,c)+.05);
    const large = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && +s.fontWeight >= 700);
    if (ratio < (large ? 3 : 4.5)) low[e.textContent.trim().slice(0,28)+' | '+s.fontSize] = ratio.toFixed(2);
  });
  return low;
})()
```

## Small touch targets

```js
[...document.querySelectorAll('a,button,[role=button],input,select,textarea,summary')]
  .map((e) => ({ e, r: e.getBoundingClientRect() }))
  .filter(({ r }) => r.width && (r.width < 44 || r.height < 44))
  .map(({ e, r }) => (e.getAttribute('aria-label') || e.textContent.trim().slice(0,20) || e.tagName)
    + ' ' + Math.round(r.width) + 'x' + Math.round(r.height))
```

Pseudo-element hit areas extend a target without changing its box; read
`getComputedStyle(el, '::after')` before reporting a small one.

## Primary action versus fixed chrome

```js
(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => /<primary action text>/i.test(b.textContent));
  const chrome = document.querySelector('<bottom nav selector>');
  const r = btn.getBoundingClientRect(), c = chrome.getBoundingClientRect();
  return { btnTop: r.top, btnBottom: r.bottom, chromeTop: c.top, viewport: innerHeight,
           hidden: r.bottom > c.top || r.bottom > innerHeight };
})()
```

## Scroll containers

```js
[...document.querySelectorAll('*')].filter((e) => e.scrollHeight > e.clientHeight + 5
  && ['auto','scroll'].includes(getComputedStyle(e).overflowY))
  .map((e) => e.tagName + '.' + String(e.className).slice(0, 40))
```

## Numbers with their labels

Collect every count on a screen, then compare the same entity across
screens (see [lens-content.md](lens-content.md), numeric reconciliation).

```js
[...document.body.innerText.matchAll(/[^\n]{0,40}\b\d[\d,.]*%?[^\n]{0,30}/g)].map((m) => m[0].trim())
```
