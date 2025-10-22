import { Injectable, Logger } from '@nestjs/common';
import {
  LLM_CATEGORIZATION_PROMPT,
  ENTITY_EXTRACTION_PROMPT,
  LLMCategoryResult,
} from './category.config';
import { LlmService } from '../llm.service';

@Injectable()
export class LlmCategorizerService {
  private readonly logger = new Logger(LlmCategorizerService.name);

  constructor(private llmService: LlmService) {}

  /**
   * Categorize content using LLM
   */
  async categorize(content: string): Promise<LLMCategoryResult> {
    try {
      // Prepare prompt
      const prompt = LLM_CATEGORIZATION_PROMPT.replace('{CONTENT}', content);

      // Call LLM
      const response = await this.llmService.generateResponse([
        {
          role: 'system',
          content:
            'You are a data classification expert. Always respond with valid JSON only, no markdown, no extra text.',
        },
        { role: 'user', content: prompt },
      ]);

      // Parse response
      const cleanedResponse = this.cleanJsonResponse(response);
      const result: LLMCategoryResult = JSON.parse(cleanedResponse);

      // Validate result
      this.validateCategoryResult(result);

      this.logger.log(
        `LLM categorized as: ${result.primary_category} (confidence: ${result.confidence.toFixed(2)})`,
      );

      return result;
    } catch (error) {
      this.logger.error(`LLM categorization failed: ${error.message}`);
      // Return fallback result
      return {
        primary_category: 'general',
        secondary_categories: [],
        confidence: 0.3,
        reasoning: 'LLM categorization failed, using fallback',
        extracted_entities: {},
      };
    }
  }

  /**
   * Extract entities using LLM
   */
  async extractEntities(content: string): Promise<Record<string, any>> {
    try {
      const prompt = ENTITY_EXTRACTION_PROMPT.replace('{CONTENT}', content);

      const response = await this.llmService.generateResponse([
        {
          role: 'system',
          content: 'You are a data extraction expert. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ]);

      const cleanedResponse = this.cleanJsonResponse(response);
      const entities = JSON.parse(cleanedResponse);

      // Remove null values
      const filteredEntities: Record<string, any> = {};
      for (const [key, value] of Object.entries(entities)) {
        if (value !== null && value !== 'null' && value !== '') {
          filteredEntities[key] = value;
        }
      }

      this.logger.debug(`Extracted entities: ${JSON.stringify(filteredEntities)}`);

      return filteredEntities;
    } catch (error) {
      this.logger.error(`Entity extraction failed: ${error.message}`);
      return {};
    }
  }

  /**
   * Combined categorization and entity extraction
   */
  async categorizeAndExtract(content: string): Promise<{
    category: LLMCategoryResult;
    entities: Record<string, any>;
  }> {
    const [category, entities] = await Promise.all([
      this.categorize(content),
      this.extractEntities(content),
    ]);

    // Merge entities from both sources
    const mergedEntities = {
      ...category.extracted_entities,
      ...entities,
    };

    return {
      category,
      entities: mergedEntities,
    };
  }

  /**
   * Clean JSON response from LLM (remove markdown, extra text)
   */
  private cleanJsonResponse(response: string): string {
    // Remove markdown code blocks
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Try to find JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();

    return cleaned;
  }

  /**
   * Validate category result
   */
  private validateCategoryResult(result: LLMCategoryResult): void {
    if (!result.primary_category) {
      throw new Error('Missing primary_category in LLM response');
    }

    if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
      result.confidence = 0.5; // Default if invalid
    }

    if (!Array.isArray(result.secondary_categories)) {
      result.secondary_categories = [];
    }

    if (!result.extracted_entities || typeof result.extracted_entities !== 'object') {
      result.extracted_entities = {};
    }
  }

  /**
   * Get confidence level description
   */
  getConfidenceLevel(confidence: number): string {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.75) return 'High';
    if (confidence >= 0.6) return 'Medium';
    if (confidence >= 0.4) return 'Low';
    return 'Very Low';
  }

  /**
   * Check if LLM service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Try a simple request
      await this.llmService.generateResponse([{ role: 'user', content: 'Hello' }]);
      return true;
    } catch (error) {
      this.logger.warn('LLM service not available');
      return false;
    }
  }
}
