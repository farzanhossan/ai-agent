// event-handlers/knowledge-ingestion.event-handler.ts
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import {
  KnowledgeIngestionStartedEvent,
  KnowledgeIngestionCompletedEvent,
  KnowledgeIngestionFailedEvent,
} from '../commands/knowledge-ingestion.command';

// In-memory tracking (use Redis in production)
@Injectable()
export class IngestionStatusTracker {
  private statuses = new Map<string, any>();

  setStatus(requestId: string, status: any) {
    this.statuses.set(requestId, {
      ...status,
      updatedAt: new Date(),
    });
  }

  getStatus(requestId: string) {
    return this.statuses.get(requestId);
  }

  getAllStatuses() {
    return Array.from(this.statuses.entries()).map(([id, status]) => ({
      requestId: id,
      ...status,
    }));
  }
}

@EventsHandler(KnowledgeIngestionStartedEvent)
export class KnowledgeIngestionStartedHandler
  implements IEventHandler<KnowledgeIngestionStartedEvent>
{
  private readonly logger = new Logger(KnowledgeIngestionStartedHandler.name);

  constructor(private tracker: IngestionStatusTracker) {}

  handle(event: KnowledgeIngestionStartedEvent) {
    this.logger.log(`📝 Ingestion started: ${event.requestId} (${event.operationType})`);

    this.tracker.setStatus(event.requestId, {
      status: 'processing',
      operationType: event.operationType,
      startedAt: new Date(),
      metadata: event.metadata,
    });
  }
}

@EventsHandler(KnowledgeIngestionCompletedEvent)
export class KnowledgeIngestionCompletedHandler
  implements IEventHandler<KnowledgeIngestionCompletedEvent>
{
  private readonly logger = new Logger(KnowledgeIngestionCompletedHandler.name);

  constructor(private tracker: IngestionStatusTracker) {}

  handle(event: KnowledgeIngestionCompletedEvent) {
    this.logger.log(`✅ Ingestion completed: ${event.requestId}`);

    this.tracker.setStatus(event.requestId, {
      status: 'completed',
      operationType: event.operationType,
      completedAt: new Date(),
      result: event.result,
    });
  }
}

@EventsHandler(KnowledgeIngestionFailedEvent)
export class KnowledgeIngestionFailedHandler
  implements IEventHandler<KnowledgeIngestionFailedEvent>
{
  private readonly logger = new Logger(KnowledgeIngestionFailedHandler.name);

  constructor(private tracker: IngestionStatusTracker) {}

  handle(event: KnowledgeIngestionFailedEvent) {
    this.logger.error(`❌ Ingestion failed: ${event.requestId} - ${event.error}`);

    this.tracker.setStatus(event.requestId, {
      status: 'failed',
      operationType: event.operationType,
      failedAt: new Date(),
      error: event.error,
    });
  }
}
