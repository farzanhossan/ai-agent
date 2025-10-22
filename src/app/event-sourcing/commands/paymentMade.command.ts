import { ICommand } from '@nestjs/cqrs';

export class PaymentMadeCommand implements ICommand {
  orderCode: string;
  amountType: string;
  amount: number;

  constructor(orderCode: string, amountType: string, amount: number) {
    console.log("🚀 ~ PaymentMadeCommand ~ constructor ~ orderCode, amountType, amount", {orderCode, amountType, amount})
    this.orderCode = orderCode;
    this.amountType = amountType;
    this.amount = amount;
  }
}
