const store = require('../data/store');

const getStoryData = (req, res, next) =>
{
    try
    {
        const item = req.query.item;

        if (!item)
        {
            return res.json(store.storySourceData || []);
        }

        const matchedItem = store.storySourceData.find((d) =>
        {
            return d.name.toLowerCase() === item.toLowerCase();
        });

        if (!matchedItem)
        {
            return res.status(404).json({
                error: `Cultural story data not found for item: ${item}`
            });
        }

        res.json({
            name: matchedItem.name,
            village: matchedItem.village,
            history: matchedItem.history,
            traditions: matchedItem.traditions,
            festivals: matchedItem.festivals,
            landmarks: matchedItem.landmarks,
            culturalSignificance: matchedItem.culturalSignificance,
            notableFacts: matchedItem.notableFacts,
            chapters: matchedItem.chapters || []
        });
    }
    catch (error)
    {
        console.error('Failed to get story data:', error);
        next(error);
    }
};

module.exports = {
    getStoryData
};
