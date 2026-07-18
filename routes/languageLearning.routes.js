// routes/languageLearning.routes.js
const express = require('express');
const router = express.Router();
const LanguageLearningService = require('../server/services/languageLearningService');

let languageService = null;

const getService = () => {
  if (!languageService) {
    languageService = new LanguageLearningService();
  }
  return languageService;
};

/**
 * GET /api/language/lessons
 * Get lessons for a language
 */
router.get('/lessons', (req, res, next) => {
  try {
    const { language, level } = req.query;

    if (!language) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: language'
      });
    }

    const service = getService();
    const lessons = service.getLessons(language, level);

    res.json({
      success: true,
      language,
      lessons,
      count: lessons.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/language/lesson/generate
 * Generate a lesson
 */
router.get('/lesson/generate', (req, res, next) => {
  try {
    const { language, level, userId } = req.query;

    if (!language || !level) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: language, level'
      });
    }

    const service = getService();
    const lesson = service.generateLesson(language, parseInt(level), userId);

    res.json({
      success: true,
      ...lesson,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/language/progress
 * Track lesson progress
 */
router.post('/progress', (req, res, next) => {
  try {
    const { userId, lessonId, progressData } = req.body;

    if (!userId || !lessonId || !progressData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, lessonId, progressData'
      });
    }

    const service = getService();
    const progress = service.trackLessonProgress(userId, lessonId, progressData);

    res.json({
      success: true,
      progress,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/language/progress/:userId
 * Get user progress
 */
router.get('/progress/:userId', (req, res, next) => {
  try {
    const { userId } = req.params;
    const service = getService();
    const progress = service.getUserProgress(userId);

    res.json({
      success: true,
      progress,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/language/pronunciation
 * Assess pronunciation
 */
router.post('/pronunciation', async (req, res, next) => {
  try {
    const { audioData, wordId } = req.body;

    if (!audioData || !wordId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: audioData, wordId'
      });
    }

    const service = getService();
    const result = await service.assessPronunciation(audioData, wordId);

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/language/translate
 * Translate text
 */
router.post('/translate', async (req, res, next) => {
  try {
    const { text, sourceLang, targetLang } = req.body;

    if (!text || !sourceLang || !targetLang) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: text, sourceLang, targetLang'
      });
    }

    const service = getService();
    const result = await service.translateText(text, sourceLang, targetLang);

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/language/suggestions
 * Get word suggestions
 */
router.get('/suggestions', (req, res, next) => {
  try {
    const { language, context, limit } = req.query;

    if (!language || !context) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: language, context'
      });
    }

    const service = getService();
    const suggestions = service.getWordSuggestions(
      language,
      context,
      parseInt(limit) || 5
    );

    res.json({
      success: true,
      language,
      context,
      suggestions,
      count: suggestions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/language/word
 * Submit word for verification
 */
router.post('/word', (req, res, next) => {
  try {
    const { wordData, userId } = req.body;

    if (!wordData || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: wordData, userId'
      });
    }

    const service = getService();
    const submission = service.submitWord(wordData, userId);

    res.json({
      success: true,
      submission,
      message: 'Word submitted for verification',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/language/word/vote
 * Vote on word submission
 */
router.post('/word/vote', (req, res, next) => {
  try {
    const { submissionId, userId, voteType } = req.body;

    if (!submissionId || !userId || !voteType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: submissionId, userId, voteType'
      });
    }

    const service = getService();
    const submission = service.voteWord(submissionId, userId, voteType);

    res.json({
      success: true,
      submission,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/language/leaderboard
 * Get leaderboard
 */
router.get('/leaderboard', (req, res, next) => {
  try {
    const { limit } = req.query;
    const service = getService();
    const leaderboard = service.getLeaderboard(parseInt(limit) || 50);

    res.json({
      success: true,
      leaderboard,
      count: leaderboard.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/language/languages
 * Get all languages
 */
router.get('/languages', (req, res, next) => {
  try {
    const service = getService();
    const languages = service.getLanguages();

    res.json({
      success: true,
      languages,
      count: languages.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/language/words/:language
 * Get words for a language
 */
router.get('/words/:language', (req, res, next) => {
  try {
    const { language } = req.params;
    const service = getService();
    const words = service.getWords(language);

    res.json({
      success: true,
      language,
      words,
      count: words.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/language/paths
 * Get learning paths
 */
router.get('/paths', (req, res, next) => {
  try {
    const service = getService();
    const paths = service.getLearningPaths();

    res.json({
      success: true,
      paths,
      count: paths.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/language/queue
 * Get verification queue
 */
router.get('/queue', (req, res, next) => {
  try {
    const service = getService();
    const queue = service.getVerificationQueue();

    res.json({
      success: true,
      queue,
      count: queue.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/language/stats
 * Get language stats
 */
router.get('/stats', (req, res, next) => {
  try {
    const service = getService();
    const stats = service.getLanguageStats();

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
