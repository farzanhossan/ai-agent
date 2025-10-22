import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { NGENIUS_CLIENT } from './ngenius.constants';
import { NgeniusController } from './ngenius.controller';
import { INgeniusOptions } from './ngenius.interfaces';
import { NgeniusService } from './ngenius.service';

@Global()
@Module({})
export class NgeniusModule {
  static register(options: INgeniusOptions): DynamicModule {
    return {
      module: NgeniusModule,
      providers: [
        {
          provide: NGENIUS_CLIENT,
          useFactory: () => {
            return new NgeniusService({
              apiKey: options.apiKey,
              organizationReference: options.organizationReference,
              accessTokenUrl: options.accessTokenUrl,
              createUrl: options.createUrl,
              successUrl: options.successUrl,
              canceledUrl: options.canceledUrl,
              validateUrl: options.validateUrl,
            });
          },
        },
        NgeniusService,
      ],
      imports: [
        HttpModule,
        // HttpModule.register({
        //   timeout: +ENV.REQUEST_TIMEOUT_MS,
        //   timeoutErrorMessage: 'Request Timeout',
        // }),
      ],
      controllers: [NgeniusController],
      exports: [NgeniusService],
    };
  }
}
