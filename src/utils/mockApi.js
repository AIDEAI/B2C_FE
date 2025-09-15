// Mock API data for past papers flow
export const mockLevels = [
  {
    program: "igcse",
    program_name: "CAMBRIDGE IGCSE",
    program_id: 19
  },
  {
    program: "alevel",
    program_name: "CAMBRIDGE A-LEVEL",
    program_id: 20
  },
  {
    program: "olevel",
    program_name: "CAMBRIDGE O-LEVEL",
    program_id: 21
  }
];

export const mockSubjects = {
  'igcse': [
    { id: 'physics', name: 'Physics', icon: '⚡', description: 'Study of matter and energy' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', description: 'Study of substances and reactions' },
    { id: 'mathematics', name: 'Mathematics', icon: '📐', description: 'Study of numbers and patterns' },
    { id: 'biology', name: 'Biology', icon: '🧬', description: 'Study of living organisms' },
    { id: 'english', name: 'English', icon: '📚', description: 'Language and literature studies' },
    { id: 'urdu', name: 'Urdu', icon: '📖', description: 'National language studies' }
  ],
  'alevel': [
    { id: 'physics', name: 'Physics', icon: '⚡', description: 'Study of matter and energy' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', description: 'Study of substances and reactions' },
    { id: 'mathematics', name: 'Mathematics', icon: '📐', description: 'Study of numbers and patterns' },
    { id: 'biology', name: 'Biology', icon: '🧬', description: 'Study of living organisms' },
    { id: 'english', name: 'English', icon: '📚', description: 'Language and literature studies' },
    { id: 'urdu', name: 'Urdu', icon: '📖', description: 'National language studies' }
  ],
  'olevel': [
    { id: 'physics', name: 'Physics', icon: '⚡', description: 'Study of matter and energy' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', description: 'Study of substances and reactions' },
    { id: 'mathematics', name: 'Mathematics', icon: '📐', description: 'Study of numbers and patterns' },
    { id: 'biology', name: 'Biology', icon: '🧬', description: 'Study of living organisms' },
    { id: 'english', name: 'English', icon: '📚', description: 'Language and literature studies' },
    { id: 'urdu', name: 'Urdu', icon: '📖', description: 'National language studies' },
    { id: 'pakistan_studies', name: 'Pakistan Studies', icon: '🏛️', description: 'History and culture of Pakistan' },
    { id: 'islamic_studies', name: 'Islamic Studies', icon: '☪️', description: 'Islamic teachings and history' }
  ]
};

export const mockTopics = {
  'physics': {
    topics: ['Mechanics', 'Thermodynamics', 'Waves', 'Electricity', 'Magnetism', 'Modern Physics'],
    subTopics: ['Kinematics', 'Dynamics', 'Work & Energy', 'Heat Transfer', 'Sound Waves', 'Light Waves', 'Current Electricity', 'Electromagnetic Induction', 'Quantum Physics', 'Nuclear Physics'],
    years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  },
  'chemistry': {
    topics: ['Atomic Structure', 'Chemical Bonding', 'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry'],
    subTopics: ['Periodic Table', 'Ionic Bonds', 'Covalent Bonds', 'Alkanes', 'Alkenes', 'Alkynes', 'Acids & Bases', 'Redox Reactions', 'Chemical Kinetics', 'Thermodynamics'],
    years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  },
  'mathematics': {
    topics: ['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics', 'Probability'],
    subTopics: ['Linear Equations', 'Quadratic Equations', 'Circles', 'Triangles', 'Sine & Cosine', 'Derivatives', 'Integrals', 'Data Analysis', 'Permutations', 'Combinations'],
    years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  },
  'biology': {
    topics: ['Cell Biology', 'Genetics', 'Ecology', 'Evolution', 'Human Biology', 'Plant Biology'],
    subTopics: ['Cell Structure', 'DNA & RNA', 'Ecosystems', 'Natural Selection', 'Digestive System', 'Respiratory System', 'Photosynthesis', 'Plant Growth', 'Classification', 'Biotechnology'],
    years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  },
  'english': {
    topics: ['Grammar', 'Literature', 'Comprehension', 'Essay Writing', 'Poetry', 'Prose'],
    subTopics: ['Tenses', 'Parts of Speech', 'Shakespeare', 'Modern Literature', 'Reading Skills', 'Writing Skills', 'Poetic Devices', 'Narrative Techniques', 'Critical Analysis', 'Creative Writing'],
    years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  },
  'urdu': {
    topics: ['قواعد', 'ادب', 'شاعری', 'نثر', 'تاریخ', 'ثقافت'],
    subTopics: ['اسم', 'فعل', 'کلاسیکی ادب', 'جدید ادب', 'غزل', 'نظم', 'کہانی', 'مضمون', 'تاریخ پاکستان', 'ثقافتی ورثہ'],
    years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  }
};

export const mockYearlyQuestions = {
  'physics': [
    {
      id: 'phy_y_2023_1',
      text: 'A ball is thrown vertically upwards with an initial velocity of 20 m/s. Calculate the maximum height reached by the ball. (Take g = 10 m/s²)',
      topic: 'Mechanics',
      subTopic: 'Kinematics',
      year: 2023,
      paper: 'Paper 1',
      difficulty: 'Medium',
      marks: 5
    },
    {
      id: 'phy_y_2023_2',
      text: 'Explain the concept of electromagnetic induction and state Faraday\'s law.',
      topic: 'Electricity',
      subTopic: 'Electromagnetic Induction',
      year: 2023,
      paper: 'Paper 1',
      difficulty: 'Hard',
      marks: 8
    },
    {
      id: 'phy_y_2022_1',
      text: 'Define the term "work" in physics and derive the formula for work done by a constant force.',
      topic: 'Mechanics',
      subTopic: 'Work & Energy',
      year: 2022,
      paper: 'Paper 1',
      difficulty: 'Medium',
      marks: 6
    },
    {
      id: 'phy_y_2022_2',
      text: 'Describe the photoelectric effect and explain how it supports the particle nature of light.',
      topic: 'Modern Physics',
      subTopic: 'Quantum Physics',
      year: 2022,
      paper: 'Paper 2',
      difficulty: 'Hard',
      marks: 10
    }
  ],
  'chemistry': [
    {
      id: 'chem_y_2023_1',
      text: 'Write the electronic configuration of sodium (Na) and explain why it forms ionic bonds.',
      topic: 'Atomic Structure',
      subTopic: 'Periodic Table',
      year: 2023,
      paper: 'Paper 1',
      difficulty: 'Easy',
      marks: 4
    },
    {
      id: 'chem_y_2023_2',
      text: 'Balance the following chemical equation: C₄H₁₀ + O₂ → CO₂ + H₂O',
      topic: 'Chemical Bonding',
      subTopic: 'Redox Reactions',
      year: 2023,
      paper: 'Paper 1',
      difficulty: 'Medium',
      marks: 5
    }
  ],
  'mathematics': [
    {
      id: 'math_y_2023_1',
      text: 'Solve the quadratic equation: x² - 5x + 6 = 0',
      topic: 'Algebra',
      subTopic: 'Quadratic Equations',
      year: 2023,
      paper: 'Paper 1',
      difficulty: 'Easy',
      marks: 4
    },
    {
      id: 'math_y_2023_2',
      text: 'Find the derivative of f(x) = 3x³ - 2x² + 5x - 1',
      topic: 'Calculus',
      subTopic: 'Derivatives',
      year: 2023,
      paper: 'Paper 2',
      difficulty: 'Medium',
      marks: 5
    }
  ]
};

export const mockTopicalQuestions = {
  'physics': [
    {
      id: 'phy_t_mech_1',
      text: 'A car accelerates from rest to 20 m/s in 5 seconds. Calculate the acceleration and distance covered.',
      topic: 'Mechanics',
      subTopic: 'Kinematics',
      year: 2023,
      difficulty: 'Medium',
      marks: 6
    },
    {
      id: 'phy_t_mech_2',
      text: 'Explain Newton\'s first law of motion with examples from daily life.',
      topic: 'Mechanics',
      subTopic: 'Dynamics',
      year: 2022,
      difficulty: 'Easy',
      marks: 4
    },
    {
      id: 'phy_t_elec_1',
      text: 'Calculate the resistance of a wire if a current of 2A flows through it when connected to a 12V battery.',
      topic: 'Electricity',
      subTopic: 'Current Electricity',
      year: 2023,
      difficulty: 'Easy',
      marks: 3
    },
    {
      id: 'phy_t_wave_1',
      text: 'A wave has a frequency of 50 Hz and wavelength of 4m. Calculate its speed.',
      topic: 'Waves',
      subTopic: 'Sound Waves',
      year: 2022,
      difficulty: 'Medium',
      marks: 4
    }
  ],
  'chemistry': [
    {
      id: 'chem_t_atomic_1',
      text: 'Draw the Lewis structure of methane (CH₄) and explain its molecular geometry.',
      topic: 'Atomic Structure',
      subTopic: 'Covalent Bonds',
      year: 2023,
      difficulty: 'Medium',
      marks: 5
    },
    {
      id: 'chem_t_organic_1',
      text: 'Write the structural formula and IUPAC name for butane.',
      topic: 'Organic Chemistry',
      subTopic: 'Alkanes',
      year: 2022,
      difficulty: 'Easy',
      marks: 3
    }
  ],
  'mathematics': [
    {
      id: 'math_t_algebra_1',
      text: 'Solve the system of equations: 2x + 3y = 7, x - y = 1',
      topic: 'Algebra',
      subTopic: 'Linear Equations',
      year: 2023,
      difficulty: 'Medium',
      marks: 5
    },
    {
      id: 'math_t_geometry_1',
      text: 'Find the area of a circle with radius 7 cm.',
      topic: 'Geometry',
      subTopic: 'Circles',
      year: 2022,
      difficulty: 'Easy',
      marks: 3
    }
  ]
};

// Mock API functions that simulate real API calls
export const mockApiCalls = {
  // Get all levels/programs
  getLevels: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockLevels);
      }, 800);
    });
  },

  // Get subjects by level
  getSubjectsByLevel: (level) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockSubjects[level] || []);
      }, 1000);
    });
  },

  // Get topics by subject
  getTopicsBySubject: (level, subjectId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTopics[subjectId] || { topics: [], subTopics: [], years: [] });
      }, 800);
    });
  },

  // Get yearly questions
  getYearlyQuestions: (level, subjectId, yearRange) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const questions = mockYearlyQuestions[subjectId] || [];
        const filtered = questions.filter(q => 
          q.year >= yearRange.start && q.year <= yearRange.end
        );
        resolve(filtered);
      }, 1200);
    });
  },

  // Get topical questions
  getTopicalQuestions: (level, subjectId, topics, subTopics, yearRange) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const questions = mockTopicalQuestions[subjectId] || [];
        let filtered = questions;
        
        if (topics && topics.length > 0) {
          filtered = filtered.filter(q => topics.includes(q.topic));
        }
        
        if (subTopics && subTopics.length > 0) {
          filtered = filtered.filter(q => subTopics.includes(q.subTopic));
        }
        
        if (yearRange) {
          filtered = filtered.filter(q => 
            q.year >= yearRange.start && q.year <= yearRange.end
          );
        }
        
        resolve(filtered);
      }, 1000);
    });
  }
};
