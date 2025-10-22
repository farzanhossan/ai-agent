import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotifierService } from '../notifier/services/notifier.service';
import { CREATE_NOTIFIER_QUEUE } from './constants';

@Processor(CREATE_NOTIFIER_QUEUE)
export class CreateNotifierQueueProcessor extends WorkerHost {
    constructor(
        private readonly notifierService: NotifierService,
    ) { super(); }

    async process(job: Job<any>) {
        console.log(`Processing job ${job.name} with data:`, { type: job.data.data.type, content: job.data.data.content });
        try {
            const { data, roleBased, roles } = job?.data;
            await this.notifierService.createNotifications(data, roleBased, roles);
            return { status: 'ok' };
        } catch (error) {
            console.log('🚀😬 ~ CreateNotifierWorker ~ process ~ error:', error);
        }
    }

    @OnWorkerEvent('completed')
    onComplete(job: Job) {
        console.log(`✅ Job ${job.id} completed successfully.`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        console.log(`❌ Job ${job.id} failed:`, error.message);
    }
}
