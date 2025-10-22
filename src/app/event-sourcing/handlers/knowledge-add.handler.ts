import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { KnowledgeAddCommand } from '../commands/knowledge-add.command';
import { DynamicContextIngestionService } from '@src/app/modules/ai-agent/services/knowledge/dynamic-ingestion.service';
import {
  KnowledgeIngestionStartedEvent,
  KnowledgeIngestionCompletedEvent,
  KnowledgeIngestionFailedEvent,
} from '../commands/knowledge-ingestion.command';

@CommandHandler(KnowledgeAddCommand)
export class KnowledgeAddCommandHandler implements ICommandHandler<KnowledgeAddCommand> {
  private readonly logger = new Logger(KnowledgeAddCommandHandler.name);

  constructor(
    private ingestionService: DynamicContextIngestionService,
    private eventBus: EventBus,
  ) {}

  async execute(command: KnowledgeAddCommand): Promise<void> {
    const { content, options, requestId } = command;

    try {
      this.logger.log(`🚀 Starting knowledge ingestion [${requestId}]`);

      // Publish started event
      this.eventBus.publish(
        new KnowledgeIngestionStartedEvent(requestId, 'add', {
          contentSize: JSON.stringify(content).length,
        }),
      );

      // Process ingestion
      const result = await this.ingestionService.ingestContent(content, {
        type: options.type,
        source: options.source || 'api',
        skipDuplicates: options.skipDuplicates !== false,
      });

      this.logger.log(
        `✅ Knowledge ingestion completed [${requestId}]: ${result.itemsStored} items stored`,
      );

      // Publish completed event
      this.eventBus.publish(new KnowledgeIngestionCompletedEvent(requestId, 'add', result));
    } catch (error) {
      this.logger.error(`❌ Knowledge ingestion failed [${requestId}]: ${error.message}`);

      // Publish failed event
      this.eventBus.publish(new KnowledgeIngestionFailedEvent(requestId, 'add', error.message));

      throw error;
    }
  }
}
