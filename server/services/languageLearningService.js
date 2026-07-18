// services/languageLearningService.js
const store = require('../../data/store');
const { v4: uuidv4 } = require('uuid');

class LanguageLearningService {
  constructor() {
    this.languages = [];
    this.lessons = [];
    this.wordDatabase = [];
    this.userProgress = new Map();
    this.pronunciationData = new Map();
    this.translationMemory = [];
    this.verificationQueue = [];
    this.learningPaths = [];
    
    this.init();
  }

  init() {
    this.loadLanguages();
    this.loadWordDatabase();
    this.loadLessons();
    this.loadLearningPaths();
    console.log('✅ Language Learning Service initialized');
  }

  loadLanguages() {
    this.languages = [
      { id: 'hi', name: 'Hindi', script: 'Devanagari', region: 'North India', speakers: '340M', status: 'major' },
      { id: 'bn', name: 'Bengali', script: 'Bengali', region: 'East India', speakers: '230M', status: 'major' },
      { id: 'mr', name: 'Marathi', script: 'Devanagari', region: 'West India', speakers: '83M', status: 'major' },
      { id: 'ta', name: 'Tamil', script: 'Tamil', region: 'South India', speakers: '75M', status: 'major' },
      { id: 'te', name: 'Telugu', script: 'Telugu', region: 'South India', speakers: '81M', status: 'major' },
      { id: 'kn', name: 'Kannada', script: 'Kannada', region: 'South India', speakers: '43M', status: 'major' },
      { id: 'ml', name: 'Malayalam', script: 'Malayalam', region: 'South India', speakers: '38M', status: 'major' },
      { id: 'gu', name: 'Gujarati', script: 'Gujarati', region: 'West India', speakers: '55M', status: 'major' },
      { id: 'or', name: 'Odia', script: 'Odia', region: 'East India', speakers: '38M', status: 'major' },
      { id: 'pa', name: 'Punjabi', script: 'Gurmukhi', region: 'North India', speakers: '32M', status: 'major' },
      { id: 'bh', name: 'Bhojpuri', script: 'Devanagari', region: 'East India', speakers: '50M', status: 'regional' },
      { id: 'ma', name: 'Maithili', script: 'Devanagari', region: 'East India', speakers: '12M', status: 'regional' },
      { id: 'as', name: 'Assamese', script: 'Assamese', region: 'Northeast India', speakers: '15M', status: 'regional' },
      { id: 'ks', name: 'Kashmiri', script: 'Perso-Arabic', region: 'North India', speakers: '7M', status: 'regional' },
      { id: 'sd', name: 'Sindhi', script: 'Perso-Arabic', region: 'West India', speakers: '2M', status: 'regional' },
      { id: 'ne', name: 'Nepali', script: 'Devanagari', region: 'Northeast India', speakers: '2.9M', status: 'regional' },
      { id: 'doi', name: 'Dogri', script: 'Devanagari', region: 'North India', speakers: '2.6M', status: 'regional' },
      { id: 'sa', name: 'Sanskrit', script: 'Devanagari', region: 'Pan-India', speakers: '0.02M', status: 'classical' }
    ];
  }

  loadWordDatabase() {
    this.wordDatabase = [
      // Hindi
      { id: 'w1', language: 'hi', word: 'नमस्ते', pronunciation: 'namaste', meaning: 'Hello', category: 'greeting', cultural_context: 'Traditional greeting with folded hands' },
      { id: 'w2', language: 'hi', word: 'धन्यवाद', pronunciation: 'dhanyavaad', meaning: 'Thank you', category: 'greeting', cultural_context: 'Expression of gratitude' },
      { id: 'w3', language: 'hi', word: 'कृपया', pronunciation: 'kripaya', meaning: 'Please', category: 'polite', cultural_context: 'Polite request' },
      
      // Bengali
      { id: 'w4', language: 'bn', word: 'নমস্কার', pronunciation: 'nomoskar', meaning: 'Hello', category: 'greeting', cultural_context: 'Traditional Bengali greeting' },
      { id: 'w5', language: 'bn', word: 'ধন্যবাদ', pronunciation: 'dhonnobad', meaning: 'Thank you', category: 'greeting', cultural_context: 'Expression of thanks' },
      
      // Tamil
      { id: 'w6', language: 'ta', word: 'வணக்கம்', pronunciation: 'vanakkam', meaning: 'Hello', category: 'greeting', cultural_context: 'Traditional Tamil greeting' },
      { id: 'w7', language: 'ta', word: 'நன்றி', pronunciation: 'nandri', meaning: 'Thank you', category: 'greeting', cultural_context: 'Expression of gratitude' },
      
      // More words...
      { id: 'w8', language: 'hi', word: 'आप कैसे हैं?', pronunciation: 'aap kaise hain?', meaning: 'How are you?', category: 'conversation', cultural_context: 'Polite inquiry about well-being' },
      { id: 'w9', language: 'hi', word: 'मैं ठीक हूँ', pronunciation: 'main theek hoon', meaning: 'I am fine', category: 'conversation', cultural_context: 'Response to greeting' },
      { id: 'w10', language: 'hi', word: 'मेरा नाम... है', pronunciation: 'mera naam... hai', meaning: 'My name is...', category: 'introduction', cultural_context: 'Introducing yourself' },
      
      // Food
      { id: 'w11', language: 'hi', word: 'खाना', pronunciation: 'khana', meaning: 'Food', category: 'food', cultural_context: 'Staple of Indian culture' },
      { id: 'w12', language: 'hi', word: 'पानी', pronunciation: 'pani', meaning: 'Water', category: 'food', cultural_context: 'Essential element' },
      
      // Family
      { id: 'w13', language: 'hi', word: 'माता', pronunciation: 'mata', meaning: 'Mother', category: 'family', cultural_context: 'Respected figure in Indian families' },
      { id: 'w14', language: 'hi', word: 'पिता', pronunciation: 'pita', meaning: 'Father', category: 'family', cultural_context: 'Head of the family' },
      { id: 'w15', language: 'hi', word: 'भाई', pronunciation: 'bhai', meaning: 'Brother', category: 'family', cultural_context: 'Term of endearment for brother' },
      
      // Numbers
      { id: 'w16', language: 'hi', word: 'एक', pronunciation: 'ek', meaning: 'One', category: 'numbers', cultural_context: 'Number one' },
      { id: 'w17', language: 'hi', word: 'दो', pronunciation: 'do', meaning: 'Two', category: 'numbers', cultural_context: 'Number two' },
      { id: 'w18', language: 'hi', word: 'तीन', pronunciation: 'teen', meaning: 'Three', category: 'numbers', cultural_context: 'Number three' },
      
      // Cultural terms
      { id: 'w19', language: 'hi', word: 'दीपावली', pronunciation: 'diwali', meaning: 'Diwali - Festival of Lights', category: 'festival', cultural_context: 'Major Hindu festival' },
      { id: 'w20', language: 'hi', word: 'होली', pronunciation: 'holi', meaning: 'Holi - Festival of Colors', category: 'festival', cultural_context: 'Spring festival of colors' }
    ];
  }

  loadLessons() {
    this.lessons = [
      // Level 1: Beginner
      {
        id: 'lesson_1_1',
        language: 'hi',
        level: 1,
        title: 'Greetings & Introductions',
        description: 'Learn how to greet people and introduce yourself',
        category: 'basic',
        words: ['w1', 'w2', 'w3', 'w8', 'w9', 'w10'],
        exercises: [
          { type: 'multiple_choice', question: 'How do you say "Hello" in Hindi?', options: ['नमस्ते', 'धन्यवाद', 'कृपया'], correct: 0 },
          { type: 'fill_blank', question: 'धन्यवाद means _____', answer: 'Thank you' },
          { type: 'match', pairs: [{ hindi: 'नमस्ते', english: 'Hello' }, { hindi: 'धन्यवाद', english: 'Thank you' }] }
        ],
        cultural_notes: 'In Indian culture, greeting with folded hands (Namaste) is a sign of respect',
        audio: 'lesson1_1.mp3'
      },
      {
        id: 'lesson_1_2',
        language: 'hi',
        level: 1,
        title: 'Basic Words & Phrases',
        description: 'Essential everyday words and phrases',
        category: 'basic',
        words: ['w11', 'w12', 'w13', 'w14', 'w15'],
        exercises: [
          { type: 'multiple_choice', question: 'What is "Food" in Hindi?', options: ['पानी', 'खाना', 'भाई'], correct: 1 },
          { type: 'fill_blank', question: '_____ means Water', answer: 'पानी' }
        ],
        cultural_notes: 'Family is central to Indian culture with specific terms for each relation',
        audio: 'lesson1_2.mp3'
      },
      // Level 2: Intermediate
      {
        id: 'lesson_2_1',
        language: 'hi',
        level: 2,
        title: 'Numbers & Counting',
        description: 'Learn numbers from 1 to 100',
        category: 'numbers',
        words: ['w16', 'w17', 'w18'],
        exercises: [
          { type: 'multiple_choice', question: 'What is "Three" in Hindi?', options: ['एक', 'दो', 'तीन'], correct: 2 }
        ],
        cultural_notes: 'Numbers are used in daily life from buying to telling time',
        audio: 'lesson2_1.mp3'
      },
      {
        id: 'lesson_2_2',
        language: 'hi',
        level: 2,
        title: 'Festivals & Celebrations',
        description: 'Learn about Indian festivals and traditions',
        category: 'culture',
        words: ['w19', 'w20'],
        exercises: [
          { type: 'multiple_choice', question: 'Diwali is known as _____', options: ['Festival of Colors', 'Festival of Lights', 'Harvest Festival'], correct: 1 }
        ],
        cultural_notes: 'India is known for its vibrant festivals celebrated with joy and enthusiasm',
        audio: 'lesson2_2.mp3'
      }
    ];
  }

  loadLearningPaths() {
    this.learningPaths = [
      {
        id: 'path_1',
        name: 'Beginner Hindi',
        description: 'Complete beginners guide to Hindi',
        level: 1,
        lessons: ['lesson_1_1', 'lesson_1_2'],
        target: 'basic_conversation'
      },
      {
        id: 'path_2',
        name: 'Intermediate Hindi',
        description: 'Build on your Hindi skills',
        level: 2,
        lessons: ['lesson_2_1', 'lesson_2_2'],
        target: 'fluent_conversation'
      }
    ];
  }

  /**
   * Generate lesson for a language and level
   */
  async generateLesson(language, level, userId = null) {
    console.log(`📚 Generating lesson for ${language} at level ${level}`);

    const lessons = this.lessons.filter(l => l.language === language && l.level === level);
    
    if (lessons.length === 0) {
      // Create custom lesson
      return this.createCustomLesson(language, level);
    }

    // Get user progress to determine next lesson
    let nextLesson = lessons[0];
    if (userId && this.userProgress.has(userId)) {
      const progress = this.userProgress.get(userId);
      const completedLessons = progress.completedLessons || [];
      
      // Find first lesson not completed
      const uncompleted = lessons.find(l => !completedLessons.includes(l.id));
      if (uncompleted) {
        nextLesson = uncompleted;
      }
    }

    return {
      lesson: nextLesson,
      totalLessons: lessons.length,
      progress: userId ? this.getLessonProgress(userId, nextLesson.id) : null,
      nextLesson: this.getNextLesson(language, level, nextLesson.id),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create custom lesson
   */
  createCustomLesson(language, level) {
    const words = this.wordDatabase.filter(w => w.language === language).slice(0, 5);
    
    return {
      id: `custom_${Date.now()}`,
      language,
      level,
      title: `Custom ${this.getLanguageName(language)} Lesson`,
      description: 'Personalized lesson based on your learning needs',
      category: 'custom',
      words: words.map(w => w.id),
      exercises: [
        { type: 'multiple_choice', question: 'Practice with custom words', options: words.slice(0, 3).map(w => w.word), correct: 0 }
      ],
      cultural_notes: 'Culture is embedded in language learning',
      audio: null
    };
  }

  /**
   * Get language name
   */
  getLanguageName(languageId) {
    const lang = this.languages.find(l => l.id === languageId);
    return lang ? lang.name : languageId;
  }

  /**
   * Get next lesson
   */
  getNextLesson(language, level, currentLessonId) {
    const lessons = this.lessons.filter(l => l.language === language && l.level === level);
    const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
    
    if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
      return lessons[currentIndex + 1];
    }
    
    // Check if there are more levels
    const nextLevel = level + 1;
    const nextLevelLessons = this.lessons.filter(l => l.language === language && l.level === nextLevel);
    
    if (nextLevelLessons.length > 0) {
      return {
        ...nextLevelLessons[0],
        level_up: true,
        message: `Congratulations! You're ready for Level ${nextLevel}`
      };
    }
    
    return null;
  }

  /**
   * Get lesson progress
   */
  getLessonProgress(userId, lessonId) {
    if (!this.userProgress.has(userId)) return null;
    
    const progress = this.userProgress.get(userId);
    const lessonProgress = progress.lessonProgress || {};
    return lessonProgress[lessonId] || null;
  }

  /**
   * Track lesson progress
   */
  trackLessonProgress(userId, lessonId, progressData) {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, {
        userId,
        completedLessons: [],
        lessonProgress: {},
        points: 0,
        streak: 0,
        lastActive: null
      });
    }

    const progress = this.userProgress.get(userId);
    progress.lessonProgress[lessonId] = {
      completed: progressData.completed || false,
      score: progressData.score || 0,
      attempts: (progress.lessonProgress[lessonId]?.attempts || 0) + 1,
      completedAt: progressData.completed ? new Date().toISOString() : null
    };

    if (progressData.completed && !progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      progress.points += 50 + (progressData.score || 0);
      
      // Update streak
      const today = new Date().toDateString();
      if (progress.lastActive !== today) {
        progress.streak += 1;
        progress.lastActive = today;
      }
    }

    this.userProgress.set(userId, progress);
    return progress;
  }

  /**
   * Assess pronunciation using AI
   */
  async assessPronunciation(audioData, wordId) {
    console.log(`🎤 Assessing pronunciation for word: ${wordId}`);

    const word = this.wordDatabase.find(w => w.id === wordId);
    if (!word) {
      throw new Error('Word not found');
    }

    // In production: use actual speech recognition
    // For now: simulate assessment
    const score = Math.random() * 30 + 70; // 70-100% accuracy
    const feedback = this.generatePronunciationFeedback(score, word);

    // Store pronunciation data
    this.pronunciationData.set(`${wordId}_${Date.now()}`, {
      wordId,
      audio: audioData,
      score,
      feedback,
      assessedAt: new Date().toISOString()
    });

    return {
      word: word.word,
      pronunciation: word.pronunciation,
      score,
      feedback,
      accuracy: score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs_practice',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate pronunciation feedback
   */
  generatePronunciationFeedback(score, word) {
    if (score >= 90) {
      return 'Excellent pronunciation! Your pronunciation is clear and accurate.';
    } else if (score >= 80) {
      return 'Good pronunciation! Minor improvements needed.';
    } else if (score >= 70) {
      return 'Fair pronunciation. Practice the sounds in this word.';
    } else {
      return 'Needs practice. Focus on the pronunciation of each syllable.';
    }
  }

  /**
   * Translate text
   */
  async translateText(text, sourceLang, targetLang) {
    console.log(`🔄 Translating from ${sourceLang} to ${targetLang}`);

    // In production: use translation API
    // For now: simulate translation
    const translation = `[Translation of "${text}" from ${sourceLang} to ${targetLang}]`;
    
    // Store in translation memory
    this.translationMemory.push({
      source: text,
      sourceLang,
      targetLang,
      translation,
      timestamp: new Date().toISOString()
    });

    return {
      original: text,
      translation,
      sourceLang,
      targetLang,
      confidence: 0.9,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get word suggestions (context-aware)
   */
  getWordSuggestions(language, context, limit = 5) {
    const words = this.wordDatabase.filter(w => w.language === language);
    
    // Score words based on context relevance
    const scored = words.map(word => {
      let score = 0;
      const contextLower = context.toLowerCase();
      
      if (word.meaning.toLowerCase().includes(contextLower)) score += 10;
      if (word.category.toLowerCase().includes(contextLower)) score += 5;
      if (word.cultural_context.toLowerCase().includes(contextLower)) score += 3;
      
      return { ...word, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }

  /**
   * Get personalized learning path
   */
  getPersonalizedPath(userId) {
    if (!this.userProgress.has(userId)) {
      return this.learningPaths[0];
    }

    const progress = this.userProgress.get(userId);
    const completedCount = progress.completedLessons.length;
    
    // Determine level based on completed lessons
    let level = 1;
    if (completedCount > 5) level = 2;
    if (completedCount > 15) level = 3;
    if (completedCount > 30) level = 4;

    // Find matching path
    const path = this.learningPaths.find(p => p.level === level);
    return path || this.learningPaths[0];
  }

  /**
   * Submit word for verification
   */
  submitWord(wordData, userId) {
    const submission = {
      id: `sub_${Date.now()}`,
      ...wordData,
      submittedBy: userId,
      status: 'pending',
      votes: { up: 0, down: 0 },
      submittedAt: new Date().toISOString()
    };

    this.verificationQueue.push(submission);
    return submission;
  }

  /**
   * Vote on word submission
   */
  voteWord(submissionId, userId, voteType) {
    const submission = this.verificationQueue.find(s => s.id === submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    submission.votes[voteType] = (submission.votes[voteType] || 0) + 1;
    
    // Auto-verify if enough votes
    if (submission.votes.up >= 5) {
      submission.status = 'verified';
      // Add to word database
      this.wordDatabase.push({
        id: `w_${Date.now()}`,
        language: submission.language,
        word: submission.word,
        pronunciation: submission.pronunciation,
        meaning: submission.meaning,
        category: submission.category,
        cultural_context: submission.cultural_context
      });
    }

    return submission;
  }

  /**
   * Get user progress
   */
  getUserProgress(userId) {
    return this.userProgress.get(userId) || {
      userId,
      completedLessons: [],
      lessonProgress: {},
      points: 0,
      streak: 0,
      lastActive: null
    };
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(limit = 50) {
    const users = Array.from(this.userProgress.values());
    users.sort((a, b) => b.points - a.points);
    
    return users.slice(0, limit).map((user, index) => ({
      rank: index + 1,
      userId: user.userId,
      points: user.points,
      streak: user.streak,
      completedLessons: user.completedLessons.length
    }));
  }

  /**
   * Get language stats
   */
  getLanguageStats() {
    return {
      totalLanguages: this.languages.length,
      totalWords: this.wordDatabase.length,
      totalLessons: this.lessons.length,
      totalUsers: this.userProgress.size,
      languagesByStatus: {
        major: this.languages.filter(l => l.status === 'major').length,
        regional: this.languages.filter(l => l.status === 'regional').length,
        classical: this.languages.filter(l => l.status === 'classical').length
      },
      popularLanguages: this.getPopularLanguages(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get popular languages
   */
  getPopularLanguages() {
    const counts = {};
    this.wordDatabase.forEach(w => {
      counts[w.language] = (counts[w.language] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang, count]) => ({
        language: this.getLanguageName(lang),
        code: lang,
        wordCount: count
      }));
  }

  /**
   * Get all languages
   */
  getLanguages() {
    return this.languages;
  }

  /**
   * Get all words for a language
   */
  getWords(language) {
    return this.wordDatabase.filter(w => w.language === language);
  }

  /**
   * Get lessons for a language
   */
  getLessons(language, level = null) {
    let lessons = this.lessons.filter(l => l.language === language);
    if (level) {
      lessons = lessons.filter(l => l.level === parseInt(level));
    }
    return lessons;
  }

  /**
   * Get learning paths
   */
  getLearningPaths() {
    return this.learningPaths;
  }

  /**
   * Get verification queue
   */
  getVerificationQueue() {
    return this.verificationQueue;
  }

  /**
   * Get translation memory
   */
  getTranslationMemory(lang = null) {
    if (lang) {
      return this.translationMemory.filter(t => t.sourceLang === lang || t.targetLang === lang);
    }
    return this.translationMemory;
  }

  /**
   * Reset user progress (for testing)
   */
  resetUserProgress(userId) {
    this.userProgress.delete(userId);
  }
}

module.exports = LanguageLearningService;
