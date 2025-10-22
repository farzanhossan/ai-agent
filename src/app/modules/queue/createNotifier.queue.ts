import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { CREATE_NOTIFIER_QUEUE, CREATE_NOTIFIER_QUEUE_PROCESSOR } from './constants';

@Injectable()
export class CreateNotifierQueue {
    constructor(@InjectQueue(CREATE_NOTIFIER_QUEUE) private readonly notifierCreateQueue: Queue) { }

    async addJob(data: any) {
        const uuid = await uuidv4();
        const jobId = `${uuid}-${new Date().getTime()}`;
        await this.notifierCreateQueue.add(CREATE_NOTIFIER_QUEUE_PROCESSOR, data, {
            jobId: jobId,
            attempts: 3, // Retry failed jobs up to 3 times
            removeOnComplete: true,
        });
        return { message: 'Added to notifier create Queue' };
    }
}
