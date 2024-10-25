import { Injectable } from '@nestjs/common';
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitMqService {
    private channel: amqplib.Channel | undefined;
    private readonly maxRetries = 5;
    private readonly retryDelay = 1000;

    async init(): Promise<void> {
        let retries = 0;

        while (retries < this.maxRetries) {
            try {
                const connection = await amqplib.connect(process.env.RABBITMQ_URL);
                this.channel = await connection.createChannel();
                console.log('RabbitMQ connection initialized');
                return;
            } catch (error) {
                retries++;
                console.error(`RabbitMQ connection attempt ${retries} failed:`, error);
                if (retries >= this.maxRetries) {
                    throw new Error('Failed to establish RabbitMQ connection after multiple attempts');
                }
                await this.delay(this.retryDelay);
            }
        }
    }

    async publish(message: string, queue: string): Promise<void> {
        await this.ensureChannel();
        await this.channel!.assertQueue(queue);
        this.channel!.sendToQueue(queue, Buffer.from(message));
    }

    async subscribe(queue: string): Promise<void> {
        await this.ensureChannel();
        await this.channel!.assertQueue(queue);
        this.channel!.consume(queue, (msg) => {
            if (msg !== null) {
                console.log('Received message:', msg.content.toString());
                this.channel!.ack(msg);
            }
        });
    }

    private async ensureChannel(): Promise<void> {
        if (!this.channel) {
            console.log('Channel not initialized, retrying...');
            await this.init();
        }
    }

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
