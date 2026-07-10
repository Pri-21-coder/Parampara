const store = require('../data/store');

const sampleEvents = [
  // === JANUARY ===
  {
    id: 'ev-jan-1',
    title: 'Makar Sankranti',
    category: 'Harvest Festival',
    season: 'Winter',
    month: 'January',
    startDate: '2027-01-14',
    endDate: '2027-01-15',
    state: 'Gujarat',
    district: 'Ahmedabad',
    village: 'Sabarmati Village',
    community: 'Gujarati community',
    description:
      'A major harvest festival marking the transition of the Sun into the Capricorn constellation, celebrated with kite flying and traditional sweets.',
    historicalBackground:
      'Mentions of Uttarayan date back to the Puranas, signifying the end of winter solstice and starting of longer days.',
    culturalImportance:
      'Marks the harvest season and beginning of an auspicious phase of the year. Symbolizes harmony and positivity.',
    rituals: [
      'Flying kites from rooftops',
      'Offering prayers to the Sun God',
      'Exchanging sweets',
    ],
    associatedCrafts: [
      'Manjha (glass-coated thread) making',
      'Paper kite crafting',
    ],
    associatedRecipes: [
      'Undhiyu (mixed vegetable dish)',
      'Til-Gud Laddoo (sesame seed sweets)',
    ],
    associatedStories: [
      'The legend of deities waking up from their six-month slumber.',
    ],
    associatedArtifacts: [
      'Patang (traditional paper kites)',
      'Firkee (spool for thread)',
    ],
    relatedVillages: ['Sabarmati Village'],
    relatedHeritageTrails: ['Kite Maker Trail'],
    relatedNaturalSites: ['Sabarmati Riverfront'],
    images: [
      'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [23.0225, 72.5714],
    visitorInformation:
      'Kite flying happens all day on terrace roofs. Grand displays near Sabarmati.',
    travelTips:
      'Wear sunglasses, apply sunblock, and protect your hands with fingerguards.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-jan-2',
    title: 'Thai Pongal',
    category: 'Harvest Festival',
    season: 'Winter',
    month: 'January',
    startDate: '2027-01-14',
    endDate: '2027-01-17',
    state: 'Tamil Nadu',
    district: 'Madurai',
    village: 'Alanganallur Village',
    community: 'Tamil community',
    description:
      'A multi-day thanksgiving harvest festival dedicated to the Sun God, featuring the boiling of newly harvested rice in clay pots.',
    historicalBackground:
      'Pongal is an ancient festival of Tamils dating back to the Sangam Age (circa 3rd century BCE to 3rd century CE).',
    culturalImportance:
      'Celebrates the abundance of harvest, honoring the sun and the farm cattle that make agriculture possible.',
    rituals: [
      'Boiling fresh rice in clay pots until it overflows (Pongal)',
      'Drawing Kolam (rice powder patterns) at entrances',
      'Honoring cattle (Mattu Pongal)',
    ],
    associatedCrafts: ['Earthen clay pot painting', 'Sugarcane harvesting'],
    associatedRecipes: [
      'Sweet Pongal (rice boiled with jaggery and milk)',
      'Ven Pongal (savory cumin-spiced rice)',
    ],
    associatedStories: [
      'Lord Shiva sending Nandi to earth to tell humans to take oil bath daily and eat monthly.',
    ],
    associatedArtifacts: ['Painted clay pots', 'Traditional brass vessels'],
    relatedVillages: ['Alanganallur Village'],
    relatedHeritageTrails: ['Madurai Temple Trail'],
    relatedNaturalSites: ['Sirumalai Hills'],
    images: [
      'https://images.unsplash.com/photo-1590076215667-873d6100ab17?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [10.0512, 78.1189],
    visitorInformation:
      'Main festivities occur in local households and public community halls.',
    travelTips:
      'Attend Mattu Pongal in villages around Madurai for authentic experiences.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-jan-3',
    title: 'Lohri',
    category: 'Harvest Festival',
    season: 'Winter',
    month: 'January',
    startDate: '2027-01-13',
    endDate: '2027-01-13',
    state: 'Punjab',
    district: 'Amritsar',
    village: 'Preet Nagar',
    community: 'Punjabi community',
    description:
      'A lively winter folk festival celebrated with bonfires, folk singing, dancing, and offering seasonal treats to the fire.',
    historicalBackground:
      'Commemorates the passing of the winter solstice and celebrates the harvesting of Rabi (winter) crops like wheat.',
    culturalImportance:
      'Fosters community bonding and welcomes the return of longer, warmer days. Especially auspicious for newlyweds and newborns.',
    rituals: [
      'Lighting a community bonfire at sunset',
      'Throwing til, peanuts, and popcorn into the fire',
      'Singing Lohri songs (Sunder Mundriye)',
    ],
    associatedCrafts: [
      'Traditional embroidery (Phulkari)',
      'Folk instrument (Dhol) making',
    ],
    associatedRecipes: [
      'Sarson ka Saag & Makki ki Roti',
      'Gajak (sesame-jaggery bars)',
      'Til-rewri',
    ],
    associatedStories: [
      'Dulla Bhatti, a Punjabi hero who rescued girls from being sold into slavery.',
    ],
    associatedArtifacts: ['Phulkari dupattas', 'Folk Dhol drums'],
    relatedVillages: ['Preet Nagar'],
    relatedHeritageTrails: ['Amritsari Culinary Trail'],
    relatedNaturalSites: ['Harike Wetland'],
    images: [
      'https://images.unsplash.com/photo-1610016302534-6f67f1c968d8?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [31.634, 74.8723],
    visitorInformation:
      'Gatherings are held in village squares and household courtyards during the evening.',
    travelTips:
      'Dress warmly in vibrant traditional Punjabi attire to participate.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-jan-4',
    title: 'Bhogali Bihu',
    category: 'Harvest Festival',
    season: 'Winter',
    month: 'January',
    startDate: '2027-01-14',
    endDate: '2027-01-15',
    state: 'Assam',
    district: 'Sivasagar',
    village: 'Rongpur Village',
    community: 'Assamese community',
    description:
      'Also known as Magh Bihu, this harvest festival is marked by feasts, burning of traditional thatch huts (Mejis), and indigenous sports.',
    historicalBackground:
      'Originated as an ancient agrarian ritual celebrating the end of the harvesting season when granaries are full.',
    culturalImportance:
      'Brings communities together to share agricultural wealth and pray for prosperity and protection in the coming cycle.',
    rituals: [
      'Erecting Mejis (bamboo and straw towers)',
      'Overnight feasting in Uruka cottages',
      'Burning Meji on Bihu morning',
    ],
    associatedCrafts: [
      'Assamese handloom weaving',
      'Bamboo cottage construction',
    ],
    associatedRecipes: [
      'Pitha (rice cakes filled with sesame/coconut)',
      'Jolpan (roasted rice with curd and jaggery)',
    ],
    associatedStories: [
      'Folk stories of agrarian deities protecting crops from pests.',
    ],
    associatedArtifacts: [
      'Meji towers',
      'Xorai (traditional tray)',
      'Gayan-Bayan drums',
    ],
    relatedVillages: ['Rongpur Village'],
    relatedHeritageTrails: ['Brahmaputra Weaver Trail'],
    relatedNaturalSites: ['Majuli River Island'],
    images: [
      'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [26.9826, 94.6425],
    visitorInformation:
      'Feasts are held on Uruka night (Jan 13/14). Public bonfires at dawn.',
    travelTips:
      'Taste different types of Pithas prepared fresh by local hosts.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-jan-5',
    title: 'Joydev Kenduli Mela',
    category: 'Folk Performance',
    season: 'Winter',
    month: 'January',
    startDate: '2027-01-14',
    endDate: '2027-01-16',
    state: 'West Bengal',
    district: 'Birbhum',
    village: 'Kenduli Village',
    community: 'Baul community',
    description:
      'A grand gathering of Bauls (mystic minstrel musicians of Bengal) who perform their soulful folk music on the banks of the Ajay River.',
    historicalBackground:
      'Commemorates the legendary poet Joydev, author of Gita Govinda, who lived in Kenduli.',
    culturalImportance:
      'A unique spiritual gathering celebrating Baul music, recognized by UNESCO as Masterpiece of the Oral and Intangible Heritage of Humanity.',
    rituals: [
      'Baul songs performed in temporary tents (Akhdas)',
      'Holy dip in the Ajay River on Makar Sankranti day',
    ],
    associatedCrafts: [
      'Ektara (single-stringed instrument) making',
      'Clay pottery',
    ],
    associatedRecipes: [
      'Khichuri (lentil-rice porridge)',
      'Nolen Gur Payesh (date palm jaggery pudding)',
    ],
    associatedStories: [
      'The legend of poet Joydev writing Gita Govinda and obtaining divine assistance.',
    ],
    associatedArtifacts: ['Ektara instrument', 'Dubki drum'],
    relatedVillages: ['Kenduli Village'],
    relatedHeritageTrails: ['Mystic Baul Heritage Trail'],
    relatedNaturalSites: ['Ajay River banks'],
    images: [
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [23.6428, 87.4273],
    visitorInformation:
      'Dozens of Akhdas are set up with live music running 24 hours a day during the mela.',
    travelTips:
      'Stay in simple local homestays or tents to catch midnight music sessions.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-jan-6',
    title: 'International Kite Festival',
    category: 'Seasonal Market',
    season: 'Winter',
    month: 'January',
    startDate: '2027-01-08',
    endDate: '2027-01-14',
    state: 'Gujarat',
    district: 'Ahmedabad',
    village: 'Sabarmati Village',
    community: 'Craftsmen and kite fliers',
    description:
      'A spectacular global festival showcasing creative and large-scale kites flown by international and local flyers.',
    historicalBackground:
      'Started in 1989 to bring global visibility to the traditional kite-flying celebrations of Uttarayan in Gujarat.',
    culturalImportance:
      'Fosters international tourism, creates massive livelihoods for local kite makers, and spreads the joy of kite flying.',
    rituals: [
      'Flying giant show kites',
      'Kite crafting workshops',
      'Night kite flying with illuminated paper lanterns (tukals)',
    ],
    associatedCrafts: [
      'Patang kite-making',
      'Manjha thread dyeing and glassing',
    ],
    associatedRecipes: ['Kachariyu (sesame snack)', 'Jalebi-Fafda'],
    associatedStories: [
      'Stories of local kite-making families running their business for generations.',
    ],
    associatedArtifacts: ['Giant kites', 'Manjha spools'],
    relatedVillages: ['Sabarmati Village'],
    relatedHeritageTrails: ['Kite Maker Trail'],
    relatedNaturalSites: ['Sabarmati Estuary'],
    images: [
      'https://images.unsplash.com/photo-1507038772120-7bef736b7f9a?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [23.03, 72.58],
    visitorInformation:
      'Main grounds are at Sabarmati Riverfront. Entry is open to public.',
    travelTips:
      'Reach early to secure a good viewing spot near the riverbank barriers.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // === FEBRUARY ===
  {
    id: 'ev-feb-1',
    title: 'Losar Festival',
    category: 'Tribal Festival',
    season: 'Winter',
    month: 'February',
    startDate: '2027-02-17',
    endDate: '2027-02-19',
    state: 'Arunachal Pradesh',
    district: 'Tawang',
    village: 'Monpa Village',
    community: 'Monpa tribe',
    description:
      'The Tibetan New Year, celebrated by Monpa Buddhists with mask dances, prayers, and cleaning rituals to drive away evil spirits.',
    historicalBackground:
      'Pre-Buddhist origin, dating back to the Bon religion where incense-burning was used to appease local spirits.',
    culturalImportance:
      'Represents renewal, purification, and community unity for the coming year.',
    rituals: [
      'Sweeping the house clean',
      'Chanting prayers and offering butter lamps',
      'Aji Lhamo mask dance performances',
    ],
    associatedCrafts: ['Monpa mask carving', 'Traditional incense making'],
    associatedRecipes: [
      'Khapse (fried cookies)',
      'Guthuk (noodle soup with dough balls)',
    ],
    associatedStories: [
      'The legend of battles between gods and demons representing the victory of good over evil.',
    ],
    associatedArtifacts: ['Monpa masks', 'Buddhist prayer flags'],
    relatedVillages: ['Monpa Village'],
    relatedHeritageTrails: ['Tawang Monastery Trail'],
    relatedNaturalSites: ['Pankang Teng Tso Lake'],
    images: [
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [27.5861, 91.8594],
    visitorInformation: 'Takes place in Monpa villages and Tawang Monastery.',
    travelTips: 'Requires Inner Line Permit (ILP). Pack heavy winter woolens.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-feb-2',
    title: 'Taj Mahotsav',
    category: 'Craft Fair',
    season: 'Winter',
    month: 'February',
    startDate: '2027-02-18',
    endDate: '2027-02-27',
    state: 'Uttar Pradesh',
    district: 'Agra',
    village: 'Shilpgram',
    community: 'Artisans from across India',
    description:
      'A 10-day cultural extravaganza celebrating Indian crafts, arts, dance, and music near the Taj Mahal.',
    historicalBackground:
      'Initiated in 1992 by UP Tourism to showcase the rich arts, crafts, and culture of India.',
    culturalImportance:
      'Provides a key platform for rural artisans to sell their works directly to national and global tourists.',
    rituals: [
      'Procession with decorated elephants and camels',
      'Daily folk dance events',
      'Art workshops',
    ],
    associatedCrafts: [
      'Marble inlay (Pietra Dura)',
      'Brassware',
      'Wood carvings',
      'Chikan embroidery',
    ],
    associatedRecipes: [
      'Agra Petha (ash gourd sweet)',
      'Shahi Tukda',
      'Kebabs',
    ],
    associatedStories: [
      'Mughal court legends of royal encouragement of artisans.',
    ],
    associatedArtifacts: ['Marble inlay plates', 'Zardozi tapestry'],
    relatedVillages: ['Shilpgram'],
    relatedHeritageTrails: ['Mughal Craft Trail'],
    relatedNaturalSites: ['Yamuna River'],
    images: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [27.1682, 78.0494],
    visitorInformation:
      'Located at Shilpgram, near the Eastern gate of the Taj Mahal. Ticketed entry.',
    travelTips: 'Dedicate at least 3-4 hours to browse all the artisan stalls.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-feb-3',
    title: 'Surajkund International Crafts Mela',
    category: 'Craft Fair',
    season: 'Winter',
    month: 'February',
    startDate: '2027-02-01',
    endDate: '2027-02-15',
    state: 'Haryana',
    district: 'Faridabad',
    village: 'Surajkund Village',
    community: 'Global and Indian artisans',
    description:
      'The largest crafts mela in the world, showcasing traditional handlooms, handicrafts, and cultural heritage of India.',
    historicalBackground:
      'Began in 1987 to promote rural Indian handicrafts and handlooms under a unified platform.',
    culturalImportance:
      'Promotes rural craftsmanship, sustains traditional knowledge systems, and provides huge economic support to weavers.',
    rituals: [
      'Inauguration with regional folk instruments',
      'Interactive craft demonstrations by national awardees',
    ],
    associatedCrafts: [
      'Terracotta pottery',
      'Phulkari embroidery',
      'Madhubani paintings',
      'Pattachitra',
    ],
    associatedRecipes: ['Pinni (sweet)', 'Bajra khichri', 'Lassi'],
    associatedStories: [
      'Folk stories about the Sun Pool (Surajkund) built by King Surajpal.',
    ],
    associatedArtifacts: ['Terracotta pots', 'Handloom shawls'],
    relatedVillages: ['Surajkund Village'],
    relatedHeritageTrails: ['Haryana Heritage Trail'],
    relatedNaturalSites: ['Surajkund Lake'],
    images: [
      'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [28.4897, 77.2917],
    visitorInformation:
      'Tickets can be bought online. Very crowded on weekends.',
    travelTips:
      'Wear comfortable walking shoes. Bring reusable bags for purchases.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-feb-4',
    title: 'Jaisalmer Desert Festival',
    category: 'Folk Performance',
    season: 'Winter',
    month: 'February',
    startDate: '2027-02-22',
    endDate: '2027-02-24',
    state: 'Rajasthan',
    district: 'Jaisalmer',
    village: 'Sam Village',
    community: 'Rajasthani folk artists',
    description:
      'An annual festival showcasing Rajasthani desert culture, including camel races, turban tying, mustache competitions, and desert dances.',
    historicalBackground:
      "Organized to display Rajasthan's rich desert folklore, music, and royal camel traditions.",
    culturalImportance:
      'Preserves desert folk performing arts (Ghoomar, Kalbelia, Manganiyar music) and offers tourists an authentic desert experience.',
    rituals: [
      'Camel acrobatics and polo',
      'Turban tying contest',
      'Air Force skydiving displays over dunes',
    ],
    associatedCrafts: [
      'Camel leatherwork',
      'Mirror embroidery',
      'Puppet making',
    ],
    associatedRecipes: ['Dal Baati Churma', 'Ker Sangri (desert bean curry)'],
    associatedStories: ['The legend of the Bhatti Rajput kings of Jaisalmer.'],
    associatedArtifacts: ['Katputli puppets', 'Camel saddles'],
    relatedVillages: ['Sam Village'],
    relatedHeritageTrails: ['Desert Oasis Trail'],
    relatedNaturalSites: ['Sam Sand Dunes'],
    images: [
      'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [26.9157, 70.9083],
    visitorInformation:
      'Events are split between Jaisalmer Fort grounds and the Sam Sand Dunes.',
    travelTips:
      'Carry warm clothes for the night as desert temperatures drop rapidly.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-feb-5',
    title: 'Khajuraho Dance Festival',
    category: 'Folk Performance',
    season: 'Winter',
    month: 'February',
    startDate: '2027-02-20',
    endDate: '2027-02-26',
    state: 'Madhya Pradesh',
    district: 'Chhatarpur',
    village: 'Khajuraho Village',
    community: 'Classical dancers and artists',
    description:
      'A week-long classical dance festival held against the backdrop of the magnificent illuminated Khajuraho temples.',
    historicalBackground:
      'Started in 1975 to celebrate classical Indian dance forms like Kathak, Bharatanatyam, Odissi, and Kuchipudi.',
    culturalImportance:
      'Bridges heritage architecture and intangible performing arts, enhancing global appreciation of Indian classical dance.',
    rituals: [
      'Evening dance recitals',
      'Art discussions and seminars (Nepathya)',
    ],
    associatedCrafts: [
      'Stone sculpture replication craft',
      'Traditional jewelry making',
    ],
    associatedRecipes: ['Bhutte ki Kees', 'Mawa Bati sweet'],
    associatedStories: [
      'Chandel Rajput dynasty building the Khajuraho temples.',
    ],
    associatedArtifacts: ['Ghungroo (dancing bells)', 'Stone sculptures'],
    relatedVillages: ['Khajuraho Village'],
    relatedHeritageTrails: ['Bundelkhand Art Trail'],
    relatedNaturalSites: ['Panna National Park'],
    images: [
      'https://images.unsplash.com/photo-1608958416733-149d6832db73?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [24.8318, 79.9199],
    visitorInformation:
      'Performances take place in the open auditorium near the Western Group of Temples.',
    travelTips:
      'Book accommodation in advance. Evenings can be slightly chilly.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-feb-6',
    title: 'Deccan Festival',
    category: 'Village Celebration',
    season: 'Winter',
    month: 'February',
    startDate: '2027-02-25',
    endDate: '2027-02-28',
    state: 'Andhra Pradesh',
    district: 'Kurnool',
    village: 'Deccan Village',
    community: 'Deccan community',
    description:
      "A vibrant celebration of the Deccan region's rich history, food, music, and crafts, organized by local authorities and village elders.",
    historicalBackground:
      'Celebrates the historical synthesis of Deccani cultures under various ruling dynasties, showcasing Ghazals and Qawwalis.',
    culturalImportance:
      'Revives Deccani Urdu poetry (Mushaira), culinary arts, and folk performances unique to the plateau villages.',
    rituals: [
      'Mushaira (poetry recitations)',
      'Folk music gatherings',
      'Food bazaar inauguration',
    ],
    associatedCrafts: ['Bidriware (metal inlay)', 'Kondapalli wooden toys'],
    associatedRecipes: [
      'Hyderabadi Haleem',
      'Double ka Meetha',
      'Mirchi ka Salan',
    ],
    associatedStories: [
      'Tales of Sultan Quli Qutb Shah and local folk heroes.',
    ],
    associatedArtifacts: ['Bidriware boxes', 'Kondapalli toys'],
    relatedVillages: ['Deccan Village'],
    relatedHeritageTrails: ['Deccan Plateau Trail'],
    relatedNaturalSites: ['Belum Caves'],
    images: [
      'https://images.unsplash.com/photo-1596422846543-75c6fc1f4767?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [15.8284, 78.0373],
    visitorInformation:
      'Held in the public grounds of Kurnool. Traditional food stalls are open all day.',
    travelTips:
      'Try the authentic spicy Andhra dishes and local Deccani biryani.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // === MARCH ===
  {
    id: 'ev-mar-1',
    title: 'Lathmar Holi',
    category: 'Village Celebration',
    season: 'Spring',
    month: 'March',
    startDate: '2027-03-15',
    endDate: '2027-03-16',
    state: 'Uttar Pradesh',
    district: 'Mathura',
    village: 'Barsana Village',
    community: 'Braj community',
    description:
      'A unique recreation of Holi where women of Barsana village playfully beat men from neighboring Nandgaon village with wooden sticks.',
    historicalBackground:
      'Commemorates the mythological visit of Lord Krishna to Barsana where he playfully teased Radha, and women chased him away.',
    culturalImportance:
      'A deeply emotional celebration of Braj folklore, emphasizing local community solidarity and playful traditional gender dynamics.',
    rituals: [
      "Women hitting men's shields with lathis (sticks)",
      'Singing traditional Braj songs',
      'Sprinkling natural gulal (colors)',
    ],
    associatedCrafts: [
      'Lathi (wooden stick) polishing',
      'Organic herbal color making',
    ],
    associatedRecipes: [
      'Thandai (spiced milk drink with almonds)',
      'Gujiya (sweet dumplings)',
    ],
    associatedStories: [
      "Krishna and Radha's Holi play in the groves of Barsana.",
    ],
    associatedArtifacts: [
      'Lathis',
      'Wooden shields',
      'Pichkaris (water brass cannons)',
    ],
    relatedVillages: ['Barsana Village'],
    relatedHeritageTrails: ['Braj Dham Trail'],
    relatedNaturalSites: ['Bhanugarh Hill'],
    images: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [27.6534, 77.3778],
    visitorInformation:
      'Takes place in the temple alleys of Radha Rani Temple, Barsana. Extremely crowded.',
    travelTips:
      "Keep cameras protected from colored water. Wear white clothes you don't mind staining.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-mar-2',
    title: 'Shigmo Festival',
    category: 'Spring Festival',
    season: 'Spring',
    month: 'March',
    startDate: '2027-03-21',
    endDate: '2027-03-25',
    state: 'Goa',
    district: 'South Goa',
    village: 'Benaulim Village',
    community: 'Goan Hindu community',
    description:
      'A spring festival featuring colorful street parades with traditional dances (Ghodemodni), martial arts displays, and giant mythological floats.',
    historicalBackground:
      'Celebrates the return of soldiers from battles at the end of winter, historically linked to agricultural harvests.',
    culturalImportance:
      'Preserves traditional Goan folk performances and legends from the pre-colonial era, bringing village life into focus.',
    rituals: [
      'Worshipping village deities with red color (Gulal)',
      'Ghodemodni (horse dance)',
      'Float parades',
    ],
    associatedCrafts: ['Float building', 'Traditional paper mask making'],
    associatedRecipes: [
      'Khatkhate (mixed vegetable stew)',
      'Feni (local cashew liquor) dishes',
    ],
    associatedStories: ['Legends of Goan warrior kings protecting temples.'],
    associatedArtifacts: ['Decorative umbrellas', 'Folk drums (Dhol)'],
    relatedVillages: ['Benaulim Village'],
    relatedHeritageTrails: ['Temple Heartland Trail'],
    relatedNaturalSites: ['Zuari River'],
    images: [
      'https://images.unsplash.com/photo-1560855279-d6023ad57583?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [15.25, 73.92],
    visitorInformation:
      'Parades happen in municipal towns and local villages. Open street events.',
    travelTips:
      'Rent a scooter to catch parade locations in different villages.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-mar-3',
    title: 'Chapchar Kut',
    category: 'Tribal Festival',
    season: 'Spring',
    month: 'March',
    startDate: '2027-03-05',
    endDate: '2027-03-06',
    state: 'Mizoram',
    district: 'Aizawl',
    village: 'Reiek Village',
    community: 'Mizo community',
    description:
      'The most important festival of Mizos, celebrated at the completion of Jhum (slash-and-burn) clearing, with the famous Cheraw bamboo dance.',
    historicalBackground:
      'Dates back to the 15th-16th century when village chiefs gathered to feast after clearing forests for agriculture.',
    culturalImportance:
      'Reinforces Mizo cultural identity, brotherhood, and features traditional dress, bamboo music, and community feast.',
    rituals: [
      'Cheraw (bamboo dance)',
      'Chhawnghnawh (feeding each other cooked meat)',
      'Traditional dress show',
    ],
    associatedCrafts: [
      'Mizo basket weaving',
      'Puan (traditional textile weaving)',
    ],
    associatedRecipes: [
      'Vawksa Rep (smoked pork with mustard greens)',
      'Zu (traditional rice beer)',
    ],
    associatedStories: [
      'Folk tales of legendary chiefs distributing food during famine.',
    ],
    associatedArtifacts: ['Cheraw bamboos', 'Mizo feather headgear'],
    relatedVillages: ['Reiek Village'],
    relatedHeritageTrails: ['Mizo Hills Eco-Trail'],
    relatedNaturalSites: ['Reiek Peak'],
    images: [
      'https://images.unsplash.com/photo-1545642187-a3098326f294?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [23.7307, 92.7173],
    visitorInformation:
      'Main stage celebrations are held at Reiek cultural village grounds.',
    travelTips:
      'Arrive early to photograph the dancers in their striking red and green Puans.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-mar-4',
    title: 'Yaosang',
    category: 'Spring Festival',
    season: 'Spring',
    month: 'March',
    startDate: '2027-03-22',
    endDate: '2027-03-27',
    state: 'Manipur',
    district: 'Imphal East',
    village: 'Andro Village',
    community: 'Meitei community',
    description:
      'A 5-day spring festival combining Vaishnavite Hindu traditions with ancient Meitei folklore, celebrated with Thabal Chongba (moonlight folk dance).',
    historicalBackground:
      'A fusion of the traditional spring festival of the Meiteis with the colors of Holi introduced in the 18th century.',
    culturalImportance:
      'Promotes sportsmanship (featuring village sports events) and romantic youth courtship traditions through nighttime dances.',
    rituals: [
      'Burning of a straw hut (Yaosang Mei Thaba)',
      'Thabal Chongba (dancing in a circle under the moon)',
      'Collecting donation coins by children',
    ],
    associatedCrafts: [
      'Andro terracotta pottery',
      'Traditional Meitei loom weaving',
    ],
    associatedRecipes: [
      'Singju (spicy Manipur cabbage salad)',
      'Sana Thongba (paneer curry)',
    ],
    associatedStories: [
      'The legend of goddess Panthoibi and local nature spirits.',
    ],
    associatedArtifacts: ['Terracotta pots', 'Dhol drums'],
    relatedVillages: ['Andro Village'],
    relatedHeritageTrails: ['Manipur Pottery Trail'],
    relatedNaturalSites: ['Loktak Lake'],
    images: [
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [24.789, 94.02],
    visitorInformation:
      'Sports occur during the day in villages. Thabal Chongba happens late evening.',
    travelTips:
      'Visit Andro village to see traditional pottery making during the day before the night dance.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-mar-5',
    title: 'Basant Panchami Mela',
    category: 'Spring Festival',
    season: 'Spring',
    month: 'March',
    startDate: '2027-03-02',
    endDate: '2027-03-03',
    state: 'West Bengal',
    district: 'Birbhum',
    village: 'Santi Village',
    community: 'Bengali community',
    description:
      'A peaceful spring gathering celebrating Saraswati (Goddess of Knowledge), where students wear yellow and pay respects to books and instruments.',
    historicalBackground:
      'Marking the onset of spring (Vasant), symbolizing growth, energy, and learning.',
    culturalImportance:
      'Celebrates classical education, literature, arts, and introduces young children to reading and writing.',
    rituals: [
      'Hatey Khori (writing first alphabet)',
      'Worshipping books and pens',
      'Offering yellow flowers (Palash)',
    ],
    associatedCrafts: [
      'Saraswati clay idol making',
      'Palash flower garland weaving',
    ],
    associatedRecipes: [
      'Khichuri with mixed vegetables',
      'Begun Bhaja (fried eggplant)',
      'Sweet yellow rice',
    ],
    associatedStories: [
      'Mythological tales of Saraswati creating the Sanskrit language.',
    ],
    associatedArtifacts: ['Clay idols', 'Palash flowers'],
    relatedVillages: ['Santi Village'],
    relatedHeritageTrails: ['Tagore Heritage Trail'],
    relatedNaturalSites: ['Kopai River'],
    images: [
      'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [23.68, 87.68],
    visitorInformation:
      'Universities and village temples host open feasts and cultural performances.',
    travelTips:
      'Dress in yellow attire to show respect and blend in with the local community.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-mar-6',
    title: 'Hola Mohalla',
    category: 'Tribal Festival',
    season: 'Spring',
    month: 'March',
    startDate: '2027-03-23',
    endDate: '2027-03-25',
    state: 'Punjab',
    district: 'Rupnagar',
    village: 'Anandpur Sahib',
    community: 'Sikh community',
    description:
      'A massive three-day gathering showcasing martial arts, sword-fighting, mock battles, horse riding, and archery displays by Nihang Sikhs.',
    historicalBackground:
      'Founded by Guru Gobind Singh in 1701 as a military training exercise and display of strength for the community.',
    culturalImportance:
      'Expresses military valor, courage, and discipline, alongside prayers, singing of hymns, and massive community kitchens (Langars).',
    rituals: [
      'Mock battles and Gatka (martial art) displays',
      'Bareback horse riding tricks',
      'Kirtan (spiritual singing) sessions',
    ],
    associatedCrafts: [
      'Traditional weaponry (Kripans, swords) crafting',
      'Turban weaving',
    ],
    associatedRecipes: [
      'Kada Prasad (sweet flour pudding)',
      'Langar dal and roti',
    ],
    associatedStories: [
      'The courage of Guru Gobind Singh and his brave warriors.',
    ],
    associatedArtifacts: ['Nihang blue turbans', 'Shields and lances'],
    relatedVillages: ['Anandpur Sahib'],
    relatedHeritageTrails: ['Punjab Martial Arts Trail'],
    relatedNaturalSites: ['Sutlej River'],
    images: [
      'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [31.2333, 76.5],
    visitorInformation:
      'Free entry. The main grounds host millions of visitors. Langars serve food for free.',
    travelTips:
      'Keep a safe distance from horses running at high speeds during the displays.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // === APRIL ===
  {
    id: 'ev-apr-1',
    title: 'Baisakhi',
    category: 'Harvest Festival',
    season: 'Spring',
    month: 'April',
    startDate: '2027-04-14',
    endDate: '2027-04-14',
    state: 'Punjab',
    district: 'Amritsar',
    village: 'Batala Village',
    community: 'Sikh and Punjabi communities',
    description:
      'A major harvest festival celebrating the ripening of winter crops and commemorating the establishment of the Khalsa Panth in 1699.',
    historicalBackground:
      'Originally a solar harvest festival, transformed in 1699 when Guru Gobind Singh created the order of Khalsa.',
    culturalImportance:
      'Symbolizes courage, equality, and thanksgiving. Farmers offer gratitude for a bountiful harvest and pray for future seasons.',
    rituals: [
      'Bhangra and Gidda folk dances',
      'Holy baths in rivers or temple pools',
      'Nagar Kirtan (processions)',
    ],
    associatedCrafts: [
      'Traditional footwear (Jutti) making',
      'Handloom fabric weaving',
    ],
    associatedRecipes: [
      'Kheer (rice pudding)',
      'Pindi Chole (spiced chickpeas)',
    ],
    associatedStories: [
      'The story of the Panj Pyare (Five Beloved Ones) who initiated the Khalsa.',
    ],
    associatedArtifacts: ['Khalsa flags', 'Traditional swords'],
    relatedVillages: ['Batala Village'],
    relatedHeritageTrails: ['Amritsari Culinary Trail'],
    relatedNaturalSites: ['Ravi River'],
    images: [
      'https://images.unsplash.com/photo-1601579620750-f8df814c8103?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [31.8186, 75.2028],
    visitorInformation:
      'Major celebrations occur at Golden Temple and rural fields across Gurdaspur and Amritsar.',
    travelTips:
      'Enjoy the energetic Bhangra performances organized by local youth groups in crop fields.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-apr-2',
    title: 'Bohag Bihu',
    category: 'Spring Festival',
    season: 'Spring',
    month: 'April',
    startDate: '2027-04-14',
    endDate: '2027-04-20',
    state: 'Assam',
    district: 'Jorhat',
    village: 'Teok Village',
    community: 'Assamese community',
    description:
      'The Assamese New Year festival celebrating spring, new agricultural cycles, and fertility, marked by folk songs and rhythmic Bihu dances.',
    historicalBackground:
      'Ancient pagan spring festival adapted over centuries by various tribes residing in the Brahmaputra valley.',
    culturalImportance:
      'Celebrates renewal, love, and youth. The dance uses rapid hand movements and hip sways to traditional wind instruments.',
    rituals: [
      'Bathing cattle in rivers (Goru Bihu)',
      'Paying respects to elders with Gamosas',
      'Mukoli Bihu outdoor dances',
    ],
    associatedCrafts: [
      'Gamosa (traditional towel) weaving',
      'Pepa (buffalo horn instrument) making',
    ],
    associatedRecipes: [
      'Til Pitha (sesame cakes)',
      'Gila Pitha (fried sweet dumplings)',
    ],
    associatedStories: [
      'Legends of the first farmers cultivating paddy in Assam.',
    ],
    associatedArtifacts: [
      'Gamosa scarves',
      'Pepa instruments',
      'Japi (bamboo hats)',
    ],
    relatedVillages: ['Teok Village'],
    relatedHeritageTrails: ['Brahmaputra Weaver Trail'],
    relatedNaturalSites: ['Gibbon Wildlife Sanctuary'],
    images: [
      'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [26.7583, 94.2483],
    visitorInformation:
      'Open ground celebrations (Husori) happen daily in every village neighborhood.',
    travelTips:
      'Purchase authentic golden Muga silk sarees during this festival period.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-apr-3',
    title: 'Vishu',
    category: 'Spring Festival',
    season: 'Spring',
    month: 'April',
    startDate: '2027-04-14',
    endDate: '2027-04-14',
    state: 'Kerala',
    district: 'Palakkad',
    village: 'Kalpathy Village',
    community: 'Malayali community',
    description:
      'The astrological Malayalam New Year, celebrated with the viewing of an auspicious arrangement (Vishukkani) at dawn and firecrackers.',
    historicalBackground:
      'Derived from the Sanskrit word Vishuvath, which means equal (vernal equinox). Celebrated for centuries as a harvest milestone.',
    culturalImportance:
      'Viewing auspicious items first thing in the morning ensures wealth and success for the entire year ahead.',
    rituals: [
      'Preparing the Vishukkani (golden flowers, cucumbers, coins, mirrors)',
      'Giving money gifts to kids (Vishukaineetam)',
      'Lighting firecrackers',
    ],
    associatedCrafts: [
      'Metal mirror (Aranmula Kannadi) casting',
      'Brass lamp making',
    ],
    associatedRecipes: [
      'Vishu Kanji (savory coconut-rice porridge)',
      'Mampazha Pulissery (mango yogurt curry)',
    ],
    associatedStories: [
      'Lord Krishna defeating demon Narakasura on this auspicious day.',
    ],
    associatedArtifacts: [
      'Uruli (brass vessel)',
      'Kanikkonna (yellow cassia flowers)',
    ],
    relatedVillages: ['Kalpathy Village'],
    relatedHeritageTrails: ['Kerala Temple Trail'],
    relatedNaturalSites: ['Silent Valley National Park'],
    images: [
      'https://images.unsplash.com/photo-1615286500402-4841b52a67e8?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [10.7912, 76.6669],
    visitorInformation:
      'Best experienced in home environments. Public temples have special morning views.',
    travelTips:
      'Wake up early (around 4:00 AM) to view the Kani at a local village temple.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-apr-4',
    title: 'Ugadi',
    category: 'Spring Festival',
    season: 'Spring',
    month: 'April',
    startDate: '2027-04-08',
    endDate: '2027-04-08',
    state: 'Andhra Pradesh',
    district: 'Anantapur',
    village: 'Lepakshi Village',
    community: 'Telugu community',
    description:
      'The Deccan New Year, marked by the consumption of Ugadi Pachadi, a unique dish representing the six tastes of life.',
    historicalBackground:
      'Celebrates the creation of the universe by Lord Brahma, marking the beginning of the Hindu calendar year (Chaitra Suddha Padyami).',
    culturalImportance:
      'Emphasizes acceptance of all life experiences, sweet or bitter. The Pachadi teaches that life is a mixture of flavors.',
    rituals: [
      'Washing front courtyards and drawing Muggu (rangoli)',
      'Drinking Ugadi Pachadi',
      'Listening to year predictions (Panchanga Sravanam)',
    ],
    associatedCrafts: ['Mango leaf stringing', 'Handmade terracotta tiles'],
    associatedRecipes: [
      'Ugadi Pachadi (neem, mango, jaggery, tamarind mix)',
      'Bobbatlu (sweet stuffed flatbreads)',
    ],
    associatedStories: ['Brahma starting creation on this day.'],
    associatedArtifacts: [
      'Panchanga (astrological calendar)',
      'Copper vessels',
    ],
    relatedVillages: ['Lepakshi Village'],
    relatedHeritageTrails: ['Lepakshi Heritage Trail'],
    relatedNaturalSites: ['Penneru River Bed'],
    images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [13.8019, 77.6069],
    visitorInformation:
      'Lepakshi Temple holds grand cultural programs and recitations.',
    travelTips: 'Taste Ugadi Pachadi prepared with fresh organic neem flowers.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-apr-5',
    title: 'Thrissur Pooram',
    category: 'Temple Festival',
    season: 'Spring',
    month: 'April',
    startDate: '2027-04-26',
    endDate: '2027-04-27',
    state: 'Kerala',
    district: 'Thrissur',
    village: 'Peruvanam Village',
    community: 'Malayali temples',
    description:
      'A spectacular temple festival featuring a competitive parade of majestically caparisoned elephants, master percussionists, and fireworks.',
    historicalBackground:
      'Unified by Shakthan Thampuran, the King of Cochin in 1797, as a mass festival challenging traditional caste hierarchies.',
    culturalImportance:
      'Displays secular unity, high artistry in music (Panchavadyam), elephant decorations, and pyrotechnics.',
    rituals: [
      'Kudamattom (competitive exchange of ornamental umbrellas)',
      'Elanjithara Melam (massive synchronized drum orchestra)',
      'Vedikettu (fireworks display)',
    ],
    associatedCrafts: [
      'Nettipattam (elephant forehead ornaments)',
      'Pooram Umbrella crafting',
    ],
    associatedRecipes: [
      'Unniyappam (sweet rice fritters)',
      'Parippu Pradhaman (lentil payesh)',
    ],
    associatedStories: [
      'The legend of deities visiting Vadakkunnathan Temple to pay respects.',
    ],
    associatedArtifacts: [
      'Nettipattam',
      'Ornamental umbrellas',
      'Chenda drums',
    ],
    relatedVillages: ['Peruvanam Village'],
    relatedHeritageTrails: ['Kerala Percussion Trail'],
    relatedNaturalSites: ['Peechi-Vazhani Forest'],
    images: [
      'https://images.unsplash.com/photo-1616038242814-a6eac7845d88?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [10.5276, 76.2144],
    visitorInformation:
      'Held in the grounds of Vadakkunnathan Temple, Thrissur. Open to all public.',
    travelTips:
      'It is highly crowded and noisy. Wear light cotton clothes and carry drinking water.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-apr-6',
    title: 'Garia Puja',
    category: 'Tribal Festival',
    season: 'Spring',
    month: 'April',
    startDate: '2027-04-21',
    endDate: '2027-04-23',
    state: 'Tripura',
    district: 'West Tripura',
    village: 'Khumpui Village',
    community: 'Tripuri tribe',
    description:
      'An agricultural tribal festival worshipping Lord Garia (deity of livestock and harvest) using a symbolic bamboo pole.',
    historicalBackground:
      'Centuries-old agrarian ritual practiced by Kokborok-speaking tribes of Tripura to ensure safety of crops.',
    culturalImportance:
      'Guards the community against natural disasters and seeks agricultural prosperity. Involves animal sacrifices and community dancing.',
    rituals: [
      'Erecting a bamboo pole representing Baba Garia',
      'Offering rice beer and flowers',
      'Garia folk dance with traditional movements',
    ],
    associatedCrafts: ['Bamboo carving', 'Tribal loom (Risa) weaving'],
    associatedRecipes: [
      'Chakhwi (pork cooked with bamboo shoot paste)',
      'Chuak (rice beer)',
    ],
    associatedStories: [
      "Legends of Baba Garia descending to earth to test humanity's generosity.",
    ],
    associatedArtifacts: ['Sacred bamboo pole', 'Traditional brass rings'],
    relatedVillages: ['Khumpui Village'],
    relatedHeritageTrails: ['Tripura Bamboo Craft Trail'],
    relatedNaturalSites: ['Sepahijala Wildlife Sanctuary'],
    images: [
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [23.8315, 91.2868],
    visitorInformation:
      'Celebrations occur in tribal hamlets across Tripura. Tourists are welcome in community circles.',
    travelTips:
      'Respect local boundaries during the sacred hours of worship near the bamboo shrines.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // === MAY ===
  {
    id: 'ev-may-1',
    title: 'Moatsu Mong',
    category: 'Tribal Festival',
    season: 'Summer',
    month: 'May',
    startDate: '2027-05-01',
    endDate: '2027-05-03',
    state: 'Nagaland',
    district: 'Mokokchung',
    village: 'Ungma Village',
    community: 'Ao Naga tribe',
    description:
      'A sowing festival celebrated by Ao Nagas after planting seeds, filled with tribal dances, community bonding, and songs of praise.',
    historicalBackground:
      'A long-standing pre-colonial tradition celebrated to honor the land after completing strenuous forest-clearing and sowing tasks.',
    culturalImportance:
      'Provides a recreation phase, wishing for a high yield of crops, and passing down oral histories through traditional love songs.',
    rituals: [
      'Sangpangtu (lighting community bonfires)',
      'Sangpangtu dance',
      'Telling stories of migration',
    ],
    associatedCrafts: ['Ao Naga shawl weaving', 'Bead jewelry making'],
    associatedRecipes: [
      'Aki (boiled pork with fermented bamboo shoot)',
      'Traditional rice beer',
    ],
    associatedStories: [
      'Migrational legends of the Ao tribe from eastern mountains.',
    ],
    associatedArtifacts: ['Ao spears', 'Beaded tribal necklaces'],
    relatedVillages: ['Ungma Village'],
    relatedHeritageTrails: ['Naga Warrior Trail'],
    relatedNaturalSites: ['Lungkum Village Viewpoint'],
    images: [
      'https://images.unsplash.com/photo-1547841243-eacb14453cd9?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [26.3167, 94.5167],
    visitorInformation:
      'Ungma village hosts open stage festivals. Tourists can purchase local handloom products.',
    travelTips:
      'Obtain Nagaland ILP and book local transport guides from Mokokchung town.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-may-2',
    title: 'Mount Abu Summer Festival',
    category: 'Folk Performance',
    season: 'Summer',
    month: 'May',
    startDate: '2027-05-13',
    endDate: '2027-05-15',
    state: 'Rajasthan',
    district: 'Sirohi',
    village: 'Abu Village',
    community: 'Rajasthani folk artists',
    description:
      "A summer festival in Rajasthan's only hill station, showcasing folk dances, boat races on Nakki Lake, and classical singing.",
    historicalBackground:
      'Organized by Rajasthan Tourism to escape scorching summer heat and showcase tribal and folk culture in the hills.',
    culturalImportance:
      'Preserves traditional Rajasthani martial arts, Gair dances, and regional boat-rowing styles.',
    rituals: [
      'Deepdan (floating lamps in Nakki Lake)',
      'Gair and Ghoomar folk dances',
      'Tug of war games',
    ],
    associatedCrafts: ['Kota Doria weaving', 'Wood carving'],
    associatedRecipes: ['Rabri (condensed milk sweet)', 'Rajasthani Thali'],
    associatedStories: [
      "Mythological creation of Nakki Lake by digging with gods' nails.",
    ],
    associatedArtifacts: ['Folk stringed instruments (Kamayacha)', 'Lamps'],
    relatedVillages: ['Abu Village'],
    relatedHeritageTrails: ['Mewar Royal Trail'],
    relatedNaturalSites: ['Nakki Lake'],
    images: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [24.5925, 72.7156],
    visitorInformation: 'Events are mostly free and happen around Nakki Lake.',
    travelTips:
      'Enjoy the pleasant cooler temperatures by planning walks around the lake at sunset.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-may-3',
    title: 'Chithirai Festival',
    category: 'Temple Festival',
    season: 'Summer',
    month: 'May',
    startDate: '2027-05-09',
    endDate: '2027-05-23',
    state: 'Tamil Nadu',
    district: 'Madurai',
    village: 'Thirupparankundram',
    community: 'Madurai community',
    description:
      "A massive 15-day celebration enacting the celestial wedding of Goddess Meenakshi (Shiva's consort) and Lord Sundareswarar.",
    historicalBackground:
      'Established in the 17th century by King Thirumalai Nayakar to merge two separate Shaivite and Vaishnavite festivals into one.',
    culturalImportance:
      'Symbolizes communal and sectarian harmony, attracting millions of devotees who pull massive wooden temple chariots.',
    rituals: [
      'Alagar entering the Vaigai River',
      'Carrying deities on golden mounts',
      'Pulling the temple chariot (Ther)',
    ],
    associatedCrafts: [
      'Golden deity mount polishing',
      'Wooden chariot engineering',
    ],
    associatedRecipes: [
      'Kalkandu Sadam (sweet crystal sugar rice)',
      'Madurai Jigarthanda',
    ],
    associatedStories: [
      "Lord Vishnu (Alagar) arriving late to his sister Meenakshi's wedding and turning back in anger.",
    ],
    associatedArtifacts: ['Golden horse mount', 'Chariot ropes'],
    relatedVillages: ['Thirupparankundram'],
    relatedHeritageTrails: ['Madurai Temple Trail'],
    relatedNaturalSites: ['Vaigai River Bed'],
    images: [
      'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [9.9189, 78.1189],
    visitorInformation:
      'Main rituals happen in Madurai Meenakshi Temple and the Vaigai River. Expect massive crowds.',
    travelTips:
      "Book hotel balconies overlooking the Vaigai River to safely watch Alagar's entry.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-may-4',
    title: 'Ooty Flower Show',
    category: 'Seasonal Market',
    season: 'Summer',
    month: 'May',
    startDate: '2027-05-15',
    endDate: '2027-05-19',
    state: 'Tamil Nadu',
    district: 'The Nilgiris',
    village: 'Ketti Village',
    community: 'Nilgiri growers',
    description:
      'A summer festival displaying elaborate floral sculptures, native flora, and traditional Nilgiri tribal agricultural products.',
    historicalBackground:
      'Began in 1896 by the British Nilgiri Agri-Horticultural Society to showcase rare high-altitude plant species.',
    culturalImportance:
      'Promotes flower cultivation, organic farming, and showcases tribal crafts of the indigenous Toda and Kota tribes.',
    rituals: [
      'Exhibiting floral installations',
      'Toda tribal dancing displays',
    ],
    associatedCrafts: ['Toda embroidery (Pukhoor)', 'Clay pottery'],
    associatedRecipes: [
      'Nilgiri eucalyptus herbal tea',
      'Badaga style potato curry',
    ],
    associatedStories: ['Toda stories of creation in the blue hills.'],
    associatedArtifacts: ['Toda shawls', 'Clay pots'],
    relatedVillages: ['Ketti Village'],
    relatedHeritageTrails: ['Nilgiri Tribal Heritage Trail'],
    relatedNaturalSites: ['Ooty Botanical Gardens'],
    images: [
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [11.4102, 76.7084],
    visitorInformation:
      'Held in the Government Botanical Garden, Ooty. Entrance fees apply.',
    travelTips:
      'Avoid traffic by using the heritage Nilgiri Mountain Toy Train to reach Ooty.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-may-5',
    title: 'Rabindra Jayanti Mela',
    category: 'Folk Performance',
    season: 'Summer',
    month: 'May',
    startDate: '2027-05-08',
    endDate: '2027-05-09',
    state: 'West Bengal',
    district: 'Birbhum',
    village: 'Bolpur Village',
    community: 'Santiniketan community',
    description:
      'A musical celebration marking the birth anniversary of Nobel laureate Rabindranath Tagore, with open-air songs, dances, and poetry recitations.',
    historicalBackground:
      "Established in the early 20th century in Santiniketan to honor the poet's contribution to education, arts, and rural reconstruction.",
    culturalImportance:
      "Sustains Rabindra Sangeet (Tagore's music style) and brings together folk artists who perform alongside students under mango trees.",
    rituals: [
      'Baitarani (morning musical procession)',
      "Dancing to Tagore's season songs",
    ],
    associatedCrafts: ['Batik print craft', 'Leather bag embossing'],
    associatedRecipes: ['Sujir Halwa (semolina pudding)', 'Luchi & Alur Dom'],
    associatedStories: ["Tagore's vision of school under open skies."],
    associatedArtifacts: ['Batik textiles', 'Traditional hand-painted folders'],
    relatedVillages: ['Bolpur Village'],
    relatedHeritageTrails: ['Tagore Heritage Trail'],
    relatedNaturalSites: ['Kopai River Valley'],
    images: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [23.67, 87.72],
    visitorInformation:
      'Open ground stages at Santiniketan. Very artistic atmosphere.',
    travelTips:
      'Wake up early to catch the beautiful morning prayers at 6:00 AM in the ashram.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-may-6',
    title: 'Buddha Purnima Utsav',
    category: 'Temple Festival',
    season: 'Summer',
    month: 'May',
    startDate: '2027-05-20',
    endDate: '2027-05-21',
    state: 'Bihar',
    district: 'Gaya',
    village: 'Bodh Gaya',
    community: 'Buddhist monks and locals',
    description:
      'A serene celebration commemorating the birth, enlightenment, and death of Lord Buddha, marked by prayer meets and chanting under the Bodhi tree.',
    historicalBackground:
      'Bodh Gaya is the place where Siddhartha Gautama attained enlightenment in 528 BCE under the Peepal (Bodhi) tree.',
    culturalImportance:
      'Promotes universal peace, non-violence, and mindfulness. Monks and devotees wear simple white robes.',
    rituals: [
      'Chanting Buddhist scriptures under the Bodhi tree',
      'Offering milk rice (Kheer) to monks',
      'Releasing lanterns',
    ],
    associatedCrafts: ['Bodhi leaf painting', 'Sandstone sculpture carving'],
    associatedRecipes: ['Sweet milk Kheer', 'Steamed vegetables'],
    associatedStories: ['The journey of Siddhartha Gautama search for truth.'],
    associatedArtifacts: ['Prayer wheels', 'Butter lamps'],
    relatedVillages: ['Bodh Gaya'],
    relatedHeritageTrails: ['Buddhist Peace Trail'],
    relatedNaturalSites: ['Falgu River Bed'],
    images: [
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [24.6953, 84.9912],
    visitorInformation:
      'Centered around Mahabodhi Temple. Admission is free. Security is tight.',
    travelTips:
      'Mobile phones are not allowed inside the temple complex. Safe lockers are available.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // === JUNE ===
  {
    id: 'ev-jun-1',
    title: 'Hemis Festival',
    category: 'Tribal Festival',
    season: 'Summer',
    month: 'June',
    startDate: '2027-06-19',
    endDate: '2027-06-20',
    state: 'Ladakh',
    district: 'Leh',
    village: 'Hemis Village',
    community: 'Ladhaki Buddhist community',
    description:
      'A vibrant Buddhist festival celebrating the birth of Guru Padmasambhava with sacred Cham mask dances and display of rare tankha paintings.',
    historicalBackground:
      'Hemis Monastery, founded in the 17th century, has hosted this festival to showcase the victory of Buddhism over local spirits.',
    culturalImportance:
      'Combines spiritual rituals with secular fairs. Masked dances depict the conquest of ego and negative spirits.',
    rituals: [
      'Cham dance by Lamas in masks',
      'Playing long horns (dungchen)',
      'Worshipping massive silk tapestries (Thangkas)',
    ],
    associatedCrafts: ['Tibet clay mask molding', 'Hand-woven woolen rugs'],
    associatedRecipes: [
      'Momo (steamed dumplings)',
      'Tsampa (barley flour dough)',
      'Butter tea',
    ],
    associatedStories: [
      'Guru Padmasambhava conquering local demons using tantric power.',
    ],
    associatedArtifacts: ['Cham masks', 'Dungchen copper horns', 'Thangkas'],
    relatedVillages: ['Hemis Village'],
    relatedHeritageTrails: ['High Passes Monastery Trail'],
    relatedNaturalSites: ['Hemis National Park'],
    images: [
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [33.9126, 77.7012],
    visitorInformation:
      'Takes place in the central courtyard of Hemis Monastery, Leh. Seating is on the floor.',
    travelTips:
      'Arrive early in the morning to catch the start of horn players at 8:00 AM.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-jun-2',
    title: 'Shimla Summer Festival',
    category: 'Seasonal Market',
    season: 'Summer',
    month: 'June',
    startDate: '2027-06-01',
    endDate: '2027-06-05',
    state: 'Himachal Pradesh',
    district: 'Shimla',
    village: 'Mashobra Village',
    community: 'Himachali community',
    description:
      'A five-day cultural fair showcasing Himachali folk performances, local handicraft stalls, and agricultural exhibits.',
    historicalBackground:
      'Started in the 1960s to promote state tourism and preserve local mountain traditions during the pleasant summer month.',
    culturalImportance:
      'Allows rural artisans to sell wood and woolen crafts directly to national travelers visiting the hills.',
    rituals: [
      'Lighting the traditional lamp',
      'Nati folk dances',
      'Baby show competitions',
    ],
    associatedCrafts: ['Wooden toys and baskets', 'Kullu shawl weaving'],
    associatedRecipes: [
      'Siddu (steamed yeast buns)',
      'Dham (traditional wedding feast)',
    ],
    associatedStories: [
      'Folk stories about village gods of Mashobra visiting Shimla.',
    ],
    associatedArtifacts: [
      'Kullu caps',
      'Chamba rumals (embroidered handkerchiefs)',
    ],
    relatedVillages: ['Mashobra Village'],
    relatedHeritageTrails: ['Himachal Pine Valley Trail'],
    relatedNaturalSites: ['Reserve Forest Sanctuary'],
    images: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [31.1048, 77.1734],
    visitorInformation:
      'Main stage is at The Ridge, Shimla. Handicraft stalls are spread over Mall Road.',
    travelTips:
      'Park vehicles at public parking garages and walk to the Ridge.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-jun-3',
    title: 'Ganga Dussehra',
    category: 'Temple Festival',
    season: 'Summer',
    month: 'June',
    startDate: '2027-06-14',
    endDate: '2027-06-14',
    state: 'Uttarakhand',
    district: 'Haridwar',
    village: 'Kankhal Village',
    community: 'Hindu community',
    description:
      'A grand river festival celebrating the descent of Goddess Ganga (Ganges River) from heaven to earth, marked by thousands of floating oil lamps.',
    historicalBackground:
      "Commemorates King Bhagirath's intense penance which pleased Shiva to allow river Ganga to flow through his locks to earth.",
    culturalImportance:
      'Worshipping the river as a life-giving mother. Purifies sins and marks the beginning of the heavy monsoon replenishment.',
    rituals: [
      'Holy bathing at Har Ki Pauri ghats',
      'Maha Aarti with massive multi-tiered brass lamps',
      'Floating flower leaf cups (donas) with oil lamps',
    ],
    associatedCrafts: ['Brass lamp casting', 'Leaf cup (dona) weaving'],
    associatedRecipes: ['Halwa', 'Puri and potato sabji', 'Pedha sweets'],
    associatedStories: ["The penance of King Bhagirath and Ganga's descent."],
    associatedArtifacts: ['Brass lamps', 'Clay pots'],
    relatedVillages: ['Kankhal Village'],
    relatedHeritageTrails: ['Ganges River Trail'],
    relatedNaturalSites: ['Rajaji National Park'],
    images: [
      'https://images.unsplash.com/photo-1561361531-99522c3a1211?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [29.956, 78.17],
    visitorInformation:
      'Centered on the ghats of Haridwar. The evening Aarti starts exactly at sunset.',
    travelTips:
      'Secure a sitting spot on the opposite side of Har Ki Pauri ghat by 4:00 PM for the best view.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-jun-4',
    title: 'Sao Joao Festival',
    category: 'Village Celebration',
    season: 'Summer',
    month: 'June',
    startDate: '2027-06-24',
    endDate: '2027-06-24',
    state: 'Goa',
    district: 'North Goa',
    village: 'Siolim Village',
    community: 'Goan Catholic community',
    description:
      'A feast dedicated to St. John the Baptist, where Goan youth wear flower crowns (kopels) and leap into local village wells and pools.',
    historicalBackground:
      "Introduced during Portuguese rule, representing the joy of Elizabeth when she heard of Mary's pregnancy, and John leaping in her womb.",
    culturalImportance:
      "Marks the onset of monsoons. Encourages brotherhood and welcomes newly married grooms to the bride's village.",
    rituals: [
      'Wearing flower crowns (Kopel)',
      'Jumping into wells and rivers',
      'Boat parade in Siolim creek',
    ],
    associatedCrafts: [
      'Kopel flower crown weaving',
      'Traditional wooden boat decorating',
    ],
    associatedRecipes: [
      'Sannas (steamed toddy-fermented rice cakes)',
      'Pork vindaloo',
      'Feni fruit punches',
    ],
    associatedStories: [
      'Folk stories of villagers sharing rain fruits (jackfruit, mango) with neighbors.',
    ],
    associatedArtifacts: ['Kopels', 'Decorated boats'],
    relatedVillages: ['Siolim Village'],
    relatedHeritageTrails: ['Monsoon River Trail'],
    relatedNaturalSites: ['Siolim River Creeks'],
    images: [
      'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [15.6264, 73.7892],
    visitorInformation:
      'Best viewed at the Siolim church grounds where all village groups assemble with boats.',
    travelTips:
      'Prepare to get wet! Carry a dry change of clothes and store devices in waterproof cases.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-jun-5',
    title: 'Ambubachi Mela',
    category: 'Temple Festival',
    season: 'Summer',
    month: 'June',
    startDate: '2027-06-22',
    endDate: '2027-06-26',
    state: 'Assam',
    district: 'Kamrup Metro',
    village: 'Kamakhya',
    community: 'Tantric practitioners and locals',
    description:
      'An annual celebration at Kamakhya Temple marking the creative cycle of Mother Earth, during which the temple is closed for three days.',
    historicalBackground:
      'Tantric goddess worship dating back to the mediaeval period, representing the menstrual cycle of the Earth.',
    culturalImportance:
      'Worship of maternal power, fertility, and earth. The mela attracts sadhus, tantrics, and seekers from all over India.',
    rituals: [
      'Closing the temple doors for three days',
      'Distributing red cloth (Angodak) as blessing on day four',
      'Chanting under temple banyan trees',
    ],
    associatedCrafts: ['Tantric painting', 'Brass bell casting'],
    associatedRecipes: [
      'Panchamrit (sweet curd-honey mixture)',
      'Simple boiled pulses',
    ],
    associatedStories: [
      "Sati's yoni falling at Nilachal hill when Shiva performed Rudra Tandava.",
    ],
    associatedArtifacts: ['Angodak (blessed red cloth)', 'Conch shells'],
    relatedVillages: ['Kamakhya'],
    relatedHeritageTrails: ['Brahmaputra Spiritual Trail'],
    relatedNaturalSites: ['Nilachal Hill'],
    images: [
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [26.1667, 91.7012],
    visitorInformation:
      'Kamakhya temple complex has free entry but extremely long queues on the opening day.',
    travelTips:
      'Wear red or saffron clothing to match the aesthetic of the gathering.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-jun-6',
    title: 'Raja Parba',
    category: 'Harvest Festival',
    season: 'Summer',
    month: 'June',
    startDate: '2027-06-14',
    endDate: '2027-06-16',
    state: 'Odisha',
    district: 'Puri',
    village: 'Raghurajpur Village',
    community: 'Odia community',
    description:
      'A unique 3-day festival celebrating womanhood and earth, where no agricultural work is done to let Mother Earth rest.',
    historicalBackground:
      'Agrarian tradition celebrating the menstruation of Mother Earth (Bhumi) before the monsoon sowing starts.',
    culturalImportance:
      'Worshipping the soil. Women and young girls wear new clothes, play on swings (Doli), and eat traditional cakes.',
    rituals: [
      'Tying rope swings on mango trees (Raja Doli)',
      'No walking barefoot on soil',
      'Offering wet mud prayers',
    ],
    associatedCrafts: ['Raja Doli rope decoration', 'Pattachitra painting'],
    associatedRecipes: [
      'Poda Pitha (burnt rice-jaggery cake cooked overnight)',
      'Raja Pan (betel leaf wraps)',
    ],
    associatedStories: [
      'Bhuma Devi (Mother Earth) undergoing her annual restorative cycle.',
    ],
    associatedArtifacts: ['Raghurajpur masks', 'Traditional swings'],
    relatedVillages: ['Raghurajpur Village'],
    relatedHeritageTrails: ['Pattachitra Painter Trail'],
    relatedNaturalSites: ['Bhargavi River Bed'],
    images: [
      'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [19.8425, 85.8284],
    visitorInformation:
      'Raghurajpur village hosts swing contests and traditional Gotipua dances.',
    travelTips: 'Taste authentic home-cooked Poda Pitha from village hosts.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // === JULY ===
  {
    id: 'ev-jul-1',
    title: 'Rath Yatra',
    category: 'Temple Festival',
    season: 'Monsoon',
    month: 'July',
    startDate: '2027-07-06',
    endDate: '2027-07-14',
    state: 'Odisha',
    district: 'Puri',
    village: 'Jagannath Village',
    community: 'Odia community',
    description:
      'A monumental festival where the deities Jagannath, Balabhadra, and Subhadra are pulled in massive, newly constructed wooden chariots.',
    historicalBackground:
      "Dating back to the Puranas, it represents the annual journey of Lord Jagannath to his aunt's temple (Gundicha Temple).",
    culturalImportance:
      'Unites people across barriers. Pulling the chariot ropes is believed to grant salvation.',
    rituals: [
      'Chhera Pahanra (sweeping chariot platforms with gold broom)',
      'Pulling the massive wooden chariots',
      'Gundicha temple stay',
    ],
    associatedCrafts: [
      'Chariot wood carving (Ratha Anukula)',
      'Applique work (Pipli)',
    ],
    associatedRecipes: [
      'Jagannath Mahaprasad (56 dishes cooked in earthen pots)',
      'Khaja sweet',
    ],
    associatedStories: [
      "Lord Jagannath's promise to visit his birthplace Gundicha once a year.",
    ],
    associatedArtifacts: ['Pipli applique banners', 'Wooden chariot wheels'],
    relatedVillages: ['Jagannath Village'],
    relatedHeritageTrails: ['Pipli Craft Trail'],
    relatedNaturalSites: ['Puri Beach Coast'],
    images: [
      'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [19.8048, 85.8178],
    visitorInformation:
      'Takes place in Grand Road, Puri. The crowd reaches up to a million. Stand in designated tourists bays.',
    travelTips:
      'Wear protective footwear and stay in designated safety circles due to heavy crowds.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-jul-2',
    title: 'Karsha Gustor',
    category: 'Tribal Festival',
    season: 'Monsoon',
    month: 'July',
    startDate: '2027-07-30',
    endDate: '2027-07-31',
    state: 'Ladakh',
    district: 'Kargil',
    village: 'Karsha Village',
    community: 'Zanskari Buddhist community',
    description:
      'A dynamic monastery festival in Zanskar Valley featuring masked dances representing the victory of good spirits over negative energy.',
    historicalBackground:
      'Karsha Monastery (10th century Gelugpa sect) hosts this annual event to maintain peace and protection in the high valley.',
    culturalImportance:
      'Brings together remote mountain villagers. The climax features the burning of the storm (spirit catcher).',
    rituals: [
      'Cham mask dance by Gelugpa monks',
      'Incense-burning purification rituals',
      'Disposal of the sacrificial cake (Storma)',
    ],
    associatedCrafts: ['Thangka textile framing', 'Cham mask painting'],
    associatedRecipes: [
      'Thukpa (noodle soup)',
      'Tingmo (steamed bread)',
      'Salted butter tea',
    ],
    associatedStories: [
      'The protection of the high Zanskar passes by divine guardians.',
    ],
    associatedArtifacts: ['Cham masks', 'Prayer drums'],
    relatedVillages: ['Karsha Village'],
    relatedHeritageTrails: ['Zanskar Trek Heritage Trail'],
    relatedNaturalSites: ['Doda River'],
    images: [
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [33.5333, 76.9],
    visitorInformation:
      'Located at Karsha Monastery, Zanskar. Requires road travel from Leh or Padum.',
    travelTips:
      'Acclimatize in Leh for 3 days before traveling to the Zanskar region.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-jul-3',
    title: 'Bonalu',
    category: 'Temple Festival',
    season: 'Monsoon',
    month: 'July',
    startDate: '2027-07-11',
    endDate: '2027-07-26',
    state: 'Telangana',
    district: 'Hyderabad',
    village: 'Golkonda Village',
    community: 'Telugu community',
    description:
      'A colorful thanksgiving festival dedicated to Goddess Mahakali, where women carry brass or clay pots decorated with neem leaves on their heads.',
    historicalBackground:
      'Originated in 1813 during a plague outbreak in Hyderabad, when citizens prayed to Kali to save the city.',
    culturalImportance:
      'Honors mother goddess Kali, warding off diseases and epidemics during the humid monsoon season.',
    rituals: [
      'Offering Bonalu pots (rice cooked with milk and jaggery) to Goddess Kali',
      'Pothuraju (deity brother) lash dance',
      'Rangam (oracle forecasting)',
    ],
    associatedCrafts: ['Bonalu brass pot molding', 'Neem wreath making'],
    associatedRecipes: [
      'Bonam rice',
      'Mutton curry (traditional community feast)',
    ],
    associatedStories: [
      'Goddess Mahakali returning to her maternal home during Ashada month.',
    ],
    associatedArtifacts: ['Decorated clay pots', 'Pothuraju whips'],
    relatedVillages: ['Golkonda Village'],
    relatedHeritageTrails: ['Fort Heritage Trail'],
    relatedNaturalSites: ['Musian Estuary'],
    images: [
      'https://images.unsplash.com/photo-1596422846543-75c6fc1f4767?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [17.385, 78.4],
    visitorInformation:
      'Celebrated across different temples on successive Sundays in July. Golkonda Fort temple is the first.',
    travelTips:
      'Watch the vibrant processions of Pothuraju dancing to traditional drums.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-jul-4',
    title: 'Dree Festival',
    category: 'Tribal Festival',
    season: 'Monsoon',
    month: 'July',
    startDate: '2027-07-05',
    endDate: '2027-07-05',
    state: 'Arunachal Pradesh',
    district: 'Lower Subansiri',
    village: 'Ziro Village',
    community: 'Apatani tribe',
    description:
      'An agricultural festival of the Apatanis celebrated to pray for a successful crop season and protection from pests, featuring folk songs and rice beer.',
    historicalBackground:
      'Practiced since ancient times in the Ziro Valley, utilizing traditional ecological knowledge of wet rice cultivation.',
    culturalImportance:
      'Strengthens tribal farming systems, honors local crop gods, and showcases Apatani nose-plug and tattoo customs.',
    rituals: [
      'Offering sacrifices at public shrines (Danyi Pilo)',
      'Daminda (folk singing)',
      'Distributing cucumber (symbol of crop fertility)',
    ],
    associatedCrafts: [
      'Apatani bamboo weaving',
      'Traditional handloom (Gale) design',
    ],
    associatedRecipes: [
      'Sududu (bamboo shoot pork)',
      'Oppo (traditional Apatani millet beer)',
    ],
    associatedStories: [
      'Stories of Apatani migrations and their covenant with forest spirits.',
    ],
    associatedArtifacts: ['Bamboo poles', 'Sacred seed jars'],
    relatedVillages: ['Ziro Village'],
    relatedHeritageTrails: ['Ziro Valley Apatani Trail'],
    relatedNaturalSites: ['Talley Valley Wildlife Sanctuary'],
    images: [
      'https://images.unsplash.com/photo-1507038772120-7bef736b7f9a?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [27.59, 93.84],
    visitorInformation:
      'Main ground in Ziro hosts community games, folk dances, and local wine tasting.',
    travelTips:
      'Stay with Apatani families in Ziro valley to experience their unique eco-friendly lifestyle.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-jul-5',
    title: 'Champakulam Boat Race',
    category: 'Folk Performance',
    season: 'Monsoon',
    month: 'July',
    startDate: '2027-07-15',
    endDate: '2027-07-15',
    state: 'Kerala',
    district: 'Alappuzha',
    village: 'Champakulam Village',
    community: 'Malayali river community',
    description:
      'The oldest and most prestigious snake boat race of Kerala, marking the installation of the deity at Ambalappuzha Krishna Temple.',
    historicalBackground:
      'Began in 1545 CE when the royal family retrieved the Krishna idol under guidance of local oarsmen.',
    culturalImportance:
      'Kicks off the annual boat race season in Kerala backwaters, celebrating secular cooperation between communities.',
    rituals: [
      'Procession of floats in Pampa River',
      'Mass rowing race of Chundan Vallams (snake boats)',
    ],
    associatedCrafts: [
      'Chundan Vallam (100-foot teak boat) building',
      'Vanchi pattu (boat song) writing',
    ],
    associatedRecipes: [
      'Karimeen Pollichathu (pearl spot fish in banana leaf)',
      'Toddy-shop style clam stir-fry',
    ],
    associatedStories: [
      'The legendary retrieval of the Krishna idol from a distant monastery.',
    ],
    associatedArtifacts: ['Chundan Vallam snake boat', 'Golden oars'],
    relatedVillages: ['Champakulam Village'],
    relatedHeritageTrails: ['Kerala Backwater Trail'],
    relatedNaturalSites: ['Pamba River Creeks'],
    images: [
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [9.4, 76.37],
    visitorInformation:
      'Held in the Champakulam river stretch. Free bank seating; paid pavilion seats available.',
    travelTips:
      'Carry umbrellas and rainwear, as monsoon showers occur frequently during the race.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-jul-6',
    title: 'Harela Festival',
    category: 'Harvest Festival',
    season: 'Monsoon',
    month: 'July',
    startDate: '2027-07-16',
    endDate: '2027-07-16',
    state: 'Uttarakhand',
    district: 'Almora',
    village: 'Kosi Village',
    community: 'Kumaoni community',
    description:
      'A traditional festival celebrating the onset of monsoon and agricultural greening, marked by sowing ten types of grain seeds at home.',
    historicalBackground:
      'An ancient hill festival celebrating the wedding of Shiva and Parvati, symbolizing the reproduction of nature.',
    culturalImportance:
      'Stresses conservation of natural water springs, planting new trees, and checking forest health.',
    rituals: [
      'Sowing seeds in small clay pots 10 days prior',
      'Cutting the grown green blades (Harela) on festival day',
      'Placing green shoots behind ears for health',
    ],
    associatedCrafts: ['Clay pot painting', 'Traditional wood panel carving'],
    associatedRecipes: [
      'Singhal (sweet semolina spirals)',
      'Kumaoni Raita (spicy mustard seed cucumber curd)',
    ],
    associatedStories: [
      'The celestial marriage of Lord Shiva and Goddess Parvati.',
    ],
    associatedArtifacts: ['Harela pots', 'Clay models of Shiva-Parvati'],
    relatedVillages: ['Kosi Village'],
    relatedHeritageTrails: ['Kumaon Sacred Trails'],
    relatedNaturalSites: ['Binsar Forest Reserve'],
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [29.6205, 79.6284],
    visitorInformation:
      'Mainly a domestic festival. Community tree planting campaigns occur in villages.',
    travelTips:
      'Participate in village sapling plantation drives during this green festival.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // === AUGUST ===
  {
    id: 'ev-aug-1',
    title: 'Onam',
    category: 'Harvest Festival',
    season: 'Monsoon',
    month: 'August',
    startDate: '2027-08-25',
    endDate: '2027-09-03',
    state: 'Kerala',
    district: 'Ernakulam',
    village: 'Thripunithura',
    community: 'Malayali community',
    description:
      'The national harvest festival of Kerala, commemorating the mythical golden reign of King Mahabali and featuring grand flower carpets, boat races, and feasts.',
    historicalBackground:
      "Dates back to the 9th century. Celebrates King Mahabali being granted a yearly visit to his subjects by Lord Vishnu's Vamana avatar.",
    culturalImportance:
      'Unites all Keralites regardless of religion in a massive 10-day celebration of peace, prosperity, and cultural arts.',
    rituals: [
      'Laying Pookalam (floral carpets) daily',
      'Athachamayam cultural parade',
      'Pulikali (tiger dance) in Thrissur',
      'Onam Sadya grand feast',
    ],
    associatedCrafts: [
      'Kasavu (gold border handloom) weaving',
      'Clay model making (Thrikkakara Appan)',
    ],
    associatedRecipes: [
      'Onam Sadya (26-dish banquet including Payasam)',
      'Banana chips (Kaya Varuthathu)',
    ],
    associatedStories: [
      "The legend of King Mahabali's generosity and his descent to netherworld by Vamana.",
    ],
    associatedArtifacts: [
      'Pookalam patterns',
      'Kasavu mundu',
      'Clay Vamana models',
    ],
    relatedVillages: ['Thripunithura'],
    relatedHeritageTrails: ['Kerala Backwater Trail'],
    relatedNaturalSites: ['Vembanad Lake'],
    images: [
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [9.95, 76.35],
    visitorInformation:
      'Athachamayam parade is at Thripunithura (Day 1). Public feasts are hosted by clubs.',
    travelTips: 'Try the traditional sadya feast served on a banana leaf.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-aug-2',
    title: 'Raksha Bandhan',
    category: 'Village Celebration',
    season: 'Monsoon',
    month: 'August',
    startDate: '2027-08-28',
    endDate: '2027-08-28',
    state: 'Rajasthan',
    district: 'Udaipur',
    village: 'Shilpgram Village',
    community: 'Rajasthani community',
    description:
      'A traditional celebration of love and protection between brothers and sisters, marked by tying decorated threads (Rakhi) on wrists.',
    historicalBackground:
      'Ancient Vedic ritual where queens and common women sent protective threads to rulers to secure defense of the state.',
    culturalImportance:
      'Strengthens family bonds, fosters social harmony, and encourages the pledge of protecting women.',
    rituals: [
      'Tying a Rakhi thread',
      "Applying Tilak (vermilion) on brother's forehead",
      'Exchanging gifts and promises',
    ],
    associatedCrafts: [
      'Handmade thread Rakhi weaving',
      'Sandalwood bead carving',
    ],
    associatedRecipes: ['Kaju Katli', 'Kheer', 'Ghevar (traditional sweet)'],
    associatedStories: [
      'Queen Karnavati of Mewar sending a Rakhi to Emperor Humayun seeking protection.',
    ],
    associatedArtifacts: ['Decorated Rakhi threads', 'Pooja thali plates'],
    relatedVillages: ['Shilpgram Village'],
    relatedHeritageTrails: ['Mewar Royal Trail'],
    relatedNaturalSites: ['Fateh Sagar Lake'],
    images: [
      'https://images.unsplash.com/photo-1594136976652-306d1dbb8df0?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [24.58, 73.68],
    visitorInformation:
      'Celebrated domestically. Local craft shops sell distinct traditional handmade Rakhis.',
    travelTips:
      'Purchase handmade eco-friendly seeds Rakhis that can be planted post-festival.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-aug-3',
    title: 'Nehru Trophy Boat Race',
    category: 'Folk Performance',
    season: 'Monsoon',
    month: 'August',
    startDate: '2027-08-14',
    endDate: '2027-08-14',
    state: 'Kerala',
    district: 'Alappuzha',
    village: 'Punnamada Village',
    community: 'Malayali backwater community',
    description:
      'The most competitive and famous snake boat race of Kerala, held on Punnamada Lake, featuring thousands of oarsmen singing rhythmic songs.',
    historicalBackground:
      'Commenced in 1952 when Prime Minister Jawaharlal Nehru visited Alappuzha and was escorted by a row of majestic snake boats.',
    culturalImportance:
      'A great sporting spectacle. Teaches team building, precision, and tests rowing endurance of local river workers.',
    rituals: [
      'Inaugural parade of boats',
      'Vanchipattu (boat songs) chorus chanting',
      'Main snake boat final races',
    ],
    associatedCrafts: ['Teak snake boat engineering', 'Bamboo oars crafting'],
    associatedRecipes: [
      'Kappa & Meen Curry (tapioca and spicy fish curry)',
      'Fried banana slices',
    ],
    associatedStories: [
      'Jawaharlal Nehru jumping into a snake boat in sheer excitement during the 1952 race.',
    ],
    associatedArtifacts: ['Silver trophy model of snake boat', 'Wooden oars'],
    relatedVillages: ['Punnamada Village'],
    relatedHeritageTrails: ['Kerala Backwater Trail'],
    relatedNaturalSites: ['Vembanad Wetlands'],
    images: [
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [9.5076, 76.3508],
    visitorInformation:
      'Requires ticketed entry to the floating pavilions. Book weeks in advance.',
    travelTips:
      'Choose a seat in the northern gallery to witness the final sprint clearly.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-aug-4',
    title: 'Tarnetar Mela',
    category: 'Seasonal Market',
    season: 'Monsoon',
    month: 'August',
    startDate: '2027-08-30',
    endDate: '2027-09-02',
    state: 'Gujarat',
    district: 'Surendranagar',
    village: 'Tarnetar Village',
    community: 'Koli, Rabari and Bharwad tribes',
    description:
      'A grand tribal matchmaking fair held near the Trinetreshwar Mahadev Temple, famous for traditional dances and highly embroidered umbrellas.',
    historicalBackground:
      'Dates back to antiquity; revived by the royals of Lakhtar in the 18th century as a social platform for pastoral communities.',
    culturalImportance:
      'Tribal youth dress in finest clothes and seek life partners. Young men hold decorated umbrellas to attract brides.',
    rituals: [
      'Matchmaking meetings',
      'Hudo tribal dance with high jumps',
      'Taking a holy dip in temple tanks',
    ],
    associatedCrafts: [
      'Tarnetar embroidered umbrellas',
      'Rabari mirror embroidery',
    ],
    associatedRecipes: [
      'Sukhadi (wheat-jaggery sweet)',
      'Gujarati millet flatbreads',
    ],
    associatedStories: [
      "The belief that Arjuna performed Draupadi's swayamvara archery test near this temple pool.",
    ],
    associatedArtifacts: [
      'Embroidered umbrellas with mirrors',
      'Tribal silver ornaments',
    ],
    relatedVillages: ['Tarnetar Village'],
    relatedHeritageTrails: ['Saurashtra Tribal Craft Trail'],
    relatedNaturalSites: ['Trinetreshwar Pool'],
    images: [
      'https://images.unsplash.com/photo-1507038772120-7bef736b7f9a?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [22.5, 71.25],
    visitorInformation:
      'Open ground festival. Public transport from Rajkot or Surendranagar is recommended.',
    travelTips:
      'Purchase authentic mirror-work skirts and traditional fabrics directly from tribal vendors.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-aug-5',
    title: 'Teej Festival',
    category: 'Spring Festival',
    season: 'Monsoon',
    month: 'August',
    startDate: '2027-08-11',
    endDate: '2027-08-12',
    state: 'Rajasthan',
    district: 'Jaipur',
    village: 'Amber Village',
    community: 'Rajasthani women community',
    description:
      'A monsoon festival celebrating the reunion of Goddess Parvati with Lord Shiva, marked by swings, green attire, and grand street processions.',
    historicalBackground:
      'Began as a royal court procession in Jaipur, dedicated to celebrating the arrival of cooling monsoon rains after dry summer.',
    culturalImportance:
      'Prays for marital bliss and family well-being. Promotes female community bonding, singing, and folk music.',
    rituals: [
      'Tying swings to tree branches',
      'Applying henna/mehendi on hands',
      'Procession of Teej idol in golden palanquin',
    ],
    associatedCrafts: [
      'Leheriya (monsoon wave-tie-dye) textile',
      'Henna pattern designing',
    ],
    associatedRecipes: [
      'Ghevar (honeycomb-textured sweet)',
      'Malpua (sweet pancakes)',
    ],
    associatedStories: [
      'Parvati performing 108 births of penance to win Lord Shiva as her husband.',
    ],
    associatedArtifacts: ['Leheriya sarees', 'Decorative swings'],
    relatedVillages: ['Amber Village'],
    relatedHeritageTrails: ['Mewar Royal Trail'],
    relatedNaturalSites: ['Amber Hills'],
    images: [
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [26.985, 75.85],
    visitorInformation:
      'Processions happen in Old City Jaipur during late afternoons.',
    travelTips:
      'Buy a slice of Ghevar sweet from local sweet shops during the festival.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-aug-6',
    title: 'Minjar Fair',
    category: 'Harvest Festival',
    season: 'Monsoon',
    month: 'August',
    startDate: '2027-08-01',
    endDate: '2027-08-08',
    state: 'Himachal Pradesh',
    district: 'Chamba',
    village: 'Chamba Town',
    community: 'Chamba community',
    description:
      'A week-long harvest fair where people wear silk tassels (Minjar) representing maize shoots, wishing for crop success.',
    historicalBackground:
      'Celebrates the victory of the Raja of Chamba over the ruler of Trigarta in 935 AD, and introduction of maize crop.',
    culturalImportance:
      'A secular symbol of peace. People exchange maize shoots as a token of goodwill and throw coconuts into the Ravi River.',
    rituals: [
      'Offering Minjar (tassels) in Ravi river',
      'Grand procession of local deities in decorated chariots',
      'Singing Kunjari-Malhar monsoon songs',
    ],
    associatedCrafts: [
      'Minjar (silk gold tassel) embroidery',
      'Chamba leather chappal making',
    ],
    associatedRecipes: [
      'Madra (chickpeas in yogurt gravy)',
      'Chamba style sweet rice',
    ],
    associatedStories: [
      'The legend of the ancient sage turning the course of the Ravi River.',
    ],
    associatedArtifacts: ['Silk Minjar tassels', 'Chamba leather footwear'],
    relatedVillages: ['Chamba Town'],
    relatedHeritageTrails: ['Himachal Pine Valley Trail'],
    relatedNaturalSites: ['Ravi River Valley'],
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [32.5534, 76.1264],
    visitorInformation:
      'Held in the massive Chaugan public ground of Chamba town.',
    travelTips:
      'Pick up an authentic pair of Chamba leather sandals from the fair.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // === SEPTEMBER ===
  {
    id: 'ev-sep-1',
    title: 'Ganesh Chaturthi',
    category: 'Temple Festival',
    season: 'Autumn',
    month: 'September',
    startDate: '2027-09-04',
    endDate: '2027-09-14',
    state: 'Maharashtra',
    district: 'Pune',
    village: 'Saswad Village',
    community: 'Marathi community',
    description:
      'A grand festival honoring the birth of Lord Ganesha, marked by the installation of beautifully crafted clay idols and massive street drumming processions.',
    historicalBackground:
      'Promoted as a public social festival by Chhatrapati Shivaji Maharaj, and later revived by Bal Gangadhar Tilak in 1893 to unite people during the freedom struggle.',
    culturalImportance:
      'Promotes artistic creation of idols, classical music, social reforms, and massive public drum performances (Dhol Tasha).',
    rituals: [
      'Prana Pratishtha (deity installation)',
      'Daily prayers and Aarti',
      'Visarjan (immersion of idols in water bodies)',
    ],
    associatedCrafts: ['Shadu clay idol sculpting', 'Dhol Tasha drum making'],
    associatedRecipes: [
      'Ukadiche Modak (steamed rice-flour sweet stuffed with coconut and jaggery)',
      'Puran Poli',
    ],
    associatedStories: [
      'Lord Ganesha obtaining the status of first-worshipped deity by circling his parents.',
    ],
    associatedArtifacts: [
      'Clay idols',
      'Tasha drum sticks',
      'Brass camphor holders',
    ],
    relatedVillages: ['Saswad Village'],
    relatedHeritageTrails: ['Pune Heritage Trail'],
    relatedNaturalSites: ['Karha River Valley'],
    images: [
      'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [18.3444, 74.0305],
    visitorInformation:
      'SASWAD village holds historic celebrations. Pune city has massive immersion processions on Day 10.',
    travelTips:
      'Attend the Visarjan to watch the energetic Dhol Tasha troupes perform.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-sep-2',
    title: 'Bathukamma',
    category: 'Harvest Festival',
    season: 'Autumn',
    month: 'September',
    startDate: '2027-09-29',
    endDate: '2027-10-07',
    state: 'Telangana',
    district: 'Warangal',
    village: 'Pembarthi Village',
    community: 'Telugu women community',
    description:
      'A beautiful flower festival celebrating life and water, where women arrange seasonal wildflowers in concentric rings to form a temple tower shape.',
    historicalBackground:
      'Linked with ancient agrarian myths of Telangana, honoring Goddess Gauri for agricultural prosperity and restoration of soil.',
    culturalImportance:
      'Entirely ecological, worshipping nature and flowers that have medicinal qualities. Cleanses local village ponds.',
    rituals: [
      'Stacking flowers (Gunugu, Tangedu) in circular trays',
      'Dancing around the Bathukammas in circles',
      'Floating the floral structures in village lakes',
    ],
    associatedCrafts: [
      'Flower arrangement',
      'Brass plate engraving (Pembarthi)',
    ],
    associatedRecipes: [
      'Maleeda (crushed sweet wheat flatbread)',
      'Saddula Buvva (lemon and sesame rice)',
    ],
    associatedStories: [
      'Goddess Gauri taking refuge in medicinal flowers after defeating demons.',
    ],
    associatedArtifacts: [
      'Bathukamma brass plates',
      'Concentric flower pyramids',
    ],
    relatedVillages: ['Pembarthi Village'],
    relatedHeritageTrails: ['Kakatiya Dynasty Trail'],
    relatedNaturalSites: ['Waddepally Lake'],
    images: [
      'https://images.unsplash.com/photo-1596422846543-75c6fc1f4767?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [17.9689, 79.1669],
    visitorInformation:
      'Women assemble in village squares at sunset. The final day (Saddula Bathukamma) has grand lake float events.',
    travelTips:
      'Try making a small Bathukamma structure with local wild flowers.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-sep-3',
    title: 'Karma Festival',
    category: 'Tribal Festival',
    season: 'Autumn',
    month: 'September',
    startDate: '2027-09-11',
    endDate: '2027-09-12',
    state: 'Jharkhand',
    district: 'Ranchi',
    village: 'Khunti Village',
    community: 'Oraon, Munda, Santhal tribes',
    description:
      'A tribal harvest and youth festival worshipping the Karam tree branch (symbolizing youth, strength, and agricultural protection).',
    historicalBackground:
      'Practiced by indigenous forest tribes of Central India, celebrating the mutual protection between nature and humans.',
    culturalImportance:
      'Promotes tree plantation, environmental protection, and tribal dance styles (Karma dance).',
    rituals: [
      'Bringing a Karam branch from the forest to the village center',
      'Fasting and listening to Karam legends',
      'Group circle dancing with drums',
    ],
    associatedCrafts: ['Tribal drum (Madal) building', 'Leaf plate stitching'],
    associatedRecipes: [
      'Dhuska (fried rice-lentil snack)',
      'Red ant chutney (Demta)',
    ],
    associatedStories: [
      'Karma and Dharma, two brothers who learned the value of respecting nature.',
    ],
    associatedArtifacts: ['Karam branches', 'Madal drums'],
    relatedVillages: ['Khunti Village'],
    relatedHeritageTrails: ['Chota Nagpur Forest Trail'],
    relatedNaturalSites: ['Jonha Waterfalls'],
    images: [
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [23.0, 85.28],
    visitorInformation:
      'Takes place in tribal village clearings. Visitors are hosted with absolute warm hospitality.',
    travelTips:
      'Listen to the beautiful rhythmic beats of the Madal drum played by elders.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-sep-4',
    title: 'Ziro Festival of Music',
    category: 'Folk Performance',
    season: 'Autumn',
    month: 'September',
    startDate: '2027-09-23',
    endDate: '2027-09-26',
    state: 'Arunachal Pradesh',
    district: 'Lower Subansiri',
    village: 'Ziro Village',
    community: 'Apatani community and musicians',
    description:
      'An eco-friendly outdoor music festival held in the stunning Ziro Valley, showcasing independent folk, fusion, and modern music.',
    historicalBackground:
      'Founded in 2012 to create a sustainable platform for Northeast artists and encourage responsible eco-tourism.',
    culturalImportance:
      'Built entirely out of locally sourced bamboo, promoting zero-plastic waste and showcasing indigenous Apatani music.',
    rituals: [
      'Hosting collaborative jamming sessions',
      'Bamboo stage construction rituals',
    ],
    associatedCrafts: ['Bamboo stage design', 'Handloom weaving (Gale)'],
    associatedRecipes: [
      'Pika pila (bamboo shoot pickle)',
      'Barbecue pork',
      'Millet wine',
    ],
    associatedStories: [
      'Tales of nature worship and preservation in the Eastern Himalayas.',
    ],
    associatedArtifacts: ['Bamboo mugs', 'Handicraft bags'],
    relatedVillages: ['Ziro Village'],
    relatedHeritageTrails: ['Ziro Valley Apatani Trail'],
    relatedNaturalSites: ['Talley Valley Reserve'],
    images: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [27.6, 93.85],
    visitorInformation:
      'Requires festival passes. Camp in the surrounding pine forests.',
    travelTips:
      'Carry gumboots and raincoats as September in Ziro gets frequent monsoon showers.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-sep-5',
    title: 'Abhaneri Stepwell Festival',
    category: 'Folk Performance',
    season: 'Autumn',
    month: 'September',
    startDate: '2027-09-27',
    endDate: '2027-09-28',
    state: 'Rajasthan',
    district: 'Dausa',
    village: 'Abhaneri Village',
    community: 'Rajasthani artists',
    description:
      "A festival held inside the majestic Chand Baori (one of India's deepest stepwells), showcasing Rajasthani folk dances and puppetry.",
    historicalBackground:
      "Organized to draw attention to Rajasthan's water heritage and celebrate the complex engineering of ancient stepwells.",
    culturalImportance:
      'Revives performing arts like Kalbelia, Bhavai, and Langa singing, set against the historic stepwell architecture.',
    rituals: [
      'Illuminating the stepwell steps with lamps',
      'Evening puppet shows (Kathputli)',
    ],
    associatedCrafts: ['Clay lamp throwing', 'Rajasthani puppet making'],
    associatedRecipes: ['Kachori', 'Lassi in clay cups', 'Gatte ki Sabzi'],
    associatedStories: [
      'The legendary creation of Chand Baori by spirits in a single night.',
    ],
    associatedArtifacts: ['Kathputli puppets', 'Earthen lamps'],
    relatedVillages: ['Abhaneri Village'],
    relatedHeritageTrails: ['Rajasthan Water Heritage Trail'],
    relatedNaturalSites: ['Harshat Mata Shrines'],
    images: [
      'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [27.0084, 76.6025],
    visitorInformation:
      'Open to public. Evening musical displays are highlights.',
    travelTips:
      'Use telephoto lenses to capture the geometry of Chand Baori steps safely from the barriers.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-sep-6',
    title: 'Aranmula Snake Boat Race',
    category: 'Temple Festival',
    season: 'Autumn',
    month: 'September',
    startDate: '2027-09-17',
    endDate: '2027-09-18',
    state: 'Kerala',
    district: 'Pathanamthitta',
    village: 'Aranmula Village',
    community: 'Malayali Hindu community',
    description:
      'The oldest traditional river boat race of Kerala, closely associated with the Aranmula Parthasarathy Temple.',
    historicalBackground:
      'Began as a ritual escort for the vessel carrying food offerings (Thiruvona Sadya) to the deity at Parthasarathy temple.',
    culturalImportance:
      'Highly spiritual, emphasizing devotion and strict vegetarian vows of the rowers, rather than commercial sportsmanship.',
    rituals: [
      'Rhythmic boat songs (Vanchipattu) singing',
      'Grand ceremonial feast (Aranmula Valla Sadya) for oarsmen',
    ],
    associatedCrafts: [
      'Aranmula metal mirror casting',
      'Wooden snake boat construction',
    ],
    associatedRecipes: [
      'Valla Sadya (60-dish massive feast)',
      'Ambalappuzha Palpayasam',
    ],
    associatedStories: [
      'The legend of Lord Krishna guiding the boat of the poor devotee.',
    ],
    associatedArtifacts: ['Aranmula Kannadi (metal mirror)', 'Chundan Vallam'],
    relatedVillages: ['Aranmula Village'],
    relatedHeritageTrails: ['Kerala Temple Trail'],
    relatedNaturalSites: ['Pampa River Valley'],
    images: [
      'https://images.unsplash.com/photo-1615286500402-4841b52a67e8?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [9.3333, 76.6833],
    visitorInformation:
      'Best viewed from the banks of Pampa River near Aranmula Temple.',
    travelTips:
      'Visit local family workshops to see how the legendary Aranmula metal mirrors are cast.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // === OCTOBER ===
  {
    id: 'ev-oct-1',
    title: 'Durga Puja',
    category: 'Festival',
    season: 'Autumn',
    month: 'October',
    startDate: '2027-10-05',
    endDate: '2027-10-09',
    state: 'West Bengal',
    district: 'Kolkata',
    village: 'Kumartuli Village',
    community: 'Bengali community',
    description:
      'An unparalleled celebration of art, culture, and community, where temporary artistic temples (pandals) host exquisite clay idols of Goddess Durga.',
    historicalBackground:
      'UNESCO Intangible Cultural Heritage. Expanded in the 18th century as community-driven social festivals uniting diverse sections of Bengal.',
    culturalImportance:
      'A massive public art exhibition. Kumartuli village is the historic hub where potters sculpt idols using river clay.',
    rituals: [
      'Bodhon (awakening the deity)',
      'Dhunuchi Naach (dancing with clay pots of burning incense)',
      'Sindoor Khela (vermilion play by married women)',
    ],
    associatedCrafts: [
      'Clay idol sculpting',
      'Sholapith (pith wood) decoration',
      'Pandal construction craft',
    ],
    associatedRecipes: [
      'Bhoger Khichuri (sacred lentil-rice)',
      'Labra (mixed vegetables)',
      'Sandesh sweets',
    ],
    associatedStories: [
      'Goddess Durga defeating Mahishasura, representing the victory of divine power.',
    ],
    associatedArtifacts: ['Dhak drums', 'Dhunuchi pots', 'Sholapith crowns'],
    relatedVillages: ['Kumartuli Village'],
    relatedHeritageTrails: ['Kolkata Art Trail'],
    relatedNaturalSites: ['Hooghly River Ghats'],
    images: [
      'https://images.unsplash.com/photo-1605807646973-e4035b77094d?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [22.5994, 88.3584],
    visitorInformation:
      'Visit Kumartuli a week before the festival to watch artists paint the eyes of Durga (Chokkhudan). Pandals are open 24/7.',
    travelTips: 'Pandal-hop at night when lighting displays are fully active.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-oct-2',
    title: 'Mysore Dasara',
    category: 'Festival',
    season: 'Autumn',
    month: 'October',
    startDate: '2027-10-01',
    endDate: '2027-10-10',
    state: 'Karnataka',
    district: 'Mysore',
    village: 'Srirangapatna',
    community: 'Kannada community',
    description:
      'The state festival of Karnataka, culminating in the Jumboo Savari (elephant procession) carrying Goddess Chamundeshwari through illuminated palace gates.',
    historicalBackground:
      'Started by the Vijayanagara Kings in the 15th century, later continued by the Wodeyar dynasty of Mysore.',
    culturalImportance:
      'Highlights the victory of Chamundeshwari over demon Mahishasura. Shows Mysore palace illuminated with 100,000 light bulbs.',
    rituals: [
      'Worshipping royal arms (Ayudha Puja)',
      'Pulling royal golden palanquin on elephant',
      'Palace illumination displays',
    ],
    associatedCrafts: [
      'Rosewood inlay work',
      'Mysore silk handloom weaving',
      'Wooden toys of Channapatna',
    ],
    associatedRecipes: [
      'Mysore Pak (sweet made of gram flour and ghee)',
      'Bisi Bele Bath',
    ],
    associatedStories: [
      'Goddess Chamundeshwari slaying the buffalo demon Mahishasura on Chamundi Hill.',
    ],
    associatedArtifacts: [
      'Golden Howdah (elephant seat)',
      'Mysore silk sarees',
    ],
    relatedVillages: ['Srirangapatna'],
    relatedHeritageTrails: ['Wodeyar Royal Heritage Trail'],
    relatedNaturalSites: ['Kaveri River Delta'],
    images: [
      'https://images.unsplash.com/photo-1600100397628-9999bf67a629?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [12.3023, 76.6529],
    visitorInformation:
      'Tickets are required for Palace entry during Jumboo Savari.',
    travelTips:
      'Visit the exhibition grounds nearby to buy authentic local sandalwood oil and silk.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-oct-3',
    title: 'Marwar Festival',
    category: 'Folk Performance',
    season: 'Autumn',
    month: 'October',
    startDate: '2027-10-22',
    endDate: '2027-10-23',
    state: 'Rajasthan',
    district: 'Jodhpur',
    village: 'Salawas Village',
    community: 'Marwari community',
    description:
      'A festival held in Jodhpur dedicated to the heroes and folklore of the Marwar region, featuring folk dance and music at Mehrangarh Fort.',
    historicalBackground:
      'Originally known as the Maand Festival, organized to preserve the complex classical singing style of Maand in Rajasthan.',
    culturalImportance:
      'Brings focus to local rural craft villages like Salawas (durry weaving) and promotes classical Rajasthani folk heritage.',
    rituals: ['Horse polo matches', 'Folk performances at Mehrangarh Fort'],
    associatedCrafts: [
      'Salawas flat-weave rugs (Durrie)',
      'Leather Jutti making',
    ],
    associatedRecipes: ['Jodhpuri Mawa Kachori', 'Mirchi Bada spicy snack'],
    associatedStories: [
      'Tales of Rajput valor and loyalty of Marwar soldiers.',
    ],
    associatedArtifacts: ['Hand-woven durries', 'Traditional swords'],
    relatedVillages: ['Salawas Village'],
    relatedHeritageTrails: ['Desert Oasis Trail'],
    relatedNaturalSites: ['Kailana Lake'],
    images: [
      'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [26.2978, 73.0216],
    visitorInformation:
      'Events are free, held at Mehrangarh Fort and Umaid Bhawan Palace grounds.',
    travelTips:
      'Visit Salawas village during the day to try hand-weaving a dhurrie rug.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-oct-4',
    title: 'Kullu Dussehra',
    category: 'Temple Festival',
    season: 'Autumn',
    month: 'October',
    startDate: '2027-10-11',
    endDate: '2027-10-17',
    state: 'Himachal Pradesh',
    district: 'Kullu',
    village: 'Dhalpur Village',
    community: 'Pahari community',
    description:
      'A unique week-long Dussehra celebration where over 200 village deities from surrounding hills gather to pay respects to Lord Raghunath.',
    historicalBackground:
      'Began in 1637 AD when Raja Jagat Singh installed the idol of Raghunath to cure a curse, initiating a system of tribute from hill gods.',
    culturalImportance:
      'A grand socio-religious gathering. Unlike elsewhere, Dussehra starts when other regions finish, and no effigy of Ravana is burned.',
    rituals: [
      'Procession of hill gods on wooden litters (Raths)',
      'Worshipping Lord Raghunath',
      'Burning Lanka (bonfire) near Beas river',
    ],
    associatedCrafts: [
      'Pahari wooden mask carving',
      'Traditional basket weaving',
    ],
    associatedRecipes: ['Siddu', 'Pahari meat dishes cooked with local herbs'],
    associatedStories: [
      'Legends of the local deities controlling mountain peaks.',
    ],
    associatedArtifacts: ['Deity litters', 'Traditional Pahari horns (Karnal)'],
    relatedVillages: ['Dhalpur Village'],
    relatedHeritageTrails: ['Himachal Pine Valley Trail'],
    relatedNaturalSites: ['Beas River Basin'],
    images: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [31.9578, 77.1084],
    visitorInformation:
      'Held in Dhalpur ground, Kullu. Very colorful spectacles of folk musicians.',
    travelTips:
      'Keep a safe distance when the heavy wooden litters are carried down the hills.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-oct-5',
    title: 'Wangala Festival',
    category: 'Tribal Festival',
    season: 'Autumn',
    month: 'October',
    startDate: '2027-10-15',
    endDate: '2027-10-17',
    state: 'Meghalaya',
    district: 'West Garo Hills',
    village: 'Tura Village',
    community: 'Garo tribe',
    description:
      'Known as the "100 Drums Festival," this is a harvest festival of the Garos, honoring Saljong (the Sun God of fertility) with drum beats and dances.',
    historicalBackground:
      'Pre-colonial agrarian celebration marking the end of agricultural labor, traditionally held before winter storing.',
    culturalImportance:
      'Expresses gratitude for the agricultural yield, preserves the oral music of the Garos, and features competitive drumming.',
    rituals: [
      "Sasat Soa (burning incense in the chief's house)",
      'Ruga Soa (offering crop beer)',
      'Dancing to 100 synchronized drums',
    ],
    associatedCrafts: ['Garo drum (Kram) carving', 'Bamboo weaving'],
    associatedRecipes: [
      'Kappa (meat cooked with soda)',
      'Traditional Garo rice wine (Bitchi)',
    ],
    associatedStories: [
      'Legends of Saljong descending to teach the Garos how to plant crops.',
    ],
    associatedArtifacts: ['Kram drums', 'Garo feathered headbands'],
    relatedVillages: ['Tura Village'],
    relatedHeritageTrails: ['Garo Hills Eco-Trail'],
    relatedNaturalSites: ['Nokrek Biosphere Reserve'],
    images: [
      'https://images.unsplash.com/photo-1507038772120-7bef736b7f9a?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [25.5167, 90.2167],
    visitorInformation:
      'Tura ground hosts the central tourism celebration. Local village festivals occur later.',
    travelTips:
      'Stay in the Nokrek reserve area homestays to witness authentic forest-border celebrations.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-oct-6',
    title: 'Tawang Festival',
    category: 'Tribal Festival',
    season: 'Autumn',
    month: 'October',
    startDate: '2027-10-26',
    endDate: '2027-10-29',
    state: 'Arunachal Pradesh',
    district: 'Tawang',
    village: 'Monpa Village',
    community: 'Monpa community',
    description:
      'A festival showcasing the rich heritage of the Monpa tribe, featuring monastic mask dances, tribal sports, and Buddhist chanting.',
    historicalBackground:
      'Started in 2012 by Arunachal Tourism to promote the tourism potential of Tawang and highlight Buddhist Monpa culture.',
    culturalImportance:
      'Preserves traditional tribal arts, local handloom, and celebrates Monpa village heritage.',
    rituals: [
      'Chanting by monks',
      'Masked Cham dances',
      'Traditional archery contests',
    ],
    associatedCrafts: ['Handmade paper (Shugu) making', 'Thangka painting'],
    associatedRecipes: [
      'Thukpa noodle broth',
      'Zan (flatbread with vegetables)',
    ],
    associatedStories: [
      'The migration of the Dalai Lama through Tawang in 1959.',
    ],
    associatedArtifacts: ['Archery bows', 'Prayer books'],
    relatedVillages: ['Monpa Village'],
    relatedHeritageTrails: ['Tawang Monastery Trail'],
    relatedNaturalSites: ['Sela Pass'],
    images: [
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [27.58, 91.86],
    visitorInformation:
      'Centered in Tawang town. Very cold; tourists should pack layers.',
    travelTips: 'Visit the Monpa handmade paper factory during the day.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // === NOVEMBER ===
  {
    id: 'ev-nov-1',
    title: 'Diwali',
    category: 'Festival',
    season: 'Winter',
    month: 'November',
    startDate: '2027-11-08',
    endDate: '2027-11-12',
    state: 'Uttar Pradesh',
    district: 'Ayodhya',
    village: 'Ayodhya Village',
    community: 'All Indian communities',
    description:
      'The national festival of lights, celebrated by illuminating homes with clay oil lamps, sharing sweets, and setting off fireworks.',
    historicalBackground:
      'Marks the return of Lord Rama to Ayodhya after 14 years of exile and defeating Ravana, signifying victory of light over darkness.',
    culturalImportance:
      'Stresses renewal, clearing old debts, cleanliness, and the victory of knowledge over ignorance. Welcomes prosperity.',
    rituals: [
      'Lighting earthen diyas (oil lamps)',
      'Rangoli pattern drawing',
      'Exchanging sweets and gifts',
    ],
    associatedCrafts: ['Clay diya throwing', 'Paper lantern making'],
    associatedRecipes: ['Kaju Katli', 'Mawa Barfi', 'Samosas'],
    associatedStories: ['The return of Rama, Sita, and Lakshmana to Ayodhya.'],
    associatedArtifacts: ['Clay diyas', 'Silver Lakshmi-Ganesha coins'],
    relatedVillages: ['Ayodhya Village'],
    relatedHeritageTrails: ['Sarayu River Trail'],
    relatedNaturalSites: ['Sarayu River Ghats'],
    images: [
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [26.8, 82.2],
    visitorInformation:
      'Ayodhya hosts the "Deepotsav" with millions of clay lamps lit on the riverbanks.',
    travelTips:
      'Purchase handmade clay diyas from local potters to support rural livelihood.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-nov-2',
    title: 'Pushkar Camel Fair',
    category: 'Seasonal Market',
    season: 'Winter',
    month: 'November',
    startDate: '2027-11-18',
    endDate: '2027-11-25',
    state: 'Rajasthan',
    district: 'Ajmer',
    village: 'Pushkar Village',
    community: 'Camel traders and villagers',
    description:
      "One of the world's largest camel and livestock fairs, featuring trading, camel races, and massive desert cultural performances.",
    historicalBackground:
      'Ancient trade fair aligning with Kartik Poornima, when pilgrims take holy dips in the sacred Pushkar Lake.',
    culturalImportance:
      'A major trading hub for rural farmers. Showcases Rajasthani crafts, bridal competitions, and traditional music.',
    rituals: [
      'Holy dip in Pushkar Lake on Kartik Poornima',
      'Camel trading and grooming contests',
      'Folk concerts under night skies',
    ],
    associatedCrafts: [
      'Camel body tattooing and shaving art',
      'Rosewater distilling',
    ],
    associatedRecipes: ['Dal Baati Churma', 'Malpua sweet of Pushkar'],
    associatedStories: [
      'Lord Brahma creating the Pushkar Lake by dropping a lotus petal.',
    ],
    associatedArtifacts: ['Camel collars', 'Bead harnesses'],
    relatedVillages: ['Pushkar Village'],
    relatedHeritageTrails: ['Desert Oasis Trail'],
    relatedNaturalSites: ['Pushkar Sacred Lake'],
    images: [
      'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [26.4897, 74.5512],
    visitorInformation:
      'The desert dunes host the animal trading. The lake ghats host spiritual rituals.',
    travelTips:
      'Hire a registered guide to navigate the vast camel trading grounds safely.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-nov-3',
    title: 'Sonepur Cattle Fair',
    category: 'Seasonal Market',
    season: 'Winter',
    month: 'November',
    startDate: '2027-11-23',
    endDate: '2027-12-22',
    state: 'Bihar',
    district: 'Saran',
    village: 'Sonepur Village',
    community: 'Bihari farmers and traders',
    description:
      'The largest cattle fair in Asia, stretching for a month, where elephants, horses, and various cattle are traded on the banks of Gandak River.',
    historicalBackground:
      'Dates back to Emperor Chandragupta Maurya who purchased elephants for his army here. Historically held at the confluence of Ganges and Gandak.',
    culturalImportance:
      'Sustains ancient rural trade links. Features circus shows, theater performances, and massive handicraft stalls.',
    rituals: [
      'Holy bath at Ganga-Gandak confluence',
      'Exhibiting decorated elephants',
    ],
    associatedCrafts: ['Straw rope making', 'Leather whips crafting'],
    associatedRecipes: ['Bihari Litti Chokha', 'Tilkut (sesame-sugar sweet)'],
    associatedStories: [
      'The legend of Gajendra Moksha (elephant rescued by Vishnu) at this river bank.',
    ],
    associatedArtifacts: ['Cattle bells', 'Traditional ropes'],
    relatedVillages: ['Sonepur Village'],
    relatedHeritageTrails: ['Ganges River Trail'],
    relatedNaturalSites: ['Gandak River Confluence'],
    images: [
      'https://images.unsplash.com/photo-1610016302534-6f67f1c968d8?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [25.7, 85.1833],
    visitorInformation:
      'Requires walking through massive animal stalls. Very rustic environment.',
    travelTips:
      'Visit the horse stalls (Harihar Kshetra) to see rare Indian horse breeds.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-nov-4',
    title: 'Hampi Utsav',
    category: 'Folk Performance',
    season: 'Winter',
    month: 'November',
    startDate: '2027-11-03',
    endDate: '2027-11-05',
    state: 'Karnataka',
    district: 'Vijayanagara',
    village: 'Hampi Village',
    community: 'Kannada artists',
    description:
      'A cultural festival bringing the ruins of the Vijayanagara Empire to life with light shows, classical music, and folk dances.',
    historicalBackground:
      'Celebrated since the Vijayanagara era (14th century), revived by the state government to showcase Kannada heritage.',
    culturalImportance:
      'Connects stone architecture with classical performing arts, showcasing shadows and lights on Virupaksha Temple ruins.',
    rituals: ['Jana Pada (folk dance) parade', 'Illuminating Hampi monuments'],
    associatedCrafts: [
      'Stone masonry replica craft',
      'Leather puppet making (Togalu Gombeyaata)',
    ],
    associatedRecipes: ['Ragi Mudde', 'Jowar Roti with curry', 'Coconut rice'],
    associatedStories: ['The rise and fall of the great Vijayanagara Empire.'],
    associatedArtifacts: ['Leather puppets', 'Stone craft carvings'],
    relatedVillages: ['Hampi Village'],
    relatedHeritageTrails: ['Vijayanagara Ruins Trail'],
    relatedNaturalSites: ['Tungabhadra River Valley'],
    images: [
      'https://images.unsplash.com/photo-1600100397628-9999bf67a629?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [15.335, 76.46],
    visitorInformation:
      'Monuments are lit up from 6:00 PM to 10:00 PM. Entry is open to public.',
    travelTips:
      'Rent a bicycle to explore the different performance stages spread across ruins.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-nov-5',
    title: 'Dev Deepawali',
    category: 'Temple Festival',
    season: 'Winter',
    month: 'November',
    startDate: '2027-11-22',
    endDate: '2027-11-22',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    village: 'Varanasi Ghats',
    community: 'Varanasi community',
    description:
      'A celestial festival of lights where all 84 steps/ghats of Varanasi are illuminated with over a million clay oil lamps (diyas).',
    historicalBackground:
      "Celebrated on Kartik Poornima, representing the day gods descended to earth to celebrate Shiva's victory over demon Tripurasura.",
    culturalImportance:
      'Highly spiritual river worship. Attracts visitors worldwide who watch the reflections of lamps in the Ganges River.',
    rituals: [
      'Lighting diyas on all river steps',
      'Maha Aarti at Dashashwamedh Ghat',
      'Floating oil lamps on the Ganges River',
    ],
    associatedCrafts: ['Diya casting', 'Brass lamp polishing'],
    associatedRecipes: [
      'Banarasi Kachori Sabzi',
      'Malaiyo (saffron milk foam sweet)',
    ],
    associatedStories: [
      'Lord Shiva destroying the three cities of demon Tripurasura.',
    ],
    associatedArtifacts: ['Clay diyas', 'Camphor lamps'],
    relatedVillages: ['Varanasi Ghats'],
    relatedHeritageTrails: ['Ganges River Trail'],
    relatedNaturalSites: ['Ganges River Bed'],
    images: [
      'https://images.unsplash.com/photo-1561361531-99522c3a1211?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [25.3176, 83.0064],
    visitorInformation:
      'Hire a boat weeks in advance. The river becomes crowded with boats during sunset.',
    travelTips:
      'Wear life jackets on boats. Arrive at the ghats by 3:00 PM to get seating.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-nov-6',
    title: 'Sangai Festival',
    category: 'Festival',
    season: 'Winter',
    month: 'November',
    startDate: '2027-11-21',
    endDate: '2027-11-30',
    state: 'Manipur',
    district: 'Imphal West',
    village: 'Moirang Village',
    community: 'Manipuri community',
    description:
      'The state festival of Manipur, showcasing rich handloom, food, sports (polo), and classic Manipuri dances.',
    historicalBackground:
      'Named after the state animal, the brow-antlered Sangai deer found only at Loktak Lake.',
    culturalImportance:
      'Promotes eco-tourism, tribal unity, and the preservation of the endangered Sangai deer habitat.',
    rituals: [
      'Inauguration with classical Manipuri dance (Ras Leela)',
      'Indigenous sport (Sagol Kangjei - polo) displays',
    ],
    associatedCrafts: ['Kauna (water reed) mat weaving', 'Manipuri pottery'],
    associatedRecipes: [
      'Eromba (boiled vegetables mashed with fish)',
      'Chak-hao Kheer (purple black rice pudding)',
    ],
    associatedStories: [
      'Folk stories about the sacred Sangai deer guiding tribal pathfinders.',
    ],
    associatedArtifacts: ['Kauna reed baskets', 'Polo sticks'],
    relatedVillages: ['Moirang Village'],
    relatedHeritageTrails: ['Manipur Pottery Trail'],
    relatedNaturalSites: ['Keibul Lamjao Floating National Park'],
    images: [
      'https://images.unsplash.com/photo-1547841243-eacb14453cd9?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [24.5, 93.75],
    visitorInformation:
      'Split between Imphal grounds and Moirang near Loktak lake.',
    travelTips:
      'Taste the delicious purple Chak-hao Kheer prepared by local women.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // === DECEMBER ===
  {
    id: 'ev-dec-1',
    title: 'Hornbill Festival',
    category: 'Tribal Festival',
    season: 'Winter',
    month: 'December',
    startDate: '2027-12-01',
    endDate: '2027-12-10',
    state: 'Nagaland',
    district: 'Kohima',
    village: 'Kisama Village',
    community: 'Naga tribes (17 tribes)',
    description:
      'The famous "Festival of Festivals" in Nagaland, bringing together 17 major Naga tribes in a massive display of dances, music, food, and crafts.',
    historicalBackground:
      'Launched in 2000 by the State Government to encourage inter-tribal interaction and preserve Naga war stories and folklore.',
    culturalImportance:
      "Maintains Nagaland's rich oral traditions, warriors' songs, and traditional architecture. Each tribe has a designated mud cottage (Morung).",
    rituals: [
      'Tribe war horn blowing',
      'Tribal archery and wrestling',
      'Daily night music carnivals',
    ],
    associatedCrafts: [
      'Wood carving',
      'Naga bead ornament making',
      'Bamboo architecture',
    ],
    associatedRecipes: [
      'Smoked pork cooked with Axone (fermented soya)',
      'Naga chili sauces',
    ],
    associatedStories: [
      'Folk stories about the forest Hornbill bird representing loyalty and beauty.',
    ],
    associatedArtifacts: ['Naga spears', 'Hornbill feathers', 'Log drums'],
    relatedVillages: ['Kisama Village'],
    relatedHeritageTrails: ['Naga Warrior Trail'],
    relatedNaturalSites: ['Dzukou Valley'],
    images: [
      'https://images.unsplash.com/photo-1547841243-eacb14453cd9?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [25.6034, 94.1167],
    visitorInformation:
      'Kisama Heritage Village is located 12 km from Kohima. Ticketed entry. Dress in warm layers.',
    travelTips:
      'Visit the individual Morungs (tribal huts) to talk directly with tribe elders.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-dec-2',
    title: 'Rann Utsav',
    category: 'Seasonal Market',
    season: 'Winter',
    month: 'December',
    startDate: '2027-12-01',
    endDate: '2028-02-28',
    state: 'Gujarat',
    district: 'Kutch',
    village: 'Dhordo Village',
    community: 'Kutchi weavers and artisans',
    description:
      'A months-long winter festival celebrating the white salt desert of Kutch, featuring moonlit folk music, camel rides, and embroidery bazaars.',
    historicalBackground:
      'Initiated to revive the economy of desert villages post the devastating 2001 Gujarat earthquake, showcasing Kutchi arts.',
    culturalImportance:
      'Provides a critical seasonal bazaar for craft styles (Roghan art, Ajrakh block print, Kutchi mirror embroidery).',
    rituals: ['Moonlit desert viewing', 'Kutchi folk singing around fires'],
    associatedCrafts: [
      'Roghan paint art',
      'Ajrakh hand block printing',
      'Kutchi leather work',
    ],
    associatedRecipes: [
      'Bajra rotla with garlic chutney',
      'Kutchi Dabeli snack',
    ],
    associatedStories: [
      'Legends of desert saints guiding lost camel caravans.',
    ],
    associatedArtifacts: ['Roghan fabrics', 'Ajrakh blocks'],
    relatedVillages: ['Dhordo Village'],
    relatedHeritageTrails: ['Kutch Craft Trail'],
    relatedNaturalSites: ['White Rann of Kutch'],
    images: [
      'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [23.8342, 69.7312],
    visitorInformation:
      'A tent city is set up at Dhordo. Requires permit to visit the White Rann boundary.',
    travelTips:
      'Plan your trip to overlap with the full moon night for a stunning salt desert view.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-dec-3',
    title: 'Galdan Namchot',
    category: 'Temple Festival',
    season: 'Winter',
    month: 'December',
    startDate: '2027-12-23',
    endDate: '2027-12-23',
    state: 'Ladakh',
    district: 'Leh',
    village: 'Alchi Village',
    community: 'Ladakhi Buddhists',
    description:
      'A festival marking the birth and enlightenment of Je Tsongkhapa, founder of Gelugpa sect, celebrated by illuminating all homes with butter lamps.',
    historicalBackground:
      'Began in Tibet in 1419 AD; represents the starting event of the Ladakhi New Year (Losar) preparation.',
    culturalImportance:
      'Brings warmth and spiritual light during freezing Himalayan winter. Monasteries display specialized butter sculptures.',
    rituals: [
      'Lighting hundreds of clay butter lamps on walls',
      'Preparing traditional noodles at home',
      'Exchanging Khatas (blessing scarves)',
    ],
    associatedCrafts: ['Butter lamp clay molding', 'Khata scarf weaving'],
    associatedRecipes: ['Guthuk soup', 'Apricot jam sweets'],
    associatedStories: [
      "Je Tsongkhapa's reform of Tibetan Buddhist monastic discipline.",
    ],
    associatedArtifacts: ['Butter lamps', 'Khata scarves'],
    relatedVillages: ['Alchi Village'],
    relatedHeritageTrails: ['High Passes Monastery Trail'],
    relatedNaturalSites: ['Indus River Valley'],
    images: [
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [34.2236, 77.1753],
    visitorInformation:
      'Villages are decorated with soft golden lights at night. Temperatures drop below zero.',
    travelTips:
      'Stay with a local family to enjoy the traditional hot Guthuk noodle soup together.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-dec-4',
    title: 'Cochin Carnival',
    category: 'Village Celebration',
    season: 'Winter',
    month: 'December',
    startDate: '2027-12-25',
    endDate: '2027-12-31',
    state: 'Kerala',
    district: 'Ernakulam',
    village: 'Fort Kochi',
    community: 'Kochi community',
    description:
      'A grand coastal carnival culminating in the burning of a giant effigy of Pappan (Santa-like figure) on Fort Kochi beach at midnight.',
    historicalBackground:
      'Evolved from Portuguese New Year celebrations held at Fort Kochi during the colonial era.',
    culturalImportance:
      'Expresses local harmony, joy, and marks the renewal of the calendar year with music parades on the beach.',
    rituals: [
      'Burning of the giant Pappan effigy',
      'Beach bike races and swim races',
      'New Year midnight parade',
    ],
    associatedCrafts: ['Effigy construction', 'Float decorating'],
    associatedRecipes: ['Kochi style fish biryani', 'Plum cakes'],
    associatedStories: [
      'Colonial trade history and the blending of European-Kerala cultures.',
    ],
    associatedArtifacts: ['Pappan paper effigy', 'Procession drums'],
    relatedVillages: ['Fort Kochi'],
    relatedHeritageTrails: ['Kochi Coastal Heritage Trail'],
    relatedNaturalSites: ['Kochi Beach Coastline'],
    images: [
      'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [9.9667, 76.2417],
    visitorInformation:
      'Fort Kochi beach is extremely packed on Dec 31 night. Access control points are active.',
    travelTips:
      'Stand near the Dutch cemetery gates to watch the New Year parade start.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-dec-5',
    title: 'Mamallapuram Dance Festival',
    category: 'Folk Performance',
    season: 'Winter',
    month: 'December',
    startDate: '2027-12-25',
    endDate: '2028-01-25',
    state: 'Tamil Nadu',
    district: 'Chengalpattu',
    village: 'Mamallapuram Village',
    community: 'Classical dancers',
    description:
      "A month-long dance festival showcasing India's finest classical dances against the Shore Temple ruins.",
    historicalBackground:
      'Began in 1992 by Tamil Nadu Tourism to promote heritage Pallava stone structures alongside classical dance.',
    culturalImportance:
      'Preserves traditional dance heritage (Bharatanatyam, Kathakali, Mohiniyattam) and attracts international tourists.',
    rituals: [
      'Evening dance recitals',
      'Light projections on Pallava rock reliefs',
    ],
    associatedCrafts: ['Stone carving', 'Classical dance dress making'],
    associatedRecipes: [
      'Idli and coconut chutney',
      'Filter coffee',
      'Spicy seafood fry',
    ],
    associatedStories: [
      'Pallava King Narasimhavarman building the rock temples.',
    ],
    associatedArtifacts: ['Ghungroos', 'Stone carvings'],
    relatedVillages: ['Mamallapuram Village'],
    relatedHeritageTrails: ['Pallava Coast Trail'],
    relatedNaturalSites: ['Bay of Bengal Shore'],
    images: [
      'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [12.6208, 80.1944],
    visitorInformation:
      'Performances run on weekends under open sky stages near the Rock relief.',
    travelTips:
      'Visit during late afternoon to photograph the temples in golden hour before the dance begins.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ev-dec-6',
    title: 'Konark Dance Festival',
    category: 'Folk Performance',
    season: 'Winter',
    month: 'December',
    startDate: '2027-12-01',
    endDate: '2027-12-05',
    state: 'Odisha',
    district: 'Puri',
    village: 'Konark Village',
    community: 'Odissi dancers and artists',
    description:
      'A five-day classical dance festival held in the open-air auditorium with the backdrop of the famous Sun Temple.',
    historicalBackground:
      'Established in 1986 by Odissi Guru Gangadhar Pradhan to promote Odissi and the architectural beauty of Sun Temple.',
    culturalImportance:
      'Enhances classical arts appreciation, bringing together global exponents of Odissi, Kathak, and Bharatanatyam.',
    rituals: [
      'Opening prayer chants',
      'Sand art festival displays at Chandrabhaga beach',
    ],
    associatedCrafts: ['Odissi dance jewelry crafting', 'Sand art sculpting'],
    associatedRecipes: [
      'Chenapoda (Odia baked cheese sweet)',
      'Dalma (lentils cooked with vegetables)',
    ],
    associatedStories: [
      'King Narasimhadeva I building the massive stone chariot sun temple.',
    ],
    associatedArtifacts: ['Filigree silver jewelry', 'Odissi ankle bells'],
    relatedVillages: ['Konark Village'],
    relatedHeritageTrails: ['Puri Temples Trail'],
    relatedNaturalSites: ['Chandrabhaga Beach'],
    images: [
      'https://images.unsplash.com/photo-1560855279-d6023ad57583?auto=format&fit=crop&w=800&q=80',
    ],
    audioStory: '',
    coordinates: [19.8876, 86.0945],
    visitorInformation:
      'The Sand Art Festival runs simultaneously on Chandrabhaga beach (3 km away).',
    travelTips:
      'Walk along the beach during the day to see sand carvings before attending the evening dance show.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Load them to store on execution
store.calendarEvents = sampleEvents;

module.exports = function initializeSampleCalendarData() {
  // Empty placeholder function that is run in server.js to trigger the module evaluation
  console.log(
    `📅 Loaded ${store.calendarEvents.length} seasonal cultural events into the store.`
  );
};
