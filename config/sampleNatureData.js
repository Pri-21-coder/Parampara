// config/sampleNatureData.js
const store = require('../data/store');

const sampleNatureSites = [
  {
    id: 'nature-1',
    name: {
      en: 'Sundari Sacred Grove',
      hi: 'सुंदरी पवित्र उपवन',
      mr: 'सुंदरी पवित्र उपवन'
    },
    category: 'forest',
    location: {
      en: 'Sundarbans, West Bengal',
      hi: 'सुंदरवन, पश्चिम बंगाल',
      mr: 'सुंदरवन, पश्चिम बंगाल'
    },
    coordinates: [21.9497, 89.1156],
    description: {
      en: 'A centuries-old dense patch of Sundari trees protected by local fishermen and honey collectors. It acts as a natural shelter and a spiritual sanctuary.',
      hi: 'स्थानीय मछुआरों और शहद इकट्ठा करने वालों द्वारा संरक्षित सुंदरी के पेड़ों का सदियों पुराना घना हिस्सा। यह एक प्राकृतिक आश्रय और आध्यात्मिक स्थल के रूप में कार्य करता है।',
      mr: 'स्थानिक कोळी आणि मध गोळा करणाऱ्यांनी जतन केलेले सुंदरी वृक्षांचे शतकानुशतके जुने दाट जंगल. हे एक नैसर्गिक आश्रयस्थान आणि आध्यात्मिक स्थळ आहे.'
    },
    significance: {
      en: 'Dedicated to Goddess Bonbibi, the deity of the forest. The grove represents the community’s deep respect for nature and their traditional ecological code of taking only what is needed.',
      hi: 'वन की देवी माँ बोनबिबी को समर्पित। यह उपवन प्रकृति के प्रति समुदाय के गहरे सम्मान और पारंपरिक पारिस्थितिक कोड (केवल जरूरत के अनुसार संसाधन लेना) का प्रतीक है।',
      mr: 'वनांची देवी बोनबिबी यांना समर्पित. हे उपवन निसर्गाबद्दलचा आदर आणि गरजेपुरतेच ओरबाडण्याच्या त्यांच्या पारंपरिक पर्यावरणीय नियमाचे प्रतिनिधित्व करते.'
    },
    folklore: {
      en: 'According to local legends, Goddess Bonbibi protected the young boy Dukhe from the greed of his uncle and the wrath of Dakshin Rai, a powerful demon who ruled the forest in the form of a tiger.',
      hi: 'स्थानीय किंवदंतियों के अनुसार, देवी बोनबिबी ने युवा लड़के दुखे को उसके चाचा के लालच और बाघ के रूप में वन पर राज करने वाले शक्तिशाली दानव दक्षिण राय के क्रोध से बचाया था।',
      mr: 'स्थानिक आख्यायिकेनुसार, देवी बोनबिबीने तरुण मुलगा दुखे याला त्याच्या काकाच्या लोभापासून आणि वाघाच्या रूपात जंगलावर राज्य करणाऱ्या शक्तिशाली दक्षिण राय राक्षसाच्या क्रोधापासून वाचवले होते.'
    },
    rituals: {
      en: 'Honey collectors tie yellow threads around the oldest trees and perform a silent prayer before entering the forest. The annual Bonbibi Puja is celebrated here with dramatic plays.',
      hi: 'शहद संग्रहकर्ता जंगल में प्रवेश करने से पहले सबसे पुराने पेड़ों के चारों ओर पीले धागे बांधते हैं और मूक प्रार्थना करते हैं। वार्षिक बोनबिबी पूजा यहाँ नाटकों के साथ मनाई जाती है।',
      mr: 'मध गोळा करणारे जंगलात प्रवेश करण्यापूर्वी सर्वात जुन्या झाडांना पिवळे धागे बांधतात आणि शांत प्रार्थना करतात. वार्षिक बोनबिबी पूजा येथे पारंपारिक नाटकांद्वारे साजरी केली जाते.'
    },
    conservationStatus: {
      en: 'Sacred Grove - Community Managed (Excellent Preservation)',
      hi: 'पवित्र उपवन - समुदाय प्रबंधित (उत्कृष्ट संरक्षण)',
      mr: 'पवित्र उपवन - समुदाय व्यवस्थापित (उत्कृष्ट संरक्षण)'
    },
    seasonalChanges: {
      en: 'During the monsoons, the grove is flooded by high tides, attracting diverse estuarine crabs and migratory birds. Sweet honey flow peaks in spring.',
      hi: 'मानसून के दौरान, ज्वार के पानी से उपवन भर जाता है, जिससे विभिन्न प्रकार के केकड़े और प्रवासी पक्षी आकर्षित होते हैं। वसंत ऋतु में ताजे शहद का प्रवाह चरम पर होता है।',
      mr: 'पावसाळ्यात, भरतीच्या पाण्याने उपवन तुडुंब भरते, ज्यामुळे विविध खेकडे आणि स्थलांतरित पक्षी आकर्षित होतात. वसंत ऋतूत ताज्या मधाचा प्रवाह सर्वात जास्त असतो.'
    },
    nearbyConnections: {
      villages: [
        { name: { en: 'Sundarbans Village', hi: 'सुंदरवन गांव', mr: 'सुंदरबन गाव' }, link: 'map.html' }
      ],
      crafts: [
        { name: { en: 'Coconut Shell Crafts', hi: 'नारियल शिल्प', mr: 'नारळ हस्तकला' }, link: 'gallery.html' }
      ],
      festivals: [
        { name: { en: 'Bonbibi Puja', hi: 'बोनबिबी पूजा', mr: 'बोनबिबी पूजा' }, link: 'map.html' }
      ]
    },
    images: [
      'https://cdn.sanity.io/images/vk5tclvq/production/b8e3393aa0c18abb3bb4ce48ef2e712813a30f8f-1658x1406.png?auto=format&q=40'
    ],
    userFolklore: []
  },
  {
    id: 'nature-2',
    name: {
      en: 'Dhivara Sacred Pond',
      hi: 'धीवर पवित्र तालाब',
      mr: 'धीवर पवित्र तलाव'
    },
    category: 'pond',
    location: {
      en: 'Madhubani, Bihar',
      hi: 'मधुबनी, बिहार',
      mr: 'मधुबनी, बिहार'
    },
    coordinates: [26.3537, 86.1719],
    description: {
      en: 'An ancient freshwater pond that acts as a vital water reserve for the village. Fishing is strictly regulated by local traditional clans to maintain the ecosystem.',
      hi: 'एक प्राचीन मीठे पानी का तालाब जो गाँव के लिए एक महत्वपूर्ण जल भंडार के रूप में कार्य करता है। पारिस्थितिकी तंत्र को बनाए रखने के लिए स्थानीय पारंपरिक कुलों द्वारा मछली पकड़ने को कड़ाई से विनियमित किया जाता है।',
      mr: 'एक प्राचीन गोड्या पाण्याचा तलाव जो गावासाठी पाण्याचा मुख्य स्त्रोत आहे. जल परिसंस्था राखण्यासाठी स्थानिक पारंपरिक कुळांद्वारे मासेमारीवर कडक नियंत्रण ठेवले जाते.'
    },
    significance: {
      en: 'Linked to Surya (the Sun God) and water purification rituals. The pond is a living testament to indigenous rainwater harvesting and conservation.',
      hi: 'सूर्य देव और जल शुद्धिकरण अनुष्ठानों से जुड़ा हुआ है। यह तालाब स्वदेशी वर्षा जल संचयन और संरक्षण का एक जीवित प्रमाण है।',
      mr: 'सूर्य देव आणि जल शुद्धीकरण विधींशी जोडलेला. हा तलाव पावसाचे पाणी साठवण्याच्या आणि संवर्धनाच्या पारंपरिक पद्धतींचा जिवंत पुरावा आहे.'
    },
    folklore: {
      en: 'Local folklore describes a protective water spirit (Jal Devta) residing in the depths of the pond, which ensures that the village wells never go dry as long as the pond remains clean.',
      hi: 'स्थानीय लोककथाओं के अनुसार, तालाब की गहराइयों में एक संरक्षक जल देवता निवास करते हैं, जो यह सुनिश्चित करते हैं कि जब तक तालाब साफ रहेगा, गाँव के कुएँ कभी नहीं सूखेंगे।',
      mr: 'स्थानिक दंतकथेनुसार, तलावाच्या खोलीत एक जलदेवता राहते, जी तलाव स्वच्छ असेपर्यंत गावातील विहिरी कधीही सुकणार नाहीत याची खात्री देते.'
    },
    rituals: {
      en: 'Devotees gather along the banks during Chhath Puja to stand in the water and offer prayers to the rising and setting sun. Clay lamps are floated on betel leaves.',
      hi: 'छठ पूजा के दौरान श्रद्धालु सूर्य को अर्घ्य देने के लिए तालाब के किनारे इकट्ठा होते हैं और पानी में खड़े होकर प्रार्थना करते हैं। पान के पत्तों पर मिट्टी के दीपक तैराए जाते हैं।',
      mr: 'छठ पूजेदरम्यान भाविक सूर्यदेवाला अर्घ्य देण्यासाठी तलावाच्या काठावर जमतात आणि पाण्यात उभे राहून प्रार्थना करतात. पानांवर मातीचे दिवे लावून तरंगवले जातात.'
    },
    conservationStatus: {
      en: 'Community Protected Wetland (Undergoing Restoration)',
      hi: 'समुदाय संरक्षित आर्द्रभूमि (पुनर्स्थापना जारी)',
      mr: 'समुदाय संरक्षित पाणथळ जागा (पुनरुज्जीवन सुरू)'
    },
    seasonalChanges: {
      en: 'Blooms with pink and white lotuses from August to October, drawing local birds. In summer, the community gathers to desilt and clean the inlet channels.',
      hi: 'अगस्त से अक्टूबर तक गुलाबी और सफेद कमलों से भर जाता है, जिससे स्थानीय पक्षी आकर्षित होते हैं। गर्मियों में, समुदाय गाद निकालने और इनलेट चैनलों को साफ करने के लिए इकट्ठा होता है।',
      mr: 'ऑगस्ट ते ऑक्टोबर या काळात गुलाबी आणि पांढऱ्या कमळांनी तलाव बहरून निघतो. उन्हाळ्यात गाळ काढण्यासाठी आणि पाण्याचे प्रवाह स्वच्छ करण्यासाठी ग्रामस्थ एकत्र येतात.'
    },
    nearbyConnections: {
      villages: [
        { name: { en: 'Madhubani Village', hi: 'मधुबनी गांव', mr: 'मधुबनी गाव' }, link: 'map.html' }
      ],
      crafts: [
        { name: { en: 'Madhubani Paintings', hi: 'मधुबनी पेंटिंग', mr: 'मधुबनी चित्रे' }, link: 'gallery.html' }
      ],
      festivals: [
        { name: { en: 'Chhath Puja', hi: 'छठ पूजा', mr: 'छठ पूजा' }, link: 'map.html' },
        { name: { en: 'Teej', hi: 'तीज', mr: 'तीज' }, link: 'map.html' }
      ]
    },
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4sVlLc1XrhZXvPk3haP-bMeL0eqlGsZuRbQ&s'
    ],
    userFolklore: []
  },
  {
    id: 'nature-3',
    name: {
      en: 'Gond Devrai Forest',
      hi: 'गोंड देवराई वन',
      mr: 'गोंड देवराई जंगल'
    },
    category: 'forest',
    location: {
      en: 'Bastar, Chhattisgarh',
      hi: 'बस्तर, छत्तीसगढ़',
      mr: 'बस्तर, छत्तीसगड'
    },
    coordinates: [21.2787, 81.9661],
    description: {
      en: 'A sacred forest patch where human entry is limited and felling of trees is strictly prohibited. It serves as a crucial refuge for endangered flora and medicinal plants.',
      hi: 'एक पवित्र वन क्षेत्र जहाँ मानवीय प्रवेश सीमित है और पेड़ों को काटना सख्त मना है। यह लुप्तप्राय वनस्पतियों और औषधीय पौधों के लिए एक महत्वपूर्ण आश्रय स्थल है।',
      mr: 'एक पवित्र जंगलाचा भाग जेथे माणसांना प्रवेश मर्यादित आहे आणि झाडे तोडण्यास सक्त मनाई आहे. हे दुर्मिळ वनस्पती आणि औषधी वनस्पतींसाठी एक महत्त्वाचे केंद्र आहे.'
    },
    significance: {
      en: 'Home to the Pen (clan deities) of the Gond tribe. It is managed via traditional rules where even fallen twigs are not taken unless for ritualistic purposes.',
      hi: 'गोंड जनजाति के पेन (कुल देवताओं) का निवास स्थान। इसे पारंपरिक नियमों के माध्यम से प्रबंधित किया जाता है जहाँ सूखी टहनियाँ भी अनुष्ठानिक उद्देश्यों के बिना नहीं ली जाती हैं।',
      mr: 'गोंड जमातीच्या पेन (कुलदैवतांचे) निवासस्थान. हे पारंपरिक नियमांद्वारे व्यवस्थापित केले जाते जेथे सुकलेल्या फांद्याही विधीशिवाय घराबाहेर नेल्या जात नाहीत.'
    },
    folklore: {
      en: 'It is believed that the forest spirits reside in the oldest Saja trees. If anyone harms the trees or animals within the grove, it will bring a curse of crop failure or epidemic to the village.',
      hi: 'माना जाता है कि वन आत्माएं सबसे पुराने साजा के पेड़ों में निवास करती हैं। यदि कोई उपवन के भीतर पेड़ों या जानवरों को नुकसान पहुँचाता है, तो इससे गाँव में फसल खराब होने या महामारी का प्रकोप हो सकता है।',
      mr: 'असा विश्वास आहे कि जंगलातील आत्मे सर्वात जुन्या साजा वृक्षांमध्ये राहतात. जर कोणी जंगलातील झाडांना किंवा प्राण्यांना हानी पोहोचवली, तर गावात दुष्काळ किंवा महामारीचे संकट येते.'
    },
    rituals: {
      en: 'During the Bastar Dussehra and harvest festivals, tribal chiefs make offerings of wild flowers, grains, and clay figurines at the forest boundary to thank the deities.',
      hi: 'बस्तर दशहरा और फसल उत्सवों के दौरान, आदिवासी प्रमुख देवताओं को धन्यवाद देने के लिए वन सीमा पर जंगली फूलों, अनाजों और मिट्टी की मूर्तियों का चढ़ावा चढ़ाते हैं।',
      mr: 'बस्तर दसरा आणि पीक कापणीच्या सणांमध्ये, आदिवासी प्रमुख देवांचे आभार मानण्यासाठी जंगलाच्या सीमेवर जंगली फुले, धान्य आणि मातीच्या मूर्ती अर्पण करतात.'
    },
    conservationStatus: {
      en: 'Indigenous Sacred Grove (Strict Traditional Protection)',
      hi: 'स्वदेशी पवित्र उपवन (कड़ा पारंपरिक संरक्षण)',
      mr: 'आदिवासी पवित्र उपवन (कडक पारंपरिक संरक्षण)'
    },
    seasonalChanges: {
      en: 'In spring, Sal and Saja trees shed their leaves, creating a golden carpet. Post-monsoon, the forest floor comes alive with bioluminescent fungi and wild orchids.',
      hi: 'वसंत ऋतु में, साल और साजा के पेड़ अपने पत्ते गिराते हैं, जिससे एक सुनहरा कालीन बन जाता है। मानसून के बाद, जंगल का फर्श बायोलुमिनेसेंट कवक और जंगली ऑर्किड से जीवंत हो उठता है।',
      mr: 'वसंत ऋतूत, साल आणि साजा वृक्षांची पाने गळतात, ज्यामुळे जमिनीवर पानांचा सोनेरी गालिचा पसरतो. पावसाळ्यानंतर, जैवदीप्तिमान बुरशी आणि जंगली ऑर्किड्समुळे जंगल बहरून निघते.'
    },
    nearbyConnections: {
      villages: [
        { name: { en: 'Dokra Village', hi: 'डोकरा गांव', mr: 'डोकरा गाव' }, link: 'map.html' }
      ],
      crafts: [
        { name: { en: 'Dokra Metalwork', hi: 'डोकरा धातुकला', mr: 'डोकरा धातुकाम' }, link: 'gallery.html' },
        { name: { en: 'Bamboo Crafts', hi: 'बांस शिल्प', mr: 'बांबू हस्तकला' }, link: 'gallery.html' }
      ],
      festivals: [
        { name: { en: 'Bastar Dussehra', hi: 'बस्तर दशहरा', mr: 'बस्तर दसरा' }, link: 'map.html' }
      ]
    },
    images: [
      'https://cdn.shopify.com/s/files/1/0444/9337/3595/files/IUJ_480x480.png?v=1602150639'
    ],
    userFolklore: []
  }
];

store.naturalHeritageSites = sampleNatureSites;

module.exports = function initializeSampleNatureData() {
  // This is invoked in server.js to load natural heritage sites.
};
