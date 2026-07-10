// Map Page JavaScript

let map;
let markers = [];
let heatmapLayer = null;
let ambientSoundEnabled = true;
let currentSound = null;
let heatmapMarkers = [];
let draw = null;
let culturalMarkers = []; // Track cultural item markers to allow clearing
let currentLanguage = localStorage.getItem('language') || 'en';

// Flyover state
let flyoverActive = false;
let flyoverPaused = false;
let flyoverCoordinates = [];
let flyoverIndex = 0;
let flyoverTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
  const selector = document.getElementById('language-selector');
  selector.value = currentLanguage;

  // selector.addEventListener("change", (e) => {
  //     currentLanguage = e.target.value;
  //     localStorage.setItem("language", currentLanguage);

  //     // Re-apply language labels on existing style
  //     setMapLanguage(currentLanguage);
  //     addVillageMarkers(); // re-render markers with new language
  //     translatePage();
  // });
  selector.addEventListener('change', (e) => {
    currentLanguage = e.target.value;

    localStorage.setItem('language', currentLanguage);

    if (map && map.isStyleLoaded()) {
      setMapLanguage(currentLanguage);
    }

    if (map) {
      addVillageMarkers();
    }

    translatePage();
  });

  window.mapTimeMachine = new TimeMachineEngine({
    containerId: 'map-time-machine-container',
    eras: ['All', '1950', '1980', '2000', '2025']
  });

  window.mapActiveEra = 'All';
  window.mapActiveTimelineItem = null;

  window.addEventListener('parampara:timemachine:change', (e) => {
    const selectedEra = window.mapTimeMachine.getCurrentEra();
    if (window.mapActiveEra !== selectedEra) {
      window.mapActiveEra = selectedEra;
      // Re-load cultural items based on the new era
      loadCulturalItems();
    }
  });

  // Initialize Historical Timeline
  window.historicalTimeline = new HistoricalTimelineComponent({
    containerId: 'historical-timeline-mount'
  });

  window.addEventListener('parampara:timeline:select', (e) => {
    const { eventId, eventData } = e.detail;
    if (eventId && eventData) {
      window.mapActiveTimelineItem = eventData.item;
    } else {
      window.mapActiveTimelineItem = null;
    }
    loadCulturalItems();
  });

  initializeMap();
  setupEventListeners();
  translatePage();
});

const sampleVillages = [
  {
    id: '6',
    name: {
      en: 'Sundarbans Village',
      hi: 'सुंदरबन गांव',
      mr: 'सुंदरबन गाव',
    },
    coordinates: [21.9497, 88.8156],
    traditions: {
      en: [
        'Folk tales about tigers',
        'Traditional fishing methods',
        'Honey collection rituals',
      ],
      hi: [
        'बाघों की लोककथाएँ',
        'पारंपरिक मछली पकड़ने की विधियाँ',
        'शहद संग्रह अनुष्ठान',
      ],
      mr: ['वाघांच्या लोककथा', 'पारंपरिक मासेमारी पद्धती', 'मध संकलन विधी'],
    },
    festivals: {
      en: ['Bonbibi Puja', 'Honey Festival'],
      hi: ['बोनबिबी पूजा', 'हनी फेस्टिवल'],
      mr: ['बोनबिबी पूजा', 'हनी फेस्टिवल'],
    },
    crafts: {
      en: ['Coconut shell crafts', 'Traditional boat making'],
      hi: ['नारियल शिल्प', 'पारंपरिक नाव निर्माण'],
      mr: ['नारळ हस्तकला', 'पारंपरिक होडी निर्मिती'],
    },
    description: {
      en: 'A village in the Sundarbans known for its unique relationship with nature and tigers.',
      hi: 'सुंदरबन का एक गांव जो प्रकृति और बाघों के साथ अपने अनोखे संबंध के लिए प्रसिद्ध है।',
      mr: 'निसर्ग आणि वाघांशी असलेल्या अनोख्या नात्यासाठी प्रसिद्ध गाव.',
    },
    ambientSound: 'birds',
  },

  {
    id: '1',
    name: {
      en: 'Kantha Village, Bengal',
      hi: 'कांथा गांव, बंगाल',
      mr: 'कांथा गाव, बंगाल',
    },
    coordinates: [22.5726, 88.3639],
    traditions: {
      en: ['Kantha embroidery', 'Oral storytelling', 'Traditional songs'],
      hi: ['कांथा कढ़ाई', 'मौखिक कथाएँ', 'पारंपरिक गीत'],
      mr: ['कांथा भरतकाम', 'लोककथा', 'पारंपरिक गीते'],
    },
    festivals: {
      en: ['Durga Puja', 'Kali Puja'],
      hi: ['दुर्गा पूजा', 'काली पूजा'],
      mr: ['दुर्गा पूजा', 'काली पूजा'],
    },
    crafts: {
      en: ['Kantha stitch work', 'Traditional sarees'],
      hi: ['कांथा सिलाई', 'पारंपरिक साड़ियाँ'],
      mr: ['कांथा शिवणकाम', 'पारंपरिक साड्या'],
    },
    description: {
      en: 'Famous for Kantha embroidery, where old saris are layered and stitched.',
      hi: 'कांथा कढ़ाई के लिए प्रसिद्ध, जिसमें पुरानी साड़ियों को जोड़कर सुंदर डिज़ाइन बनाए जाते हैं।',
      mr: 'कांथा भरतकामासाठी प्रसिद्ध.',
    },
    ambientSound: 'flute',
  },

  {
    id: '3',
    name: {
      en: 'Madhubani Village, Bihar',
      hi: 'मधुबनी गांव, बिहार',
      mr: 'मधुबनी गाव, बिहार',
    },
    coordinates: [26.3537, 86.0719],
    traditions: {
      en: ['Madhubani painting', 'Mithila art', 'Folk songs'],
      hi: ['मधुबनी चित्रकला', 'मिथिला कला', 'लोक गीत'],
      mr: ['मधुबनी चित्रकला', 'मिथिला कला', 'लोकगीते'],
    },
    festivals: {
      en: ['Chhath Puja', 'Teej'],
      hi: ['छठ पूजा', 'तीज'],
      mr: ['छठ पूजा', 'तीज'],
    },
    crafts: {
      en: ['Madhubani paintings', 'Traditional pottery'],
      hi: ['मधुबनी चित्रकारी', 'पारंपरिक मिट्टी के बर्तन'],
      mr: ['मधुबनी चित्रे', 'पारंपरिक मातीची भांडी'],
    },
    description: {
      en: 'Home to the world-famous Madhubani paintings.',
      hi: 'विश्व प्रसिद्ध मधुबनी चित्रकला का केंद्र।',
      mr: 'जगप्रसिद्ध मधुबनी चित्रकलेचे केंद्र.',
    },
    ambientSound: 'flute',
  },

  {
    name: {
      en: 'Dokra Village, Chhattisgarh',
      hi: 'डोकरा गांव, छत्तीसगढ़',
      mr: 'डोकरा गाव, छत्तीसगड',
    },
    coordinates: [21.2787, 81.8661],
    traditions: {
      en: ['Dokra metal craft', 'Tribal dances', 'Harvest songs'],
      hi: ['डोकरा धातु कला', 'जनजातीय नृत्य', 'फसल गीत'],
      mr: ['डोकरा धातुकाम', 'आदिवासी नृत्य', 'पीक गीते'],
    },
    festivals: {
      en: ['Bastar Dussehra', 'Harvest Festival'],
      hi: ['बस्तर दशहरा', 'फसल उत्सव'],
      mr: ['बस्तर दसरा', 'पीक उत्सव'],
    },
    crafts: {
      en: ['Dokra metalwork', 'Bamboo crafts'],
      hi: ['डोकरा धातुकला', 'बांस शिल्प'],
      mr: ['डोकरा धातुकाम', 'बांबू हस्तकला'],
    },
    description: {
      en: 'Known for Dokra metal casting.',
      hi: 'डोकरा धातु ढलाई कला के लिए प्रसिद्ध।',
      mr: 'डोकरा धातुकामासाठी प्रसिद्ध.',
    },
    ambientSound: 'birds',
  },
];

window.sampleVillages = sampleVillages;

function getTranslation() {
  const activeTranslations = window.translations || {};
  return activeTranslations[currentLanguage] || {};
}

function translatePage() {
  const t = getTranslation();

  const title = document.querySelector('.map-header h2');
  const subtitle = document.querySelector('.map-header p');
  const villageName = document.getElementById('village-name');

  if (title && t.mapTitle) title.textContent = t.mapTitle;
  if (subtitle && t.mapDescription) subtitle.textContent = t.mapDescription;
  if (villageName && t.selectVillage) villageName.textContent = t.selectVillage;
  
  const infoContent = document.getElementById('info-content');
  if (infoContent && t.clickVillage) {
    infoContent.innerHTML = `<p>${t.clickVillage}</p>`;
  }

  const heatmapBtn = document.getElementById('toggle-heatmap');
  if (heatmapBtn) {
    if (heatmapLayer) {
      heatmapBtn.textContent = t.hideHeatmap || 'Hide Heatmap';
    } else {
      heatmapBtn.textContent = t.toggleHeatmap || 'Toggle Heatmap';
    }
  }

  updateMapUnavailableNotice();
}

function showMapUnavailableNotice(message) {
  const mapEl = document.getElementById('map');
  mapEl.innerHTML = '';
  mapEl.classList.add('map-unavailable');

  const notice = document.createElement('div');
  notice.className = 'map-unavailable-notice';
  notice.id = 'map-unavailable-notice';

  const t = getTranslation();
  notice.innerHTML = `
        <p class="map-unavailable-icon">🗺️</p>
        <p class="map-unavailable-message">${message || t.mapConfigMessage}</p>
        <p class="map-unavailable-hint">${t.mapConfigHint}</p>
    `;

  mapEl.appendChild(notice);
}

function updateMapUnavailableNotice() {
  const notice = document.getElementById('map-unavailable-notice');
  if (!notice) {
    return;
  }

  const t = getTranslation();
  notice.querySelector('.map-unavailable-message').textContent =
    t.mapConfigMessage;
  notice.querySelector('.map-unavailable-hint').textContent = t.mapConfigHint;
}

async function initializeMap() {
  try {
    const response = await fetch('/api/map-style?t=' + Date.now());
    const data = await response.json();

    if (!response.ok || data.configured === false) {
      showMapUnavailableNotice(data.message);
      return;
    }

    map = new maplibregl.Map({
      container: 'map',
      style: data,
      center: [78.9629, 22.5937],
      zoom: 5,
    });
    window.map = map;

    map.addControl(new maplibregl.NavigationControl());

    map.on('load', async () => {
      setMapLanguage(currentLanguage);
      addVillageMarkers();
      
      // Update clusters and items on zoom and move
      map.on('zoomend', () => {
          addVillageMarkers();
          loadCulturalItems();
      });
      map.on('moveend', () => {
          addVillageMarkers();
          loadCulturalItems();
      });
      
      await loadCulturalItems();
      checkFlyover();
      initRouting();
    });

    map.on('error', (event) => {
      console.error('Map error:', event.error);
    });
  } catch (error) {
    console.error('Error initializing map:', error);
    showMapUnavailableNotice(getTranslation().mapConfigMessage);
  }
}

function setMapLanguage(lang) {
  if (!map) {
    return;
  }

  const style = map.getStyle();

  if (!style || !style.layers) {
    console.warn('Style not loaded yet');
    return;
  }

  style.layers.forEach((layer) => {
    if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
      if (lang === 'hi') {
        map.setLayoutProperty(layer.id, 'text-field', [
          'coalesce',
          ['get', 'name:hi'],
          ['get', 'name'],
        ]);
      } else if (lang === 'mr') {
        map.setLayoutProperty(layer.id, 'text-field', [
          'coalesce',
          ['get', 'name:mr'],
          ['get', 'name:hi'],
          ['get', 'name'],
        ]);
      } else {
        map.setLayoutProperty(layer.id, 'text-field', ['get', 'name']);
      }
    }
  });
}

function addVillageMarker(village) {
  const el = document.createElement('div');
  el.className = 'marker-container';

  const dot = document.createElement('div');
  dot.className = 'marker-dot';
  el.appendChild(dot);

  const name = village.name[currentLanguage] || village.name.en || village.name;
  const description = village.description[currentLanguage] || village.description.en || '';
  
  // Get traditions, crafts, and festivals lists for popup details
  const traditionsList = village.traditions && village.traditions[currentLanguage] 
    ? village.traditions[currentLanguage] 
    : (village.traditions && village.traditions.en ? village.traditions.en : []);
    
  const craftsList = village.crafts && village.crafts[currentLanguage] 
    ? village.crafts[currentLanguage] 
    : (village.crafts && village.crafts.en ? village.crafts.en : []);

  const festivalsList = village.festivals && village.festivals[currentLanguage] 
    ? village.festivals[currentLanguage] 
    : (village.festivals && village.festivals.en ? village.festivals.en : []);

  let detailsHtml = '';
  if (traditionsList.length > 0) {
    detailsHtml += `
      <div class="popup-detail-section popup-detail-tradition">
        <span class="detail-label">🎭 Traditions:</span>
        <span class="detail-values">${traditionsList.slice(0, 2).join(', ')}</span>
      </div>
    `;
  }
  if (craftsList.length > 0) {
    detailsHtml += `
      <div class="popup-detail-section popup-detail-craft">
        <span class="detail-label">🏺 Crafts:</span>
        <span class="detail-values">${craftsList.slice(0, 2).join(', ')}</span>
      </div>
    `;
  }
  if (festivalsList.length > 0) {
    detailsHtml += `
      <div class="popup-detail-section popup-detail-festival">
        <span class="detail-label">🎉 Festivals:</span>
        <span class="detail-values">${festivalsList.slice(0, 2).join(', ')}</span>
      </div>
    `;
  }

  const popupContent = `
    <div class="custom-map-popup">
      <div class="popup-header">
        <span class="popup-header-icon">🏛️</span>
        <h3>${name}</h3>
      </div>
      <p class="popup-description">${description}</p>
      <div class="popup-details-container">
        ${detailsHtml}
      </div>
    </div>
  `;

  const popup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: true,
    offset: 25,
  }).setHTML(popupContent);

  // Hook into Maplibre's native popup lifecycle events to avoid click listener collision
  popup.on('open', () => {
    // Clear other active markers
    document.querySelectorAll('.marker-container').forEach(item => item.classList.remove('active-marker'));
    // Set this marker active
    el.classList.add('active-marker');
    // Open sidebar pane
    showVillageInfo(village);
  });

  popup.on('close', () => {
    el.classList.remove('active-marker');
  });

  const marker = new maplibregl.Marker({ element: el })
    .setLngLat([village.coordinates[1], village.coordinates[0]])
    .setPopup(popup)
    .addTo(map);

  markers.push({
    id: village.id,
    marker,
    element: el,
  });
}

// Update marker colors based on scores
async function updateMarkerColors() {
  if (!map) return;
  const checkbox = document.getElementById('toggle-heritage-health');
  const showHealth = checkbox && checkbox.checked;

  // If not showing health view, reset to default colors
  if (!showHealth) {
    markers.forEach((m) => {
      const dot = m.element.querySelector('.marker-dot') || m.element;
      dot.style.background = '#f4a261';
    });
    return;
  }

  // Fetch scores for all villages
  const scorePromises = markers.map((m) =>
    fetch(`/api/heritage-score/village/${m.id}`)
      .then((res) => res.json())
      .catch(() => ({ score: 0, category: 'Endangered' }))
  );
  const results = await Promise.all(scorePromises);

  results.forEach((result, idx) => {
    const el = markers[idx].element;
    const dot = el.querySelector('.marker-dot') || el;
    let color = '#ff4d4d'; // Endangered (red)
    if (result.category === 'Thriving') color = '#4caf50'; // green
    else if (result.category === 'Stable') color = '#2196f3'; // blue
    else if (result.category === 'Vulnerable') color = '#ff9800'; // orange
    dot.style.background = color;
    // Optionally set tooltip
    el.title = `${result.category} (${result.score}/100)`;
  });
}

// Listen for toggle change
const heritageToggle = document.getElementById('toggle-heritage-health');
if (heritageToggle) {
  heritageToggle.addEventListener('change', updateMarkerColors);
}


function addVillageMarkers(filteredVillages = sampleVillages) {
  if (!map) return;

  markers.forEach((m) => {
    if (m.marker) m.marker.remove();
    else m.remove();
  });
  markers = [];

  if (!window.clusterEngine) {
    window.clusterEngine = new window.ClusterEngine({ radius: 50 });
  }

  window.clusterEngine.load(filteredVillages);
  
  const bounds = map.getBounds();
  const zoom = map.getZoom();
  
  const clusters = window.clusterEngine.getClusters(bounds, zoom);
  
  clusters.forEach((cluster) => {
    if (cluster.isCluster) {
      addClusterMarker(cluster);
    } else {
      addVillageMarker(cluster.data);
    }
  });
}

function addClusterMarker(cluster) {
  const el = document.createElement('div');
  el.className = 'cluster-marker';
  el.style.width = '35px';
  el.style.height = '35px';
  el.style.borderRadius = '50%';
  el.style.background = '#e76f51';
  el.style.color = 'white';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.fontWeight = 'bold';
  el.style.cursor = 'pointer';
  el.style.border = '2px solid white';
  el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
  el.innerText = cluster.count;
  el.style.pointerEvents = 'auto';
  
  const marker = new maplibregl.Marker({ element: el })
    .setLngLat([cluster.coordinates[1], cluster.coordinates[0]])
    .addTo(map);
    
  marker.getElement().addEventListener('click', (e) => {
    e.stopPropagation();
    map.fitBounds([
      [cluster.bounds.minLng, cluster.bounds.minLat],
      [cluster.bounds.maxLng, cluster.bounds.maxLat]
    ], { padding: 50 });
  });
  
  markers.push({
    isCluster: true,
    marker,
    element: el
  });
}

/**
 * Populates and reveals the sidebar panel containing cultural information 
 * for a selected village. Renders Markdown descriptions, list of traditions, 
 * local festivals, and artisan craft details.
 * 
 * @param {Object} village - The village data object to display.
 */
function showVillageInfo(village) {
  const t = getTranslation();
  const infoPanel = document.getElementById('village-info');
  const villageName = document.getElementById('village-name');
  const infoContent = document.getElementById('info-content');

  if (!infoPanel || !villageName || !infoContent) return;

  const currentName = village.name[currentLanguage] || village.name.en || '';
  const currentDesc = village.description[currentLanguage] || village.description.en || '';
  
  const traditionsList = village.traditions[currentLanguage] || village.traditions.en || [];
  const festivalsList = village.festivals[currentLanguage] || village.festivals.en || [];
  const craftsList = village.crafts[currentLanguage] || village.crafts.en || [];

  villageName.textContent = currentName;

  infoContent.innerHTML = `
    <div class="markdown-body">
      <strong>${t.description}:</strong>
      ${renderMarkdown(currentDesc)}
    </div>

    <div class="village-details">
      <div class="detail-item">
        <h4>🎭 ${t.traditions}</h4>
        <p>${traditionsList.join(', ')}</p>
      </div>

      <div class="detail-item">
        <h4>🎉 ${t.festivals}</h4>
        <p>${festivalsList.join(', ')}</p>
      </div>

      <div class="detail-item">
        <h4>🎨 ${t.crafts}</h4>
        <p>${craftsList.join(', ')}</p>
      </div>
    </div>

    <div style="margin-top:1.5rem;">
      <a href="trails.html" class="btn btn-primary">
        ${t.planVisit}
      </a>
    </div>
  `;

  infoPanel.classList.add('active');
}

function playAmbientSound(type) {
  if (!ambientSoundEnabled) return;
  console.log(`Playing ambient sound: ${type}`);
}

/**
 * Registers core click handlers and window action listeners on map UI nodes.
 * Anchors the sidebar panel close event, and binds heatmap/audio buttons.
 */
function setupEventListeners() {
  const closeBtn = document.getElementById('close-info');
  const heatmapBtn = document.getElementById('toggle-heatmap');
  const soundBtn = document.getElementById('toggle-sound');

  if (!closeBtn || !heatmapBtn || !soundBtn) {
    console.error('❌ Missing DOM elements:', {
      closeBtn,
      heatmapBtn,
      soundBtn,
    });
    return;
  }

  closeBtn.addEventListener('click', () => {
    document.getElementById('village-info').classList.remove('active');
    if (currentSound) {
      currentSound.pause();
      currentSound = null;
    }
  });

  heatmapBtn.addEventListener('click', toggleHeatmap);
  soundBtn.addEventListener('click', toggleSound);

  setupSpatialSearch();
}

/**
 * Configures the spatial proximity search controls.
 * Uses browser geolocation to locate the user, filters villages using
 * the Haversine distance formula, and updates the map view and markers dynamically.
 */
function setupSpatialSearch() {
  const findNearbyBtn = document.getElementById('btn-find-nearby');
  const radiusSelect = document.getElementById('radius-select');
  
  if (!findNearbyBtn || !radiusSelect) return;
  
  findNearbyBtn.addEventListener('click', async () => {
    try {
      const originalText = findNearbyBtn.innerHTML;
      findNearbyBtn.innerHTML = '<i class="ti ti-loader ti-spin"></i> Locating...';
      findNearbyBtn.disabled = true;
      
      const position = await window.SpatialUtils.getUserLocation();
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;
      const radiusKm = parseFloat(radiusSelect.value);
      
      // Filter villages based on Haversine distance calculations
      const nearbyVillages = sampleVillages.filter(village => {
        const [villageLat, villageLon] = village.coordinates;
        const distance = window.SpatialUtils.calculateHaversineDistance(
          userLat, 
          userLon, 
          villageLat, 
          villageLon
        );
        return distance <= radiusKm;
      });
      
      // Update displayed village markers on the map canvas
      addVillageMarkers(nearbyVillages);
      
      // Smoothly animate and fly camera to user coordinates
      if (map) {
        map.flyTo({
          center: [userLon, userLat],
          zoom: radiusKm <= 10 ? 11 : 9,
          essential: true
        });
      }
      
      findNearbyBtn.innerHTML = `<i class="ti ti-check"></i> Found ${nearbyVillages.length}`;
      setTimeout(() => {
        findNearbyBtn.innerHTML = originalText;
        findNearbyBtn.disabled = false;
      }, 3000);
      
    } catch (error) {
      console.error('Location determination error:', error);
      alert('Could not determine your location. Please check browser geolocation permissions.');
      findNearbyBtn.innerHTML = '<i class="ti ti-map-pin"></i> Find Nearby';
      findNearbyBtn.disabled = false;
    }
  });

  // Ensure heritage health view score colors refresh when markers are rebuilt
  const heritageToggle = document.getElementById('toggle-heritage-health');
  if (heritageToggle) {
    heritageToggle.addEventListener('change', updateMarkerColors);
  }
}

/**
 * Toggles the visibility of the cultural density heatmap overlay on the map.
 * Dynamically renders gradient radial markers centered on village coordinates,
 * scaling diameter and transparency in correlation to their heritage health vulnerability index.
 */
function toggleHeatmap() {
  if (!map) return;

  const t = getTranslation();

  if (map.getLayer('cultural-heatmap')) {
    const visibility = map.getLayoutProperty('cultural-heatmap', 'visibility');
    
    if (visibility === 'visible') {
      map.setLayoutProperty('cultural-heatmap', 'visibility', 'none');
      heatmapLayer = false;
      document.getElementById('toggle-heatmap').textContent = t.toggleHeatmap || 'Toggle Heatmap';
    } else {
      map.setLayoutProperty('cultural-heatmap', 'visibility', 'visible');
      heatmapLayer = true;
      document.getElementById('toggle-heatmap').textContent = t.hideHeatmap || 'Hide Heatmap';
    }
  } else {
    console.warn("Heatmap layer is not initialized yet. Please wait for cultural items to load.");
  }
}

/**
 * ============================================================================
 * Premium Map Audio Control Engine
 * Handles user-gesture safe instantiation, looping, volume fades, and localization.
 * ============================================================================
 */
class MapAudioEngine {
  constructor() {
    this.ambientTrack = null;
    this.isAmbientPlaying = false;
    this.targetVolume = 0.35;
    this.fadeTimer = null;
  }

  /**
   * Safe Audio instantiation inside user gesture thread.
   * Resolves absolute route path for location-agnostic loads.
   */
  initAmbient() {
    if (!this.ambientTrack) {
      this.ambientTrack = new Audio('/assets/sounds/ambientSound.mp3');
      this.ambientTrack.loop = true;
      this.ambientTrack.volume = 0;
    }
  }

  /**
   * Play ambient track with a smooth fade-in transition.
   */
  playAmbient() {
    this.initAmbient();
    this.isAmbientPlaying = true;
    this.updateButtonState(true);

    this.ambientTrack.play().then(() => {
      this.fadeVolume(this.ambientTrack, this.targetVolume, 1000);
    }).catch(err => {
      console.warn('⚠️ Audio play blocked or failed:', err);
      this.isAmbientPlaying = false;
      this.updateButtonState(false);
    });
  }

  /**
   * Pause ambient track with a smooth fade-out transition.
   */
  pauseAmbient() {
    if (!this.ambientTrack) return;
    this.isAmbientPlaying = false;
    this.updateButtonState(false);

    this.fadeVolume(this.ambientTrack, 0, 600, () => {
      this.ambientTrack.pause();
    });
  }

  /**
   * Toggle action handler called by the toolbar control.
   */
  toggleAmbient() {
    if (this.isAmbientPlaying) {
      this.pauseAmbient();
    } else {
      this.playAmbient();
    }
  }

  /**
   * Utility to smoothly transition volume level over time.
   */
  fadeVolume(audio, targetVolume, duration, callback) {
    if (this.fadeTimer) {
      clearInterval(this.fadeTimer);
    }

    const startVolume = audio.volume;
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = (targetVolume - startVolume) / steps;
    let currentStep = 0;

    this.fadeTimer = setInterval(() => {
      currentStep++;
      const newVolume = startVolume + (volumeStep * currentStep);
      audio.volume = Math.max(0, Math.min(1, newVolume));

      if (currentStep >= steps) {
        clearInterval(this.fadeTimer);
        audio.volume = targetVolume;
        if (callback) callback();
      }
    }, stepTime);
  }

  /**
   * Synchronize the text of the toolbar toggle button with localizations.
   */
  updateButtonState(playing) {
    const soundBtn = document.getElementById('toggle-sound');
    if (!soundBtn) return;

    const t = getTranslation();
    if (playing) {
      soundBtn.textContent = t.soundOn || 'Ambient Sounds: ON';
      soundBtn.classList.add('playing');
    } else {
      soundBtn.textContent = t.soundOff || 'Ambient Sounds: OFF';
      soundBtn.classList.remove('playing');
    }
  }
}

// Instantiate the singleton audio manager
const audioEngine = new MapAudioEngine();

/**
 * Global interface handler for sound toggle events.
 */
function toggleSound() {
  audioEngine.toggleAmbient();
}

async function loadCulturalItems() {
  if (!map) {
    return;
  }

  try {
    // Clear existing cultural markers
    culturalMarkers.forEach(m => m.remove());
    culturalMarkers = [];

    let url = '/api/items?limit=1000';
    if (window.mapActiveEra && window.mapActiveEra !== 'All') {
      url += `&year=${window.mapActiveEra}`;
    }
    
    if (window.mapActiveTimelineItem) {
      url += `&search=${encodeURIComponent(window.mapActiveTimelineItem)}`;
    }

    // Attach bounding box query parameters for optimized spatial search
    const bounds = map.getBounds();
    if (bounds) {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      url += `&bounds=${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to load cultural items');
    }

    const result = await response.json();
    const items = result.data || result; // handle paginated or flat array

    const geojson = {
      type: 'FeatureCollection',
      features: items.filter(i => i.coordinates && i.coordinates.length === 2).map(item => {
        // Prepare properties, stringifying arrays/objects since GeoJSON properties must be primitives
        const props = { ...item };
        if (props.tags) props.tags = JSON.stringify(props.tags);
        if (props.images) props.images = JSON.stringify(props.images);
        
        return {
          type: 'Feature',
          properties: props,
          geometry: {
            type: 'Point',
            coordinates: [item.coordinates[1], item.coordinates[0]]
          }
        };
      })
    };

    const source = map.getSource('cultural-items');
    if (source) {
      source.setData(geojson);
    } else {
      map.addSource('cultural-items', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // 1. Heatmap layer
      map.addLayer({
        id: 'cultural-heatmap',
        type: 'heatmap',
        source: 'cultural-items',
        maxzoom: 15,
        layout: {
          visibility: 'none' // Default hidden, toggled by toggleHeatmap()
        },
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 15, 50],
          'heatmap-opacity': 0.8
        }
      });

      // 2. Clustered points layer
      map.addLayer({
        id: 'cultural-clusters',
        type: 'circle',
        source: 'cultural-items',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#e76f51', 10,
            '#f4a261', 50,
            '#e9c46a'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, 10,
            25, 50,
            30
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      // 3. Cluster count layer
      map.addLayer({
        id: 'cultural-cluster-count',
        type: 'symbol',
        source: 'cultural-items',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Arial Unicode MS Bold'],
          'text-size': 14
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // 4. Unclustered points layer
      map.addLayer({
        id: 'cultural-unclustered-point',
        type: 'circle',
        source: 'cultural-items',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#2a9d8f',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      // Handlers
      map.on('click', 'cultural-clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['cultural-clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('cultural-items').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
          });
        });
      });

      map.on('click', 'cultural-unclustered-point', (e) => {
        const properties = e.features[0].properties;
        const item = { ...properties };
        if (typeof item.tags === 'string') {
          try { item.tags = JSON.parse(item.tags); } catch(err){}
        }
        showPopup(item);
      });

      map.on('mouseenter', 'cultural-clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'cultural-clusters', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'cultural-unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'cultural-unclustered-point', () => { map.getCanvas().style.cursor = ''; });
    }
  } catch (error) {
    console.error('Error loading cultural items:', error);
  }
}

function showPopup(item) {
  const t = getTranslation();
  const infoPanel = document.getElementById('village-info');
  const villageName = document.getElementById('village-name');
  const infoContent = document.getElementById('info-content');

  villageName.textContent = item.title;

  const tagsHtml =
    item.tags && item.tags.length > 0
      ? `<p><strong>${t.tags}:</strong> ${item.tags.join(', ')}</p>`
      : '';

  infoContent.innerHTML = `
        <div class="markdown-body"><strong>${t.description}:</strong><br> ${renderMarkdown(item.description || '')}</div>
        <p><strong>${t.location}:</strong> ${item.location || ''}</p>
        ${tagsHtml}
    `;

  infoPanel.classList.add('active');
}

// ── Re-render map and elements when language changes globally
window.addEventListener('parampara:langchange', (e) => {
  const newLang = e.detail.lang;
  if (currentLanguage === newLang) return;
  currentLanguage = newLang;

  const selector = document.getElementById('language-selector');
  if (selector) selector.value = currentLanguage;

  if (map && map.isStyleLoaded()) {
    setMapLanguage(currentLanguage);
  }

  if (map) {
    addVillageMarkers();
  }

  translatePage();
});



// ── Cinematic Flyover Logic ──────────────────────────────────────────────────
async function checkFlyover() {
  const params = new URLSearchParams(window.location.search);
  const flyoverId = params.get('flyover');
  if (!flyoverId) return;

  try {
    const response = await fetch('/api/paths');
    const paths = await response.json();
    const targetPath = paths.find(p => p.id === flyoverId);

    if (!targetPath || !targetPath.items || targetPath.items.length === 0) {
      console.warn('Flyover path not found or empty');
      return;
    }

    const itemsRes = await fetch('/api/items?limit=1000');
    const itemsData = await itemsRes.json();
    const allItems = itemsData.data || itemsData; // Support paginated response if backend uses it

    flyoverCoordinates = targetPath.items.map(itemId => {
      const item = allItems.find(i => i.id === itemId);
      return item && item.coordinates && item.coordinates.length === 2 ? [item.coordinates[1], item.coordinates[0]] : null;
    }).filter(c => c !== null);

    if (flyoverCoordinates.length < 2) {
      console.warn('Not enough coordinates for flyover');
      return;
    }

    startFlyover();
  } catch (err) {
    console.error('Error starting flyover:', err);
  }
}

function startFlyover() {
  flyoverActive = true;
  flyoverPaused = false;
  flyoverIndex = 0;

  // Add route layer
  if (!map.getSource('flyover-route')) {
    map.addSource('flyover-route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: flyoverCoordinates
        }
      }
    });

    map.addLayer({
      id: 'flyover-route-line',
      type: 'line',
      source: 'flyover-route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#e53e3e',
        'line-width': 4,
        'line-dasharray': [2, 4]
      }
    });
  }

  // Show UI
  const controls = document.getElementById('flyover-controls');
  if (controls) controls.style.display = 'flex';
  
  const pauseBtn = document.getElementById('btn-flyover-pause');
  const stopBtn = document.getElementById('btn-flyover-stop');
  if (pauseBtn) {
    pauseBtn.textContent = 'Pause';
    pauseBtn.addEventListener('click', toggleFlyoverPause);
  }
  if (stopBtn) stopBtn.addEventListener('click', stopFlyover);

  flyToNextPoint();
}

function toggleFlyoverPause() {
  flyoverPaused = !flyoverPaused;
  const btn = document.getElementById('btn-flyover-pause');
  if (flyoverPaused) {
    if (btn) btn.textContent = 'Resume';
    map.stop(); // Stop camera animation
    if (flyoverTimeout) clearTimeout(flyoverTimeout);
  } else {
    if (btn) btn.textContent = 'Pause';
    flyToNextPoint();
  }
}

function stopFlyover() {
  flyoverActive = false;
  if (flyoverTimeout) clearTimeout(flyoverTimeout);
  map.stop();
  map.easeTo({ pitch: 0, bearing: 0 });
  
  if (map.getLayer('flyover-route-line')) map.removeLayer('flyover-route-line');
  if (map.getSource('flyover-route')) map.removeSource('flyover-route');
  
  const controls = document.getElementById('flyover-controls');
  if (controls) controls.style.display = 'none';
  
  // Remove pause/stop event listeners to avoid duplicates if run again
  const pauseBtn = document.getElementById('btn-flyover-pause');
  const stopBtn = document.getElementById('btn-flyover-stop');
  if (pauseBtn) pauseBtn.removeEventListener('click', toggleFlyoverPause);
  if (stopBtn) stopBtn.removeEventListener('click', stopFlyover);
  
  // Remove flyover param from URL
  const url = new URL(window.location);
  url.searchParams.delete('flyover');
  window.history.replaceState({}, '', url);
}

function flyToNextPoint() {
  if (!flyoverActive || flyoverPaused) return;

  if (flyoverIndex >= flyoverCoordinates.length) {
    // End of route
    stopFlyover();
    return;
  }

  const target = flyoverCoordinates[flyoverIndex];
  
  // Calculate bearing to next point for cinematic effect
  let bearing = 0;
  if (flyoverIndex < flyoverCoordinates.length - 1) {
    const next = flyoverCoordinates[flyoverIndex + 1];
    bearing = calculateBearing(target[1], target[0], next[1], next[0]);
  } else if (flyoverIndex > 0) {
    const prev = flyoverCoordinates[flyoverIndex - 1];
    bearing = calculateBearing(prev[1], prev[0], target[1], target[0]);
  }

  map.flyTo({
    center: target,
    zoom: 9,
    pitch: 60,
    bearing: bearing,
    speed: 0.3, // slow cinematic speed
    curve: 1,
    essential: true
  });

  // When move ends, wait a bit and go to next
  map.once('moveend', () => {
    if (!flyoverActive || flyoverPaused) return;
    
    // Increment index and schedule next flight
    flyoverIndex++;
    flyoverTimeout = setTimeout(() => {
      flyToNextPoint();
    }, 3000); // 3 second pause at each point to let user look around
  });
}

function calculateBearing(startLat, startLng, destLat, destLng) {
  startLat = startLat * Math.PI / 180;
  startLng = startLng * Math.PI / 180;
  destLat = destLat * Math.PI / 180;
  destLng = destLng * Math.PI / 180;

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x = Math.cos(startLat) * Math.sin(destLat) -
            Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  
  let brng = Math.atan2(y, x);
  brng = brng * 180 / Math.PI;
  return (brng + 360) % 360;
}
// --- Heritage Path Routing ---
function initRouting() {
  if (typeof MapboxDraw !== 'undefined') {
    draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        polygon: true,
        point: true,
        trash: true,
        combine_features: true,
        uncombine_features: true
      },
      styles: [
        {
          "id": "gl-draw-line",
          "type": "line",
          "filter": ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
          "layout": { "line-cap": "round", "line-join": "round" },
          "paint": { "line-color": "#f4a261", "line-width": 4, "line-dasharray": [0.2, 2] }
        },
        {
          "id": "gl-draw-polygon-fill",
          "type": "fill",
          "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          "paint": { "fill-color": "#e76f51", "fill-outline-color": "#e76f51", "fill-opacity": 0.3 }
        },
        {
          "id": "gl-draw-polygon-stroke-active",
          "type": "line",
          "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          "layout": { "line-cap": "round", "line-join": "round" },
          "paint": { "line-color": "#f4a261", "line-width": 2 }
        },
        {
          "id": "gl-draw-point-active",
          "type": "circle",
          "filter": ["all", ["==", "$type", "Point"], ["!=", "mode", "static"]],
          "paint": { "circle-radius": 6, "circle-color": "#e76f51" }
        }
      ]
    });
    map.addControl(draw, 'top-left');

    map.on('draw.create', updateRouteMetrics);
    map.on('draw.delete', updateRouteMetrics);
    map.on('draw.update', updateRouteMetrics);

    const savedRoute = localStorage.getItem('parampara_custom_routes');
    if (savedRoute) {
        try {
            draw.add(JSON.parse(savedRoute));
            updateRouteMetrics();
        } catch (e) {
            console.error("Failed to load saved routes", e);
        }
    }

    setupCustomRouteControls();
  } else {
    console.warn("MapboxDraw is not loaded.");
  }
}

function setupCustomRouteControls() {
  const btnExport = document.getElementById('btn-export-route');
  const btnImport = document.getElementById('btn-import-route');
  const importInput = document.getElementById('import-route-input');

  if (btnExport) {
    btnExport.addEventListener('click', () => {
      if (!draw) return;
      const data = draw.getAll();
      if (data.features.length > 0) {
        const json = JSON.stringify(data);
        const blob = new Blob([json], { type: "application/geo+json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "custom_heritage_route.geojson";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert("No routes to export. Please draw a route first.");
      }
    });
  }

  if (btnImport) {
    btnImport.addEventListener('click', () => {
      importInput.click();
    });
  }

  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const geojson = JSON.parse(event.target.result);
          
          if (geojson.type === 'FeatureCollection' || geojson.type === 'Feature') {
             draw.add(geojson);
             
             if (geojson.features && geojson.features.length > 0) {
                 const coordinates = [];
                 geojson.features.forEach(f => {
                     if(f.geometry && f.geometry.coordinates) {
                         if(f.geometry.type === 'Point') {
                             coordinates.push(f.geometry.coordinates);
                         } else if (f.geometry.type === 'LineString') {
                             coordinates.push(...f.geometry.coordinates);
                         } else if (f.geometry.type === 'Polygon') {
                             coordinates.push(...f.geometry.coordinates[0]);
                         }
                     }
                 });

                 if(coordinates.length > 0) {
                     const bounds = coordinates.reduce(function(b, coord) {
                         return b.extend(coord);
                     }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
                     
                     map.fitBounds(bounds, { padding: 50 });
                 }
             }
             alert("Route imported successfully!");
          } else {
            alert("Invalid GeoJSON format.");
          }
        } catch (err) {
          console.error("Error parsing GeoJSON:", err);
          alert("Error parsing the file. Make sure it's a valid GeoJSON file.");
        }
        importInput.value = '';
      };
      reader.readAsText(file);
    });
  }
}

function updateRouteMetrics() {
  if (!draw) return;
  const data = draw.getAll();
  
  localStorage.setItem('parampara_custom_routes', JSON.stringify(data));
  
  const dashboard = document.getElementById('custom-route-dashboard');
  if (!dashboard) return;

  if (data.features.length === 0) {
    dashboard.style.display = 'none';
    return;
  }
  
  dashboard.style.display = 'block';
  
  let totalDistance = 0;
  let waypoints = 0;
  
  if (typeof turf !== 'undefined') {
    data.features.forEach(feature => {
      if (feature.geometry.type === 'LineString') {
         totalDistance += turf.length(feature, {units: 'kilometers'});
         waypoints += feature.geometry.coordinates.length;
      } else if (feature.geometry.type === 'Point') {
         waypoints += 1;
      }
    });
  }
  
  const distanceStr = totalDistance.toFixed(2) + ' km';
  const timeHours = totalDistance / 5;
  const timeMins = Math.round(timeHours * 60);
  
  document.getElementById('route-distance').textContent = distanceStr;
  document.getElementById('route-time').textContent = timeMins + ' mins';
  document.getElementById('route-waypoints').textContent = waypoints;
}

