import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { LlmService } from '../llm.service';
import { VectorStoreService } from '../vector-store.service';
import { ContentProcessorService } from './content-processor.service';
import { HybridCategorizerService } from './hybrid-categorizer.service';

export interface IngestionResult {
  success: boolean;
  itemsProcessed: number;
  itemsStored: number;
  categories: Record<string, number>; // category -> count
  processingTimeMs: number;
  details: Array<{
    id: string;
    category: string;
    confidence: number;
    text: string;
    method: string;
  }>;
  errors?: string[];
}

@Injectable()
export class DynamicContextIngestionService {
  private readonly logger = new Logger(DynamicContextIngestionService.name);

  constructor(
    private contentProcessor: ContentProcessorService,
    private categorizer: HybridCategorizerService,
    private vectorStore: VectorStoreService,
    private llmService: LlmService,
  ) {}

  /**
   * Main ingestion method - accepts ANY content in ANY format
   */
  async ingestContent(
    input: any,
    options?: {
      type?: string;
      source?: string;
      skipDuplicates?: boolean;
      chunkLongContent?: boolean;
    },
  ): Promise<IngestionResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const details: any[] = [];
    const categories: Record<string, number> = {};

    try {
      this.logger.log('🔄 Starting content ingestion...');

      // Step 1: Process content (handle different formats)
      const processed = await this.contentProcessor.processContent(input, options?.type);

      this.logger.log(
        `📄 Processed as ${processed.originalFormat}, ${processed.needsChunking ? 'needs chunking' : 'single piece'}`,
      );

      // Step 2: Determine items to process
      const itemsToProcess =
        processed.needsChunking && options?.chunkLongContent !== false
          ? processed.chunks!
          : [processed.text];

      console.log(`📦 Processing ${itemsToProcess.length} item(s)...`);

      this.logger.log(`📦 Processing ${itemsToProcess.length} item(s)...`);

      let itemsStored = 0;

      // Step 3: Process each item
      for (let i = 0; i < itemsToProcess.length; i++) {
        const item = itemsToProcess[i];

        try {
          // Skip empty items
          if (!item || item.trim().length < 10) {
            this.logger.warn(`Skipping item ${i + 1}: too short`);
            continue;
          }

          // Step 3a: Categorize
          const categoryResult = await this.categorizer.categorizeWithEntities(item);

          this.logger.log(
            `  Item ${i + 1}/${itemsToProcess.length}: ${categoryResult.primary_category} (${categoryResult.method}, confidence: ${categoryResult.confidence.toFixed(2)})`,
          );

          // Step 3b: Check for duplicates (optional)
          if (options?.skipDuplicates) {
            const isDuplicate = await this.checkDuplicate(item);
            if (isDuplicate) {
              this.logger.log(`  ⏭️  Skipping duplicate content`);
              continue;
            }
          }

          // Step 3c: Generate embedding
          const embedding = await this.llmService.generateEmbedding(item);

          // Step 3d: Prepare metadata
          const metadata = {
            category: categoryResult.primary_category,
            secondary_categories: categoryResult.secondary_categories,
            confidence: categoryResult.confidence,
            method: categoryResult.method,
            source: options?.source || 'dynamic_ingestion',
            originalFormat: processed.originalFormat,
            entities: categoryResult.extracted_entities,
            ingestionDate: new Date().toISOString(),
            chunkIndex: processed.needsChunking ? i : undefined,
            totalChunks: processed.needsChunking ? itemsToProcess.length : undefined,
          };

          // Step 3e: Store in vector database
          const id = uuidv4();
          const stored = await this.vectorStore.storeKnowledge(id, item, embedding, metadata);

          if (stored) {
            itemsStored++;

            // Track categories
            categories[categoryResult.primary_category] =
              (categories[categoryResult.primary_category] || 0) + 1;

            // Add to details
            details.push({
              id,
              category: categoryResult.primary_category,
              confidence: categoryResult.confidence,
              text: item.substring(0, 100) + (item.length > 100 ? '...' : ''),
              method: categoryResult.method,
            });

            this.logger.log(`  ✅ Stored with ID: ${id}`);
          } else {
            errors.push(`Failed to store item ${i + 1}`);
          }
        } catch (error) {
          this.logger.error(`Error processing item ${i + 1}: ${error.message}`);
          errors.push(`Item ${i + 1}: ${error.message}`);
        }
      }

      const processingTime = Date.now() - startTime;

      this.logger.log(
        `✅ Ingestion complete: ${itemsStored}/${itemsToProcess.length} items stored in ${processingTime}ms`,
      );

      return {
        success: itemsStored > 0,
        itemsProcessed: itemsToProcess.length,
        itemsStored,
        categories,
        processingTimeMs: processingTime,
        details,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      this.logger.error(`Ingestion failed: ${error.message}`);

      return {
        success: false,
        itemsProcessed: 0,
        itemsStored: 0,
        categories: {},
        processingTimeMs: Date.now() - startTime,
        details: [],
        errors: [error.message],
      };
    }
  }

  /**
   * Ingest multiple items at once
   */
  async ingestBatch(
    items: Array<{ content: any; type?: string; source?: string }>,
  ): Promise<IngestionResult> {
    this.logger.log(`📦 Batch ingestion: ${items.length} items`);

    const startTime = Date.now();
    const allDetails: any[] = [];
    const allCategories: Record<string, number> = {};
    const allErrors: string[] = [];
    let totalProcessed = 0;
    let totalStored = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      try {
        const result = await this.ingestContent(item.content, {
          type: item.type,
          source: item.source || `batch_item_${i + 1}`,
          skipDuplicates: true,
        });

        totalProcessed += result.itemsProcessed;
        totalStored += result.itemsStored;

        // Merge categories
        Object.entries(result.categories).forEach(([cat, count]) => {
          allCategories[cat] = (allCategories[cat] || 0) + count;
        });

        // Merge details
        allDetails.push(...result.details);

        // Merge errors
        if (result.errors) {
          allErrors.push(...result.errors);
        }
      } catch (error) {
        this.logger.error(`Batch item ${i + 1} failed: ${error.message}`);
        allErrors.push(`Item ${i + 1}: ${error.message}`);
      }
    }

    return {
      success: totalStored > 0,
      itemsProcessed: totalProcessed,
      itemsStored: totalStored,
      categories: allCategories,
      processingTimeMs: Date.now() - startTime,
      details: allDetails,
      errors: allErrors.length > 0 ? allErrors : undefined,
    };
  }

  /**
   * Check if content is duplicate (based on similarity)
   */
  private async checkDuplicate(content: string, threshold: number = 0.95): Promise<boolean> {
    try {
      const embedding = await this.llmService.generateEmbedding(content);
      const similar = await this.vectorStore.searchKnowledge(embedding, 1);

      if (similar.length > 0 && similar[0].score >= threshold) {
        return true;
      }

      return false;
    } catch (error) {
      this.logger.warn(`Duplicate check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Ingest from file
   */
  async ingestFromFile(filePath: string): Promise<IngestionResult> {
    this.logger.log(`📁 Ingesting from file: ${filePath}`);

    return this.ingestContent(filePath, {
      type: 'file',
      source: filePath,
      skipDuplicates: true,
    });
  }

  /**
   * Ingest from URL (placeholder)
   */
  async ingestFromUrl(url: string): Promise<IngestionResult> {
    this.logger.log(`🌐 Ingesting from URL: ${url}`);

    return this.ingestContent(url, {
      type: 'url',
      source: url,
      skipDuplicates: true,
    });
  }

  /**
   * Update existing knowledge (by ID)
   */
  async updateKnowledge(
    id: string,
    newContent: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Categorize new content
      const categoryResult = await this.categorizer.categorizeWithEntities(newContent);

      // Generate new embedding
      const embedding = await this.llmService.generateEmbedding(newContent);

      // Update in vector store
      const metadata = {
        category: categoryResult.primary_category,
        confidence: categoryResult.confidence,
        entities: categoryResult.extracted_entities,
        updatedAt: new Date().toISOString(),
      };

      await this.vectorStore.storeKnowledge(id, newContent, embedding, metadata);

      return {
        success: true,
        message: `Knowledge ${id} updated successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Update failed: ${error.message}`,
      };
    }
  }

  /**
   * Get ingestion statistics
   */
  async getIngestionStats(): Promise<{
    totalKnowledgeItems: number;
    categoryCounts: Record<string, number>;
    lastIngestion?: string;
  }> {
    try {
      const allKnowledge = await this.vectorStore.getAllKnowledge(1000);

      let categoryCounts: Record<string, number> = {};
      let lastIngestion: string | undefined | any;

      allKnowledge.forEach((item) => {
        const category = String(item.payload?.category || 'unknown');
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;

        const ingestionDate = item.payload?.ingestionDate;
        if (ingestionDate && (!lastIngestion || ingestionDate > lastIngestion)) {
          lastIngestion = ingestionDate;
        }
      });

      return {
        totalKnowledgeItems: allKnowledge.length,
        categoryCounts,
        lastIngestion,
      };
    } catch (error) {
      this.logger.error(`Failed to get stats: ${error.message}`);
      return {
        totalKnowledgeItems: 0,
        categoryCounts: {},
      };
    }
  }
}
