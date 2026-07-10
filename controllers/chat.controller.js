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
    } else if (question.includes('tradition') || question.includes('culture')) {
      response +=
        "rural traditions are living practices passed down through generations. They include oral stories, craft techniques, festival rituals, and community practices that define each region's unique identity.";
    } else {
      response +=
        'I can help you learn about rural traditions, crafts, festivals, and stories. Try asking about Kantha embroidery, Madhubani paintings, village festivals, or the traditions of specific regions like Sundarbans or Bengal.';
    }

    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Error processing chat request' });
  }
};
module.exports = {
  chatResponse,
};
