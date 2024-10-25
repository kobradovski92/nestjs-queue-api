import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { SqsService } from './sqs.service';
import { RabbitMqService } from './rabbitmq.service';
import { mockClient } from 'aws-sdk-client-mock';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand } from '@aws-sdk/client-sqs';

// Tests for SQS Implementation
describe('QueueService with SqsService', () => {
    let service: QueueService;
    const sqsMock = mockClient(SQSClient);

    beforeEach(async () => {
        process.env.AWS_REGION = 'us-east-1';

        sqsMock.reset();
        sqsMock.on(SendMessageCommand).resolves({});
        sqsMock.on(ReceiveMessageCommand).resolves({
            Messages: [
                {
                    MessageId: '12345',
                    ReceiptHandle: 'ABC123',
                    MD5OfBody: 'abcd1234',
                    Body: 'Mocked message'
                }
            ],
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QueueService,
                SqsService,
                {
                    provide: RabbitMqService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<QueueService>(QueueService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should publish message', async () => {
        await expect(service.publish('test-message', 'test-queue', 'sqs')).resolves.not.toThrow();
    });

    it('should subscribe to message', async () => {
        await expect(service.subscribe('test-queue', 'sqs')).resolves.not.toThrow();
    });
});

// Tests for RabbitMQ Implementation
describe('QueueService with RabbitMqService', () => {
    let service: QueueService;
    let rabbitMqService: RabbitMqService;

    beforeEach(async () => {
        rabbitMqService = new RabbitMqService();
        jest.spyOn(rabbitMqService, 'init').mockImplementation(async () => {
            console.log('RabbitMQ connection mocked as initialized');
        });
        jest.spyOn(rabbitMqService, 'publish').mockResolvedValue(undefined);
        jest.spyOn(rabbitMqService, 'subscribe').mockResolvedValue(undefined);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QueueService,
                RabbitMqService,
                {
                    provide: SqsService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<QueueService>(QueueService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should publish message', async () => {
        await expect(service.publish('test-message', 'test-queue', 'rabbitmq')).resolves.not.toThrow();
    });

    it('should subscribe to message', async () => {
        await expect(service.subscribe('test-queue', 'rabbitmq')).resolves.not.toThrow();
    });
});
