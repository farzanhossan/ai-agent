import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentGatewayModule } from '../modules/payment-gateway/paymentGateway.module';
import { QueueModule } from '../modules/queue/queue.module';
import { AddPaymentLogCommandHandler } from './handlers/addPaymentLog.handler';
import { NotifierCreatedCommandHandler } from './handlers/notifierCreated.handler';
import { PaymentMadeCommandHandler } from './handlers/paymentMade.handler';
import { KnowledgeLoaderCommandHandler } from './handlers/knowledgeLoader.handler';
import { AiAgentModule } from '../modules/ai-agent/ai-agent.module';
import { KnowledgeAddCommandHandler } from './handlers/knowledge-add.handler';
import { KnowledgeBatchCommandHandler } from './handlers/knowledge-batch.handler';
import { KnowledgeLoadFileCommandHandler } from './handlers/knowledge-load-file.handler';
import { KnowledgeReloadCommandHandler } from './handlers/knowledge-reload.handler';
import { KnowledgeUrlCommandHandler } from './handlers/knowledge-url.handler';
import {
  KnowledgeIngestionStartedHandler,
  KnowledgeIngestionCompletedHandler,
  KnowledgeIngestionFailedHandler,
  IngestionStatusTracker,
} from './handlers/knowledge-ingestion.handler';

const handlers = [
  NotifierCreatedCommandHandler,
  PaymentMadeCommandHandler,
  AddPaymentLogCommandHandler,
  KnowledgeLoaderCommandHandler,
  KnowledgeAddCommandHandler,
  KnowledgeBatchCommandHandler,
  KnowledgeLoadFileCommandHandler,
  KnowledgeReloadCommandHandler,
  KnowledgeUrlCommandHandler,
  KnowledgeIngestionStartedHandler,
  KnowledgeIngestionCompletedHandler,
  KnowledgeIngestionFailedHandler,
  IngestionStatusTracker,
];

const modules = [CqrsModule, QueueModule, PaymentGatewayModule, AiAgentModule];

@Global()
@Module({
  imports: [...modules],
  controllers: [],
  providers: [...handlers],
  exports: [...handlers, CqrsModule],
})
export class EventSourcingModule {}
