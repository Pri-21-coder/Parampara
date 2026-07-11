const store = require('../data/store');

const chatResponse = (req, res) => {
  try {
    if (!req.body.question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const question = req.body.question.toLowerCase();
    let words = ['good', 'awesome', 'excellent', 'nice'];
    let response = `That is ${words[Math.floor(Math.random() * 3)]} question to ask about, `;

    // 1. Dynamic Artifact Database Lookup
    const artifacts = store.artifacts ? store.artifacts.values() : [];
    let matchedArtifact = null;

    for (const art of artifacts) {
      const artName = art.name.toLowerCase();
      const artCat = art.category.toLowerCase();
      const artComm = art.community ? art.community.toLowerCase() : '';

      // Matches full name, category, community, or individual descriptive words
      if (
        question.includes(artName) ||
        question.includes(artCat) ||
        (artComm && question.includes(artComm)) ||
        art.name.toLowerCase().split(' ').some(word => word.length > 4 && question.includes(word))
      ) {
        matchedArtifact = art;
        break;
      }
    }

    if (matchedArtifact) {
      if (question.includes('festival') || question.includes('celebration')) {
        const festivalsStr = matchedArtifact.associatedFestivals && matchedArtifact.associatedFestivals.length > 0
          ? matchedArtifact.associatedFestivals.join(', ')
          : 'no specific festivals documented';
        response += `the festivals and celebrations associated with the ${matchedArtifact.name} include: ${festivalsStr}. It is traditionally used or displayed during these cultural occasions.`;
      } else if (question.includes('village') || question.includes('where') || question.includes('region') || question.includes('district') || question.includes('state')) {
        const villagesStr = matchedArtifact.relatedVillages && matchedArtifact.relatedVillages.length > 0
          ? `, and is connected to ${matchedArtifact.relatedVillages.join(' and ')}`
          : '';
        response += `the ${matchedArtifact.name} originates from ${matchedArtifact.village || 'unknown village'} in the ${matchedArtifact.district} district of ${matchedArtifact.state}${villagesStr}.`;
      } else if (question.includes('material') || question.includes('made of') || question.includes('composition')) {
        const materialsStr = matchedArtifact.materials && matchedArtifact.materials.length > 0
          ? matchedArtifact.materials.join(', ')
          : 'traditional local elements';
        response += `the materials used to craft the ${matchedArtifact.name} include ${materialsStr}. Its manufacture process utilizes the historical period's style: ${matchedArtifact.historicalPeriod}.`;
      } else {
        response += `the ${matchedArtifact.name}. This is a ${matchedArtifact.category} artifact from the ${matchedArtifact.community} community in ${matchedArtifact.village}, ${matchedArtifact.state}. ${matchedArtifact.description} Cultural Significance: ${matchedArtifact.culturalSignificance}`;
      }
    } else if (question.includes('dhokra') || question.includes('dokra')) {
      const dhokraArt = artifacts.find(art => art.name.toLowerCase().includes('dhokra') || art.name.toLowerCase().includes('dokra'));
      if (dhokraArt) {
        response += `Dhokra artifacts. A prime example is the ${dhokraArt.name} of the ${dhokraArt.community} community in ${dhokraArt.village}, ${dhokraArt.state}. ${dhokraArt.description} It is made of ${dhokraArt.materials.join(', ')}.`;
      } else {
        response += "Dokra (or Dhokra) which is a traditional non-ferrous metal casting technique using the lost-wax casting method, practiced by tribal communities in Chhattisgarh for over 4,000 years.";
      }
    } else if (question.includes('blue') && question.includes('door')) {
      response +=
        "in many villages, doors are painted blue to ward off evil spirits and bring prosperity to the home. This tradition is especially common in rural areas where it's believed to protect the household.";
    } else if (question.includes('kantha') || question.includes('embroidery')) {
      response +=
        'Kantha is a traditional embroidery style from Bengal, where old saris are layered and stitched together with running stitches to create beautiful patterns. Each pattern has symbolic meaning - lotus for purity, fish for fertility, and trees for life.';
    } else if (
      question.includes('madhubani') ||
      question.includes('painting')
    ) {
      response +=
        'Madhubani painting is a traditional art form from Bihar, characterized by vibrant colors and geometric patterns. These paintings often depict mythological stories, nature, and daily life.';
    } else if (question.includes('dokra') || question.includes('metal')) {
      response +=
        'Dokra is a traditional metal casting technique using the lost-wax method, practiced by tribal communities in Chhattisgarh. This ancient craft has been preserved for over 4000 years.';
    } else if (
      question.includes('festival') ||
      question.includes('celebration')
    ) {
      response +=
        'rural festivals are deeply connected to agricultural cycles and local legends. Each village has unique celebrations tied to their heritage, like Durga Puja in Bengal, Chhath in Bihar, and harvest festivals across regions.';
    } else if (question.includes('sundarbans') || question.includes('tiger')) {
      response +=
        'The Sundarbans region has a unique relationship with nature. Folk tales like the story of Bonbibi reflect the deep connection between the people and the forest, where tigers and humans coexist in a delicate balance.';
    let response = `That is a ${words[Math.floor(Math.random() * words.length)]} question to ask about, `;
    let handled = false;

    // --- 1. Seasonal/Calendar Queries ---
    const monthsList = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const seasonsList = ['spring', 'summer', 'monsoon', 'autumn', 'winter'];
    const statesList = [
      'andhra pradesh', 'kerala', 'gujarat', 'maharashtra', 'west bengal',
      'bihar', 'rajasthan', 'punjab', 'assam', 'tripura', 'nagaland',
      'tamil nadu', 'goa', 'mizoram', 'manipur', 'karnataka', 'haryana',
      'himachal pradesh', 'uttarakhand', 'odisha', 'telangana', 'jharkhand',
      'ladakh'
    ];

    let matchedMonth = monthsList.find((m) => question.includes(m));
    let matchedSeason = seasonsList.find((s) => question.includes(s));
    let matchedState = statesList.find((st) => question.includes(st));

    if (
      question.includes('this month') ||
      question.includes('happening now') ||
      question.includes('current month')
    ) {
      const currentMonthName = new Date()
        .toLocaleString('en-US', { month: 'long' })
        .toLowerCase();
      matchedMonth = currentMonthName;
    }

    // Match by specific festival name from calendarEvents
    let matchedFestival = (store.calendarEvents || []).find((e) =>
      question.includes(e.title.toLowerCase())
    );

    if (matchedMonth) {
      const events = (store.calendarEvents || []).filter(
        (e) => e.month.toLowerCase() === matchedMonth
      );
      if (events.length > 0) {
        response +=
          `in ${matchedMonth.charAt(0).toUpperCase() + matchedMonth.slice(1)}, we celebrate the following cultural events:\n` +
          events
            .map(
              (e) =>
                `• **${e.title}** (${e.category} in ${e.village}, ${e.state}): ${e.description}`
            )
            .join('\n') +
          `\n\nYou can explore more on our new Seasonal Calendar page!`;
        handled = true;
      } else {
        response += `our calendar currently does not show any major events in ${matchedMonth}.`;
        handled = true;
      }
    } else if (matchedSeason) {
      const events = (store.calendarEvents || []).filter(
        (e) => e.season.toLowerCase() === matchedSeason
      );
      if (events.length > 0) {
        response +=
          `during the ${matchedSeason} season, several festivals take place:\n` +
          events
            .slice(0, 5)
            .map((e) => `• **${e.title}** in ${e.state} (${e.month})`)
            .join('\n') +
          `\n\nYou can view all of them on the Seasonal Calendar page under the Seasonal View!`;
        handled = true;
      } else {
        response += `we don't have events recorded for the ${matchedSeason} season yet.`;
        handled = true;
      }
    } else if (
      matchedState &&
      (question.includes('festival') ||
        question.includes('celebrat') ||
        question.includes('event') ||
        question.includes('harvest'))
    ) {
      const events = (store.calendarEvents || []).filter((e) =>
        e.state.toLowerCase().includes(matchedState)
      );
      if (events.length > 0) {
        response +=
          `in the state of ${matchedState
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')}, we highlight these heritage events:\n` +
          events
            .slice(0, 5)
            .map(
              (e) =>
                `• **${e.title}** (${e.category} in ${e.village}) - celebrated in ${e.month}`
            )
            .join('\n') +
          `\n\nVisit the Seasonal Calendar page and filter by "${matchedState
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')}" to view the full details!`;
        handled = true;
      } else {
        response += `we do not have recorded events for ${matchedState} yet, but we are continuously updating our archive!`;
        handled = true;
      }
    } else if (matchedFestival) {
      response += `**${matchedFestival.title}** is a ${matchedFestival.category} celebrated in ${matchedFestival.village}, ${matchedFestival.state} during the ${matchedFestival.season} season (${matchedFestival.month}). ${matchedFestival.description} Historical background: ${matchedFestival.historicalBackground} Key rituals include: ${matchedFestival.rituals.slice(0, 3).join(', ')}.`;
      handled = true;
    }

    // --- 2. Artifact Database Lookup (if not handled by calendar) ---
    if (!handled) {
      const artifacts = store.artifacts ? Array.from(store.artifacts.values()) : [];
      let matchedArtifact = null;

      for (const art of artifacts) {
        const artName = art.name.toLowerCase();
        const artCat = art.category.toLowerCase();
        const artComm = art.community ? art.community.toLowerCase() : '';

        if (
          question.includes(artName) ||
          question.includes(artCat) ||
          (artComm && question.includes(artComm)) ||
          art.name.toLowerCase().split(' ').some(word => word.length > 4 && question.includes(word))
        ) {
          matchedArtifact = art;
          break;
        }
      }

      if (matchedArtifact) {
        if (question.includes('festival') || question.includes('celebration')) {
          const festivalsStr = matchedArtifact.associatedFestivals && matchedArtifact.associatedFestivals.length > 0
            ? matchedArtifact.associatedFestivals.join(', ')
            : 'no specific festivals documented';
          response += `the festivals and celebrations associated with the ${matchedArtifact.name} include: ${festivalsStr}. It is traditionally used or displayed during these cultural occasions.`;
        } else if (question.includes('village') || question.includes('where') || question.includes('region') || question.includes('district') || question.includes('state')) {
          const villagesStr = matchedArtifact.relatedVillages && matchedArtifact.relatedVillages.length > 0
            ? `, and is connected to ${matchedArtifact.relatedVillages.join(' and ')}`
            : '';
          response += `the ${matchedArtifact.name} originates from ${matchedArtifact.village || 'unknown village'} in the ${matchedArtifact.district} district of ${matchedArtifact.state}${villagesStr}.`;
        } else if (question.includes('material') || question.includes('made of') || question.includes('composition')) {
          const materialsStr = matchedArtifact.materials && matchedArtifact.materials.length > 0
            ? matchedArtifact.materials.join(', ')
            : 'traditional local elements';
          response += `the materials used to craft the ${matchedArtifact.name} include ${materialsStr}. Its manufacture process utilizes the historical period's style: ${matchedArtifact.historicalPeriod}.`;
        } else {
          response += `the ${matchedArtifact.name}. This is a ${matchedArtifact.category} artifact from the ${matchedArtifact.community} community in ${matchedArtifact.village}, ${matchedArtifact.state}. ${matchedArtifact.description} Cultural Significance: ${matchedArtifact.culturalSignificance}`;
        }
        handled = true;
      } else if (question.includes('dhokra') || question.includes('dokra')) {
        const dhokraArt = artifacts.find(art => art.name.toLowerCase().includes('dhokra') || art.name.toLowerCase().includes('dokra'));
        if (dhokraArt) {
          response += `Dhokra artifacts. A prime example is the ${dhokraArt.name} of the ${dhokraArt.community} community in ${dhokraArt.village}, ${dhokraArt.state}. ${dhokraArt.description} It is made of ${dhokraArt.materials.join(', ')}.`;
        } else {
          response += "Dokra (or Dhokra) which is a traditional non-ferrous metal casting technique using the lost-wax casting method, practiced by tribal communities in Chhattisgarh for over 4,000 years.";
        }
        handled = true;
      } else if (question.includes('blue') && question.includes('door')) {
        response +=
          "in many villages, doors are painted blue to ward off evil spirits and bring prosperity to the home. This tradition is especially common in rural areas where it's believed to protect the household.";
        handled = true;
      } else if (question.includes('kantha') || question.includes('embroidery')) {
        response +=
          'Kantha is a traditional embroidery style from Bengal, where old saris are layered and stitched together with running stitches to create beautiful patterns. Each pattern has symbolic meaning - lotus for purity, fish for fertility, and trees for life.';
        handled = true;
      } else if (
        question.includes('madhubani') ||
        question.includes('painting')
      ) {
        response +=
          'Madhubani painting is a traditional art form from Bihar, characterized by vibrant colors and geometric patterns. These paintings often depict mythological stories, nature, and daily life.';
        handled = true;
      } else if (question.includes('metal')) {
        response +=
          'Dokra is a traditional metal casting technique using the lost-wax method, practiced by tribal communities in Chhattisgarh. This ancient craft has been preserved for over 4000 years.';
        handled = true;
      } else if (
        question.includes('festival') ||
        question.includes('celebration')
      ) {
        response +=
          'rural festivals are deeply connected to agricultural cycles and local legends. Each village has unique celebrations tied to their heritage, like Durga Puja in Bengal, Chhath in Bihar, and harvest festivals across regions.';
        handled = true;
      } else if (
        question.includes('sundarbans') ||
        question.includes('tiger')
      ) {
        response +=
          'The Sundarbans region has a unique relationship with nature. Folk tales like the story of Bonbibi reflect the deep connection between the people and the forest, where tigers and humans coexist in a delicate balance.';
        handled = true;
      } else if (
        question.includes('tradition') ||
        question.includes('culture')
      ) {
        response +=
          "rural traditions are living practices passed down through generations. They include oral stories, craft techniques, festival rituals, and community practices that define each region's unique identity.";
        handled = true;
      } else {
        response +=
          'I can help you learn about rural traditions, crafts, festivals, and stories. Try asking about Kantha embroidery, Madhubani paintings, village festivals, or the traditions of specific regions like Sundarbans or Bengal.';
        handled = true;
      }
    }

    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Error processing chat request' });
  }
};

module.exports = {
  chatResponse,
};
