/**
 * render.js — Generates month section HTML from months.json data.
 * Each month section is built from a template and injected into
 * #timeline-container by main.js.
 */

// ── SVG icon map ──────────────────────────────────────────────
// Inline SVG strings keyed by category. These are the 40px
// category icons used in the card labels.

const ICONS = {
  nature: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20 34 C20 34 6 26 6 16 C6 9 12 5 20 6 C28 5 34 9 34 16 C34 26 20 34 20 34Z"/>
    <line x1="20" y1="34" x2="20" y2="9"/>
    <path d="M20 16 L13 12"/><path d="M20 16 L27 12"/>
    <path d="M20 22 L12 19"/><path d="M20 22 L28 19"/>
    <path d="M20 28 L14 26"/><path d="M20 28 L26 26"/>
  </svg>`,

  wildlife: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <ellipse cx="20" cy="22" rx="9" ry="6"/>
    <circle cx="30" cy="19" r="4"/>
    <path d="M34 19 L38 18 L34 20"/>
    <circle cx="31" cy="18" r="0.8" fill="currentColor"/>
    <path d="M14 20 C10 15 6 18 4 14"/>
    <path d="M14 22 C10 20 7 23 4 20"/>
    <path d="M11 22 C8 26 6 24 4 28"/>
    <path d="M11 24 C9 28 8 27 6 30"/>
    <line x1="19" y1="28" x2="18" y2="34"/>
    <line x1="23" y1="28" x2="24" y2="34"/>
  </svg>`,

  sky: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M22 8 C14 8 8 14 8 22 C8 30 14 36 22 36 C26 36 30 34 32 31 C28 31 24 29 21 26 C18 23 16 19 16 15 C16 12 17 9 20 8 C20.7 8 21.3 8 22 8Z"/>
    <line x1="30" y1="10" x2="30" y2="14"/>
    <line x1="28" y1="12" x2="32" y2="12"/>
    <line x1="35" y1="18" x2="35" y2="21"/>
    <line x1="33.5" y1="19.5" x2="36.5" y2="19.5"/>
    <circle cx="26" cy="6" r="1" fill="currentColor" stroke="none"/>
  </svg>`,

  veg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20 36 C14 36 8 30 8 23 C8 16 13 12 20 12 C27 12 32 16 32 23 C32 30 26 36 20 36Z"/>
    <line x1="20" y1="36" x2="18" y2="40"/>
    <line x1="20" y1="36" x2="22" y2="40"/>
    <line x1="20" y1="12" x2="20" y2="6"/>
    <path d="M20 8 C17 5 13 6 11 4"/>
    <path d="M20 8 C23 5 27 6 29 4"/>
    <path d="M20 10 C16 8 14 10 12 8"/>
    <path d="M20 10 C24 8 26 10 28 8"/>
  </svg>`,

  foraging: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="20" cy="20" r="4"/>
    <ellipse cx="20" cy="11" rx="3" ry="5"/>
    <ellipse cx="20" cy="29" rx="3" ry="5"/>
    <ellipse cx="11" cy="20" rx="5" ry="3"/>
    <ellipse cx="29" cy="20" rx="5" ry="3"/>
    <ellipse cx="13.4" cy="13.4" rx="3" ry="5" transform="rotate(-45 13.4 13.4)"/>
    <ellipse cx="26.6" cy="26.6" rx="3" ry="5" transform="rotate(-45 26.6 26.6)"/>
    <ellipse cx="26.6" cy="13.4" rx="3" ry="5" transform="rotate(45 26.6 13.4)"/>
    <ellipse cx="13.4" cy="26.6" rx="3" ry="5" transform="rotate(45 13.4 26.6)"/>
    <line x1="20" y1="36" x2="20" y2="32"/>
  </svg>`,

  todo: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M24 34 C20 34 18 31 18 27 C18 22 20 18 22 16 C24 14 26 14 27 16 C28 18 28 22 28 26 C28 30 27 34 24 34Z"/>
    <path d="M22 16 C23 13 26 12 27 14"/>
    <path d="M16 22 C12 22 10 19 10 15 C10 10 12 6 14 4 C16 2 18 2 19 4 C20 6 20 10 20 14 C20 18 19 22 16 22Z"/>
    <path d="M14 4 C15 1 18 0 19 2"/>
  </svg>`,
};

// ── Botanical SVG map ─────────────────────────────────────────
// Maps heroPlant IDs to SVG file paths.
// Inline SVG is loaded at render time via fetch so GSAP can
// animate stroke-dashoffset on the actual DOM paths.

const BOTANICAL_FILES = {
  snowdrop:   'assets/svg/botanicals/snowdrop.svg',
  bluebell:   'assets/svg/botanicals/bluebell.svg',
  'oak-acorn':'assets/svg/botanicals/oak-acorn.svg',
  // All other months use the stub
};

function getBotanicalPath(heroPlant) {
  return BOTANICAL_FILES[heroPlant] || 'assets/svg/botanicals/stub.svg';
}

// ── HTML builders ─────────────────────────────────────────────

function buildNatureEventsCard(events) {
  if (!events || events.length === 0) return '';
  const items = events.map(e => `
    <div class="nature-event-item" tabindex="0">
      <div class="nature-event-title">${escHtml(e.title)}</div>
      <div class="nature-event-desc">${escHtml(e.description)}</div>
    </div>
  `).join('');

  return `
    <article class="category-card" data-category="nature">
      <div class="category-label">
        ${ICONS.nature}
        <span>Nature Events</span>
      </div>
      <div class="nature-events-list">${items}</div>
    </article>
  `;
}

function buildWildlifeCard(wildlife) {
  if (!wildlife || wildlife.length === 0) return '';
  const items = wildlife.map(w => `
    <div class="wildlife-item">
      <span class="wildlife-species">${escHtml(w.species)}</span>
      <span class="wildlife-type">${escHtml(w.type)}</span>
      <p class="wildlife-note">${escHtml(w.note)}</p>
    </div>
  `).join('');

  return `
    <article class="category-card" data-category="wildlife">
      <div class="category-label">
        ${ICONS.wildlife}
        <span>Wildlife</span>
      </div>
      <div class="wildlife-list">${items}</div>
    </article>
  `;
}

function buildSkyCard(sky) {
  if (!sky) return '';
  const highlights = (sky.highlights || []).map(h => `
    <li class="sky-highlight-item">${escHtml(h)}</li>
  `).join('');

  const timesHtml = (sky.avgSunrise && sky.avgSunset) ? `
    <div class="sky-times">
      <div class="sky-time">
        <span class="sky-time-label">Sunrise</span>
        <span class="sky-time-value">${escHtml(sky.avgSunrise)}</span>
      </div>
      <div class="sky-time">
        <span class="sky-time-label">Sunset</span>
        <span class="sky-time-value">${escHtml(sky.avgSunset)}</span>
      </div>
    </div>
  ` : '';

  return `
    <article class="category-card" data-category="sky">
      <div class="category-label">
        ${ICONS.sky}
        <span>Sky</span>
      </div>
      ${timesHtml}
      <ul class="sky-highlights">${highlights}</ul>
    </article>
  `;
}

function buildVegCard(veg) {
  if (!veg || veg.length === 0) return '';
  const tags = veg.map(v => `<span class="veg-tag">${escHtml(v)}</span>`).join('');

  return `
    <article class="category-card" data-category="veg">
      <div class="category-label">
        ${ICONS.veg}
        <span>Seasonal Veg</span>
      </div>
      <div class="veg-list">${tags}</div>
    </article>
  `;
}

function buildForagingCard(foraging, plantsInBloom) {
  if ((!foraging || foraging.length === 0) && (!plantsInBloom || plantsInBloom.length === 0)) return '';

  const foragingItems = (foraging || []).map(f => `
    <div class="foraging-item">
      <div class="foraging-name">${escHtml(f.name)}</div>
      <p class="item-note">${escHtml(f.note)}</p>
    </div>
  `).join('');

  const bloomHtml = plantsInBloom && plantsInBloom.length > 0 ? `
    <div class="bloom-section">
      <p class="category-sublabel">In bloom</p>
      <div class="bloom-list">
        ${plantsInBloom.map(p => `<span class="bloom-tag">${escHtml(p)}</span>`).join('')}
      </div>
    </div>
  ` : '';

  return `
    <article class="category-card" data-category="foraging">
      <div class="category-label">
        ${ICONS.foraging}
        <span>Foraging &amp; Plants</span>
      </div>
      <div class="foraging-list">${foragingItems}</div>
      ${bloomHtml}
    </article>
  `;
}

function buildTodoCard(thingsToDo) {
  if (!thingsToDo || thingsToDo.length === 0) return '';
  const items = thingsToDo.map(t => `
    <div class="todo-item">
      <div class="todo-activity">${escHtml(t.activity)}</div>
      ${t.when ? `<div class="todo-when">${escHtml(t.when)}</div>` : ''}
      ${t.description ? `<p class="item-note">${escHtml(t.description)}</p>` : ''}
    </div>
  `).join('');

  return `
    <article class="category-card" data-category="todo">
      <div class="category-label">
        ${ICONS.todo}
        <span>Things to Do</span>
      </div>
      <div class="todo-list">${items}</div>
    </article>
  `;
}

// ── Main section builder ──────────────────────────────────────

/**
 * Builds a complete month <section> element.
 * @param {object} month  — month data object from months.json
 * @param {string} svgHtml — inlined SVG string for the botanical illustration
 * @returns {HTMLElement}
 */
export function buildMonthSection(month, svgHtml) {
  const paddedNum = String(month.number).padStart(2, '0');
  const isStub = isStubMonth(month);

  const stubNotice = isStub
    ? `<p class="stub-notice">Content coming soon — sourced from UK conservation records</p>`
    : '';

  const section = document.createElement('section');
  section.className  = 'month-section';
  section.id         = `month-${month.id}`;
  section.dataset.month  = month.id;
  section.dataset.season = month.season;
  section.dataset.number = month.number;

  section.innerHTML = `
    <span class="season-label">${capitalise(month.season)}</span>

    <div class="month-botanical" aria-hidden="true">
      ${svgHtml}
    </div>

    <header class="month-header">
      <span class="month-number-ghost" aria-hidden="true">${paddedNum}</span>
      <h2 class="month-name">${escHtml(month.name)}</h2>
      <p class="month-tagline">${escHtml(month.tagline)}</p>
    </header>

    <p class="month-summary">${escHtml(month.summary)}</p>

    ${stubNotice}

    <div class="month-content" aria-label="${escHtml(month.name)} nature content">
      ${buildNatureEventsCard(month.natureEvents)}
      ${buildWildlifeCard(month.wildlife)}
      ${buildSkyCard(month.sky)}
      ${buildVegCard(month.seasonalVeg)}
      ${buildForagingCard(month.foraging, month.plantsInBloom)}
      ${buildTodoCard(month.thingsToDo)}
    </div>
  `;

  return section;
}

// ── Botanical loader ──────────────────────────────────────────

/**
 * Fetches a botanical SVG file and returns its inner SVG string.
 * Strips the XML declaration if present; keeps the <svg> element.
 * Caches results to avoid duplicate fetches.
 */
const svgCache = new Map();

export async function loadBotanicalSvg(heroPlant) {
  const path = getBotanicalPath(heroPlant);

  if (svgCache.has(path)) {
    return svgCache.get(path);
  }

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`SVG fetch failed: ${path}`);
    let text = await res.text();
    // Strip XML declaration if present
    text = text.replace(/<\?xml[^?]*\?>\s*/i, '');
    svgCache.set(path, text);
    return text;
  } catch (err) {
    console.warn(`Could not load botanical SVG for ${heroPlant}:`, err);
    // Return a minimal placeholder SVG
    return `<svg viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg"></svg>`;
  }
}

// ── Helpers ───────────────────────────────────────────────────

function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Heuristic: a month is a "stub" if most of its content
 * descriptions contain the word "Placeholder".
 */
function isStubMonth(month) {
  const check = [
    ...(month.natureEvents || []).map(e => e.description),
    ...(month.wildlife     || []).map(w => w.note),
    ...(month.foraging     || []).map(f => f.note),
  ];
  if (check.length === 0) return false;
  const stubs = check.filter(s => s && s.includes('Placeholder'));
  return stubs.length / check.length > 0.5;
}
