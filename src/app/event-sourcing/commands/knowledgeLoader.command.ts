import { ICommand } from '@nestjs/cqrs';

export class KnowledgeLoaderCommand implements ICommand {
  content: any;
  type: 'text' | 'json' | 'csv' | 'url';

  constructor(content: any, type: any) {
    this.content = content;
    this.type = type;
  }
}
