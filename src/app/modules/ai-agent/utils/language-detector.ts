export function detectLanguage(text: string): 'english' | 'bangla' | 'banglish' {
  // Bangla Unicode range
  const banglaPattern = /[\u0980-\u09FF]/;

  // Check for Bangla script first
  if (banglaPattern.test(text)) {
    return 'bangla';
  }

  // CORE Banglish words (words that are ONLY used in Banglish, not standard English)
  const coreBanglishWords = {
    // Common question words
    questions: ['ki', 'keno', 'kivabe', 'kothay', 'kothai', 'kemon', 'kon', 'kobe', 'koto'],

    // Common verbs (present/past/future) - REMOVED 'apply' as it's English
    verbs: [
      'korbo',
      'korte',
      'korchi',
      'korechi',
      'hobe',
      'hoyeche',
      'hoyni',
      'jaabo',
      'jabo',
      'jete',
      'gechi',
      'jachhi',
      'dekhbo',
      'dekhechi',
      'dekhchi',
      'dekte',
      'parbo',
      'parchi',
      'perechi',
      'paini',
      'bolbo',
      'bolchi',
      'bolechi',
      'bolte',
      'chai',
      'chao',
      'chachchho',
      'achhi',
      'acho',
      'achen',
      'chilo',
      'chilo',
      'chilam',
      'hoye',
      'holeo',
    ],

    // Common nouns and pronouns - REMOVED English words
    pronounsNouns: [
      'ami',
      'tumi',
      'apni',
      'amar',
      'tomar',
      'apnar',
      'amader',
      'tomader',
      'apnader',
      'bhai',
      'apu',
      'bon',
      'dada',
      'didi',
      'mama',
      'chacha',
      'khala',
      'fupu',
    ],

    // Common adjectives and adverbs
    adjectives: [
      'bhalo',
      'valo',
      'kharap',
      'sundor',
      'shundor',
      'boro',
      'boro',
      'choto',
      'khub',
      'onek',
      'ektu',
      'emon',
    ],

    // Common prepositions and particles - REMOVED single letters that match English
    particles: ['te', 'gula', 'gulo', 'ta', 'ti', 'tuku', 'kache', 'theke', 'diye'],

    // Common phrases
    phrases: ['thik ache', 'hobe na', 'parbo na', 'lagbe', 'din', 'mash', 'bochor', 'taka'],

    // Common conjunctions - REMOVED single letters
    conjunctions: ['kintu', 'tobe', 'jodi', 'tahole', 'karon', 'ebong', 'athoba'],
  };

  // Flatten all core Banglish words
  const allCoreBanglishWords = [
    ...coreBanglishWords.questions,
    ...coreBanglishWords.verbs,
    ...coreBanglishWords.pronounsNouns,
    ...coreBanglishWords.adjectives,
    ...coreBanglishWords.particles,
    ...coreBanglishWords.phrases,
    ...coreBanglishWords.conjunctions,
  ];

  const lowerText = text.toLowerCase();
  // Remove punctuation from words for better matching
  const words = lowerText.split(/\s+/).map((w) => w.replace(/[.,!?;:'"()]/g, ''));

  // Count EXACT Banglish word matches (not substring matches)
  let banglishScore = 0;
  const matchedWords: string[] = [];

  for (const word of words) {
    // Skip very short words (1-2 chars) unless they're known Banglish words
    if (word.length <= 2 && !['ki', 'ar', 'ba', 'te', 'ta', 'ti'].includes(word)) {
      continue;
    }

    // Check for exact match or word starts with Banglish word
    if (
      allCoreBanglishWords.some((bw) => word === bw || (word.length > 3 && word.startsWith(bw)))
    ) {
      banglishScore++;
      matchedWords.push(word);
    }
  }

  // Calculate percentage of Banglish words
  const banglishPercentage = (banglishScore / words.length) * 100;

  // Additional check for common Banglish sentence patterns
  const commonBanglishPatterns = [
    /\b(ami|tumi|apni)\s+/i, // Pronouns at start
    /\s+(korbo|korte|chai|parbo|hobe)\b/i, // Verbs
    /\b(ki|keno|kemon|kon)\s+/i, // Question words
    /\s+(te|gula|gulo)\b/i, // Particles at end
    /\b(ache|nai|lagbe|thik)\b/i, // Common words
    /(ami|tumi|apni)\s+.*(korbo|korte|parbo|chai)/i, // Pronoun + verb pattern
    /ki\s+.*(ache|hobe|lagbe|parbo)/i, // Question + verb pattern
    /kon\s+(university|course|jaygay)/i, // "kon" + noun pattern
  ];

  const patternMatches = commonBanglishPatterns.filter((pattern) => pattern.test(text)).length;

  // Stricter detection logic:
  // 1. Need at least 2 core Banglish words for short texts (≤10 words)
  // 2. Need 30%+ Banglish words for longer texts
  // 3. OR have 1+ Banglish word AND 2+ pattern matches
  if (words.length <= 10) {
    // Short text: require at least 2 Banglish words
    if (banglishScore >= 2) {
      return 'banglish';
    }
  } else {
    // Longer text: require 30% or more
    if (banglishPercentage >= 30) {
      return 'banglish';
    }
  }

  // Pattern-based detection: 1 Banglish word + 2 pattern matches
  if (banglishScore >= 1 && patternMatches >= 2) {
    return 'banglish';
  }

  // Default to English
  return 'english';
}

export function getLanguageName(code: string): string {
  const names = {
    english: 'English',
    bangla: 'বাংলা',
    banglish: 'Banglish (বাংলিশ)',
  };
  return names[code] || 'English';
}

// Helper function to normalize Banglish text for better processing
export function normalizeBanglishText(text: string): string {
  const replacements: Record<string, string> = {
    // Common spelling variations
    vara: 'bhara',
    valo: 'bhalo',
    bhai: 'brother',
    apu: 'sister',
    gula: 'items',
    gulo: 'items',
    shundor: 'sundor',
    boro: 'boro',
    // Normalize question words
    keno: 'why',
    kivabe: 'how',
    kothay: 'where',
    // Add more normalizations as needed
  };

  let normalized = text.toLowerCase();
  for (const [from, to] of Object.entries(replacements)) {
    normalized = normalized.replace(new RegExp(`\\b${from}\\b`, 'gi'), to);
  }

  return normalized;
}

// Debug helper to see detection details
export function debugLanguageDetection(text: string): {
  detectedLanguage: string;
  banglishScore: number;
  matchedWords: string[];
  totalWords: number;
  percentage: number;
} {
  const detected = detectLanguage(text);
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[.,!?;:'"()]/g, ''));

  const coreBanglishWords = [
    'ami',
    'tumi',
    'apni',
    'ki',
    'keno',
    'korbo',
    'korte',
    'hobe',
    'parbo',
    'chai',
    'ache',
    'lagbe',
    'gula',
    'te',
  ];

  const matchedWords = words.filter((w) =>
    coreBanglishWords.some((bw) => w === bw || (w.length > 3 && w.startsWith(bw))),
  );

  const score = matchedWords.length;
  const percentage = (score / words.length) * 100;

  return {
    detectedLanguage: detected,
    banglishScore: score,
    matchedWords,
    totalWords: words.length,
    percentage: Math.round(percentage),
  };
}
