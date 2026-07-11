module.exports = function relationshipRules(engine) {
  engine.registerRule('heritagePath', (path) => {
    if (!path.items || !Array.isArray(path.items)) {
      engine.addIssue('INVALID_RELATIONSHIP', 'MEDIUM', path.id || 'unknown', 'heritagePath', 'Path items array is missing or invalid', {
        action: 'INITIALIZE_ARRAY', target: 'items'
      });
      return;
    }

    path.items.forEach(itemId => {
      const targetNode = engine.graph.getNode(`culturalItem:${itemId}`);
      if (!targetNode) {
        engine.addIssue('BROKEN_REFERENCE', 'HIGH', path.id || 'unknown', 'heritagePath', `References missing culturalItem ID: ${itemId}`, {
          action: 'REMOVE_REFERENCE', target: 'items', value: itemId
        });
      }
    });
  });

  engine.registerRule('timelineEvent', (event) => {
    if (!event.item || typeof event.item !== 'string') {
      engine.addIssue('MISSING_FIELD', 'MEDIUM', event.id || 'unknown', 'timelineEvent', 'Event missing or invalid item reference', {
        action: 'UPDATE_FIELD', target: 'item'
      });
      return;
    }

    // Since timeline references by title, we mapped culturalItems titles to IDs in the engine state
    const targetId = engine.state.titleToIdMap.get(event.item.toLowerCase());
    if (!targetId) {
      engine.addIssue('BROKEN_REFERENCE', 'MEDIUM', event.id || 'unknown', 'timelineEvent', `References unknown culturalItem title: ${event.item}`, {
        action: 'FIX_REFERENCE', target: 'item', value: event.item
      });
    }
  });
};
