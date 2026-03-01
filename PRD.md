# PRD: UK Nature Almanac — Interactive Scroll Timeline

## Context

The goal is to build a publicly accessible, scroll-driven nature almanac for the UK. Visitors can scroll through the year month by month, discovering what's happening in British nature: seasonal wildlife, plants in bloom, foraging finds, sky events, seasonal vegetables, and things to do outdoors. The experience is inspired by the Shorthand/Oxford scroll-storytelling format — editorial, immersive, and deeply visual. There are no users, accounts, or server-side concerns; this is a pure display application.

---

## Product Vision

A living digital almanac that captures the rhythm of the British natural year. Each month feels distinct — a mood, a palette, a handful of wildlife encounters. Users arrive feeling disconnected from the seasons; they leave knowing what's happening outside their window right now, and inspired to go find it.

**The unforgettable moment:** As you scroll from January through to December, the entire page — colors, textures, botanical illustrations — imperceptibly transforms from the cold icy stillness of winter through spring's bright greens, summer's warm golds, autumn's deep russets, and back again. Reading it feels like watching a year pass.

---

## Target Audience

General public in the UK who want seasonal inspiration — what to look for on a walk, what's in season at the farmers' market, what's in the sky tonight. No specialist knowledge required.

---

## Content Architecture

### Six categories per month

| Category | Description | Example |
|---|---|---|
| **Nature Events** | Key phenological moments | Bluebells carpet woodland floors |
| **Wildlife** | Birds, mammals, insects | Swifts arrive from Africa |
| **Sky** | Moon phases, meteor showers, daylight | Perseid meteor shower peaks |
| **Seasonal Vegetables** | What's at peak UK harvest | Jersey Royals, asparagus |
| **Foraging & Plants** | Wild food + plants in bloom | Elderflower, hawthorn blossom |
| **Things To Do** | Recommended activities | RSPB Birdwatch, bluebell walks |

### Content scope

- **3 fully populated months**: January, April, October (representing winter, spring, autumn)
- **9 stub months**: Full structure present, placeholder content with source references
- All content sourced from UK authorities (see Data Sources)

### Data structure (`/data/months.json`)

```json
{
  "months": [
    {
      "id": "january",
      "number": 1,
      "name": "January",
      "tagline": "The quiet heart of winter",
      "summary": "A paragraph evoking the mood and character of the month.",
      "heroPlant": "snowdrop",
      "season": "winter",
      "natureEvents": [
        { "title": "Snowdrops emerge", "description": "..." }
      ],
      "wildlife": [
        { "species": "Fieldfare", "type": "bird", "note": "..." }
      ],
      "sky": {
        "avgSunrise": "08:06",
        "avgSunset": "16:02",
        "highlights": ["Quadrantid meteor shower peaks Jan 3-4"]
      },
      "seasonalVeg": ["Kale", "Brussels sprouts", "Parsnips", "Leeks"],
      "foraging": [
        { "name": "Hawthorn berries", "note": "Still on hedgerows early month" }
      ],
      "plantsInBloom": ["Snowdrop", "Winter aconite", "Hellebore"],
      "thingsToDo": [
        { "activity": "RSPB Big Garden Birdwatch", "when": "Last weekend of January" }
      ]
    }
  ]
}
```

### UK Data Sources

Content must be drawn from or cross-referenced against:
- **Wildlife Trusts** (wildlifetrusts.org) — monthly wildlife calendar
- **Woodland Trust** (woodlandtrust.org.uk) — Nature's Calendar phenology data
- **RSPB** (rspb.org.uk) — bird sightings by month
- **RHS** (rhs.org.uk) — what's in season, plants in bloom
- **River Cottage / Eat the Seasons** — seasonal vegetables
- **Foraging calendar** from the Wild Food UK or similar
- **British Astronomical Society** / timeanddate.com — sky events

---

## UX Architecture

### Page structure (top to bottom)

```
1. Hero section         — Full-viewport opening with botanical frame + title
2. [Month 1–12]         — Each month is a full-chapter scroll section
3. Footer               — Simple, minimal; links to data sources
```

### Fixed navigation

A slim sidebar (desktop) or top pill nav (mobile) showing abbreviated month names (J F M A M J J A S O N D). The current month highlights as you scroll. Click any month to jump directly.

### Within each month chapter

```
Month name (large, with ghosted italic numeral behind it)
│
├── Tagline + summary (fades in on scroll)
│
├── Nature Events     ← staggered card reveal
├── Wildlife          ← staggered card reveal
├── Sky               ← staggered card reveal
├── Seasonal Veg      ← staggered card reveal
├── Foraging & Plants ← staggered card reveal
└── Things To Do      ← staggered card reveal
```

---

## Interaction Design (GSAP ScrollTrigger)

### Key scroll interactions

1. **Month chapter entrance** — Each month section pins briefly, the month name and botanical illustration animate in (draw-on SVG stroke animation), then the page unpins and scrolls through the content.

2. **Seasonal color morphing** — CSS custom properties (`--bg-color`, `--accent-color`, etc.) tween smoothly between season palettes as you cross month boundaries, using GSAP's `to()` with ScrollTrigger scrub.

3. **Botanical parallax** — The hero botanical SVG for each month moves at 60% scroll speed, creating depth behind the content cards.

4. **Category cards** — 6 content cards per month use `ScrollTrigger` with `stagger` so they animate up and fade in sequentially as the user scrolls into them.

5. **SVG draw-on** — Botanical illustrations use `stroke-dashoffset` animation triggered when the month section enters the viewport.

6. **Month navigation scroll-spy** — `ScrollTrigger.create()` with `onEnter`/`onLeaveBack` callbacks update the active month in the sidebar nav.

7. **Hover expansion** — Individual nature event items expand smoothly on hover to reveal fuller description text (CSS transition, no GSAP needed).

### Mobile adaptations

- Sidebar nav collapses to a top-of-screen dot indicator
- Parallax disabled on mobile (respects `prefers-reduced-motion`)
- Cards stack vertically and animate on scroll with simpler fade

---

## Visual Design System

### Aesthetic direction: Botanical Editorial

Inspired by Victorian herbarium plates and hand-drawn naturalist field notebooks. The site feels like a beautifully printed almanac that has been brought to life with subtle motion. Parchment textures, ink-like SVG line art, and dignified typography.

### Typography

| Role | Font | Notes |
|---|---|---|
| Month names / display | **Cormorant Garamond** (Italic) | Google Fonts — elegant, antiquarian |
| Section headings | **Cormorant Garamond** (Regular) | Consistent with display |
| Body / descriptions | **Lora** | Readable serif, editorial warmth |
| Category labels | **Lora** Small Caps or **Cormorant SC** | Subtle, refined |

Load from Google Fonts: `Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Lora:ital,wght@0,400;0,500;1,400`

### Seasonal color palettes (CSS custom properties)

```css
/* Winter: Jan, Feb, Dec */
--bg: #f2efe8;  --primary: #2d4a3e;  --accent: #8fada0;  --muted: #b8c9c2;

/* Spring: Mar, Apr, May */
--bg: #f8f5ed;  --primary: #3a6b4a;  --accent: #7db87d;  --muted: #a8c8a8;

/* Summer: Jun, Jul, Aug */
--bg: #f7f2e2;  --primary: #4a6b2a;  --accent: #a8c060;  --muted: #c8d89a;

/* Autumn: Sep, Oct, Nov */
--bg: #f5ede0;  --primary: #5a3a1a;  --accent: #c07838;  --muted: #d4a870;
```

Each month section has a `data-season` attribute; GSAP tweens CSS variables on ScrollTrigger crossings.

### Background texture

Subtle linen/parchment SVG noise texture overlaid at ~4% opacity on `--bg`. Use CSS `background-blend-mode: multiply` with an SVG feTurbulence filter or a base64-encoded PNG grain. This makes the page feel printed, not digital.

### Ghosted month numerals

Behind each month's title, the month number (01, 02, ... 12) is rendered at ~15–20vw font size in `Cormorant Garamond Italic`, color `--primary` at 6% opacity. Creates depth and magazine-editorial character.

### SVG botanical illustrations

- **Hero illustration per month**: One large (400–500px) botanical SVG — the signature plant or creature of the month. Drawn as outline/line art in `--primary` color. Must be inline SVG so GSAP can animate `stroke-dashoffset`.
- **Category icons** (6 total, reused across all months): leaf, bird, moon/star, vegetable, flower, footprint. Simple 40px line-art SVGs.

Suggested hero botanicals:
- January: Snowdrop
- February: Crocus / Catkins
- March: Daffodil
- April: Bluebell
- May: Hawthorn blossom
- June: Foxglove
- July: Meadow flowers (ox-eye daisy)
- August: Bramble / blackberry
- September: Rosehip
- October: Oak leaf + acorn
- November: Bare tree silhouette
- December: Holly

---

## Technical Architecture

### Stack

- **HTML5** (semantic, accessible)
- **CSS3** (custom properties, grid, flexbox)
- **Vanilla JavaScript** (ES modules)
- **GSAP 3** + **ScrollTrigger plugin** (via CDN or local copy)
- **No build step** — files served directly

### File structure

```
/
├── index.html
├── css/
│   ├── main.css           ← Base reset, layout, CSS variables
│   ├── typography.css     ← Font loading, text styles
│   ├── components.css     ← Cards, nav, footer
│   └── animations.css     ← CSS keyframe animations (load, draw)
├── js/
│   ├── main.js            ← Init, data loading, render pipeline
│   ├── scroll.js          ← All GSAP ScrollTrigger definitions
│   ├── render.js          ← Month section HTML generation from data
│   └── nav.js             ← Month navigation + scroll-spy logic
├── data/
│   └── months.json        ← All 12 months content
└── assets/
    ├── svg/
    │   ├── botanicals/    ← 12 hero illustrations (inline SVG files)
    │   └── icons/         ← 6 category icons
    └── textures/
        └── paper.svg      ← Parchment grain texture
```

### Key implementation notes

- `months.json` is fetched with `fetch('/data/months.json')` on page load before rendering
- Month sections are generated dynamically by `render.js` from the data, inserted into `#timeline-container`
- GSAP is loaded via CDN: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.x.x/gsap.min.js` + ScrollTrigger plugin
- All SVG botanical illustrations must be inlined into generated HTML (not `<img>` tags) for GSAP stroke animation
- `prefers-reduced-motion` media query disables parallax and complex animations, keeps fade-in only
- No external dependencies beyond GSAP + Google Fonts

### GitHub Pages deployment

Repository must have `index.html` at root. Enable Pages via repository Settings → Pages → Deploy from branch `main`. No build step required.

---

## Implementation Phases

### Phase 1 — Data + scaffold
- Create full file/folder structure
- Write `months.json` with all 12 months (January, April, October fully detailed; others with placeholder stubs)
- Write `index.html` shell with correct semantic structure

### Phase 2 — Core CSS
- `main.css`: CSS custom properties for all 4 seasonal palettes, base layout, texture overlay
- `typography.css`: Google Fonts import, heading/body/label type scales
- Viewport-height month sections, sticky sidebar nav

### Phase 3 — SVG assets
- Create 6 category icon SVGs (leaf, bird, moon, veg, flower, footprint) as simple line art
- Create 3 hero botanical SVGs for fully-populated months (snowdrop, bluebell, oak leaf)
- Create stub placeholder botanical for remaining 9 months (can be the same simple leaf outline)

### Phase 4 — JavaScript rendering
- `render.js`: iterates months.json, generates full HTML for each month section
- `nav.js`: generates sidebar nav, handles click-to-jump
- `main.js`: orchestrates fetch → render → init scroll

### Phase 5 — GSAP scroll animations
- `scroll.js`: ScrollTrigger for each month (entrance pin, color transition, botanical parallax)
- Staggered card reveal for 6 category cards per month
- SVG draw-on animation for hero botanicals
- Scroll-spy updating active month in nav

### Phase 6 — Hero section
- Full-viewport opening screen
- Animated botanical frame (SVG vines/border that "grows" on load)
- Title with staggered word reveal
- Scroll prompt

### Phase 7 — Polish + responsive
- Mobile layout (single column, dot nav)
- `prefers-reduced-motion` fallbacks
- Footer with data source credits
- Final CSS refinements (hover states, focus states, print)

---

## Verification

1. **Open `index.html`** in browser (or use VS Code Live Server)
2. **Hero section**: Title animates in, botanical frame draws on, scroll prompt visible
3. **Scroll through January**: Month name reveals, botanical illustration draws, 6 cards stagger in
4. **Scroll to February**: Color palette transitions smoothly, stub content shows placeholder text
5. **Scroll to April**: Full content populates correctly; bluebell botanical animates
6. **Scroll to October**: Full content populates correctly; oak leaf botanical animates
7. **Nav sidebar**: Correct month highlights at each section; click any month jumps correctly
8. **Mobile (375px viewport)**: Layout reflows, nav becomes dot indicator, animations simplified
9. **Reduced motion**: With `prefers-reduced-motion: reduce`, all transforms/parallax disabled; content still visible
10. **Deploy to GitHub Pages**: Push to main branch, verify live URL renders correctly

---

## Out of Scope

- User accounts, personalisation, or saved content
- Backend, CMS, or database
- Search or filtering
- Comments or social features
- Populating the remaining 9 stub months (follow-on task)
