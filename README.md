# Apple Intelligence™ — The Idle Game

[![100% AI generated](https://img.shields.io/badge/100%25_AI_generated-Fable_5-d97757?logo=claude&logoColor=white)](https://claude.com/claude-code)

A satirical incremental ("idle clicker") game about how useless Apple Intelligence / Siri
summaries are. You tap **"Hey Siri, Summarise this"**; Siri restates things you can already
see, then summarises the summary, forever. Numbers go up into the decillions. It never gets
better — that's the joke.

This document is a full handoff for moving the project from a single hand-built HTML file
into a proper repository.

---

## 1. What it is, in one breath

- **One self-contained file:** `index.html` (~640 lines). HTML + CSS + JS in a single document.
- **Zero external requests:** [`decimal.js`](https://github.com/MikeMcl/decimal.js/) v10.4.3 (arbitrary-precision big numbers) is **inlined directly into `index.html`** — the pinned source is kept at `vendor/decimal.min.js`. No CDN, no sibling files: the game works offline, from `file://`, and can't 403 when hosted (e.g. on itch.io).
- **No build step.** No framework. Vanilla JS in one IIFE. Open the file and it runs.
- **Persists** to `localStorage` with offline progress.
- **Theme:** iOS-26-ish "Liquid Glass" look, dark mode by default with a light toggle.

> The file was originally `we_have_to_go_deeper.html` — a leftover from the game's *Inception*
> "we have to go deeper" origin before it pivoted to the Apple-AI theme. It has been renamed to
> `index.html` so GitHub Pages serves it at the root.

---

## 2. Quick start

### Run locally
It's a static file. Any of these work:

```bash
# simplest: just open it
open index.html                       # macOS

# or serve it (recommended; avoids file:// quirks)
python3 -m http.server 8000           # then visit http://localhost:8000
# or
npm run serve                         # same thing, via package.json
```

No network is required — `decimal.js` is inlined into `index.html`, so the game runs
fully offline (even straight from `file://`).

### Run the tests
```bash
npm install   # installs jsdom + decimal.js as devDependencies
npm test      # boots the game in jsdom and asserts tap/recompute/no-errors
```

### Deploy to GitHub Pages
1. Push to a repo (e.g. `main` branch).
2. Repo → **Settings → Pages → Source: Deploy from a branch → `main` / root**.
3. The bare-Pages URL is `https://saintpepsi.github.io/hey-siri-summarise-this/`.

`localStorage` and offline progress work normally on Pages (it's a real origin). No `.nojekyll`
file is needed unless you add asset paths beginning with underscores.

### Serve it from a subdomain of `ianhogers.com`
The repo ships a `CNAME` file containing `summarise.ianhogers.com` — GitHub Pages reads this to
bind the custom domain automatically. To wire it up:

1. **DNS** (at your domain registrar / DNS host for `ianhogers.com`): add a **CNAME record**

   | Type  | Host (name) | Value                      | TTL  |
   |-------|-------------|----------------------------|------|
   | CNAME | `summarise` | `saintpepsi.github.io.`    | auto |

   (A subdomain uses a `CNAME` record pointing at `saintpepsi.github.io` — only an apex/root
   domain would need the four `A` records to GitHub's IPs.)
2. **GitHub:** Repo → **Settings → Pages → Custom domain** → enter `summarise.ianhogers.com` → Save.
   Leave **Enforce HTTPS** ticked once the certificate provisions (can take a few minutes).
3. Visit **https://summarise.ianhogers.com** once DNS propagates.

> Changing the subdomain later means editing `CNAME`, the DNS record host, and the Pages custom-domain
> field to match — all three must agree. See GitHub's docs:
> https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

---

## 3. File anatomy

The single file is three parts:

| Part | What's in it |
|------|--------------|
| `<head>` `<style>` | All CSS. Theme variables, Liquid-Glass panels, the notification stack, buttons, toasts, ad/golden popups, responsive rules. |
| `<body>` markup | The static DOM skeleton: top bar, hero, panels (generators, upgrades, Apple Store, goals, settings, prestige), the notification stage, the floating action bar with the main button. |
| `<script>` IIFE | The entire game, wrapped in `(function(){ ... })()`. Organised into labelled sections (below). |

### Script sections (in order)
The JS is divided by banner comments. Approximate line numbers are for the current version and
will drift if you edit — treat the **names** as the contract, not the numbers.

| Banner | Responsibility |
|--------|----------------|
| `SUMMARY ENGINE` | Generates the absurd Siri "summary" text shown on the notification cards. Tiered by depth; name-stripped (no real people). |
| `WORD GENERATORS` | Inline word banks for Apple-Store "special editions" (`ED_*`) and procedural model names (`DI_*`). |
| `DATA` | The content tables: `GENS`, `UPS`, `APPLE_ARCH`, `META`, `ACH`, `ADS`, `RNAMES`, `PAL`. |
| `STATE` | The mutable game state: the `s` object plus module-level globals. |
| `FORMAT` | Number formatting: `fmtD` (Decimal → "3.40D"), `fmtRateD`, `fmtN`. |
| `RENDER` | DOM builders/refreshers: `buildGen`, `refreshUp`, `refreshApple`, `refreshVault`, `refreshGoals`, `updateStats`, and the 3D notification stack (`makeLayer`/`applyStack`/`pushSummary`). |
| `ACTIONS` | `tap()`, `kick()` (prestige), `spawnFloat`, `toast`. |
| `SAVE / LOAD` | `localStorage` persistence + offline progress (added last). |
| `WIRING` | Event listeners, initial render, the 100 ms game loop, the `__TEST` hook. |

---

## 4. The numbers engine (read this before touching balance)

The economy is unbounded — values reach `1e5000+` — so **every unbounded quantity is a
`decimal.js` `Decimal`, not a JS number.** A `Decimal` cannot be compared or combined with a
raw number via `+`/`<`; you must use the library API (`.plus`, `.times`, `.gte`, etc.).

- `D(x)` is the constructor shortcut (`new Decimal(x)`), with `Decimal.set({precision:30})`.
- A guard at the top of the IIFE shows a "needs internet" message and bails if `Decimal` failed to load.

**Decimal** (big, library API): `s.dream`, `s.lifetime`, `s.maxDream`, all per-second / per-click
values, all costs, and the multipliers `m.click` / `m.all` / `m.perGen[id]`, `distMul`, `appAll`,
`milestoneMul`.

**Plain JS number** (small, bounded): generator counts (`g[id]`), `s.totems`, `s.totemsEarned`,
`s.kicks`, `s.taps`, `s.caught`, meta-levels (`metaOwned[id]`), tier counters (`s.distTier`,
`s.msTier`, `s.appleGen`).

> ⚠️ **Gotcha:** several `innerHTML` strings are built with single-quoted JS. If you add copy with
> an apostrophe (`There's`) inside one of those, it terminates the string and breaks the parse.
> Use double-quoted strings, escape it (`There\'s`), or reword. This bit us once already.

---

## 5. Game systems

### Currencies
- **Useless Summaries** (`s.dream`) — the main currency. Tap or idle to earn; spend on generators, upgrades, Apple products.
- **Lifetime** (`s.lifetime`) — cumulative summaries ever made; never resets. Drives prestige rewards.
- **Max** (`s.maxDream`) — high-water mark; drives milestones.
- **Tokens** (`s.totems`) — prestige currency, spent in Settings. (Internally still named "totem" from the old theme; display says "tokens".)

### Generators — `GENS` (passive income)
Eight Apple-Intelligence features that "summarise for you." Costs scale `1.15^count`
(closed-form bulk buy in `buyCost`/`maxBuy`).

| id | Display name |
|----|--------------|
| `dreamer` | Notification Summary |
| `forger` | Smart Reply |
| `architect` | Writing Tools |
| `chemist` | Genmoji |
| `tourist` | Image Playground |
| `limbo` | Priority Messages |
| `totem` | Private Cloud Compute |
| `siriprime` | Siri |

### Upgrades — `UPS` (one-time, reset on prestige)
Twelve "Model Upgrades": `sharp1, charles, sharp2, shared, sedative, penrose, sedate2, paradox,
beach, weighted, kickproof, awake`. Each has a `req()` gate and an `apply()` that mutates the
multiplier object. The final one, `awake` ("Siri Becomes Self-Aware"), is the capstone.

### Endless procedural upgrade
After lifetime ≥ `1e9`, a repeatable **"Recursive [model name]"** upgrade appears: ×2 everything,
cost `2e9 × 7^distTier`. Folds into `distMul` (resets on prestige).

### Apple Store — `APPLE_ARCH` (persistent boosts)
Six product archetypes (`cloth, iphone, watch, airpods, vision, mac`) with programmatically
generated version numbers and prices (`base × 140^(gen-1)`). Buying one multiplies the **persistent**
`appAll`. Buy them all → the store relaunches at the next generation (`s.appleGen++`) with higher
prices and bigger boosts. These boosts survive prestige.

### Settings (meta tree) — `META` (persistent, bought with Tokens)
| id | Display name | Effect |
|----|--------------|--------|
| `reflex` | Auto-Summarise | Auto-taps N/s |
| `lucid` | Restore from Backup | Start each update with summaries already |
| `cheap` | Volume Licensing | Generators cost less |
| `heavy` | Bigger Tokens | Each Token worth more |
| `vivid` | Push Notifications | Events more frequent, frenzies longer |

### Goals — `ACH` + endless milestones
Eight fixed achievements (`a1`–`a8`), each a permanent multiplier, plus an **auto-scaling
milestone** (`milestoneTarget = 10^(5+msTier)`, +25% everything each, persists via `milestoneMul`).

### Prestige — "Install Update" (`kick()`)
Resets summaries, generators, upgrades, and `distMul`; awards **Tokens** =
`floor(sqrt(lifetime / 1e6)) − totemsEarned`. Tokens boost everything (`totemMult`) and buy meta
upgrades. Apple products, tokens, goals and milestones carry over. Cycles a per-update accent colour
and a macOS-style codename (`RNAMES`).

### The multiplier model — `recompute()`
This is the heart of balance. `recompute()` rebuilds the multiplier object `m` from scratch:

```
m.all   = everything (multiplies BOTH per-second and per-click)
m.click = taps only
m.gen   = (folded into perGen) generators only
m.perGen[id] = a single generator
```

It folds `distMul · appAll · milestoneMul` into `m.all`, applies owned `UPS`, then applies earned
`ACH` boosts. **Call `recompute()` after any change to owned upgrades, achievements, or the
persistent multipliers.** `perClick()` and `perSecBase()` derive everything from `m` + generator
counts + `totemMult()`.

### Summary text + notification stack
- `generateLine()` composes absurd one-liners; ~32% route through an **inline mini-faker**
  (`fakerLine`, banks `FK_JOB/FK_PROD/FK_ANIM/FK_PLACE/FK_PHRASE`). There is **no external faker
  dependency** — it was removed because the CDN load failed.
- Tapping pushes a card onto a 3D receding stack (`pushSummary` → `makeLayer` → `applyStack`),
  throttled to one new card per ~260 ms; `MAXL = 6` visible cards. Cards use the opaque
  `--glass-solid` colour so the front card stays readable.

### Events
- **Golden "Someone is texting…"** popup drifts across screen; tapping gives a Summary Frenzy ×7, a lump, or a surge.
- **"Sponsored" Apple ads** pop up; "Buy now" gives a small bonus.

---

## 6. State reference

```js
// the s object (STATE section)
s = {
  dream, lifetime, maxDream,      // Decimal
  totems, totemsEarned,           // number  (prestige currency)
  kicks, taps, caught,            // number  (counters)
  paradox,                        // bool    (derived by recompute; not saved)
  frenzyUntil, frenzyMult,        // ephemeral event state (not saved)
  distTier, msTier, appleGen      // number  (tier counters)
}

// module-level globals
g            // { genId: count }          generator counts
owned        // { upgradeId: true }        bought upgrades (reset on prestige)
appleOwned   // { productId: true }        owned Apple products in current gen
metaOwned    // { metaId: level }          Settings tree levels
achDone      // { achId: true }            unlocked achievements
distMul      // Decimal  (resets on prestige)
appAll       // Decimal  (persists — Apple Store boosts)
milestoneMul // Decimal  (persists — milestones)
procName     // string   (current procedural model name, cosmetic)
appleProducts// []        (regenerated by genApple())
m            // { click, all, perGen } — rebuilt by recompute()
buyAmt       // 1 | 10 | "M"  bulk-buy selection
```

### Key functions

| Function | Purpose |
|----------|---------|
| `recompute()` | Rebuild `m` from owned upgrades / achievements / persistent multipliers. |
| `perSecBase()` / `perSecond()` / `perClick()` | Income math (the latter two apply frenzy). |
| `pendingTotems()` | Tokens you'd get from prestiging now. |
| `buyCost(x,k)` / `maxBuy(x)` | Closed-form generator pricing for bulk buy. |
| `genApple()` / `applePrice()` / `appleBoost()` | (Re)generate the Apple Store for the current gen. |
| `buyGen/buyUp/buyProc/buyApple/buyMeta` | Purchase handlers (spend, mutate, refresh). |
| `tap()` / `kick()` | Core click and prestige actions. |
| `updateStats()` | Push current numbers into the DOM every tick. |
| `tick()` | The 100 ms loop: income, events, stats, periodic list refreshes. |

### DOM contract (element IDs the JS depends on)
`go, kick, resetbtn, themebtn, wndismiss, heronum, perclick, persec, totems, totembal, totemmult,
variantcount, realitybadge, genlist, uplist, applelist, applegenlab, goallist, vaultlist, stage,
frenzy, clickzone, totem`. Renaming any of these requires updating the JS.

---

## 7. Save system

State serialises to `localStorage` under the key **`siri_idle_save_v1`**.

- **Saved** (`snapshot()`): `v, t` (timestamp), the `s` scalars, `g`, `owned`, `appleOwned`,
  `metaOwned`, `achDone`, the three persistent multipliers (as strings), `procName`, `buyAmt`, `theme`.
  Decimals are stored via `.toString()` and reconstructed with `D()`.
- **Not saved (derived):** `m` (rebuilt by `recompute()`), `s.paradox` (re-derived from owned
  upgrades), `frenzyUntil/frenzyMult` and the golden/ad timers (reset on load).
- **Save triggers:** every 15 s, plus `beforeunload`, `pagehide`, and `visibilitychange→hidden`.
- **Load:** on boot, `applySave()` runs *before* `genApple()`/`recompute()`/render so the restored
  `appleGen` and multipliers are used.
- **Offline progress:** `offlineGain()` credits `perSecond × elapsed` (including Auto-Summarise),
  capped at **12 h**, ignoring gaps under 60 s, with a "while you were away" toast.
- **Reset:** the "Erase save & restart" button confirms, clears the key, and reloads.
- Every storage call is wrapped in try/catch (`lsGet/lsSet/lsDel`) so a blocked-storage environment
  degrades to a normal non-persistent session instead of throwing.

**Bumping the schema:** if you change the shape incompatibly, increment the key to
`siri_idle_save_v2` (and optionally write a migration). `applySave` already tolerates missing fields.

---

## 8. Testing

The repo ships a Node + [`jsdom`](https://github.com/jsdom/jsdom) test harness: `test/harness.mjs`
boots the game, `test/game.test.mjs` asserts behaviour, and `npm test` runs them via the built-in
`node --test` runner (no extra test framework). The notes below explain how the harness works.

The script exposes a hook when `window.__TEST` is truthy (set it in `beforeParse`):

```js
window.__game = {
  D, fmtD, s, g, m, tap, buyGen, buyApple, buyProc, buyMeta, kick,
  perSecond, perClick, maxBuy, buyCost, recompute, tick,
  appleProducts(), appleGen(), appAll(), distMul(), milestoneMul(),
  setDream(v), addLifetime(v), setTotems(v),
  metaOwned, appleOwned, genApple, GENS, APPLE_ARCH
};
```

Setting `__TEST` also disables the `setInterval` loop so tests drive `tick()` manually.

Minimal harness (the one used to validate this build):

```js
// test/harness.mjs
import fs from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import Decimal from 'decimal.js';

export function boot({ test = false, seed = null } = {}) {
  let html = fs.readFileSync('index.html', 'utf8')
    .replace(/<script src="https:\/\/cdnjs[^"]*"><\/script>\s*/g, ''); // strip CDN; inject locally
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push(e.detail?.message || e.message));
  const dom = new JSDOM(html, {
    url: 'https://x.test/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.Decimal = Decimal;
      w.requestAnimationFrame = cb => cb(0);
      w.addEventListener('error', ev => errors.push(ev.error?.message || ev.message));
      if (test) w.__TEST = true;
      if (seed) try { w.localStorage.setItem('siri_idle_save_v1', seed); } catch {}
    }
  });
  return { dom, window: dom.window, document: dom.window.document, errors };
}
```

Things worth asserting: zero `errors` after exercising tap/buy/kick/theme/dismiss; a buy actually
spends the right cost; `recompute()` produces stable multipliers; a seeded old save loads and
offline progress is credited; bulk-buy `maxBuy` never overspends.

> Note: the loop keeps the Node process alive — call `process.exit(0)` at the end of a test run, or
> use a runner that tears down jsdom.

---

## 9. The vendored dependency

`decimal.js` v10.4.3 is **inlined directly into `index.html`** (in a `<script id="decimal-lib">`
block in `<head>`), making the file a single, truly self-contained document: no CDN request, no
sibling files, works offline and from `file://`, and — importantly for hosts like itch.io that
serve uploads from a CDN — nothing that can return a 404/403 and leave `Decimal` undefined. The
version is pinned (10.4.3, matching the `devDependencies` in `package.json`) and the
`typeof Decimal === "undefined"` guard is retained as defensive insurance.

The pinned minified source is kept at `vendor/decimal.min.js`. To update the library later:
replace that file with a new pinned version (from https://github.com/MikeMcl/decimal.js), bump
the version in `package.json`, re-inline it, then re-run `npm test`:

```bash
# re-inline vendor/decimal.min.js into the <script id="decimal-lib"> block of index.html
node -e 'const fs=require("fs");const lib=fs.readFileSync("vendor/decimal.min.js","utf8");let h=fs.readFileSync("index.html","utf8");h=h.replace(/(<script id="decimal-lib">)[\s\S]*?(<\/script>)/,(m,a,b)=>a+lib+b);fs.writeFileSync("index.html",h)'
npm test
```

> The jsdom test harness (`test/harness.mjs`) strips this `<script id="decimal-lib">` block and
> injects `Decimal` from the npm package instead, so tests never execute the minified bundle.

---

## 10. Suggested repo structure

Two reasonable shapes. Pick based on how much you want to fiddle.

### Option A — keep it a single file (pragmatic, zero tooling)
```
.
├── index.html            # the game (renamed)
├── vendor/decimal.min.js # vendored dependency
├── README.md             # this doc
├── LICENSE
└── test/
    ├── harness.mjs
    └── game.test.mjs
```
Pros: matches what it is today, nothing to build, trivial to deploy. Cons: editing CSS/JS inside
one big file.

### Option B — split for maintainability
```
.
├── index.html            # markup + <link>/<script> tags only
├── src/
│   ├── styles.css
│   └── game.js
├── vendor/decimal.min.js
├── test/ ...
├── package.json
└── README.md
```
Splitting is mechanical: move the `<style>` body to `styles.css`, the IIFE to `game.js`, link both.
No bundler needed (they're plain files). Add a bundler later only if you want minification.

### Tooling to add either way
- `package.json` with `"type": "module"`, a `test` script, and `jsdom`/`decimal.js` as devDeps.
- A GitHub Action that runs `node --check` on the script and the jsdom tests on push.
- `LICENSE` (MIT is typical for a toy game).

Example CI:
```yaml
# .github/workflows/ci.yml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm test
```

---

## 11. Known constraints & gotchas

- **Big numbers are Decimals.** Don't mix with raw `+`/`<`. See §4.
- **Single-quoted `innerHTML` + apostrophes** breaks parsing. See §4.
- **Claude artifact sandbox** blocks `localStorage` and external scripts — irrelevant for GitHub
  Pages, but it's why the storage calls are defensively wrapped.
- **The in-game "What's New" panel is intentionally *not* a real changelog** — it still describes the
  old dream-diving version. That inconsistency is a deliberate bit (a bad AI product with a bad
  changelog). Keep a real CHANGELOG.md separately if you want one.
- **Decimal CDN = first-load network requirement.** Vendor it (§9).

---

## 12. Legal / naming note

This is **parody/satire** and is not affiliated with, endorsed by, or sponsored by Apple Inc.
"Apple", "Siri", "Apple Intelligence", and product names are trademarks of their respective owners
and are used here only for commentary and parody. Before publishing publicly, consider:
- a one-line disclaimer in the README and footer,
- not shipping any actual Apple logos/marks or implying endorsement,
- picking a distinct repo/project name (the in-app title can stay as the joke).

---

## 13. Roadmap ideas (optional)

From earlier design discussion — the macro curve self-throttles fine (every reward is paired with a
faster-growing cost), but the **prestige incentive is soft**: tokens are path-independent and only
scale linearly, so there's little penalty for prestiging early beyond momentum loss. If you want
prestige to feel more meaningful:
- compounding tokens (`1.02^totems`) instead of linear,
- a flat per-update Reality multiplier,
- gate the deepest content behind a number of updates,
- proportional restart tied to your best run.

None of these are implemented; they're levers if the mid-game ever feels flat.

---

*Generated as a handoff for the single-file build `we_have_to_go_deeper.html`.*
