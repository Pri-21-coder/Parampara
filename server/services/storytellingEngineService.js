// services/storytellingEngineService.js
const { v4: uuidv4 } = require('uuid');
const store = require('../../data/store');

class StorytellingEngineService {
  constructor() {
    this.stories = [];
    this.branches = new Map();
    this.userChoices = new Map();
    this.generatedStories = [];
    this.templates = [];
    this.storyThemes = [];
    this.engagementData = new Map();
    
    this.init();
  }

  init() {
    this.loadStoryThemes();
    this.loadTemplates();
    this.loadSampleStories();
    console.log('✅ Storytelling Engine Service initialized');
  }

  loadStoryThemes() {
    this.storyThemes = [
      { id: 'theme_1', name: 'Folklore', description: 'Traditional folk tales and legends' },
      { id: 'theme_2', name: 'Mythology', description: 'Mythological stories and epics' },
      { id: 'theme_3', name: 'Historical', description: 'Historical events and figures' },
      { id: 'theme_4', name: 'Cultural', description: 'Cultural traditions and practices' },
      { id: 'theme_5', name: 'Adventure', description: 'Adventurous journeys and quests' },
      { id: 'theme_6', name: 'Romance', description: 'Love stories and relationships' },
      { id: 'theme_7', name: 'Mystery', description: 'Mysterious events and discoveries' },
      { id: 'theme_8', name: 'Spiritual', description: 'Spiritual and philosophical tales' },
      { id: 'theme_9', name: 'Comedy', description: 'Humorous stories and anecdotes' },
      { id: 'theme_10', name: 'Educational', description: 'Educational and moral stories' }
    ];
  }

  loadTemplates() {
    this.templates = [
      {
        id: 'template_1',
        name: 'Hero\'s Journey',
        structure: ['introduction', 'call_to_adventure', 'challenge', 'mentor', 'trials', 'transformation', 'return'],
        description: 'Classic hero\'s journey narrative structure'
      },
      {
        id: 'template_2',
        name: 'Folklore Tale',
        structure: ['setting', 'character_intro', 'incident', 'journey', 'conflict', 'resolution', 'lesson'],
        description: 'Traditional folklore storytelling structure'
      },
      {
        id: 'template_3',
        name: 'Cultural Narrative',
        structure: ['context', 'tradition', 'practice', 'significance', 'modern_connection', 'preservation'],
        description: 'Cultural heritage storytelling structure'
      }
    ];
  }

  loadSampleStories() {
    this.stories = [
      {
        id: 'story_1',
        title: 'The Legend of the Lost Temple',
        theme: 'mythology',
        description: 'A mysterious temple hidden in the forest holds ancient secrets',
        content: {
          introduction: 'In a remote village nestled in the mountains, there was a legend...',
          branches: [
            {
              id: 'branch_1',
              text: 'Explore the temple ruins',
              nextBranch: 'branch_2',
              choices: []
            },
            {
              id: 'branch_2',
              text: 'The ancient guardian appears',
              nextBranch: 'branch_3',
              choices: [
                { id: 'choice_1', text: 'Ask about the temple\'s secret', nextBranch: 'branch_4' },
                { id: 'choice_2', text: 'Offer a gift', nextBranch: 'branch_5' }
              ]
            }
          ]
        },
        createdBy: 'system',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        totalReads: 150,
        averageRating: 4.8,
        completionRate: 0.75,
        tags: ['mythology', 'temple', 'legend']
      },
      {
        id: 'story_2',
        title: 'The Weaver\'s Secret',
        theme: 'cultural',
        description: 'A master weaver discovers the secret to creating magical fabrics',
        content: {
          introduction: 'In a small village known for its weaving traditions...',
          branches: [
            {
              id: 'branch_1',
              text: 'Learn the weaving technique',
              nextBranch: 'branch_2',
              choices: []
            },
            {
              id: 'branch_2',
              text: 'The magical loom appears',
              nextBranch: 'branch_3',
              choices: [
                { id: 'choice_1', text: 'Weave a masterpiece', nextBranch: 'branch_4' },
                { id: 'choice_2', text: 'Share the secret', nextBranch: 'branch_5' }
              ]
            }
          ]
        },
        createdBy: 'system',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        totalReads: 120,
        averageRating: 4.7,
        completionRate: 0.80,
        tags: ['weaving', 'craft', 'tradition']
      }
    ];
  }

  /**
   * Generate story using AI
   */
  async generateStory(prompt, theme = 'folklore', style = 'narrative') {
    console.log(`📖 Generating story with prompt: ${prompt}`);

    // In production: use actual AI API (OpenAI, Claude, etc.)
    // For now: simulate AI generation with template-based approach

    const story = {
      id: `story_${Date.now()}_${uuidv4().slice(0, 8)}`,
      title: this.generateTitle(prompt, theme),
      theme: theme,
      description: this.generateDescription(prompt),
      content: this.generateStoryContent(prompt, theme, style),
      createdBy: 'ai',
      createdAt: new Date().toISOString(),
      totalReads: 0,
      averageRating: 0,
      completionRate: 0,
      tags: this.extractTags(prompt, theme),
      generatedFrom: prompt,
      style: style
    };

    // Store generated story
    this.generatedStories.push(story);
    this.stories.push(story);

    return story;
  }

  /**
   * Generate story title
   */
  generateTitle(prompt, theme) {
    const titles = {
      folklore: ['The Legend of', 'The Tale of', 'The Story of', 'The Secret of'],
      mythology: ['The Myth of', 'The Epic of', 'The Divine', 'The Sacred'],
      historical: ['The Chronicle of', 'The History of', 'The Legacy of'],
      cultural: ['The Tradition of', 'The Heritage of', 'The Culture of']
    };

    const prefix = titles[theme] || titles.folklore;
    const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
    const words = prompt.split(' ').slice(0, 3).join(' ');
    return `${randomPrefix} ${words}`;
  }

  /**
   * Generate description
   */
  generateDescription(prompt) {
    const templates = [
      `A captivating story about ${prompt} that explores the rich cultural heritage.`,
      `Discover the fascinating tale of ${prompt} and its significance.`,
      `An engaging narrative that brings ${prompt} to life.`,
      `Immerse yourself in the story of ${prompt} and its cultural importance.`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Generate story content
   */
  generateStoryContent(prompt, theme, style) {
    const template = this.templates[Math.floor(Math.random() * this.templates.length)];
    const branches = this.generateBranches(prompt, theme, template);

    return {
      introduction: this.generateIntroduction(prompt, theme),
      branches: branches,
      conclusion: this.generateConclusion(prompt, theme)
    };
  }

  /**
   * Generate introduction
   */
  generateIntroduction(prompt, theme) {
    const intros = {
      folklore: `In a time long ago, in a land of mystery and wonder, there was a story about ${prompt}.`,
      mythology: `The ancient gods looked down upon the mortal world, and the tale of ${prompt} unfolded.`,
      historical: `History records many events, but none quite like the story of ${prompt}.`,
      cultural: `In the heart of tradition, the story of ${prompt} was passed down through generations.`
    };
    return intros[theme] || intros.folklore;
  }

  /**
   * Generate branches
   */
  generateBranches(prompt, theme, template) {
    const branches = [];
    const numBranches = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numBranches; i++) {
      const branch = {
        id: `branch_${i}_${Date.now()}`,
        text: this.generateBranchText(prompt, theme, i),
        nextBranch: i < numBranches - 1 ? `branch_${i + 1}_${Date.now()}` : null,
        choices: i < numBranches - 1 ? this.generateChoices(prompt, i) : []
      };
      branches.push(branch);
    }

    return branches;
  }

  /**
   * Generate branch text
   */
  generateBranchText(prompt, theme, index) {
    const scenarios = [
      `You discover a hidden path leading to ${prompt}.`,
      `A wise elder shares knowledge about ${prompt}.`,
      `You encounter a challenge related to ${prompt}.`,
      `A magical moment unfolds connected to ${prompt}.`,
      `You learn a valuable lesson about ${prompt}.`
    ];
    return scenarios[index % scenarios.length];
  }

  /**
   * Generate choices
   */
  generateChoices(prompt, index) {
    const choices = [
      { id: `choice_${index}_1`, text: 'Continue the journey', nextBranch: null },
      { id: `choice_${index}_2`, text: 'Explore further', nextBranch: null },
      { id: `choice_${index}_3`, text: 'Seek guidance', nextBranch: null }
    ];
    return choices;
  }

  /**
   * Generate conclusion
   */
  generateConclusion(prompt, theme) {
    const conclusions = {
      folklore: `And so, the legend of ${prompt} lives on, passed down through generations.`,
      mythology: `The gods smiled upon the mortals, and ${prompt} became part of mythology.`,
      historical: `${prompt} stands as a testament to the rich heritage of our ancestors.`,
      cultural: `The tradition of ${prompt} continues to thrive, preserving our culture.`
    };
    return conclusions[theme] || conclusions.folklore;
  }

  /**
   * Extract tags
   */
  extractTags(prompt, theme) {
    const tags = [theme];
    const words = prompt.split(' ');
    words.forEach(word => {
      if (word.length > 3) {
        tags.push(word.toLowerCase());
      }
    });
    return tags.slice(0, 5);
  }

  /**
   * Branch story based on choice
   */
  async branchStory(storyId, choiceId, userId = null) {
    const story = this.getStory(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    // Find the branch
    let currentBranch = null;
    for (const branch of story.content.branches) {
      for (const choice of branch.choices) {
        if (choice.id === choiceId) {
          currentBranch = branch;
          break;
        }
      }
      if (currentBranch) break;
    }

    if (!currentBranch) {
      throw new Error('Choice not found');
    }

    // Log user choice
    if (userId) {
      if (!this.userChoices.has(userId)) {
        this.userChoices.set(userId, []);
      }
      this.userChoices.get(userId).push({
        storyId,
        choiceId,
        branchId: currentBranch.id,
        timestamp: new Date().toISOString()
      });
    }

    // Track engagement
    this.trackEngagement(storyId, 'choice_made');

    // Find next branch
    let nextBranch = null;
    if (currentBranch.nextBranch) {
      nextBranch = story.content.branches.find(b => b.id === currentBranch.nextBranch);
    }

    return {
      currentBranch,
      nextBranch,
      message: 'Branching to next part of the story',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Track engagement
   */
  trackEngagement(storyId, action) {
    if (!this.engagementData.has(storyId)) {
      this.engagementData.set(storyId, {
        reads: 0,
        choices: 0,
        completions: 0,
        timeSpent: 0,
        actions: []
      });
    }

    const data = this.engagementData.get(storyId);
    data.actions.push({
      action,
      timestamp: new Date().toISOString()
    });

    switch (action) {
      case 'read':
        data.reads++;
        break;
      case 'choice_made':
        data.choices++;
        break;
      case 'completed':
        data.completions++;
        break;
    }

    this.engagementData.set(storyId, data);
  }

  /**
   * Get story by ID
   */
  getStory(storyId) {
    return this.stories.find(s => s.id === storyId);
  }

  /**
   * Get all stories
   */
  getStories(filters = {}) {
    let filtered = [...this.stories];

    if (filters.theme) {
      filtered = filtered.filter(s => s.theme === filters.theme);
    }

    if (filters.tag) {
      filtered = filtered.filter(s => s.tags && s.tags.includes(filters.tag));
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(search) ||
        s.description.toLowerCase().includes(search)
      );
    }

    if (filters.popular) {
      filtered.sort((a, b) => b.totalReads - a.totalReads);
    }

    if (filters.recent) {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  }

  /**
   * Get AI-generated stories
   */
  getGeneratedStories() {
    return this.generatedStories;
  }

  /**
   * Get story themes
   */
  getThemes() {
    return this.storyThemes;
  }

  /**
   * Get templates
   */
  getTemplates() {
    return this.templates;
  }

  /**
   * Get user choices
   */
  getUserChoices(userId) {
    return this.userChoices.get(userId) || [];
  }

  /**
   * Get engagement data
   */
  getEngagementData(storyId) {
    return this.engagementData.get(storyId) || null;
  }

  /**
   * Get story analytics
   */
  getStoryAnalytics() {
    const totalStories = this.stories.length;
    const totalReads = this.stories.reduce((sum, s) => sum + s.totalReads, 0);
    const avgRating = this.stories.reduce((sum, s) => sum + s.averageRating, 0) / (totalStories || 1);

    // Most popular themes
    const themeCount = {};
    this.stories.forEach(s => {
      themeCount[s.theme] = (themeCount[s.theme] || 0) + 1;
    });
    const popularThemes = Object.entries(themeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));

    // Completion rates
    const completionRates = this.stories.map(s => s.completionRate || 0);
    const avgCompletionRate = completionRates.reduce((a, b) => a + b, 0) / (completionRates.length || 1);

    return {
      totalStories,
      totalReads,
      averageRating: Math.round(avgRating * 10) / 10,
      avgCompletionRate: Math.round(avgCompletionRate * 100),
      popularThemes,
      mostRead: this.getMostReadStories(5),
      topRated: this.getTopRatedStories(5),
      engagement: this.getOverallEngagement(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get most read stories
   */
  getMostReadStories(limit = 5) {
    return [...this.stories]
      .sort((a, b) => b.totalReads - a.totalReads)
      .slice(0, limit)
      .map(s => ({ id: s.id, title: s.title, reads: s.totalReads }));
  }

  /**
   * Get top rated stories
   */
  getTopRatedStories(limit = 5) {
    return [...this.stories]
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit)
      .map(s => ({ id: s.id, title: s.title, rating: s.averageRating }));
  }

  /**
   * Get overall engagement
   */
  getOverallEngagement() {
    let totalReads = 0;
    let totalChoices = 0;
    let totalCompletions = 0;

    this.engagementData.forEach(data => {
      totalReads += data.reads || 0;
      totalChoices += data.choices || 0;
      totalCompletions += data.completions || 0;
    });

    return {
      totalReads,
      totalChoices,
      totalCompletions,
      avgChoicesPerRead: totalReads > 0 ? Math.round(totalChoices / totalReads * 10) / 10 : 0,
      completionRate: totalReads > 0 ? Math.round(totalCompletions / totalReads * 100) : 0
    };
  }

  /**
   * Get story statistics
   */
  getStats() {
    return {
      totalStories: this.stories.length,
      totalGenerated: this.generatedStories.length,
      totalThemes: this.storyThemes.length,
      totalTemplates: this.templates.length,
      totalUserChoices: Array.from(this.userChoices.values()).reduce((sum, choices) => sum + choices.length, 0),
      engagementData: this.getOverallEngagement(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create custom story
   */
  createCustomStory(storyData, userId) {
    const story = {
      id: `story_${Date.now()}_${uuidv4().slice(0, 8)}`,
      title: storyData.title,
      theme: storyData.theme || 'cultural',
      description: storyData.description,
      content: storyData.content || {
        introduction: 'A new story begins...',
        branches: [],
        conclusion: 'The story continues...'
      },
      createdBy: userId,
      createdAt: new Date().toISOString(),
      totalReads: 0,
      averageRating: 0,
      completionRate: 0,
      tags: storyData.tags || [],
      isCustom: true
    };

    this.stories.push(story);
    return story;
  }

  /**
   * Add branch to story
   */
  addBranch(storyId, branchData) {
    const story = this.getStory(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    const branch = {
      id: `branch_${Date.now()}_${uuidv4().slice(0, 8)}`,
      text: branchData.text,
      nextBranch: branchData.nextBranch || null,
      choices: branchData.choices || []
    };

    story.content.branches.push(branch);
    story.updatedAt = new Date().toISOString();

    return story;
  }

  /**
   * Rate story
   */
  rateStory(storyId, rating) {
    const story = this.getStory(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    // Update rating (simple average)
    const totalRatings = story.totalReads || 0;
    const currentTotal = story.averageRating * totalRatings;
    const newTotal = currentTotal + rating;
    const newCount = totalRatings + 1;
    story.averageRating = newTotal / newCount;

    return story;
  }
}

module.exports = StorytellingEngineService;
