import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { RAZORPAY_CLIENT } from './razorpay.constants';
import { RazorpayController } from './razorpay.controller';
import { IRazorpayOptions } from './razorpay.interfaces';
import { RazorpayService } from './razorpay.service';

@Global()
@Module({})
export class RazorpayModule {
  static register(options: IRazorpayOptions): DynamicModule {
    return {
      module: RazorpayModule,
      providers: [
        {
          provide: RAZORPAY_CLIENT,
          useFactory: () => {
            return new RazorpayService({
              keyId: options.keyId,
              keySecret: options.keySecret,
            });
          },
        },
        RazorpayService,
      ],
      imports: [
        HttpModule,
        // HttpModule.register({
        //   timeout: +ENV.REQUEST_TIMEOUT_MS,
        //   timeoutErrorMessage: 'Request Timeout',
        // }),
      ],
      controllers: [RazorpayController],
      exports: [RazorpayService],
    };
  }
}
