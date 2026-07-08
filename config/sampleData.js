const store = require('../data/store');
const bcrypt = require('bcryptjs');

function initializeSampleData() {
  const salt = bcrypt.genSaltSync(10);
  // store.users is an LRUCache, so we use set()
  store.users.set('admin1', { id: 'admin1', username: 'admin', passwordHash: bcrypt.hashSync('admin123', salt), role: 'Administrator' });
  store.users.set('curator1', { id: 'curator1', username: 'curator', passwordHash: bcrypt.hashSync('curator123', salt), role: 'Curator' });
  store.users.set('contrib1', { id: 'contrib1', username: 'contributor', passwordHash: bcrypt.hashSync('contrib123', salt), role: 'Contributor' });
  store.users.set('visitor1', { id: 'visitor1', username: 'visitor', passwordHash: bcrypt.hashSync('visitor123', salt), role: 'Visitor' });

  store.culturalItems.push({
    id: '1',
    title: 'Kantha Embroidery Patterns',
    type: 'visual',
    location: 'Kantha Village, Bengal',
    coordinates: [22.5726, 88.3639],
    description:
      'Traditional Kantha embroidery using running stitch on layered vintage saris.',
    tags: ['embroidery', 'textile'],
    year: 1950,
    timestamp: new Date().toISOString(),
    artisans: 12,
    records: 15,
    lastUpdated: '2026-05-15',
    engagement: 85,
    authorId: 'contrib1',
  });

  store.culturalItems.push({
    id: '2',
    title: 'Dokra Metal Craft',
    type: 'visual',
    location: 'Dokra Village, Chhattisgarh',
    coordinates: [21.2787, 81.8661],
    description:
      'Ancient non-ferrous metal casting using the lost-wax method, practiced for over 4,000 years.',
    tags: ['metalwork', 'craft'],
    year: 1980,
    timestamp: new Date().toISOString(),
    artisans: 3,
    records: 5,
    lastUpdated: '2024-01-10',
    engagement: 40,
    authorId: 'curator1',
  });

  store.culturalItems.push({
    id: '3',
    title: 'Madhubani Paintings',
    type: 'visual',
    location: 'Madhubani Village, Bihar',
    coordinates: [26.3537, 86.0719],
    description:
      'Intricate paintings displaying mythological themes and nature scenes, made with fingers, twigs, and natural dyes.',
    tags: ['painting', 'art'],
    year: 2000,
    timestamp: new Date().toISOString(),
    artisans: 25,
    records: 30,
    lastUpdated: '2026-06-01',
    engagement: 90,
  });

  store.culturalItems.push({
    id: '4',
    title: 'Sikki Grass Craft',
    type: 'visual',
    location: 'Mithila Region, Bihar',
    coordinates: [26.12, 85.9],
    description:
      'Weaving of wild golden Sikki grass into baskets, toys, and boxes, a traditional craft under-threat.',
    tags: ['weaving', 'grasscraft'],
    year: 2025,
    timestamp: new Date().toISOString(),
    artisans: 4,
    records: 2,
    lastUpdated: '2025-02-14',
    engagement: 55,
  });

  store.culturalItems.push({
    id: '5',
    title: 'Kathputli Puppetry',
    type: 'story',
    location: 'Jodhpur, Rajasthan',
    coordinates: [26.2389, 73.0243],
    description:
      'Traditional string puppetry and narrative storytelling, requiring specialized woodwork and performance skills.',
    tags: ['puppetry', 'performance'],
    year: 1950,
    timestamp: new Date().toISOString(),
    artisans: 2,
    records: 1,
    lastUpdated: '2024-11-20',
    engagement: 20,
  });

  store.culturalItems.push({
    id: '6',
    title: 'Sundarbans Folk Tales',
    type: 'story',
    location: 'Sundarbans Village',
    coordinates: [21.9497, 88.8156],
    description:
      'Traditional stories about Bonbibi and honey collectors of the Sundarbans.',
    tags: ['folklore', 'storytelling'],
    year: 1950,
    timestamp: new Date().toISOString(),
    artisans: 5,
    records: 4,
    lastUpdated: '2026-06-20',
    engagement: 75,
  });

  // ── Heritage Paths sample data ─────────────────────────────────────────────
  store.heritagePaths.push({
    id: 'path-1',
    title: 'The Journey of Kantha Stitch',
    description:
      'Follow the story of Kantha embroidery from its humble origins in Bengal to its recognition as a world-class art form.',
    theme: 'Embroidery Traditions',
    items: ['1'],
  });

  store.heritagePaths.push({
    id: 'path-2',
    title: 'Colors of Madhubani',
    description:
      'Explore the vibrant world of Madhubani paintings, from their mythological roots to their modern-day expressions.',
    theme: 'Painting Traditions',
    items: ['3', '4'],
  });

  store.heritagePaths.push({
    id: 'path-3',
    title: 'Lost-Wax Legends of Dokra',
    description:
      'Trace the 4,000-year-old lost-wax metal casting tradition of the Dhokra artisans through the forests of Chhattisgarh.',
    theme: 'Metal Craft',
    items: ['2'],
  });

  store.heritagePaths.push({
    id: 'path-4',
    title: 'Shadows & Strings: Kathputli',
    description:
      'Step into the colourful world of Rajasthani string puppetry — from royal courts to modern resort stages.',
    theme: 'Folklore & Performance',
    items: ['5', '1', '3'],
  });

  store.heritagePaths.push({
    id: 'path-5',
    title: 'Golden Grass of Bihar',
    description:
      'Discover the delicate art of Sikki grass weaving, a craft practised by Mithila women for dowry and daily life.',
    theme: 'Craft & Ecology',
    items: ['4'],
  });

  store.heritagePaths.push({
    id: 'path-6',
    title: 'Festivals of Rural India',
    description:
      'Journey through the seasonal festivals that shape rural life — from Chhath Puja to Bastar Lokotsav.',
    theme: 'Festivals',
    items: ['1', '2', '3', '4', '5', '6'],
  });

  // Artisan sample data
  store.artisans.push({
    id: 'a1',
    name: 'Ramesh Kumar',
    craft: 'Dokra Metal Art',
    experience: 32,
    village: 'Bikna',
    region: 'Chhattisgarh',
    biography: 'Master metalworker specializing in traditional Dokra casting techniques.',
    portfolio: [
      { image: 'images/artisans/ramesh1.jpg', description: 'Brass deity figure' },
      { image: 'images/artisans/ramesh2.jpg', description: 'Modern lamp design' }
    ],
    workshopAvailability: true,
    contactInfo: { email: 'ramesh@example.com', phone: '1234567890', showContact: true },
    recognitionLevel: 'Heritage Keeper',
    relatedContent: ['Dokra Metal Craft', 'Heritage Trail', 'Cultural Story', 'Historical Timeline']
  });
  store.artisans.push({
    id: 'a2',
    name: 'Meera Devi',
    craft: 'Madhubani Paintings',
    experience: 18,
    village: 'Madhubani',
    region: 'Bihar',
    biography: 'Renowned painter bringing vibrant colors to traditional motifs.',
    portfolio: [
      { image: 'images/artisans/meera1.jpg', description: 'Village festival scene' },
      { image: 'images/artisans/meera2.jpg', description: 'Floral border design' }
    ],
    workshopAvailability: false,
    contactInfo: { email: 'meera@example.com', phone: '', showContact: false },
    recognitionLevel: 'Master Artisan',
    relatedContent: ['Madhubani Paintings', 'Cultural Story']
  });
  store.artisans.push({
    id: 'a3',
    name: 'Sanjay Singh',
    craft: 'Kantha Embroidery',
    experience: 8,
    village: 'Kantha Village',
    region: 'West Bengal',
    biography: 'Emerging artisan focusing on sustainable textile reuse.',
    portfolio: [
      { image: 'images/artisans/sanjay1.jpg', description: 'Quilt with traditional patterns' }
    ],
    workshopAvailability: true,
    contactInfo: { email: 'sanjay@example.com', phone: '9876543210', showContact: true },
    recognitionLevel: 'Skilled Artisan',
    relatedContent: ['Kantha Embroidery', 'Heritage Trail']
  });
  store.artisans.push({
    id: 'a4',
    name: 'Lakshmi Patel',
    craft: 'Sikki Grass Craft',
    experience: 4,
    village: 'Mithila',
    region: 'Bihar',
    biography: 'Young craftswoman creating eco‑friendly baskets.',
    portfolio: [
      { image: 'images/artisans/lakshmi1.jpg', description: 'Golden grass basket' }
    ],
    workshopAvailability: false,
    contactInfo: { email: 'lakshmi@example.com', phone: '', showContact: false },
    recognitionLevel: 'Heritage Apprentice',
    relatedContent: ['Sikki Grass Craft']
  });
  store.artisans.push({
    id: 'a5',
    name: 'Rohit Kumar',
    craft: 'Kathputli Puppetry',
    experience: 20,
    village: 'Jodhpur',
    region: 'Rajasthan',
    biography: 'Veteran puppeteer preserving Rajasthani folklore.',
    portfolio: [
      { image: 'images/artisans/rohit1.jpg', description: 'Puppet show performance' }
    ],
    workshopAvailability: true,
    contactInfo: { email: 'rohit@example.com', phone: '5551234567', showContact: true },
    recognitionLevel: 'Master Artisan',
    relatedContent: ['Kathputli Puppetry', 'Cultural Story']
  });

  store.contributors.push({
    id: 1,
    name: 'Rahul Sharma',
    stories: 15,
    photos: 30,
    culturalItems: 5,
    checkins: 10,
    quests: 0,
    memberSince: 'January 2026',
  });

  store.contributors.push({
    id: 2,
    name: 'Priya Singh',
    stories: 10,
    photos: 20,
    culturalItems: 4,
    checkins: 8,
    quests: 0,
    memberSince: 'February 2026',
  });

  store.contributors.push({
    id: 3,
    name: 'Aman Patel',
    stories: 5,
    photos: 10,
    culturalItems: 2,
    checkins: 6,
    quests: 0,
    memberSince: 'March 2026',
  });

  // Seeding Timeline Events
  store.timelineEvents.push(
    // Madhubani Art
    {
      id: 't-mb-1950',
      item: 'Madhubani Art',
      year: 1950,
      title: 'Natural Pigments & Mud Walls',
      description: 'Mithila artists painted mud walls using pigments from turmeric, clay, and plants.',
      presentTense: 'We are painting on mud walls and handmade paper using purely natural dyes from plants and minerals.',
      pastTense: 'Mithila artists painted mud walls using pigments from turmeric, clay, and plants.',
      futureTense: 'The ancient tradition of painting mud walls with plant dyes remains local to Mithila.',
      significance: 'Maintained the zero-waste organic nature of ancestral ritual paintings.',
      type: 'craft',
      image: '🎨'
    },
    {
      id: 't-mb-1980',
      item: 'Madhubani Art',
      year: 1980,
      title: 'National Recognition',
      description: 'The Indian Government recognized Madhubani artists, bringing the art to paper.',
      presentTense: 'The Government is awarding national recognition to our local artists, helping us paint on handmade paper for wider reach.',
      pastTense: 'The Indian Government recognized Madhubani artists, bringing the art to paper.',
      futureTense: 'Artisans will soon transition to canvas and paper, gaining the attention of national leaders.',
      significance: 'Transitioned the craft from home ritual to commercial economic stability.',
      type: 'craft',
      image: '🏆'
    },
    {
      id: 't-mb-2000',
      item: 'Madhubani Art',
      year: 2000,
      title: 'International Exhibitions',
      description: 'Madhubani art was showcased globally, entering museums in Europe and Japan.',
      presentTense: 'Our paintings are now exhibited globally in major museums and cultural galleries in Europe, USA, and Japan.',
      pastTense: 'Madhubani art was showcased globally, entering museums in Europe and Japan.',
      futureTense: 'Global collectors will discover these unique patterns, leading to overseas exhibitions.',
      significance: 'Preserved the folk stories in international art archives.',
      type: 'craft',
      image: '🏛️'
    },
    {
      id: 't-mb-2025',
      item: 'Madhubani Art',
      year: 2025,
      title: 'Digital Preservation',
      description: 'Artisans launched digital vector archives and digital preservation registries.',
      presentTense: 'We are launching digital drawing archives and vector catalogs to preserve our heritage.',
      pastTense: 'Artisans launched digital vector archives and digital preservation registries.',
      futureTense: 'Digital technology will enable new forms of vector art and online archives to preserve these patterns.',
      significance: 'Bridges traditional art forms with modern digital platforms and global licensing.',
      type: 'craft',
      image: '💻'
    },

    // Kantha Embroidery
    {
      id: 't-kt-1950',
      item: 'Kantha Embroidery',
      year: 1950,
      title: 'Repurposing Old Saris',
      description: 'Women embroidered old cotton saris together to make domestic quilts.',
      presentTense: 'We are hand-stitching old saris together using simple running stitches to keep our families warm.',
      pastTense: 'Women embroidered old cotton saris together to make domestic quilts.',
      futureTense: 'The running stitch on old cotton saris will grow from a domestic chore into a recognized design aesthetic.',
      significance: 'Pioneered sustainability and recycling in rural Indian household items.',
      type: 'craft',
      image: '🧵'
    },
    {
      id: 't-kt-1980',
      item: 'Kantha Embroidery',
      year: 1980,
      title: 'Commercial Cooperatives',
      description: 'Self-help groups and cooperatives revived Kantha on commercial garments.',
      presentTense: 'We are forming self-help groups and cooperatives to sell beautiful hand-embroidered apparel to urban markets.',
      pastTense: 'Self-help groups and cooperatives revived Kantha on commercial garments.',
      futureTense: 'Cooperative groups will revive these patterns to provide employment to village women.',
      significance: 'Provided primary financial independence to hundreds of Bengal craftswomen.',
      type: 'craft',
      image: '🤝'
    },
    {
      id: 't-kt-2000',
      item: 'Kantha Embroidery',
      year: 2000,
      title: 'High-Fashion Runways',
      description: 'Designers collaborated with artisans, presenting Kantha work in luxury couture.',
      presentTense: 'Fashion designers are collaborating with us to bring our traditional running stitches to upscale fashion runways.',
      pastTense: 'Designers collaborated with artisans, presenting Kantha work in luxury couture.',
      futureTense: 'Kantha embroidery will soon make its debut on high-fashion runways and designer labels.',
      significance: 'Established folk embroidery as a high-value global luxury asset.',
      type: 'craft',
      image: '👗'
    },
    {
      id: 't-kt-2025',
      item: 'Kantha Embroidery',
      year: 2025,
      title: 'Direct E-Commerce',
      description: 'Artisans listed quilts on direct web portals, exporting internationally.',
      presentTense: 'We are listing our hand-stitched quilts on global e-commerce portals, selling directly to overseas buyers.',
      pastTense: 'Artisans listed quilts on direct web portals, exporting internationally.',
      futureTense: 'Online global portals will connect rural Bengal stitchers directly with international buyers.',
      significance: 'Cut middleman fees, returning 90% of profits to village embroiders.',
      type: 'craft',
      image: '🌐'
    },

    // Dokra Metal Craft
    {
      id: 't-dk-1950',
      item: 'Dokra Metal Craft',
      year: 1950,
      title: 'Lost-Wax Nomad Casting',
      description: 'Nomadic metalworkers cast brass icons using clay cores and beeswax molds.',
      presentTense: 'We are traveling from village to village, melting scrap metal and casting tiny brass icons using beeswax molds.',
      pastTense: 'Nomadic metalworkers cast brass icons using clay cores and beeswax molds.',
      futureTense: 'The nomadic lost-wax casting technique will settle into specialized artisan hubs.',
      significance: 'Preserved the 4,000-year-old Harappan lost-wax casting methodology.',
      type: 'craft',
      image: '🕯️'
    },
    {
      id: 't-dk-1980',
      item: 'Dokra Metal Craft',
      year: 1980,
      title: 'Settled Village Hubs',
      description: 'Nomadic groups settled into permanent craft villages in Chhattisgarh.',
      presentTense: 'We are establishing permanent wood-fired furnaces in our villages to increase our casting capacity.',
      pastTense: 'Nomadic groups settled into permanent craft villages in Chhattisgarh.',
      futureTense: 'Artisans will establish permanent kilns and workshops in fixed hubs.',
      significance: 'Enabled community sharing of furnaces and metal raw materials.',
      type: 'craft',
      image: '🔥'
    },
    {
      id: 't-dk-2000',
      item: 'Dokra Metal Craft',
      year: 2000,
      title: 'Home Decor Pivot',
      description: 'Craftsmen expanded from tribal deities to contemporary utility designs.',
      presentTense: 'We are adapting our traditional figurines to create beautiful utility items like handles, lamps, and modern decor.',
      pastTense: 'Craftsmen expanded from tribal deities to contemporary utility designs.',
      futureTense: 'The ancient figurines will adapt into high-end modern home decor utilities.',
      significance: 'Rescued the craft from declining religious figurine markets.',
      type: 'craft',
      image: '🏺'
    },
    {
      id: 't-dk-2025',
      item: 'Dokra Metal Craft',
      year: 2025,
      title: 'Clean Gas Smelting',
      description: 'Workshops adopted solar induction and gas furnaces to replace charcoal.',
      presentTense: 'We are smelting brass in eco-friendly gas furnaces, reducing smoke and scrap wastage.',
      pastTense: 'Workshops adopted solar induction and gas furnaces to replace charcoal.',
      futureTense: 'Eco-friendly gas kilns will replace charcoal furnaces to protect our health and environment.',
      significance: 'Drastically reduced toxic smoke emissions in artisan households.',
      type: 'craft',
      image: '🔋'
    },

    // Kathputli Puppetry
    {
      id: 't-kp-1950',
      item: 'Kathputli Puppetry',
      year: 1950,
      title: 'Royal Court Patronage',
      description: 'Bhatt puppeteers performed epics in royal courtyards of Rajasthan.',
      presentTense: 'We are carving wooden puppets and performing epics of Rajasthani kings in royal court squares.',
      pastTense: 'Bhatt puppeteers performed epics in royal courtyards of Rajasthan.',
      futureTense: 'Court puppet plays will pivot toward public street shows and school education.',
      significance: 'Passed down legendary histories of heroism through dynamic oral theater.',
      type: 'tradition',
      image: '🎭'
    },
    {
      id: 't-kp-1980',
      item: 'Kathputli Puppetry',
      year: 1980,
      title: 'Social Awareness Theatre',
      description: 'Puppeteers performed street plays about literacy and public health.',
      presentTense: 'We are touring villages to perform plays about literacy and water conservation using our puppets.',
      pastTense: 'Puppeteers performed street plays about literacy and public health.',
      futureTense: 'Puppet plays will be widely used to convey social reform messages across rural communities.',
      significance: 'Transformed traditional folklore into an educational medium for social reform.',
      type: 'tradition',
      image: '📢'
    },
    {
      id: 't-kp-2000',
      item: 'Kathputli Puppetry',
      year: 2000,
      title: 'Luxury Hotel Showcases',
      description: 'Puppet troupes secured bookings at luxury resorts for global tourists.',
      presentTense: 'We are performing night shows at grand palaces and five-star resorts for international tourists.',
      pastTense: 'Puppet troupes secured bookings at luxury resorts for global tourists.',
      futureTense: 'Puppeteers will find a new stable income by performing at tourist resorts.',
      significance: 'Preserved rural performance arts via tourism-based income channels.',
      type: 'festival',
      image: '🏨'
    },
    {
      id: 't-kp-2025',
      item: 'Kathputli Puppetry',
      year: 2025,
      title: 'Interactive YouTube Shows',
      description: 'Artists created animated puppet channels and virtual theater apps.',
      presentTense: 'We are launching YouTube series and interactive online shows so children globally can play with digital puppets.',
      pastTense: 'Artists created animated puppet channels and virtual theater apps.',
      futureTense: 'Animated puppetry and YouTube channels will bring Rajasthani stories to mobile screens worldwide.',
      significance: 'Maintains relevance of ancient puppet stories among digital-native generations.',
      type: 'tradition',
      image: '📱'
    },

    // Sikki Grass Craft
    {
      id: 't-sg-1950',
      item: 'Sikki Grass Craft',
      year: 1950,
      title: 'Dowry Weaving',
      description: 'Mithila women wove colored wild grass into storage containers for weddings.',
      presentTense: 'We are coloring wild grass and weaving containers to store grains and gifts for weddings.',
      pastTense: 'Mithila women wove colored wild grass into storage containers for weddings.',
      futureTense: 'Sikki grass weaving will move from a bridal gift tradition into an eco-friendly consumer product.',
      significance: 'Symbolized maternal blessings and domestic self-reliance.',
      type: 'craft',
      image: '🌾'
    },
    {
      id: 't-sg-1980',
      item: 'Sikki Grass Craft',
      year: 1980,
      title: 'District Fair Entry',
      description: 'Weavers dyed grass using synthetic colors, crafting toys for local fairs.',
      presentTense: 'We are dyeing Sikki grass with bright pinks and greens to weave toys for district exhibitions.',
      pastTense: 'Weavers dyed grass using synthetic colors, crafting toys for local fairs.',
      futureTense: 'Artisans will introduce vibrant chemical colors to weave toys and animal shapes.',
      significance: 'Expanded grass weaving from home storage to commercial toy making.',
      type: 'craft',
      image: '🎡'
    },
    {
      id: 't-sg-2000',
      item: 'Sikki Grass Craft',
      year: 2000,
      title: 'Organic Brand Marketing',
      description: 'Sikki containers were marketed as organic biodegradable home utilities.',
      presentTense: 'We are selling our golden grass baskets in organic craft bazaars as biodegradable home accessories.',
      pastTense: 'Sikki containers were marketed as organic biodegradable home utilities.',
      futureTense: 'Urban buyers will embrace Sikki craft as a sustainable, biodegradable packaging alternative.',
      significance: 'Tapped into the urban middle-class transition to sustainable products.',
      type: 'craft',
      image: '🛍️'
    },
    {
      id: 't-sg-2025',
      item: 'Sikki Grass Craft',
      year: 2025,
      title: 'Mobile App Cooperatives',
      description: 'Weaver collectives sold items directly to international eco-boutiques via app.',
      presentTense: 'We are using our smartphone app to sell organic Sikki baskets directly to sustainable boutiques abroad.',
      pastTense: 'Weaver collectives sold items directly to international eco-boutiques via app.',
      futureTense: 'Artisans will coordinate on smartphone apps to take global export orders directly.',
      significance: 'Ensures direct trade and fair wages to marginalized female artisans in Bihar.',
      type: 'craft',
      image: '📲'
    }
  );

  store.storySourceData.push(
    {
      id: 'story-madhubani',
      name: 'Madhubani Art',
      village: 'Madhubani Village, Bihar',
      history: [
        'Originating in the Mithila region of Bihar, Madhubani Art was traditionally painted by women on mud walls to mark births and weddings.',
        'During a severe drought in the late 1960s, the Indian government encouraged the transition of these paintings to paper to create a source of livelihood.',
        'Over the decades, it has evolved into a globally celebrated folk art form represented in prominent museums worldwide.'
      ],
      traditions: [
        'Paintings are crafted using natural dyes extracted from turmeric, soot, flowers, and leaves mixed with tree gum.',
        'Artists use twigs, matches, fingers, and nib-pens instead of modern brushes to draw fine lines.',
        'A key feature is the double-line border filled with cross-hatching, leaving no empty space on the canvas.'
      ],
      festivals: [
        'Chhath Puja, when mud walls are freshly painted with sacred motifs.',
        'Mithila Lok Utsav, showcasing community heritage paintings.'
      ],
      landmarks: [
        'Madhubani Village, the ancestral hub where families practice the art.',
        'Mithila Art Institute, dedicated to training young rural women in traditional styles.'
      ],
      culturalSignificance: [
        'Paintings depict themes of nature, birds, fish, and deities like the Sun and Moon to symbolise fertility and prosperity.',
        'The transition to paper has empowered rural women by providing financial independence and a voice in their communities.'
      ],
      notableFacts: [
        'Madhubani artists painted trees along highways in Bihar with religious motifs to successfully prevent illegal logging.',
        'The paint is organic and zero-waste, traditionally utilizing cow dung paste to treat the paper before painting.'
      ],
      chapters: [
        {
          title: 'The Origins in Mithila',
          content: 'Originating in the Mithila region of Bihar, Madhubani Art was traditionally painted by women on mud walls to mark births, weddings, and festivals. The vivid colors brought life to the village homes.',
          coordinates: [26.3537, 86.0719],
          zoom: 12,
          mediaUrl: 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=800&q=80'
        },
        {
          title: 'The Great Drought',
          content: 'During a severe drought in the late 1960s, the region suffered heavily. The Indian government encouraged the transition of these traditional wall paintings to paper to create a new source of livelihood for the starving families.',
          coordinates: [25.5941, 85.1376],
          zoom: 8,
          mediaUrl: 'https://images.unsplash.com/photo-1571217666994-4d1cc5ce4396?w=800&q=80'
        },
        {
          title: 'Natural Traditions',
          content: 'Paintings are crafted using natural dyes extracted from turmeric, soot, flowers, and leaves mixed with tree gum. Artists use twigs, matches, fingers, and nib-pens instead of modern brushes to draw fine lines.',
          coordinates: [26.3537, 86.0719],
          zoom: 14,
          mediaUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80'
        },
        {
          title: 'Global Celebration',
          content: 'Over the decades, this local tradition has evolved into a globally celebrated folk art form. Today, intricate Madhubani pieces are proudly represented in prominent museums worldwide.',
          coordinates: [48.8566, 2.3522],
          zoom: 4,
          mediaUrl: 'https://images.unsplash.com/photo-1563291074-2bf8677ac0e5?w=800&q=80'
        }
      ]
    },
    {
      id: 'story-kantha',
      name: 'Kantha Embroidery',
      village: 'Kantha Village, Bengal',
      history: [
        'Kantha embroidery started as a domestic recycling technique where Bengal women hand-stitched layers of old cotton saris together to make quilts.',
        'In the late 20th century, self-help groups and non-profits structured the craft to supply commercial markets.',
        'Today, Kantha is featured on high-fashion runways and exported globally as a premium sustainable textile.'
      ],
      traditions: [
        'The primary technique is the running stitch, which creates a rippled, textured effect across the fabric.',
        'Stitches are drawn in circular patterns, starting from the center of the textile and radiating outwards.',
        'Patterns are traditionally hand-drawn with soap or charcoal before stitching begins.'
      ],
      festivals: [
        'Bengal Craft Bazaars, celebrating traditional textile arts.',
        'Naba Barsha (Bengali New Year), where new Kantha items are gifted.'
      ],
      landmarks: [
        'Shantiniketan, the cultural hub founded by Rabindranath Tagore that popularized Kantha revival.',
        'Rural Bengal Artisan Guilds, supporting women weavers.'
      ],
      culturalSignificance: [
        'Stitched patterns convey personal stories, folk tales, and wishes for the health and safety of family members.',
        'It is an expression of recycling and zero-waste, embodying the spirit of rural resourcefulness.'
      ],
      notableFacts: [
        'Traditionally, the thread used for embroidery was pulled out of the borders of the very same old saris being recycled.',
        'A large Kantha quilt can take up to six months of collective labor by multiple village women.'
      ],
      chapters: [
        {
          title: 'Domestic Recycling',
          content: 'Kantha embroidery started as a domestic recycling technique where Bengal women hand-stitched layers of old cotton saris together to make quilts. It was an expression of rural resourcefulness.',
          coordinates: [22.5726, 88.3639],
          zoom: 11,
          mediaUrl: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=800&q=80'
        },
        {
          title: 'The Running Stitch',
          content: 'The primary technique is the running stitch, which creates a rippled, textured effect across the fabric. Stitches are drawn in circular patterns, starting from the center of the textile and radiating outwards.',
          coordinates: [23.8103, 90.4125],
          zoom: 10,
          mediaUrl: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800&q=80'
        },
        {
          title: 'Commercial Revival',
          content: 'In the late 20th century, self-help groups and non-profits structured the craft to supply commercial markets. Today, Kantha is featured on high-fashion runways and exported globally as a premium sustainable textile.',
          coordinates: [22.5726, 88.3639],
          zoom: 6,
          mediaUrl: 'https://images.unsplash.com/photo-1558769132-cb1fac9facf4?w=800&q=80'
        }
      ]
    },
    {
      id: 'story-dokra',
      name: 'Dokra Metal Craft',
      village: 'Dokra Village, Chhattisgarh',
      history: [
        'Dokra is a 4,000-year-old non-ferrous metal casting art that traces back directly to the lost-wax casting of the Harappan civilization.',
        'Originally practiced by nomadic Dhokra Damar metalsmiths traveling across Central India, it eventually settled in artisan hubs.',
        'Modern initiatives have shifted the craft from tribal icons to contemporary home decor, ensuring its economic survival.'
      ],
      traditions: [
        'The process utilizes a clay core wrapped in fine beeswax threads, which is then covered in a outer clay shell.',
        'Molten scrap brass or bronze is poured into the heated mold, melting and replacing the wax (lost-wax technique).',
        'Every mold is broken to extract the final metal piece, making each Dokra sculpture completely unique.'
      ],
      festivals: [
        'Bastar Lokotsav, where tribal artisans gather to display and sell their cast metal icons.',
        'Dussehra, during which traditional brass deities are cleaned and offered prayers.'
      ],
      landmarks: [
        'Kondagaon, known as the craft capital of Bastar, housing master casting workshops.',
        'Ekta Artisan Center, providing community kilns and furnaces.'
      ],
      culturalSignificance: [
        'Dokra art traditionally represents tribal deities, animals (elephants, horses), and items used in forest ceremonies.',
        'It reflects the deep spiritual connection of tribal communities with nature and local mythology.'
      ],
      notableFacts: [
        'Since the clay mold must be broken to retrieve the bronze figure, no two Dokra metal pieces are ever identical.',
        'Workshops are adopting eco-friendly solar furnaces to replace traditional coal, reducing air pollution for local families.'
      ]
    },
    {
      id: 'story-kathputli',
      name: 'Kathputli Puppetry',
      village: 'Jodhpur, Rajasthan',
      history: [
        'Kathputli puppetry originated over a thousand years ago with the Bhatt community performing epics in the royal courts of Rajasthan.',
        'Following the decline of royal patronage, puppeteers adapted by bringing their shows to public streets and villages.',
        'In the digital age, puppeteers are using online platforms and resort showcases to preserve their oral storytelling traditions.'
      ],
      traditions: [
        'Puppets are carved from a single block of mango wood (Kath meaning wood, and Putli meaning doll).',
        'Puppeteers control the dolls using a loop of string tied to their fingers, whistling with a bamboo device called a Pua.',
        'Performances are accompanied by the dynamic beats of the Dholak and oral songs that narrate folk tales.'
      ],
      festivals: [
        'Rajasthan Kabir Yatra, featuring traditional performance arts.',
        'Marwar Festival, where grand puppet shows are staged for global audiences.'
      ],
      landmarks: [
        'Kathputli Colony in Jaipur, a historic settlement of traditional artists and puppet makers.',
        'Jodhpur Cultural Center, organizing tourist showcases and educational workshops.'
      ],
      culturalSignificance: [
        'Plays historically retold stories of Rajasthani legends like Amar Singh Rathore, celebrating bravery and loyalty.',
        'Modern puppet shows have become powerful tools for social change, conveying messages of literacy, sanitation, and hygiene.'
      ],
      notableFacts: [
        'The puppeteer makes a high-pitched whistling sound during the play to represent the puppet speaking, which a narrator then translates.',
        'The colorful clothing on puppets is made from leftover scraps of traditional Rajasthani textiles.'
      ]
    },
    {
      id: 'story-sikki',
      name: 'Sikki Grass Craft',
      village: 'Mithila Region, Bihar',
      history: [
        'Sikki Grass Craft is a ancient craft from Bihar where wild golden grass is woven into utility and decorative objects.',
        'Traditionally, mothers taught their daughters to weave Sikki boxes so they could store dowry items for marriage.',
        'Today, Sikki grass is marketed as a eco-friendly, biodegradable alternative to plastic home accessories.'
      ],
      traditions: [
        'Wild Sikki grass is collected, dried, and dyed in vibrant colors like pink, green, and red.',
        'Weavers split the grass and weave it around a inner core of sturdy Munj grass to build structural forms.',
        'The main tool used is a simple metallic needle with a wooden handle, called a Takua.'
      ],
      festivals: [
        'Madhushravani Festival, during which newly wed brides use Sikki baskets to collect flowers.',
        'Saurath Sabha, an annual gathering displaying local Mithila crafts.'
      ],
      landmarks: [
        'Madhubani and Darbhanga Districts, the main geographical areas for Sikki grass weaving.',
        'Bihar State Cooperative Union, helping rural women export baskets directly.'
      ],
      culturalSignificance: [
        'The craft symbolizes domestic self-reliance and represents the maternal blessings of passing down traditional skills.',
        'It is an expression of organic living, turning local wild river grass into durable household products.'
      ],
      notableFacts: [
        'Sikki grass is naturally translucent and has a golden sheen, which is why it is often called the Golden Grass of Bihar.',
        'Items are highly durable and naturally damp-resistant, meaning they can store grains and spices for years.'
      ]
    }
  );

  // Populate QuadTrees
  store.culturalItems.forEach(item => {
    store.culturalItemsQuadTree.insert(item);
  });
  
  // Note: if store.villagePosts had sample data with coordinates, we would insert them here:
  // store.villagePosts.forEach(post => store.villagePostsQuadTree.insert(post));
}

module.exports = initializeSampleData;
