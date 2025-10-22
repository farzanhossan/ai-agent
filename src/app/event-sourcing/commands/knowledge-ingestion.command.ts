import { IEvent } from '@nestjs/cqrs';

export class KnowledgeIngestionStartedEvent implements IEvent {
  constructor(
    public readonly requestId: string,
    public readonly operationType: string,
    public readonly metadata: Record<string, any>,
  ) {}
}

export class KnowledgeIngestionCompletedEvent implements IEvent {
  constructor(
    public readonly requestId: string,
    public readonly operationType: string,
    public readonly result: any,
  ) {}
}

export class KnowledgeIngestionFailedEvent implements IEvent {
  constructor(
    public readonly requestId: string,
    public readonly operationType: string,
    public readonly error: string,
  ) {}
}
