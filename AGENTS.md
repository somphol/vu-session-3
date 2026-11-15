# AGENTS.md

## 1. What it is

A static browser deck for **Session 3: Learn. Build. Repeat. Just Do It!** — VU AI Exploration with Somphol Boonjing. Focus, build, iterate. Twenty-four numbered slides in five visible sections (Learn 7, Build 7, See it 3, Source it 2, Ship it 4), opening with an agenda, each slide built on one claim, four to six very large keyword cards and one inline SVG diagram. Keyword detail is one short phrase revealed on hover or focus; the full script is in speaker notes. Light theme, no backend.

## 2. Commands

```bash
open index.html
python3 -m http.server 4173     # http://localhost:4173

npm install
npm run verify                  # 45 checks

open "http://localhost:4173/#2" # #<screen>, cover is #1
```

No build step. Edit and reload.

## 3. Architecture

- `index.html` — cover, agenda, 23 content slides in order; `data-title`, `data-kicker`, `data-section`; notes in `<template class="slide-notes">`; inline SVG figures.
- `assets/deck.css` — light tokens; chrome plus `.chrome__section` chip; `.kw-grid` / `.kw` with hover-only `.kw__d`; `.kw-split`; `.figure`; responsive and print rules. Older Session-2 blocks (`.catalog`, `.loop`, `.options`, `.facts`, `.bigwords`, `.poles`) remain but are unused.
- `assets/deck.js` — one IIFE: navigation, wheel, section chip, progress/overview, overlays, notes, timer, fullscreen, copy, hash, keyboard, swipe.
- `scripts/verify.mjs` — own server; navigates by `data-title`; drives Chrome at 1440×900, 1280×720, 390×844.
- `docs/ADDING-SLIDES.md` — templates and component table.

## 4. Decisions and constraints

- **Five sections, always visible.** `data-section` drives the top chrome chip: Learn, Build, See it, Source it, Ship it. The cover falls back to “Session 3”; the agenda uses “Today”. Do not add a slide without a section.
- **The agenda is slide 01.** Five cards, one per section, hover detail naming what is inside. It is the memory jolt at the start; keep it to five items.
- **Big words, one claim per slide.** Four to six keyword cards, headline, one diagram. No paragraphs.
- **Detail only on hover or focus.** `.kw__d` is opacity 0 until `:hover` / `:focus`; always visible on `(hover: none)` and in print. Do not make detail permanent on desktop without being asked.
- **Every content slide has a diagram** except the agenda, which is itself the roadmap. The cover is the other exception.
- **Type floor.** `.kw__k` is `clamp(1.75rem, 2.8vw, 2.6rem)` / 700. No visible body text below 13px; keyword detail 15–17px.
- **Light theme.** `--ink #f7f5ef`, `--paper #14161a`, `--accent #3b6a00`. Dark green, not lime, for contrast.
- **No italic serif for read-aloud sentences.** Emphasis is accent plus weight.
- **Mouse wheel and Home/End navigate.** Wheel uses 40px accumulation and a 620ms lock, and yields to overflowing slides and open overlays; keep the help overlay in sync.
- **Numbering.** Content slide `N` is screen `#N+1`. After inserting a slide, renumber `slide-index`, `data-kicker`, and the `SLIDE n —` comments (a single regex pass over slide blocks works; comments sit before each section).
- **O'Reilly is one direct slide, not two.** Headline, “Go look at it.”, a large `oreilly.com` link, and one line: about $199/year, usually Black Friday, check library access. Do not turn it back into keyword cards or a catalogue list; the ask is to open the site. Price and dates are approximate — recheck before presenting.
- **App facts dated November 2026.** Image Annotation: macOS 13+, arrow/text/export, source-safe save. TubeShelf: macOS 14+, on-device tagging with fallback, one JSON file, two web companions.
- **The 90/10 split is rhetorical**, not measured.
- **Do not publish** without the owner's go-ahead.

## 5. Known issues

- Hover detail cannot be triggered on touch; mobile shows it permanently.
- The agenda and platform slides have deliberately empty-looking cards until hover. That is the intended look; do not fill them with paragraphs.
- Print styles inherited, not re-verified for 25 pages.
- Unused Session-2 CSS remains; safe to prune, but keep `.kw*`, `.figure`, `.panel`, `.shot`, `.mock`, `.split90`.
- Timer resets on reload; notes are an overlay, not a second display.

## 6. Continuity

- Local master: `~/Projects/vu-session-3`
- Git: `main` on `origin` → https://github.com/somphol/vu-session-3
- Deployed copy: **https://somphol.github.io/vu-session-3/** (GitHub Pages, branch `main`, root). Pushing to `main` redeploys automatically.

### Publish (needs an authenticated `gh`)

```bash
cd ~/Projects/vu-session-3
gh auth login                                   # if not already
gh repo create vu-session-3 --public --source=. --remote=origin --push

# enable Pages from the branch root
gh api -X POST "repos/{owner}/vu-session-3/pages" \
  -f "source[branch]=main" -f "source[path]=/"

# then check the build and the URL
gh api "repos/{owner}/vu-session-3/pages" --jq '.html_url, .status'
```

Live URL will be `https://<owner>.github.io/vu-session-3/`.

After the first deploy, update this file and `README.md` with the real URL in the same push as any other change, so the handoff is never stale.

- Presentation target: browser fullscreen (`F`), 1440×900 or 1280×720.
- Session 2 remains at `~/Projects/vu-session-2` as the earlier reference deck.
