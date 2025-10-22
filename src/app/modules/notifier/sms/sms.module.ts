import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsController } from './controllers/sms.controller';
import { SmsGatewayController } from './controllers/smsGateway.controller';
import { SmsGateway } from './entities/smsGateway.entity';
import { SmsLog } from './entities/smsLog.entity';
import { SmsService } from './services/sms.service';
import { SmsGatewayService } from './services/smsGateway.service';

const entities = [SmsLog, SmsGateway];
const modules = [HttpModule];
const services = [SmsService, SmsGatewayService];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities), ...modules],
  providers: [...services],
  exports: [...services],
  controllers: [SmsController, SmsGatewayController],
})
export class SmsModule {}
