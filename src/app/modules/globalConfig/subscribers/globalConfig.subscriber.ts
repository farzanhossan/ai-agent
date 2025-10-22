import { BcryptHelper } from '@src/app/helpers';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { Role } from '../../acl/entities/role.entity';
import { GlobalConfig } from '../entities/globalConfig.entity';

@EventSubscriber()
export class GlobalConfigSubscriber implements EntitySubscriberInterface<GlobalConfig> {
  constructor(
    dataSource: DataSource,
    private readonly bcryptHelper: BcryptHelper,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return GlobalConfig;
  }

  async afterLoad(entity: any) {
    if (entity?.weekdayConfig) {
      entity.weekdayConfig = entity.weekdayConfig.split(',');
    }
  }
}
