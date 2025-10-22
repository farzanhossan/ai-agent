import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentGatewayLogService } from '../services/paymentGatewayLog.service';

@ApiTags('Payment Gateway Log')
@Controller('payment-gateway-logs')
export class PaymentGatewayLogController {
  constructor(private readonly service: PaymentGatewayLogService) {}
}
