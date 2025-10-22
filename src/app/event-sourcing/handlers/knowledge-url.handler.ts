import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { DynamicContextIngestionService } from '@src/app/modules/ai-agent/services/knowledge/dynamic-ingestion.service';
import { KnowledgeUrlCommand } from '../commands/knowledge-url.command';
import { Logger } from '@nestjs/common';
import {
  KnowledgeIngestionStartedEvent,
  KnowledgeIngestionCompletedEvent,
  KnowledgeIngestionFailedEvent,
} from '../commands/knowledge-ingestion.command';

@CommandHandler(KnowledgeUrlCommand)
export class KnowledgeUrlCommandHandler implements ICommandHandler<KnowledgeUrlCommand> {
  private readonly logger = new Logger(KnowledgeUrlCommandHandler.name);

  constructor(
    private ingestionService: DynamicContextIngestionService,
    private eventBus: EventBus,
  ) {}

  async execute(command: KnowledgeUrlCommand): Promise<void> {
    const { url, requestId } = command;

    try {
      this.logger.log(`🚀 Starting URL ingestion [${requestId}]: ${url}`);

      this.eventBus.publish(new KnowledgeIngestionStartedEvent(requestId, 'url', { url }));

      const result = await this.ingestionService.ingestFromUrl(url);

      this.logger.log(`✅ URL ingestion completed [${requestId}]`);

      this.eventBus.publish(new KnowledgeIngestionCompletedEvent(requestId, 'url', result));
    } catch (error) {
      this.logger.error(`❌ URL ingestion failed [${requestId}]: ${error.message}`);

      this.eventBus.publish(new KnowledgeIngestionFailedEvent(requestId, 'url', error.message));

      throw error;
    }
  }
}
