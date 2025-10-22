import { Controller, Post, Body, Get, Param, Put, Query, Logger } from '@nestjs/common';
import { DynamicContextIngestionService } from '../services/knowledge/dynamic-ingestion.service';
import { ContextLoaderService } from '../services/knowledge/context-loader.service';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Ai Agent Knowledge')
@ApiBearerAuth()
@Controller('ai-agent/knowledge')
export class KnowledgeController {
  private readonly logger = new Logger(KnowledgeController.name);

  constructor(
    private ingestionService: DynamicContextIngestionService,
    private contextLoader: ContextLoaderService,
  ) {}

  /**
   * Add knowledge from any content
   * POST /knowledge/add
   */
  @Public()
  @Post('add')
  async addKnowledge(
    @Body()
    body: {
      content: any;
      type?: 'text' | 'json' | 'csv' | 'url';
      source?: string;
      skipDuplicates?: boolean;
    },
  ) {
    this.logger.log('📥 API: Adding knowledge...');

    try {
      const result = await this.ingestionService.ingestContent(body.content, {
        type: body.type,
        source: body.source || 'api',
        skipDuplicates: body.skipDuplicates !== false,
      });

      return {
        success: result.success,
        message: `Processed ${result.itemsStored}/${result.itemsProcessed} items`,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to add knowledge: ${error.message}`);
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * Add multiple knowledge items
   * POST /knowledge/add-batch
   */
  @Public()
  @Post('add-batch')
  async addBatch(
    @Body()
    body: {
      items: Array<{
        content: any;
        type?: string;
        source?: string;
      }>;
    },
  ) {
    this.logger.log(`📦 API: Adding batch of ${body.items.length} items...`);

    try {
      const result = await this.ingestionService.ingestBatch(body.items);

      return {
        success: result.success,
        message: `Processed ${result.itemsStored}/${result.itemsProcessed} items`,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Batch add failed: ${error.message}`);
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * Add from URL
   * POST /knowledge/add-from-url
   */
  @Public()
  @Post('add-from-url')
  async addFromUrl(@Body() body: { url: string }) {
    this.logger.log(`🌐 API: Adding from URL: ${body.url}`);

    try {
      const result = await this.ingestionService.ingestFromUrl(body.url);

      return {
        success: result.success,
        message: `URL content processed`,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * Load knowledge base from file
   * POST /knowledge/load-file
   */
  @Public()
  @Post('load-file')
  async loadFromFile(@Body() body: { filePath?: string }) {
    this.logger.log(`📁 API: Loading from file...`);

    try {
      const result = await this.contextLoader.loadKnowledgeBase(body.filePath);

      return {
        success: result.success,
        message: `Loaded ${result.itemsStored} items`,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * Update existing knowledge
   * PUT /knowledge/:id
   */
  @Public()
  @Put(':id')
  async updateKnowledge(@Param('id') id: string, @Body() body: { content: string }) {
    this.logger.log(`🔄 API: Updating knowledge ${id}...`);

    try {
      const result = await this.contextLoader.updateKnowledge(id, body.content);

      return {
        success: result.success,
        message: result.message,
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * Get knowledge statistics
   * GET /knowledge/stats
   */
  @Public()
  @Get('stats')
  async getStats() {
    this.logger.log('📊 API: Getting stats...');

    try {
      const stats = await this.ingestionService.getIngestionStats();

      return {
        success: true,
        message: 'Statistics retrieved',
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * Reload knowledge base
   * POST /knowledge/reload
   */
  @Public()
  @Post('reload')
  async reload(@Body() body: { filePath?: string }) {
    this.logger.log('🔄 API: Reloading knowledge base...');

    try {
      const result = await this.contextLoader.reloadKnowledgeBase(body.filePath);

      return {
        success: result.success,
        message: `Reloaded ${result.itemsStored} items`,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * Quick test endpoint
   * POST /knowledge/quick-test
   */
  @Post('quick-test')
  async quickTest(@Body() body: { text: string }) {
    this.logger.log('🧪 API: Quick test...');

    try {
      const result = await this.ingestionService.ingestContent(body.text, {
        source: 'quick_test',
        skipDuplicates: false,
      });

      return {
        success: true,
        message: 'Test completed',
        data: {
          stored: result.itemsStored > 0,
          category: result.details[0]?.category,
          confidence: result.details[0]?.confidence,
          method: result.details[0]?.method,
          processingTime: result.processingTimeMs,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }
}
