# Adding slides

Everything is plain HTML in `index.html`. A slide is a `<section class="slide">` inside `#deck`. The deck builds the progress bar, slide counter, overview grid and notes from those sections automatically.

## The minimum

```html
<section class="slide slide--content" data-title="Overview label" data-kicker="Section · 02" aria-label="Accessible name for the slide">
  <div class="slide__inner">
    <p class="eyebrow reveal" style="--d: .02s">
      <span class="slide-index">02</span>
      <span class="eyebrow__line" aria-hidden="true"></span>
      Section name
    </p>

    <h2 class="statement reveal" style="--d: .1s">
      One clear claim,<br>
      <em>with an italic turn.</em>
    </h2>

    <p class="lede reveal" style="--d: .2s">A single supporting sentence.</p>
  </div>

  <template class="slide-notes">
    <p>What to say, what to ask, what to skip.</p>
  </template>
</section>
```

Rules of thumb:

- `data-title` and `data-kicker` feed the overview (`O`). Keep the title short.
- Each slide needs a unique `aria-label`.
- Add `reveal` and a `--d` delay to create the entrance sequence. Do not overdo it: three or four reveals per slide is enough.
- Speaker notes are optional but should exist for every slide you will actually present.
- New slides go above `<!-- Add future slides above this line -->`. Order in the file is order on screen.
- The cover carries `data-cover` and is unnumbered; the bottom counter, overview numbers and notes count content slides only. The visible `slide-index` chip is still manual, so renumber later slides when you insert one.
- The URL is `#<position>`, so `#3` opens the third screen (including the cover).

## Template: two columns with a panel

```html
<section class="slide slide--content" data-title="What changes" data-kicker="Practice · 03" aria-label="What changes in practice">
  <div class="slide__inner">
    <p class="eyebrow reveal" style="--d: .02s">
      <span class="slide-index">03</span>
      <span class="eyebrow__line" aria-hidden="true"></span>
      Practice
    </p>

    <h2 class="statement reveal" style="--d: .1s">From answers<br><em>to reps.</em></h2>

    <div class="cols cols--wide-left reveal" style="--d: .18s">
      <div class="stack">
        <ul class="bullets">
          <li><strong>Ask once.</strong> <span>Get the explanation, not just the output.</span></li>
          <li><strong>Do it twice.</strong> <span>Repeat the task without the model.</span></li>
          <li><strong>Teach it.</strong> <span>If you cannot explain it, you borrowed it.</span></li>
        </ul>
      </div>

      <div class="panel">
        <p class="panel__label">Try this</p>
        <p>Pick one task you did with AI this week. Redo it from memory, then compare.</p>
      </div>
    </div>
  </div>

  <template class="slide-notes">
    <p>Ask for a show of hands before revealing the three steps.</p>
  </template>
</section>
```

## Template: live room poll

The buttons work immediately; no JavaScript needed in the slide. `+` stops at 999, `−` at 0. Use one tally per option.

```html
<div class="panel">
  <p class="panel__label">Quick poll · hands up</p>

  <div class="tally" data-tally>
    <span class="tally__label">I ask AI first</span>
    <span class="tally__controls">
      <button class="tally__btn" type="button" data-tally-minus aria-label="Decrease I ask AI first">&minus;</button>
      <span class="tally__value" data-tally-value aria-live="polite">0</span>
      <button class="tally__btn" type="button" data-tally-plus aria-label="Increase I ask AI first">+</button>
    </span>
  </div>

  <div class="tally" data-tally>
    <span class="tally__label">I try first, then ask</span>
    <span class="tally__controls">
      <button class="tally__btn" type="button" data-tally-minus aria-label="Decrease I try first, then ask">&minus;</button>
      <span class="tally__value" data-tally-value aria-live="polite">0</span>
      <button class="tally__btn" type="button" data-tally-plus aria-label="Increase I try first, then ask">+</button>
    </span>
  </div>
</div>
```

## Template: accordion (progressive disclosure)

Native `<details>`, styled and keyboard accessible. Good for “show the answer only after the room has guessed”.

```html
<div class="reveal" style="--d: .18s">
  <details class="accordion">
    <summary>What is the difference between an answer and a skill?</summary>
    <p>An answer can be used once. A skill can be used when the model is closed.</p>
  </details>
  <details class="accordion">
    <summary>Where does practice fit?</summary>
    <p>Retrieval, feedback, and repetition. AI can supply feedback; it cannot supply the repetition.</p>
  </details>
</div>
```

## Template: video card

The play click is delegated to any `.video__hit` inside `.video`, so this exact structure is enough. YouTube loads only after a click, through `youtube-nocookie.com`.

```html
<article class="video reveal" style="--d: .3s"
         data-video="VIDEO_ID"
         data-video-title="Accessible title used by the iframe">
  <div class="video__stage">
    <span class="video__thumb" aria-hidden="true"
          style="background-image:url('https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg'),url('https://i.ytimg.com/vi/VIDEO_ID/hq720.jpg'),url('https://i.ytimg.com/vi/VIDEO_ID/mqdefault.jpg')"></span>
    <span class="video__badge">03</span>
    <span class="video__play" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M8 5.14v13.72c0 .8.87 1.3 1.56.9l10.7-6.86a1.05 1.05 0 0 0 0-1.8L9.56 4.24A1.05 1.05 0 0 0 8 5.14Z"/></svg>
    </span>
    <button class="video__hit" type="button" aria-label="Play video: …"></button>
  </div>
  <div class="video__meta">
    <p class="video__kicker">Why this one</p>
    <h3 class="video__name">Video title</h3>
    <p class="video__by">Channel</p>
    <a class="video__link" href="https://www.youtube.com/watch?v=VIDEO_ID" target="_blank" rel="noopener noreferrer">Open on YouTube <span aria-hidden="true">&#8599;</span></a>
  </div>
</article>
```

Videos are two-up inside `<div class="videos">`. One video alone will sit in the left column; add `style="grid-template-columns: minmax(0, 620px)"` to `.videos` if you want a single wide card.

## Component reference

| Class | Use |
| --- | --- |
| `.slide--content` | Standard content slide spacing |
| `.cols` / `.cols--wide-left` | Two columns; collapses to one under 860px |
| `.stack` | Vertical group with consistent gap |
| `.panel` | Bordered surface for a prompt, quote, or poll |
| `.bullets` | Quiet custom bullet list |
| `.quote` + `<footer>` | Large serif pull quote with attribution |
| `.accordion` | Native `<details>` accordion, accent +/− |
| `.tally` + `data-tally` | Click-to-count poll |
| `.catalog` + `[data-catalog]` | Course-selection list and detail card; copy lives on each `data-focus` / `data-source` / `data-output` / `data-done` button |
| `.loop` + `[data-loop]` | Four-station build loop; stage copy lives in the `loop()` function in `assets/deck.js` |
| `.options` / `.option` | Two-container comparison (web vs local) |
| `.showcase` / `.shot` | Screenshot or mock on the left, notes on the right |
| `.shot--mock` / `.mock` | CSS-only app window; no image asset needed |
| `.split90` | Proportional 90/10 bar with labels |
| `.sources` / `.source` | Four-up source cards |
| `.steps` | Numbered vertical list with title + supporting line |
| `.rules` | Numbered rules where the first column is the number span |
| `.section` / `.skill-tile` | Section opener with a fanned card stack |
| `.benefits` | Three-up numbered claims |
| `.panel--accent` / `.panel__big` / `.panel__text` | Highlighted panel and larger statement copy |
| `.terminal` / `.copy-btn` | Command block with a clipboard button |
| `.compare` / `.skill-menu` | Comparison layout (kept from Session 2) |
| `.example-links` | Link strip for demos and repositories |
| `.statement` / `.lede` / `.eyebrow` | Existing typographic hierarchy |
| `.slide-index` | Small numbered chip in the eyebrow |

## Adding a new interaction

If a slide needs behaviour the deck does not already have:

1. Give the markup a clear `data-*` hook (for example `data-reveal-steps`).
2. Add one scoped function in `assets/deck.js`, near the other components, and call it at boot. Do not add inline `<script>` blocks to slides.
3. Respect `prefers-reduced-motion` and keep everything keyboard operable.
4. Add a check to `scripts/verify.mjs` if the interaction is part of the live session.
5. Document the pattern here and update `AGENTS.md` if the architecture changes.

## Checking your work

```bash
npm install
npm run verify
```

The verifier starts its own local server and drives Chrome. It does not replace looking at the deck in a real browser at the size you will present at.
