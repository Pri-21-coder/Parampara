/**
 * Interactive Scrollytelling Engine
 * Synchronizes long-form text reading with MapLibre coordinates and Media overlay.
 */

document.addEventListener('DOMContentLoaded', () => {
    const storySelector = document.getElementById('story-selector');
    const scrollyContainer = document.getElementById('scrolly');
    const textContainer = document.getElementById('story-text-container');
    const mediaLayer = document.getElementById('media-layer');
    const visualHeaderTitle = document.getElementById('visual-header-title');
    const selectorOverlay = document.getElementById('story-selector-overlay');

    let map = null;

    storySelector.addEventListener('change', (e) => {
        const storyName = e.target.value;
        if (storyName) {
            selectorOverlay.style.display = 'none';
            scrollyContainer.style.display = 'grid';
            loadStory(storyName);
        }
    });

    async function loadStory(storyName) {
        try {
            const res = await fetch(`/api/story-generator?item=${encodeURIComponent(storyName)}`);
            const data = await res.json();

            if (!data.chapters || data.chapters.length === 0) {
                alert('No spatial chapters found for this story yet. Please try another!');
                return;
            }

            visualHeaderTitle.textContent = data.name;
            renderChapters(data.chapters);
            initMapAndObserver(data.chapters[0]);

        } catch (error) {
            console.error('Failed to load scrollytelling data:', error);
            alert('Failed to load story data.');
        }
    }

    function renderChapters(chapters) {
        textContainer.innerHTML = '';
        
        // Add a blank spacer at the top so the first element can be scrolled into
        const topSpacer = document.createElement('div');
        topSpacer.style.height = '30vh';
        textContainer.appendChild(topSpacer);

        chapters.forEach((chapter, index) => {
            const step = document.createElement('div');
            step.className = 'story-chapter';
            step.setAttribute('data-index', index);
            step.setAttribute('data-lat', chapter.coordinates[0]);
            step.setAttribute('data-lng', chapter.coordinates[1]);
            step.setAttribute('data-zoom', chapter.zoom || 12);
            step.setAttribute('data-media', chapter.mediaUrl || '');

            step.innerHTML = `
                <div class="chapter-content">
                    <h2>${chapter.title}</h2>
                    <p>${chapter.content}</p>
                </div>
            `;
            textContainer.appendChild(step);
        });

        // Bottom spacer
        const bottomSpacer = document.createElement('div');
        bottomSpacer.style.height = '50vh';
        textContainer.appendChild(bottomSpacer);
    }

    function initMapAndObserver(firstChapter) {
        try {
            if (typeof maplibregl !== 'undefined') {
                if (!map) {
                    map = new maplibregl.Map({
                        container: 'map',
                        style: '/api/map-style',
                        center: [firstChapter.coordinates[1], firstChapter.coordinates[0]], 
                        zoom: firstChapter.zoom || 12,
                        interactive: false
                    });

                    map.on('load', () => {
                        setupIntersectionObserver();
                    });
                } else {
                    setupIntersectionObserver();
                }
            } else {
                console.warn("MapLibre not loaded. Proceeding with text and images only.");
                document.getElementById('map').innerHTML = '<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#888; background:#eaeaea;">Map unavailable offline</div>';
                setupIntersectionObserver();
            }
        } catch (e) {
            console.error("Map initialization failed:", e);
            document.getElementById('map').innerHTML = '<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#888; background:#eaeaea;">Map Error</div>';
            setupIntersectionObserver();
        }
    }

    function setupIntersectionObserver() {
        const chapters = document.querySelectorAll('.story-chapter');
        
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5 // Trigger when 50% of the element is visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Make this step active
                    chapters.forEach(c => c.classList.remove('active'));
                    entry.target.classList.add('active');

                    // Update Map & Media
                    updateVisuals(entry.target);
                }
            });
        }, observerOptions);

        chapters.forEach(chapter => observer.observe(chapter));
    }

    function updateVisuals(chapterElement) {
        const lat = parseFloat(chapterElement.getAttribute('data-lat'));
        const lng = parseFloat(chapterElement.getAttribute('data-lng'));
        const zoom = parseFloat(chapterElement.getAttribute('data-zoom'));
        const mediaUrl = chapterElement.getAttribute('data-media');

        // 1. Fly Map
        if (map && !isNaN(lat) && !isNaN(lng)) {
            map.flyTo({
                center: [lng, lat],
                zoom: zoom,
                speed: 0.8,
                curve: 1.5,
                essential: true
            });
        }

        // 2. Update Media Overlay
        if (mediaUrl) {
            mediaLayer.innerHTML = '<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#888;">Loading image...</div>';
            const img = new Image();
            img.src = mediaUrl;
            img.onload = () => {
                mediaLayer.innerHTML = '';
                mediaLayer.style.backgroundImage = `url(${mediaUrl})`;
                mediaLayer.classList.add('active');
            };
            img.onerror = () => {
                mediaLayer.innerHTML = '<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#888;">Image unavailable</div>';
                mediaLayer.style.backgroundImage = 'none';
            };
        } else {
            mediaLayer.innerHTML = '';
            mediaLayer.classList.remove('active');
        }
    }
});
