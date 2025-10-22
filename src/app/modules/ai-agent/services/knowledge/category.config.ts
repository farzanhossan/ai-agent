export interface Category {
  name: string;
  keywords: string[];
  patterns: RegExp[];
  weight: number;
}

export interface CategoryScore {
  category: string;
  score: number;
  matchedKeywords: string[];
  confidence: number;
}

export interface LLMCategoryResult {
  primary_category: string;
  secondary_categories: string[];
  confidence: number;
  reasoning: string;
  extracted_entities: Record<string, any>;
}

export const CATEGORIES: Record<string, Category> = {
  university: {
    name: 'university',
    keywords: [
      'university',
      'college',
      'institution',
      'campus',
      'founded',
      'established',
      'ranked',
      'accredited',
      'faculty',
      'enrollment',
      'undergraduate',
      'postgraduate',
    ],
    patterns: [
      /university of/i,
      /college of/i,
      /institute of/i,
      /\d{4}\s*(founded|established)/i,
      /world rank/i,
      /qs rank/i,
    ],
    weight: 1.5,
  },

  course: {
    name: 'course',
    keywords: [
      'course',
      'program',
      'degree',
      'bachelor',
      'master',
      'phd',
      'diploma',
      'certificate',
      'semester',
      'credits',
      'curriculum',
      'syllabus',
      'modules',
      'tuition',
      'duration',
    ],
    patterns: [
      /bachelor'?s?\s+(of|in|degree)/i,
      /master'?s?\s+(of|in|degree)/i,
      /phd\s+(in|program)/i,
      /\d+\s*(year|semester|month)\s*(program|course|degree)/i,
      /tuition\s*fee/i,
    ],
    weight: 1.3,
  },

  visa_info: {
    name: 'visa_info',
    keywords: [
      'visa',
      'immigration',
      'permit',
      'passport',
      'embassy',
      'consulate',
      'processing time',
      'visa fee',
      'student visa',
      'work permit',
      'residence permit',
    ],
    patterns: [
      /visa\s+(requirement|application|process)/i,
      /processing\s+time/i,
      /visa\s+fee/i,
      /\d+\s*(week|month|day)\s*(processing|approval)/i,
    ],
    weight: 1.4,
  },

  assessment: {
    name: 'assessment',
    keywords: [
      'ielts',
      'toefl',
      'gre',
      'gmat',
      'sat',
      'act',
      'test',
      'exam',
      'assessment',
      'score',
      'band',
      'minimum score',
    ],
    patterns: [
      /ielts\s+(\d+\.?\d*)/i,
      /toefl\s+(\d+)/i,
      /(gre|gmat|sat)\s+score/i,
      /minimum\s+score/i,
      /band\s+(\d+)/i,
    ],
    weight: 1.2,
  },

  requirements: {
    name: 'requirements',
    keywords: [
      'requirement',
      'eligibility',
      'qualification',
      'prerequisite',
      'gpa',
      'minimum',
      'must have',
      'needed',
      'required',
      'criteria',
      'conditions',
    ],
    patterns: [
      /gpa\s+(\d+\.?\d*)/i,
      /minimum\s+(gpa|grade|score)/i,
      /(required|must\s+have|need)/i,
      /eligibility\s+criteria/i,
    ],
    weight: 1.1,
  },

  scholarship: {
    name: 'scholarship',
    keywords: [
      'scholarship',
      'financial aid',
      'grant',
      'funding',
      'bursary',
      'fellowship',
      'stipend',
      'tuition waiver',
      'merit-based',
      'need-based',
    ],
    patterns: [
      /scholarship\s+(program|available|opportunity)/i,
      /financial\s+aid/i,
      /\$\d+.*scholarship/i,
    ],
    weight: 1.0,
  },

  accommodation: {
    name: 'accommodation',
    keywords: [
      'accommodation',
      'housing',
      'dormitory',
      'residence',
      'apartment',
      'hostel',
      'living',
      'rent',
      'roommate',
      'on-campus',
      'off-campus',
    ],
    patterns: [
      /(on|off)-campus\s+housing/i,
      /cost\s+of\s+living/i,
      /accommodation\s+(cost|fee|rent)/i,
    ],
    weight: 0.9,
  },

  policy: {
    name: 'policy',
    keywords: [
      'policy',
      'terms',
      'conditions',
      'refund',
      'cancellation',
      'privacy',
      'terms of service',
      'guidelines',
      'rules',
      'regulations',
    ],
    patterns: [/terms\s+(and|&)\s+conditions/i, /refund\s+policy/i, /privacy\s+policy/i],
    weight: 0.8,
  },

  general_faq: {
    name: 'general_faq',
    keywords: [
      'how',
      'what',
      'when',
      'where',
      'why',
      'who',
      'question',
      'answer',
      'faq',
      'help',
      'guide',
    ],
    patterns: [/^(how|what|when|where|why|who)\s+/i, /\?$/, /q:\s*.+a:\s*/i],
    weight: 0.7,
  },
};

export const LLM_CATEGORIZATION_PROMPT = `You are an expert data classification AI for an international education platform.

Your task is to analyze content and categorize it accurately.

AVAILABLE CATEGORIES:
1. university - Information about universities, colleges, institutions, rankings, locations
2. course - Specific courses, programs, degrees, curriculum details
3. visa_info - Visa requirements, processing times, fees, immigration details
4. assessment - Language tests (IELTS, TOEFL), entrance exams (GRE, GMAT, SAT)
5. requirements - Educational qualifications, eligibility criteria, prerequisites
6. scholarship - Financial aid, grants, scholarships, funding opportunities
7. accommodation - Housing, dormitories, living arrangements, cost of living
8. policy - Platform policies, terms, conditions, refund policies
9. general_faq - General questions and answers, help guides

INSTRUCTIONS:
- Read the content carefully
- Identify the PRIMARY category (most relevant)
- Identify SECONDARY categories (if applicable, max 2)
- Extract key entities (names, numbers, locations)
- Provide confidence score (0.0 to 1.0)
- Give brief reasoning

CONTENT TO CLASSIFY:
"""
{CONTENT}
"""

RESPOND ONLY WITH VALID JSON (no markdown, no extra text):
{
  "primary_category": "category_name",
  "secondary_categories": ["category1", "category2"],
  "confidence": 0.95,
  "reasoning": "Brief explanation of why this categorization",
  "extracted_entities": {
    "university_name": "if found",
    "country": "if found",
    "city": "if found",
    "program": "if found",
    "degree_level": "bachelor/master/phd if found",
    "cost": "if found",
    "duration": "if found",
    "requirement": "if found"
  }
}`;

export const ENTITY_EXTRACTION_PROMPT = `Extract structured information from the following text.

TEXT:
"""
{CONTENT}
"""

Extract ALL relevant information and return ONLY valid JSON:
{
  "university_name": "full name if found, otherwise null",
  "country": "country name if found, otherwise null",
  "city": "city name if found, otherwise null",
  "program_name": "specific program/course name if found, otherwise null",
  "degree_level": "bachelor/master/phd/diploma/certificate if found, otherwise null",
  "duration": "e.g., '4 years', '2 semesters' if found, otherwise null",
  "tuition_fee": "e.g., '$50,000/year' if found, otherwise null",
  "language_requirement": "e.g., 'IELTS 6.5' if found, otherwise null",
  "gpa_requirement": "e.g., '3.0 minimum' if found, otherwise null",
  "test_requirement": "e.g., 'SAT 1400+' if found, otherwise null",
  "visa_type": "if mentioned, otherwise null",
  "processing_time": "if mentioned, otherwise null",
  "scholarships_available": "yes/no/unknown",
  "application_deadline": "if mentioned, otherwise null"
}`;
