import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { Invoice } from '@src/app/modules/invoices/entities/invoices.entity';
// import { InvoiceService } from '@src/app/modules/invoices/services/invoices.service';
// import { ENUM_INVOICE_PAYMENT_STATUS } from '@src/shared/common.enums';
import { PaymentMadeCommand } from '../commands/paymentMade.command';

@CommandHandler(PaymentMadeCommand)
export class PaymentMadeCommandHandler
  implements ICommandHandler<PaymentMadeCommand, void> {
  constructor(
    // private readonly invoiceService: InvoiceService,
  ) { }

  async execute(command: PaymentMadeCommand): Promise<void> {
    // try {
    //   console.log(
    //     '🚀 ~ file: paymentMade.handler.ts:20 ~ execute ~ command:',
    //     command
    //   );
    //   const invoice = await this.invoiceService.findOne({
    //     where: {
    //       code: command.orderCode,
    //     },
    //     relations: ['query']
    //   });

    //   if (invoice) {
    //     const updatedInvoice: Invoice = {};

    //     updatedInvoice.paidAmount = invoice.paidAmount + command.amount;
    //     updatedInvoice.payableAmount = invoice.paidAmount - command.amount;

    //     updatedInvoice.status = ENUM_INVOICE_PAYMENT_STATUS.PAID;

    //     if (invoice.status === ENUM_INVOICE_PAYMENT_STATUS.PENDING) {
    //       updatedInvoice.status = ENUM_INVOICE_PAYMENT_STATUS.PAID;
    //     }

    //     const updatedOrderRes = await this.invoiceService.updateOneBase(invoice.id, updatedInvoice);

    //     // this.sseService.sendEvent({
    //     //   type: ENUM_SSE_EVENT_TYPE.PAYMENT_MADE,
    //     //   payload: {
    //     //     orderCode: order.code,
    //     //     amount: command.amount,
    //     //     message: `Payment of ${command.amount} has been made for order ${order.code}`,
    //     //   },
    //     // });

    //     // await this.notificationService.saveOne({
    //     //   text: `Payment of ${command.amount} has been made for order ${invoice.query.code}`,
    //     //   navigateTo: `/queries/details/${invoice.code}`,
    //     // });
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
  }
}
