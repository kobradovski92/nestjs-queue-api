#!/bin/bash

# Wait for Localstack to be ready
echo "Waiting for Localstack to start..."
sleep 30

# Create the SQS queue
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name test-queue
