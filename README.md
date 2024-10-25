# NestJS Queue API

## Overview
This project is a NestJS API that allows you to publish and subscribe to messages on a queue. The queue provider can be either AWS SQS or RabbitMQ, and the choice of the provider is configurable via environment variables. The application is containerized using Docker for easy setup and running.

## Prerequisites
- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/en/) (if running locally without Docker)
- AWS CLI (optional, for manual queue management in Localstack)

## Getting Started

### Step 1: Clone the Repository
```bash
https://github.com/yourusername/nestjs-queue-api.git
cd nestjs-queue-api
```

### Step 2: Set Up Environment Variables
Create a `.env` file in the root directory of the project with the following content:
```env
QUEUE_PROVIDER=SQS # or RABBITMQ or both
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_ENDPOINT_URL=http://localstack:4566
RABBITMQ_URL=amqp://rabbitmq:5672
SQS_QUEUE_URL=http://sqs.eu-west-1.localhost.localstack.cloud:4566/000000000000/test-queue
```

### Step 3: Build and Run with Docker Compose
To build and run the entire environment, use Docker Compose:
```bash
docker-compose up --build
```
This command will spin up the following services:
- Localstack (mock AWS services)
- RabbitMQ (for message queues)
- The NestJS API application

### Step 4: Create the Queue in Localstack
Before publishing messages to SQS, create the queue in Localstack:
```bash
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name test-queue
```
This will create a queue named `test-queue` which can be used by the application.

## Usage

### Publish a Message
You can publish a message to a queue using the following command:
```bash
curl -X POST http://localhost:3000/queue/publish/test-queue -H "Content-Type: application/json" -d '{"message": "Hello, this is a test message"}'
```

**Expected Result**: The message should be successfully published to the `test-queue`. You should see logs in the console indicating that the message was published, such as:
```
Publishing message to queue: test-queue
Message published successfully to queue: test-queue
```
If there is an error, check the console logs for details on what went wrong.

### Subscribe to a Queue
You can subscribe to the queue to receive messages using:
```bash
curl -X POST http://localhost:3000/queue/subscribe/test-queue
```

**Expected Result**: The API will start consuming messages from the specified queue. If there are messages available, you should see logs like:
```
Subscribing to queue: test-queue
Received message: Hello, this is a test message
Subscribed to queue: test-queue
```
If no messages are present, the subscribe command may appear idle, waiting for new messages to arrive.

## Running Tests

### Step 1: Install Dependencies
Before running tests, make sure the dependencies are installed:
```bash
npm install
```

### Step 2: Run Unit and Integration Tests
To run all the tests for the application:
```bash
npm run test
```
This command will run both unit and integration tests, verifying that the service interacts correctly with both SQS and RabbitMQ.

## Manual Testing Summary
1. **Create Queue**: Use the AWS CLI to create a queue in Localstack. This step ensures that the queue (`test-queue`) exists before you start publishing messages. Command:
   ```bash
   aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name test-queue
   ```
   **Expected Result**: You should see a confirmation with the queue URL. Ensure that this URL matches the `SQS_QUEUE_URL` in your `.env` file.

2. **Publish Message**: Use the following `curl` command to publish a message to the queue:
   ```bash
   curl -X POST http://localhost:3000/queue/publish/test-queue -H "Content-Type: application/json" -d '{"message": "Hello, this is a test message"}'
   ```
   **Expected Result**: The message should be successfully published to the queue. Check the application logs to confirm that the message has been published. You should see messages indicating that the message was processed.

3. **Subscribe to Queue**: Use the following `curl` command to subscribe to the queue and receive messages:
   ```bash
   curl -X POST http://localhost:3000/queue/subscribe/test-queue
   ```
   **Expected Result**: The application should consume messages from the queue. You should see the message content printed in the application logs, confirming that the subscription was successful.

   **Note**: If no messages are in the queue, the subscription may not return anything immediately. You can publish another message and then see it being consumed.

## Manual Testing for RabbitMQ

1. **Publish Message to RabbitMQ**: Use the following `curl` command to publish a message to RabbitMQ:
   ```bash
   curl -X POST http://localhost:3000/queue/publish/test-queue -H "Content-Type: application/json" -d '{"message": "Hello, this is a test message for RabbitMQ"}'
   ```
   **Expected Result**: The message should be successfully published to the RabbitMQ queue (`test-queue`). You should see logs in the console indicating that the message was published, such as:
   ```
   Publishing message to queue: test-queue
   Message published successfully to queue: test-queue
   ```
   If there is an error, check the console logs for details on what went wrong.

2. **Subscribe to RabbitMQ Queue**: Use the following `curl` command to subscribe to the RabbitMQ queue and receive messages:
   ```bash
   curl -X POST http://localhost:3000/queue/subscribe/test-queue
   ```
   **Expected Result**: The application should consume messages from the RabbitMQ queue. You should see the message content printed in the application logs, confirming that the subscription was successful.
   ```
   Subscribing to queue: test-queue
   Received message: Hello, this is a test message for RabbitMQ
   Subscribed to queue: test-queue
   ```
   **Note**: If no messages are in the queue, the subscription may not return anything immediately. You can publish another message and then see it being consumed.

## Localstack UI (Optional)
If you have Localstack Pro, you can enable the UI by adding the following to your `docker-compose.yml`:
```yaml
environment:
  - LOCALSTACK_API_KEY=<your_localstack_api_key>
  - LOCALSTACK_UI=1
ports:
  - '8080:8080' # Localstack UI port
```
After starting the containers, you can access the UI at [http://localhost:8080](http://localhost:8080).

## Troubleshooting
- **Queue Does Not Exist**: Make sure the queue is created in Localstack before attempting to publish messages.
- **Connection Refused**: Ensure that your `.env` file is properly set up and that Docker Compose is up and running.

