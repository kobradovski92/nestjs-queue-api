import { Module } from '@nestjs/common';
import { QueueModule } from './queue/queue.module';
import { QueueController } from './queue/queue.controller';
import { QueueService } from './queue/queue.service';
import { RabbitMqService } from './queue/rabbitmq.service';

@Module({
  imports: [QueueModule],
  controllers: [QueueController],
  providers: [QueueService, RabbitMqService],
})
export class AppModule {}