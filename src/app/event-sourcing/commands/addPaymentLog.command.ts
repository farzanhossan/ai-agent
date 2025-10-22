import { ICommand } from '@nestjs/cqrs';
import { PaymentGatewayLog } from '@src/app/modules/payment-gateway/entities/paymentGatewayLog.entity';

export class AddPaymentLogCommand implements ICommand {
  log: PaymentGatewayLog;
  transactionId: string;

  constructor(transactionId: string, log: PaymentGatewayLog) {
    this.log = log;
    this.transactionId = transactionId;
  }
}
