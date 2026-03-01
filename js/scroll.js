/**
 * scroll.js — All GSAP ScrollTrigger animation definitions.
 *
 * Animations implemented:
 *   1. Hero vine draw-on + word stagger (animateHeroIn)
 *   2. Season colour morphing       (setupSeasonTransition)
 *   3. Month header entrance        (setupMonthEntrance)
 *   4. Botanical SVG draw-on        (setupBotanicalDrawOn)
 *   5. Botanical parallax           (setupBotanicalParallax)
 *   6. Category card stagger reveal (setupCardReveal)
 *   7. Nav scroll-spy               (setupScrollSpy)
 */

import { setActiveMonth } from './nav.js';

// ── Seasonal colour palettes ───────────────────────────────────
// Values mirror main.css; GSAP tweens CSS custom properties
// directly on document.documentElement.

const PALETTES = {
  winter: {
    '--bg':         '#f2efe8',
    '--primary':    '#2d4a3e',
    '--accent':     '#8fada0',
    '--muted':      '#b8c9c2',
    '--text':       '#2a3028',
    '--text-light': '#5a6b5a',
  },
  spring: {
    '--bg':         '#f8f5ed',
    '--primary':    '#3a6b4a',
    '--accent':     '#7db87d',
    '--muted':      '#a8c8a8',
    '--text':       '#263324',
    '--text-light': '#4a6b4a',
  },
  summer: {
    '--bg':         '#f7f2e2',
    '--primary':    '#4a6b2a',
    '--accent':     '#a8c060',
    '--muted':      '#c8d89a',
    '--text':       '#28330e',
    '--text-light': '#5a6b2a',
  },
  autumn: {
    '--bg':         '#f5ede0',
    '--primary':    '#5a3a1a',
    '--accent':     '#c07838',
    '--muted':      '#d4a870',
    '--text':       '#33200a',
    '--text-light': '#7a4a20',
  },
};

// ── Responsive / motion helpers ────────────────────────────────

const isMobile       = () => window.matchMedia('(max-width: 768px)').matches;
const reducedMotion  = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─────────────────────────────────────────────────────────────
// 1. HERO ANIMATION
// ─────────────────────────────────────────────────────────────

/**
 * Called by main.js immediately after the DOM is ready.
 * Draws on the hero frame vines then reveals the title words.
 */
export function animateHeroIn() {
  if (reducedMotion()) {
    // Just snap everything visible
    gsap.set('.hero-word',         { opacity: 1, y: 0 });
    gsap.set('.hero-scroll-prompt',{ opacity: 0.6 });
    gsap.set('.vine-stroke, .vine-leaf', { strokeDashoffset: 0 });
    return;
  }

  // Measure and set dash lengths on vine paths
  const vinePaths = document.querySelectorAll('.vine-stroke, .vine-leaf');
  vinePaths.forEach(el => setDashLength(el));

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  // Draw the corner vines first
  if (vinePaths.length > 0) {
    tl.to('.vine-stroke', {
      strokeDashoffset: 0,
      duration: 2.4,
      stagger: 0.18,
      ease: 'power2.inOut',
    }, 0.2);

    tl.to('.vine-leaf', {
      strokeDashoffset: 0,
      duration: 1.1,
      stagger: 0.1,
      ease: 'power2.inOut',
    }, 0.7);
  }

  // Stagger the hero words in
  tl.to('.hero-word', {
    opacity: 1,
    y: 0,
    duration: 0.9,
    stagger: 0.18,
  }, vinePaths.length > 0 ? 0.9 : 0);

  // Fade in the scroll prompt last
  tl.to('.hero-scroll-prompt', {
    opacity: 0.6,
    duration: 0.8,
  }, '>-0.2');
}

// ─────────────────────────────────────────────────────────────
// 2. MAIN SCROLL INITIALISATION
// ─────────────────────────────────────────────────────────────

/**
 * Called by main.js after all month sections have been rendered.
 * Sets up all per-month ScrollTriggers.
 * @param {Array} months — from months.json
 */
export function initScrollAnimations(months) {
  months.forEach(month => {
    const section = document.getElementById(`month-${month.id}`);
    if (!section) return;

    setupScrollSpy(section, month);
    setupSeasonTransition(section, month);
    setupMonthEntrance(section);
    setupBotanicalDrawOn(section);
    if (!isMobile() && !reducedMotion()) {
      setupBotanicalParallax(section);
    }
    setupCardReveal(section);
  });
}

// ─────────────────────────────────────────────────────────────
// 3. SCROLL SPY — update active nav item
// ─────────────────────────────────────────────────────────────

function setupScrollSpy(section, month) {
  ScrollTrigger.create({
    trigger: section,
    // Fire when the section occupies the middle 20% of the viewport
    start: 'top 60%',
    end:   'bottom 40%',
    onEnter:     () => setActiveMonth(month.id),
    onEnterBack: () => setActiveMonth(month.id),
  });
}

// ─────────────────────────────────────────────────────────────
// 4. SEASON COLOUR MORPHING
// ─────────────────────────────────────────────────────────────

/**
 * When a month section crosses the 50% viewport mark (in either
 * direction), tween all CSS custom properties to the season palette.
 * GSAP 3's CSSPlugin handles interpolation of hex colour strings
 * on CSS custom properties directly.
 */
function setupSeasonTransition(section, month) {
  const palette = PALETTES[month.season];
  if (!palette) return;

  const root = document.documentElement;

  ScrollTrigger.create({
    trigger: section,
    start: 'top 50%',
    onEnter() {
      applyPalette(root, palette, 1.0);
      document.body.dataset.season = month.season;
    },
    onEnterBack() {
      applyPalette(root, palette, 0.7);
      document.body.dataset.season = month.season;
    },
  });
}

function applyPalette(root, palette, duration) {
  gsap.to(root, {
    ...palette,
    duration,
    ease: 'power2.inOut',
    overwrite: 'auto',
  });
}

// ─────────────────────────────────────────────────────────────
// 5. MONTH HEADER ENTRANCE
// ─────────────────────────────────────────────────────────────

/**
 * Fades in the month name, tagline, summary, and stub notice
 * as a staggered sequence when the header scrolls into view.
 * No pinning — a clean entrance is less jarring with 12 sections.
 */
function setupMonthEntrance(section) {
  if (reducedMotion()) return;

  const targets = [
    section.querySelector('.month-name'),
    section.querySelector('.month-tagline'),
    section.querySelector('.month-summary'),
    section.querySelector('.stub-notice'),
  ].filter(Boolean);

  if (targets.length === 0) return;

  gsap.fromTo(targets,
    { opacity: 0, y: 32 },
    {
      opacity: 1,
      y: 0,
      duration: 0.85,
      stagger: 0.14,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section.querySelector('.month-header'),
        start:   'top 82%',
        toggleActions: 'play none none reverse',
      },
    }
  );
}

// ─────────────────────────────────────────────────────────────
// 6. BOTANICAL SVG DRAW-ON
// ─────────────────────────────────────────────────────────────

/**
 * Measures each SVG path inside .month-botanical and animates
 * strokeDashoffset from its full length to 0 when the section
 * enters the viewport.
 */
function setupBotanicalDrawOn(section) {
  if (reducedMotion()) return;

  const botanical = section.querySelector('.month-botanical');
  if (!botanical) return;

  // Target all stroke-able primitives
  const paths = Array.from(
    botanical.querySelectorAll('path, ellipse, circle, line, polyline, rect')
  );
  if (paths.length === 0) return;

  // Measure and initialise each path
  paths.forEach(el => setDashLength(el));

  gsap.to(paths, {
    strokeDashoffset: 0,
    duration: 1.8,
    stagger: {
      each: 0.05,
      from: 'start',
    },
    ease: 'power2.inOut',
    scrollTrigger: {
      trigger: section,
      start:   'top 78%',
      toggleActions: 'play none none reverse',
    },
  });
}

// ─────────────────────────────────────────────────────────────
// 7. BOTANICAL PARALLAX
// ─────────────────────────────────────────────────────────────

/**
 * Moves the botanical illustration at ~60% of scroll speed,
 * creating depth behind the content cards.
 * Only active on desktop and when no reduced-motion preference.
 */
function setupBotanicalParallax(section) {
  const botanical = section.querySelector('.month-botanical');
  if (!botanical) return;

  gsap.fromTo(botanical,
    { y: 40 },
    {
      y: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start:   'top bottom',
        end:     'bottom top',
        scrub:   1.2,
      },
    }
  );
}

// ─────────────────────────────────────────────────────────────
// 8. CATEGORY CARD STAGGER REVEAL
// ─────────────────────────────────────────────────────────────

/**
 * Staggers the 6 category cards up and in when the .month-content
 * grid enters the viewport. Cards start with opacity:0 / y:24
 * (set in components.css) and are overridden inline by GSAP.
 */
function setupCardReveal(section) {
  if (reducedMotion()) {
    section.querySelectorAll('.category-card').forEach(c => {
      gsap.set(c, { opacity: 1, y: 0 });
    });
    return;
  }

  const cards = section.querySelectorAll('.category-card');
  if (cards.length === 0) return;

  gsap.fromTo(cards,
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.65,
      stagger: 0.11,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section.querySelector('.month-content'),
        start:   'top 88%',
        toggleActions: 'play none none reverse',
      },
    }
  );
}

// ─────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────

/**
 * Measures a path's total length (with fallback) and sets
 * strokeDasharray + strokeDashoffset to that value so the
 * element is ready for a draw-on animation.
 */
function setDashLength(el) {
  let length = 1200; // safe fallback
  try {
    if (typeof el.getTotalLength === 'function') {
      const measured = el.getTotalLength();
      if (measured > 0) length = measured;
    }
  } catch (_) { /* some elements don't support getTotalLength */ }

  gsap.set(el, {
    strokeDasharray:  length,
    strokeDashoffset: length,
  });
}
