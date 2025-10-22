import { Injectable, Logger } from '@nestjs/common';
import { LlmCategorizerService } from './llm-categorizer.service';
import { RuleBasedCategorizerService } from './role-based-categorizer.service';

export interface HybridCategoryResult {
  primary_category: string;
  secondary_categories: string[];
  confidence: number;
  method: 'rule-based' | 'llm' | 'hybrid';
  reasoning: string;
  extracted_entities: Record<string, any>;
  all_category_scores?: Record<string, number>;
  metadata: {
    rule_based_confidence?: number;
    llm_confidence?: number;
    processing_time_ms: number;
  };
}

@Injectable()
export class HybridCategorizerService {
  private readonly logger = new Logger(HybridCategorizerService.name);

  // Thresholds
  private readonly RULE_CONFIDENCE_THRESHOLD = 0.85; // If rule-based confidence > this, skip LLM
  private readonly LOW_CONFIDENCE_THRESHOLD = 0.4; // If below, always use LLM
  private readonly CONTENT_LENGTH_THRESHOLD = 500; // Short content = rule-based is enough

  constructor(
    private ruleBasedCategorizer: RuleBasedCategorizerService,
    private llmCategorizer: LlmCategorizerService,
  ) {}

  /**
   * Main hybrid categorization method
   */
  async categorize(content: string): Promise<HybridCategoryResult> {
    const startTime = Date.now();

    // Step 1: Always try rule-based first (fast)
    const ruleBasedResult = this.ruleBasedCategorizer.getPrimaryCategory(content);
    const ruleBasedScores = this.ruleBasedCategorizer.categorize(content);

    this.logger.log(
      `Rule-based: ${ruleBasedResult.category} (confidence: ${ruleBasedResult.confidence.toFixed(2)})`,
    );

    // Step 2: Decide if we need LLM
    const needsLLM = await this.shouldUseLLM(content, ruleBasedResult.confidence);

    if (!needsLLM) {
      // Use rule-based result
      const processingTime = Date.now() - startTime;

      return {
        primary_category: ruleBasedResult.category,
        secondary_categories: this.getSecondaryCategories(ruleBasedScores),
        confidence: ruleBasedResult.confidence,
        method: 'rule-based',
        reasoning: 'High confidence rule-based classification',
        extracted_entities: this.ruleBasedCategorizer.extractBasicEntities(content),
        all_category_scores: this.convertScoresToMap(ruleBasedScores),
        metadata: {
          rule_based_confidence: ruleBasedResult.confidence,
          processing_time_ms: processingTime,
        },
      };
    }

    // Step 3: Use LLM for better accuracy
    this.logger.log('Using LLM for more accurate categorization...');

    const llmResult = await this.llmCategorizer.categorize(content);
    const processingTime = Date.now() - startTime;

    // Step 4: Combine results (hybrid approach)
    const finalResult = this.combineResults(ruleBasedResult, ruleBasedScores, llmResult);

    return {
      ...finalResult,
      metadata: {
        rule_based_confidence: ruleBasedResult.confidence,
        llm_confidence: llmResult.confidence,
        processing_time_ms: processingTime,
      },
    };
  }

  /**
   * Decide if LLM is needed based on multiple factors
   */
  private async shouldUseLLM(content: string, ruleConfidence: number): Promise<boolean> {
    // Factor 1: If rule-based confidence is very high, skip LLM
    if (ruleConfidence >= this.RULE_CONFIDENCE_THRESHOLD) {
      this.logger.debug('Rule confidence high enough, skipping LLM');
      return false;
    }

    // Factor 2: If rule-based confidence is very low, definitely use LLM
    if (ruleConfidence < this.LOW_CONFIDENCE_THRESHOLD) {
      this.logger.debug('Rule confidence too low, using LLM');
      return true;
    }

    // Factor 3: Content length - short content doesn't need LLM
    if (content.length < this.CONTENT_LENGTH_THRESHOLD) {
      this.logger.debug('Content too short for LLM, using rule-based');
      return false;
    }

    // Factor 4: Check content complexity
    const structure = this.ruleBasedCategorizer.analyzeContentStructure(content);

    // Simple structured content (like lists) doesn't need LLM
    if (structure.hasBulletPoints && structure.sentenceCount < 5) {
      this.logger.debug('Simple structured content, using rule-based');
      return false;
    }

    // Factor 5: Check if LLM is available
    const llmAvailable = await this.llmCategorizer.isAvailable();
    if (!llmAvailable) {
      this.logger.warn('LLM not available, falling back to rule-based');
      return false;
    }

    // Default: Use LLM for moderate confidence and complex content
    this.logger.debug('Using LLM for better accuracy on complex content');
    return true;
  }

  /**
   * Combine rule-based and LLM results intelligently
   */
  private combineResults(
    ruleBasedResult: { category: string; confidence: number },
    ruleBasedScores: any[],
    llmResult: any,
  ): Omit<HybridCategoryResult, 'metadata'> {
    // If LLM and rule-based agree, use LLM result with boosted confidence
    if (ruleBasedResult.category === llmResult.primary_category) {
      return {
        primary_category: llmResult.primary_category,
        secondary_categories: llmResult.secondary_categories,
        confidence: Math.min(llmResult.confidence + 0.1, 1.0), // Boost confidence
        method: 'hybrid',
        reasoning: `Both methods agree on ${llmResult.primary_category}. ${llmResult.reasoning}`,
        extracted_entities: llmResult.extracted_entities,
        all_category_scores: this.convertScoresToMap(ruleBasedScores),
      };
    }

    // If they disagree, prefer LLM if confidence is high
    if (llmResult.confidence >= 0.75) {
      return {
        primary_category: llmResult.primary_category,
        secondary_categories: [
          ...llmResult.secondary_categories,
          ruleBasedResult.category, // Add rule-based as secondary
        ],
        confidence: llmResult.confidence,
        method: 'llm',
        reasoning: `LLM override: ${llmResult.reasoning}`,
        extracted_entities: llmResult.extracted_entities,
        all_category_scores: this.convertScoresToMap(ruleBasedScores),
      };
    }

    // If both have low confidence, use rule-based with LLM as secondary
    return {
      primary_category: ruleBasedResult.category,
      secondary_categories: [llmResult.primary_category],
      confidence: (ruleBasedResult.confidence + llmResult.confidence) / 2,
      method: 'hybrid',
      reasoning: 'Moderate confidence from both methods, using weighted average',
      extracted_entities: {
        ...this.ruleBasedCategorizer.extractBasicEntities(''),
        ...llmResult.extracted_entities,
      },
      all_category_scores: this.convertScoresToMap(ruleBasedScores),
    };
  }

  /**
   * Get secondary categories from scores
   */
  private getSecondaryCategories(scores: any[], maxSecondary: number = 2): string[] {
    return scores
      .slice(1, maxSecondary + 1)
      .filter((s) => s.score >= 0.3)
      .map((s) => s.category);
  }

  /**
   * Convert score array to map
   */
  private convertScoresToMap(scores: any[]): Record<string, number> {
    const map: Record<string, number> = {};
    scores.forEach((s) => {
      map[s.category] = s.score;
    });
    return map;
  }

  /**
   * Batch categorize multiple contents
   */
  async categorizeBatch(contents: string[]): Promise<HybridCategoryResult[]> {
    this.logger.log(`Batch categorizing ${contents.length} items...`);

    const results: HybridCategoryResult[] = [];

    for (const content of contents) {
      try {
        const result = await this.categorize(content);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to categorize content: ${error.message}`);
        // Add fallback result
        results.push({
          primary_category: 'general',
          secondary_categories: [],
          confidence: 0.3,
          method: 'rule-based',
          reasoning: 'Categorization failed',
          extracted_entities: {},
          metadata: {
            processing_time_ms: 0,
          },
        });
      }
    }

    return results;
  }

  /**
   * Categorize with entity extraction
   */
  async categorizeWithEntities(content: string): Promise<HybridCategoryResult> {
    const categoryResult = await this.categorize(content);

    // If we didn't use LLM, extract entities now
    if (categoryResult.method === 'rule-based') {
      const llmEntities = await this.llmCategorizer.extractEntities(content);
      categoryResult.extracted_entities = {
        ...categoryResult.extracted_entities,
        ...llmEntities,
      };
    }

    return categoryResult;
  }

  /**
   * Get statistics about categorization method usage
   */
  getMethodStats(): {
    rule_based_percentage: number;
    llm_percentage: number;
    hybrid_percentage: number;
  } {
    // This would track actual usage in production
    // For now, return estimated distribution
    return {
      rule_based_percentage: 60, // Fast path
      llm_percentage: 25, // Complex content
      hybrid_percentage: 15, // Disagreement resolution
    };
  }
}
