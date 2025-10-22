import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { NotifierController } from './controllers/notifier.controller';
import { Notifier } from './entities/notifier.entity';
import { NotifierService } from './services/notifier.service';
import { SmsModule } from './sms/sms.module';
import { NotifierSubscriber } from './subscribers/notifier.subscriber';

const entities = [Notifier];
const services = [NotifierService];
const controllers = [];
const subscribers = [NotifierSubscriber];
const webControllers = [];
const internalControllers = [NotifierController];
const modules = [UserModule, SmsModule];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities), ...modules],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...controllers, ...webControllers, ...internalControllers],
})
export class NotifierModule {}
