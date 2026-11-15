/* ==========================================================================
   VU Session 03 — deck controller
   Plain browser JS: no modules, no build, works from file://.
   ========================================================================== */

(function () {
  "use strict";

  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  var pad = function (n) {
    return String(n).padStart(2, "0");
  };
  var clamp = function (n, min, max) {
    return Math.min(max, Math.max(min, n));
  };

  /* ------------------------------------------------------------------------
     Elements
     ------------------------------------------------------------------------ */

  var deck = $("#deck");
  var slides = $$(".slide", deck);
  var total = slides.length;
  var numberedSlides = slides.filter(function (slide) {
    return !slide.hasAttribute("data-cover");
  });
  var numberedTotal = numberedSlides.length;
  var current = 0;

  function contentPosition(index) {
    return numberedSlides.indexOf(slides[index]) + 1;
  }

  var sectionChip = $("#sectionChip");
  var counterCurrent = $("#counterCurrent");
  var counterTotal = $("#counterTotal");
  var counterBox = $(".counter");
  var prevBtn = $("#prevBtn");
  var nextBtn = $("#nextBtn");
  var progress = $("#progress");

  var overview = $("#overview");
  var overviewGrid = $("#overviewGrid");
  var help = $("#help");

  var notesPanel = $("#notesPanel");
  var notesBody = $("#notesBody");
  var notesSlide = $("#notesSlide");
  var notesClose = $("#notesClose");

  var timerEl = $("#timer");
  var timerText = $("#timerText");
  var timerReset = $("#timerReset");

  var fullscreenBtn = $("#fullscreen");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------------
     Slide navigation
     ------------------------------------------------------------------------ */

  function updateChrome() {
    var position = contentPosition(current);

    if (sectionChip) {
      sectionChip.textContent = slides[current].dataset.section || "Session 3";
      sectionChip.style.visibility = position === 0 ? "hidden" : "visible";
    }

    counterCurrent.textContent = position ? pad(position) : "";
    counterTotal.textContent = pad(numberedTotal);
    counterBox.classList.toggle("is-cover", position === 0);
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;

    $$(".progress__seg").forEach(function (seg, i) {
      seg.classList.toggle("is-current", i === current);
      seg.classList.toggle("is-done", i < current);
    });

    $$(".ov-card").forEach(function (card, i) {
      card.classList.toggle("is-current", i === current);
      card.setAttribute("aria-current", i === current ? "true" : "false");
    });

    if (notesPanel.classList.contains("is-open")) {
      renderNotes();
    }
  }

  function show(index, direction, updateHash) {
    index = clamp(index, 0, total - 1);

    var goingForward = index >= current;
    if (direction === "prev" || direction === "next") {
      goingForward = direction === "next";
    } else if (index === current) {
      goingForward = true;
    }

    current = index;

    slides.forEach(function (slide, i) {
      var active = i === current;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
      if (active) {
        slide.scrollTop = 0;
      }
    });

    stopVideos(slides[current]);

    deck.dataset.dir = goingForward ? "next" : "prev";
    updateChrome();

    if (updateHash !== false) {
      try {
        history.replaceState(null, "", "#" + (current + 1));
      } catch (err) {
        /* file:// in some browsers — ignore */
      }
    }
  }

  function next() {
    if (current < total - 1) {
      show(current + 1, "next");
    }
  }

  function prev() {
    if (current > 0) {
      show(current - 1, "prev");
    }
  }

  /* ------------------------------------------------------------------------
     Progress + overview
     ------------------------------------------------------------------------ */

  function buildProgress() {
    progress.innerHTML = "";
    slides.forEach(function (slide, i) {
      var seg = document.createElement("button");
      seg.type = "button";
      seg.className = "progress__seg";
      seg.setAttribute("aria-label", "Go to slide " + (i + 1) + ": " + slide.dataset.title);
      seg.addEventListener("click", function () {
        show(i, i < current ? "prev" : "next");
      });
      progress.appendChild(seg);
    });
  }

  function buildOverview() {
    overviewGrid.innerHTML = "";
    var number = 0;
    slides.forEach(function (slide, i) {
      var isCover = slide.hasAttribute("data-cover");
      var label = isCover ? "\u2014" : pad(++number);
      var card = document.createElement("button");
      card.type = "button";
      card.className = "ov-card";
      card.innerHTML =
        '<span class="ov-card__num">' + label + "</span>" +
        '<span class="ov-card__kicker">' + (slide.dataset.kicker || "Slide") + "</span>" +
        '<span class="ov-card__title">' + (slide.dataset.title || "Untitled") + "</span>";
      card.addEventListener("click", function () {
        closeOverlays();
        show(i, i < current ? "prev" : "next");
      });
      overviewGrid.appendChild(card);
    });
  }

  /* ------------------------------------------------------------------------
     Overlays
     ------------------------------------------------------------------------ */

  var openOverlayId = null;
  var lastFocus = null;

  function setBackgroundInert(value) {
    deck.inert = value;
    $$(".chrome").forEach(function (bar) {
      bar.inert = value;
    });
  }

  function openOverlay(id) {
    var el = document.getElementById(id);
    if (!el) return;

    stopVideos();

    if (openOverlayId && openOverlayId !== id) {
      closeOverlays(true);
    }

    lastFocus = document.activeElement;
    openOverlayId = id;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    el.inert = false;
    setBackgroundInert(true);

    if (id === "overview") updateChrome();

    var focusTarget = el.querySelector("[data-close]");
    if (focusTarget) {
      window.setTimeout(function () {
        focusTarget.focus();
      }, 60);
    }
  }

  function closeOverlays(keepFocus) {
    $$(".overlay").forEach(function (el) {
      el.classList.remove("is-open");
      el.setAttribute("aria-hidden", "true");
      el.inert = true;
    });
    setBackgroundInert(false);
    openOverlayId = null;
    if (!keepFocus && lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
    lastFocus = null;
  }

  $$("[data-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openOverlay(btn.dataset.open);
    });
  });

  $$("[data-close]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeOverlays();
    });
  });

  $$(".overlay").forEach(function (el) {
    el.addEventListener("mousedown", function (event) {
      if (event.target === el) closeOverlays();
    });
  });

  /* ------------------------------------------------------------------------
     Speaker notes
     ------------------------------------------------------------------------ */

  function renderNotes() {
    var slide = slides[current];
    var position = contentPosition(current);
    var tpl = slide.querySelector("template.slide-notes");
    notesBody.innerHTML = tpl
      ? tpl.innerHTML
      : '<p style="color: var(--muted)">No notes for this slide yet.</p>';

    if (position === 0) {
      notesSlide.textContent = "Cover";
    } else {
      notesSlide.textContent =
        "Slide " + pad(position) + " · " + (slide.dataset.title || "Untitled");
    }
  }

  function toggleNotes(force) {
    var open = typeof force === "boolean" ? force : !notesPanel.classList.contains("is-open");
    notesPanel.classList.toggle("is-open", open);
    notesPanel.setAttribute("aria-hidden", open ? "false" : "true");
    notesPanel.inert = !open;
    document.body.classList.toggle("notes-open", open);
    if (open) {
      stopVideos();
      renderNotes();
      window.setTimeout(function () {
        notesClose.focus();
      }, 80);
    }
  }

  notesClose.addEventListener("click", function () {
    toggleNotes(false);
  });

  /* ------------------------------------------------------------------------
     Timer
     ------------------------------------------------------------------------ */

  var elapsed = 0;
  var startedAt = 0;
  var running = false;
  var timerInterval = null;

  function timerValue() {
    return elapsed + (running ? performance.now() - startedAt : 0);
  }

  function formatTime(ms) {
    var secs = Math.floor(ms / 1000);
    var h = Math.floor(secs / 3600);
    var m = Math.floor((secs % 3600) / 60);
    var s = secs % 60;
    return h > 0 ? h + ":" + pad(m) + ":" + pad(s) : pad(m) + ":" + pad(s);
  }

  function paintTimer() {
    timerText.textContent = formatTime(timerValue());
  }

  function startTimer() {
    if (running) return;
    running = true;
    startedAt = performance.now();
    timerEl.classList.add("is-running");
    timerEl.setAttribute("aria-pressed", "true");
    timerEl.setAttribute("aria-label", "Pause session timer");
    timerEl.closest(".timer").classList.add("is-running");
    timerInterval = window.setInterval(paintTimer, 200);
    paintTimer();
  }

  function pauseTimer() {
    if (!running) return;
    elapsed = timerValue();
    running = false;
    window.clearInterval(timerInterval);
    timerInterval = null;
    timerEl.classList.remove("is-running");
    timerEl.setAttribute("aria-pressed", "false");
    timerEl.setAttribute("aria-label", "Resume session timer");
    timerEl.closest(".timer").classList.remove("is-running");
    paintTimer();
  }

  function toggleTimer() {
    if (running) pauseTimer();
    else startTimer();
  }

  function resetTimer() {
    running = false;
    window.clearInterval(timerInterval);
    timerInterval = null;
    elapsed = 0;
    startedAt = 0;
    timerEl.classList.remove("is-running");
    timerEl.closest(".timer").classList.remove("is-running");
    timerEl.setAttribute("aria-pressed", "false");
    timerEl.setAttribute("aria-label", "Start session timer");
    paintTimer();
  }

  timerEl.addEventListener("click", toggleTimer);
  timerReset.addEventListener("click", function (event) {
    event.stopPropagation();
    resetTimer();
  });

  /* ------------------------------------------------------------------------
     Fullscreen
     ------------------------------------------------------------------------ */

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      var request = document.documentElement.requestFullscreen;
      if (request) {
        request.call(document.documentElement).catch(function () {});
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(function () {});
    }
  }

  document.addEventListener("fullscreenchange", function () {
    var isFull = Boolean(document.fullscreenElement);
    fullscreenBtn.setAttribute("aria-label", isFull ? "Leave fullscreen" : "Enter fullscreen");
    fullscreenBtn.setAttribute("aria-pressed", isFull ? "true" : "false");
  });

  fullscreenBtn.addEventListener("click", toggleFullscreen);

  /* ------------------------------------------------------------------------
     Video cards — click to load a privacy-friendly embed in place
     ------------------------------------------------------------------------ */

  $$(".video").forEach(function (card) {
    var stage = card.querySelector(".video__stage");
    if (!stage) return;

    // Cache the poster so leaving the slide can stop playback and reset cleanly.
    card._posterHTML = stage.innerHTML;

    card.addEventListener("click", function (event) {
      if (!event.target.closest(".video__hit")) return;
      if (card.classList.contains("is-playing")) return;

      var id = card.dataset.video;
      if (!id) return;

      var iframe = document.createElement("iframe");
      iframe.src =
        "https://www.youtube-nocookie.com/embed/" +
        encodeURIComponent(id) +
        "?autoplay=1&rel=0&modestbranding=1";
      iframe.title = card.dataset.videoTitle || "YouTube video";
      iframe.loading = "lazy";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allowFullscreen = true;

      stage.innerHTML = "";
      stage.appendChild(iframe);
      card.classList.add("is-playing");
    });
  });

  function stopVideos(exceptSlide) {
    $$(".video.is-playing").forEach(function (card) {
      if (exceptSlide && exceptSlide.contains(card)) return;
      var stage = card.querySelector(".video__stage");
      if (stage && card._posterHTML) {
        stage.innerHTML = card._posterHTML;
        card.classList.remove("is-playing");
      }
    });
  }

  /* ------------------------------------------------------------------------
     Prompt tabs
     ------------------------------------------------------------------------ */

  var promptTabs = $$(".prompt-tab");
  var promptText = $("#promptText");

  function selectPrompt(tab, focus) {
    promptTabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute("aria-selected", selected ? "true" : "false");
      t.tabIndex = selected ? 0 : -1;
    });

    promptText.textContent = tab.dataset.prompt;
    promptText.setAttribute("aria-labelledby", tab.id);

    // Restart the small entrance animation.
    promptText.style.animation = "none";
    void promptText.offsetWidth;
    promptText.style.animation = "";

    if (focus) tab.focus();
  }

  promptTabs.forEach(function (tab, i) {
    tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;

    tab.addEventListener("click", function () {
      selectPrompt(tab, false);
    });

    tab.addEventListener("keydown", function (event) {
      var dir = 0;
      if (event.key === "ArrowRight") dir = 1;
      if (event.key === "ArrowLeft") dir = -1;
      if (!dir) return;
      event.preventDefault();
      event.stopPropagation();
      var nextTab = promptTabs[(i + dir + promptTabs.length) % promptTabs.length];
      selectPrompt(nextTab, true);
    });
  });

  /* ------------------------------------------------------------------------
     Course catalogue (slide 02)
     ------------------------------------------------------------------------ */

  (function catalog() {
    var root = $("[data-catalog]");
    if (!root) return;

    var items = $$(".catalog__item", root);
    var label = root.querySelector("[data-course-label]");
    var title = root.querySelector("[data-course-title]");
    var source = root.querySelector("[data-course-source]");
    var output = root.querySelector("[data-course-output]");
    var done = root.querySelector("[data-course-done]");

    if (!items.length || !title) return;

    function select(item, focus) {
      items.forEach(function (button) {
        button.setAttribute("aria-selected", button === item ? "true" : "false");
        button.tabIndex = button === item ? 0 : -1;
      });

      var code = item.querySelector(".catalog__code");
      if (label) label.textContent = (code ? code.textContent : "") + " \u00b7 Enrolled";
      title.textContent = item.dataset.focus || "";
      if (source) source.textContent = item.dataset.source || "";
      if (output) output.textContent = item.dataset.output || "";
      if (done) done.textContent = item.dataset.done || "";

      if (focus) item.focus();
    }

    items.forEach(function (item, i) {
      item.tabIndex = item.getAttribute("aria-selected") === "true" ? 0 : -1;
      item.addEventListener("click", function () {
        select(item, false);
      });
      item.addEventListener("keydown", function (event) {
        var next = i;
        if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (i + 1) % items.length;
        else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (i - 1 + items.length) % items.length;
        else return;
        event.preventDefault();
        event.stopPropagation();
        select(items[next], true);
      });
    });

    select(items[0], false);
  })();

  /* ------------------------------------------------------------------------
     The build loop (slide 05)
     ------------------------------------------------------------------------ */

  (function loop() {
    var root = $("[data-loop]");
    if (!root) return;

    var stations = $$(".loop__station", root);
    var label = root.querySelector("[data-loop-label]");
    var title = root.querySelector("[data-loop-title]");
    var body = root.querySelector("[data-loop-body]");
    var meta = root.querySelector("[data-loop-meta]");

    if (!stations.length || !title) return;

    var stages = [
      {
        label: "Stage 01 \u00b7 Start",
        title: "Make the smallest version that runs.",
        body: "A page that loads. A button that does one thing. Buy information, not polish.",
        meta: "Timebox: one sitting."
      },
      {
        label: "Stage 02 \u00b7 Iterate",
        title: "Change one variable at a time.",
        body: "The next question the build raised. One change, one run. Two changes teach nothing.",
        meta: "Rhythm: one change, one run."
      },
      {
        label: "Stage 03 \u00b7 Refine",
        title: "Remove before you add.",
        body: "Fewer features. Clearer names. One path. Refinement is subtraction.",
        meta: "Test: could a stranger use it?"
      },
      {
        label: "Stage 04 \u00b7 New idea",
        title: "Let the build propose the next build.",
        body: "Use what you made. The annoyance is the next feature. Write it down, then start.",
        meta: "Capture it, do not chase it."
      }
    ];

    function select(index) {
      var stage = stages[index];
      if (!stage) return;

      stations.forEach(function (station, i) {
        station.setAttribute("aria-selected", i === index ? "true" : "false");
        station.tabIndex = i === index ? 0 : -1;
      });

      if (label) label.textContent = stage.label;
      title.textContent = stage.title;
      if (body) body.textContent = stage.body;
      if (meta) meta.textContent = stage.meta;
    }

    stations.forEach(function (station, i) {
      station.addEventListener("click", function () {
        select(i);
      });
      station.addEventListener("keydown", function (event) {
        var next = i;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (i + 1) % stations.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (i - 1 + stations.length) % stations.length;
        else return;
        event.preventDefault();
        event.stopPropagation();
        select(next);
        stations[next].focus();
      });
    });

    select(0);
  })();

  /* ------------------------------------------------------------------------
     Copy buttons
     ------------------------------------------------------------------------ */

  $$("[data-copy]").forEach(function (button) {
    var original = button.textContent;
    var timer = null;

    function done() {
      button.textContent = "Copied";
      button.classList.add("is-copied");
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        button.textContent = original;
        button.classList.remove("is-copied");
      }, 1600);
    }

    function fallback() {
      var field = document.createElement("textarea");
      field.value = button.dataset.copy || "";
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand("copy");
      } catch (error) {
        /* clipboard is unavailable; leave the command selectable */
      }
      document.body.removeChild(field);
      done();
    }

    button.addEventListener("click", function () {
      var text = button.dataset.copy || "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
    });
  });

  /* ------------------------------------------------------------------------
     Live tallies (optional slide component)
     ------------------------------------------------------------------------ */

  $$("[data-tally]").forEach(function (tally) {
    var valueEl = tally.querySelector("[data-tally-value]");
    var plus = tally.querySelector("[data-tally-plus]");
    var minus = tally.querySelector("[data-tally-minus]");
    if (!valueEl) return;

    var count = parseInt(valueEl.textContent, 10) || 0;

    function paint(delta) {
      count = clamp(count + delta, 0, 999);
      valueEl.textContent = count;
      if (!reduceMotion) {
        valueEl.classList.remove("is-bumped");
        void valueEl.offsetWidth;
        valueEl.classList.add("is-bumped");
      }
    }

    if (plus) plus.addEventListener("click", function () { paint(1); });
    if (minus) minus.addEventListener("click", function () { paint(-1); });
  });

  /* ------------------------------------------------------------------------
     Hash routing
     ------------------------------------------------------------------------ */

  function readHash() {
    var match = window.location.hash.match(/\d+/);
    if (!match) return 0;
    var n = parseInt(match[0], 10);
    return clamp(n - 1, 0, total - 1);
  }

  window.addEventListener("hashchange", function () {
    var index = readHash();
    if (index !== current) show(index, index < current ? "prev" : "next", false);
  });

  /* ------------------------------------------------------------------------
     Global interactions
     ------------------------------------------------------------------------ */

  document.addEventListener("click", function (event) {
    var goto = event.target.closest("[data-goto]");
    if (goto) {
      event.preventDefault();
      show(parseInt(goto.dataset.goto, 10), "next");
      return;
    }
    var nextTrigger = event.target.closest("[data-next]");
    if (nextTrigger) {
      next();
    }
  });

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  document.addEventListener("keydown", function (event) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;

    var target = event.target;
    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable)
    ) {
      return;
    }

    if (openOverlayId) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeOverlays();
      }
      return;
    }

    var key = event.key;

    if (key === "Escape") {
      if (document.querySelector(".video.is-playing")) {
        event.preventDefault();
        stopVideos();
        return;
      }
      if (notesPanel.classList.contains("is-open")) {
        event.preventDefault();
        toggleNotes(false);
      }
      return;
    }

    if ((key === " " || key === "Enter") && target && target.closest("button, a")) {
      return;
    }

    switch (key) {
      case "ArrowRight":
      case "ArrowDown":
      case "PageDown":
      case " ":
        event.preventDefault();
        next();
        break;
      case "ArrowLeft":
      case "ArrowUp":
      case "PageUp":
        event.preventDefault();
        prev();
        break;
      case "Home":
        event.preventDefault();
        show(0, "prev");
        break;
      case "End":
        event.preventDefault();
        show(total - 1, "next");
        break;
      case "o":
      case "O":
        event.preventDefault();
        openOverlay("overview");
        break;
      case "n":
      case "N":
        event.preventDefault();
        toggleNotes();
        break;
      case "t":
      case "T":
        event.preventDefault();
        toggleTimer();
        break;
      case "f":
      case "F":
        event.preventDefault();
        toggleFullscreen();
        break;
      case "?":
        event.preventDefault();
        openOverlay("help");
        break;
      case "/":
        if (event.shiftKey) {
          event.preventDefault();
          openOverlay("help");
        }
        break;
      default:
        break;
    }
  });

  /* Mouse wheel ---------------------------------------------------------- */

  var wheelSum = 0;
  var wheelLocked = false;
  var wheelIdle = null;

  deck.addEventListener(
    "wheel",
    function (event) {
      if (openOverlayId || notesPanel.classList.contains("is-open")) return;
      if (event.ctrlKey || event.metaKey) return;
      var node = event.target;
      if (node && node.nodeType !== 1) node = node.parentElement;
      if (node && node.closest && node.closest("iframe, .overlay, .notes")) return;

      var slide = slides[current];
      var canScroll = slide.scrollHeight > slide.clientHeight + 1;
      if (canScroll) {
        var atTop = slide.scrollTop <= 0;
        var atBottom = slide.scrollTop + slide.clientHeight >= slide.scrollHeight - 1;
        if ((event.deltaY < 0 && !atTop) || (event.deltaY > 0 && !atBottom)) return;
      }

      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();

      if (wheelLocked) return;

      wheelSum += event.deltaY;
      window.clearTimeout(wheelIdle);
      wheelIdle = window.setTimeout(function () {
        wheelSum = 0;
      }, 220);

      if (Math.abs(wheelSum) < 40) return;

      var forward = wheelSum > 0;
      wheelSum = 0;
      wheelLocked = true;
      window.setTimeout(function () {
        wheelLocked = false;
      }, 620);

      if (forward) next();
      else prev();
    },
    { passive: false }
  );

  /* Swipe ---------------------------------------------------------------- */

  var touchStartX = 0;
  var touchStartY = 0;
  var touchStartT = 0;

  deck.addEventListener(
    "touchstart",
    function (event) {
      if (event.target.closest("iframe, .overlay, .notes")) return;
      var touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartT = Date.now();
    },
    { passive: true }
  );

  deck.addEventListener(
    "touchend",
    function (event) {
      if (!touchStartT) return;
      if (event.target.closest("iframe, .overlay, .notes")) return;

      var touch = event.changedTouches[0];
      var dx = touch.clientX - touchStartX;
      var dy = touch.clientY - touchStartY;
      var dt = Date.now() - touchStartT;
      touchStartT = 0;

      if (dt > 900 || Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
      if (dx < 0) next();
      else prev();
    },
    { passive: true }
  );

  /* ------------------------------------------------------------------------
     Ambient field — a quiet learning network
     ------------------------------------------------------------------------ */

  (function field() {
    var canvas = $("#field");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var W = 0;
    var H = 0;
    var DPR = 1;
    var nodes = [];
    var pointer = { x: -9999, y: -9999, active: false };
    var pulse = null;
    var last = 0;

    function makeNode() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        r: 0.6 + Math.random() * 1.5,
        accent: Math.random() < 0.12,
        phase: Math.random() * Math.PI * 2
      };
    }

    function resize() {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      var count = Math.min(88, Math.max(24, Math.round((W * H) / 19000)));
      while (nodes.length > count) nodes.pop();
      while (nodes.length < count) nodes.push(makeNode());

      if (reduceMotion) draw(0);
    }

    function draw(dt) {
      ctx.clearRect(0, 0, W, H);

      var linkDist = clamp(W * 0.095, 112, 168);
      var i;
      var j;
      var n;
      var dx;
      var dy;
      var dist;
      var alpha;

      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        n.x += n.vx * dt;
        n.y += n.vy * dt;

        if (n.x < -20) n.x = W + 20;
        if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20;
        if (n.y > H + 20) n.y = -20;
      }

      ctx.lineWidth = 1;

      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length; j++) {
          dx = nodes[i].x - nodes[j].x;
          dy = nodes[i].y - nodes[j].y;
          dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > linkDist) continue;
          alpha = (1 - dist / linkDist) * 0.13;
          ctx.strokeStyle = "rgba(242, 239, 230, " + alpha.toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }

      if (pointer.active) {
        for (i = 0; i < nodes.length; i++) {
          n = nodes[i];
          dx = n.x - pointer.x;
          dy = n.y - pointer.y;
          dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 190) continue;
          alpha = (1 - dist / 190) * 0.24;
          ctx.strokeStyle = "rgba(217, 255, 87, " + alpha.toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();

          // A gentle pull, so the cursor feels like a lens rather than a wall.
          n.vx += (dx / (dist + 1)) * 0.000018 * dt;
          n.vy += (dy / (dist + 1)) * 0.000018 * dt;
        }
      }

      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        // Keep drift speeds bounded.
        n.vx = clamp(n.vx, -0.05, 0.05);
        n.vy = clamp(n.vy, -0.05, 0.05);

        ctx.beginPath();
        ctx.fillStyle = n.accent ? "rgba(217, 255, 87, 0.66)" : "rgba(242, 239, 230, 0.3)";
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (pulse) {
        pulse.r += dt * 0.34;
        if (pulse.r > 240) {
          pulse = null;
        } else {
          alpha = (1 - pulse.r / 240) * 0.28;
          ctx.strokeStyle = "rgba(217, 255, 87, " + alpha.toFixed(3) + ")";
          ctx.beginPath();
          ctx.arc(pulse.x, pulse.y, pulse.r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    function loop(now) {
      if (document.hidden) {
        window.requestAnimationFrame(loop);
        return;
      }
      var dt = Math.min(32, now - last);
      last = now;
      draw(dt);
      window.requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resize, { passive: true });

    window.addEventListener(
      "pointermove",
      function (event) {
        if (event.pointerType === "touch") return;
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
      },
      { passive: true }
    );

    document.documentElement.addEventListener("pointerleave", function () {
      pointer.active = false;
    });

    window.addEventListener("blur", function () {
      pointer.active = false;
    });

    window.addEventListener(
      "pointerdown",
      function (event) {
        if (event.pointerType === "touch") return;
        pulse = { x: event.clientX, y: event.clientY, r: 0 };
      },
      { passive: true }
    );

    resize();

    if (!reduceMotion) {
      last = performance.now();
      window.requestAnimationFrame(loop);
    }
  })();

  /* Cursor spotlight ------------------------------------------------------ */

  (function spotlight() {
    var root = document.documentElement;
    var x = window.innerWidth * 0.5;
    var y = window.innerHeight * 0.3;
    var queued = false;

    window.addEventListener(
      "pointermove",
      function (event) {
        if (event.pointerType === "touch") return;
        x = event.clientX;
        y = event.clientY;
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(function () {
          root.style.setProperty("--mx", x + "px");
          root.style.setProperty("--my", y + "px");
          queued = false;
        });
      },
      { passive: true }
    );
  })();

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */

  buildProgress();
  buildOverview();

  $$(".overlay").forEach(function (el) {
    el.inert = true;
  });
  notesPanel.inert = true;

  var initial = readHash();
  current = initial;
  show(initial, "next", false);
  paintTimer();

  // Make sure the overview knows where we are once everything is built.
  updateChrome();
})();
