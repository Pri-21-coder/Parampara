// Client-side controller for Interactive Cultural Artifact Explorer

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const searchInput = document.getElementById('artifact-search');
  const clearSearchBtn = document.getElementById('clear-search');
  const categoryFilter = document.getElementById('category-filter');
  const stateFilter = document.getElementById('state-filter');
  const preservationFilter = document.getElementById('preservation-filter');
  const sortSelect = document.getElementById('sort-select');
  const artifactsGrid = document.getElementById('artifacts-grid');
  const loadingIndicator = document.getElementById('loading-indicator');
  const emptyState = document.getElementById('empty-state');
  const resetFiltersBtn = document.getElementById('reset-filters-btn');
  
  // Pagination
  const paginationControls = document.getElementById('pagination-controls');
  const prevPageBtn = document.getElementById('prev-page-btn');
  const nextPageBtn = document.getElementById('next-page-btn');
  const pageIndicator = document.getElementById('page-indicator');

  // Detail Modal
  const artifactModal = document.getElementById('artifact-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const askCuratorBtn = document.getElementById('ask-curator-btn');
  
  // Modal Image Gallery
  const mainImage = document.getElementById('modal-main-image');
  const mainImageContainer = document.getElementById('main-image-viewport');
  const lensMagnifier = document.getElementById('lens-magnifier');
  const galleryPrev = document.getElementById('gallery-prev');
  const galleryNext = document.getElementById('gallery-next');
  const galleryFullscreen = document.getElementById('gallery-fullscreen');
  const galleryThumbnails = document.getElementById('gallery-thumbnails');
  
  // Fullscreen Viewer
  const fullscreenViewer = document.getElementById('fullscreen-viewer');
  const fullscreenImage = document.getElementById('fullscreen-image');
  const closeFullscreenBtn = document.getElementById('close-fullscreen-btn');

  // Back to Top
  const backToTopBtn = document.getElementById('backToTopBtn');

  // --- State Variables ---
  let currentPage = 1;
  const itemsLimit = 9; // Grid limit
  let activeArtifact = null;
  let activeImageIndex = 0;
  let searchDebounceTimeout = null;

  // --- Initialize Page ---
  fetchArtifacts();
  setupEventListeners();

  // --- API Fetching Logic ---
  async function fetchArtifacts() {
    showLoading(true);
    emptyState.style.display = 'none';

    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsLimit,
        sort: sortSelect.value
      });

      const q = searchInput.value.trim();
      if (q) params.append('q', q);

      if (categoryFilter.value !== 'all') params.append('category', categoryFilter.value);
      if (stateFilter.value !== 'all') params.append('state', stateFilter.value);
      if (preservationFilter.value !== 'all') params.append('preservationStatus', preservationFilter.value);

      const response = await fetch(`/api/artifacts?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch artifacts');

      const result = await response.json();
      renderArtifacts(result.data);
      updatePagination(result.meta);
    } catch (error) {
      console.error('[Artifact Explorer] Fetch Error:', error);
      renderArtifacts([]);
    } finally {
      showLoading(false);
    }
  }

  // Render cards grid
  function renderArtifacts(artifacts) {
    artifactsGrid.innerHTML = '';
    
    if (!artifacts || artifacts.length === 0) {
      emptyState.style.display = 'block';
      paginationControls.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';

    artifacts.forEach(art => {
      const coverImage = art.imageGallery && art.imageGallery.length > 0
        ? art.imageGallery[0]
        : 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=800&q=80';

      const badgeClass = getPreservationBadgeClass(art.preservationStatus);
      const shortDesc = art.description.length > 120 ? art.description.slice(0, 110) + '...' : art.description;

      const card = document.createElement('div');
      card.className = 'artifact-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `View details for ${art.name}`);
      card.innerHTML = `
        <div class="artifact-card-image">
          <span class="card-badge ${badgeClass}">${art.preservationStatus.split(' ')[0]}</span>
          <img src="${coverImage}" alt="${art.name}" loading="lazy" />
        </div>
        <div class="artifact-card-content">
          <span class="card-category">${art.category}</span>
          <h3>${art.name}</h3>
          <div class="card-location">
            <i class="ti ti-map-pin"></i>
            <span>${art.village}, ${art.state}</span>
          </div>
          <p class="card-desc">${shortDesc}</p>
          <div class="card-footer">
            <span class="card-community">${art.community}</span>
            <span class="card-views"><i class="ti ti-eye"></i> ${art.views || 0} views</span>
          </div>
        </div>
      `;

      // Click and keypress handlers to open details
      card.addEventListener('click', () => openArtifactDetails(art.id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openArtifactDetails(art.id);
        }
      });

      artifactsGrid.appendChild(card);
    });
  }

  // Determine badge CSS class
  function getPreservationBadgeClass(status) {
    const s = status.toLowerCase();
    if (s.includes('preserved')) return 'status-preserved';
    if (s.includes('threat')) return 'status-threat';
    return 'status-endangered';
  }

  // Page Load indicators
  function showLoading(show) {
    loadingIndicator.style.display = show ? 'flex' : 'none';
    if (show) {
      artifactsGrid.style.opacity = '0.5';
    } else {
      artifactsGrid.style.opacity = '1';
    }
  }

  // Update Pagination labels
  function updatePagination(meta) {
    if (!meta || meta.totalPages <= 1) {
      paginationControls.style.display = 'none';
      return;
    }

    paginationControls.style.display = 'flex';
    pageIndicator.textContent = `Page ${meta.currentPage} of ${meta.totalPages}`;
    prevPageBtn.disabled = meta.currentPage <= 1;
    nextPageBtn.disabled = meta.currentPage >= meta.totalPages;
  }

  // --- Detail Modal Functions ---
  async function openArtifactDetails(id) {
    try {
      const response = await fetch(`/api/artifacts/${id}`);
      if (!response.ok) throw new Error('Artifact details fetch failed');

      const result = await response.json();
      activeArtifact = result.data;

      // Populate details
      populateModal(activeArtifact);

      // Open Modal
      artifactModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Default to overview tab
      switchTab('overview');

      // Accessibility focus trapping
      trapFocus(artifactModal);
      
      // Refresh explorer list views dynamically (background sync)
      const cardViews = document.querySelector(`[aria-label="View details for ${activeArtifact.name}"] .card-views`);
      if (cardViews) {
        cardViews.innerHTML = `<i class="ti ti-eye"></i> ${activeArtifact.views} views`;
      }
    } catch (error) {
      console.error('[Artifact Explorer] Modal Load Error:', error);
      alert('Could not retrieve artifact details. Please try again.');
    }
  }

  function populateModal(art) {
    // Basic Spec headers
    document.getElementById('modal-title').textContent = art.name;
    document.getElementById('modal-category').textContent = art.category;
    
    // Set status classes
    const statusEl = document.getElementById('modal-preservation');
    statusEl.textContent = art.preservationStatus;
    statusEl.className = 'spec-tag status ' + getPreservationBadgeClass(art.preservationStatus).replace('status-', '');

    document.getElementById('modal-community').textContent = art.community;
    document.getElementById('modal-location').textContent = `${art.village}, ${art.district}, ${art.state}`;
    
    // Overview Specs
    document.getElementById('modal-dimensions').textContent = art.dimensions || 'N/A';
    document.getElementById('modal-weight').textContent = art.weight || 'N/A';
    document.getElementById('modal-materials').textContent = art.materials ? art.materials.join(', ') : 'N/A';
    document.getElementById('modal-condition').textContent = art.condition || 'N/A';
    document.getElementById('modal-description').textContent = art.description;

    // References List
    const refsEl = document.getElementById('modal-references');
    refsEl.innerHTML = '';
    if (art.references && art.references.length > 0) {
      art.references.forEach(ref => {
        const li = document.createElement('li');
        li.textContent = ref;
        refsEl.appendChild(li);
      });
    } else {
      refsEl.innerHTML = '<li>No references listed</li>';
    }

    // Historical Context
    document.getElementById('modal-period').textContent = art.historicalPeriod || 'N/A';
    document.getElementById('modal-origin').textContent = art.origin || 'N/A';
    document.getElementById('modal-craft').textContent = art.associatedCrafts ? art.associatedCrafts.join(', ') : 'N/A';

    // Processes Video Embed
    const videoBlock = document.getElementById('video-block');
    const iframe = document.getElementById('modal-video');
    if (art.video && art.video.trim() !== '') {
      iframe.src = art.video;
      videoBlock.style.display = 'block';
    } else {
      iframe.src = '';
      videoBlock.style.display = 'none';
    }

    // Cultural Motivations
    document.getElementById('modal-significance').textContent = art.culturalSignificance || 'N/A';
    document.getElementById('modal-symbolism').textContent = art.symbolicMeaning || 'N/A';
    document.getElementById('modal-usage').textContent = art.traditionalUsage || 'N/A';
    document.getElementById('modal-festivals').textContent = art.associatedFestivals ? art.associatedFestivals.join(', ') : 'N/A';
    document.getElementById('modal-stories').textContent = art.associatedStories ? art.associatedStories.join(', ') : 'N/A';

    // Museum Context & Relationships
    document.getElementById('modal-notes').textContent = art.museumNotes || 'N/A';
    
    const relationsList = document.getElementById('modal-relation-links');
    relationsList.innerHTML = '';

    // Add Related Villages
    if (art.relatedVillages) {
      art.relatedVillages.forEach(v => {
        relationsList.innerHTML += `<a href="map.html" class="relation-link"><i class="ti ti-map-pin"></i> ${v}</a>`;
      });
    }
    // Add Related Paths
    if (art.relatedHeritagePaths) {
      art.relatedHeritagePaths.forEach(pathId => {
        relationsList.innerHTML += `<a href="paths.html" class="relation-link"><i class="ti ti-route"></i> Path Details</a>`;
      });
    }
    // Add Related Natural Sites
    if (art.relatedNaturalSites) {
      art.relatedNaturalSites.forEach(site => {
        relationsList.innerHTML += `<a href="nature.html" class="relation-link"><i class="ti ti-leaf"></i> Natural Site</a>`;
      });
    }
    // Add Related Crafts
    if (art.associatedCrafts) {
      art.associatedCrafts.forEach(c => {
        relationsList.innerHTML += `<a href="gallery.html" class="relation-link"><i class="ti ti-photo"></i> ${c} (Gallery)</a>`;
      });
    }

    if (relationsList.innerHTML === '') {
      relationsList.innerHTML = '<span style="font-size:0.9rem; opacity:0.7;">No connected contents found</span>';
    }

    // Initialize Image Gallery Array
    activeImageIndex = 0;
    setupImageGallery(art.imageGallery);
  }

  function setupImageGallery(images) {
    if (!images || images.length === 0) {
      mainImage.src = 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=800&q=80';
      galleryThumbnails.innerHTML = '';
      galleryPrev.style.display = 'none';
      galleryNext.style.display = 'none';
      galleryFullscreen.style.display = 'none';
      return;
    }

    galleryPrev.style.display = images.length > 1 ? 'flex' : 'none';
    galleryNext.style.display = images.length > 1 ? 'flex' : 'none';
    galleryFullscreen.style.display = 'block';

    setGalleryImage(0, images);

    // Build thumbnails
    galleryThumbnails.innerHTML = '';
    images.forEach((imgUrl, idx) => {
      const thumb = document.createElement('div');
      thumb.className = `thumb ${idx === 0 ? 'active' : ''}`;
      thumb.setAttribute('tabindex', '0');
      thumb.setAttribute('aria-label', `View image ${idx + 1}`);
      thumb.innerHTML = `<img src="${imgUrl}" alt="Thumbnail View" />`;
      
      const selectThumb = () => {
        setGalleryImage(idx, images);
      };
      
      thumb.addEventListener('click', selectThumb);
      thumb.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectThumb();
        }
      });

      galleryThumbnails.appendChild(thumb);
    });
  }

  function setGalleryImage(idx, images) {
    activeImageIndex = idx;
    mainImage.src = images[idx];
    mainImage.alt = `${activeArtifact.name} View ${idx + 1}`;

    // Set Magnifier Background
    lensMagnifier.style.backgroundImage = `url('${images[idx]}')`;

    // Highlight thumbnail
    const thumbs = galleryThumbnails.querySelectorAll('.thumb');
    thumbs.forEach((t, i) => {
      t.classList.toggle('active', i === idx);
    });
  }

  function closeModal() {
    artifactModal.style.display = 'none';
    document.body.style.overflow = '';
    const iframe = document.getElementById('modal-video');
    iframe.src = ''; // stop video
    activeArtifact = null;
  }

  // --- Image Zoom / Lens Magnifier ---
  mainImageContainer.addEventListener('mousemove', (e) => {
    if (!activeArtifact || !mainImage.complete) return;

    // Show lens
    lensMagnifier.style.display = 'block';

    const rect = mainImage.getBoundingClientRect();
    const containerRect = mainImageContainer.getBoundingClientRect();

    // Mouse coordinates relative to image rect
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Check bounds
    if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
      lensMagnifier.style.display = 'none';
      return;
    }

    // Lens position centered relative to container viewport
    const lensX = e.clientX - containerRect.left;
    const lensY = e.clientY - containerRect.top;

    lensMagnifier.style.left = `${lensX}px`;
    lensMagnifier.style.top = `${lensY}px`;

    // Lens background offset equations (3x zoom magnification)
    const zoomRatio = 3;
    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;

    lensMagnifier.style.backgroundSize = `${rect.width * zoomRatio}px ${rect.height * zoomRatio}px`;
    lensMagnifier.style.backgroundPosition = `${bgX}% ${bgY}%`;
  });

  mainImageContainer.addEventListener('mouseleave', () => {
    lensMagnifier.style.display = 'none';
  });

  // --- Fullscreen Viewer handlers ---
  function openFullscreen() {
    if (!activeArtifact) return;
    fullscreenImage.src = mainImage.src;
    fullscreenImage.alt = mainImage.alt;
    fullscreenViewer.style.display = 'flex';
  }

  function closeFullscreen() {
    fullscreenViewer.style.display = 'none';
  }

  // --- Tab Switcher Logic ---
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  function switchTab(tabId) {
    tabButtons.forEach(btn => {
      const btnTarget = btn.getAttribute('aria-controls');
      btn.classList.toggle('active', btnTarget === `tab-${tabId}`);
      btn.setAttribute('aria-selected', btnTarget === `tab-${tabId}` ? 'true' : 'false');
    });

    tabPanes.forEach(pane => {
      pane.style.display = pane.id === `tab-${tabId}` ? 'flex' : 'none';
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabId = e.target.getAttribute('aria-controls').replace('tab-', '');
      switchTab(tabId);
    });
  });

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Search bindings
    searchInput.addEventListener('input', () => {
      clearSearchBtn.style.display = searchInput.value.length > 0 ? 'block' : 'none';
      currentPage = 1;
      
      // Debounce API calls (300ms)
      clearTimeout(searchDebounceTimeout);
      searchDebounceTimeout = setTimeout(fetchArtifacts, 300);
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      currentPage = 1;
      fetchArtifacts();
    });

    // Filters bindings
    categoryFilter.addEventListener('change', () => { currentPage = 1; fetchArtifacts(); });
    stateFilter.addEventListener('change', () => { currentPage = 1; fetchArtifacts(); });
    preservationFilter.addEventListener('change', () => { currentPage = 1; fetchArtifacts(); });
    sortSelect.addEventListener('change', () => { currentPage = 1; fetchArtifacts(); });

    resetFiltersBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      categoryFilter.value = 'all';
      stateFilter.value = 'all';
      preservationFilter.value = 'all';
      sortSelect.value = 'name';
      currentPage = 1;
      fetchArtifacts();
    });

    // Pagination bindings
    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        fetchArtifacts();
        window.scrollTo({ top: searchInput.offsetTop - 50, behavior: 'smooth' });
      }
    });

    nextPageBtn.addEventListener('click', () => {
      currentPage++;
      fetchArtifacts();
      window.scrollTo({ top: searchInput.offsetTop - 50, behavior: 'smooth' });
    });

    // Modal Close
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
      if (e.target === artifactModal) closeModal();
      if (e.target === fullscreenViewer) closeFullscreen();
    });

    // Esc closes modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (fullscreenViewer.style.display === 'flex') {
          closeFullscreen();
        } else if (artifactModal.style.display === 'flex') {
          closeModal();
        }
      }
    });

    // Carousel arrows
    galleryPrev.addEventListener('click', () => {
      if (!activeArtifact || !activeArtifact.imageGallery) return;
      let prevIdx = activeImageIndex - 1;
      if (prevIdx < 0) prevIdx = activeArtifact.imageGallery.length - 1;
      setGalleryImage(prevIdx, activeArtifact.imageGallery);
    });

    galleryNext.addEventListener('click', () => {
      if (!activeArtifact || !activeArtifact.imageGallery) return;
      let nextIdx = activeImageIndex + 1;
      if (nextIdx >= activeArtifact.imageGallery.length) nextIdx = 0;
      setGalleryImage(nextIdx, activeArtifact.imageGallery);
    });

    // Zoom trigger
    galleryFullscreen.addEventListener('click', openFullscreen);
    mainImage.addEventListener('dblclick', openFullscreen);
    closeFullscreenBtn.addEventListener('click', closeFullscreen);

    // AI Curator Redirect
    askCuratorBtn.addEventListener('click', () => {
      if (!activeArtifact) return;
      const question = encodeURIComponent(`What is the ${activeArtifact.name}?`);
      window.location.href = `chat.html?ask=${question}`;
    });

    // Back to top scroll handler
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Accessible Focus Trap Helper ---
  function trapFocus(modalElement) {
    const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    const focusableElements = Array.from(modalElement.querySelectorAll(focusableElementsString)).filter(el => el.offsetWidth > 0 || el.offsetHeight > 0);
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    modalElement.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    });
  }
});
