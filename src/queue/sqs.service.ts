import { Injectable } from '@nestjs/common';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand } from '@aws-sdk/client-sqs';

@Injectable()
export class SqsService {
    private readonly sqs = new SQSClient({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
        endpoint: process.env.AWS_ENDPOINT_URL,
    });

    async publish(message: string, queueUrl: string = process.env.SQS_QUEUE_URL): Promise<void> {
        const command = new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: message });
        await this.sqs.send(command);
    }

    async subscribe(queueUrl: string = process.env.SQS_QUEUE_URL): Promise<void> {
        const command = new ReceiveMessageCommand({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: 1,
        });
        const data = await this.sqs.send(command);
        if (data.Messages) {
            console.log('Received message:', data.Messages[0].Body);
        }
    }
}
