/**
 * Lost Traditions Revival Center
 * Frontend-only directory of fading cultural practices with search,
 * filters, detail modals, community contributions, and map export.
 */

// ── localStorage key for community submissions ──
const REVIVAL_STORAGE_KEY = 'parampara_revival_contributions';

// ── Sample dataset: at least 10 lost traditions ──
const LOST_TRADITIONS_SAMPLE = [
  {
    id: 'lt-001',
    title: 'Sattriya Ghosha Sangeet',
    category: 'Music',
    village: 'Satras of Majuli',
    state: 'Assam',
    lastPracticed: 1958,
    description:
      'A devotional vocal tradition performed exclusively by male monks in Vaishnavite satras. Unlike mainstream Sattriya dance, Ghosha Sangeet used guttural throat singing and bamboo resonators. The last known complete performance cycle was documented in 1958 before monastic reforms shifted focus to dance.',
    oralHistories: [
      'Elder Bhakat Damodar Das recalled monks practicing at dawn behind closed bamboo screens so women of the village would not hear the sacred tones.',
      'Gopinath Mahanta described how each monastery maintained a separate oral notation system passed only to initiated disciples.',
    ],
    images: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop',
    ],
    references: [
      'Neog, M. (1980). Early History of the Vaishnava Faith and Movement in Assam.',
      'Assam State Archives, Satra Music Records, Accession 47-B.',
    ],
    revivalStatus: 'documented',
    coordinates: [26.95, 94.17],
  },
  {
    id: 'lt-002',
    title: 'Purulia Chhau Mask Blessing Ritual',
    category: 'Ritual',
    village: 'Charida',
    state: 'West Bengal',
    lastPracticed: 1982,
    description:
      'Before each Chhau performance season, mask makers conducted a three-night fire blessing where unfinished masks were placed in a ring of sal wood embers. The ritual invoked Baghmuti, a local forest deity. Modern safety regulations and declining artisan numbers ended the practice by the early 1980s.',
    oralHistories: [
      'Mask artisan Nepal Mahato remembered his grandfather walking barefoot across cooled ash after the blessing.',
      'Village elder Sushil Singh said children were forbidden from watching, as seeing the unmasked spirits was believed to cause fever.',
    ],
    images: [
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=300&fit=crop',
    ],
    references: [
      'Das, S. (1991). Mask and Movement: Folk Theatre of Purulia.',
      'Purulia District Folk Museum field notes, 1979.',
    ],
    revivalStatus: 'endangered',
    coordinates: [23.08, 86.2],
  },
  {
    id: 'lt-003',
    title: 'Toda Pukhoor Embroidery Motifs',
    category: 'Textile',
    village: 'Mudumalai Foothills',
    state: 'Tamil Nadu',
    lastPracticed: 1994,
    description:
      'The Toda community once embroidered cosmological symbols called pukhoor onto shawls using a counted-thread technique unique to Nilgiri plateau pastoralists. Mass-produced textiles and loss of grazing rights displaced the practice; only fragmentary motifs survive in family heirlooms.',
    oralHistories: [
      'Kuttan Kuttan spoke of a shawl pattern mapping the Milky Way that took two monsoons to complete.',
      'Anthropologist notes from 1962 describe women singing while embroidering, each song tied to a motif meaning.',
    ],
    images: [
      'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=300&fit=crop',
    ],
    references: [
      'Rivers, W.H.R. (1906). The Todas.',
      'Nilgiri Adivasi Welfare Board oral history project, 2018.',
    ],
    revivalStatus: 'reviving',
    coordinates: [11.35, 76.75],
  },
  {
    id: 'lt-004',
    title: 'Gond Puppet Theatre (Keka Pata)',
    category: 'Folk Performance',
    village: 'Dindori',
    state: 'Madhya Pradesh',
    lastPracticed: 1976,
    description:
      'Keka Pata was a traveling shadow-and-stick puppet theatre narrating creation myths of the Gond people. Performers used bamboo frames covered in animal hide, illuminated by resin torches. Television and deforestation of ritual groves led to its disappearance.',
    oralHistories: [
      'Performer Bhajju Shyam described puppets stored in sacred mahua trees between seasons.',
      'A village headman recalled performances lasting from dusk until the rooster crowed at dawn.',
    ],
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    ],
    references: [
      'Elwin, V. (1939). The Baiga.',
      'Tribal Research Institute, Bhopal, Puppet Arts Survey 1974.',
    ],
    revivalStatus: 'extinct',
    coordinates: [22.95, 81.08],
  },
  {
    id: 'lt-005',
    title: 'Theyyam Fire Walk Preparation',
    category: 'Ritual',
    village: 'Parassinikadavu',
    state: 'Kerala',
    lastPracticed: 2003,
    description:
      'A specific pre-Theyyam preparation involving walking across heated coconut husk paths while in trance was practiced only in northern Malabar shrines. While Theyyam itself continues, this dangerous fire-walk variant was banned after injuries but elders still describe its spiritual significance.',
    oralHistories: [
      'Oracle Kannan Peruvannan explained that fire walking purified the performer to receive the deity.',
      'Temple records mention a 1923 festival where seven performers crossed embers without burns.',
    ],
    images: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop',
    ],
    references: [
      'Zarrilli, P. (2000). Kathakali Dance-Drama.',
      'North Malabar Temple Trust archives.',
    ],
    revivalStatus: 'documented',
    coordinates: [11.98, 75.35],
  },
  {
    id: 'lt-006',
    title: 'Roghan Painting on Castor Oil',
    category: 'Craft',
    village: 'Nirona',
    state: 'Gujarat',
    lastPracticed: 1965,
    description:
      'An intricate craft where artisans painted elaborate motifs using a metal stylus and castor-based pigments on fabric. A secret family recipe for the pigment binder was lost when the last master artisan died without passing the formula to apprentices.',
    oralHistories: [
      'Descendant Gafoorbhai Khatri recalled his uncle mixing pigments only during new moon nights.',
      'Traders from Bhuj documented roghan shawls as prized dowry items in the 1940s.',
    ],
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=300&fit=crop',
    ],
    references: [
      'Gujarat Lalit Kala Akademi craft survey, 1968.',
      'Kutch Mahotsav artisan registry.',
    ],
    revivalStatus: 'revived',
    coordinates: [23.25, 69.67],
  },
  {
    id: 'lt-007',
    title: 'Khon Mask Carving Ceremony',
    category: 'Martial Art',
    village: 'Imphal Valley',
    state: 'Manipur',
    lastPracticed: 1947,
    description:
      'Before Khon dance-drama performances, master carvers conducted a ceremony blessing each mask with rice beer and chanting from the Lai Haraoba tradition. Post-independence modernization and loss of master carvers ended the ceremonial aspect, though simplified masks are still made.',
    oralHistories: [
      'Carver Tombi Singh described masks as "resting places for the character\'s spirit."',
      'British colonial photographs from 1896 show the full ceremony with twelve participants.',
    ],
    images: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=300&fit=crop',
    ],
    references: [
      'Singh, E. (2004). Manipur: Past and Present Vol. 3.',
      'Manipur State Museum mask collection catalog.',
    ],
    revivalStatus: 'endangered',
    coordinates: [24.82, 93.95],
  },
  {
    id: 'lt-008',
    title: 'Mizo Bamboo Rain Invocation Weaving',
    category: 'Agricultural Ritual',
    village: 'Champhai',
    state: 'Mizoram',
    lastPracticed: 1985,
    description:
      'During drought years, elders wove intricate bamboo split patterns at village entrances while chanting to invoke rain spirits. The patterns, called thlang-ri, were dismantled after first rainfall. Shifting cultivation changes and Christianity reduced practice to memory.',
    oralHistories: [
      'Elder Lalnghakpuia Ralte remembered the entire village fasting until rain came.',
      'Missionary accounts from 1932 mention the ritual but discouraged participation.',
    ],
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
    ],
    references: [
      'Zorema, J. (2007). Indirect Rule in Mizoram.',
      'Mizo Cultural Research Institute field recordings, 1980.',
    ],
    revivalStatus: 'extinct',
    coordinates: [23.45, 93.33],
  },
  {
    id: 'lt-009',
    title: 'Baul Akhra Gathering Songs',
    category: 'Oral Tradition',
    village: 'Kenduli',
    state: 'West Bengal',
    lastPracticed: 1992,
    description:
      'Monthly akhra gatherings where Baul mystics composed spontaneous songs using only ektara and clay pot percussion followed strict turn-taking rules. Commercialization of Baul music for tourism replaced the intimate akhra format with staged performances.',
    oralHistories: [
      'Baul Lalon Fakir\'s lineage holder described songs as "questions the body asks the soul."',
      'A 1971 recording captures an akhra lasting nine hours with no repeated melody.',
    ],
    images: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
    ],
    references: [
      'Capwell, C. (1986). The Music of the Bauls of Bengal.',
      'Birbhum District Cultural Board audio archive.',
    ],
    revivalStatus: 'reviving',
    coordinates: [23.95, 87.42],
  },
  {
    id: 'lt-010',
    title: 'Paithan Pitambara Silk Weaving',
    category: 'Textile',
    village: 'Paithan',
    state: 'Maharashtra',
    lastPracticed: 1975,
    description:
      'A variant of Paithani saree weaving using pure gold zari in a pitambara (golden yellow) palette reserved for royal patrons. The technique required a double-interlock weave pattern lost when power looms arrived and master weavers migrated to cities.',
    oralHistories: [
      'Weaver Shankar Kshirsagar\'s family held a pitambara saree gifted by a Nizam in 1910.',
      'Elders say the golden hue came from a saffron and turmeric dye bath repeated seven times.',
    ],
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop',
    ],
    references: [
      'Maharashtra Handloom Development Corporation records.',
      'Deccan Heritage Foundation textile study, 2005.',
    ],
    revivalStatus: 'reviving',
    coordinates: [19.48, 75.38],
  },
  {
    id: 'lt-011',
    title: 'Kutiyattam Natural Face Paint Recipes',
    category: 'Ritual',
    village: 'Natyagramam',
    state: 'Kerala',
    lastPracticed: 1952,
    description:
      'Kutiyattam performers prepared facial colors from minerals, herbs, and tree resins using recipes passed orally. Synthetic theatrical makeup replaced natural pigments, and the medicinal preparation rituals — including fasting before grinding minerals — were abandoned.',
    oralHistories: [
      'Guru Mani Madhava Chakyar described green pigment made from ground malabar spinach and copper.',
      'Temple ayurvedic physicians supervised pigment preparation to prevent skin ailments.',
    ],
    images: [
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=300&fit=crop',
    ],
    references: [
      'Kutiyattam UNESCO nomination dossier, 2001.',
      'Kerala Kalamandalam pigment recipe manuscripts (partial).',
    ],
    revivalStatus: 'documented',
    coordinates: [10.75, 76.35],
  },
  {
    id: 'lt-012',
    title: 'Dhokra Lost-Wax Mold Ceremony',
    category: 'Craft',
    village: 'Kondagaon',
    state: 'Chhattisgarh',
    lastPracticed: 1988,
    description:
      'Before casting bronze figurines, Dhokra artisans performed a mold-breaking ceremony thanking the earth for yielding clay and beeswax. The ritual included burying the first cast piece as an offering. Factory production methods skipped the ceremony entirely.',
    oralHistories: [
      'Artisan Jaidev Baghel recalled his father chanting in Halbi language during mold breaking.',
      'Village children collected broken mold shards believed to bring good harvest luck.',
    ],
    images: [
      'https://images.unsplash.com/photo-1565193566171-7a0ee193dbe5?w=400&h=300&fit=crop',
    ],
    references: [
      'Bastar District Handbook of Crafts, 1972.',
      'National Museum Dhokra collection provenance records.',
    ],
    revivalStatus: 'endangered',
    coordinates: [19.58, 81.67],
  },
];

// ── Category icon mapping for card placeholders ──
const CATEGORY_ICONS = {
  Music: 'ti-music',
  Ritual: 'ti-flame',
  Textile: 'ti-sewing-pin',
  'Folk Performance': 'ti-masks-theater',
  Craft: 'ti-hammer',
  'Martial Art': 'ti-sword',
  'Agricultural Ritual': 'ti-plant',
  'Oral Tradition': 'ti-microphone',
};

// ── State tracking ──
let allTraditions = [];
let lastFocusedElement = null;

// ── Initialize on page load ──
document.addEventListener('DOMContentLoaded', async () => {
  allTraditions = getAllTraditions();
  populateFilterOptions();
  renderTraditions(await getFilteredTraditions());
  updateStatistics(allTraditions);
  setupEventListeners();
});

/**
 * Retrieves all registered traditions, merging the core static sample dataset
 * with any user-submitted community contributions stored in LocalStorage.
 * Handles parsing, normalizes defaults, and flags custom submissions.
 * @returns {Object[]} Array of merged tradition objects.
 */
function getAllTraditions() {
  const contributions = loadContributions();
  const contributionTraditions = contributions.map((c, index) => ({
    id: c.id || `contrib-${index}`,
    title: c.title,
    category: c.category || 'Community Submission',
    village: c.village,
    state: c.state,
    lastPracticed: c.lastPracticed || new Date().getFullYear(),
    description: c.description,
    oralHistories: c.oralHistories || [],
    images: c.images || [],
    references: c.references
      ? Array.isArray(c.references)
        ? c.references
        : [c.references]
      : [],
    revivalStatus: c.revivalStatus || 'documented',
    coordinates: c.coordinates || null,
    isCommunityContribution: true,
  }));
  return [...LOST_TRADITIONS_SAMPLE, ...contributionTraditions];
}

/**
 * Loads custom community submissions from the browser's LocalStorage.
 * Gracefully defaults to an empty array if storage fails or is empty.
 * @returns {Object[]} Stored user contributions list.
 */
function loadContributions() {
  try {
    const raw = localStorage.getItem(REVIVAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Appends a new community tradition submission to LocalStorage, generating a stable
 * ID and tracking submission timestamps and default states.
 * @param {Object} entry - Raw contribution payload from the submit form.
 */
function saveContribution(entry) {
  const contributions = loadContributions();
  contributions.push({
    ...entry,
    id: `contrib-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    revivalStatus: 'documented',
  });
  localStorage.setItem(REVIVAL_STORAGE_KEY, JSON.stringify(contributions));
}

// ── Map integration export (compatible with map.js marker layers) ──
/**
 * Export lost traditions in a format compatible with map.js.
 * Coordinates are stored as [lat, lng] — swap to [lng, lat] for MapLibre.
 * @returns {Array<Object>} Map-ready tradition markers
 */
function exportLostTraditionsForMap() {
  return getAllTraditions()
    .filter((t) => t.coordinates && t.coordinates.length === 2)
    .map((t) => ({
      id: t.id,
      title: t.title,
      type: 'lost-tradition',
      location: `${t.village}, ${t.state}`,
      coordinates: t.coordinates,
      description: t.description,
      tags: [t.category, t.revivalStatus],
      category: t.category,
      village: t.village,
      state: t.state,
      lastPracticed: t.lastPracticed,
      revivalStatus: t.revivalStatus,
      layer: 'lost-traditions',
    }));
}

// Expose globally for map.js integration
window.ParamparaLostTraditions = {
  getAll: getAllTraditions,
  exportForMap: exportLostTraditionsForMap,
  sampleData: LOST_TRADITIONS_SAMPLE,
};

/**
 * Populates category and state filter dropdown elements dynamically based on
 * the unique attributes present in the loaded traditions dataset.
 * Clears prior options and appends new alphabetized choices.
 */
function populateFilterOptions() {
  const categoryFilter = document.getElementById('category-filter');
  const stateFilter = document.getElementById('state-filter');

  // Clear existing options except the "all" default
  while (categoryFilter.options.length > 1) categoryFilter.remove(1);
  while (stateFilter.options.length > 1) stateFilter.remove(1);

  const categories = [...new Set(allTraditions.map((t) => t.category))].sort();
  const states = [...new Set(allTraditions.map((t) => t.state))].sort();

  categories.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  states.forEach((st) => {
    const opt = document.createElement('option');
    opt.value = st;
    opt.textContent = st;
    stateFilter.appendChild(opt);
  });
}

/**
 * Binds DOM event listeners for search filters, category selectors,
 * modal toggle elements, and community contribution form submissions.
 */
function setupEventListeners() {
  document
    .getElementById('revival-search')
    .addEventListener('input', handleFilterChange);
  document
    .getElementById('category-filter')
    .addEventListener('change', handleFilterChange);
  document
    .getElementById('state-filter')
    .addEventListener('change', handleFilterChange);
  document
    .getElementById('status-filter')
    .addEventListener('change', handleFilterChange);

  document
    .getElementById('close-tradition-modal')
    .addEventListener('click', closeModal);
  document
    .getElementById('tradition-modal')
    .addEventListener('click', (e) => {
      if (e.target.id === 'tradition-modal') closeModal();
    });

  document.addEventListener('keydown', handleModalKeydown);

  document
    .getElementById('contribution-form')
    .addEventListener('submit', handleContributionSubmit);
}

async function handleFilterChange() {
  const filtered = await getFilteredTraditions();
  renderTraditions(filtered);
}

/**
 * Queries UI input values (search bar text, category filter, state filter, status filter)
 * and executes a filter operation on the loaded traditions list.
 * Delegates to window.dataWorker for background performance, falling back to main-thread
 * array filters on worker failure or rejection.
 * @returns {Promise<Object[]>} Filtered traditions.
 */
async function getFilteredTraditions() {
  const search = document
    .getElementById('revival-search')
    .value.trim()
    .toLowerCase();
  const category = document.getElementById('category-filter').value;
  const state = document.getElementById('state-filter').value;
  const status = document.getElementById('status-filter').value;

  try {
    const grid = document.getElementById('traditions-grid');
    if (grid) grid.style.opacity = '0.5';

    const filtered = await window.dataWorker.runJob('filterLostTraditions', {
      items: allTraditions,
      search,
      category,
      state,
      status
    });

    if (grid) grid.style.opacity = '1';
    return filtered;
  } catch (error) {
    console.error('Worker filter error:', error);
    const grid = document.getElementById('traditions-grid');
    if (grid) grid.style.opacity = '1';

    return allTraditions.filter((t) => {
      const matchesSearch =
        !search ||
        (t.title && t.title.toLowerCase().includes(search)) ||
        (t.village && t.village.toLowerCase().includes(search)) ||
        (t.category && t.category.toLowerCase().includes(search));

      const matchesCategory = category === 'all' || t.category === category;
      const matchesState = state === 'all' || t.state === state;
      const matchesStatus = status === 'all' || t.revivalStatus === status;

      return matchesSearch && matchesCategory && matchesState && matchesStatus;
    });
  }
}

/**
 * Computes statistical highlights (total count, endangered count, active revival count,
 * and user-submitted contribution count) and updates the top stat block cards in the UI.
 * @param {Object[]} traditions - The list of traditions currently loaded.
 */
function updateStatistics(traditions) {
  const contributions = loadContributions();

  document.getElementById('stat-total').textContent = traditions.length;
  document.getElementById('stat-extinct').textContent = traditions.filter(
    (t) => t.revivalStatus === 'extinct' || t.revivalStatus === 'endangered'
  ).length;
  document.getElementById('stat-reviving').textContent = traditions.filter(
    (t) => t.revivalStatus === 'reviving' || t.revivalStatus === 'revived'
  ).length;
  document.getElementById('stat-contributions').textContent =
    contributions.length;
}

/**
 * Compiles tradition objects into styled HTML cards and mounts them in the grid.
 * Configures the patterned backgrounds sequentially and hooks up event handlers.
 * @param {Object[]} traditions - Array of filtered traditions to render.
 */
function renderTraditions(traditions) {
  const grid = document.getElementById('traditions-grid');
  const resultsCount = document.getElementById('results-count');

  resultsCount.textContent = `${traditions.length} tradition${traditions.length !== 1 ? 's' : ''} found`;

  if (traditions.length === 0) {
    grid.innerHTML = `
      <div class="revival-empty">
        <i class="ti ti-search-off" aria-hidden="true"></i>
        <p>No traditions match your search. Try adjusting filters or contribute a new entry below.</p>
      </div>`;
    return;
  }

  grid.innerHTML = traditions
    .map((t, index) => {
      const bgClass = `card-bg-${index % 4}`;
      return `
    <button
      class="tradition-card"
      data-id="${escapeHtml(t.id)}"
      aria-label="View details for ${escapeHtml(t.title)}"
    >
      <div class="tradition-card-image ${bgClass}">
        ${
          t.images && t.images.length > 0
            ? `<img src="${escapeHtml(t.images[0])}" alt="${escapeHtml(t.title)}" loading="lazy" class="lazy-img" />
               <span class="placeholder-icon" style="display: none;"><i class="ti ${CATEGORY_ICONS[t.category] || 'ti-book'}" aria-hidden="true"></i></span>`
            : `<span class="placeholder-icon" style="display: flex;"><i class="ti ${CATEGORY_ICONS[t.category] || 'ti-book'}" aria-hidden="true"></i></span>`
        }
      </div>
      <div class="tradition-card-body">
        <h3>${escapeHtml(t.title)}</h3>
        <div class="tradition-card-meta">
          <span class="meta-item">
            <i class="ti ti-map-pin" aria-hidden="true"></i>
            ${escapeHtml(t.village)}
          </span>
        </div>
        <span class="tradition-card-category">${escapeHtml(t.category)}</span>
        <div class="tradition-card-footer">
          <span class="last-practiced">Last practiced: ${t.lastPracticed}</span>
          <span class="status-badge status-${t.revivalStatus}">${formatStatus(t.revivalStatus)}</span>
        </div>
      </div>
    </button>`;
      }
    )
    .join('');

  // Dynamically attach load and error event listeners to comply with CSP
  grid.querySelectorAll('.tradition-card-image img').forEach((img) => {
    // If the image loaded from cache before event listeners attached
    if (img.complete) {
      if (img.naturalWidth > 0) {
        img.classList.add('loaded');
      } else {
        // Fallback for broken cached images
        img.style.display = 'none';
        const placeholder = img.nextElementSibling;
        if (placeholder) placeholder.style.display = 'flex';
      }
    } else {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
      img.addEventListener('error', () => {
        img.style.display = 'none';
        const placeholder = img.nextElementSibling;
        if (placeholder) placeholder.style.display = 'flex';
      });
    }
  });

  grid.querySelectorAll('.tradition-card').forEach((card) => {
    card.addEventListener('click', () => openModal(card.dataset.id));
  });
}

// ── Open detail modal ──
function openModal(traditionId) {
  const tradition = allTraditions.find((t) => t.id === traditionId);
  if (!tradition) return;

  lastFocusedElement = document.activeElement;

  const modal = document.getElementById('tradition-modal');
  const titleEl = document.getElementById('modal-tradition-title');
  const bodyEl = document.getElementById('modal-tradition-body');

  titleEl.textContent = tradition.title;

  bodyEl.innerHTML = `
    <div class="modal-location">
      <span><i class="ti ti-map-pin" aria-hidden="true"></i> ${escapeHtml(tradition.village)}, ${escapeHtml(tradition.state)}</span>
      <span><i class="ti ti-tag" aria-hidden="true"></i> ${escapeHtml(tradition.category)}</span>
      <span class="status-badge status-${tradition.revivalStatus}">${formatStatus(tradition.revivalStatus)}</span>
    </div>

    <div class="modal-section">
      <h4><i class="ti ti-book" aria-hidden="true"></i> Historical Description</h4>
      <div class="markdown-body">${renderMarkdown(tradition.description)}</div>
    </div>

    ${
      tradition.oralHistories && tradition.oralHistories.length > 0
        ? `
    <div class="modal-section">
      <h4><i class="ti ti-microphone" aria-hidden="true"></i> Oral Histories</h4>
      <ul>
        ${tradition.oralHistories.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}
      </ul>
    </div>`
        : ''
    }

    ${
      tradition.references && tradition.references.length > 0
        ? `
    <div class="modal-section">
      <h4><i class="ti ti-link" aria-hidden="true"></i> References</h4>
      <ul>
        ${tradition.references.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}
      </ul>
    </div>`
        : ''
    }

    ${
      tradition.images && tradition.images.length > 0
        ? `
    <div class="modal-section">
      <h4><i class="ti ti-photo" aria-hidden="true"></i> Images</h4>
      <div class="modal-images">
        ${tradition.images.map((img) => `<img src="${escapeHtml(img)}" alt="${escapeHtml(tradition.title)}" loading="lazy" class="lazy-img" onload="this.classList.add('loaded')" />`).join('')}
      </div>
    </div>`
        : ''
    }

    <div class="modal-section">
      <h4><i class="ti ti-hourglass" aria-hidden="true"></i> Revival Status</h4>
      <p>Last practiced circa <strong>${tradition.lastPracticed}</strong>. Current status: <span class="status-badge status-${tradition.revivalStatus}">${formatStatus(tradition.revivalStatus)}</span></p>
    </div>
  `;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('close-tradition-modal').focus();
}

// ── Close modal and restore focus ──
function closeModal() {
  const modal = document.getElementById('tradition-modal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');

  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

// ── Keyboard navigation for modal (Escape + focus trap) ──
function handleModalKeydown(e) {
  const modal = document.getElementById('tradition-modal');
  if (!modal.classList.contains('active')) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    closeModal();
    return;
  }

  if (e.key === 'Tab') {
    trapFocus(e, modal);
  }
}

function trapFocus(e, container) {
  const focusable = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const focusableList = Array.from(focusable).filter(
    (el) => !el.disabled && el.offsetParent !== null
  );

  if (focusableList.length === 0) return;

  const first = focusableList[0];
  const last = focusableList[focusableList.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

// ── Community contribution form handler ──
async function handleContributionSubmit(e) {
  e.preventDefault();

  const feedback = document.getElementById('contribution-feedback');
  const form = e.target;

  const title = form.title.value.trim();
  const village = form.village.value.trim();
  const state = form.state.value.trim();
  const description = form.description.value.trim();
  const references = form.references.value.trim();

  if (!title || !village || !state || !description) {
    feedback.textContent = 'Please fill in all required fields.';
    feedback.className = 'contribution-feedback error';
    return;
  }

  saveContribution({
    title,
    village,
    state,
    description,
    references,
    oralHistories: [],
    images: [],
  });

  feedback.textContent =
    'Thank you! Your contribution has been saved locally.';
  feedback.className = 'contribution-feedback success';
  form.reset();

  allTraditions = getAllTraditions();
  populateFilterOptions();
  renderTraditions(await getFilteredTraditions());
  updateStatistics(allTraditions);
}

// ── Utility helpers ──
function formatStatus(status) {
  const labels = {
    extinct: 'Extinct',
    endangered: 'Endangered',
    documented: 'Documented',
    reviving: 'Reviving',
    revived: 'Revived',
  };
  return labels[status] || status;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
