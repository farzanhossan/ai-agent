import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { ENV } from '@src/env';
import { NotifierModule } from '../notifier/notifier.module';
import { UserModule } from '../user/user.module';
import { CREATE_NOTIFIER_QUEUE } from './constants';
import { CreateNotifierQueueProcessor } from './createNotifier.processor';
import { CreateNotifierQueue } from './createNotifier.queue';

const modules = [forwardRef(() => NotifierModule), UserModule];
const services = [CreateNotifierQueue];
const processors = [CreateNotifierQueueProcessor];
const redisConnection: any = {
  host: ENV.redis.host,
  port: ENV.redis.port,
  password: ENV.redis.password,
};
// if (ENV.isDevelopment) redisConnection.password = 'redis';
@Module({
  imports: [
    BullModule.forRoot({
      connection: { ...redisConnection },
    }),
    BullModule.registerQueue({ name: CREATE_NOTIFIER_QUEUE }),
    ...modules,
  ],
  providers: [...services, ...processors],
  exports: [...services, ...processors], // Export QueueService so other modules can use it
})
export class QueueModule {}
