module.exports = function mediaRules(engine) {
  const validateMediaPath = (url, resourceId, resourceType, fieldName) => {
    if (!url || typeof url !== 'string') {
      engine.addIssue('INVALID_MEDIA', 'MEDIUM', resourceId, resourceType, `Missing or invalid media URL in ${fieldName}`, {
        action: 'UPDATE_FIELD', target: fieldName, value: 'Provide valid URL string'
      });
      return;
    }
    const validFormat = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('images/') || url.startsWith('/');
    if (!validFormat) {
      engine.addIssue('INVALID_MEDIA', 'LOW', resourceId, resourceType, `Suspicious media URL format in ${fieldName}: ${url}`, {
        action: 'VERIFY_URL', target: fieldName, value: url
      });
    }
  };

  engine.registerRule('artisan', (artisan) => {
    if (artisan.portfolio && Array.isArray(artisan.portfolio)) {
      artisan.portfolio.forEach((work, idx) => {
        validateMediaPath(work.image, artisan.id || 'unknown', 'artisan', `portfolio[${idx}].image`);
      });
    }
  });

  engine.registerRule('storySourceData', (story) => {
    if (story.chapters && Array.isArray(story.chapters)) {
      story.chapters.forEach((chapter, idx) => {
        if (chapter.mediaUrl) {
          validateMediaPath(chapter.mediaUrl, story.id || 'unknown', 'storySourceData', `chapters[${idx}].mediaUrl`);
        }
      });
    }
  });
};
