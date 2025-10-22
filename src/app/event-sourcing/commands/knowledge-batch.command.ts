import { ICommand } from '@nestjs/cqrs';

export class KnowledgeBatchCommand implements ICommand {
  constructor(
    public readonly items: Array<{
      content: any;
      type?: string;
      source?: string;
    }>,
    public readonly requestId?: string,
  ) {}
}
