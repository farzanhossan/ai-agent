import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { NAGAD_CLIENT } from './nagad.constants';
import { NagadController } from './nagad.controller';
import { INagadOptions } from './nagad.interfaces';
import { NagadService } from './nagad.service';

@Global()
@Module({})
export class NagadModule {
  static register(options: INagadOptions): DynamicModule {
    return {
      module: NagadModule,
      providers: [
        {
          provide: NAGAD_CLIENT,
          useFactory: () => {
            return new NagadService({
              baseUrl: options.baseUrl,
              publicKey: options.publicKey,
              privateKey: options.privateKey,
              merchantId: options.merchantId,
              merchantNumber: options.merchantNumber,
            });
          },
        },
        NagadService,
      ],
      imports: [
        HttpModule,
        // HttpModule.register({
        //   timeout: +ENV.REQUEST_TIMEOUT_MS,
        //   timeoutErrorMessage: 'Request Timeout',
        // }),
      ],
      controllers: [NagadController],
      exports: [NagadService],
    };
  }
}
