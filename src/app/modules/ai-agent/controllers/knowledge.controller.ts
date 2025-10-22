// knowledge.controller.ts
import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { v4 as uuidv4 } from 'uuid';

import { KnowledgeAddCommand } from '@src/app/event-sourcing/commands/knowledge-add.command';
import { KnowledgeBatchCommand } from '@src/app/event-sourcing/commands/knowledge-batch.command';
import { KnowledgeLoadFileCommand } from '@src/app/event-sourcing/commands/knowledge-load-file.command';
import { KnowledgeReloadCommand } from '@src/app/event-sourcing/commands/knowledge-reload.command';
import { KnowledgeUrlCommand } from '@src/app/event-sourcing/commands/knowledge-url.command';
import { DynamicContextIngestionService } from '../services/knowledge/dynamic-ingestion.service';
import { IngestionStatusTracker } from '@src/app/event-sourcing/handlers/knowledge-ingestion.handler';

@ApiTags('Ai Agent Knowledge')
@ApiBearerAuth()
@Controller('ai-agent/knowledge')
export class KnowledgeController {
  private readonly logger = new Logger(KnowledgeController.name);

  constructor(
    private cmdBus: CommandBus,
    private statusTracker: IngestionStatusTracker,
    private ingestionService: DynamicContextIngestionService, // For quick-test only
  ) {}

  /**
   * Add knowledge from any content (ASYNC)
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
    const requestId = uuidv4();
    this.logger.log(`📥 API: Adding knowledge [${requestId}]`);

    try {
      // Execute command asynchronously (don't await)
      this.cmdBus.execute(
        new KnowledgeAddCommand(
          body.content,
          {
            type: body.type,
            source: body.source,
            skipDuplicates: body.skipDuplicates,
          },
          requestId,
        ),
      );

      return {
        success: true,
        message: 'Knowledge ingestion started',
        requestId,
        statusUrl: `/ai-agent/knowledge/status/${requestId}`,
      };
    } catch (error) {
      this.logger.error(`Failed to start knowledge ingestion: ${error.message}`);
      return {
        success: false,
        message: error.message,
        requestId: null,
      };
    }
  }

  /**
   * Add multiple knowledge items (ASYNC)
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
    const requestId = uuidv4();
    this.logger.log(`📦 API: Adding batch [${requestId}]: ${body.items.length} items`);

    try {
      this.cmdBus.execute(new KnowledgeBatchCommand(body.items, requestId));

      return {
        success: true,
        message: `Batch ingestion started for ${body.items.length} items`,
        requestId,
        statusUrl: `/ai-agent/knowledge/status/${requestId}`,
      };
    } catch (error) {
      this.logger.error(`Batch ingestion failed: ${error.message}`);
      return {
        success: false,
        message: error.message,
        requestId: null,
      };
    }
  }

  /**
   * Add from URL (ASYNC)
   * POST /knowledge/add-from-url
   */
  @Public()
  @Post('add-from-url')
  async addFromUrl(@Body() body: { url: string }) {
    const requestId = uuidv4();
    this.logger.log(`🌐 API: Adding from URL [${requestId}]: ${body.url}`);

    try {
      this.cmdBus.execute(new KnowledgeUrlCommand(body.url, requestId));

      return {
        success: true,
        message: 'URL ingestion started',
        requestId,
        statusUrl: `/ai-agent/knowledge/status/${requestId}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        requestId: null,
      };
    }
  }

  /**
   * Load knowledge base from file (ASYNC)
   * POST /knowledge/load-file
   */
  @Public()
  @Post('load-file')
  async loadFromFile(@Body() body: { filePath?: string }) {
    const requestId = uuidv4();
    this.logger.log(`📁 API: Loading from file [${requestId}]`);

    try {
      this.cmdBus.execute(new KnowledgeLoadFileCommand(body.filePath, requestId));

      return {
        success: true,
        message: 'File load started',
        requestId,
        statusUrl: `/ai-agent/knowledge/status/${requestId}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        requestId: null,
      };
    }
  }

  /**
   * Reload knowledge base (ASYNC)
   * POST /knowledge/reload
   */
  @Public()
  @Post('reload')
  async reload(@Body() body: { filePath?: string }) {
    const requestId = uuidv4();
    this.logger.log(`🔄 API: Reloading knowledge base [${requestId}]`);

    try {
      this.cmdBus.execute(new KnowledgeReloadCommand(body.filePath, requestId));

      return {
        success: true,
        message: 'Reload started',
        requestId,
        statusUrl: `/ai-agent/knowledge/status/${requestId}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        requestId: null,
      };
    }
  }

  /**
   * Get ingestion status
   * GET /knowledge/status/:requestId
   */
  @Public()
  @Get('status/:requestId')
  async getStatus(@Param('requestId') requestId: string) {
    const status = this.statusTracker.getStatus(requestId);

    if (!status) {
      return {
        success: false,
        message: 'Request not found',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Status retrieved',
      data: status,
    };
  }

  /**
   * Get all ingestion statuses
   * GET /knowledge/status
   */
  @Public()
  @Get('status')
  async getAllStatuses() {
    const statuses = this.statusTracker.getAllStatuses();

    return {
      success: true,
      message: `Found ${statuses.length} ingestion requests`,
      data: statuses,
    };
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
   * Quick test endpoint (SYNCHRONOUS)
   * POST /knowledge/quick-test
   */
  @Public()
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
