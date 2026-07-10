/**
 * Grandmother's Knowledge Vault
 * Preserves indigenous and traditional community knowledge with search,
 * category filters, detail modals, community contributions, and localStorage.
 */

const VAULT_STORAGE_KEY = 'parampara_knowledge_vault';

const VAULT_CATEGORIES = [
  'Traditional Recipes',
  'Farming Wisdom',
  'Folk Remedies',
  'Seasonal Customs',
  'Household Practices',
  'Proverbs',
  'Environmental Knowledge',
];

const CATEGORY_ICONS = {
  'Traditional Recipes': 'ti-soup',
  'Farming Wisdom': 'ti-plant-2',
  'Folk Remedies': 'ti-leaf',
  'Seasonal Customs': 'ti-calendar-event',
  'Household Practices': 'ti-home-heart',
  Proverbs: 'ti-quote',
  'Environmental Knowledge': 'ti-trees',
};

const KNOWLEDGE_SAMPLE = [
  {
    id: 'kv-001',
    title: 'Mahua Flower Roti of Bastar',
    village: 'Kondagaon',
    region: 'Chhattisgarh',
    elderName: 'Dadi Sukmati Bai',
    category: 'Traditional Recipes',
    description:
      'Before the monsoon rains, grandmothers gather fallen **mahua flowers** at dawn when dew still clings to the petals.\n\n### The Process\n1. Flowers are sun-dried on bamboo mats for three days.\n2. Ground with coarse rice into a dough.\n3. Cooked on a clay tawa that has never touched oil.\n\n> Children were traditionally given the first roti to bless the harvest season.',
    audioUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    imageUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop',
    videoUrl: '',
    relatedKnowledge: ['kv-002', 'kv-006'],
  },
  {
    id: 'kv-002',
    title: 'Three-Sister Terrace Planting',
    village: 'Ziro Valley',
    region: 'Arunachal Pradesh',
    elderName: 'Aama Hibu Taro',
    category: 'Farming Wisdom',
    description:
      "Apatani elders plant maize, beans, and squash together on hillside terraces in a pattern passed through women's planting songs. Maize provides a natural trellis for climbing beans; squash leaves shade the soil and retain moisture through dry weeks. The spacing between rows follows the width of a grandmother's outstretched arms — a measure that has proven consistent across generations. This intercropping reduces pest damage without chemical sprays.",
    audioUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop',
    videoUrl:
      'https://sample-videos.com/video321/mp4/240/big_buck_bunny_240p_1mb.mp4',
    relatedKnowledge: ['kv-006', 'kv-010'],
  },
  {
    id: 'kv-003',
    title: 'Neem and Turmeric Wound Paste',
    village: 'Thirunallar',
    region: 'Tamil Nadu',
    elderName: 'Paati Kamalammal',
    category: 'Folk Remedies',
    description:
      'Fresh neem leaves are ground with raw turmeric rhizome and a few drops of rainwater collected before sunrise. The paste is applied to cuts and skin infections, then covered with a clean banana leaf warmed briefly over a flame. Elders instruct that the paste must be prepared while chanting a short prayer to Mariamman, the village guardian deity. The remedy is never stored overnight — potency is believed to fade with the setting sun.',
    audioUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    imageUrl:
      'https://images.unsplash.com/photo-1505577058444-a3dab90d4253?w=600&h=400&fit=crop',
    videoUrl: '',
    relatedKnowledge: ['kv-007'],
  },
  {
    id: 'kv-004',
    title: 'Pongal Harvest Offering Ritual',
    village: 'Thanjavur',
    region: 'Tamil Nadu',
    elderName: 'Aachi Parvathammal',
    category: 'Seasonal Customs',
    description:
      "On the first day of Thai month, the first pot of pongal must boil over — \"pongalo pongal\" — before anyone eats. Grandmothers tie fresh turmeric and ginger around the pot's neck and place three sugarcane stalks in a triangle around the hearth. The overflowing rice symbolizes abundance for the coming year. Young women learn to judge the exact moment of overflow by listening to the bubble rhythm, a skill that cannot be timed by clock alone.",
    audioUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=400&fit=crop',
    videoUrl: '',
    relatedKnowledge: ['kv-001', 'kv-011'],
  },
  {
    id: 'kv-005',
    title: 'Cow-Dung Floor Coating for Monsoon',
    village: 'Mandawa',
    region: 'Rajasthan',
    elderName: 'Baa Ganga Devi',
    category: 'Household Practices',
    description:
      'Before the first monsoon shower, courtyard floors are coated with a mixture of fresh cow dung, clay, and dried neem leaves. The coating is applied in circular strokes from the center outward, a pattern said to invite prosperity inward. Grandmothers add a pinch of sindoor at the threshold for protection. The floor must dry completely before the rains arrive — elders read cloud formations and bird behavior to choose the right day, never the almanac alone.',
    audioUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
    videoUrl: '',
    relatedKnowledge: ['kv-007', 'kv-009'],
  },
  {
    id: 'kv-006',
    title: 'Reading Clouds Before Sowing',
    village: 'Barmer',
    region: 'Rajasthan',
    elderName: 'Dada Ram Singh Rathore',
    category: 'Farming Wisdom',
    description:
      "Desert farmers distinguish twelve cloud formations that predict rainfall timing within a fortnight. A reddish tinge at sunset with mare's-tail cirrus means wait — rain will come but seeds planted now will rot. Grandfathers teach sons to watch the direction jackals face at dusk; facing east signals early rains favorable for bajra. This knowledge predates meteorological stations and remains trusted in villages far from paved roads.",
    audioUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    imageUrl:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop',
    videoUrl: '',
    relatedKnowledge: ['kv-002', 'kv-010'],
  },
  {
    id: 'kv-007',
    title: 'Tulsi Morning Protection Ritual',
    village: 'Varanasi',
    region: 'Uttar Pradesh',
    elderName: 'Amma Shanti Devi',
    category: 'Household Practices',
    description:
      "Each morning before sunrise, grandmothers circumambulate the tulsi plant seven times while sprinkling water mixed with a drop of ghee. The ritual is never skipped during menstruation cycles — instead, a younger girl is taught to perform it, ensuring continuity. Dried tulsi leaves from the previous season are burned at the base as fertilizer. Elders say the plant's health mirrors the household's wellbeing, and yellowing leaves signal a need for reconciliation among family members.",
    audioUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&h=400&fit=crop',
    videoUrl: '',
    relatedKnowledge: ['kv-003', 'kv-005'],
  },
  {
    id: 'kv-008',
    title: 'Forest Proverb of the Warli',
    village: 'Dahanu',
    region: 'Maharashtra',
    elderName: 'Kaku Janu Sutar',
    category: 'Proverbs',
    description:
      '"The tree that shares its shade will never stand alone." Warli elders teach this proverb when mediating land disputes between families. The saying encodes a philosophy of reciprocal care — those who protect community forests will find support in times of drought or illness. Storytellers pair the proverb with a painted motif of interconnected trees whose roots merge underground, a visual lesson children memorize before they can read.',
    audioUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    imageUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af2179?w=600&h=400&fit=crop',
    videoUrl: '',
    relatedKnowledge: ['kv-010', 'kv-012'],
  },
  {
    id: 'kv-009',
    title: 'Sacred Grove Water Conservation',
    village: 'Kodagu',
    region: 'Karnataka',
    elderName: 'Ajji Kaveramma',
    category: 'Environmental Knowledge',
    description:
      'Every Kodava village maintains a devarakadu — sacred grove where cutting trees is forbidden. Grandmothers identify underground spring sources by observing where certain ferns grow thickest. These groves act as natural watersheds, feeding streams through dry months. Elders conduct annual walks with children to count bird species; a decline in hornbill sightings signals ecological stress long before government surveys arrive.',
    audioUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1441974231530-c3167bd88271?w=600&h=400&fit=crop',
    videoUrl:
      'https://sample-videos.com/video321/mp4/240/big_buck_bunny_240p_1mb.mp4',
    relatedKnowledge: ['kv-006', 'kv-012'],
  },
  {
    id: 'kv-010',
    title: 'Moon-Phase Seed Selection',
    village: 'Mandya',
    region: 'Karnataka',
    elderName: 'Thatha Kempa Gowda',
    category: 'Farming Wisdom',
    description:
      'Seeds for ragi are sorted under waning moonlight when sap is believed to retreat into roots, concentrating vitality in grain. Grandfathers float seeds in saltwater — those that sink are planted, floaters are fed to cattle. The practice reduces fungal infection without chemical treatment. Planting songs specify which lunar day suits each crop; violating the calendar is said to anger Bhoomi Devi, the earth goddess who watches over the furrows.',
    audioUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop',
    videoUrl: '',
    relatedKnowledge: ['kv-002', 'kv-006'],
  },
  {
    id: 'kv-011',
    title: 'Fermented Rice Kanji for Summer',
    village: 'Alleppey',
    region: 'Kerala',
    elderName: 'Ammuma Mary Kutty',
    category: 'Traditional Recipes',
    description:
      'Leftover rice is soaked overnight in an earthen pot with a piece of dried tamarind and a curry leaf stem. By morning the water turns cloudy and slightly sour — kanji vellam, prized as a cooling drink and digestive aid during Vishu heat. Grandmothers never stir the pot after sunset; stirring releases heat trapped in the grains. A pinch of roasted cumin is added only when serving guests, a sign of hospitality in backwater villages.',
    audioUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    imageUrl:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=400&fit=crop',
    videoUrl: '',
    relatedKnowledge: ['kv-001', 'kv-004'],
  },
  {
    id: 'kv-012',
    title: 'Myna Bird as Rain Messenger',
    village: 'Shillong',
    region: 'Meghalaya',
    elderName: 'Kong Iba Blah',
    category: 'Environmental Knowledge',
    description:
      "Khasi elders observe common myna flocking patterns to predict landslide risk during heavy rain. When mynas gather on the lowest branches rather than treetops, grandmothers warn families in hillside hamlets to move livestock to safer ground. This behavior correlates with dropping barometric pressure before cloudbursts. The knowledge is shared through a children's rhyme that maps bird calls to weather events across the seven months of the Khasi calendar.",
    audioUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&h=400&fit=crop',
    videoUrl: '',
    relatedKnowledge: ['kv-008', 'kv-009'],
  },
];

let allKnowledge = [];
let activeCategory = 'all';
let lastFocusedElement = null;

document.addEventListener('DOMContentLoaded', async () => {
  allKnowledge = getAllKnowledge();
  renderCategoryFilters();
  renderKnowledgeCards(await getFilteredKnowledge());
  updateStatistics(allKnowledge);
  setupEventListeners();
  
  const contributionForm = document.getElementById('contribution-form');
  if (contributionForm && window.FormAutoSave) {
    new window.FormAutoSave(contributionForm, { id: 'knowledge-vault' });
  }
});

function getAllKnowledge() {
  const contributions = loadContributions();
  const mappedContributions = contributions.map((entry, index) => ({
    id: entry.id || `contrib-${index}`,
    title: entry.title,
    village: entry.village,
    region: entry.region,
    elderName: entry.elderName,
    category: entry.category,
    description: entry.description,
    audioUrl: entry.audioUrl || '',
    imageUrl: entry.imageUrl || '',
    videoUrl: entry.videoUrl || '',
    relatedKnowledge: entry.relatedKnowledge || [],
    isCommunityContribution: true,
  }));
  return [...KNOWLEDGE_SAMPLE, ...mappedContributions];
}

function loadContributions() {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveContribution(entry) {
  const contributions = loadContributions();
  contributions.push({
    ...entry,
    id: `contrib-${Date.now()}`,
    relatedKnowledge: [],
    submittedAt: new Date().toISOString(),
  });
  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(contributions));
}

function renderCategoryFilters() {
  const container = document.getElementById('category-filters');
  if (!container) return;

  const chips = [
    { value: 'all', label: 'All' },
    ...VAULT_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  container.innerHTML = chips
    .map(
      (chip) => `
    <button
      type="button"
      class="vault-filter-chip${chip.value === activeCategory ? ' active' : ''}"
      data-category="${escapeHtml(chip.value)}"
      aria-pressed="${chip.value === activeCategory}"
    >${escapeHtml(chip.label)}</button>`
    )
    .join('');

  container.querySelectorAll('.vault-filter-chip').forEach((btn) => {
    btn.addEventListener('click', async () => {
      activeCategory = btn.dataset.category;
      container.querySelectorAll('.vault-filter-chip').forEach((chip) => {
        const isActive = chip.dataset.category === activeCategory;
        chip.classList.toggle('active', isActive);
        chip.setAttribute('aria-pressed', String(isActive));
      });
      renderKnowledgeCards(await getFilteredKnowledge());
    });
  });
}

function setupEventListeners() {
  const searchInput = document.getElementById('vault-search');
  if (searchInput) {
    searchInput.addEventListener('input', async () => {
      renderKnowledgeCards(await getFilteredKnowledge());
    });
  }
const sortSelect = document.getElementById('vault-sort');

if (sortSelect) {
  sortSelect.addEventListener('change', async () => {
    renderKnowledgeCards(await getFilteredKnowledge());
  });
}
  const closeBtn = document.getElementById('close-knowledge-modal');
  const modal = document.getElementById('knowledge-modal');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'knowledge-modal') closeModal();
    });
  }

  document.addEventListener('keydown', handleModalKeydown);

  const form = document.getElementById('contribution-form');
  if (form) form.addEventListener('submit', handleContributionSubmit);
}

async function getFilteredKnowledge() {
  const searchEl = document.getElementById('vault-search');
  const search = searchEl ? searchEl.value.trim().toLowerCase() : '';

  try {
    const grid = document.getElementById('knowledge-grid');
    if (grid && window.SkeletonEngine) {
      window.SkeletonEngine.show(grid, 'card', 6, false);
    }
    
    // Simulate slight network/worker delay for UX skeleton viewing
    const delay = new Promise(resolve => setTimeout(resolve, 300));
    const [filtered] = await Promise.all([
      window.dataWorker.runJob('filterKnowledgeVault', {
        items: allKnowledge,
        activeCategory,
        search
      }),
      delay
    ]);
    
    if (grid && window.SkeletonEngine) {
      window.SkeletonEngine.hide(grid);
    }
    return filtered;
  } catch (error) {
    console.error('Worker filter error:', error);
    const grid = document.getElementById('knowledge-grid');
    if (grid) grid.style.opacity = '1';
    
    return allKnowledge.filter((entry) => {
      const matchesCategory =
        activeCategory === 'all' || entry.category === activeCategory;

      const matchesSearch =
        !search ||
        (entry.title && entry.title.toLowerCase().includes(search)) ||
        (entry.village && entry.village.toLowerCase().includes(search)) ||
        (entry.region && entry.region.toLowerCase().includes(search)) ||
        (entry.elderName && entry.elderName.toLowerCase().includes(search)) ||
        (entry.category && entry.category.toLowerCase().includes(search)) ||
        (entry.description && entry.description.toLowerCase().includes(search));

      return matchesCategory && matchesSearch;
    });
  }
}
function sortKnowledge(entries) {
  const sortValue = document.getElementById('vault-sort')?.value || 'default';

  switch (sortValue) {
    case 'az':
      return [...entries].sort((a, b) => a.title.localeCompare(b.title));

    case 'za':
      return [...entries].sort((a, b) => b.title.localeCompare(a.title));

    case 'recent':
      // Since there is no timestamp, use reverse insertion order
      return [...entries].reverse();

    default:
      return entries;
  }
}
function updateStatistics(entries) {
  const villages = new Set(entries.map((e) => e.village.toLowerCase()));
  const elders = new Set(entries.map((e) => e.elderName.toLowerCase()));
  const categories = new Set(entries.map((e) => e.category));

  setStatValue('stat-entries', entries.length);
  setStatValue('stat-villages', villages.size);
  setStatValue('stat-elders', elders.size);
  setStatValue('stat-categories', categories.size);
}

function setStatValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderKnowledgeCards(entries) {
  entries = sortKnowledge(entries);
  const grid = document.getElementById('knowledge-grid');
  const resultsCount = document.getElementById('results-count');
  if (!grid) return;

  if (resultsCount) {
    resultsCount.textContent = `${entries.length} knowledge entr${entries.length === 1 ? 'y' : 'ies'} found`;
  }

  if (entries.length === 0) {
    grid.innerHTML = `
      <div class="vault-empty">
        <i class="ti ti-search-off" aria-hidden="true"></i>
        <p>No knowledge entries match your search. Try adjusting filters or contribute a new entry below.</p>
      </div>`;
    return;
  }

  grid.innerHTML = entries
    .map((entry) => buildKnowledgeCard(entry))
    .join('');

  grid.querySelectorAll('.knowledge-card').forEach((card) => {
    card.addEventListener('click', () => openModal(card.dataset.id));
  });
}

function buildKnowledgeCard(entry) {
  const icon = CATEGORY_ICONS[entry.category] || 'ti-book';
  const truncated = truncateText(entry.description, 140);

  return `
    <button
      type="button"
      class="knowledge-card"
      data-id="${escapeHtml(entry.id)}"
      aria-label="View details for ${escapeHtml(entry.title)}"
    >
      <div class="knowledge-card-image">
        ${
          entry.imageUrl
            ? `<img src="${escapeHtml(entry.imageUrl)}" alt="${escapeHtml(entry.title)}" loading="lazy" class="lazy-img" onload="this.classList.add('loaded')" />`
            : `<span class="placeholder-icon"><i class="ti ${icon}" aria-hidden="true"></i></span>`
        }
      </div>
      <div class="knowledge-card-body">
        <h3>${escapeHtml(entry.title)}</h3>
        <div class="knowledge-card-meta">
          <span class="meta-item">
            <i class="ti ti-map-pin" aria-hidden="true"></i>
            ${escapeHtml(entry.village)}
          </span>
          <span class="meta-item">
            <i class="ti ti-world" aria-hidden="true"></i>
            ${escapeHtml(entry.region)}
          </span>
        </div>
        <span class="knowledge-card-category">${escapeHtml(entry.category)}</span>
        <div class="knowledge-card-description markdown-body">${renderMarkdown(truncated, true)}</div>
        <div class="knowledge-card-elder">
          <i class="ti ti-user-heart" aria-hidden="true"></i>
          ${escapeHtml(entry.elderName)}
        </div>
      </div>
    </button>`;
}

function openModal(entryId) {
  const entry = allKnowledge.find((e) => e.id === entryId);
  if (!entry) return;

  lastFocusedElement = document.activeElement;

  const modal = document.getElementById('knowledge-modal');
  const titleEl = document.getElementById('modal-knowledge-title');
  const bodyEl = document.getElementById('modal-knowledge-body');

  if (!modal || !titleEl || !bodyEl) return;

  titleEl.textContent = entry.title;
  bodyEl.innerHTML = buildModalContent(entry);

  const audioPlayer = bodyEl.querySelector('audio');
  if (audioPlayer && typeof window.setupAudioVisualizer === 'function') {
    window.setupAudioVisualizer(audioPlayer);
  }

  const videoPlayer = bodyEl.querySelector('video');
  if (videoPlayer && window.ProgressiveVideoLoader) {
    // Determine if it's an uploaded session ID or external URL
    const srcUrl = entry.videoUrl;
    const isSession = srcUrl && !srcUrl.startsWith('http');
    // We clear the native src since ProgressiveVideoLoader will handle it
    videoPlayer.removeAttribute('src'); 
    videoPlayer.querySelector('source')?.remove();
    
    new window.ProgressiveVideoLoader(videoPlayer, srcUrl, isSession);
  }

  bodyEl.querySelectorAll('[data-related-id]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.relatedId));
  });

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('close-knowledge-modal').focus();
}

function buildModalContent(entry) {
  const relatedItems = (entry.relatedKnowledge || [])
    .map((id) => allKnowledge.find((e) => e.id === id))
    .filter(Boolean);

  return `
    <div class="modal-meta">
      <span><i class="ti ti-map-pin" aria-hidden="true"></i> ${escapeHtml(entry.village)}</span>
      <span><i class="ti ti-world" aria-hidden="true"></i> ${escapeHtml(entry.region)}</span>
      <span><i class="ti ti-user-heart" aria-hidden="true"></i> ${escapeHtml(entry.elderName)}</span>
      <span><i class="ti ti-tag" aria-hidden="true"></i> ${escapeHtml(entry.category)}</span>
    </div>

    <div class="modal-section">
      <h4><i class="ti ti-book" aria-hidden="true"></i> Full Description</h4>
      <div class="markdown-body">${renderMarkdown(entry.description)}</div>
    </div>

    ${
      entry.audioUrl
        ? `
    <div class="modal-section">
      <h4><i class="ti ti-microphone" aria-hidden="true"></i> Audio Recording</h4>
      <div class="modal-media">
        <audio controls preload="none" aria-label="Audio recording for ${escapeHtml(entry.title)}">
          <source src="${escapeHtml(entry.audioUrl)}" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>`
        : ''
    }

    ${
      entry.imageUrl
        ? `
    <div class="modal-section">
      <h4><i class="ti ti-photo" aria-hidden="true"></i> Image</h4>
      <div class="modal-media">
        <img src="${escapeHtml(entry.imageUrl)}" alt="${escapeHtml(entry.title)}" loading="lazy" class="lazy-img" onload="this.classList.add('loaded')" />
      </div>
    </div>`
        : ''
    }

    ${
      entry.videoUrl
        ? `
    <div class="modal-section">
      <h4><i class="ti ti-video" aria-hidden="true"></i> Video</h4>
      <div class="modal-media">
        <video controls preload="metadata" aria-label="Video for ${escapeHtml(entry.title)}">
          <source src="${escapeHtml(entry.videoUrl)}" type="video/mp4" />
          Your browser does not support the video element.
        </video>
      </div>
    </div>`
        : ''
    }

    ${
      relatedItems.length > 0
        ? `
    <div class="modal-section">
      <h4><i class="ti ti-link" aria-hidden="true"></i> Related Knowledge</h4>
      <ul class="related-knowledge-list" aria-label="Related knowledge entries">
        ${relatedItems
          .map(
            (related) => `
          <li>
            <button type="button" data-related-id="${escapeHtml(related.id)}">
              ${escapeHtml(related.title)} — ${escapeHtml(related.category)}
            </button>
          </li>`
          )
          .join('')}
      </ul>
    </div>`
        : ''
    }`;
}

function closeModal() {
  const modal = document.getElementById('knowledge-modal');
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');

  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

function handleModalKeydown(e) {
  const modal = document.getElementById('knowledge-modal');
  if (!modal || !modal.classList.contains('active')) return;

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

async function handleContributionSubmit(e) {
  e.preventDefault();

  const feedback = document.getElementById('contribution-feedback');
  const form = e.target;

  const title = form.title.value.trim();
  const elderName = form.elderName.value.trim();
  const village = form.village.value.trim();
  const region = form.region.value.trim();
  const category = form.category.value;
  const description = form.description.value.trim();
  const audioUrl = form.audioUrl.value.trim();
  const imageUrl = form.imageUrl.value.trim();
  const videoUrl = form.videoUrl.value.trim();

  if (!title || !elderName || !village || !region || !category || !description) {
    setFeedback(feedback, 'Please fill in all required fields.', 'error');
    return;
  }

  saveContribution({
    title,
    elderName,
    village,
    region,
    category,
    description,
    audioUrl,
    imageUrl,
    videoUrl,
  });

  setFeedback(
    feedback,
    'Thank you! Your knowledge contribution has been saved locally.',
    'success'
  );
  form.reset();

  allKnowledge = getAllKnowledge();
  renderKnowledgeCards(await getFilteredKnowledge());
  updateStatistics(allKnowledge);
}

function setFeedback(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.className = `contribution-feedback ${type}`;
}

function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

window.ParamparaKnowledgeVault = {
  getAll: getAllKnowledge,
  sampleData: KNOWLEDGE_SAMPLE,
  categories: VAULT_CATEGORIES,
};
