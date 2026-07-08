// public/scripts/timeline.js
/*
  Interactive Heritage Timeline
  - Renders milestones from a static data array.
  - Supports search, category filter, zoom modes, progress bar, keyboard navigation, and expand/collapse.
  - No external libraries; vanilla ES6.
*/

// Sample timeline data (8 milestones). Replace image/audio paths with actual assets.
const timelineData = [
  {
    id: "m1",
    year: "1850",
    title: "Traditional Weaving Revival",
    category: "Revival",
    description: "Community elders revived forgotten weaving techniques, preserving patterns passed down generations.",
    image: "images/timeline/weaving.jpg",
    audio: "audio/weaving.mp3",
    location: "Village A",
    tags: ["craft", "heritage"],
  },
  {
    id: "m2",
    year: "1905",
    title: "Harvest Festival Birth",
    category: "Festival",
    description: "The first recorded harvest festival celebrated the bounty of the monsoon season.",
    image: "images/timeline/harvest.jpg",
    audio: "audio/harvest.mp3",
    location: "Village B",
    tags: ["festival", "community"],
  },
  {
    id: "m3",
    year: "1920",
    title: "Pottery Guild Formation",
    category: "Craft",
    description: "A guild of potters standardized techniques, leading to a distinct regional style.",
    image: "images/timeline/pottery.jpg",
    audio: "audio/pottery.mp3",
    location: "Village C",
    tags: ["craft", "art"],
  },
  {
    id: "m4",
    year: "1947",
    title: "Independence Celebration",
    category: "Modern Innovation",
    description: "Villagers organized the first post‑independence cultural showcase.",
    image: "images/timeline/independence.jpg",
    audio: "audio/independence.mp3",
    location: "Village D",
    tags: ["history", "modern"],
  },
  {
    id: "m5",
    year: "1965",
    title: "Introduction of Radio",
    category: "Modern Innovation",
    description: "Radio arrived, allowing oral stories to be broadcast across villages.",
    image: "images/timeline/radio.jpg",
    audio: "audio/radio.mp3",
    location: "Village E",
    tags: ["technology", "audio"],
  },
  {
    id: "m6",
    year: "1980",
    title: "Women’s Handloom Cooperative",
    category: "Craft",
    description: "A women‑led cooperative revitalized handloom production and income.",
    image: "images/timeline/handloom.jpg",
    audio: "audio/handloom.mp3",
    location: "Village F",
    tags: ["craft", "women"],
  },
  {
    id: "m7",
    year: "1995",
    title: "Digital Archiving Initiative",
    category: "Village",
    description: "The first digital archive of photographs and recordings was created.",
    image: "images/timeline/digital.jpg",
    audio: "audio/digital.mp3",
    location: "Village G",
    tags: ["digital", "archive"],
  },
  {
    id: "m8",
    year: "2015",
    title: "Heritage Trail Launch",
    category: "Village",
    description: "A curated heritage trail linked several villages for cultural tourism.",
    image: "images/timeline/trail.jpg",
    audio: "audio/trail.mp3",
    location: "Village H",
    tags: ["tourism", "trail"],
  },
];

// Cache DOM elements
const container = document.querySelector('.timeline-container');
const searchInput = document.getElementById('timeline-search');
const categorySelect = document.getElementById('category-filter');
const zoomButtons = document.querySelectorAll('.zoom-controls button');
const progressBar = document.querySelector('.timeline-progress .progress-bar');

let filteredData = [...timelineData];
let expandedCardId = null; // Track which card is expanded

/** Render cards based on filteredData */
function renderCards() {
  container.innerHTML = '';
  filteredData.forEach((item, idx) => {
    const card = document.createElement('article');
    card.className = 'timeline-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.dataset.id = item.id;
    card.dataset.index = idx;
    card.setAttribute('aria-expanded', 'false');
    card.innerHTML = `
      <div class="year">${item.year}</div>
      <div class="title">${item.title}</div>
      <div class="category">${item.category}</div>
      <img src="${item.image}" alt="${item.title}" />
      <div class="description">${item.description}</div>
    `;
    // Click / keyboard handling
    card.addEventListener('click', () => toggleExpand(card));
    card.addEventListener('keydown', (e) => handleCardKey(e, card));
    container.appendChild(card);
  });
  // Trigger entrance animation after DOM injection
  animateEntrance();
}

/** Animate cards appearing one by one */
function animateEntrance() {
  const cards = container.querySelectorAll('.timeline-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, i * 120);
  });
}

/** Expand or collapse a card */
function toggleExpand(card) {
  const isExpanded = card.getAttribute('aria-expanded') === 'true';
  // Collapse previously expanded card
  if (expandedCardId && expandedCardId !== card.dataset.id) {
    const prev = container.querySelector(`[data-id="${expandedCardId}"]`);
    if (prev) {
      prev.setAttribute('aria-expanded', 'false');
    }
  }
  // Toggle current card
  card.setAttribute('aria-expanded', (!isExpanded).toString());
  expandedCardId = !isExpanded ? card.dataset.id : null;
}

/** Keyboard interaction for a card */
function handleCardKey(event, card) {
  switch (event.key) {
    case 'Enter':
    case ' ': // space
      event.preventDefault();
      toggleExpand(card);
      break;
    case 'Escape':
      if (card.getAttribute('aria-expanded') === 'true') {
        toggleExpand(card);
      }
      break;
    case 'ArrowRight':
      focusSibling(card, 1);
      break;
    case 'ArrowLeft':
      focusSibling(card, -1);
      break;
    default:
      break;
  }
}

/** Focus next/previous card */
function focusSibling(current, offset) {
  const cards = Array.from(container.querySelectorAll('.timeline-card'));
  const idx = cards.indexOf(current);
  const newIdx = (idx + offset + cards.length) % cards.length;
  cards[newIdx].focus();
  cards[newIdx].scrollIntoView({ behavior: 'smooth', inline: 'center' });
}

/** Search handler (debounced) */
let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(applyFilters, 250);
});

/** Category filter handler */
categorySelect.addEventListener('change', applyFilters);

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  filteredData = timelineData.filter((item) => {
    const matchesText =
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.year.includes(query);
    const matchesCategory = category === 'all' || item.category === category;
    return matchesText && matchesCategory;
  });
  renderCards();
}

/** Zoom controls */
zoomButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    zoomButtons.forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    const mode = btn.dataset.zoom; // normal | compact | detailed
    container.classList.remove('compact', 'detailed');
    if (mode !== 'normal') {
      container.classList.add(mode);
    }
  });
});

/** Update progress bar based on scroll */
function updateProgress() {
  const scrollLeft = container.scrollLeft;
  const maxScroll = container.scrollWidth - container.clientWidth;
  const percent = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
  progressBar.style.width = `${percent}%`;
}
container.addEventListener('scroll', updateProgress);

/** Global keyboard navigation when focus is on container */
container.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const cards = container.querySelectorAll('.timeline-card');
    if (cards.length === 0) return;
    const focused = document.activeElement;
    const currentIdx = Array.from(cards).indexOf(focused);
    const nextIdx = e.key === 'ArrowRight' ? (currentIdx + 1) % cards.length : (currentIdx - 1 + cards.length) % cards.length;
    cards[nextIdx].focus();
    cards[nextIdx].scrollIntoView({ behavior: 'smooth', inline: 'center' });
    e.preventDefault();
  }
});

/** Initial render */
renderCards();

// Accessibility: ensure focus ring appears when using keyboard only
let mouseDown = false;
window.addEventListener('mousedown', () => (mouseDown = true));
window.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    mouseDown = false;
  }
});

/** Optional deep‑link support – scroll to milestone if hash present */
if (window.location.hash) {
  const targetId = window.location.hash.substring(1);
  const targetCard = container.querySelector(`[data-id="${targetId}"]`);
  if (targetCard) {
    setTimeout(() => {
      targetCard.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      targetCard.focus();
    }, 500);
  }
}
