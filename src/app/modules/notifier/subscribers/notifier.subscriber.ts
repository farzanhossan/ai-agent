import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { Notifier } from '../entities/notifier.entity';

@EventSubscriber()
export class NotifierSubscriber implements EntitySubscriberInterface<Notifier> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Notifier;
  }

  async beforeInsert(event: InsertEvent<Notifier>) {}
}
