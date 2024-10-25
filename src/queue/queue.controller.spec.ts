import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import * as request from 'supertest';
import {AppModule} from '../app.module';
import * as amqplib from 'amqplib';
import {SQSClient, CreateQueueCommand} from '@aws-sdk/client-sqs';

// Controller Tests for RabbitMQ
describe('QueueController with RabbitMqService (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        process.env.QUEUE_PROVIDER = 'RABBITMQ';
        process.env.RABBITMQ_URL = 'amqp://localhost:5672';

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Ensure RabbitMQ queue exists
        const connection = await amqplib.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue('test-queue');
        await channel.close();
        await connection.close();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/queue/publish/:queue (POST)', () => {
        return request(app.getHttpServer())
            .post('/queue/publish/test-queue?provider=rabbitmq')
            .send({ message: 'Hello World' })
            .expect(201);
    });

    it('/queue/subscribe/:queue (POST)', () => {
        return request(app.getHttpServer())
            .post('/queue/subscribe/test-queue?provider=rabbitmq')
            .expect(201);
    });
});

// Controller Tests for SQS
describe('QueueController with SqsService (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        process.env.QUEUE_PROVIDER = 'SQS';
        process.env.SQS_QUEUE_URL = 'http://localhost:4566/000000000000/test-queue';
        process.env.AWS_REGION = 'us-east-1';
        process.env.AWS_ACCESS_KEY_ID = 'test';
        process.env.AWS_SECRET_ACCESS_KEY = 'test';
        process.env.AWS_ENDPOINT_URL = 'http://localhost:4566';

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Ensure SQS queue exists in Localstack
        const sqsClient = new SQSClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
            endpoint: process.env.AWS_ENDPOINT_URL,
        });
        const createQueueCommand = new CreateQueueCommand({ QueueName: 'test-queue' });
        await sqsClient.send(createQueueCommand);
    });

    afterAll(async () => {
        await app.close();
    });

    it('/queue/publish/:queue (POST)', () => {
        return request(app.getHttpServer())
            .post('/queue/publish/test-queue?provider=sqs')
            .send({ message: 'Hello World' })
            .expect(201);
    });

    it('/queue/subscribe/:queue (POST)', () => {
        return request(app.getHttpServer())
            .post('/queue/subscribe/test-queue?provider=sqs')
            .expect(201);
    });
});
