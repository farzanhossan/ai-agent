import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DynamicContextIngestionService } from './dynamic-ingestion.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ContextLoaderService implements OnModuleInit {
  private readonly logger = new Logger(ContextLoaderService.name);

  constructor(private ingestionService: DynamicContextIngestionService) {}

  async onModuleInit() {
    // Auto-load on startup is now optional
    // await this.loadKnowledgeBase();
  }

  /**
   * Load knowledge base from file (any format)
   */
  async loadKnowledgeBase(filePath?: string) {
    try {
      // Try multiple possible paths
      const possiblePaths = filePath
        ? [filePath]
        : [
            path.join(process.cwd(), 'data', 'final_kb_updated_with_latest_courses.json'),
            path.join(process.cwd(), 'final_kb_updated_with_latest_courses.json'),
            path.join(
              __dirname,
              '..',
              '..',
              '..',
              '..',
              'data',
              'final_kb_updated_with_latest_courses.json',
            ),
          ];

      let foundPath: string | null = null;

      for (const p of possiblePaths) {
        this.logger.log(`🔍 Checking: ${p}`);
        if (fs.existsSync(p)) {
          foundPath = p;
          this.logger.log(`✅ Found file at: ${p}`);
          break;
        }
      }

      if (!foundPath) {
        this.logger.error('❌ Knowledge base file not found');
        return {
          success: false,
          message: 'Knowledge base file not found',
        };
      }

      // Use dynamic ingestion to process the file
      this.logger.log('📥 Starting dynamic ingestion...');

      const result = await this.ingestionService.ingestFromFile(foundPath);

      if (result.success) {
        this.logger.log(`✅ Successfully loaded ${result.itemsStored} knowledge items!`);
        this.logger.log(`📊 Categories: ${JSON.stringify(result.categories)}`);
      } else {
        this.logger.error(`❌ Ingestion failed: ${result.errors?.join(', ')}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to load knowledge base: ${error.message}`);
      return {
        success: false,
        message: error.message,
        itemsProcessed: 0,
        itemsStored: 0,
        categories: {},
        processingTimeMs: 0,
        details: [],
      };
    }
  }

  /**
   * Add custom knowledge dynamically (any format)
   */
  async addKnowledge(content: any, options?: { type?: string; source?: string }) {
    try {
      this.logger.log('➕ Adding new knowledge...');

      const result = await this.ingestionService.ingestContent(content, {
        type: options?.type,
        source: options?.source || 'manual_add',
        skipDuplicates: true,
      });

      if (result.success) {
        this.logger.log(`✅ Added ${result.itemsStored} item(s)`);
      }

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to add knowledge: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add multiple knowledge items
   */
  async addMultipleKnowledge(items: Array<{ content: any; type?: string; source?: string }>) {
    try {
      this.logger.log(`➕ Adding ${items.length} knowledge items...`);

      const result = await this.ingestionService.ingestBatch(items);

      if (result.success) {
        this.logger.log(`✅ Added ${result.itemsStored}/${result.itemsProcessed} items`);
      }

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to add multiple knowledge: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update existing knowledge
   */
  async updateKnowledge(id: string, newContent: string) {
    try {
      this.logger.log(`🔄 Updating knowledge ${id}...`);

      const result = await this.ingestionService.updateKnowledge(id, newContent);

      if (result.success) {
        this.logger.log(`✅ Knowledge updated`);
      } else {
        this.logger.error(`❌ Update failed: ${result.message}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to update knowledge: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get knowledge base statistics
   */
  async getStats() {
    try {
      return await this.ingestionService.getIngestionStats();
    } catch (error) {
      this.logger.error(`❌ Failed to get stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reload knowledge base (clear and reload)
   */
  async reloadKnowledgeBase(filePath?: string) {
    try {
      this.logger.log('🔄 Reloading knowledge base...');

      // Note: You might want to clear before reloading
      // await this.vectorStore.clearKnowledge();

      return await this.loadKnowledgeBase(filePath);
    } catch (error) {
      this.logger.error(`❌ Failed to reload: ${error.message}`);
      throw error;
    }
  }
}
