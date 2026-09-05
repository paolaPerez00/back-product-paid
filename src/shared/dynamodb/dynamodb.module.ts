import { Global, Module } from '@nestjs/common';
import { dynamoDocumentClientProvider } from './dynamodb.provider';

@Global()
@Module({
  providers: [dynamoDocumentClientProvider],
  exports: [dynamoDocumentClientProvider],
})
export class DynamodbModule {}
