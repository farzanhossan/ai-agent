import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ContextLoaderService } from '@src/app/modules/ai-agent/services/knowledge/context-loader.service';
import { KnowledgeLoadFileCommand } from '../commands/knowledge-load-file.command';
import {
  KnowledgeIngestionStartedEvent,
  KnowledgeIngestionCompletedEvent,
  KnowledgeIngestionFailedEvent,
} from '../commands/knowledge-ingestion.command';

@CommandHandler(KnowledgeLoadFileCommand)
export class KnowledgeLoadFileCommandHandler implements ICommandHandler<KnowledgeLoadFileCommand> {
  private readonly logger = new Logger(KnowledgeLoadFileCommandHandler.name);

  constructor(
    private contextLoader: ContextLoaderService,
    private eventBus: EventBus,
  ) {}

  async execute(command: KnowledgeLoadFileCommand): Promise<void> {
    const { filePath, requestId } = command;

    try {
      this.logger.log(`🚀 Starting file load [${requestId}]: ${filePath || 'default path'}`);

      this.eventBus.publish(
        new KnowledgeIngestionStartedEvent(requestId, 'load-file', { filePath }),
      );

      const result = await this.contextLoader.loadKnowledgeBase(filePath);

      this.logger.log(`✅ File load completed [${requestId}]: ${result.itemsStored} items`);

      this.eventBus.publish(new KnowledgeIngestionCompletedEvent(requestId, 'load-file', result));
    } catch (error) {
      this.logger.error(`❌ File load failed [${requestId}]: ${error.message}`);

      this.eventBus.publish(
        new KnowledgeIngestionFailedEvent(requestId, 'load-file', error.message),
      );

      throw error;
    }
  }
}
