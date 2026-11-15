# Session 3 — Learn. Build. Repeat. Just Do It!

VU AI Exploration with Somphol Boonjing. Live: **https://somphol.github.io/vu-session-3/**

Static browser deck: focus, build, iterate. No build step, no runtime dependencies. Double-click `index.html` and present.

**24 numbered slides, five visible sections.** Opening agenda, then: **Learn** (7), **Build** (6), **See it**
- **16** — *Two builds. One loop.*
- **17** — *Point at the thing.* Image Annotation, real screenshot.
- **18** — *A shelf. Not a graveyard.* TubeShelf, CSS mock.
- **19** — *There is more. Take one.* Project Album (57 builds) and VU Project Ideas (54 briefs), both live links.

**Source it**
- **20** — *90% is public. 10% is people.*
- **21** — *O'Reilly Bookshelf.* Straight slide: go look at oreilly.com. About $199/year, usually around Black Friday.

**Ship it**
- **22** — *Confident. Humble.*
- **23** — *Get inspired. Then get specific.*
- **24** — *What is your blocker?*
- **25** — *Ship one thing.*

## Present

```bash
open index.html
# or
python3 -m http.server 4173   # http://localhost:4173
```

### Controls

| Input | Action |
| --- | --- |
| `→` `←` / `Space` | Move between slides |
| Mouse wheel / trackpad | Next or previous slide |
| `Home` / `End` | First / last slide |
| `O` | Slide overview |
| `N` | Speaker notes |
| `T` | Session timer (↺ resets) |
| `F` | Fullscreen |
| `?` | Shortcuts |
| `Esc` | Close panels |

Hover a keyword card for its one-line detail (also on keyboard focus). Touch devices show the detail permanently.

## Edit

- **Sections** are `data-section="Learn|Build|See it|Source it|Ship it"` on each `<section>`; `assets/deck.js` writes that into the chrome chip and leaves the cover as “Session 3”.
- **Slides** live in `index.html`, in order, as `<section class="slide">`.
- **Speaker notes** live inside each slide as `<template class="slide-notes">…</template>`.
- **Keyword cards** are `<li class="kw" tabindex="0">` with a big `.kw__k` and a hover-only `.kw__d`.
- **Diagrams** are inline SVG inside `<figure class="figure">`, using `var(--accent)` and `var(--line)`.
- **Overview labels** come from `data-title` and `data-kicker`.
- Templates: [`docs/ADDING-SLIDES.md`](docs/ADDING-SLIDES.md).

## Verify

```bash
npm install
npm run verify     # 47 checks at 1440×900, 1280×720, 390×844
```

Covers: structure, agenda, section chip, wheel, Home/End, hover-only detail, every content slide, diagram counts, screenshot, mock shelf, split bar, notes, and no overflow at all three sizes.

## Structure

```
index.html                 slides, notes, inline SVG diagrams
assets/deck.css            light theme, keyword cards, diagrams, print styles
assets/deck.js             navigation, wheel, section chip, overlays, timer
assets/img/                Image Annotation screenshots
docs/ADDING-SLIDES.md      templates + component reference
scripts/verify.mjs         headless browser checks
AGENTS.md                  handoff notes for the next agent
```

## Known limits

- **No presenter window.** Notes are an overlay on the same screen.
- **O'Reilly price and sale dates are approximate.** Check before presenting.
- **Print styles** inherited, not re-verified for 25 pages.
- **Not published.** Local-only at `~/Projects/vu-session-3`.
