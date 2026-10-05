/* =========================================================
   script.js: everything that moves
   It reads the PHOTOS list from photos.js and builds every section.

   0. Settings you can change     7. Travels route
   1. Helpers                     8. Gallery (masonry, filters, tilt)
   2. Polaroids + "developing"    9. Lightbox
   3. Opening envelope           10. Film strip + closing
   4. Hero                       11. Page flips + heart trail
   5. Our Story counter          12. Start everything
   6. Timeline
   ========================================================= */


// ---------- 0. SETTINGS YOU CAN CHANGE ----------

// The day you became "us" (YYYY-MM-DD). Change this to your real date!
const TOGETHER_SINCE = "2021-01-10";

// How many photos float in the hero, and how many burst out of the envelope
const HERO_PHOTO_COUNT = 7;
const BURST_PHOTO_COUNT = 14;


// ---------- 1. HELPERS ----------

const root = document.documentElement;

// true if the visitor turned on "reduce motion" in their device settings
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// true for mouse users (false on phones/tablets)
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// Shortcut for document.querySelector
const $ = (selector) => document.querySelector(selector);

// Random number between min and max
const rand = (min, max) => min + Math.random() * (max - min);

// Keep a number between min and max
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// Wait a number of milliseconds (used with .then)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Create an element with a class and (optional) text
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

// "2019-12-28" -> a Date (in local time, so the day doesn't shift)
function parseDate(text) {
  const [y, m, d] = String(text || "").split("-").map(Number);
  return y ? new Date(y, (m || 1) - 1, d || 1) : null;
}

// "2019-12-28" -> "December 28, 2019"
function formatDate(text, options = { month: "long", day: "numeric", year: "numeric" }) {
  if (/^\d{4}$/.test(String(text))) return String(text);  // just a year, e.g. "2021"
  const date = parseDate(text);
  return date ? date.toLocaleDateString("en-US", options) : "";
}

// Run a function only after resizing has stopped for a moment
function debounce(fn, ms) {
  let timer;
  return () => { clearTimeout(timer); timer = setTimeout(fn, ms); };
}


// ---------- THE PHOTO LIST (from photos.js) ----------

// If photos.js has a typo, PHOTOS won't exist. We use an empty list instead of crashing.
if (typeof PHOTOS === "undefined") {
  console.error("photos.js could not be read. Check it for a missing comma, quote or bracket.");
}

// Clean copy of the list: skip entries without a src and give each photo an id number
const photos = (typeof PHOTOS !== "undefined" ? PHOTOS : [])
  .filter((photo) => photo && photo.src)
  .map((photo, i) => ({ ...photo, id: i, category: photo.category || "Everyday" }));

const oldestFirst = [...photos].sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
const newestFirst = [...oldestFirst].reverse();

// ---------- THE YEARS LIST (from photos.js) ----------

// Each year with only its own photos. Every photo in a year uses the year's
// sentence and place, so the Timeline and Travels show one sentence per year.
const years = (typeof YEARS !== "undefined" ? YEARS : []).map((entry) => {
  const year = String(entry.year || "");
  const place = entry.place || "Somewhere new";
  const yearPhotos = (entry.photos || []).map((file) => {
    const src = "images/" + file;
    const photo = photos.find((p) => p.src === src) || { src, category: "Memories" };
    return { ...photo, caption: entry.text || "", date: year, location: place };
  });
  return { year, place, text: entry.text || "", photos: yearPhotos, showInTravels: entry.showInTravels !== false };
});

// Pick some photos in random order (repeats them if there aren't enough)
function pickPhotos(count) {
  if (!photos.length || count <= 0) return [];
  const shuffled = [...photos].sort(() => Math.random() - 0.5);
  return Array.from({ length: count }, (_, i) => shuffled[i % shuffled.length]);
}


// ---------- 2. POLAROIDS + "DEVELOPING" PHOTOS ----------

/* A photo "develops" (fades in from white) once it has loaded AND is on screen.
   The observer tells us when each photo scrolls into view. */
const developObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.dataset.seen = "yes";
    tryDevelop(entry.target);
  });
}, { threshold: 0.2 });

function tryDevelop(box) {
  if (box.classList.contains("is-loaded") && box.dataset.seen === "yes") {
    box.classList.add("is-developed");
    developObserver.unobserve(box);
  }
}

// The photo area: <div class="photo"><img></div>
function makePhoto(photo, lazy = true) {
  const box = el("div", "photo");
  box.dataset.src = photo.src;  // shown on screen if the file can't be found

  const img = new Image();
  img.alt = photo.caption || "Our photo";
  img.decoding = "async";
  if (lazy) img.loading = "lazy";  // only download when it's close to the screen

  img.addEventListener("load", () => {
    box.classList.add("is-loaded");
    tryDevelop(box);
  });
  img.addEventListener("error", () => {
    box.classList.add("is-loaded", "is-broken", "is-developed");
    console.warn("Photo not found:", photo.src);
  });

  img.src = photo.src;  // set the src last, after the listeners are ready
  box.append(img);

  developObserver.observe(box);
  return box;
}

const TAPE_COLORS = ["rose", "gold", "wine", "cream"];
const TAPE_SPOTS = [["tl", "tr"], ["top"], ["tl"], ["tr"], ["top"]];
const randomItem = (list) => list[Math.floor(Math.random() * list.length)];

/* Builds one polaroid:
   <figure class="polaroid">
     <span class="tape"></span>          washi tape
     <div class="photo"><img></div>      the picture
     <figcaption>caption</figcaption>    handwritten caption
   </figure>                                                    */
function makePolaroid(photo, options = {}) {
  const { lazy = true, tape = true, showDate = false, tilt = false } = options;

  const figure = el("figure", "polaroid");
  figure.dataset.id = photo.id;
  figure.style.setProperty("--rot", rand(-4, 4).toFixed(1) + "deg");  // small random tilt

  if (tape) {
    randomItem(TAPE_SPOTS).forEach((spot) => {
      figure.append(el("span", `tape tape--${spot} tape--${randomItem(TAPE_COLORS)}`));
    });
  }

  figure.append(makePhoto(photo, lazy));

  const caption = el("figcaption", "polaroid__caption", photo.caption || "");
  if (showDate && photo.date) caption.append(el("small", "polaroid__date", formatDate(photo.date)));
  figure.append(caption);

  if (tilt) {
    figure.classList.add("tilt");  // leans towards the mouse (see setupTilt)
    figure.append(el("span", "glare"));
  }
  return figure;
}

// Lets a polaroid work like a button: click, tap, or Enter/Space on the keyboard
function makeClickable(node, label, onOpen) {
  node.tabIndex = 0;
  node.setAttribute("role", "button");
  node.setAttribute("aria-label", label);
  node.addEventListener("click", onOpen);
  node.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  });
}

// Wraps each letter in <span class="char"> so CSS can animate them one by one.
// Returns the next letter number, so the next name continues the wave.
function splitLetters(node, startIndex = 0) {
  let i = startIndex;
  const words = node.textContent.trim().split(/\s+/);
  node.textContent = "";
  words.forEach((word, w) => {
    const wordSpan = el("span", "word");
    wordSpan.setAttribute("aria-hidden", "true");
    [...word].forEach((letter) => {
      const char = el("span", "char", letter);
      char.style.setProperty("--i", i++);
      wordSpan.append(char);
    });
    node.append(wordSpan);
    if (w < words.length - 1) node.append(" ");
  });
  return i;
}

// Same idea, but whole words (used for the closing message)
function splitWords(node) {
  const words = node.textContent.trim().split(/\s+/);
  node.textContent = "";
  words.forEach((word, i) => {
    const wordSpan = el("span", "word", word);
    wordSpan.style.setProperty("--i", i);
    node.append(wordSpan);
    if (i < words.length - 1) node.append(" ");
  });
}

// Adds a class to an element the first time it scrolls into view
function revealOnce(node, className, threshold = 0.3) {
  if (!node) return;
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    node.classList.add(className);
    observer.disconnect();
  }, { threshold });
  observer.observe(node);
}


// ---------- 3. OPENING ENVELOPE ----------

const intro = $("#intro");
const burstLayer = $("#burst");

// The hero photos are chosen first, so the photos flying out of the
// envelope can land exactly where the hero polaroids are.
const heroList = pickPhotos(Math.min(HERO_PHOTO_COUNT, photos.length));
const burstList = [...heroList, ...pickPhotos(BURST_PHOTO_COUNT - heroList.length)];

function setupIntro() {
  if (!intro) return showSite();

  // Always start at the top (browsers sometimes remember the old scroll position)
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  // Start downloading the flying photos now, so they're ready when it opens
  burstList.forEach((photo) => { new Image().src = photo.src; });

  const envelope = $("#envelope");
  envelope.addEventListener("click", openEnvelope, { once: true });
  envelope.focus({ preventScroll: true });
}

function openEnvelope() {
  // Calm version for reduced motion: just fade into the site
  if (reduceMotion) {
    intro.classList.add("is-leaving");
    showSite();
    setTimeout(() => intro.remove(), 1000);
    return;
  }

  intro.classList.add("is-opening");   // seal breaks, flap opens, letter rises (CSS does this)
  setTimeout(burstOut, 950);           // photos burst out of the letter

  setTimeout(() => {                   // envelope falls away, the site appears behind the photos
    intro.classList.add("is-leaving");
    showSite();
  }, 2250);

  setTimeout(() => intro.remove(), 3300);
  setTimeout(() => burstLayer.replaceChildren(), 6000);  // clean-up, just in case
}

// Unlocks scrolling and starts the hero animations
function showSite() {
  root.classList.remove("intro-active");
  root.classList.add("is-ready");

  // Safety net: make sure every hero polaroid ends up visible
  setTimeout(() => {
    document.querySelectorAll(".hero-photo").forEach((spot) => spot.classList.add("is-shown"));
  }, reduceMotion ? 0 : 2800);

  // If someone opened a link like ".../#gallery", go there now
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (target) setTimeout(() => target.scrollIntoView(), 100);
}

function burstOut() {
  const box = $("#envelope").getBoundingClientRect();
  const fromX = box.left + box.width / 2;   // the photos start from the letter
  const fromY = box.top + box.height * 0.2;
  const spread = Math.max(window.innerWidth, window.innerHeight);
  const heroSpots = [...document.querySelectorAll(".hero-photo")];

  burstList.forEach((photo, i) => {
    const card = el("div", "burst__card");
    const img = new Image();
    img.alt = "";
    img.src = photo.src;
    card.append(img);
    burstLayer.append(card);

    const halfW = card.offsetWidth / 2;
    const halfH = card.offsetHeight / 2;

    // Spread the photos in a circle around the envelope
    const angle = (i / burstList.length) * Math.PI * 2 + rand(-0.3, 0.3);
    const dist = spread * rand(0.26, 0.42);
    const x = fromX + Math.cos(angle) * dist;
    const y = fromY + Math.sin(angle) * dist * 0.75;
    const turn = rand(-35, 35);

    // Three moments of the flight: inside the letter, popping up, landing spread out
    const start = `translate(${fromX - halfW}px, ${fromY - halfH}px) scale(.2) rotate(0deg) rotateX(0deg) rotateY(0deg)`;
    const pop = `translate(${fromX - halfW + rand(-50, 50)}px, ${fromY - halfH - rand(120, 200)}px) scale(.55) rotate(${turn / 2}deg) rotateX(20deg) rotateY(-20deg)`;
    const end = `translate(${x - halfW}px, ${y - halfH}px) scale(${rand(0.85, 1.15)}) rotate(${turn}deg) rotateX(${rand(-25, 25)}deg) rotateY(${rand(-25, 25)}deg)`;

    const fly = card.animate([
      { transform: start, opacity: 0 },
      { transform: pop, opacity: 1, offset: 0.3 },
      { transform: end, opacity: 1 }
    ], { duration: rand(1000, 1300), delay: i * 45, easing: "cubic-bezier(.2,.7,.25,1)", fill: "forwards" });

    // When it has landed AND the site is appearing, move on to its final spot
    Promise.all([fly.finished, wait(1450)]).then(() => {
      settleCard(card, end, heroSpots[i], angle, i);
    });
  });

  // A shower of little hearts, too
  for (let i = 0; i < 18; i++) {
    const heart = el("span", "burst__heart", "♥");
    heart.style.color = ["#e0a458", "#ecd5d0", "#d4a5a5"][i % 3];
    burstLayer.append(heart);
    const angle = rand(0, Math.PI * 2);
    const dist = spread * rand(0.18, 0.5);
    heart.animate([
      { transform: `translate(${fromX}px, ${fromY}px) scale(.3)`, opacity: 1 },
      { transform: `translate(${fromX + Math.cos(angle) * dist}px, ${fromY + Math.sin(angle) * dist}px) scale(${rand(0.8, 1.7)}) rotate(${rand(-90, 90)}deg)`, opacity: 0 }
    ], { duration: rand(1200, 1800), delay: rand(0, 300), easing: "cubic-bezier(.15,.8,.3,1)", fill: "forwards" })
      .finished.then(() => heart.remove());
  }
}

// Sends a flying photo to a hero polaroid spot, or off the screen
function settleCard(card, from, spot, angle, i) {
  const spotBox = spot ? spot.getBoundingClientRect() : null;
  const landing = spotBox && spotBox.width > 0;  // hidden spots (on phones) have no size
  let to;

  if (landing) {
    const scale = spotBox.width / card.offsetWidth;
    const rot = parseFloat(spot.firstElementChild.style.getPropertyValue("--rot")) || 0;
    const x = spotBox.left + spotBox.width / 2 - card.offsetWidth / 2;
    const y = spotBox.top + spotBox.height / 2 - card.offsetHeight / 2;
    to = `translate(${x}px, ${y}px) scale(${scale}) rotate(${rot}deg) rotateX(0deg) rotateY(0deg)`;
  } else {
    const far = Math.max(window.innerWidth, window.innerHeight) * 1.2;
    const x = window.innerWidth / 2 + Math.cos(angle) * far;
    const y = window.innerHeight / 2 + Math.sin(angle) * far;
    to = `translate(${x}px, ${y}px) scale(.9) rotate(${rand(-120, 120)}deg) rotateX(0deg) rotateY(0deg)`;
  }

  card.animate([{ transform: from }, { transform: to }], {
    duration: landing ? 900 : 800,
    delay: i * 30,
    easing: "cubic-bezier(.6,0,.2,1)",
    fill: "forwards"
  }).finished.then(() => {
    if (landing) spot.classList.add("is-shown");  // the real hero polaroid takes its place
    card.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, fill: "forwards" })
      .finished.then(() => card.remove());
  });
}


// ---------- 4. HERO: names + floating polaroids ----------

// Where the polaroids like to float, in % of the hero (top-left corner of each one).
// placeHeroPhotos() moves or shrinks them if they would cover any of the text.
const HERO_SPOTS = [
  { x: 3, y: 7 }, { x: 80, y: 5 }, { x: 1, y: 64 }, { x: 84, y: 62 },
  { x: 15, y: 80 }, { x: 68, y: 81 }, { x: 22, y: 1 }
];
const floaters = [];  // each hero polaroid + where it currently is

function buildHero() {
  // Split the names into letters for the rising-letters animation
  let letterCount = 0;
  document.querySelectorAll("[data-split]").forEach((node) => {
    letterCount = splitLetters(node, letterCount + 2);
  });

  const holder = $("#hero-photos");
  heroList.slice(0, HERO_SPOTS.length).forEach((photo, i) => {
    const wrap = el("div", "hero-photo");
    // Random floating speed for each polaroid (its size and place come from placeHeroPhotos)
    wrap.style.cssText =
      `--dur:${rand(5, 9).toFixed(1)}s; --delay:-${rand(0, 6).toFixed(1)}s;` +
      `--bx:${Math.round(rand(-12, 12))}px; --by:${Math.round(rand(-22, -8))}px;`;

    const card = makePolaroid(photo, { lazy: false, tape: Math.random() > 0.4 });
    wrap.append(card);
    holder.append(wrap);

    floaters.push({
      wrap,
      card,
      spot: HERO_SPOTS[i],
      size: Math.round(rand(150, 215)),  // preferred width in px
      rot: parseFloat(card.style.getPropertyValue("--rot")),
      now: { x: 0, y: 0, r: 0, rx: 0, ry: 0 }  // current offset (moves smoothly towards the target)
    });
  });
  placeHeroPhotos();
}

// Boxes (in px inside the hero) that the polaroids must stay out of: every word of the
// names, the smaller lines of text and the "scroll" hint. offsetLeft/offsetTop ignore the
// rising-letter animations, so these are the places the text ends up.
function heroTextBoxes() {
  const hero = $(".hero");
  const content = $(".hero__content");
  const heroLeft = hero.getBoundingClientRect().left;
  const box = (left, top, width, height) => ({ left, top, right: left + width, bottom: top + height });
  const boxes = [];

  content.querySelectorAll(".hero__name .word").forEach((word) => {
    boxes.push(box(content.offsetLeft + word.offsetLeft, content.offsetTop + word.offsetTop, word.offsetWidth, word.offsetHeight));
  });

  // The smaller lines: as tall as the paragraph, as wide as its longest line of text
  content.querySelectorAll(".hero__eyebrow, .hero__tagline, .hero__desc").forEach((p) => {
    const range = document.createRange();
    range.selectNodeContents(p);
    const lines = [...range.getClientRects()];
    if (!lines.length) return;
    const left = Math.min(...lines.map((r) => r.left)) - heroLeft;
    const right = Math.max(...lines.map((r) => r.right)) - heroLeft;
    boxes.push(box(left, content.offsetTop + p.offsetTop, right - left, p.offsetHeight));
  });

  const cue = $(".scroll-cue");
  boxes.push(box(cue.offsetLeft, cue.offsetTop, cue.offsetWidth, cue.offsetHeight));
  return boxes;
}

const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
const growBox = (b, by) => ({ left: b.left - by, top: b.top - by, right: b.right + by, bottom: b.bottom + by });

const TEXT_GAP = 32;                // px of clear space kept around the text
const SHRINK_STEPS = [1, 0.85, 0.7];  // full size first, then a bit smaller
// How far to slide toward the nearest edges: [sideways, up/down], 0 = its spot, 1 = partly off the screen
const SLIDE_STEPS = [[0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5], [1, 0], [0, 1], [1, 0.5], [0.5, 1], [1, 1]];

/* Puts every polaroid at its spot. If it would cover any text, it slides toward the
   nearest edges and shrinks a little until it fits. If it still doesn't fit (small
   screens), it's hidden. Polaroids may overlap each other a little, never the text.
   Runs again when the hero changes size or the fonts finish loading. */
function placeHeroPhotos() {
  if (!floaters.length) return;
  const holder = $("#hero-photos");
  const W = holder.clientWidth;
  const H = holder.clientHeight;
  const text = heroTextBoxes().map((b) => growBox(b, TEXT_GAP));
  const placed = [];

  floaters.forEach((f) => {
    f.wrap.hidden = false;
    const fits = SHRINK_STEPS.some((scale) => {
      f.wrap.style.setProperty("--w", Math.round(f.size * scale) + "px");
      const w = f.wrap.offsetWidth;
      const h = f.wrap.offsetHeight;
      if (!w) return true;  // style.css hides this one on small screens

      // Sliding goes toward the nearest side (up to 30% off the screen) and toward the
      // top (up to 15% off the page) or the bottom (staying inside, so Our Story doesn't cut it off)
      const bottom = H - h - 24;
      const x0 = (W * f.spot.x) / 100;
      const y0 = Math.min((H * f.spot.y) / 100, bottom);
      const x1 = f.spot.x < 50 ? Math.min(x0, -0.3 * w) : Math.max(x0, W - 0.7 * w);
      const y1 = f.spot.y < 50 ? Math.min(y0, -0.15 * h) : Math.max(y0, bottom);

      return SLIDE_STEPS.some(([sx, sy]) => {
        const left = x0 + (x1 - x0) * sx;
        const top = y0 + (y1 - y0) * sy;
        const box = { left, top, right: left + w, bottom: top + h };
        if (text.some((b) => overlaps(box, b)) || placed.some((b) => overlaps(box, b))) return false;

        f.wrap.style.setProperty("--x", (left / W) * 100 + "%");
        f.wrap.style.setProperty("--y", (top / H) * 100 + "%");
        placed.push(growBox(box, -0.15 * w));  // the next polaroids may cover its outer edge
        return true;
      });
    });
    f.wrap.hidden = !fits;
  });
}

/* Polaroids drift away and tilt when the mouse comes near.
   Each frame: work out where each polaroid WANTS to be, then move it 10% of the way there. */
let mouse = null;
let heroLoopRunning = false;

function setupHeroMotion() {
  if (reduceMotion || !floaters.length) return;
  const hero = $(".hero");
  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    mouse = { x: e.clientX, y: e.clientY };
    startHeroLoop();
  });
  hero.addEventListener("pointerleave", () => {
    mouse = null;
    startHeroLoop();
  });
}

function startHeroLoop() {
  if (heroLoopRunning) return;
  heroLoopRunning = true;
  requestAnimationFrame(heroLoop);
}

function heroLoop() {
  const radius = Math.max(220, window.innerWidth * 0.2);  // how close the mouse has to be
  if (window.scrollY > window.innerHeight) mouse = null;  // hero is off screen
  let stillMoving = false;

  // Measure first (all at once), then move (all at once): smoother for the browser
  const boxes = floaters.map((f) => f.wrap.getBoundingClientRect());

  floaters.forEach((f, i) => {
    const target = { x: 0, y: 0, r: 0, rx: 0, ry: 0 };

    if (mouse) {
      const dx = boxes[i].left + boxes[i].width / 2 - mouse.x;
      const dy = boxes[i].top + boxes[i].height / 2 - mouse.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < radius) {
        const push = (1 - dist / radius) ** 2 * 150;  // closer = stronger push
        target.x = (dx / dist) * push;
        target.y = (dy / dist) * push;
        target.r = (dx > 0 ? 1 : -1) * push * 0.12;   // spin a little
        target.rx = (-dy / dist) * push * 0.25;       // 3D tilt away from the mouse
        target.ry = (dx / dist) * push * 0.25;
      }
    }

    const now = f.now;
    for (const key in now) {
      now[key] += (target[key] - now[key]) * 0.1;
      if (Math.abs(target[key] - now[key]) > 0.05) stillMoving = true;
    }

    f.card.style.transform =
      `translate(${now.x}px, ${now.y}px) rotate(${f.rot + now.r}deg) ` +
      `rotateX(${now.rx}deg) rotateY(${now.ry}deg)`;
  });

  if (stillMoving || mouse) requestAnimationFrame(heroLoop);
  else heroLoopRunning = false;
}


// ---------- 5. OUR STORY: photo + days-together counter ----------

function buildStory() {
  // The first "Memories" photo goes next to the story
  const first = oldestFirst.find((p) => p.category === "Memories") || oldestFirst[0];
  if (first) {
    const card = makePolaroid(first, { showDate: true, tilt: true });
    makeClickable(card, "Open photo: " + (first.caption || ""), () => openLightbox([first], 0, card));
    $("#story-photo").append(card);
  }
}

function setupCounter() {
  const start = parseDate(TOGETHER_SINCE);
  const daysEl = $("#days-count");
  if (!start || isNaN(start)) {
    $("#since-text").textContent = "Set your date at the top of script.js";
    return;
  }
  $("#since-text").textContent = "since " + formatDate(TOGETHER_SINCE);

  const DAY = 24 * 60 * 60 * 1000;  // milliseconds in a day
  const pad = (n) => String(n).padStart(2, "0");
  let countedUp = false;  // has the count-up animation finished?

  // Updates the hours/minutes/seconds every second and returns the number of days
  function tick() {
    const ms = Math.max(0, Date.now() - start.getTime());
    const days = Math.floor(ms / DAY);
    const rest = ms % DAY;
    $("#clock-h").textContent = pad(Math.floor(rest / 3600000));
    $("#clock-m").textContent = pad(Math.floor(rest / 60000) % 60);
    $("#clock-s").textContent = pad(Math.floor(rest / 1000) % 60);
    if (countedUp) daysEl.textContent = days.toLocaleString("en-US");
    return days;
  }
  tick();
  setInterval(tick, 1000);

  // When the counter first scrolls into view, count up from 0
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    const total = tick();
    if (reduceMotion) {
      countedUp = true;
      daysEl.textContent = total.toLocaleString("en-US");
      return;
    }
    const t0 = performance.now();
    const duration = 2200;
    (function step(now) {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 4);  // fast at first, slow at the end
      daysEl.textContent = Math.round(total * eased).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
      else countedUp = true;
    })(t0);
  }, { threshold: 0.6 });
  observer.observe($("#counter"));
}


// ---------- 6. TIMELINE ----------

const timelineLine = $(".timeline__line");
let timelineMarks = [];  // all entries + year badges, top to bottom

function buildTimeline() {
  const list = $("#timeline-list");

  // One year badge + one card per year (from YEARS in photos.js)
  years.forEach((entry, i) => {
    const badge = el("li", "tl-year");
    badge.append(el("span", "", entry.year));
    list.append(badge);

    // Entries alternate: left, right, left...
    const item = el("li", `tl-item tl-item--${i % 2 ? "right" : "left"}`);
    const card = el("div", "tl-card");
    card.style.setProperty("--from-rot", (i % 2 ? 8 : -8) + "deg");

    // Only this year's photos, as a small grid of polaroids
    const grid = el("div", "tl-photos");
    grid.style.setProperty("--cols", Math.min(3, entry.photos.length));
    entry.photos.forEach((photo, j) => {
      const polaroid = makePolaroid(photo, { tape: false });
      makeClickable(polaroid, "Open photo: " + entry.text, () => openLightbox(entry.photos, j, polaroid));
      grid.append(polaroid);
    });

    const meta = el("div", "tl-meta");
    meta.append(el("span", "tl-text", entry.text));
    meta.append(el("span", "tl-place", entry.place));
    meta.append(el("span", "tag", photoCount(entry.photos.length)));

    card.append(grid, meta);
    item.append(el("span", "tl-item__dot"), card);
    list.append(item);
  });

  if (!years.length) {
    const empty = el("li", "tl-year");
    empty.append(el("span", "", "Add photos in photos.js"));
    list.append(empty);
  }

  timelineMarks = [...list.children];

  if (reduceMotion) {  // no drawing: show the whole line and every entry right away
    timelineLine.style.setProperty("--progress", 1);
    timelineMarks.forEach((mark) => mark.classList.add("is-reached"));
  }
}

// Runs while scrolling: grows the line and pops in each entry the line reaches
function updateTimeline() {
  if (reduceMotion || !timelineMarks.length) return;
  const track = $("#timeline-track").getBoundingClientRect();
  if (track.bottom < -100 || track.top > window.innerHeight + 100) return;  // not on screen

  // The tip of the line follows a point 65% of the way down the screen
  const tip = window.innerHeight * 0.65 - track.top;

  // Where each entry's dot is (read everything first, then change things)
  const dots = timelineMarks.map((mark) => mark.offsetTop + (mark.classList.contains("tl-year") ? 24 : 76));

  timelineLine.style.setProperty("--progress", clamp(tip / track.height, 0, 1).toFixed(4));
  timelineMarks.forEach((mark, i) => mark.classList.toggle("is-reached", tip >= dots[i]));
}


// ---------- 7. TRAVELS ROUTE ----------

const SVG_NS = "http://www.w3.org/2000/svg";
const travels = $("#travels");
const routeBox = $("#route");
const routeSvg = $("#route-svg");
const routeCard = $("#route-card");

let route = null;       // measurements of the drawn route (rebuilt when the size changes)
let stopButtons = [];
let openStop = -1;      // which stop's photo card is open (-1 = none)
let cardPinned = false; // true when opened by a click/tap, so it stays open
let closeTimer = 0;

// One stop per year (from YEARS in photos.js), with only that year's photos.
// Years marked showInTravels: false stay on the Timeline but are left off the map.
const stops = years.filter((entry) => entry.showInTravels).map((entry) => ({ name: entry.place, ...entry }));

// Helper to create SVG elements, e.g. svg("circle", { r: 8 })
function svg(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const key in attrs) node.setAttribute(key, attrs[key]);
  return node;
}

const photoCount = (n) => `${n} photo${n === 1 ? "" : "s"}`;

// Creates the round stop buttons that sit on top of the map
function buildStops() {
  const holder = $("#route-stops");
  if (!stops.length) {
    holder.append(el("p", "route__empty", "Add years to the YEARS list in photos.js to draw your route."));
    travels.style.setProperty("--travel-height", "auto");
    return;
  }

  // More stops = a longer scroll through the map
  travels.style.setProperty("--travel-height", reduceMotion ? "auto" : Math.min(600, 180 + stops.length * 40) + "vh");

  stops.forEach((stop, i) => {
    const btn = el("button", "stop");
    btn.type = "button";
    btn.setAttribute("aria-label", `${stop.name}, ${photoCount(stop.photos.length)}`);

    const label = el("span", "stop__label", stop.name);
    label.append(el("small", "", stop.year));
    btn.append(el("span", "stop__pin", i + 1), label);

    // Mouse: the card shows while hovering. Touch + keyboard: click to open, click again to close.
    btn.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      clearTimeout(closeTimer);
      if (!cardPinned) openCard(i);
    });
    btn.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "mouse") scheduleClose();
    });
    btn.addEventListener("click", () => {
      if (openStop === i && cardPinned) return closeCard();
      openCard(i);
      cardPinned = true;
    });

    holder.append(btn);
    stopButtons.push(btn);
  });

  // Keep the card open while the mouse is on it
  routeCard.addEventListener("pointerenter", () => clearTimeout(closeTimer));
  routeCard.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") scheduleClose();
  });

  // Clicking/tapping anywhere else (or pressing Esc) closes the card
  document.addEventListener("click", (e) => {
    if (openStop >= 0 && !e.target.closest(".stop, .route-card")) closeCard();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && openStop >= 0) closeCard();
  });
}

function scheduleClose() {
  if (cardPinned) return;
  clearTimeout(closeTimer);
  closeTimer = setTimeout(closeCard, 250);
}

// Fills the pop-up card with a stop's photos and shows it next to the stop
function openCard(i) {
  const stop = stops[i];
  openStop = i;
  stopButtons.forEach((btn, j) => btn.classList.toggle("is-open", j === i));
  routeCard.querySelectorAll(".photo").forEach((p) => developObserver.unobserve(p));

  // Header: stamp with the stop number, place name, year
  const text = el("div");
  text.append(
    el("h3", "route-card__title", stop.name),
    el("p", "route-card__sub", `${stop.year} · ${photoCount(stop.photos.length)}`)
  );
  const head = el("div", "route-card__head");
  head.append(el("span", "stamp", i + 1), text);

  const close = el("button", "route-card__close", "✕");
  close.type = "button";
  close.setAttribute("aria-label", "Close");
  close.addEventListener("click", closeCard);

  // Up to 3 photos, fanned out like a little stack
  const fan = el("div", "route-card__photos");
  const shown = stop.photos.slice(0, 3);
  shown.forEach((photo, j) => {
    const card = makePolaroid(photo, { lazy: false, tape: false });
    const spread = shown.length === 1 ? 0 : (j - (shown.length - 1) / 2) * 7;
    card.style.setProperty("--rot", (spread + rand(-2, 2)).toFixed(1) + "deg");
    makeClickable(card, "Open photo: " + (photo.caption || ""), () => openLightbox(stop.photos, j, card));
    fan.append(card);
  });

  routeCard.replaceChildren(head, close, fan);
  if (stop.text) routeCard.append(el("p", "route-card__text", stop.text));
  if (stop.photos.length > 3) {
    routeCard.append(el("p", "route-card__more", `+ ${stop.photos.length - 3} more. Open a photo to see them all.`));
  }

  // Hide and show again so the pop-in animation replays
  routeCard.hidden = true;
  void routeCard.offsetWidth;
  routeCard.hidden = false;
  placeCard(i);
}

function placeCard(i) {
  if (!route) return;
  const point = route.points[i + 1];  // points[0] is the "start" marker
  const narrow = route.width < 640;
  routeCard.classList.toggle("route-card--sheet", narrow);
  routeCard.style.left = routeCard.style.top = routeCard.style.bottom = "";
  if (narrow) return;  // on phones the card sits at the bottom of the map (see CSS)

  const width = routeCard.offsetWidth;
  routeCard.style.left = clamp(point.x - width / 2, 8, route.width - width - 8) + "px";
  if (point.y > route.height / 2) {
    routeCard.style.bottom = route.height - point.y + 40 + "px";  // above the stop
  } else {
    routeCard.style.top = point.y + 80 + "px";                    // below the stop + its label
  }
}

function closeCard() {
  clearTimeout(closeTimer);
  openStop = -1;
  cardPinned = false;
  routeCard.hidden = true;
  stopButtons.forEach((btn) => btn.classList.remove("is-open"));
}

/* Draws the route. It runs again whenever the map changes size, because the
   points are placed in pixels: left-to-right on wide screens, top-to-bottom on phones. */
function buildRoute() {
  if (!stops.length) return;
  const W = routeBox.clientWidth;
  const H = routeBox.clientHeight;
  if (!W || !H) return;
  if (openStop >= 0) closeCard();

  const tall = W < 640 || H > W * 1.1;  // phone-shaped map
  const n = stops.length;

  // 1) Where the start marker and each stop go
  const points = [tall ? { x: W * 0.14, y: H * 0.1 } : { x: W * 0.05, y: H * 0.82 }];
  stops.forEach((_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);    // 0 = first stop, 1 = last stop
    const wobble = Math.sin(i * 2.1) * 0.05;  // a bit irregular, like a hand-drawn map
    points.push(tall
      ? { x: W * ((i % 2 ? 0.7 : 0.3) + wobble), y: H * (0.17 + t * 0.65) }
      : { x: W * (0.17 + t * 0.72), y: H * ((i % 2 ? 0.66 : 0.3) + wobble) });
  });

  // 2) A swooping curve from point to point (one Bézier curve per piece)
  const f = (num) => num.toFixed(1);  // round to 1 decimal
  const segments = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const len = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
    const swoop = (i % 2 ? 1 : -1) * len * 0.22;            // bend left, then right...
    const nx = -(p2.y - p1.y) / len;                         // direction "sideways" from the piece
    const ny = (p2.x - p1.x) / len;
    const c1x = p1.x + (p2.x - p0.x) / 4 + nx * swoop;
    const c1y = p1.y + (p2.y - p0.y) / 4 + ny * swoop;
    const c2x = p2.x - (p3.x - p1.x) / 4 + nx * swoop;
    const c2y = p2.y - (p3.y - p1.y) / 4 + ny * swoop;
    segments.push(`C ${f(c1x)} ${f(c1y)}, ${f(c2x)} ${f(c2y)}, ${f(p2.x)} ${f(p2.y)}`);
  }
  const d = `M ${f(points[0].x)} ${f(points[0].y)} ${segments.join(" ")}`;

  // 3) Build the SVG: doodles, faint full route, dotted route (revealed by a mask), start, plane
  routeSvg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  routeSvg.replaceChildren();
  drawDoodles(W, H, tall);

  const maskPath = svg("path", { d, fill: "none", stroke: "#fff", "stroke-width": 18, "stroke-linecap": "round" });
  const mask = svg("mask", { id: "route-mask", maskUnits: "userSpaceOnUse", x: -50, y: -50, width: W + 100, height: H + 100 });
  mask.append(maskPath);
  const defs = svg("defs");
  defs.append(mask);

  const ghost = svg("path", { d, class: "route__ghost" });
  const line = svg("path", { d, class: "route__line", mask: "url(#route-mask)" });

  const start = svg("g", { class: "route__start", transform: `translate(${f(points[0].x)} ${f(points[0].y)})` });
  const startText = svg("text", { x: tall ? -12 : -16, y: tall ? -16 : 32 });  // above (phones) or below the dot
  startText.textContent = "start";
  start.append(svg("circle", { r: 8 }), startText);

  const plane = svg("g", { class: "route__plane" });
  plane.append(svg("path", { d: "M18 0 L-14 -12 L-7 0 L-14 12 Z" }), svg("path", { d: "M-7 0 L18 0" }));

  routeSvg.append(defs, ghost, line, start, plane);

  // 4) Measure: total length, and how far along the route each stop is
  const length = line.getTotalLength();
  const stopLengths = [];
  let soFar = 0;
  segments.forEach((segment, i) => {
    const piece = svg("path", { d: `M ${f(points[i].x)} ${f(points[i].y)} ${segment}` });
    routeSvg.append(piece);
    soFar += piece.getTotalLength();
    piece.remove();
    stopLengths.push(soFar);
  });

  // 5) Put each stop button on its point (in %, so it lines up with the SVG)
  stopButtons.forEach((btn, i) => {
    btn.style.setProperty("--x", (points[i + 1].x / W) * 100 + "%");
    btn.style.setProperty("--y", (points[i + 1].y / H) * 100 + "%");
  });

  maskPath.setAttribute("stroke-dasharray", `${length} ${length + 40}`);
  route = { width: W, height: H, points, line, maskPath, plane, length, stopLengths };

  if (reduceMotion) setRouteProgress(1);
  else updateRoute();
}

// Little hand-drawn details on the map: a compass, mountains, waves and a heart
function drawDoodles(W, H, tall) {
  const group = svg("g", { class: "route__doodle" });

  // Compass rose (bottom-right on wide screens, top-right on phones)
  const r = tall ? 22 : 32;
  const cx = W - (tall ? 42 : 64);
  const cy = tall ? 48 : H - 64;
  group.append(
    svg("circle", { cx, cy, r }),
    svg("circle", { cx, cy, r: r * 0.7, "stroke-dasharray": "2 5" }),
    svg("path", { d: `M${cx} ${cy - r - 8} L${cx + 6} ${cy} L${cx} ${cy + r + 8} L${cx - 6} ${cy} Z M${cx - r - 8} ${cy} L${cx} ${cy - 6} L${cx + r + 8} ${cy} L${cx} ${cy + 6} Z` })
  );
  const north = svg("text", { x: cx, y: cy - r - 13, "text-anchor": "middle", class: "route__doodle-text" });
  north.textContent = "N";

  // Mountains with a snowy peak
  const mx = tall ? W * 0.6 : W * 0.3;
  const my = tall ? H * 0.36 : H * 0.15;
  group.append(svg("path", { d: `M${mx} ${my} l22 -30 l14 16 l12 -12 l26 26 M${mx + 16} ${my - 22} l6 4 l6 -4` }));

  // Waves
  const wx = tall ? W * 0.07 : W * 0.58;
  const wy = tall ? H * 0.62 : H * 0.9;
  for (let k = 0; k < 3; k++) {
    group.append(svg("path", { d: `M${wx + k * 14} ${wy + k * 10} q9 -7 18 0 t18 0 t18 0` }));
  }

  // A tiny heart
  const hx = tall ? W * 0.12 : W * 0.86;
  const hy = tall ? H * 0.42 : H * 0.14;
  group.append(svg("path", { d: `M${hx} ${hy + 10} C${hx - 14} ${hy} ${hx - 8} ${hy - 10} ${hx} ${hy - 3} C${hx + 8} ${hy - 10} ${hx + 14} ${hy} ${hx} ${hy + 10} Z` }));

  routeSvg.append(group, north);
}

// amount: 0 = nothing drawn, 1 = the whole route drawn
function setRouteProgress(amount) {
  const drawn = route.length * amount;
  route.maskPath.setAttribute("stroke-dashoffset", route.length - drawn);

  // The paper plane rides on the tip of the line, pointing where it's going
  if (amount > 0.002 && amount < 0.998) {
    const p = route.line.getPointAtLength(drawn);
    const ahead = route.line.getPointAtLength(Math.min(route.length, drawn + 3));
    const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;
    route.plane.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${angle})`);
    route.plane.style.opacity = 1;
  } else {
    route.plane.style.opacity = 0;
  }

  // Each stop gets "stamped" onto the map when the line reaches it
  stopButtons.forEach((btn, i) => {
    const reached = drawn >= route.stopLengths[i] - 4;
    btn.classList.toggle("is-reached", reached);
    if (!reached && openStop === i) closeCard();
  });
}

// Runs while scrolling: how far through the (extra tall) travel section are we?
function updateRoute() {
  if (!route || reduceMotion) return;
  const box = travels.getBoundingClientRect();
  if (box.bottom < 0 || box.top > window.innerHeight) return;
  const lead = window.innerHeight * 0.3;  // start drawing a little before the map sticks
  const scrollable = box.height - window.innerHeight + lead;
  const progress = clamp((lead - box.top) / scrollable, 0, 1);
  setRouteProgress(clamp(progress / 0.8, 0, 1));  // done at 80%, then the full map stays a moment
}


// ---------- 8. GALLERY: masonry, filters, fly-in, 3D tilt ----------

const masonry = $("#masonry");
const galleryItems = [];  // { photo, node } for every photo, newest first
let currentFilter = "All";
let columnCount = 0;

// Photos fly into place when they scroll into view, one after another
const flyObserver = new IntersectionObserver((entries) => {
  let n = 0;
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.style.setProperty("--delay", (n++ * 0.09).toFixed(2) + "s");
    entry.target.classList.add("is-in");
    flyObserver.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });

const isVisible = (item) => currentFilter === "All" || item.photo.category === currentFilter;
const visiblePhotos = () => galleryItems.filter(isVisible).map((item) => item.photo);

function buildGallery() {
  newestFirst.forEach((photo) => {
    const node = el("div", "gallery-item");
    // A random starting point for the fly-in (sideways shift + tilt)
    node.style.setProperty("--fx", Math.round(rand(-140, 140)) + "px");
    node.style.setProperty("--fr", rand(-14, 14).toFixed(1) + "deg");

    const card = makePolaroid(photo, { showDate: true, tilt: true });
    makeClickable(card, "Open photo: " + (photo.caption || ""), () => {
      const list = visiblePhotos();
      openLightbox(list, list.indexOf(photo), card);
    });
    node.append(card);
    galleryItems.push({ photo, node });
  });

  // Filter buttons: show how many photos each has, and listen for clicks
  document.querySelectorAll(".filter").forEach((btn) => {
    const category = btn.dataset.filter;
    const count = category === "All" ? photos.length : photos.filter((p) => p.category === category).length;
    btn.append(el("span", "filter__count", count));
    btn.addEventListener("click", () => setFilter(category));
  });

  if (!photos.length) {
    $("#gallery-empty").textContent = "No photos found. Check photos.js for a typo (like a missing comma or quote).";
  }
  layoutGallery();
}

// How many columns fit in the current width
function getColumnCount() {
  const width = masonry.clientWidth;
  if (width >= 1000) return 4;
  if (width >= 700) return 3;
  if (width >= 280) return 2;
  return 1;
}

// Deals the visible photos into the columns like cards: 1st column, 2nd, 3rd, back to the 1st...
function layoutGallery() {
  columnCount = getColumnCount();
  const columns = Array.from({ length: columnCount }, () => el("div", "masonry__col"));
  const visible = galleryItems.filter(isVisible);
  visible.forEach((item, i) => columns[i % columnCount].append(item.node));
  masonry.replaceChildren(...columns);
  $("#gallery-empty").hidden = visible.length > 0;

  visible.forEach((item) => {
    if (reduceMotion) item.node.classList.add("is-in");
    else if (!item.node.classList.contains("is-in")) flyObserver.observe(item.node);
  });
}

function setFilter(category) {
  if (category === currentFilter) return;
  currentFilter = category;
  document.querySelectorAll(".filter").forEach((btn) => {
    const active = btn.dataset.filter === category;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active);
  });

  if (reduceMotion) return layoutGallery();

  // Fade out, rearrange, then the photos fly in again
  masonry.classList.add("is-switching");
  setTimeout(() => {
    galleryItems.forEach((item) => {
      item.node.style.transition = "none";  // jump back to the starting position instantly...
      item.node.classList.remove("is-in");
    });
    void masonry.offsetWidth;               // (makes the browser apply that right now)
    galleryItems.forEach((item) => (item.node.style.transition = ""));  // ...then animate again
    layoutGallery();
    masonry.classList.remove("is-switching");
  }, 350);
}

/* 3D tilt: a photo leans towards the mouse, with a little shine on top.
   Only for mouse users, and not when reduced motion is on. */
function setupTilt() {
  if (reduceMotion || !canHover) return;
  let current = null;  // the photo under the mouse
  let box = null;      // its position on screen (measured once, not every move)

  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const card = e.target.closest ? e.target.closest(".tilt") : null;
    if (card !== current) {
      if (current) resetTilt(current);
      current = card;
      box = card ? card.getBoundingClientRect() : null;
    }
    if (!card) return;

    const x = clamp((e.clientX - box.left) / box.width, 0, 1);   // 0 = left edge, 1 = right edge
    const y = clamp((e.clientY - box.top) / box.height, 0, 1);   // 0 = top, 1 = bottom
    card.classList.add("is-tilting");
    card.style.transform =
      `perspective(900px) rotateX(${((0.5 - y) * 16).toFixed(2)}deg) ` +
      `rotateY(${((x - 0.5) * 18).toFixed(2)}deg) rotate(var(--rot, 0deg)) scale(1.04)`;
    card.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
    card.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
  }, { passive: true });

  // Scrolling moves things on screen, so measure again on the next move
  window.addEventListener("scroll", () => {
    if (current) box = current.getBoundingClientRect();
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", () => {
    if (current) resetTilt(current);
    current = null;
  });
}

function resetTilt(card) {
  card.classList.remove("is-tilting");
  card.style.transform = "";
}


// ---------- 9. LIGHTBOX (fullscreen viewer) ----------

const lightbox = $("#lightbox");
const lbFrame = $("#lightbox-frame");
const lbImg = $("#lightbox-img");
let lbList = [];      // the photos you can browse through
let lbIndex = 0;      // which one is showing
let lbOrigin = null;  // the thumbnail that was clicked (we zoom from it and back to it)
let lbBusy = false;   // true while sliding between photos

function openLightbox(list, index, originEl) {
  if (!list.length || lightbox.open) return;
  lbList = list;
  lbIndex = Math.max(0, index);
  lbOrigin = originEl;
  lbBusy = false;
  lbFrame.getAnimations().forEach((a) => a.cancel());

  showLightboxPhoto();
  lightbox.showModal();
  root.classList.add("lightbox-open");
  requestAnimationFrame(() => lightbox.classList.add("is-open"));
  zoomFromThumb();
}

// Puts the current photo and its caption into the lightbox
function showLightboxPhoto() {
  const photo = lbList[lbIndex];
  lbImg.src = photo.src;
  lbImg.alt = photo.caption || "Our photo";
  $("#lightbox-caption").textContent = photo.caption || "";
  $("#lightbox-meta").textContent = [formatDate(photo.date), photo.location].filter(Boolean).join(" · ");
  $("#lightbox-count").textContent = lbList.length > 1 ? `${lbIndex + 1} / ${lbList.length}` : "";

  // No arrows when there is only one photo
  lightbox.querySelectorAll(".lightbox__prev, .lightbox__next").forEach((btn) => {
    btn.hidden = lbList.length < 2;
  });

  // Start loading the next and previous photos so they show up instantly
  [1, -1].forEach((step) => {
    new Image().src = lbList[(lbIndex + step + lbList.length) % lbList.length].src;
  });
}

// The transform that makes box "to" sit exactly on top of box "from"
function flipTransform(from, to) {
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  return `translate(${dx}px, ${dy}px) scale(${from.width / to.width})`;
}

// Smooth zoom: the photo starts where the thumbnail is and grows to full size
async function zoomFromThumb() {
  if (reduceMotion || !lbOrigin) return;
  lbFrame.style.opacity = 0;
  try { await lbImg.decode(); } catch (err) { /* if the image is broken, zoom anyway */ }
  lbFrame.style.opacity = "";
  const from = lbOrigin.getBoundingClientRect();
  const to = lbFrame.getBoundingClientRect();
  if (!from.width || !to.width) return;
  lbFrame.animate([
    { transform: flipTransform(from, to), opacity: 0.6 },
    { transform: "none", opacity: 1 }
  ], { duration: 550, easing: "cubic-bezier(.2,.8,.2,1)" });
}

// Finds the thumbnail of the photo that's showing now (it may differ from the one clicked)
function findThumb() {
  const photo = lbList[lbIndex];
  if (!lbOrigin || !photo) return null;
  if (lbOrigin.dataset.id === String(photo.id)) return lbOrigin;
  const area = lbOrigin.closest(".masonry, .timeline__list, .film__track, .route-card");
  return area ? area.querySelector(`[data-id="${photo.id}"]`) : null;
}

function closeLightbox() {
  if (!lightbox.open || lightbox.dataset.closing) return;
  lightbox.dataset.closing = "yes";
  lightbox.classList.remove("is-open");

  // Zoom back into the thumbnail if it's on screen, otherwise just shrink away
  const thumb = findThumb();
  const box = thumb && thumb.getBoundingClientRect();
  const onScreen = box && box.width > 0 && box.bottom > 0 && box.top < window.innerHeight;
  const end = onScreen ? flipTransform(box, lbFrame.getBoundingClientRect()) : "scale(.9)";
  const anim = reduceMotion ? null : lbFrame.animate(
    [{ transform: "none", opacity: 1 }, { transform: end, opacity: onScreen ? 0.6 : 0 }],
    { duration: 380, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" }
  );

  setTimeout(() => {
    if (anim) anim.cancel();
    lightbox.close();
    delete lightbox.dataset.closing;
    root.classList.remove("lightbox-open");
    if (thumb) thumb.focus({ preventScroll: true });
  }, 360);
}

// Slide to the next (dir = 1) or previous (dir = -1) photo
function stepLightbox(dir) {
  if (lbList.length < 2 || lbBusy || !lightbox.open) return;
  lbBusy = true;
  const shift = reduceMotion ? 0 : 70;

  lbFrame.animate([
    { transform: "none", opacity: 1 },
    { transform: `translateX(${-dir * shift}px) rotate(${-dir * 3}deg)`, opacity: 0 }
  ], { duration: 180, easing: "ease-in", fill: "forwards" }).finished.then(async () => {
    lbIndex = (lbIndex + dir + lbList.length) % lbList.length;
    showLightboxPhoto();
    try { await lbImg.decode(); } catch (err) { /* show it anyway */ }
    lbFrame.getAnimations().forEach((a) => a.cancel());
    lbFrame.animate([
      { transform: `translateX(${dir * shift}px) rotate(${dir * 3}deg)`, opacity: 0 },
      { transform: "none", opacity: 1 }
    ], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
    lbBusy = false;
  });
}

function setupLightbox() {
  // Buttons, or a click on the dark background
  lightbox.addEventListener("click", (e) => {
    const button = e.target.closest("[data-action]");
    if (button) {
      const action = button.dataset.action;
      if (action === "close") closeLightbox();
      if (action === "prev") stepLightbox(-1);
      if (action === "next") stepLightbox(1);
    } else if (!e.target.closest(".lightbox__frame")) {
      closeLightbox();
    }
  });

  // Keyboard arrows
  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") stepLightbox(1);
    if (e.key === "ArrowLeft") stepLightbox(-1);
  });

  // Esc: close with our animation instead of the browser's instant close
  lightbox.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeLightbox();
  });

  // Phones: swipe left/right to change photos, swipe down to close
  let touch = null;
  lightbox.addEventListener("touchstart", (e) => {
    touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    if (!touch) return;
    const dx = e.changedTouches[0].clientX - touch.x;
    const dy = e.changedTouches[0].clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) stepLightbox(dx < 0 ? 1 : -1);
    else if (dy > 90 && dy > Math.abs(dx) * 1.5) closeLightbox();
  }, { passive: true });
}


// ---------- 10. FILM STRIP + CLOSING ----------

const filmTracks = [$("#film-track-1"), $("#film-track-2")];
let filmExtra = [0, 0];  // how far each strip can slide (its width minus the screen width)

function buildFilm() {
  if (!photos.length) return;
  filmTracks.forEach((track, t) => {
    const list = t === 0 ? oldestFirst : newestFirst;  // the second strip is in reverse order
    const total = clamp(list.length, 10, 24);          // repeat photos so the strip is long enough

    for (let i = 0; i < total; i++) {
      const photo = list[i % list.length];
      const frame = el("button", "film__frame");
      frame.type = "button";
      frame.dataset.id = photo.id;
      frame.setAttribute("aria-label", "Open photo: " + (photo.caption || ""));

      const box = el("span", "film__img");
      const img = new Image();
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.src = photo.src;
      box.append(img);

      // Frame numbers like on real film, e.g. "07 ▸ 7A"
      frame.append(box, el("span", "film__num", `${String(i + 1).padStart(2, "0")} ▸ ${i + 1}A`));
      frame.addEventListener("click", () => openLightbox(list, list.indexOf(photo), frame));
      track.append(frame);
    }

    // With reduced motion the strips don't slide, so let people scroll them sideways instead
    if (reduceMotion) track.parentElement.style.overflowX = "auto";
  });
  measureFilm();
}

function measureFilm() {
  filmExtra = filmTracks.map((track) => Math.max(0, track.scrollWidth - window.innerWidth));
}

// Runs while scrolling: slides the two strips sideways, in opposite directions
function updateFilm() {
  if (reduceMotion || !photos.length) return;
  const box = $("#film").getBoundingClientRect();
  if (box.bottom < 0 || box.top > window.innerHeight) return;

  // 0 when the section appears at the bottom of the screen, 1 when it leaves at the top
  const progress = clamp((window.innerHeight - box.top) / (window.innerHeight + box.height), 0, 1);
  filmTracks.forEach((track, i) => {
    const x = i === 0 ? -progress * filmExtra[i] : -(1 - progress) * filmExtra[i];
    track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
  });
}

function buildClosing() {
  // The newest photo is the "final photo"
  const newest = newestFirst[0];
  if (newest) {
    const card = makePolaroid(newest, { showDate: true, tilt: true });
    makeClickable(card, "Open photo: " + (newest.caption || ""), () => openLightbox([newest], 0, card));
    $("#closing-photo").append(card, el("p", "closing__note", "to be continued…"));
  }

  // The closing words rise in one by one when they scroll into view
  const title = $("#closing-title");
  splitWords(title);
  revealOnce(title, "is-in", 0.4);
}


// ---------- 11. PAGE FLIPS + HEART TRAIL ----------

// Each section swings in like a turning page the first time it scrolls into view
function setupPageFlips() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px" });
  document.querySelectorAll(".page").forEach((page) => observer.observe(page));
}

// Little hearts that float up from the mouse pointer
function setupHeartTrail() {
  if (reduceMotion || !canHover) return;
  const layer = $("#hearts");
  const colors = ["#d4a5a5", "#6e1f33", "#e0a458"];

  // The same 24 hearts get re-used over and over (faster than making new ones)
  const hearts = Array.from({ length: 24 }, () => layer.appendChild(el("span", "heart", "♥")));
  let next = 0;
  let last = { x: 0, y: 0, time: 0 };

  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || root.classList.contains("intro-active")) return;

    // Only one heart every 40ms, and only if the mouse really moved
    const now = performance.now();
    if (now - last.time < 40 || Math.hypot(e.clientX - last.x, e.clientY - last.y) < 12) return;
    last = { x: e.clientX, y: e.clientY, time: now };

    const heart = hearts[next];
    next = (next + 1) % hearts.length;
    const size = rand(10, 20);
    heart.style.fontSize = size + "px";
    heart.style.color = randomItem(colors);

    const x = e.clientX - size / 2;
    const y = e.clientY - size / 2;
    heart.animate([
      { transform: `translate(${x}px, ${y}px) scale(.4)`, opacity: 0.95 },
      { transform: `translate(${x + rand(-25, 25)}px, ${y - rand(30, 60)}px) scale(1) rotate(${rand(-40, 40)}deg)`, opacity: 0 }
    ], { duration: rand(700, 1100), easing: "cubic-bezier(.2,.7,.3,1)" });
  }, { passive: true });
}


// ---------- 12. START EVERYTHING ----------

// All the scroll animations run together, at most once per screen refresh
let frameQueued = false;
function onScroll() {
  if (frameQueued) return;
  frameQueued = true;
  requestAnimationFrame(() => {
    frameQueued = false;
    updateTimeline();
    updateRoute();
    updateFilm();
  });
}

const onResize = debounce(() => {
  if (getColumnCount() !== columnCount) layoutGallery();
  measureFilm();
  onScroll();
}, 150);

// Runs one setup step. If it breaks, the rest of the site still works
// (open the browser console with F12 to see the error).
function safely(step) {
  try {
    step();
  } catch (err) {
    console.error(err);
  }
}

[
  setupIntro, buildHero, setupHeroMotion, buildStory, setupCounter,
  buildTimeline, buildStops, buildRoute, buildGallery, setupTilt,
  setupLightbox, buildFilm, buildClosing, setupPageFlips, setupHeartTrail
].forEach(safely);

// Redraw the route whenever the map changes size (phone rotated, fonts loaded, window resized...)
if ("ResizeObserver" in window) {
  new ResizeObserver(debounce(() => {
    if (!route || route.width !== routeBox.clientWidth || route.height !== routeBox.clientHeight) {
      safely(buildRoute);
    }
  }, 150)).observe(routeBox);

  // Same for the hero polaroids: keep them off the names at every screen size
  new ResizeObserver(debounce(() => safely(placeHeroPhotos), 150)).observe($(".hero"));
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onResize);
window.addEventListener("load", onScroll);  // after images load, things may have moved
if (document.fonts) {
  document.fonts.ready.then(() => {
    safely(placeHeroPhotos);  // the names have their real width now
    onScroll();
  });
}
onScroll();
