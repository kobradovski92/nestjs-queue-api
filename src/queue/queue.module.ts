import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { SqsService } from './sqs.service';
import { RabbitMqService } from './rabbitmq.service';

@Module({
    providers: [
        QueueService,
        SqsService,
        RabbitMqService,
    ],
    exports: [QueueService, SqsService, RabbitMqService],
})
export class QueueModule {}
