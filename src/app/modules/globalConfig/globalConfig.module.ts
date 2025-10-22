import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalConfig } from './entities/globalConfig.entity';
import { GlobalConfigService } from './services/globalConfig.service';
import { GlobalConfigController } from './controllers/globalConfig.controller';
import { GlobalConfigSubscriber } from './subscribers/globalConfig.subscriber';

const entities = [GlobalConfig];
const services = [GlobalConfigService];
const subscribers = [GlobalConfigSubscriber];
const controllers = [GlobalConfigController];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...controllers],
})
export class GlobalConfigModule {}
