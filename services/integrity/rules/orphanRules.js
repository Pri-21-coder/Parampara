module.exports = function orphanRules(engine) {
  engine.registerPostProcessRule(() => {
    // Check graph for true orphans
    const orphanIds = engine.graph.getOrphans('culturalItem');
    
    orphanIds.forEach(graphId => {
      // graphId is formatted as "culturalItem:id"
      const [, actualId] = graphId.split(':');
      const itemData = engine.graph.getNode(graphId).data;
      
      engine.addIssue('ORPHANED_RECORD', 'LOW', actualId, 'culturalItem', `Item '${itemData.title || 'Untitled'}' has no incoming references`, {
        action: 'LINK_TO_PATH', target: actualId
      });
    });
  });
};
