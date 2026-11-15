# Session 3 — Learn. Build. Repeat. Just Do It!

VU AI Exploration with Somphol Boonjing.
Live: **https://somphol.github.io/vu-session-3/**

Static browser deck: focus, build, iterate. No build step, no runtime dependencies. Double-click `index.html` and present.

**29 numbered slides, five visible sections**, each section opened by a divider and named in the top chrome: **Learn** (7), **Build** (7), **See it** (4), **Source it** (2), **Ship it** (4), plus the agenda.

## Slides

**01 — Agenda** · *Five parts. One loop.*

**Learn** — divider **02**
- **03** *Everything is available. Nothing is finished.*
- **04** *Pick a semester. Not a universe.*
- **05** *One tab. One question.*
- **06** *Do your own research.*
- **07** *Feed it everything.* NotebookLM.
- **08** *Talk it out. Keep the wheel.*
- **09** *Question your own answer.*

**Build** — divider **10**
- **11** *Start with your own pain.*
- **12** *Build anything. Any platform.*
- **13** *The build is the syllabus.*
- **14** *Start. Iterate. Refine. New idea.*
- **15** *Effort is the algorithm.*
- **16** *Build in public. Learn in public.*
- **17** *Show your work. Make it fun.*

**See it** — divider **18** (*Two builds. One loop.*)
- **19** *Point at the thing.* Image Annotation, real screenshot.
- **20** *A shelf. Not a graveyard.* TubeShelf, CSS mock.
- **21** *There is more. Take one.* Project Album and VU Project Ideas, live links.

**Source it** — divider **22**
- **23** *90% is public. 10% is people.*
- **24** *O'Reilly Bookshelf.* Go look at oreilly.com. About $199/year, usually around Black Friday.

**Ship it** — divider **25**
- **26** *Confident. Humble.*
- **27** *Get inspired. Then get specific.*
- **28** *What is your blocker?*
- **29** *Ship one thing.*

## Present

```bash
open index.html
# or
python3 -m http.server 4173   # http://localhost:4173
```

`#2` is the agenda, `#3` the first divider, and so on.

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

Hover a keyword card for its one-line detail (also on keyboard focus). Touch devices show detail permanently.

## Edit

- **Sections** are `data-section="Learn|Build|See it|Source it|Ship it"`; the chrome chip follows the active slide. Each section opens with a `slide--section` divider.
- **Slides** live in `index.html`, in order, as `<section class="slide">`.
- **Speaker notes** live inside each slide as `<template class="slide-notes">…</template>`.
- **Keyword cards** are `<li class="kw" tabindex="0">` with a big `.kw__k` and a hover-only `.kw__d`.
- **Diagrams** are inline SVG inside `<figure class="figure">`.
- **Overview labels** come from `data-title` and `data-kicker`.
- Templates: [`docs/ADDING-SLIDES.md`](docs/ADDING-SLIDES.md).

## Verify

```bash
npm install
npm run verify     # 49 checks at 1440×900, 1280×720, 390×844
```

Covers structure, agenda, dividers, section chip, wheel, Home/End, hover-only detail, every content slide, diagram counts, the inspiration links, screenshot, mock shelf, split bar, notes, and no overflow at all three sizes.

## Structure

```
index.html                 slides, notes, inline SVG diagrams
assets/deck.css            light theme, keyword cards, dividers, diagrams
assets/deck.js             navigation, wheel, section chip, overlays, timer
assets/img/                Image Annotation screenshots
docs/ADDING-SLIDES.md      templates + component reference
scripts/verify.mjs         headless browser checks
AGENTS.md                  handoff notes for the next agent
```

## Known limits

- **No presenter window.** Notes are an overlay on the same screen.
- **O'Reilly price and sale dates are approximate.** Check before presenting.
- **Print styles** inherited, not re-verified for 30 pages.
- **Not published as a PDF.** The website is the deliverable.
