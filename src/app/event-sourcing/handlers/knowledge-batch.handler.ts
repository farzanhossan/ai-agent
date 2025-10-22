import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { DynamicContextIngestionService } from '@src/app/modules/ai-agent/services/knowledge/dynamic-ingestion.service';
import { KnowledgeBatchCommand } from '../commands/knowledge-batch.command';
import { Logger } from '@nestjs/common';
import {
  KnowledgeIngestionStartedEvent,
  KnowledgeIngestionCompletedEvent,
  KnowledgeIngestionFailedEvent,
} from '../commands/knowledge-ingestion.command';

@CommandHandler(KnowledgeBatchCommand)
export class KnowledgeBatchCommandHandler implements ICommandHandler<KnowledgeBatchCommand> {
  private readonly logger = new Logger(KnowledgeBatchCommandHandler.name);

  constructor(
    private ingestionService: DynamicContextIngestionService,
    private eventBus: EventBus,
  ) {}

  async execute(command: KnowledgeBatchCommand): Promise<void> {
    const { items, requestId } = command;

    try {
      this.logger.log(`🚀 Starting batch ingestion [${requestId}]: ${items.length} items`);

      this.eventBus.publish(
        new KnowledgeIngestionStartedEvent(requestId, 'batch', { itemCount: items.length }),
      );

      const result = await this.ingestionService.ingestBatch(items);

      this.logger.log(
        `✅ Batch ingestion completed [${requestId}]: ${result.itemsStored}/${result.itemsProcessed}`,
      );

      this.eventBus.publish(new KnowledgeIngestionCompletedEvent(requestId, 'batch', result));
    } catch (error) {
      this.logger.error(`❌ Batch ingestion failed [${requestId}]: ${error.message}`);

      this.eventBus.publish(new KnowledgeIngestionFailedEvent(requestId, 'batch', error.message));

      throw error;
    }
  }
}
