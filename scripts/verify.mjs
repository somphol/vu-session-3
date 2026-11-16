import http from "node:http";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8"
};

const CHROME_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
].filter(Boolean);

let passed = 0;

function check(condition, message) {
  if (!condition) throw new Error("FAIL: " + message);
  passed += 1;
  console.log("  \u2713 " + message);
}

function findChrome() {
  const found = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(
      "Chrome/Chromium not found. Set PUPPETEER_EXECUTABLE_PATH to a browser binary."
    );
  }
  return found;
}

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", "http://localhost");
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith("/")) pathname += "index.html";

      const file = path.join(ROOT, pathname);
      if (!file.startsWith(ROOT)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      const body = await readFile(file);
      res.writeHead(200, {
        "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store"
      });
      res.end(body);
    } catch (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
    }
  });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function goTitle(page, base, title) {
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.evaluate((name) => {
    const slides = [...document.querySelectorAll(".slide")];
    const index = slides.findIndex((slide) => slide.dataset.title === name);
    if (index < 0) throw new Error("slide not found: " + name);
    location.hash = "#" + (index + 1);
  }, title);
  await wait(340);
}
const SLIDES = 30;

async function main() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const base = "http://127.0.0.1:" + port + "/";

  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: "new",
    args: ["--hide-scrollbars"]
  });

  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" }
    ]);
    await page.goto(base, { waitUntil: "domcontentloaded" });
    await wait(400);

    console.log("\nStructure + chrome (1440\u00d7900)");

    const boot = await page.evaluate(() => {
      const slides = [...document.querySelectorAll(".slide")];
      return {
        title: document.title,
        slides: slides.length,
        numbered: slides.filter((s) => !s.hasAttribute("data-cover")).length,
        total: document.querySelector("#counterTotal").textContent,
        counterHidden: getComputedStyle(document.querySelector(".counter")).visibility === "hidden",
        active: document.querySelector(".slide.is-active")?.dataset.title,
        cards: document.querySelectorAll(".ov-card").length,
        segs: document.querySelectorAll(".progress__seg").length,
        overflow: document.documentElement.scrollWidth > innerWidth,
        inert: [...document.querySelectorAll(".overlay")].every((el) => el.inert) &&
          document.querySelector("#notesPanel").inert
      };
    });

    check(boot.title === "Session 3: Learn. Build. Repeat. Just Do It! — VU AI Exploration", "page title is exact");
    check(boot.slides === SLIDES && boot.numbered === SLIDES - 1, "deck has 29 numbered content slides");
    check(boot.total === "29", "counter total is 29");
    check(boot.counterHidden && boot.active === "Cover", "cover is first and unnumbered");
    check(boot.cards === SLIDES && boot.segs === SLIDES, "overview and progress cover every screen");
    check(!boot.overflow && boot.inert, "no overflow, closed panels inert");

    await page.keyboard.press("ArrowRight");
    await wait(250);
    const opening = await page.evaluate(() => ({
      active: document.querySelector(".slide.is-active").dataset.title,
      counter: document.querySelector("#counterCurrent").textContent,
      hash: location.hash,
      chip: document.querySelector("#sectionChip").textContent,
      parts: document.querySelectorAll(".slide.is-active .kw").length
    }));
    check(opening.active === "Today" && opening.counter === "01", "ArrowRight opens the agenda");
    check(opening.hash === "#2", "URL hash tracks position");
    check(opening.parts === 5 && opening.chip === "Today", "agenda lists five parts and labels the section");

    await goTitle(page, base, "Abundance is solved");
    const ask = await page.evaluate(() =>
      document.querySelector(".slide.is-active .ask").textContent.replace(/\s+/g, " ").trim()
    );
    check(ask === "What did you finish last month?", "opening shows the audience question, not a stage direction");

    await page.mouse.move(720, 450);
    await page.mouse.wheel({ deltaY: 140 });
    await wait(800);
    const wheelDown = await page.evaluate(() => document.querySelector("#counterCurrent").textContent);
    await page.mouse.wheel({ deltaY: -140 });
    await wait(800);
    const wheelUp = await page.evaluate(() => document.querySelector("#counterCurrent").textContent);
    check(wheelDown === "04" && wheelUp === "03", "mouse wheel moves forward and back");

    await page.keyboard.press("End");
    await wait(300);
    const atEnd = await page.evaluate(() => document.querySelector("#counterCurrent").textContent);
    await page.keyboard.press("Home");
    await wait(300);
    const atHome = await page.evaluate(() => document.querySelector(".slide.is-active").dataset.title);
    check(atEnd === "29" && atHome === "Cover", "Home and End jump to the ends");

    console.log("\nInteractions");

    const dividers = await page.evaluate(() =>
      [...document.querySelectorAll(".slide--section")].map((el) => el.dataset.section)
    );
    check(dividers.length === 5, "five section dividers exist");
    check(dividers.join(",") === "Learn,Build,See it,Source it,Ship it", "dividers are in section order");

    await goTitle(page, base, "Pick a semester");
    const course = await page.evaluate(() => {
      const a = document.querySelector(".slide.is-active");
      const card = a.querySelector(".kw");
      return {
        items: a.querySelectorAll(".kw").length,
        svg: a.querySelectorAll("svg").length,
        hidden: getComputedStyle(card.querySelector(".kw__d")).opacity,
        chip: document.querySelector("#sectionChip").textContent
      };
    });
    check(course.items === 4 && course.svg === 1, "semester slide has four courses and a diagram");
    check(course.hidden === "0", "course detail is hidden until hover");
    check(course.chip === "Learn", "chrome shows the current section");

    await page.hover(".slide.is-active .kw");
    await wait(350);
    const revealed = await page.evaluate(() =>
      getComputedStyle(document.querySelector(".slide.is-active .kw__d")).opacity
    );
    check(revealed === "1", "hovering a course reveals its detail");

    await goTitle(page, base, "The loop");
    await page.mouse.move(8, 8);
    await wait(150);
    const loop = await page.evaluate(() => {
      const a = document.querySelector(".slide.is-active");
      return {
        stations: a.querySelectorAll(".kw").length,
        svg: a.querySelectorAll("svg").length,
        hidden: getComputedStyle(a.querySelector(".kw__d")).opacity,
        chip: document.querySelector("#sectionChip").textContent
      };
    });
    check(loop.stations === 4 && loop.svg === 1, "loop slide has four stages and a diagram");
    check(loop.hidden === "0", "loop detail is hidden until hover");
    check(loop.chip === "Build", "section label follows the slide");

    const bigFont = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.querySelector(".slide.is-active .kw__k")).fontSize)
    );
    check(bigFont >= 28, "loop keywords are set at 28px or larger");

    await goTitle(page, base, "Build anything");
    const containers = await page.evaluate(() =>
      document.querySelectorAll(".slide.is-active .kw").length
    );
    check(containers === 6, "platform slide shows six targets");

    await goTitle(page, base, "Start with your pain");
    const build = await page.evaluate(() => {
      const a = document.querySelector(".slide.is-active");
      return {
        title: a.dataset.title,
        kws: a.querySelectorAll(".kw").length,
        longest: Math.max.apply(null, [...a.querySelectorAll(".kw__d")].map((el) => el.textContent.trim().split(/\s+/).length))
      };
    });
    check(build.title === "Start with your pain" && build.kws === 4, "new slide asks what to build");
    check(build.longest <= 5, "keyword detail stays a memory jolt, not a paragraph");

    for (const [title, name] of [
      ["Do your own research", "research"],
      ["Feed it everything", "NotebookLM"],
      ["Talk it out", "brainstorm"],
      ["Question your answer", "critical thinking"],
      ["Build in public", "build-in-public"],
      ["Show your work", "show-your-work"],
      ["What is your blocker?", "blocker"]
    ]) {
      await goTitle(page, base, title);
      const info = await page.evaluate(() => {
        const a = document.querySelector(".slide.is-active");
        return { kws: a.querySelectorAll(".kw").length, svg: a.querySelectorAll("svg").length };
      });
      check(info.kws === 4 && info.svg === 1, name + " slide has keywords and a diagram");
    }

    await goTitle(page, base, "Point at the thing");
    await wait(300);
    const app = await page.evaluate(() => {
      const img = document.querySelector(".slide.is-active .shot img");
      return { shot: img ? img.naturalWidth : 0, chip: document.querySelector("#sectionChip").textContent };
    });
    check(app.shot > 800, "Image Annotation screenshot loads");
    check(app.chip === "See it", "showcase slides are labelled See it");

    await goTitle(page, base, "A shelf, not a graveyard");
    const shelf = await page.evaluate(() => {
      const a = document.querySelector(".slide.is-active");
      const img = a.querySelector(".shot img");
      return {
        shot: img ? img.naturalWidth : 0,
        links: a.querySelectorAll(".example-links a").length
      };
    });
    check(shelf.shot > 1000 && shelf.links === 3, "TubeShelf screenshot and links render");

    await goTitle(page, base, "There is more");
    const inspo = await page.evaluate(() => {
      const links = [...document.querySelectorAll(".slide.is-active .link-card")];
      return { count: links.length, hrefs: links.map((a) => a.getAttribute("href")) };
    });
    check(inspo.count === 2, "inspiration slide links two more projects");
    check(inspo.hrefs[0].includes("project-album") && inspo.hrefs[1].includes("vu_project_ideas"), "inspiration links are correct");

    await goTitle(page, base, "O'Reilly Bookshelf");
    const oreilly = await page.evaluate(() => {
      const a = document.querySelector(".slide.is-active");
      const link = a.querySelector(".big-link");
      return {
        link: link ? link.getAttribute("href") : "",
        text: link ? link.textContent.trim() : "",
        ask: a.querySelector(".ask").textContent.trim()
      };
    });
    check(oreilly.link === "https://www.oreilly.com/" && oreilly.text.includes("oreilly.com"), "bookshelf slide is a direct link");
    check(oreilly.ask === "Go look at it.", "bookshelf slide says exactly what to do");

    await goTitle(page, base, "90% public, 10% people");
    const sources = await page.evaluate(() => {
      const a = document.querySelector(".slide.is-active");
      return {
        cards: a.querySelectorAll(".kw-grid--five li").length,
        chip: document.querySelector("#sectionChip").textContent,
        publicWidth: a.querySelector(".split90__public").getBoundingClientRect().width,
        peopleWidth: a.querySelector(".split90__people").getBoundingClientRect().width
      };
    });
    check(sources.cards === 5, "five answer sources are shown");
    check(sources.publicWidth > sources.peopleWidth * 6, "90/10 bar is proportioned");
    check(sources.chip === "Source it", "source slides are labelled Source it");

    await goTitle(page, base, "Ship one thing");
    const last = await page.evaluate(() => ({
      steps: document.querySelectorAll(".slide.is-active .kw").length,
      counter: document.querySelector("#counterCurrent").textContent,
      nextDisabled: document.querySelector("#nextBtn").disabled,
      chip: document.querySelector("#sectionChip").textContent
    }));
    check(last.steps === 4 && last.counter === "29" && last.nextDisabled, "closing slide is last, with four keywords");
    check(last.chip === "Ship it", "closing section is labelled Ship it");

    await page.keyboard.press("n");
    await wait(200);
    const notes = await page.evaluate(() => ({
      open: document.querySelector("#notesPanel").classList.contains("is-open"),
      body: document.querySelector("#notesBody").textContent.trim().length
    }));
    check(notes.open && notes.body > 40, "speaker notes open with content");
    await page.keyboard.press("Escape");
    await wait(200);

    console.log("\nLayout");

    const sizes = [
      { width: 1440, height: 900 },
      { width: 1280, height: 720 }
    ];

    for (const size of sizes) {
      const view = await browser.newPage();
      await view.setViewport({ ...size, deviceScaleFactor: 1 });
      await view.emulateMediaFeatures([
        { name: "prefers-reduced-motion", value: "reduce" }
      ]);

      const bad = [];
      for (let n = 1; n <= SLIDES; n++) {
        await view.goto(base + "#" + n, { waitUntil: "domcontentloaded" });
        await wait(260);
        const fit = await view.evaluate(() => {
          const active = document.querySelector(".slide.is-active");
          return {
            title: active.dataset.title,
            overflow: document.documentElement.scrollWidth > innerWidth,
            fits: active.scrollHeight <= active.clientHeight + 1
          };
        });
        if (fit.overflow || !fit.fits) bad.push(fit.title);
      }
      check(bad.length === 0, size.width + "\u00d7" + size.height + " keeps every slide fully on screen" +
        (bad.length ? ": " + bad.join(", ") : ""));
      await view.close();
    }

    const mobile = await browser.newPage();
    await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await mobile.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" }
    ]);
    const wide = [];
    for (let n = 1; n <= SLIDES; n++) {
      await mobile.goto(base + "#" + n, { waitUntil: "domcontentloaded" });
      await wait(220);
      const fit = await mobile.evaluate(() => ({
        title: document.querySelector(".slide.is-active").dataset.title,
        wide: document.documentElement.scrollWidth > innerWidth
      }));
      if (fit.wide) wide.push(fit.title);
    }
    check(wide.length === 0, "390px has no horizontal overflow" + (wide.length ? ": " + wide.join(", ") : ""));
    await mobile.close();

    check(errors.length === 0, "no page or console errors" + (errors.length ? ": " + errors.join(" | ") : ""));

    console.log("\n" + passed + " checks passed.");
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error("\n" + (error.stack || error));
  process.exitCode = 1;
});
