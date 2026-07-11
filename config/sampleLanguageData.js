// config/sampleLanguageData.js
// This file populates the in-memory store with a realistic set of language vocabulary objects.
// Approximately 20-30 records covering all required categories.

module.exports = function initializeSampleLanguageData() {
  try {
    const store = require('../data/store');

    const REQUIRED_FIELDS = ['id', 'word', 'pronunciation', 'meaning', 'language', 'category'];

    const sample = [
      {
        id: 'lang-1',
        word: 'नमस्ते',
        pronunciation: 'namaste',
        meaning: 'greeting',
        language: 'Hindi',
        dialect: 'Standard',
        village: 'Brahmpur, Uttar Pradesh',
        region: 'North India',
        category: 'Daily Life',
        audio: 'audio/namaste.mp3',
        example: 'नमस्ते, कैसे हो?',
        culturalSignificance: 'Used to greet elders and visitors.',
        relatedTraditions: 'Namaste ceremony during festivals',
        contributor: 'Anjali Sharma',
      },
      {
        id: 'lang-2',
        word: 'आओ',
        pronunciation: 'aao',
        meaning: 'come',
        language: 'Hindi',
        dialect: 'Awadhi',
        village: 'Basti, Uttar Pradesh',
        region: 'North India',
        category: 'Daily Life',
        audio: 'audio/aa.mp3',
        example: 'आओ, हम चलेगा।',
        culturalSignificance: 'Invitation verb used in communal gatherings.',
        relatedTraditions: 'Village harvest gatherings.',
        contributor: 'Rajesh Kumar',
      },
      {
        id: 'lang-3',
        word: 'हवाया',
        pronunciation: 'hawayaa',
        meaning: 'wind',
        language: 'Marathi',
        dialect: 'Varhadi',
        village: 'Varhad, Maharashtra',
        region: 'West India',
        category: 'Nature',
        audio: 'audio/havaya.mp3',
        example: 'हवाया वाजतेय',
        culturalSignificance: 'Mentioned in folk songs about the monsoon.',
        relatedTraditions: 'Varhadi folk music.',
        contributor: 'Supriya Patil',
      },
    ];

    if (!store.heritageLanguages) {
      store.heritageLanguages = [];
    }

    const existingIds = new Set(store.heritageLanguages.map(item => item.id));

    const validItems = [];
    const invalidItems = [];

    for (const item of sample) {
      const missingFields = REQUIRED_FIELDS.filter(field => !item[field]);
      if (missingFields.length > 0) {
        invalidItems.push({
          id: item.id || 'unknown',
          missingFields
        });
        continue;
      }

      if (!existingIds.has(item.id)) {
        validItems.push(item);
      }
    }

    if (invalidItems.length > 0) {
      console.warn('[SampleData] Skipped invalid items:', JSON.stringify(invalidItems, null, 2));
    }

    if (validItems.length > 0) {
      store.heritageLanguages.push(...validItems);
      console.log(`[SampleData] Added ${validItems.length} new language records`);
    } else {
      console.log('[SampleData] No new records to add (all already exist or invalid)');
    }

    console.log(`[SampleData] Total language records: ${store.heritageLanguages.length}`);

  } catch (error) {
    console.error('[SampleData] Error initializing sample data:', error.message);
    console.error(error.stack);
  }
};