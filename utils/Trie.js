class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
    this.wordCount = 0;
  }

  normalize(text, removeSpaces = false) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    let normalized = text.toLowerCase()
      .replace(/@/g, 'a')
      .replace(/0/g, 'o')
      .replace(/1/g, 'i')
      .replace(/3/g, 'e')
      .replace(/5/g, 's')
      .replace(/7/g, 't')
      .replace(/4/g, 'a')
      .replace(/2/g, 'z');

    if (removeSpaces) {
      normalized = normalized.replace(/\s+/g, '');
    }

    return normalized;
  }

  insert(word) {
    if (!word || typeof word !== 'string') {
      return false;
    }

    const normalizedWord = this.normalize(word, true);
    if (normalizedWord.length === 0) {
      return false;
    }

    let node = this.root;
    for (const char of normalizedWord) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }

    if (!node.isEndOfWord) {
      node.isEndOfWord = true;
      this.wordCount++;
    }

    return true;
  }

  build(dictionary) {
    if (!dictionary || !Array.isArray(dictionary)) {
      return;
    }

    for (const word of dictionary) {
      if (word && typeof word === 'string') {
        this.insert(word);
      }
    }
  }

  search(word) {
    if (!word || typeof word !== 'string') {
      return false;
    }

    const normalizedWord = this.normalize(word, true);
    if (normalizedWord.length === 0) {
      return false;
    }

    let node = this.root;
    for (const char of normalizedWord) {
      if (!node.children.has(char)) {
        return false;
      }
      node = node.children.get(char);
    }

    return node.isEndOfWord;
  }

  startsWith(prefix) {
    if (!prefix || typeof prefix !== 'string') {
      return false;
    }

    const normalizedPrefix = this.normalize(prefix, true);
    if (normalizedPrefix.length === 0) {
      return false;
    }

    let node = this.root;
    for (const char of normalizedPrefix) {
      if (!node.children.has(char)) {
        return false;
      }
      node = node.children.get(char);
    }

    return true;
  }

  hasExcessiveRepetition(text) {
    if (!text || typeof text !== 'string') {
      return false;
    }
    return /(.)\1{5,}/.test(text);
  }

  findMatches(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const normalized = this.normalize(text);
    const matches = [];

    for (let i = 0; i < normalized.length; i++) {
      let node = this.root;
      let matchLength = 0;
      let longestMatch = -1;
      let j = i;

      while (j < normalized.length) {
        const char = normalized[j];

        if (node.children.has(char)) {
          node = node.children.get(char);
          matchLength++;
          if (node.isEndOfWord) {
            longestMatch = matchLength;
          }
          j++;
        } else {
          break;
        }
      }

      if (longestMatch !== -1) {
        const start = i;
        const end = i + longestMatch;
        const matchedWord = normalized.substring(start, end);
        matches.push({
          word: matchedWord,
          start: start,
          end: end,
          length: longestMatch
        });
        i = end - 1;
      }
    }

    return matches;
  }

  censorText(text, matches) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    let censored = text;
    let offset = 0;

    for (const match of matches) {
      const start = match.start + offset;
      const end = match.end + offset;
      const asterisks = '*'.repeat(match.length);
      censored = censored.substring(0, start) + asterisks + censored.substring(end);
      offset += asterisks.length - match.length;
    }

    return censored;
  }

  scan(text, options = { censor: false }) {
    if (!text || typeof text !== 'string') {
      return {
        isClean: true,
        message: 'Empty or invalid input',
        censoredText: text || ''
      };
    }

    if (text.trim().length === 0) {
      return {
        isClean: true,
        message: 'Whitespace only input',
        censoredText: text
      };
    }

    if (this.hasExcessiveRepetition(text)) {
      return {
        isClean: false,
        message: 'Spam detected: excessive character repetition.',
        censoredText: text
      };
    }

    const matches = this.findMatches(text);

    if (matches.length === 0) {
      return {
        isClean: true,
        message: 'Clean',
        censoredText: text
      };
    }

    const censoredText = options.censor ? this.censorText(text, matches) : text;

    return {
      isClean: false,
      message: options.censor ? 'Inappropriate content replaced.' : 'Inappropriate content detected.',
      censoredText: censoredText,
      matches: matches
    };
  }

  getStats() {
    return {
      wordCount: this.wordCount,
      hasWords: this.wordCount > 0
    };
  }

  clear() {
    this.root = new TrieNode();
    this.wordCount = 0;
  }

  getAllWords() {
    const words = [];
    const traverse = (node, prefix) => {
      if (node.isEndOfWord) {
        words.push(prefix);
      }
      for (const [char, child] of node.children) {
        traverse(child, prefix + char);
      }
    };
    traverse(this.root, '');
    return words;
  }

  delete(word) {
    if (!word || typeof word !== 'string') {
      return false;
    }

    const normalizedWord = this.normalize(word, true);
    if (normalizedWord.length === 0) {
      return false;
    }

    const deleteHelper = (node, index) => {
      if (index === normalizedWord.length) {
        if (!node.isEndOfWord) {
          return false;
        }
        node.isEndOfWord = false;
        this.wordCount--;
        return node.children.size === 0;
      }

      const char = normalizedWord[index];
      if (!node.children.has(char)) {
        return false;
      }

      const shouldDelete = deleteHelper(node.children.get(char), index + 1);

      if (shouldDelete) {
        node.children.delete(char);
        return node.children.size === 0 && !node.isEndOfWord;
      }

      return false;
    };

    deleteHelper(this.root, 0);
    return true;
  }
}

module.exports = Trie;