/**
 * main.js — Application entry point.
 * Orchestrates: fetch → render → nav → scroll animations.
 *
 * Load order:
 *   1. Fetch months.json
 *   2. For each month, fetch its botanical SVG (in parallel)
 *   3. Render all month sections into #timeline-container
 *   4. Build navigation
 *   5. Initialise GSAP ScrollTrigger animations
 *   6. Animate the hero section in
 */

import { buildMonthSection, loadBotanicalSvg } from './render.js';
import { buildNav }                             from './nav.js';
import { initScrollAnimations, animateHeroIn }  from './scroll.js';

// ── Boot ──────────────────────────────────────────────────────

async function init() {
  try {
    // 1. Fetch data
    const months = await fetchMonths();

    // 2. Fetch all botanical SVGs in parallel
    const svgStrings = await Promise.all(
      months.map(m => loadBotanicalSvg(m.heroPlant))
    );

    // 3. Render month sections
    const container = document.getElementById('timeline-container');
    if (!container) throw new Error('#timeline-container not found');

    const fragment = document.createDocumentFragment();
    months.forEach((month, i) => {
      const section = buildMonthSection(month, svgStrings[i]);
      fragment.appendChild(section);
    });
    container.appendChild(fragment);

    // 4. Build navigation
    buildNav(months);

    // 5. Initialise scroll animations (requires DOM to be populated)
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      initScrollAnimations(months);
    } else {
      // No GSAP — make everything visible immediately
      revealAllFallback();
    }

    // 6. Animate hero in (after a brief paint delay)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        animateHeroIn();
      });
    });

    // Set initial body season from first month
    if (months.length > 0) {
      document.body.dataset.season = months[0].season;
    }

    // Hide the scroll prompt once user has scrolled past the hero
    const prompt = document.querySelector('.hero-scroll-prompt');
    if (prompt) {
      const heroEl = document.getElementById('hero');
      ScrollTrigger.create({
        trigger: heroEl,
        start: 'bottom 80%',
        onEnter:     () => { prompt.style.opacity = '0'; prompt.style.pointerEvents = 'none'; },
        onLeaveBack: () => { prompt.style.opacity = '0.6'; prompt.style.pointerEvents = ''; },
      });
    }

  } catch (err) {
    console.error('Nature Almanac init failed:', err);
    showErrorState(err);
  }
}

// ── Data fetching ─────────────────────────────────────────────

async function fetchMonths() {
  const res = await fetch('./data/months.json');
  if (!res.ok) throw new Error(`Failed to load months.json: ${res.status}`);
  const data = await res.json();
  if (!data.months || !Array.isArray(data.months)) {
    throw new Error('months.json: expected { months: [...] }');
  }
  return data.months;
}

// ── Fallback (no GSAP or reduced motion) ─────────────────────

function revealAllFallback() {
  // Make all animated elements immediately visible
  document.querySelectorAll('.category-card').forEach(el => {
    el.style.opacity  = '1';
    el.style.transform = 'none';
  });
  document.querySelectorAll('.hero-word').forEach(el => {
    el.style.opacity  = '1';
    el.style.transform = 'none';
  });
  const prompt = document.querySelector('.hero-scroll-prompt');
  if (prompt) prompt.style.opacity = '0.6';

  // Draw all SVG botanicals
  document.querySelectorAll(
    '.month-botanical svg path, .month-botanical svg ellipse, ' +
    '.month-botanical svg circle, .month-botanical svg line'
  ).forEach(el => {
    el.style.strokeDashoffset = '0';
  });

  // Draw hero vines
  document.querySelectorAll('.vine-stroke, .vine-leaf').forEach(el => {
    el.style.strokeDashoffset = '0';
  });
}

// ── Error state ───────────────────────────────────────────────

function showErrorState(err) {
  const container = document.getElementById('timeline-container');
  if (!container) return;
  container.innerHTML = `
    <div style="padding: 4rem 2rem; text-align: center; font-family: Georgia, serif;">
      <p style="color: #5a3a1a; font-style: italic;">
        Could not load the almanac. Please open this page via a local server
        (e.g. VS Code Live Server) rather than directly as a file://.
      </p>
      <p style="margin-top: 1rem; font-size: 0.875rem; color: #888;">${err.message}</p>
    </div>
  `;
}

// ── Reduced motion: skip GSAP, reveal everything ──────────────

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
  // Override: reveal all on DOMContentLoaded without animations
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const months = await fetchMonths();
      const svgStrings = await Promise.all(
        months.map(m => loadBotanicalSvg(m.heroPlant))
      );
      const container = document.getElementById('timeline-container');
      if (container) {
        const fragment = document.createDocumentFragment();
        months.forEach((m, i) => fragment.appendChild(buildMonthSection(m, svgStrings[i])));
        container.appendChild(fragment);
      }
      buildNav(months);
      if (months.length > 0) document.body.dataset.season = months[0].season;
      revealAllFallback();
    } catch (err) {
      showErrorState(err);
    }
  });
} else {
  // Normal init — wait for GSAP to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
