import { ICommand } from '@nestjs/cqrs';

export class KnowledgeLoadFileCommand implements ICommand {
  constructor(
    public readonly filePath?: string,
    public readonly requestId?: string,
  ) {}
}
