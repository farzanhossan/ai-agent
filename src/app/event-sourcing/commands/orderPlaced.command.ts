import { ICommand } from '@nestjs/cqrs';

export class OrderPlacedCommand implements ICommand {
  orderId: string;

  constructor(orderId: string) {
    this.orderId = orderId;
  }
}
