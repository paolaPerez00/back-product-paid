import { Inject, Injectable } from '@nestjs/common';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DeliveryRepositoryPort } from '../../domain/ports/delivery.repository.port';
import { Delivery } from '../../domain/entities/delivery.entity';
import { DYNAMO_DOCUMENT_CLIENT } from '../../../../shared/dynamodb/dynamodb.provider';
import { Keys, TABLE_NAME } from '../../../../shared/dynamodb/table.keys';

@Injectable()
export class DynamoDbDeliveryRepository implements DeliveryRepositoryPort {
  constructor(
    @Inject(DYNAMO_DOCUMENT_CLIENT) private readonly client: DynamoDBDocumentClient,
  ) {}

  async save(delivery: Delivery): Promise<void> {
    const props = delivery.toPersistence();
    await this.client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...Keys.delivery(props.transactionId), ...props },
      }),
    );
  }

  async findByTransactionId(transactionId: string): Promise<Delivery | null> {
    const result = await this.client.send(
      new GetCommand({ TableName: TABLE_NAME, Key: Keys.delivery(transactionId) }),
    );
    if (!result.Item) return null;
    return Delivery.fromPersistence(result.Item as any);
  }
}
