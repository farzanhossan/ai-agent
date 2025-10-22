export class KnowledgeReloadCommand implements ICommand {
  constructor(
    public readonly filePath?: string,
    public readonly requestId?: string,
  ) {}
}
import { ICommand } from '@nestjs/cqrs';
