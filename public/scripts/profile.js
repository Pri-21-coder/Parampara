// public/scripts/profile.js

class ProfileManager {
  constructor() {
    this.apiBase = '/api/profile';
    this.userId = this.getOrCreateUserId();
    
    // Pagination states
    this.badgePage = 1;
    this.badgeLimit = 8;
    this.badgeCategory = '';
    
    this.timelinePage = 1;
    this.timelineLimit = 5;
    
    // Cached profile details for share card
    this.profileData = null;
    this.statsData = null;
    this.badgesData = [];

    this.init();
  }

  getOrCreateUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      // Fallback matching other files
      userId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', userId);
    }
    return userId;
  }

  init() {
    this.loadProfile();
    this.loadStats();
    this.loadPassport();
    this.loadAchievements();
    this.loadBadges();
    this.loadTimeline();
    
    this.setupEventListeners();
  }

  // Get Auth headers if token is present
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Fetch basic user profile
  async loadProfile() {
    try {
      const response = await fetch(`${this.apiBase}?userId=${this.userId}`, {
        headers: this.getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        this.profileData = data.profile;
        this.renderProfile(data.profile);
      } else {
        console.error('Failed to load profile:', data.error);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  renderProfile(profile) {
    document.getElementById('avatarDisplay').textContent = profile.avatar || '🧑‍🚀';
    document.getElementById('usernameDisplay').textContent = profile.userId || 'Explorer';
    document.getElementById('rankDisplay').textContent = profile.rank || 'Novice Explorer';
    document.getElementById('joinDateDisplay').textContent = profile.joinDate || 'Loading...';
    document.getElementById('bioDisplay').textContent = profile.bio || 'No biography written yet.';
    document.getElementById('levelDisplay').textContent = profile.level || 1;
    document.getElementById('scoreDisplay').textContent = profile.points || 0;
    
    // Update progress dashboard level bar
    const pointsInCurrentLevel = profile.points % 100;
    const progressPercent = Math.min((pointsInCurrentLevel / 100) * 100, 100);
    document.getElementById('levelProgressText').textContent = `${pointsInCurrentLevel} / 100 PTS`;
    document.getElementById('levelProgressBar').style.width = `${progressPercent}%`;
  }

  // Fetch detailed statistics
  async loadStats() {
    try {
      const response = await fetch(`${this.apiBase}/stats?userId=${this.userId}`, {
        headers: this.getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        this.statsData = data.stats;
        this.renderStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  renderStats(stats) {
    document.getElementById('statVillages').textContent = stats.villagesExplored || 0;
    document.getElementById('statStories').textContent = stats.storiesListened || 0;
    document.getElementById('statCrafts').textContent = stats.craftsDiscovered || 0;
    document.getElementById('statFestivals').textContent = stats.festivalsLearned || 0;
    document.getElementById('statPaths').textContent = stats.pathsCompleted || 0;
    document.getElementById('statNature').textContent = stats.natureVisited || 0;
    document.getElementById('statArtifacts').textContent = stats.artifactsExplored || 0;
    document.getElementById('statQuests').textContent = stats.questsCompleted || 0;
    document.getElementById('statCheckins').textContent = stats.gpsCheckins || 0;
    document.getElementById('statResponsible').textContent = stats.responsibleVisits || 0;
    document.getElementById('statAIConversations').textContent = stats.aiConversations || 0;
    document.getElementById('statTime').textContent = `${stats.explorationTime || 0}m`;
    
    // Calculate diversity percentage
    const categoriesChecked = [
      stats.craftsDiscovered > 0 || stats.artifactsExplored > 0,
      stats.storiesListened > 0,
      stats.natureVisited > 0,
      stats.responsibleVisits > 0,
      stats.pathsCompleted > 0
    ];
    const diversityCount = categoriesChecked.filter(Boolean).length;
    const diversityPercentage = Math.round((diversityCount / 5) * 100);
    
    document.getElementById('diversityScoreVal').textContent = `${diversityPercentage}%`;
    document.getElementById('diversityBar').style.width = `${diversityPercentage}%`;
  }

  // Fetch Passport stamps
  async loadPassport() {
    try {
      const response = await fetch(`${this.apiBase}/passport?userId=${this.userId}`, {
        headers: this.getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        this.renderPassport(data.passport);
      }
    } catch (error) {
      console.error('Error fetching passport:', error);
    }
  }

  renderPassport(passport) {
    const stampsGrid = document.getElementById('passportStamps');
    stampsGrid.innerHTML = '';
    
    const villages = passport.visitedVillages || [];
    
    if (villages.length === 0) {
      stampsGrid.innerHTML = '<div class="passport-stamp-empty">No stamps yet. Check-in or explore villages!</div>';
    } else {
      // Map region names to icons
      const regionIcons = {
        'West Bengal': '🧵',
        'Bihar': '🌾',
        'Chhattisgarh': '🔥',
        'Rajasthan': '🎭',
        'Uttar Pradesh': '🏺',
        'General': '🏛️'
      };
      
      villages.forEach(v => {
        const stamp = document.createElement('div');
        stamp.className = 'passport-stamp';
        stamp.textContent = regionIcons[v.region] || '🏛️';
        stamp.setAttribute('data-label', v.name.split(',')[0]);
        stamp.setAttribute('title', `Checked-in at ${v.name} on ${new Date(v.timestamp).toLocaleDateString()}`);
        stampsGrid.appendChild(stamp);
      });
    }
    
    document.getElementById('passportSummaryText').textContent = passport.journeySummary;
    document.getElementById('passportVillagesCount').textContent = villages.length;
    document.getElementById('passportRegionsCount').textContent = (passport.regionsExplored || []).length;
  }

  // Fetch Milestones
  async loadAchievements() {
    try {
      const response = await fetch(`${this.apiBase}/achievements?userId=${this.userId}`, {
        headers: this.getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        this.renderMilestones(data.achievements);
      }
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  }

  renderMilestones(milestones) {
    const listGrid = document.getElementById('milestonesList');
    listGrid.innerHTML = '';
    
    // Find next locked milestone
    const nextLocked = milestones.find(m => !m.isUnlocked);
    if (nextLocked) {
      document.getElementById('nextMilestoneName').textContent = nextLocked.name;
      document.getElementById('nextMilestoneDesc').textContent = nextLocked.description;
    } else {
      document.getElementById('nextMilestoneName').textContent = 'All Completed! 🎉';
      document.getElementById('nextMilestoneDesc').textContent = 'You are a Cultural Ambassador!';
    }
    
    milestones.forEach(m => {
      const item = document.createElement('div');
      item.className = `milestone-item ${m.isUnlocked ? 'unlocked' : ''}`;
      
      item.innerHTML = `
        <div class="milestone-checkbox">
          <i class="ti ti-check"></i>
        </div>
        <span class="milestone-icon">${m.icon}</span>
        <div class="milestone-info">
          <h4>${m.name}</h4>
          <p>${m.description}</p>
        </div>
      `;
      
      listGrid.appendChild(item);
    });
  }

  // Fetch Badges Showcase
  async loadBadges() {
    try {
      const url = `${this.apiBase}/badges?userId=${this.userId}&page=${this.badgePage}&limit=${this.badgeLimit}&category=${this.badgeCategory}`;
      const response = await fetch(url, { headers: this.getHeaders() });
      const data = await response.json();
      
      if (data.success) {
        this.badgesData = data.badges;
        this.renderBadges(data.badges);
        this.renderBadgesPagination(data.page, data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  }

  renderBadges(badges) {
    const badgesGrid = document.getElementById('badgesGrid');
    badgesGrid.innerHTML = '';
    
    if (badges.length === 0) {
      badgesGrid.innerHTML = '<div class="timeline-empty" style="grid-column: 1/-1;">No badges found in this category.</div>';
      return;
    }
    
    badges.forEach(badge => {
      const card = document.createElement('div');
      card.className = `badge-card ${badge.isEarned ? 'earned' : 'locked'}`;
      
      let badgeFooter = '';
      if (badge.isEarned) {
        const dateStr = badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : 'N/A';
        badgeFooter = `<span class="badge-unlocked-date">Unlocked: ${dateStr}</span>`;
      } else {
        badgeFooter = `
          <div class="badge-card-progress">
            <div class="progress-bar-wrapper">
              <div class="progress-bar-fill" style="width: ${badge.progress}%"></div>
            </div>
            <span class="badge-progress-text">${badge.progress}% Progress</span>
          </div>
        `;
      }
      
      card.innerHTML = `
        <div class="badge-icon-lg">
          ${badge.icon}
          ${!badge.isEarned ? '<div class="badge-lock-overlay"><i class="ti ti-lock"></i></div>' : ''}
        </div>
        <h4>${badge.name}</h4>
        <p>${badge.description}</p>
        ${badgeFooter}
      `;
      
      badgesGrid.appendChild(card);
    });
  }

  renderBadgesPagination(currentPage, totalPages) {
    const container = document.getElementById('badgesPagination');
    container.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.disabled = currentPage === 1;
    prevBtn.innerHTML = '<i class="ti ti-chevron-left"></i> Previous';
    prevBtn.addEventListener('click', () => {
      this.badgePage--;
      this.loadBadges();
    });
    
    const info = document.createElement('span');
    info.className = 'page-info-label';
    info.textContent = `Page ${currentPage} of ${totalPages}`;
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.innerHTML = 'Next <i class="ti ti-chevron-right"></i>';
    nextBtn.addEventListener('click', () => {
      this.badgePage++;
      this.loadBadges();
    });
    
    container.appendChild(prevBtn);
    container.appendChild(info);
    container.appendChild(nextBtn);
  }

  // Fetch Timeline logs
  async loadTimeline() {
    try {
      const region = document.getElementById('filterRegion').value;
      const category = document.getElementById('filterCategory').value;
      const startDate = document.getElementById('filterStartDate').value;
      const endDate = document.getElementById('filterEndDate').value;
      
      let url = `${this.apiBase}/timeline?userId=${this.userId}&page=${this.timelinePage}&limit=${this.timelineLimit}`;
      if (region) url += `&region=${encodeURIComponent(region)}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const response = await fetch(url, { headers: this.getHeaders() });
      const data = await response.json();
      
      if (data.success) {
        this.renderTimeline(data.timeline);
        this.renderTimelinePagination(data.page, data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
    }
  }

  renderTimeline(logs) {
    const wrapper = document.getElementById('timelineWrapper');
    wrapper.innerHTML = '';
    
    if (logs.length === 0) {
      wrapper.innerHTML = '<div class="timeline-empty">No activity records match your filter criteria.</div>';
      return;
    }
    
    logs.forEach(log => {
      const node = document.createElement('div');
      node.className = 'timeline-node';
      
      const dateStr = new Date(log.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const meta = log.metadata || {};
      const region = meta.region || 'General';
      const category = meta.category || log.type || 'General';
      
      node.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-header">
          <h4>${log.title}</h4>
          <span class="timeline-date">${dateStr}</span>
        </div>
        <p class="timeline-desc">${log.description}</p>
        <div class="timeline-tags">
          <span class="timeline-tag">${region}</span>
          <span class="timeline-tag">${category}</span>
        </div>
      `;
      
      wrapper.appendChild(node);
    });
  }

  renderTimelinePagination(currentPage, totalPages) {
    const container = document.getElementById('timelinePagination');
    container.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.disabled = currentPage === 1;
    prevBtn.innerHTML = '<i class="ti ti-chevron-left"></i> Previous';
    prevBtn.addEventListener('click', () => {
      this.timelinePage--;
      this.loadTimeline();
    });
    
    const info = document.createElement('span');
    info.className = 'page-info-label';
    info.textContent = `Page ${currentPage} of ${totalPages}`;
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.innerHTML = 'Next <i class="ti ti-chevron-right"></i>';
    nextBtn.addEventListener('click', () => {
      this.timelinePage++;
      this.loadTimeline();
    });
    
    container.appendChild(prevBtn);
    container.appendChild(info);
    container.appendChild(nextBtn);
  }

  setupEventListeners() {
    // Biography update modal trigger
    const editBioBtn = document.getElementById('btnEditBio');
    const editBioModal = document.getElementById('editBioModal');
    const closeBioModal = document.getElementById('closeBioModal');
    const bioForm = document.getElementById('bioForm');
    const bioInput = document.getElementById('bioInput');
    const bioCounter = document.getElementById('bioCharCounter');
    
    editBioBtn.addEventListener('click', () => {
      bioInput.value = this.profileData ? this.profileData.bio || '' : '';
      bioCounter.textContent = `${bioInput.value.length} / 400`;
      editBioModal.classList.add('active');
      bioInput.focus();
    });
    
    closeBioModal.addEventListener('click', () => {
      editBioModal.classList.remove('active');
    });
    
    bioInput.addEventListener('input', () => {
      bioCounter.textContent = `${bioInput.value.length} / 400`;
    });
    
    bioForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(this.apiBase, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ userId: this.userId, bio: bioInput.value })
        });
        const data = await response.json();
        if (data.success) {
          editBioModal.classList.remove('active');
          this.loadProfile();
        } else {
          alert('Failed to update bio: ' + data.error);
        }
      } catch (err) {
        console.error('Error updating bio:', err);
      }
    });

    // Avatar update modal trigger
    const editAvatarBtn = document.getElementById('btnEditAvatar');
    const editAvatarModal = document.getElementById('editAvatarModal');
    const closeAvatarModal = document.getElementById('closeAvatarModal');
    const avatarOptions = document.getElementById('avatarOptions');
    const customAvatarInput = document.getElementById('customAvatarInput');
    const btnSaveCustomAvatar = document.getElementById('btnSaveCustomAvatar');
    
    editAvatarBtn.addEventListener('click', () => {
      editAvatarModal.classList.add('active');
    });
    
    closeAvatarModal.addEventListener('click', () => {
      editAvatarModal.classList.remove('active');
    });
    
    avatarOptions.addEventListener('click', async (e) => {
      const btn = e.target.closest('.avatar-option-item');
      if (!btn) return;
      const emoji = btn.textContent;
      await this.saveAvatar(emoji);
      editAvatarModal.classList.remove('active');
    });
    
    btnSaveCustomAvatar.addEventListener('click', async () => {
      const val = customAvatarInput.value.trim();
      if (!val) return;
      await this.saveAvatar(val);
      customAvatarInput.value = '';
      editAvatarModal.classList.remove('active');
    });

    // Badge Category Filters
    document.querySelectorAll('[data-badge-cat]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-badge-cat]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.badgeCategory = e.target.getAttribute('data-badge-cat');
        this.badgePage = 1;
        this.loadBadges();
      });
    });

    // Timeline Filter triggers
    document.getElementById('filterRegion').addEventListener('change', () => {
      this.timelinePage = 1;
      this.loadTimeline();
    });
    document.getElementById('filterCategory').addEventListener('change', () => {
      this.timelinePage = 1;
      this.loadTimeline();
    });
    document.getElementById('filterStartDate').addEventListener('change', () => {
      this.timelinePage = 1;
      this.loadTimeline();
    });
    document.getElementById('filterEndDate').addEventListener('change', () => {
      this.timelinePage = 1;
      this.loadTimeline();
    });
    
    document.getElementById('btnResetFilters').addEventListener('click', () => {
      document.getElementById('filterRegion').value = '';
      document.getElementById('filterCategory').value = '';
      document.getElementById('filterStartDate').value = '';
      document.getElementById('filterEndDate').value = '';
      this.timelinePage = 1;
      this.loadTimeline();
    });

    // Share Explorer Card Canvas Generator
    document.getElementById('btnGenerateCard').addEventListener('click', () => {
      this.drawShareCard();
    });
    
    document.getElementById('btnDownloadCard').addEventListener('click', () => {
      this.downloadShareCard();
    });
  }

  async saveAvatar(emoji) {
    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ userId: this.userId, avatar: emoji })
      });
      const data = await response.json();
      if (data.success) {
        this.loadProfile();
      } else {
        alert('Failed to update avatar: ' + data.error);
      }
    } catch (err) {
      console.error('Error saving avatar:', err);
    }
  }

  // Draw customized share card to canvas
  drawShareCard() {
    const canvas = document.getElementById('shareCardCanvas');
    const ctx = canvas.getContext('2d');
    const theme = document.getElementById('shareCardBackground').value;
    
    if (!this.profileData) return;
    
    const avatar = this.profileData.avatar || '🧑‍🚀';
    const name = this.profileData.userId || 'Explorer';
    const rank = this.profileData.rank || 'Novice Explorer';
    const level = this.profileData.level || 1;
    const score = this.profileData.points || 0;
    const joinDate = this.profileData.joinDate || 'N/A';
    
    const villages = this.statsData ? this.statsData.villagesExplored || 0 : 0;
    const badgesCount = this.profileData.points ? Math.floor(this.profileData.points / 15) : 0; // estimate or actual
    
    // 1. Setup Theme Gradient
    let grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (theme === 'terracotta') {
      grad.addColorStop(0, '#5a2312');
      grad.addColorStop(1, '#35150a');
      ctx.strokeStyle = '#d4a853';
    } else if (theme === 'marigold') {
      grad.addColorStop(0, '#8b6508');
      grad.addColorStop(1, '#4a3605');
      ctx.strokeStyle = '#fdd835';
    } else if (theme === 'peacock') {
      grad.addColorStop(0, '#0d3c3b');
      grad.addColorStop(1, '#062120');
      ctx.strokeStyle = '#00acc1';
    } else { // charcoal
      grad.addColorStop(0, '#2e2621');
      grad.addColorStop(1, '#1b1411');
      ctx.strokeStyle = '#a8988a';
    }
    
    // Fill background
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Card Border
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
    
    // Inner dashed accent border
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);
    ctx.setLineDash([]); // Reset
    
    // 2. Draw Text and Info
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 13px 'Outfit', sans-serif";
    ctx.fillText('PARAMPARA HERITAGE EXPLORER CARD', 40, 45);
    
    // Brand Watermark Icon (Top Right)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = '28px sans-serif';
    ctx.fillText('🏛️', canvas.width - 70, 52);
    
    // Horizontal separator
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(35, 62);
    ctx.lineTo(canvas.width - 35, 62);
    ctx.stroke();
    
    // Avatar (Left column)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(90, 145, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ctx.strokeStyle;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw avatar emoji
    ctx.font = '50px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(avatar, 90, 142);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic'; // Reset
    
    // User details (Right of avatar)
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 20px 'Outfit', 'Georgia', serif";
    ctx.fillText(name, 160, 125);
    
    // Rank Box
    ctx.fillStyle = 'rgba(212, 168, 83, 0.15)';
    const rankWidth = ctx.measureText(rank).width + 20;
    ctx.fillRect(160, 137, rankWidth, 22);
    ctx.strokeStyle = 'rgba(212, 168, 83, 0.4)';
    ctx.strokeRect(160, 137, rankWidth, 22);
    
    ctx.fillStyle = '#d4a853';
    ctx.font = "bold 10px 'Outfit', sans-serif";
    ctx.fillText(rank, 170, 152);
    
    // Join Date
    ctx.fillStyle = '#a8988a';
    ctx.font = "10px sans-serif";
    ctx.fillText(`Joined on ${joinDate}`, 160, 178);
    
    // Bottom Metrics Area
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(35, 205);
    ctx.lineTo(canvas.width - 35, 205);
    ctx.stroke();
    
    // Metrics 1: Level
    ctx.fillStyle = '#ffffff';
    ctx.font = "10px sans-serif";
    ctx.fillText('LEVEL', 45, 235);
    ctx.fillStyle = '#d4a853';
    ctx.font = "bold 22px 'Outfit', sans-serif";
    ctx.fillText(level.toString(), 45, 262);
    
    // Metrics 2: Total PTS
    ctx.fillStyle = '#ffffff';
    ctx.font = "10px sans-serif";
    ctx.fillText('EXPLORATION SCORE', 150, 235);
    ctx.fillStyle = '#d4a853';
    ctx.font = "bold 22px 'Outfit', sans-serif";
    ctx.fillText(`${score} PTS`, 150, 262);
    
    // Metrics 3: Villages
    ctx.fillStyle = '#ffffff';
    ctx.font = "10px sans-serif";
    ctx.fillText('VILLAGES EXPLORED', 345, 235);
    ctx.fillStyle = '#d4a853';
    ctx.font = "bold 22px 'Outfit', sans-serif";
    ctx.fillText(villages.toString(), 345, 262);
    
    // Top Badges Emojis (Bottom Right)
    ctx.fillStyle = '#ffffff';
    ctx.font = "10px sans-serif";
    ctx.fillText('TOP BADGES', 485, 235);
    
    // Render top 3 earned badges emojis if available, else default placeholders
    ctx.font = '28px sans-serif';
    const topBadges = this.badgesData.slice(0, 3);
    const badgesEmojis = topBadges.map(b => b.icon);
    while (badgesEmojis.length < 3) {
      badgesEmojis.push('🎖️');
    }
    ctx.fillText(badgesEmojis[0], 480, 265);
    ctx.fillText(badgesEmojis[1], 513, 265);
    ctx.fillText(badgesEmojis[2], 546, 265);
    
    // Bottom brand credentials
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = "9px sans-serif";
    ctx.fillText('🏛️ parampara.digitalarchive', 40, 310);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = "9px sans-serif";
    ctx.fillText('QR VERIFIED PLATFORM CREDENTIAL', canvas.width - 240, 310);
    
    // Show download button
    document.getElementById('btnDownloadCard').style.display = 'inline-block';
  }

  downloadShareCard() {
    const canvas = document.getElementById('shareCardCanvas');
    const link = document.createElement('a');
    link.download = `Parampara_Explorer_Card_${this.userId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

// Initialise on load
document.addEventListener('DOMContentLoaded', () => {
  new ProfileManager();
});
