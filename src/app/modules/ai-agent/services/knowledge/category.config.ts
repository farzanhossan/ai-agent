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

  visa_business: {
    name: 'visa_business',
    keywords: ['business visa', 'business', 'commercial', 'trade visa', 'entrepreneur'],
    patterns: [/business\s+visa/i, /commercial\s+visa/i, /Categories.*Business/i],
    weight: 1.5, // Higher weight for specificity
  },

  visa_tourist: {
    name: 'visa_tourist',
    keywords: ['tourist visa', 'tourism', 'visitor', 'vacation', 'travel visa'],
    patterns: [/tourist\s+visa/i, /visitor\s+visa/i, /Categories.*Tourist/i],
    weight: 1.5,
  },

  visa_work: {
    name: 'visa_work',
    keywords: ['work visa', 'work permit', 'employment visa', 'job visa'],
    patterns: [/work\s+(visa|permit)/i, /employment\s+visa/i, /Categories.*Work/i],
    weight: 1.5,
  },

  visa_student: {
    name: 'visa_student',
    keywords: ['student visa', 'study visa', 'education visa', 'academic visa'],
    patterns: [/student\s+visa/i, /study\s+visa/i, /Categories.*Student/i],
    weight: 1.5,
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
    weight: 1.0,
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

// export const LLM_CATEGORIZATION_PROMPT = `You are an expert data classification AI for an international education platform.

// Your task is to analyze content and categorize it accurately.

// AVAILABLE CATEGORIES:
// 1. university - Information about universities, colleges, institutions, rankings, locations
// 2. course - Specific courses, programs, degrees, curriculum details
// 3. visa_info - Visa requirements, processing times, fees, immigration details
// 4. assessment - Language tests (IELTS, TOEFL), entrance exams (GRE, GMAT, SAT)
// 5. requirements - Educational qualifications, eligibility criteria, prerequisites
// 6. scholarship - Financial aid, grants, scholarships, funding opportunities
// 7. accommodation - Housing, dormitories, living arrangements, cost of living
// 8. policy - Platform policies, terms, conditions, refund policies
// 9. general_faq - General questions and answers, help guides

// INSTRUCTIONS:
// - Read the content carefully
// - Identify the PRIMARY category (most relevant)
// - Identify SECONDARY categories (if applicable, max 2)
// - Extract key entities (names, numbers, locations)
// - Provide confidence score (0.0 to 1.0)
// - Give brief reasoning

// CONTENT TO CLASSIFY:
// """
// {CONTENT}
// """

// RESPOND ONLY WITH VALID JSON (no markdown, no extra text):
// {
//   "primary_category": "category_name",
//   "secondary_categories": ["category1", "category2"],
//   "confidence": 0.95,
//   "reasoning": "Brief explanation of why this categorization",
//   "extracted_entities": {
//     "university_name": "if found",
//     "country": "if found",
//     "city": "if found",
//     "program": "if found",
//     "degree_level": "bachelor/master/phd if found",
//     "cost": "if found",
//     "duration": "if found",
//     "requirement": "if found"
//   }
// }`;

// export const ENTITY_EXTRACTION_PROMPT = `Extract structured information from the following text.

// TEXT:
// """
// {CONTENT}
// """

// Extract ALL relevant information and return ONLY valid JSON:
// {
//   "university_name": "full name if found, if not found but can be inferred/located from context then provide it, otherwise null",
//   "country": "country name if found, if not found but can be inferred/located from context then provide it, otherwise null",
//   "city": "city name if found, if not found but can be inferred/located from context then provide it, otherwise null",
//   "program_name": "specific program/course name if found, otherwise null",
//   "degree_level": "bachelor/master/phd/diploma/certificate if found, otherwise null",
//   "duration": "e.g., '4 years', '2 semesters' if found, otherwise null",
//   "tuition_fee": "e.g., '$50,000/year' if found, otherwise null",
//   "language_requirement": "e.g., 'IELTS 6.5' if found, otherwise null",
//   "gpa_requirement": "e.g., '3.0 minimum' if found, otherwise null",
//   "test_requirement": "e.g., 'SAT 1400+' if found, otherwise null",
//   "visa_type": "if mentioned, otherwise null",
//   "processing_time": "if mentioned, otherwise null",
//   "scholarships_available": "yes/no/unknown",
//   "application_deadline": "if mentioned, otherwise null"
// }`;

// export const ENTITY_EXTRACTION_PROMPT = `Extract structured information from the following text.

// TEXT:
// """
// {CONTENT}
// """

// INSTRUCTIONS:
// - Extract ONLY if explicitly mentioned or can be inferred from context
// - Return null for fields not found
// - Do NOT extract "No", "No service", "Coming Soon", "Not found" as values
// - If value is negative/unavailable, use null instead

// Extract ALL relevant information and return ONLY valid JSON:
// {
//   "country": "country name if found or can be inferred, otherwise null",
//   "city": "city/capital name if found or can be inferred, otherwise null",
//   "visa_type": "e.g., 'Business Visa', 'Tourist Visa', 'Student Visa' if found, otherwise null",
//   "visa_category": "e.g., 'business', 'tourist', 'student', 'work' if found, otherwise null",
//   "processing_status": "e.g., 'Processing', 'Not Processing' if mentioned, otherwise null",
//   "processing_time_embassy": "official processing time if mentioned, otherwise null",
//   "processing_time_actual": "actual observed processing time if mentioned, otherwise null",
//   "maximum_stay": "e.g., '30 days', '90 days' if mentioned, otherwise null",
//   "visa_fee_short_term_single": "fee for short term single entry if mentioned, otherwise null",
//   "visa_fee_short_term_multiple": "fee for short term multiple entry if mentioned, otherwise null",
//   "embassy_in_bangladesh": "yes/no if mentioned, otherwise null",
//   "vfs_in_bangladesh": "yes/no if mentioned, otherwise null",
//   "e_visa_available": "yes/no if mentioned, otherwise null",
//   "visa_on_arrival": "yes/no if mentioned, otherwise null",
//   "visa_free": "yes/no if mentioned, otherwise null",
//   "appointment_required": "yes/no/not required if mentioned, otherwise null",
//   "application_method": "e.g., 'Online', 'In Person', 'PDF Form' if mentioned, otherwise null",
//   "submission_method": "e.g., 'In Person', 'Courier', 'Online' if mentioned, otherwise null",
//   "collection_method": "how to collect visa if mentioned, otherwise null",
//   "payment_method": "e.g., 'Cash only', 'Card', 'Online' if mentioned, otherwise null",
//   "pcc_required": "yes/no if mentioned, otherwise null",
//   "health_insurance_required": "yes/no if mentioned, otherwise null",
//   "consultancy_available": "yes/no if mentioned, otherwise null",
//   "consultancy_fee": "fee amount if mentioned, otherwise null",
//   "offshore_service": "yes/no if mentioned, otherwise null",
//   "onshore_service": "yes/no if mentioned, otherwise null"
// }

// CRITICAL: Do NOT include these as entity values:
// - "No service"
// - "Coming Soon"
// - "Not found"
// - "No"
// If you encounter these, use null instead.`;

/**
 * ✅ DYNAMIC: Generate category list from CATEGORIES object
 */
function getCategoryList(): string {
  return Object.keys(CATEGORIES).join(', ');
}

/**
 * ✅ DYNAMIC: Generate category descriptions
 */
function getCategoryDescriptions(): string {
  const descriptions: string[] = [];

  for (const [key, config] of Object.entries(CATEGORIES)) {
    // Get first 3 keywords as examples
    const examples = config.keywords.slice(0, 3).join(', ');
    descriptions.push(`- ${key}: ${examples}`);
  }

  return descriptions.join('\n');
}

export const LLM_CATEGORIZATION_PROMPT = `You are an intelligent content classifier.

TASK: Analyze the content and classify it intelligently.

PRIMARY CATEGORIES (choose the best fit):
${getCategoryList()}


CONTENT:
"""
{CONTENT}
"""

INSTRUCTIONS:
1. Choose PRIMARY category that best matches
2. Choose up to 2 SECONDARY categories if relevant
3. Extract ALL meaningful information as key-value pairs
4. Ignore useless values: "No", "No service", "Coming Soon", "Not found", null
5. Use clear, descriptive keys: "country", "visa_type", "price", "university_name", etc.
6. Only include information that EXISTS in the content

Return ONLY valid JSON (no markdown):
{
  "primary_category": "category_name",
  "secondary_categories": ["category1", "category2"],
  "confidence": 0.0-1.0,
  "reasoning": "1-2 sentence explanation",
  "extracted_entities": {
    // Dynamic key-value pairs based on content
    // Example: "country": "Afghanistan", "visa_type": "Business Visa"
  }
}`;

// ✅ TRULY DYNAMIC - Works for ANY content type
export const ENTITY_EXTRACTION_PROMPT = `You are an intelligent entity extraction system.

Analyze the following content and extract ALL relevant structured information.

TEXT:
"""
{CONTENT}
"""

INSTRUCTIONS:
1. Identify what TYPE of content this is (visa info, university, product, medical, financial, etc.)
2. Extract ALL key information as key-value pairs
3. Use descriptive keys that match the content type
4. Return ONLY the relevant fields (no predefined schema)
5. Do NOT extract useless values like: "No", "No service", "Coming Soon", "Not found", "null"
6. If information can be inferred from context, include it
7. Use lowercase with underscores for keys (e.g., "university_name", "product_price")

Return ONLY valid JSON with ONLY the fields you found:
{
  "content_type": "type of content (visa/education/product/medical/etc)",
  // ... add ALL other relevant fields dynamically based on content
}

Example outputs for different content types:

For visa data:
{
  "country": "country name if found or can be inferred, otherwise null",
  "city": "city/capital name if found or can be inferred, otherwise null",
  "visa_type": "e.g., 'Business Visa', 'Tourist Visa', 'Student Visa' if found, otherwise null",
  "visa_category": "e.g., 'business', 'tourist', 'student', 'work' if found, otherwise null",
  "processing_status": "e.g., 'Processing', 'Not Processing' if mentioned, otherwise null",
  "processing_time_embassy": "official processing time if mentioned, otherwise null",
  "processing_time_actual": "actual observed processing time if mentioned, otherwise null",
  "maximum_stay": "e.g., '30 days', '90 days' if mentioned, otherwise null",
  "visa_fee_short_term_single": "fee for short term single entry if mentioned, otherwise null",
  "visa_fee_short_term_multiple": "fee for short term multiple entry if mentioned, otherwise null",
  "embassy_in_bangladesh": "yes/no if mentioned, otherwise null",
  "vfs_in_bangladesh": "yes/no if mentioned, otherwise null",
  "e_visa_available": "yes/no if mentioned, otherwise null",
  "visa_on_arrival": "yes/no if mentioned, otherwise null",
  "visa_free": "yes/no if mentioned, otherwise null",
  "appointment_required": "yes/no/not required if mentioned, otherwise null",
  "application_method": "e.g., 'Online', 'In Person', 'PDF Form' if mentioned, otherwise null",
  "submission_method": "e.g., 'In Person', 'Courier', 'Online' if mentioned, otherwise null",
  "collection_method": "how to collect visa if mentioned, otherwise null",
  "payment_method": "e.g., 'Cash only', 'Card', 'Online' if mentioned, otherwise null",
  "pcc_required": "yes/no if mentioned, otherwise null",
  "health_insurance_required": "yes/no if mentioned, otherwise null",
  "consultancy_available": "yes/no if mentioned, otherwise null",
  "consultancy_fee": "fee amount if mentioned, otherwise null",
  "offshore_service": "yes/no if mentioned, otherwise null",
  "onshore_service": "yes/no if mentioned, otherwise null",
  "other_fields": "any other relevant fields found..."
}

For education data:
{
  "university_name": "full name if found, if not found but can be inferred/located from context then provide it, otherwise null",
  "country": "country name if found, if not found but can be inferred/located from context then provide it, otherwise null",
  "city": "city name if found, if not found but can be inferred/located from context then provide it, otherwise null",
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
  "application_deadline": "if mentioned, otherwise null",
  "other_fields": "any other relevant fields found..."
}

CRITICAL: Only include fields that are actually present. Do not include null fields.`;
