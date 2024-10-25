import { Injectable, Inject, Optional } from '@nestjs/common';
import {SqsService} from "./sqs.service";
import {RabbitMqService} from "./rabbitmq.service";

@Injectable()
export class QueueService {
    constructor(
        @Optional() private readonly sqsService?: SqsService,
        @Optional() private readonly rabbitMqService?: RabbitMqService,
    ) {}

    async publish(message: string, queue: string, provider: string): Promise<void> {
        if (provider === 'sqs' && this.sqsService) {
            await this.sqsService.publish(message, queue);
        } else if (provider === 'rabbitmq' && this.rabbitMqService) {
            await this.rabbitMqService.publish(message, queue);
        } else {
            throw new Error(`Queue provider ${provider} is not available`);
        }
    }

    async subscribe(queue: string, provider: string): Promise<void> {
        if (provider === 'sqs' && this.sqsService) {
            await this.sqsService.subscribe(queue);
        } else if (provider === 'rabbitmq' && this.rabbitMqService) {
            await this.rabbitMqService.subscribe(queue);
        } else {
            throw new Error(`Queue provider ${provider} is not available`);
        }
    }
}
