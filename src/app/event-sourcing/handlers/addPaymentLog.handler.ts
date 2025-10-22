import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { InvoiceService } from '@src/app/modules/invoices/services/invoices.service';
import { PaymentGatewayLogService } from '@src/app/modules/payment-gateway/services/paymentGatewayLog.service';
import { AddPaymentLogCommand } from '../commands/addPaymentLog.command';

@CommandHandler(AddPaymentLogCommand)
export class AddPaymentLogCommandHandler
  implements ICommandHandler<AddPaymentLogCommand, void> {
  constructor(
    private readonly paymentLogService: PaymentGatewayLogService,
    // private readonly invoiceService: InvoiceService
  ) { }

  async execute(command: AddPaymentLogCommand): Promise<void> {
    try {
      const invoiceCode = command.transactionId;

      // const invoice = await this.invoiceService.findOne({
      //   where: {
      //     code: invoiceCode,
      //   },
      // });

      const isExist = await this.paymentLogService.findOne({
        where: {
          transactionId: command.transactionId,
        },
      });

      if (!isExist) {
        await this.paymentLogService._repo.save({
          transactionId: command.transactionId,
          // invoice: invoice.id,
          ...command.log,
        });
      } else {
        await this.paymentLogService.updateOneBase(isExist.id, command.log);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
