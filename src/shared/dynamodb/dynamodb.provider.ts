import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Provider } from '@nestjs/common';

export const DYNAMO_DOCUMENT_CLIENT = Symbol('DYNAMO_DOCUMENT_CLIENT');

export const dynamoDocumentClientProvider: Provider = {
  provide: DYNAMO_DOCUMENT_CLIENT,
  useFactory: () => {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION ?? 'us-east-1',
      ...(process.env.DYNAMODB_ENDPOINT
        ? { endpoint: process.env.DYNAMODB_ENDPOINT }
        : {}),
    });

    return DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true },
    });
  },
};
