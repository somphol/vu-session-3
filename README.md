# Session 3 — Learn. Build. Repeat. Just Do It!

VU AI Exploration with Somphol Boonjing. Live: **https://somphol.github.io/vu-session-3/**

Static browser deck: focus, build, iterate. No build step, no runtime dependencies. Double-click `index.html` and present.

**24 numbered slides, five visible sections.** Opening agenda, then: **Learn** (7), **Build** (6), **See it** (3), **Source it** (3), **Ship it** (4). The current section is always shown in the top chrome. Every slide is big keywords plus one diagram; detail appears on hover or focus, and the full script is in the speaker notes (`N`).

## Slides

**Agenda**
- **01** — *Five parts. One loop.* Learn / Build / See it / Source it / Ship it.

**Learn**
- **02** — *Everything is available. Nothing is finished.*
- **03** — *Pick a semester. Not a universe.*
- **04** — *One tab. One question.*
- **05** — *Do your own research.*
- **06** — *Feed it everything.* NotebookLM.
- **07** — *Talk it out. Keep the wheel.*
- **08** — *Question your own answer.*

**Build**
- **09** — *Start with your own pain.*
- **10** — *Build anything. Any platform.*
- **11** — *The build is the syllabus.*
- **12** — *Start. Iterate. Refine. New idea.*
- **13** — *Effort is the algorithm.*
- **14** — *Build in public. Learn in public.*
- **15** — *Show your work. Make it fun.*

**See it**
- **16** — *Two builds. One loop.*
- **17** — *Point at the thing.* Image Annotation, real screenshot.
- **18** — *A shelf. Not a graveyard.* TubeShelf, CSS mock.

**Source it**
- **19** — *90% is public. 10% is people.*
- **20** — *O'Reilly Bookshelf.* Straight slide: go look at oreilly.com. About $199/year, usually around Black Friday.

**Ship it**
- **21** — *Confident. Humble.*
- **22** — *Get inspired. Then get specific.*
- **23** — *What is your blocker?*
- **24** — *Ship one thing.*

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
npm run verify     # 45 checks at 1440×900, 1280×720, 390×844
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
