# Technical Specification — UK Nature Almanac

**Version:** 1.0
**Last updated:** March 2026
**Project type:** Static front-end, no build step, GitHub Pages ready

---

## 1. Overview

The UK Nature Almanac is a scroll-driven, single-page web application that presents a month-by-month guide to British nature. It is a pure display application — no users, no accounts, no server-side logic. All content is stored in a single JSON file and rendered client-side via vanilla JavaScript. Animations are driven by GSAP 3 and its ScrollTrigger plugin.

The intended deployment target is GitHub Pages. Local development requires any static HTTP server (the app uses `fetch()` and cannot be opened via `file://`).

---

## 2. Technology Stack

| Concern | Technology | Version | Source |
|---|---|---|---|
| Markup | HTML5 | — | — |
| Styling | CSS3 (custom properties, grid, flexbox) | — | — |
| Scripting | Vanilla JavaScript (ES modules) | ES2020+ | — |
| Animation | GSAP | 3.12.5 | CDN |
| Animation (scroll) | ScrollTrigger plugin | 3.12.5 | CDN (bundled with GSAP) |
| Typography | Cormorant Garamond, Lora | — | Google Fonts CDN |
| Icons / illustrations | Inline SVG | — | Local files |
| Data | JSON | — | Local file |
| Build tool | **None** | — | Files served directly |

### CDN URLs

```html
<!-- GSAP core -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<!-- ScrollTrigger plugin -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Lora:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
```

> **Note:** GSAP must be loaded before the ES module scripts. `ScrollTrigger` is registered at runtime inside `main.js` via `gsap.registerPlugin(ScrollTrigger)`.

---

## 3. File Structure

```
/
├── index.html                  ← Single HTML entry point
├── PRD.md                      ← Product requirements document
├── TECH_SPEC.md                ← This document
│
├── css/
│   ├── main.css                ← Reset, layout, CSS custom properties, responsive, print
│   ├── typography.css          ← Font styles, all text element rules
│   ├── components.css          ← Nav, cards, hover/focus states
│   └── animations.css          ← CSS @keyframes (bounce, pulse, drawOn, fadeUp)
│
├── js/
│   ├── main.js                 ← Entry point: fetch → render → nav → scroll
│   ├── render.js               ← Builds month section HTML from data
│   ├── nav.js                  ← Sidebar nav generation and scroll-spy API
│   └── scroll.js               ← All GSAP ScrollTrigger definitions
│
├── data/
│   └── months.json             ← All 12 months of content
│
└── assets/
    ├── svg/
    │   ├── botanicals/
    │   │   ├── snowdrop.svg    ← January hero illustration
    │   │   ├── bluebell.svg    ← April hero illustration
    │   │   ├── oak-acorn.svg   ← October hero illustration
    │   │   └── stub.svg        ← Generic placeholder for other months
    │   └── icons/
    │       ├── leaf.svg        ← Nature Events category icon
    │       ├── bird.svg        ← Wildlife category icon
    │       ├── moon.svg        ← Sky category icon
    │       ├── vegetable.svg   ← Seasonal Veg category icon
    │       ├── flower.svg      ← Foraging & Plants category icon
    │       └── footprint.svg   ← Things To Do category icon
    └── textures/
        └── paper.svg           ← SVG feTurbulence parchment texture overlay
```

---

## 4. Data Architecture

### 4.1 months.json schema

All content lives in `data/months.json`. The top-level object has a single key `months` which is an array of 12 month objects.

```jsonc
{
  "months": [
    {
      // ── Identity ──────────────────────────────────────────
      "id":       "january",          // Kebab-case, used for DOM IDs and CSS hooks
      "number":   1,                  // 1–12, used for ghosted numeral
      "name":     "January",          // Display name
      "tagline":  "The quiet heart of winter",
      "summary":  "Long-form paragraph...",
      "heroPlant": "snowdrop",        // Maps to assets/svg/botanicals/{heroPlant}.svg
      "season":   "winter",          // "winter" | "spring" | "summer" | "autumn"
                                      // Controls CSS colour palette

      // ── Content categories ────────────────────────────────
      "natureEvents": [
        { "title": "...", "description": "..." }
      ],
      "wildlife": [
        { "species": "...", "type": "bird|mammal|insect|reptile|amphibian|fungus|plant", "note": "..." }
      ],
      "sky": {
        "avgSunrise": "08:06",        // HH:MM — average for UK midlands
        "avgSunset":  "16:02",
        "highlights": ["...", "..."]  // 3–4 bullet points
      },
      "seasonalVeg":   ["Kale", "..."],
      "foraging":      [{ "name": "...", "note": "..." }],
      "plantsInBloom": ["Snowdrop", "..."],
      "thingsToDo":    [{ "activity": "...", "when": "...", "description": "..." }]
    }
  ]
}
```

### 4.2 Botanical SVG mapping

`render.js` maps `heroPlant` values to SVG file paths:

| heroPlant value | SVG file |
|---|---|
| `snowdrop` | `assets/svg/botanicals/snowdrop.svg` |
| `bluebell` | `assets/svg/botanicals/bluebell.svg` |
| `oak-acorn` | `assets/svg/botanicals/oak-acorn.svg` |
| *(any other value)* | `assets/svg/botanicals/stub.svg` |

To add a new botanical, create an SVG file in `assets/svg/botanicals/`, add its key to the `BOTANICAL_FILES` map in `render.js`, and set the corresponding `heroPlant` field in `months.json`.

### 4.3 Season to colour palette mapping

The `season` field controls which CSS colour palette is active. The four palettes are defined as CSS custom properties in `main.css` and applied by GSAP as the user scrolls.

| Season | Months | Background | Primary |
|---|---|---|---|
| `winter` | Jan, Feb, Dec | `#f2efe8` | `#2d4a3e` |
| `spring` | Mar, Apr, May | `#f8f5ed` | `#3a6b4a` |
| `summer` | Jun, Jul, Aug | `#f7f2e2` | `#4a6b2a` |
| `autumn` | Sep, Oct, Nov | `#f5ede0` | `#5a3a1a` |

---

## 5. CSS Architecture

### 5.1 File responsibilities

| File | Responsibility |
|---|---|
| `main.css` | CSS custom property definitions (all 4 palettes), reset, page-level layout, background texture, responsive breakpoints (mobile ≤768px, tablet 769–1100px), reduced-motion overrides, print styles |
| `typography.css` | Every text element style — hero, month headings, category labels, card content, footer. No layout. |
| `components.css` | Nav sidebar, card containers, hover/focus states, botanical SVG stroke setup |
| `animations.css` | `@keyframes` only — `bounce`, `pulse`, `fadeUp`, `drawOn` |

### 5.2 CSS custom properties

All colour values are expressed as CSS custom properties on `:root` (and overridden per-season on `body[data-season="..."]`). GSAP tweens these properties directly on `document.documentElement` during scroll.

```css
:root {
  --bg:         /* page background */
  --primary:    /* headings, borders, SVG stroke */
  --accent:     /* labels, highlights, active states */
  --muted:      /* subtle borders, tags, nav background */
  --text:       /* body copy */
  --text-light: /* secondary copy, captions */
}
```

Spacing, font families, layout dimensions, and border-radius are also expressed as custom properties:

```css
:root {
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body:    'Lora', Georgia, serif;
  --space-xs: 0.5rem;  --space-sm: 1rem;
  --space-md: 2rem;    --space-lg: 4rem;  --space-xl: 8rem;
  --nav-width:    64px;    /* 0px on mobile */
  --content-max:  900px;
  --card-radius:  4px;
}
```

### 5.3 Responsive breakpoints

| Breakpoint | Width | Nav behaviour | Card grid |
|---|---|---|---|
| Desktop | >1100px | Left sidebar, 64px wide | `auto-fill`, min 280px |
| Tablet | 769–1100px | Left sidebar, 48px wide | `auto-fill`, min 240px |
| Mobile | ≤768px | Top bar, 44px tall, scrollable | Single column |

### 5.4 Background parchment texture

`body::before` overlays `assets/textures/paper.svg` (an SVG `feTurbulence` filter generating fractal noise) at 4% opacity with `mix-blend-mode: multiply`. The texture is `position: fixed` and `pointer-events: none`, so it never interferes with interaction.

---

## 6. JavaScript Architecture

### 6.1 Module graph

```
index.html
  └── <script type="module" src="js/main.js">
          ├── import render.js   (buildMonthSection, loadBotanicalSvg)
          ├── import nav.js      (buildNav)
          └── import scroll.js   (initScrollAnimations, animateHeroIn)
                  └── import nav.js  (setActiveMonth)
```

All four files are ES modules. There is no bundler — the browser loads them natively. GSAP is loaded as a classic `<script>` before the module and is available as the global `gsap` / `ScrollTrigger`.

### 6.2 main.js — boot sequence

```
1. fetch('data/months.json')
2. Promise.all([loadBotanicalSvg(month) for each month])   ← parallel SVG fetches
3. buildMonthSection(month, svgHtml) × 12  →  #timeline-container
4. buildNav(months)
5. gsap.registerPlugin(ScrollTrigger)
6. initScrollAnimations(months)
7. requestAnimationFrame × 2  →  animateHeroIn()
8. ScrollTrigger on #hero → hide scroll prompt once user has scrolled
```

**Error handling:**
- If `months.json` fails to load or `fetch()` is called via `file://`, a friendly error message is shown in `#timeline-container` explaining that a local server is required.
- If a botanical SVG file is missing, `loadBotanicalSvg()` returns a minimal empty `<svg>` element and logs a warning.

**Reduced motion:**
If `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is true, main.js uses a separate code path that skips GSAP entirely, renders all content, and calls `revealAllFallback()` which sets all opacity/transform states to their final visible values. The CSS `@media (prefers-reduced-motion: reduce)` rules also independently zero out `stroke-dashoffset` and `animation-duration`.

### 6.3 render.js — HTML generation

`buildMonthSection(month, svgHtml)` creates a `<section>` element with:
- `id="month-{id}"`, `data-month="{id}"`, `data-season="{season}"`, `data-number="{number}"`
- Ghosted numeral, botanical illustration (inline SVG), month header, summary
- Stub notice (shown only when majority of content descriptions contain "Placeholder")
- Six category cards via individual builder functions

All user-supplied strings pass through `escHtml()` before insertion as HTML to prevent XSS.

SVG files are fetched, stripped of XML declarations, and inserted as raw HTML strings. Results are cached in a `Map` to avoid duplicate fetches.

**Category card builders:**

| Function | Input | Output |
|---|---|---|
| `buildNatureEventsCard` | `natureEvents[]` | Expandable list with hover/focus reveal |
| `buildWildlifeCard` | `wildlife[]` | Species/type/note list |
| `buildSkyCard` | `sky{}` | Sunrise/sunset times + highlights |
| `buildVegCard` | `seasonalVeg[]` | Tag cloud |
| `buildForagingCard` | `foraging[]` + `plantsInBloom[]` | Foraging items + bloom tags |
| `buildTodoCard` | `thingsToDo[]` | Activity/when/description list |

### 6.4 nav.js — navigation

`buildNav(months)` generates `<li>/<a>` pairs in `#month-nav-list` using single-character month abbreviations (J F M A M J J A S O N D).

`setActiveMonth(monthId)` is called by `scroll.js` on ScrollTrigger enter/enterBack events. It toggles `is-active` class and sets `aria-current="true"` on the matching link.

Click handlers call `scrollToMonth(monthId)`, which uses `scrollIntoView({ behavior: 'smooth' })` with a fallback to GSAP ScrollToPlugin if available.

### 6.5 scroll.js — GSAP animations

All ScrollTrigger instances are created inside `initScrollAnimations(months)`. Per-section setup functions:

| Function | Trigger | Animation |
|---|---|---|
| `setupScrollSpy` | section at 60% viewport | Calls `setActiveMonth()` on enter/enterBack |
| `setupSeasonTransition` | section at 50% viewport | Tweens CSS custom properties on `document.documentElement` |
| `setupMonthEntrance` | `.month-header` at 82% | `fromTo` opacity/y on name, tagline, summary |
| `setupBotanicalDrawOn` | section at 78% | Measures `getTotalLength()`, tweens `strokeDashoffset` to 0 |
| `setupBotanicalParallax` | section full scroll | `fromTo` y:40 → y:-60 with `scrub: 1.2` — desktop only |
| `setupCardReveal` | `.month-content` at 88% | `fromTo` stagger on all 6 `.category-card` elements |

`animateHeroIn()` is called once on load:
1. Measures and sets `strokeDasharray/strokeDashoffset` on all `.vine-stroke` and `.vine-leaf` elements
2. Animates vine paths from dashoffset=length to 0 (draw-on effect)
3. Staggers `.hero-word` elements from opacity:0/y:20 to visible
4. Fades in `.hero-scroll-prompt`

**Season colour tweening:**
GSAP 3's CSSPlugin supports tweening CSS custom properties directly on DOM elements when they are prefixed with `--`. Hex colour values are interpolated in RGB space. The tween targets `document.documentElement` so the change cascades to all elements using `var(--bg)` etc.

```javascript
gsap.to(document.documentElement, {
  '--bg':      '#f8f5ed',
  '--primary': '#3a6b4a',
  duration: 1.0,
  ease: 'power2.inOut',
  overwrite: 'auto',
});
```

---

## 7. SVG Conventions

### Hero botanical illustrations

- `viewBox="0 0 300 500"` — portrait orientation
- `fill="none"` — stroke-only line art
- `stroke="currentColor"` — inherits `--primary` via CSS `color`
- `stroke-width="1.8"` — consistent weight across all botanicals
- `stroke-linecap="round" stroke-linejoin="round"` — softer, hand-drawn feel
- All paths, ellipses, and circles are targeted by `scroll.js` for draw-on animation via `getTotalLength()`

### Category icons

- `viewBox="0 0 40 40"`
- Same stroke conventions as botanicals
- Inlined as strings inside `render.js` (no additional fetches required)

### Adding a new botanical

1. Create `assets/svg/botanicals/{name}.svg` following the above conventions
2. In `render.js`, add `'{name}': 'assets/svg/botanicals/{name}.svg'` to the `BOTANICAL_FILES` map
3. In `data/months.json`, set `"heroPlant": "{name}"` on the target month

---

## 8. Adding or Editing Content

### Editing an existing month

Open `data/months.json` and edit the relevant month object. All fields support plain text; no HTML is allowed in data values (the render layer escapes everything).

### Adding a fully populated month

Find the month's object in `months.json` and replace all `"Placeholder —"` strings with real content following the style of January, April, and October entries.

### Content style guide

- **summaries** — 3–4 sentences, atmospheric and evocative; present tense; no bullet points
- **natureEvents[].description** — 2–3 sentences, factual but vivid; include a visual detail
- **wildlife[].note** — 1–2 sentences; include a habitat or timing cue and one memorable detail
- **sky.highlights** — complete sentences; specific dates where known
- **foraging[].note** — include a practical use and one identification detail
- **thingsToDo[].description** — include a named location or specific resource; actionable

### Stub detection

`render.js` detects stub months by checking whether more than 50% of content description strings contain the word "Placeholder". Stubs display a `<p class="stub-notice">` banner. This banner disappears automatically once content is replaced.

---

## 9. Deployment

### Local development

Any static HTTP server will work. Recommended options:

```bash
# Python (no install required on most systems)
cd "Nature Timeline"
python -m http.server 8080
# → http://localhost:8080

# Node.js
npx serve .
# → http://localhost:3000
```

VS Code Live Server extension: right-click `index.html` → Open with Live Server.

> The app **cannot** be opened directly via `file://` — `fetch()` is blocked by CORS for local files. A server is always required.

### GitHub Pages

1. Push the repository to GitHub (all files including `index.html` at the root)
2. Go to **Settings → Pages → Source: Deploy from branch → Branch: main, Folder: / (root)**
3. GitHub Pages serves the site at `https://{username}.github.io/{repo-name}`

No build step is required. The site is entirely static.

### Path notes

- All asset paths in HTML and CSS use relative paths (`./assets/...`, `../assets/...`)
- `fetch('./data/months.json')` uses a relative path — works on both `localhost` and GitHub Pages sub-paths
- SVG paths in `render.js` use relative paths (`assets/svg/botanicals/...`) — ensure the server root is the project root

---

## 10. Browser Support

Targets modern evergreen browsers. No IE11 support.

| Feature | Minimum support |
|---|---|
| ES modules (`type="module"`) | Chrome 61, Firefox 60, Safari 10.1 |
| CSS custom properties | Chrome 49, Firefox 31, Safari 9.1 |
| `getTotalLength()` on SVG | All modern browsers |
| `fetch()` | Chrome 42, Firefox 39, Safari 10.1 |
| CSS `mix-blend-mode` | Chrome 41, Firefox 32, Safari 8 |
| `prefers-reduced-motion` | Chrome 74, Firefox 63, Safari 10.1 |

GSAP 3.12 supports all modern browsers. ScrollTrigger requires a working `IntersectionObserver` and `ResizeObserver`.

---

## 11. Accessibility

- Semantic HTML throughout: `<header>`, `<main>`, `<nav>`, `<footer>`, `<section>`, `<article>`
- Skip link (`<a class="skip-link" href="#timeline-container">`) visible on keyboard focus
- All SVG illustrations have `aria-hidden="true"` — they are decorative
- Nav links have `aria-label` (full month name) and `aria-current="true"` on the active item
- Nature event items are `tabindex="0"` and expand their description on `:focus-visible`
- `prefers-reduced-motion` disables all GSAP animations and parallax; content is fully visible immediately
- Colour contrast: all text/background combinations at or above 4.5:1 ratio in all four palettes

---

## 12. Known Limitations

- **file:// protocol:** The app will not work if opened directly in a browser. A local HTTP server is required.
- **GSAP CSS custom property tweening:** GSAP 3's CSSPlugin interpolates hex colour values on CSS custom properties, but the result depends on the browser's handling of `setProperty` and `getPropertyValue`. If colours appear to jump rather than transition, a fallback is to use a JavaScript proxy object with `onUpdate` to set values manually.
- **SVG `getTotalLength()` on non-path elements:** Some SVG primitives (`<rect>`, `<polygon>`) may not support `getTotalLength()` in all browsers. The `setDashLength()` utility in `scroll.js` wraps this in a try/catch with a 1200px fallback.
- **Mobile parallax:** Parallax is disabled on viewports ≤768px (checked at scroll init time). Resizing from mobile to desktop after page load will not activate parallax without a page refresh. This is intentional — parallax on mobile causes performance issues.
- **Stub botanical SVGs:** Nine months currently use `stub.svg` as their hero illustration. These should be replaced with month-specific botanicals as the project matures.

---

## 13. Extending the Project

### Adding a new category

1. Add the new field to the month objects in `months.json`
2. Create a builder function in `render.js` following the pattern of existing builders
3. Add a new category icon SVG to `assets/svg/icons/`
4. Add the icon string to the `ICONS` object in `render.js`
5. Call the new builder inside `buildMonthSection()` and add it to the `.month-content` grid
6. Add any required CSS to `typography.css` and `components.css`

### Adding a new season palette

1. Add a new `body[data-season="{name}"]` block to `main.css`
2. Add a corresponding entry to the `PALETTES` object in `scroll.js`
3. Set `"season": "{name}"` on the relevant month objects in `months.json`

### Switching from CDN to local GSAP

Download GSAP from https://greensock.com/gsap/ and place in `assets/js/`. Update the `<script>` tags in `index.html` to point to local files. No other changes required.
