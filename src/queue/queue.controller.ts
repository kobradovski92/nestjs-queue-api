import { Controller, Post, Body, Param, Query, Logger } from '@nestjs/common';
import { QueueService } from './queue.service';

@Controller('queue')
export class QueueController {
    private readonly logger = new Logger(QueueController.name);

    constructor(private readonly queueService: QueueService) {}

    @Post('publish/:queue')
    async publish(
        @Param('queue') queue: string,
        @Body('message') message: string,
        @Query('provider') provider: string
    ) {
        this.logger.log(`Publishing message to queue: ${queue} using provider: ${provider}`);
        await this.queueService.publish(message, queue, provider);
        this.logger.log(`Message published successfully to queue: ${queue} using provider: ${provider}`);
    }

    @Post('subscribe/:queue')
    async subscribe(
        @Param('queue') queue: string,
        @Query('provider') provider: string
    ) {
        this.logger.log(`Subscribing to queue: ${queue} using provider: ${provider}`);
        await this.queueService.subscribe(queue, provider);
        this.logger.log(`Subscribed to queue: ${queue} using provider: ${provider}`);
    }
}
