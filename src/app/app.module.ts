import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { DatabaseModule } from '@src/database/database.module';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventSourcingModule } from './event-sourcing/eventSourcing.module';
import { ExceptionFilter } from './filters';
import { HelpersModule } from './helpers/helpers.module';
import { GlobalRequestInterceptor } from './interceptors/globalRequest.interceptor';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { AclModule } from './modules/acl/acl.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/guards/local-auth.guard';
import { GlobalConfigModule } from './modules/globalConfig/globalConfig.module';
import { NotifierModule } from './modules/notifier/notifier.module';
import { UploadModule } from './modules/upload/upload.module';
import { UserModule } from './modules/user/user.module';
import { AiAgentModule } from './modules/ai-agent/ai-agent.module';

const MODULES = [
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '../../'),
    renderPath: '/uploads',
    exclude: ['/api/v1/*'],
  }),
  DatabaseModule,
  ScheduleModule.forRoot(),
  HelpersModule,

  AclModule,
  UserModule,
  AuthModule,
  EventSourcingModule,
  UploadModule,

  GlobalConfigModule,
  NotifierModule,

  AiAgentModule,
];
@Module({
  imports: [...MODULES],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalRequestInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
