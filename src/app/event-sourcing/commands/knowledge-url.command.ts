import { ICommand } from '@nestjs/cqrs';

export class KnowledgeUrlCommand implements ICommand {
  constructor(
    public readonly url: string,
    public readonly requestId?: string,
  ) {}
}
