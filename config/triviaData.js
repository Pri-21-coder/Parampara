/**
 * triviaData.js — Parampara Cultural Heritage Trivia Questions
 * Used by the backend for multiplayer trivia rooms.
 * For solo/client-side mode, questions are embedded in trivia.js.
 */
const triviaQuestions = [
  {
    id: 'q1',
    question: 'Which ancient Indian text is considered the oldest surviving text in any Indo-European language?',
    options: ['Mahabharata', 'Rigveda', 'Ramayana', 'Upanishads'],
    correct: 1,
    time: 15,
    explanation: 'The Rigveda, composed around 1500–1200 BCE, is the oldest known Vedic text and Indo-European literary work.'
  },
  {
    id: 'q2',
    question: 'The famous "Dancing Girl" bronze statue was discovered in which ancient Indus Valley site?',
    options: ['Harappa', 'Lothal', 'Mohenjo-Daro', 'Dholavira'],
    correct: 2,
    time: 15,
    explanation: 'The bronze Dancing Girl (~2500 BCE) was unearthed at Mohenjo-Daro in 1926.'
  },
  {
    id: 'q3',
    question: 'Which Indian classical dance form originated in the temples of Tamil Nadu?',
    options: ['Kathak', 'Bharatanatyam', 'Odissi', 'Manipuri'],
    correct: 1,
    time: 15,
    explanation: 'Bharatanatyam originated as Sadir in Tamil Nadu temples and was revived in the 20th century.'
  },
  {
    id: 'q4',
    question: 'The Ajanta Caves, known for their exquisite Buddhist mural paintings, are located in which state?',
    options: ['Madhya Pradesh', 'Maharashtra', 'Karnataka', 'Gujarat'],
    correct: 1,
    time: 15,
    explanation: 'The Ajanta Caves are located near Aurangabad, Maharashtra — a UNESCO World Heritage Site.'
  },
  {
    id: 'q5',
    question: 'Which traditional Indian art form involves creating intricate patterns on the floor using colored powders or rice?',
    options: ['Warli', 'Madhubani', 'Rangoli/Kolam', 'Pattachitra'],
    correct: 2,
    time: 15,
    explanation: 'Rangoli (North India) and Kolam (South India) are floor-art traditions using colored powders, rice, or flower petals.'
  },
  {
    id: 'q6',
    question: 'The architectural style of the Khajuraho temples is best described as:',
    options: ['Dravidian', 'Nagara', 'Vesara', 'Indo-Islamic'],
    correct: 1,
    time: 15,
    explanation: 'The Khajuraho temples follow the Nagara (North Indian) style, characterized by towering shikhara spires.'
  },
  {
    id: 'q7',
    question: 'Which UNESCO World Heritage Site in India features the massive "Chariot Temple"?',
    options: ['Hampi', 'Konark Sun Temple', 'Mahabalipuram', 'Brihadisvara Temple'],
    correct: 0,
    time: 15,
    explanation: 'The iconic stone chariot (Garuda Ratha) is at Hampi, the ruined capital of the Vijayanagara Empire.'
  },
  {
    id: 'q8',
    question: 'What is the traditional tie-and-dye craft from Rajasthan and Gujarat called?',
    options: ['Ikat', 'Kalamkari', 'Bandhani', 'Chikankari'],
    correct: 2,
    time: 15,
    explanation: 'Bandhani (from Sanskrit "bandha" = to tie) is a tie-dye textile art dating back over 5,000 years.'
  },
  {
    id: 'q9',
    question: 'Which Indian festival is specifically dedicated to celebrating the bond between brothers and sisters?',
    options: ['Holi', 'Raksha Bandhan', 'Diwali', 'Navratri'],
    correct: 1,
    time: 15,
    explanation: 'Raksha Bandhan (Sanskrit: "bond of protection") is celebrated on the full moon of Shravana.'
  },
  {
    id: 'q10',
    question: 'The famous "Sanchi Stupa" was originally commissioned by which Indian emperor?',
    options: ['Chandragupta Maurya', 'Ashoka', 'Harsha', 'Kanishka'],
    correct: 1,
    time: 15,
    explanation: "Ashoka commissioned the Sanchi Stupa in the 3rd century BCE. It is India's oldest stone structure."
  }
];

module.exports = triviaQuestions;
