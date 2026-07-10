// public/scripts/artisan-profile.js

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const artisanId = urlParams.get('id');
  
  if (!artisanId) {
    renderErrorState('No Artisan Selected', 'Please select an artisan from the directory to view their profile.');
    return;
  }
  loadArtisan(artisanId);
});

async function loadArtisan(id) {
  try {
    const res = await fetch(`/api/artisans/${id}`);
    if (!res.ok) throw new Error('Network response was not ok');
    const artisanData = await res.json();
    renderArtisanProfile(artisanData);
  } catch (err) {
    console.error('Failed to load artisan profile:', err);
    renderErrorState('Profile Not Found', "We couldn't load the profile for this artisan. They may have been removed or the link is invalid.");
  }
}

function renderErrorState(title, message) {
  const container = document.getElementById('artisan-profile');
  if (container) {
    container.innerHTML = `
      <div style="background:var(--card-bg); padding:4rem 2rem; border-radius:var(--border-radius-lg); text-align:center; box-shadow:var(--shadow-sm); margin-top:2rem;">
        <div style="font-size:4rem; margin-bottom:1rem;">🧑‍🎨</div>
        <h2 style="color:var(--primary-color); font-size:var(--font-xl); margin-bottom:1rem; font-family:'Merriweather', serif;">${title}</h2>
        <p style="color:var(--text-color); margin-bottom:2rem; font-size:var(--font-md);">${message}</p>
        <a href="artisans.html" class="btn-primary" style="text-decoration:none;">Return to Directory</a>
      </div>
    `;
  }
}

function renderArtisanProfile(artisan) {
  const { 
    name, craft, village, district, region, 
    experienceYears, biography, portfolio, 
    showContact, contactInfo, recognitionLevel, 
    relatedContent, profileImage, relatedArtisans 
  } = artisan;

  // 1. Render Hero Section
  document.querySelector('.artisan-header-content').innerHTML = `
    <div class="artisan-avatar-container">
      <img src="${profileImage || 'https://via.placeholder.com/300'}" alt="${name}" loading="lazy" />
    </div>
    <div class="artisan-info">
      <h1>${name}</h1>
      <div class="artisan-meta">
        <div class="meta-item"><i class="ti ti-tools"></i> <span>${craft}</span></div>
        <div class="meta-item"><i class="ti ti-map-pin"></i> <span>${village}, ${region}</span></div>
        <div class="meta-item"><i class="ti ti-medal"></i> <span>${recognitionLevel}</span></div>
      </div>
      <div class="artisan-actions">
        ${showContact ? `<button class="btn-primary" onclick="alert('Contact feature coming soon!')"><i class="ti ti-mail"></i> Collaborate</button>` : ''}
        <button class="btn-primary" style="background:var(--card-bg); color:var(--primary-color); border:1px solid var(--primary-color);"><i class="ti ti-share"></i> Share Profile</button>
      </div>
    </div>
  `;

  // 2. Render Stats
  document.getElementById('artisanStats').innerHTML = `
    <div class="stat-box">
      <span class="stat-value">${portfolio ? portfolio.length : 0}</span>
      <span class="stat-label">Contributions</span>
    </div>
    <div class="stat-box">
      <span class="stat-value">${experienceYears || 0}+</span>
      <span class="stat-label">Years Exp.</span>
    </div>
  `;

  // 3. Render Biography
  document.querySelector('.bio-content').innerHTML = `
    <p>${biography || 'Biography coming soon.'}</p>
    ${relatedContent && relatedContent.length ? `
      <h3 style="color:var(--primary-color); font-size:1.1rem; margin-top:1.5rem;">Associated Content</h3>
      <ul style="color:var(--text-color); padding-left:1.5rem; margin-top:0.5rem;">
        ${relatedContent.map(item => `<li>${item}</li>`).join('')}
      </ul>
    ` : ''}
  `;

  // 4. Render Contact (if available)
  const contactSection = document.getElementById('contactInfo');
  if (showContact && contactInfo) {
    contactSection.style.display = 'block';
    contactSection.innerHTML = `
      <h2 style="font-size:var(--font-xl); color:var(--primary-color); margin-top:0; margin-bottom:1rem; font-family:'Merriweather', serif;">Contact</h2>
      ${contactInfo.email ? `<p><strong>Email:</strong> <a href="mailto:${contactInfo.email}" style="color:var(--accent-color);">${contactInfo.email}</a></p>` : ''}
      ${contactInfo.phone ? `<p><strong>Phone:</strong> ${contactInfo.phone}</p>` : ''}
    `;
  }

  // 5. Render Portfolio Grid
  const portfolioGrid = document.getElementById('portfolioGrid');
  if (portfolio && portfolio.length > 0) {
    portfolioGrid.innerHTML = portfolio.map(item => `
      <div class="portfolio-item" onclick="window.location.href='gallery.html?item=${item.id}'">
        <!-- Placeholder image, ideally culturalItem would have imageUrls -->
        <img src="https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=400" alt="${item.title}" loading="lazy" />
        <div class="portfolio-overlay">
          <h4>${item.title}</h4>
          <span>${item.type || 'Cultural Artifact'}</span>
        </div>
      </div>
    `).join('');
  } else {
    portfolioGrid.innerHTML = `<p style="grid-column: 1 / -1; color:var(--text-light);">No cultural contributions mapped to this artisan yet.</p>`;
  }

  // 6. Render Related Artisans
  const relatedSection = document.getElementById('relatedContent');
  const relatedList = document.getElementById('relatedList');
  if (relatedArtisans && relatedArtisans.length > 0) {
    relatedSection.style.display = 'block';
    relatedList.innerHTML = relatedArtisans.map(a => `
      <a href="artisan-profile.html?id=${a.id}" class="related-artisan-card">
        <img src="${a.profileImage || 'https://via.placeholder.com/100'}" alt="${a.name}" loading="lazy" />
        <h4>${a.name}</h4>
        <span>${a.craft}</span>
      </a>
    `).join('');
  }
}
