import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NagadService } from './nagad.service';
import { NagadPaymentRequestDTO } from './requests/nagad-payment-request.dto';

@ApiTags('Nagad')
@Controller('payment-gateway/nagad')
export class NagadController {
  constructor(private readonly service: NagadService) {}

  @Post('/init')
  async init(@Body() body: NagadPaymentRequestDTO): Promise<any> {
    return this.service.initPayment({
      orderId: body.orderId,
      amount: body.amount,
    });
  }
}
