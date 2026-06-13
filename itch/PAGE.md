# itch.io page kit — Hey Siri, Summarise this (The Idle Game)

> **Project title (itch "Title" field):** `Hey Siri, Summarise this (The Idle Game)`
>
> **Short description / tagline (itch field, shown wherever the project is linked — don't
> repeat the title):**
> `Siri summarises things you can already read — then summarises the summary. Forever. It does not get better.`
> *(105 chars; behaviour-first, in the game's voice, no title words repeated.)*

Single source of truth for the itch.io dashboard. Fill the dashboard top-to-bottom in this
order; every value already has a *why*. All colours are lifted verbatim from the game's own
`:root` palette in `index.html:11–16` (dark theme), so the page matches the game exactly.

Project: `hey-siri-summarise-this` · Browser HTML5 game · No build step · Runs offline.
Live: https://summarise.ianhogers.com · Repo: https://github.com/saintpepsi/hey-siri-summarise-this

---

## 1. Theme (Edit theme → colours)

Replace itch's defaults — leaving the coral link `#fa5c5c` and grey background is the dead
giveaway of an unstyled page.

| itch field | value | why (source) |
|---|---|---|
| Background | `#06070b` | game's base `--bg` (`index.html:11`) |
| Background 2 | `#1c1c22` | panel surface `--glass-solid` `rgba(28,28,34,.82)` (`index.html:12`) |
| Text | `#f5f5f7` | UI text `--ink` (`index.html:11`) |
| Link | `#0a84ff` | accent `--blue` (`index.html:15`) — replaces itch default `#fa5c5c` |
| Button (More options) | `#9d80ff` | Siri-orb purple `--accent` (`index.html:16`) |
| Font | **Lato** | closest neutral itch font to the game's SF Pro stack (`index.html:28`) |
| Size | **Large** | the game's UI is chunky / big-number; large reads as intentional |
| Screenshot display | **Auto** | dark theme; the sidebar strip doesn't clash |

---

## 2. Images

All four are generated from on-palette HTML templates. Regenerate after any rebrand with:
```bash
bun itch/generate.ts        # re-reads src/*.html → re-renders all four PNGs
```

| itch slot | file | size | notes |
|---|---|---|---|
| Cover image | `itch/cover-630x500.png` | 630×500 | itch recommended size; Siri orb + title lockup |
| Banner (page header) | `itch/banner-960x320.png` | 960×320 | replaces the page title text — keep it as the header |
| Page background | `itch/background-1920x1080.png` | 1920×1080 | dark + quiet so the content column stays readable |
| Embed background | `itch/embed-bg-1280x720.png` | 1280×720 | sits behind the playable frame (or set flat `#06070b` and skip) |

---

## 3. Trailer

itch only accepts a **YouTube or Vimeo link** — it can't host video, and a raw screen capture
is not a trailer. **Not produced yet** — tell me the kind you want (produced cut with title
cards / gameplay montage / one continuous take), length, and audio, and I'll build it.

---

## 4. Screenshots (upload 3–5, in this order)

Order = action first, core loop, distinctive feature, title last. Regenerate with:
```bash
npm run serve &             # http://localhost:8000
bun itch/screenshots.ts     # writes shot-1..4 png
```

1. `itch/shot-2-tapping.png` — **action**: numbers climbing, Siri summary + ad toast mid-play
2. `itch/shot-3-upgrades.png` — **the loop hook**: the model-upgrades / Apple Intelligence panel
3. `itch/shot-4-light.png` — **distinctive feature**: the iOS "Liquid Glass" light-mode toggle
4. `itch/shot-1-title.png` — **title / hero** state, last

---

## 5. Upload & embed settings (it's a browser game)

- **Kind of project:** HTML
- **Upload:** zip the playable files with `index.html` at the zip root:
  ```bash
  zip -r itch-build.zip index.html vendor LICENSE
  ```
  Then tick **"This file will be played in the browser."**
- **Embed options:**
  - Viewport: **1280 × 800** (the layout is responsive; this fits the two-column view)
  - **Enable "Click to launch in fullscreen"** — the big-number UI benefits from space
  - **Mobile friendly:** on (orientation: default) — the layout already reflows narrow
  - Scrollbars: on (the upgrade list runs long)
  - Automatically start on page load: optional (off keeps the cover visible first)
- **Pricing:** **No payments ($0) — keep it free.** Non-commercial parody is far safer
  legally than anything sold or "name-your-price". Don't monetise this one.
- **Never upload Apple's logo, the App Store icon, SF/system-app icons, or any real Apple
  artwork** — the generic gradient orb is deliberately not Apple's. Origin confusion is the
  one thing that breaks a parody defence.

---

## 6. Description (paste into the editor, in the game's voice)

> *Parody / satire. Not affiliated with, endorsed by, or sponsored by Apple Inc. "Apple",
> "Siri", "Hey Siri" and "Apple Intelligence" are trademarks of their respective owners, used
> here for commentary and parody only. Free, fan-made, non-commercial.*
>
> ---
>
> **Apple promised AI that would change everything.** Instead, Siri summarises messages you can
> already see — then summarises the summary. Tap **"Hey Siri, Summarise this"** and watch the
> Useless Summaries climb into the decillions. It does *not* get better. That's the joke.
>
> An idle clicker that parodies Apple Intelligence one restated notification at a time.
>
> - **Tap to summarise** — every tap restates something you could already read.
> - **Buy "AI features"** — Notification Summary, Smart Reply, Writing Tools, Genmoji, Image
>   Playground, Priority Messages, Private Cloud Compute. Each does more of nothing, faster.
> - **"Install the update that finally fixes Siri."** (It won't.) Prestige resets your progress
>   but hands you a permanent boost token.
> - **Liquid-Glass UI** — iOS-26-ish dark mode with a light toggle, sponsored-ad toasts, and
>   milestone tokens that boost everything forever.
>
> **Controls:** tap / click the button. That's the whole game. (×1 / ×10 / Max buy toggles.)
>
> Runs fully in your browser, offline, and saves to your device. No download.
>
> ▶ Play: https://summarise.ianhogers.com
> ⌨ Source (MIT): https://github.com/saintpepsi/hey-siri-summarise-this

(The parody disclaimer at the top of this block matches the game footer in `index.html`.)

---

## 7. Classification & metadata

| field | value | why |
|---|---|---|
| Classification | **Game** | it's a playable idle game |
| Kind of project | **HTML** | runs in-browser |
| Release status | **Released** | live and complete |
| Genre | **Simulation** (or "Other" → Idle/Incremental) | itch has no native Idle genre |
| Tags | `idle`, `incremental`, `clicker`, `parody`, `satire`, `comedy`, `html5`, `vanilla-js` | from `package.json` keywords + genre |
| Average session | **A few minutes** | tap-and-idle loop |
| Inputs | **Mouse**, **Touchscreen** | single tap target |
| Languages | **English** | |
| Accessibility | **One button** | literally one action |
| **AI disclosure** | answer the metadata question **honestly** | this is itch's disclosure field — disclosure, not marketing. Do **not** put "AI generated" in the cover/description copy. |

---

## Files in this kit

```
itch/
├── PAGE.md                     ← this file
├── generate.ts                 ← bun itch/generate.ts → the 4 page images
├── screenshots.ts              ← bun itch/screenshots.ts → shot-1..4 (needs npm run serve)
├── src/{cover,banner,background,embed-bg}.html
├── cover-630x500.png
├── banner-960x320.png
├── background-1920x1080.png
├── embed-bg-1280x720.png
└── shot-1-title.png  shot-2-tapping.png  shot-3-upgrades.png  shot-4-light.png
```
