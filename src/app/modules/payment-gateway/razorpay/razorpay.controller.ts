import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IRazorpayInitPaymentRequest } from './razorpay.interfaces';
import { RazorpayService } from './razorpay.service';

@ApiTags('Razorpay')
@Controller('payment-gateway/razorpay')
export class RazorpayController {
  constructor(private readonly service: RazorpayService) {}

  // @Post('/token')
  // async token(): Promise<any> {
  //   return this.service.createToken();
  // }

  @Post('/init')
  async init(@Body() body: IRazorpayInitPaymentRequest): Promise<any> {
    return this.service.initPayment(body);
  }

  @Get('create-order/:amount/:currency/:orderId')
  async createOrder(
    @Param('amount') amount: number,
    @Param('currency') currency: string,
    @Param('orderId') orderId: string,
  ): Promise<any> {
    return this.service.createOrder(amount, currency, orderId);
  }
}
