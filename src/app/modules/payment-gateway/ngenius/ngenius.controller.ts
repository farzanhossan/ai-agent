import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NgeniusService } from './ngenius.service';
import { INgeniusInitPaymentRequest } from './ngenius.interfaces';

@ApiTags('Ngenius')
@Controller('payment-gateway/ngenius')
export class NgeniusController {
  constructor(private readonly service: NgeniusService) {}

  @Post('/token')
  async token(): Promise<any> {
    return this.service.createAccessToken();
  }

  @Post('/init')
  async init(@Body() body: INgeniusInitPaymentRequest): Promise<any> {
    return this.service.initPayment(body);
  }

  // @Get('create-order/:amount/:currency/:orderId')
  // async createOrder(
  //   @Param('amount') amount: number,
  //   @Param('currency') currency: string,
  //   @Param('orderId') orderId: string,
  // ): Promise<any> {
  //   return this.service.createOrder(amount, currency, orderId);
  // }
}
