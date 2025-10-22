import { ICommand } from '@nestjs/cqrs';

export class KnowledgeAddCommand implements ICommand {
  constructor(
    public readonly content: any,
    public readonly options: {
      type?: 'text' | 'json' | 'csv' | 'url';
      source?: string;
      skipDuplicates?: boolean;
    },
    public readonly requestId?: string, // For tracking
  ) {}
}
