// challenges.js - Handles loading data, rendering UI, filters, and progress tracking for Heritage Conservation Challenges

(() => {
  // --- State ---
  let challenges = [];
  let badges = [];
  let campaigns = [];
  let leaderboard = [];

  const STORAGE_KEY = 'parampara_challenges_progress';

  // Load persisted progress or initialise empty object
  const loadProgress = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  };

  const saveProgress = (progress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  };

  // --- Helper utilities ---
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const createElement = (tag, className, attrs = {}) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };

  const formatNumber = (num) => new Intl.NumberFormat().format(num);

  // --- Data loading ---
  async function loadData() {
    try {
      const [chRes, badgeRes, campRes, leadRes] = await Promise.all([
        fetch('/data/challenges.json'),
        fetch('/data/badges.json'),
        fetch('/data/campaigns.json'),
        fetch('/data/leaderboard.json'),
      ]);
      challenges = await chRes.json();
      badges = await badgeRes.json();
      campaigns = await campRes.json();
      leaderboard = await leadRes.json();

      // Merge persisted progress
      const progress = loadProgress();
      challenges = challenges.map((c) => ({
        ...c,
        status: progress[c.id]?.status || c.status,
        progress: progress[c.id]?.progress ?? c.progress,
      }));
    } catch (e) {
      console.error('Failed to load challenge data:', e);
    }
  }

  // --- Rendering functions ---
  function renderDashboard() {
    const container = $('#dashboard');
    if (!container) return;
    const total = challenges.length;
    const completed = challenges.filter((c) => c.status === 'completed').length;
    const inProgress = challenges.filter(
      (c) => c.status === 'in-progress'
    ).length;
    const pointsEarned = challenges.reduce(
      (sum, c) => (c.status === 'completed' ? sum + c.rewardPoints : sum),
      0
    );
    const earnedBadges = badges.filter((b) => {
      // badge unlocked if any challenge with matching badge id is completed
      return challenges.some(
        (c) => c.badge && c.badge === b.name && c.status === 'completed'
      );
    });
    const completionPerc = total ? Math.round((completed / total) * 100) : 0;

    const widgetHTML = `
      <div class="widget" aria-label="Total challenges"><strong>${formatNumber(total)}</strong><span>Total Challenges</span></div>
      <div class="widget" aria-label="Completed challenges"><strong>${formatNumber(completed)}</strong><span>Completed</span></div>
      <div class="widget" aria-label="In‑progress challenges"><strong>${formatNumber(inProgress)}</strong><span>In Progress</span></div>
      <div class="widget" aria-label="Points earned"><strong>${formatNumber(pointsEarned)}</strong><span>Points Earned</span></div>
      <div class="widget" aria-label="Badges earned"><strong>${formatNumber(earnedBadges.length)}</strong><span>Badges Earned</span></div>
      <div class="widget" aria-label="Completion percentage"><strong>${completionPerc}%</strong><span>Completed</span></div>
    `;
    container.innerHTML = widgetHTML;
  }

  function renderFilters() {
    const container = $('#filters');
    if (!container) return;
    const categories = [...new Set(challenges.map((c) => c.category))].sort();
    const difficulties = [
      ...new Set(challenges.map((c) => c.difficulty)),
    ].sort();
    const html = `
      <input type="search" id="searchInput" placeholder="Search challenges" aria-label="Search challenges" />
      <select id="categoryFilter" aria-label="Filter by category">
        <option value="">All Categories</option>
        ${categories.map((cat) => `<option value="${cat}">${cat}</option>`).join('')}
      </select>
      <select id="difficultyFilter" aria-label="Filter by difficulty">
        <option value="">All Difficulties</option>
        ${difficulties.map((diff) => `<option value="${diff}">${diff}</option>`).join('')}
      </select>
      <select id="statusFilter" aria-label="Filter by status">
        <option value="">All Statuses</option>
        <option value="not-started">Not Started</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <select id="sortSelect" aria-label="Sort challenges">
        <option value="newest">Newest</option>
        <option value="pointsDesc">Highest Points</option>
        <option value="difficultyAsc">Difficulty (Easy‑to‑Hard)</option>
      </select>
    `;
    container.innerHTML = html;

    // Attach event listeners
    $('#searchInput').addEventListener('input', applyFilters);
    $('#categoryFilter').addEventListener('change', applyFilters);
    $('#difficultyFilter').addEventListener('change', applyFilters);
    $('#statusFilter').addEventListener('change', applyFilters);
    $('#sortSelect').addEventListener('change', applyFilters);
  }

  function applyFilters() {
    const search = $('#searchInput').value.trim().toLowerCase();
    const category = $('#categoryFilter').value;
    const difficulty = $('#difficultyFilter').value;
    const status = $('#statusFilter').value;
    const sort = $('#sortSelect').value;

    let filtered = challenges.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search);
      const matchesCat = category ? c.category === category : true;
      const matchesDiff = difficulty ? c.difficulty === difficulty : true;
      const matchesStatus = status ? c.status === status : true;
      return matchesSearch && matchesCat && matchesDiff && matchesStatus;
    });

    // Sorting
    if (sort === 'newest') {
      filtered = filtered.sort((a, b) => b.id.localeCompare(a.id)); // simplistic newest by id
    } else if (sort === 'pointsDesc') {
      filtered = filtered.sort((a, b) => b.rewardPoints - a.rewardPoints);
    } else if (sort === 'difficultyAsc') {
      const order = { Easy: 1, Medium: 2, Hard: 3 };
      filtered = filtered.sort(
        (a, b) => (order[a.difficulty] || 4) - (order[b.difficulty] || 4)
      );
    }

    renderChallenges(filtered);
  }

  function renderChallenges(list = challenges) {
    const container = $('#challengeList');
    if (!container) return;
    if (list.length === 0) {
      container.innerHTML = '<p>No challenges match the selected filters.</p>';
      return;
    }
    const cards = list
      .map((c) => {
        const progressBar =
          c.status !== 'not-started'
            ? `
        <div class="progress-bar" aria-label="Progress ${c.progress}%">
          <div class="filled" style="width:${c.progress}%"></div>
        </div>
      `
            : '';
        const btnLabel =
          c.status === 'completed'
            ? 'Completed'
            : c.status === 'in-progress'
              ? 'Continue'
              : 'Start';
        const btnDisabled = c.status === 'completed';
        return `
        <div class="challenge-card" data-id="${c.id}">
          <h3>${c.title}</h3>
          <div class="category">${c.category}</div>
          <p class="description">${c.description}</p>
          <div class="meta">
            <span>Difficulty: ${c.difficulty}</span> •
            <span>Time: ${c.estimatedTime}</span> •
            <span>Points: ${c.rewardPoints}</span>
          </div>
          ${progressBar}
          <div class="actions">
            <button class="start-btn" ${btnDisabled ? 'disabled' : ''} aria-label="${btnLabel} challenge ${c.title}" data-id="${c.id}">${btnLabel}</button>
          </div>
        </div>
      `;
      })
      .join('');
    container.innerHTML = cards;
    $$('.start-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        window.Challenges.startChallenge(e.target.dataset.id);
      });
    });
  }

  function renderBadges() {
    const container = $('#badgeSection');
    if (!container) return;
    const earned = badges.filter((b) => {
      return challenges.some(
        (c) => c.badge === b.name && c.status === 'completed'
      );
    });
    if (earned.length === 0) {
      container.innerHTML = '<p>No badges earned yet.</p>';
      return;
    }
    const cards = earned
      .map(
        (b) => `
      <div class="badge-card" aria-label="Badge ${b.name}">
        <img src="${b.icon}" alt="${b.name}" />
        <div>${b.name}</div>
      </div>
    `
      )
      .join('');
    container.innerHTML = cards;
  }

  function renderLeaderboard() {
    const container = $('#leaderboardSection');
    if (!container) return;
    const rows = leaderboard
      .map(
        (row) => `
      <tr>
        <td>${row.rank}</td>
        <td>${row.name}</td>
        <td>${row.completedChallenges}</td>
        <td>${row.points}</td>
        <td>${row.badges.map((id) => badges.find((b) => b.id === id)?.name || id).join(', ')}</td>
      </tr>
    `
      )
      .join('');
    const table = `
      <h2>Community Leaderboard</h2>
      <table aria-label="Leaderboard">
        <thead>
          <tr><th>Rank</th><th>Name</th><th>Completed</th><th>Points</th><th>Badges</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    container.innerHTML = table;
  }

  function renderCampaigns() {
    const container = $('#campaignSection');
    if (!container) return;
    const cards = campaigns
      .map(
        (c) => `
      <div class="campaign-card" aria-label="Campaign ${c.title}">
        <h3>${c.title}</h3>
        <p>${c.description}</p>
        <p><strong>Location:</strong> ${c.location}</p>
        <p><strong>Duration:</strong> ${c.duration}</p>
        <p><strong>Participants:</strong> ${c.participants}</p>
      </div>
    `
      )
      .join('');
    container.innerHTML = `<h2>Regional Campaigns</h2>${cards}`;
  }

  function renderCertificateIfEligible() {
    const completedCount = challenges.filter(
      (c) => c.status === 'completed'
    ).length;
    if (completedCount >= 5) {
      // threshold for eligibility
      const modal = $('#certificateModal');
      if (!modal) return;
      modal.classList.add('modal', 'active');
      modal.innerHTML = `
        <div class="content" role="dialog" aria-modal="true">
          <h2>Congratulations!</h2>
          <p>You are eligible for a Heritage Volunteer Certificate.</p>
          <button onclick="window.Challenges.closeCertificate()">Close</button>
        </div>
      `;
    }
  }

  // Expose actions to global for inline onclick (simpler for vanilla setup)
  window.Challenges = {
    startChallenge(id) {
      const prog = loadProgress();
      const ch = challenges.find((c) => c.id === id);
      if (!ch) return;
      if (ch.status === 'not-started') {
        ch.status = 'in-progress';
        ch.progress = 0;
      }
      // For demo purposes, increment progress by 25% each click until complete
      if (ch.status === 'in-progress') {
        ch.progress = Math.min(100, ch.progress + 25);
        if (ch.progress >= 100) {
          ch.status = 'completed';
          ch.progress = 100;
        }
      }
      // Persist only changed fields
      prog[id] = { status: ch.status, progress: ch.progress };
      saveProgress(prog);
      // Re‑render affected sections
      renderDashboard();
      renderBadges();
      renderChallenges();
      renderCertificateIfEligible();
    },
    closeCertificate() {
      const modal = $('#certificateModal');
      if (modal) modal.classList.remove('active');
    },
  };

  // --- Initialise ---
  document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    renderDashboard();
    renderFilters();
    renderChallenges();
    renderBadges();
    renderLeaderboard();
    renderCampaigns();
    renderCertificateIfEligible();
  });
})();
