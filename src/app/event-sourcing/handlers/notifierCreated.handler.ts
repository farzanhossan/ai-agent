import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateNotifierQueue } from '@src/app/modules/queue/createNotifier.queue';
import { NotifierCreatedCommand } from '../commands/notifierCreated.command';

@CommandHandler(NotifierCreatedCommand)
export class NotifierCreatedCommandHandler implements ICommandHandler<NotifierCreatedCommand, void> {
  constructor(private readonly createNotifierQueue: CreateNotifierQueue) { }

  async execute(command: NotifierCreatedCommand): Promise<void> {
    console.log('Notifier Created data Handler');
    try {
      const { data } = command.payload;
      if (!data) {
        console.log('============= NO DATA AVAILABLE ==============');
        return;
      }
      await this.createNotifierQueue.addJob(command.payload);
    } catch (error) {
      console.log("🚀 ~ NotifierCreatedCommandHandler ~ execute ~ error:", error)
    }
  }
}
