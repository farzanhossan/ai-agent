import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { ContextLoaderService } from '@src/app/modules/ai-agent/services/knowledge/context-loader.service';
import { KnowledgeReloadCommand } from '../commands/knowledge-reload.command';
import { Logger } from '@nestjs/common';
import {
  KnowledgeIngestionStartedEvent,
  KnowledgeIngestionCompletedEvent,
  KnowledgeIngestionFailedEvent,
} from '../commands/knowledge-ingestion.command';

@CommandHandler(KnowledgeReloadCommand)
export class KnowledgeReloadCommandHandler implements ICommandHandler<KnowledgeReloadCommand> {
  private readonly logger = new Logger(KnowledgeReloadCommandHandler.name);

  constructor(
    private contextLoader: ContextLoaderService,
    private eventBus: EventBus,
  ) {}

  async execute(command: KnowledgeReloadCommand): Promise<void> {
    const { filePath, requestId } = command;

    try {
      this.logger.log(`🚀 Starting knowledge reload [${requestId}]`);

      this.eventBus.publish(new KnowledgeIngestionStartedEvent(requestId, 'reload', { filePath }));

      const result = await this.contextLoader.reloadKnowledgeBase(filePath);

      this.logger.log(`✅ Reload completed [${requestId}]: ${result.itemsStored} items`);

      this.eventBus.publish(new KnowledgeIngestionCompletedEvent(requestId, 'reload', result));
    } catch (error) {
      this.logger.error(`❌ Reload failed [${requestId}]: ${error.message}`);

      this.eventBus.publish(new KnowledgeIngestionFailedEvent(requestId, 'reload', error.message));

      throw error;
    }
  }
}
