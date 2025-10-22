import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { KnowledgeLoaderCommand } from '../commands/knowledgeLoader.command';
import { DynamicContextIngestionService } from '@src/app/modules/ai-agent/services/knowledge/dynamic-ingestion.service';

@CommandHandler(KnowledgeLoaderCommand)
export class KnowledgeLoaderCommandHandler
  implements ICommandHandler<KnowledgeLoaderCommand, void>
{
  constructor(private ingestionService: DynamicContextIngestionService) {}

  async execute(command: KnowledgeLoaderCommand): Promise<void> {
    try {
      const { content, type } = command;
      const result = await this.ingestionService.ingestContent(content, {
        type,
        source: 'api',
        skipDuplicates: false,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
