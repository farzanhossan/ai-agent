import { Injectable, Logger } from '@nestjs/common';
import { CATEGORIES, CategoryScore } from './category.config';

@Injectable()
export class RuleBasedCategorizerService {
  private readonly logger = new Logger(RuleBasedCategorizerService.name);

  /**
   * Categorize content using keyword matching and pattern recognition
   */
  categorize(content: string): CategoryScore[] {
    const lowerContent = content.toLowerCase();
    const categoryScores: CategoryScore[] = [];

    for (const [categoryName, categoryConfig] of Object.entries(CATEGORIES)) {
      const matchedKeywords: string[] = [];
      let keywordScore = 0;
      let patternScore = 0;

      // 1. Keyword matching
      for (const keyword of categoryConfig.keywords) {
        if (lowerContent.includes(keyword.toLowerCase())) {
          matchedKeywords.push(keyword);
          keywordScore += 1;
        }
      }

      // 2. Pattern matching (more weight)
      for (const pattern of categoryConfig.patterns) {
        if (pattern.test(content)) {
          patternScore += 2; // Patterns are more reliable
        }
      }

      // 3. Calculate total score
      const rawScore = (keywordScore + patternScore) * categoryConfig.weight;

      // 4. Normalize to 0-1 scale
      const normalizedScore = Math.min(rawScore / 10, 1.0);

      // 5. Calculate confidence based on matches
      const confidence = this.calculateConfidence(
        matchedKeywords.length,
        patternScore,
        content.length,
      );

      if (normalizedScore > 0) {
        categoryScores.push({
          category: categoryName,
          score: normalizedScore,
          matchedKeywords,
          confidence,
        });
      }
    }

    // Sort by score descending
    categoryScores.sort((a, b) => b.score - a.score);

    this.logger.debug(
      `Rule-based categorization: ${categoryScores.map((c) => `${c.category}(${c.score.toFixed(2)})`).join(', ')}`,
    );

    return categoryScores;
  }

  /**
   * Get the primary category (highest score)
   */
  getPrimaryCategory(content: string): { category: string; confidence: number } {
    const scores = this.categorize(content);

    if (scores.length === 0) {
      return { category: 'general', confidence: 0.3 };
    }

    const primary = scores[0];
    return {
      category: primary.category,
      confidence: primary.confidence,
    };
  }

  /**
   * Get multiple categories (for multi-label classification)
   */
  getMultipleCategories(content: string, threshold: number = 0.3): string[] {
    const scores = this.categorize(content);
    return scores.filter((s) => s.score >= threshold).map((s) => s.category);
  }

  /**
   * Calculate confidence based on various factors
   */
  private calculateConfidence(
    keywordMatches: number,
    patternMatches: number,
    contentLength: number,
  ): number {
    // Base confidence from matches
    let confidence = 0;

    // Keyword contribution (max 0.5)
    confidence += Math.min(keywordMatches * 0.1, 0.5);

    // Pattern contribution (max 0.4)
    confidence += Math.min(patternMatches * 0.15, 0.4);

    // Content length bonus (longer = more reliable)
    if (contentLength > 200) {
      confidence += 0.1;
    }

    // Cap at 0.9 for rule-based (never 1.0, LLM should have higher max)
    return Math.min(confidence, 0.9);
  }

  /**
   * Check if content contains specific category indicators
   */
  hasStrongIndicators(content: string, category: string): boolean {
    const categoryConfig = CATEGORIES[category];
    if (!categoryConfig) return false;

    const lowerContent = content.toLowerCase();

    // Check for pattern matches (strong indicators)
    for (const pattern of categoryConfig.patterns) {
      if (pattern.test(content)) {
        return true;
      }
    }

    // Check for multiple keyword matches
    const keywordMatches = categoryConfig.keywords.filter((kw) =>
      lowerContent.includes(kw.toLowerCase()),
    ).length;

    return keywordMatches >= 3;
  }

  /**
   * Extract entities using regex patterns
   */
  extractBasicEntities(content: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // Extract country names (common ones)
    const countries = [
      'usa',
      'uk',
      'canada',
      'australia',
      'germany',
      'france',
      'netherlands',
      'singapore',
      'japan',
      'china',
    ];
    for (const country of countries) {
      if (content.toLowerCase().includes(country)) {
        entities.country = country.charAt(0).toUpperCase() + country.slice(1);
        break;
      }
    }

    // Extract costs (e.g., $50,000, £30,000)
    const costMatch = content.match(/[$£€¥]\s*\d+[,\d]*(\.\d+)?/);
    if (costMatch) {
      entities.cost = costMatch[0];
    }

    // Extract duration (e.g., 4 years, 2 semesters)
    const durationMatch = content.match(/\d+\s*(year|semester|month|week)s?/i);
    if (durationMatch) {
      entities.duration = durationMatch[0];
    }

    // Extract GPA (e.g., 3.5, 3.0 GPA)
    const gpaMatch = content.match(/gpa\s*:?\s*(\d+\.?\d*)|(\d+\.?\d*)\s*gpa/i);
    if (gpaMatch) {
      entities.gpa_requirement = gpaMatch[1] || gpaMatch[2];
    }

    // Extract IELTS score (e.g., IELTS 6.5)
    const ieltsMatch = content.match(/ielts\s*:?\s*(\d+\.?\d*)/i);
    if (ieltsMatch) {
      entities.language_requirement = `IELTS ${ieltsMatch[1]}`;
    }

    // Extract TOEFL score (e.g., TOEFL 90)
    const toeflMatch = content.match(/toefl\s*:?\s*(\d+)/i);
    if (toeflMatch) {
      entities.language_requirement = `TOEFL ${toeflMatch[1]}`;
    }

    // Extract processing time (e.g., 8 weeks, 2 months)
    const processingMatch = content.match(/(\d+)\s*(week|month|day)s?\s*(processing|approval)/i);
    if (processingMatch) {
      entities.processing_time = `${processingMatch[1]} ${processingMatch[2]}s`;
    }

    return entities;
  }

  /**
   * Analyze content structure
   */
  analyzeContentStructure(content: string): {
    hasQuestionFormat: boolean;
    hasBulletPoints: boolean;
    hasNumericData: boolean;
    sentenceCount: number;
    avgSentenceLength: number;
  } {
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const hasQuestionFormat =
      /\?$/.test(content) || /^(how|what|when|where|why|who)\s+/i.test(content);
    const hasBulletPoints = /[•\-\*]\s+/.test(content) || /^\d+\.\s+/m.test(content);
    const hasNumericData = /\d+/.test(content);
    const avgSentenceLength =
      sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / (sentences.length || 1);

    return {
      hasQuestionFormat,
      hasBulletPoints,
      hasNumericData,
      sentenceCount: sentences.length,
      avgSentenceLength,
    };
  }
}
