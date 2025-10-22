import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentGatewayModule } from '../modules/payment-gateway/paymentGateway.module';
import { QueueModule } from '../modules/queue/queue.module';
import { AddPaymentLogCommandHandler } from './handlers/addPaymentLog.handler';
import { NotifierCreatedCommandHandler } from './handlers/notifierCreated.handler';
import { PaymentMadeCommandHandler } from './handlers/paymentMade.handler';

const handlers =
  [
    NotifierCreatedCommandHandler,
    PaymentMadeCommandHandler,
    AddPaymentLogCommandHandler,
  ];
const modules = [CqrsModule, QueueModule, PaymentGatewayModule];

@Global()
@Module({
  imports: [...modules],
  controllers: [],
  providers: [...handlers],
  exports: [...handlers, CqrsModule],
})
export class EventSourcingModule { }
