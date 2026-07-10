
// Main JavaScript for Home Page

// Load village posts on page load
document.addEventListener("DOMContentLoaded", async () => {
  initNavbar();

  try {
    await loadVillagePosts();
  } catch (err) {
    console.error("Failed to load village posts:", err);
  }

  try {
    initVillagePostsSSE();
  } catch (err) {
    console.error("Failed to initialize SSE:", err);
  }
});

function initNavbar() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navFullMenu = document.getElementById("navFullMenu");
  const navOverlay = document.getElementById("navOverlay");

  if (!hamburgerBtn || !navFullMenu || !navOverlay) {
    console.warn("Nav elements not found");
    return;
  }

  function toggleNavMenu(forceOpen) {
    const isOpen =
      forceOpen !== undefined
        ? forceOpen
        : !navFullMenu.classList.contains("open");

    hamburgerBtn.classList.toggle("open", isOpen);
    navFullMenu.classList.toggle("open", isOpen);
    navOverlay.classList.toggle("open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  hamburgerBtn.addEventListener("click", () => toggleNavMenu());

  navOverlay.addEventListener("click", () => toggleNavMenu(false));

  document.querySelectorAll(".nav-fullmenu-grid a").forEach((link) => {
    link.addEventListener("click", () => toggleNavMenu(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      toggleNavMenu(false);
    }
  });
}

async function loadVillagePosts() {
  const DUMMY_POSTS = [
    {
      id: "dummy1",
      titleKey: "post1_title",
      title: "Village Council Announces Seed Bank",
      villageKey: "post1_village",
      village: "Piplantri, Rajasthan",
      contentKey: "post1_content",
      content: "The local panchayat just approved a native seed bank to preserve 20 varieties of indigenous millet.",
      typeKey: "post1_type",
      type: "Update",
      timestamp: new Date().toISOString()
    },
    {
      id: "dummy2",
      titleKey: "post2_title",
      title: "New Pottery Workshop Opens",
      villageKey: "post2_village",
      village: "Khurja, Uttar Pradesh",
      contentKey: "post2_content",
      content: "Local artisan _Ramesh Kumhar_ has opened a free pottery workshop for village youth, teaching **traditional blue pottery** techniques.",
      typeKey: "post2_type",
      type: "Craft",
      timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "dummy3",
      titleKey: "post3_title",
      title: "Elder Storytelling Session Recorded",
      villageKey: "post3_village",
      village: "Bishnoi, Rajasthan",
      contentKey: "post3_content",
      content: "90-year-old Dadi Kamla shared tales of the Bishnoi conservation movement — now archived in 3 languages.",
      typeKey: "post3_type",
      type: "Story",
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: "dummy4",
      titleKey: "post4_title",
      title: "Heritage Bamboo Bridge Restored",
      villageKey: "post4_village",
      village: "Majuli, Assam",
      contentKey: "post4_content",
      content: "Community volunteers restored the 80-year-old bamboo bridge using traditional Mising tribe construction methods.",
      typeKey: "post4_type",
      type: "Restoration",
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: "dummy5",
      titleKey: "post5_title",
      title: "Phad Painting Exhibition Next Week",
      villageKey: "post5_village",
      village: "Shahpura, Rajasthan",
      contentKey: "post5_content",
      content: "Local Bhopa community is hosting a live Phad painting demo — a 700-year-old narrative scroll art tradition.",
      typeKey: "post5_type",
      type: "Art",
      timestamp: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: "dummy6",
      titleKey: "post6_title",
      title: "Tribal Music Archive — 50 Songs Added",
      villageKey: "post6_village",
      village: "Bastar, Chhattisgarh",
      contentKey: "post6_content",
      content: "Gond tribal musicians contributed 50 rare folk songs to the archive, many never recorded before.",
      typeKey: "post6_type",
      type: "Music",
      timestamp: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ];

  try {
    const response = await fetch("/api/posts");
    if (!response.ok) throw new Error("API unavailable");
    const posts = await response.json();

    const postsGrid = document.getElementById("village-posts");
    if (!postsGrid) return;

    if (posts.length === 0) {
      renderPosts(postsGrid, DUMMY_POSTS, true);
      return;
    }

    renderPosts(postsGrid, posts.slice(0, 6), false);
  } catch (error) {
    console.error("Error loading posts:", error);
    const postsGrid = document.getElementById("village-posts");
    if (postsGrid) renderPosts(postsGrid, DUMMY_POSTS, true);
  }
}

function renderPosts(container, posts, isDummy) {
  const lang = localStorage.getItem("parampara_lang") || "en";
  const activeTranslations = window.translations;
  const tr = activeTranslations ? activeTranslations[lang] : null;

  container.innerHTML = posts
    .map(
      (post) => {
        const title = (tr && post.titleKey && tr[post.titleKey]) || post.title || "Post";
        const village = (tr && post.villageKey && tr[post.villageKey]) || post.village || "Unknown Village";
        const content = (tr && post.contentKey && tr[post.contentKey]) || post.content || "";
        const type = (tr && post.typeKey && tr[post.typeKey]) || post.type || "Update";

        // Assign emojis to categories for high visual polish
        const typeIcons = {
          Update: '📢',
          Craft: '🏺',
          Story: '📖',
          Restoration: '🔨',
          Art: '🎨',
          Music: '🎵'
        };
        const icon = typeIcons[type] || '📍';

        // Check if content exceeds 120 chars for read-more functionality
        const isLong = content.length > 120;
        const displayContent = isLong ? content.slice(0, 110) + '...' : content;
        const postClass = `post-card ${isLong ? 'has-read-more' : ''}`;

        return `
          <div class="${postClass}" data-post-id="${post.id || ''}" data-type="${type.toLowerCase()}">
              <div class="post-card-header">
                <span class="post-type-icon">${icon}</span>
                <span class="post-card-badge">${type}</span>
              </div>
              <h4>${title}</h4>
              <p class="post-meta">📍 ${village} · 📅 ${formatDate(post.timestamp)}</p>
              <div class="post-content markdown-body" id="post-content-${post.id}">
                ${renderMarkdown(displayContent)}
              </div>
              ${isLong ? `
                <button class="read-more-btn" onclick="toggleReadMore('${post.id}', '${encodeURIComponent(content)}')">Read More <i class="ti ti-chevron-down"></i></button>
              ` : ''}
              ${post.id && !post.id.startsWith('dummy') ? `<button class="report-post-btn" data-post-id="${post.id}" title="Report inappropriate content" aria-label="Report">🚩 Report</button>` : ''}
          </div>
        `;
      }
    )
    .join("");

  // Attach event listeners for report buttons
  const reportBtns = container.querySelectorAll('.report-post-btn');
  reportBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const postId = e.target.dataset.postId;
      if (!postId) return;
      if (confirm('Are you sure you want to report this post?')) {
        fetch('/api/moderation/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: postId, type: 'villagePost' })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert('Post reported successfully.');
            if (data.isHidden) {
              const card = e.target.closest('.post-card');
              if (card) card.remove();
            }
          } else {
            alert(data.error || 'Failed to report post');
          }
        })
        .catch(err => console.error('Error reporting:', err));
      }
    });
  });

  if (isDummy) {
    const note = document.createElement("p");
    note.style.cssText = "text-align:center; color: rgba(255,255,255,0.6); font-size:0.85rem; margin-top:1rem;";
    note.textContent = "✦ Sample stories — live updates coming soon";
    container.appendChild(note);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const backToTopBtn = document.getElementById("backToTopBtn");
if (backToTopBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }
  });
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

window.addEventListener("parampara:langchange", () => {
  loadVillagePosts();
});

// --- Real-Time SSE Logic ---
const receivedPostIds = new Set();
let sseReconnectDelay = 1000;

function initVillagePostsSSE() {
  const sseUrl = '/api/posts/stream';
  const eventSource = new EventSource(sseUrl);

  eventSource.addEventListener('NEW_POST', (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (payload) {
        handleNewVillagePost(payload);
      }
    } catch (err) {
      console.error("Error parsing SSE message:", err);
    }
  });

  eventSource.addEventListener('HIDE_POST', (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (payload && payload.id) {
        const card = document.querySelector(`.post-card[data-post-id="${payload.id}"]`);
        if (card) card.remove();
      }
    } catch (err) {
      console.error("Error parsing SSE HIDE_POST message:", err);
    }
  });

  eventSource.onerror = (err) => {
    console.error("EventSource failed:", err);
    // EventSource auto-reconnects natively, but we can log errors.
  };
}

function handleNewVillagePost(post) {
  if (receivedPostIds.has(post.id)) return;
  receivedPostIds.add(post.id);

  const postsGrid = document.getElementById("village-posts");
  if (!postsGrid) return;

  const lang = localStorage.getItem("parampara_lang") || "en";
  const activeTranslations = window.translations;
  const tr = activeTranslations ? activeTranslations[lang] : null;

  const title = (tr && post.titleKey && tr[post.titleKey]) || post.title || "New Post";
  const village = (tr && post.villageKey && tr[post.villageKey]) || post.village || "Unknown Village";
  const content = (tr && post.contentKey && tr[post.contentKey]) || post.content || "";
  const type = (tr && post.typeKey && tr[post.typeKey]) || post.type || "Update";
  
  const postHtml = `
    <div class="post-card new-post" data-post-id="${post.id || ''}" style="opacity: 0; transform: translateY(-20px); transition: all 0.5s ease;">
        <h4>${title}</h4>
        <p class="post-meta">${village} • ${formatDate(post.timestamp)}</p>
        <div class="post-content markdown-body">${renderMarkdown(content)}</div>
        <span class="post-card-badge">
            ${type}
        </span>
        ${post.id ? `<button class="report-post-btn" data-post-id="${post.id}" title="Report inappropriate content" aria-label="Report" style="position:absolute; top:10px; right:10px; background:none; border:none; cursor:pointer; font-size:16px; opacity:0.6;">🚩</button>` : ''}
    </div>
  `;

  // Insert at the top of the grid
  postsGrid.insertAdjacentHTML('afterbegin', postHtml);
  
  // Attach listener to the newly inserted button
  const newCard = postsGrid.firstElementChild;
  const newReportBtn = newCard.querySelector('.report-post-btn');
  if (newReportBtn) {
    newReportBtn.addEventListener('click', (e) => {
      const postId = e.target.dataset.postId;
      if (!postId) return;
      if (confirm('Are you sure you want to report this post?')) {
        fetch('/api/moderation/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: postId, type: 'villagePost' })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert('Post reported successfully.');
            if (data.isHidden) {
              const card = e.target.closest('.post-card');
              if (card) card.remove();
            }
          } else {
            alert(data.error || 'Failed to report post');
          }
        })
        .catch(err => console.error('Error reporting:', err));
      }
    });
  }

  requestAnimationFrame(() => {
    const newEl = postsGrid.firstElementChild;
    if (newEl) {
      void newEl.offsetWidth; 
      newEl.style.opacity = "1";
      newEl.style.transform = "translateY(0)";
    }
  });
}

// ===== FOCUS TRAPPING UTILITY FOR MODALS =====
(function() {
  let activeModal = null;
  let previousFocusElement = null;
  const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';

  function trapFocus(e) {
    if (!activeModal || e.key !== 'Tab') return;
    const focusable = Array.from(activeModal.querySelectorAll(focusableElementsString)).filter(el => el.offsetWidth > 0 || el.offsetHeight > 0);
    if (focusable.length === 0) return;
    if (e.shiftKey ? document.activeElement === focusable[0] : document.activeElement === focusable[focusable.length - 1]) {
      (e.shiftKey ? focusable[focusable.length - 1] : focusable[0]).focus();
      e.preventDefault();
    }
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        const el = mutation.target;
        if (el.classList.contains('active') && (el.className.includes('modal') || el.className.includes('fav-modal'))) {
          activeModal = el;
          previousFocusElement = document.activeElement;
          document.addEventListener('keydown', trapFocus);
        } else if (activeModal === el) {
          document.removeEventListener('keydown', trapFocus);
          if (previousFocusElement) previousFocusElement.focus();
          activeModal = null;
        }
      }
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });
    
    // Check if any modal is already active on load
    const openModal = document.querySelector('.modal.active, .fav-modal-overlay.active');
    if (openModal && typeof onModalOpen === 'function') {
      onModalOpen(openModal);
    }
  });
})();


const heroStats = document.querySelector(".hero-stats");
if (heroStats) {
  heroStats.style.transform = "rotateX(3600deg)";
}

// Toggle Read More / Read Less for village post cards
window.toggleReadMore = function(postId, fullContentEncoded) {
  const contentDiv = document.getElementById(`post-content-${postId}`);
  const btn = event.currentTarget;
  const isExpanded = btn.classList.contains('expanded');
  const fullContent = decodeURIComponent(fullContentEncoded);
  
  if (isExpanded) {
    // Collapse
    const collapsedContent = fullContent.slice(0, 110) + '...';
    contentDiv.innerHTML = renderMarkdown(collapsedContent);
    btn.innerHTML = 'Read More <i class="ti ti-chevron-down"></i>';
    btn.classList.remove('expanded');
  } else {
    // Expand
    contentDiv.innerHTML = renderMarkdown(fullContent);
    btn.innerHTML = 'Read Less <i class="ti ti-chevron-up"></i>';
    btn.classList.add('expanded');
  }
};

// ==========================================
// WEBSITE RATING & REVIEW SYSTEM
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const rateUsBtn = document.getElementById('footer-rate-us');
  const reviewsBtn = document.getElementById('nav-reviews');
  const rateModal = document.getElementById('rateUsModal');
  const reviewsModal = document.getElementById('reviewsListModal');
  const closeRateBtn = document.getElementById('closeRateModal');
  const closeReviewsBtn = document.getElementById('closeReviewsModal');
  const ratingForm = document.getElementById('ratingForm');
  const stars = document.querySelectorAll('.rating-star');
  
  let selectedRating = 0;

  // Preset mock reviews for heritage platform feedback
  const DEFAULT_REVIEWS = [
    { name: "Aarav Sharma", rating: 5, comment: "Beautiful interface! Preserving oral histories through audio recordings is a genius feature. The translations are clean too.", date: "2 hours ago" },
    { name: "Priya Patel", rating: 4, comment: "Love the interactive cultural map. Visual gallery image qualities are amazing. Keep up the good work.", date: "1 day ago" },
    { name: "Kabir Mehta", rating: 5, comment: "Fascinating AI story generator. Brings folklore to life beautifully.", date: "3 days ago" },
    { name: "Anjali Deshmukh", rating: 5, comment: "Traditional blue pottery tutorials and maps are very accurate. The ambient music gives a serene village vibe!", date: "1 week ago" },
    { name: "Vikram Singh", rating: 4, comment: "A masterpiece for digital preservation. Very smooth user interface.", date: "2 weeks ago" }
  ];

  // Helper to load reviews from LocalStorage
  function getReviews() {
    const stored = localStorage.getItem('parampara_site_reviews');
    if (!stored) {
      localStorage.setItem('parampara_site_reviews', JSON.stringify(DEFAULT_REVIEWS));
      return DEFAULT_REVIEWS;
    }
    return JSON.parse(stored);
  }

  // Helper to save review
  function saveReview(name, rating, comment) {
    const reviews = getReviews();
    const newReview = {
      name: name,
      rating: parseInt(rating),
      comment: comment,
      date: "Just now"
    };
    reviews.unshift(newReview);
    localStorage.setItem('parampara_site_reviews', JSON.stringify(reviews));
    updateReviewsDisplay();
  }

  // Update Reviews Modal Display
  function updateReviewsDisplay() {
    const reviewsList = getReviews();
    const scrollList = document.getElementById('reviewsScrollList');
    const avgVal = document.getElementById('avgRatingVal');
    const avgStars = document.getElementById('avgStarsRow');
    const totalCount = document.getElementById('totalReviewsCount');
    
    if (!scrollList) return;

    // Calculate Average rating dynamically
    const totalRating = reviewsList.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = reviewsList.length ? (totalRating / reviewsList.length).toFixed(1) : "0.0";
    
    avgVal.textContent = avg;
    totalCount.textContent = `Based on ${reviewsList.length} reviews`;
    
    // Generate Stars String representation
    const roundedAvg = Math.round(parseFloat(avg));
    avgStars.textContent = "★".repeat(roundedAvg) + "☆".repeat(5 - roundedAvg);

    // Render List markup
    scrollList.innerHTML = reviewsList.map(r => {
      const initials = r.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      const starString = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
      return `
        <div class="review-card">
          <div class="review-card-header">
            <div class="review-user-info">
              <div class="user-avatar-placeholder">${initials}</div>
              <span class="review-user-name">${r.name}</span>
            </div>
            <div class="review-stars">${starString}</div>
          </div>
          <p class="review-comment">${r.comment}</p>
          <span class="review-date">${r.date}</span>
        </div>
      `;
    }).join('');
  }

  // Star Hover & Selection Listeners
  stars.forEach(star => {
    star.addEventListener('mouseover', () => {
      const val = parseInt(star.getAttribute('data-value'));
      stars.forEach(s => {
        const sVal = parseInt(s.getAttribute('data-value'));
        s.classList.toggle('hovered', sVal <= val);
      });
    });

    star.addEventListener('mouseout', () => {
      stars.forEach(s => s.classList.remove('hovered'));
    });

    star.addEventListener('click', () => {
      selectedRating = parseInt(star.getAttribute('data-value'));
      stars.forEach(s => {
        const sVal = parseInt(s.getAttribute('data-value'));
        s.classList.toggle('selected', sVal <= selectedRating);
      });
    });
  });

  // Modal toggle handlers
  if (rateUsBtn) {
    rateUsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      selectedRating = 0;
      stars.forEach(s => s.classList.remove('selected', 'hovered'));
      ratingForm.reset();
      rateModal.classList.add('active');
    });
  }

  if (reviewsBtn) {
    reviewsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      updateReviewsDisplay();
      reviewsModal.classList.add('active');
    });
  }

  const closeModal = (modal) => {
    modal.classList.remove('active');
  };

  if (closeRateBtn) closeRateBtn.addEventListener('click', () => closeModal(rateModal));
  if (closeReviewsBtn) closeReviewsBtn.addEventListener('click', () => closeModal(reviewsModal));

  // Close Modal on Backdrop Click
  window.addEventListener('click', (e) => {
    if (e.target === rateModal) closeModal(rateModal);
    if (e.target === reviewsModal) closeModal(reviewsModal);
  });

  // Form Submission listener
  if (ratingForm) {
    ratingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('ratingUserName').value.trim();
      const comment = document.getElementById('ratingComment').value.trim();

      if (selectedRating === 0) {
        alert("Please select a star rating!");
        return;
      }

      saveReview(name, selectedRating, comment);
      closeModal(rateModal);
      alert("Thank you! Your rating has been successfully submitted.");
    });
  }

  // Pre-fetch reviews to bootstrap LocalStorage dynamically
  getReviews();

  // Support Artisan Action handler
  const supportBtn = document.getElementById('btn-support-artisan');
  if (supportBtn) {
    supportBtn.addEventListener('click', () => {
      alert("Thank you! You have successfully sent a token of appreciation to Ramesh Kumhar.");
    });
  }

  // ==========================================
  // TRIBAL BADGE GENERATION SYSTEM
  // ==========================================
  const badgeModal = document.getElementById('badgeModal');
  const navBadgeBtn = document.getElementById('nav-badge');
  const footerBadgeBtn = document.getElementById('footer-get-badge');
  const closeBadgeBtn = document.getElementById('closeBadgeModal');
  const shuffleBtn = document.getElementById('btnShuffleStyle');
  const downloadBtn = document.getElementById('btnDownloadBadge');
  const badgeCanvas = document.getElementById('badgeCanvas');

  const badgeNameInput = document.getElementById('badgeUserName');
  const badgeRoleInput = document.getElementById('badgeRole');
  const badgeVillageInput = document.getElementById('badgeVillage');

  let activeStyleIndex = 0;

  const BADGE_STYLES = [
    {
      name: "Suryavanshi Gold",
      bgGradStart: "#3b1d11", bgGradEnd: "#241009",
      accent: "#d4a853", textMain: "#dfd5c6", textMuted: "#a8988a",
      drawPattern: (ctx) => {
        ctx.strokeStyle = "rgba(212, 168, 83, 0.07)";
        ctx.lineWidth = 2;
        for (let r = 50; r <= 350; r += 40) {
          ctx.beginPath();
          ctx.arc(250, 250, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    },
    {
      name: "Nilgiri Indigo",
      bgGradStart: "#0b1a30", bgGradEnd: "#050c18",
      accent: "#64e3e3", textMain: "#dfd5c6", textMuted: "#8fa3b5",
      drawPattern: (ctx) => {
        ctx.strokeStyle = "rgba(100, 227, 227, 0.05)";
        ctx.lineWidth = 1;
        for (let x = -500; x < 1000; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x + 500, 500);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x - 500, 500);
          ctx.stroke();
        }
      }
    },
    {
      name: "Forest Sage",
      bgGradStart: "#0a2214", bgGradEnd: "#041008",
      accent: "#dfc794", textMain: "#dfd5c6", textMuted: "#8fa898",
      drawPattern: (ctx) => {
        ctx.strokeStyle = "rgba(223, 199, 148, 0.06)";
        ctx.lineWidth = 2;
        for (let y = 10; y < 500; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          for (let x = 0; x <= 500; x += 20) {
            ctx.lineTo(x, y + (x % 40 === 0 ? 10 : 0));
          }
          ctx.stroke();
        }
      }
    },
    {
      name: "Varanasi Plum",
      bgGradStart: "#2f0a28", bgGradEnd: "#160413",
      accent: "#f2aac0", textMain: "#dfd5c6", textMuted: "#a88e9f",
      drawPattern: (ctx) => {
        ctx.fillStyle = "rgba(242, 170, 192, 0.05)";
        for (let x = 30; x < 500; x += 50) {
          for (let y = 30; y < 500; y += 50) {
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(x - 5, y - 1, 10, 2);
            ctx.fillRect(x - 1, y - 5, 2, 10);
          }
        }
      }
    },
    {
      name: "Marigold Ochre",
      bgGradStart: "#452607", bgGradEnd: "#241302",
      accent: "#ffd075", textMain: "#dfd5c6", textMuted: "#a89481",
      drawPattern: (ctx) => {
        ctx.strokeStyle = "rgba(255, 208, 117, 0.04)";
        ctx.lineWidth = 1.5;
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
          ctx.beginPath();
          ctx.moveTo(250, 250);
          ctx.lineTo(250 + Math.cos(angle) * 400, 250 + Math.sin(angle) * 400);
          ctx.stroke();
        }
      }
    }
  ];

  function drawBadge() {
    if (!badgeCanvas) return;
    const ctx = badgeCanvas.getContext('2d');
    const style = BADGE_STYLES[activeStyleIndex];
    const name = (badgeNameInput ? badgeNameInput.value.trim() : "") || "Contributor";
    const role = (badgeRoleInput ? badgeRoleInput.value : "") || "Heritage Guardian";
    const village = (badgeVillageInput ? badgeVillageInput.value.trim() : "") || "Khurja";

    // Draw Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 500, 500);
    grad.addColorStop(0, style.bgGradStart);
    grad.addColorStop(1, style.bgGradEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 500, 500);

    // Draw Texture Pattern
    style.drawPattern(ctx);

    // Draw Decorative Borders
    ctx.strokeStyle = style.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 460, 460); // Outer border
    
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.strokeRect(26, 26, 448, 448); // Inner border

    // Draw Ornamental Corners
    ctx.fillStyle = style.accent;
    const cornerSize = 12;
    ctx.fillRect(15, 15, cornerSize, cornerSize);
    ctx.fillRect(473, 15, cornerSize, cornerSize);
    ctx.fillRect(15, 473, cornerSize, cornerSize);
    ctx.fillRect(473, 473, cornerSize, cornerSize);

    // Draw Header text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = style.accent;
    ctx.font = "bold 13px 'Outfit', sans-serif";
    ctx.fillText("🏛️  PARAMPARA DIGITAL ARCHIVE  🏛️", 250, 60);

    ctx.fillStyle = style.textMain;
    ctx.font = "italic 11px 'Georgia', serif";
    ctx.fillText("This credential represents a badge of honor for community support", 250, 95);

    // Draw Central emblem seal background
    ctx.beginPath();
    ctx.arc(250, 240, 90, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fill();
    ctx.strokeStyle = "rgba(212, 168, 83, 0.15)";
    ctx.stroke();

    // Draw User Name
    ctx.fillStyle = style.accent;
    ctx.font = "bold 26px 'Georgia', serif";
    ctx.fillText(name, 250, 195);

    ctx.fillStyle = style.textMain;
    ctx.font = "italic 12px 'Georgia', serif";
    ctx.fillText("is officially recognized as a", 250, 230);

    // Draw Role Banner
    ctx.fillStyle = style.accent;
    ctx.fillRect(110, 250, 280, 32); // Banner box
    ctx.fillStyle = "#1e140f"; // Dark text inside banner
    ctx.font = "bold 14px 'Outfit', sans-serif";
    ctx.fillText(role.toUpperCase(), 250, 266);

    // Draw Village Attribution
    ctx.fillStyle = style.textMain;
    ctx.font = "12px 'Outfit', sans-serif";
    ctx.fillText(`For preserving folklore & oral traditions in the region of`, 250, 310);
    ctx.fillStyle = style.accent;
    ctx.font = "bold 14px 'Outfit', sans-serif";
    ctx.fillText(village, 250, 330);

    // Draw Verification Stamp seal
    ctx.save();
    ctx.translate(390, 390);
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.strokeStyle = style.accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Inner dashed line
    ctx.beginPath();
    ctx.arc(0, 0, 33, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = style.accent;
    ctx.font = "bold 8px 'Outfit', sans-serif";
    ctx.fillText("APPROVED", 390, 385);
    ctx.font = "9px 'Outfit', sans-serif";
    ctx.fillText("PARAMPARA", 390, 395);
    ctx.fillStyle = style.textMain;
    ctx.font = "7px 'Outfit', sans-serif";
    ctx.fillText("HERITAGE SEAL", 390, 404);

    // Draw Left footer date
    ctx.textAlign = "left";
    ctx.fillStyle = style.textMuted;
    ctx.font = "9px 'Outfit', sans-serif";
    ctx.fillText("DATE GENERATED", 50, 420);
    ctx.fillStyle = style.textMain;
    ctx.font = "11px 'Outfit', sans-serif";
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    ctx.fillText(today, 50, 435);

    // Draw Right footer registration ID
    ctx.textAlign = "right";
    ctx.fillStyle = style.textMuted;
    ctx.font = "9px 'Outfit', sans-serif";
    ctx.fillText("REGISTRATION ID", 310, 420);
    ctx.fillStyle = style.textMain;
    ctx.font = "11px 'Outfit', sans-serif";

    // Generate static stable registration ID based on name hash
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const stableId = `PP-${Math.abs(hash % 900000 + 100000)}`;
    ctx.fillText(stableId, 310, 435);
  }

  // Toggle handlers for Badge modal
  const openBadgeModal = (e) => {
    e.preventDefault();
    badgeModal.classList.add('active');
    drawBadge();
  };

  const closeBadgeModal = () => {
    badgeModal.classList.remove('active');
  };

  if (navBadgeBtn) navBadgeBtn.addEventListener('click', openBadgeModal);
  if (footerBadgeBtn) footerBadgeBtn.addEventListener('click', openBadgeModal);
  if (closeBadgeBtn) closeBadgeBtn.addEventListener('click', closeBadgeModal);

  // Close on Backdrop Click
  window.addEventListener('click', (e) => {
    if (e.target === badgeModal) closeBadgeModal();
  });

  // Re-draw canvas dynamically as users type
  if (badgeNameInput) {
    badgeNameInput.addEventListener('input', drawBadge);
  }
  if (badgeRoleInput) {
    badgeRoleInput.addEventListener('change', drawBadge);
  }
  if (badgeVillageInput) {
    badgeVillageInput.addEventListener('input', drawBadge);
  }

  // Shuffle textures and background palettes
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      activeStyleIndex = (activeStyleIndex + 1) % BADGE_STYLES.length;
      drawBadge();
    });
  }

  // Download Badge canvas as high-resolution PNG
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!badgeCanvas) return;
      const name = (badgeNameInput ? badgeNameInput.value.trim() : "") || "Contributor";
      const link = document.createElement('a');
      link.download = `${name.replace(/\s+/g, '_')}_heritage_badge.png`;
      link.href = badgeCanvas.toDataURL('image/png');
      link.click();
    });
  }
});
>>>>>>> upstream/main
