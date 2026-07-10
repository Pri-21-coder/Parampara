class ModerationEngine {
  constructor() {
    // Basic set of offensive words in English and Hindi romanization.
    // In a real production system, this would be loaded from a config or database
    // and would be much more comprehensive.
    this.profanityList = new Set([
      'spam', 'scam', 'abuse', 'offensive', 'hate',
      'idiot', 'stupid', 'moron', 'crap', 'bullshit',
      'fuck', 'shit', 'bitch', 'asshole', 'bastard',
      'chutiya', 'madarchod', 'bhenchod', 'saala', 'kutta', 'harami'
    ]);

    // Build a regular expression for efficient matching
    // Boundary \b is used for English words. For a more advanced system,
    // fuzzy matching or phonetic matching could be implemented.
    const wordsPattern = Array.from(this.profanityList).join('|');
    this.profanityRegex = new RegExp(`\\b(${wordsPattern})\\b`, 'i');
  }

  /**
   * Checks if a given text contains any configured profanity.
   * @param {string} text - The input text to check
   * @returns {boolean} True if profanity is found, false otherwise
   */
  containsProfanity(text) {
    if (!text || typeof text !== 'string') return false;
    return this.profanityRegex.test(text.toLowerCase());
  }
}

module.exports = new ModerationEngine();
