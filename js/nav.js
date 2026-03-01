/**
 * nav.js — Month navigation sidebar.
 * Generates the nav items, handles click-to-jump, and exposes
 * setActiveMonth() for scroll.js to call as the viewport moves.
 */

// Abbreviated labels matching the PRD spec (J F M A …)
const MONTH_ABBREVS = ['J','F','M','A','M','J','J','A','S','O','N','D'];

let navLinks = [];   // Array of <a> elements in order

/**
 * Builds the sidebar/top nav from months data and inserts it
 * into #month-nav-list.
 * @param {Array} months — the full months array from months.json
 */
export function buildNav(months) {
  const list = document.getElementById('month-nav-list');
  if (!list) return;

  // Clear any existing content
  list.innerHTML = '';

  navLinks = months.map((month, i) => {
    const li = document.createElement('li');
    li.className = 'nav-month-item';

    const a = document.createElement('a');
    a.className   = 'nav-month-link';
    a.href        = `#month-${month.id}`;
    a.textContent = MONTH_ABBREVS[i] || month.name.charAt(0);
    a.dataset.monthId   = month.id;
    a.dataset.monthName = month.name;
    a.setAttribute('aria-label', month.name);
    a.setAttribute('data-month-name', month.name);

    a.addEventListener('click', e => {
      e.preventDefault();
      scrollToMonth(month.id);
    });

    li.appendChild(a);
    list.appendChild(li);
    return a;
  });
}

/**
 * Updates the active state on the nav link matching monthId.
 * Called by scroll.js on ScrollTrigger enter/leaveBack.
 * @param {string} monthId — e.g. 'january'
 */
export function setActiveMonth(monthId) {
  navLinks.forEach(a => {
    const isActive = a.dataset.monthId === monthId;
    a.classList.toggle('is-active', isActive);
    a.setAttribute('aria-current', isActive ? 'true' : 'false');
  });
}

/**
 * Smooth-scrolls to a month section by ID.
 * Uses native scrollIntoView with fallback to GSAP ScrollTo
 * if available (GSAP ScrollToPlugin not included, so use native).
 * @param {string} monthId
 */
function scrollToMonth(monthId) {
  const section = document.getElementById(`month-${monthId}`);
  if (!section) return;

  // If GSAP + ScrollToPlugin is available, use it for smoother scroll
  if (window.gsap && window.ScrollToPlugin) {
    gsap.to(window, {
      scrollTo: { y: section, offsetY: 0 },
      duration: 1.2,
      ease: 'power2.inOut'
    });
  } else {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Returns the nav link element for a given month ID.
 * Used by scroll.js if it needs direct access.
 */
export function getNavLink(monthId) {
  return navLinks.find(a => a.dataset.monthId === monthId) || null;
}
