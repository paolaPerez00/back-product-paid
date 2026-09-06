import { Inject, Injectable } from '@nestjs/common';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { Transaction } from '../../domain/entities/transaction.entity';
import { DYNAMO_DOCUMENT_CLIENT } from '../../../../shared/dynamodb/dynamodb.provider';
import { Keys, TABLE_NAME } from '../../../../shared/dynamodb/table.keys';

@Injectable()
export class DynamoDbTransactionRepository implements TransactionRepositoryPort {
  constructor(
    @Inject(DYNAMO_DOCUMENT_CLIENT) private readonly client: DynamoDBDocumentClient,
  ) {}

  async save(transaction: Transaction): Promise<void> {
    const props = transaction.toPersistence();
    await this.client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...Keys.transaction(props.id),
          ...props,
          // GSI1 permite listar por estado (soporte/reconciliación de pendientes).
          GSI1PK: `STATUS#${props.status}`,
          GSI1SK: props.createdAt,
          // GSI2 permite resolver rápido el webhook de Wompi por su transaction id.
          ...(props.wompiTransactionId
            ? { GSI2PK: `WOMPI#${props.wompiTransactionId}` }
            : {}),
        },
      }),
    );
  }

  async findById(id: string): Promise<Transaction | null> {
    const result = await this.client.send(
      new GetCommand({ TableName: TABLE_NAME, Key: Keys.transaction(id) }),
    );
    if (!result.Item) return null;
    return this.toDomain(result.Item);
  }

  async findByWompiTransactionId(wompiTransactionId: string): Promise<Transaction | null> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :pk',
        ExpressionAttributeValues: { ':pk': `WOMPI#${wompiTransactionId}` },
      }),
    );
    const item = result.Items?.[0];
    if (!item) return null;
    return this.toDomain(item);
  }

  private toDomain(item: Record<string, any>): Transaction {
    return Transaction.fromPersistence({
      id: item.id,
      customerId: item.customerId,
      productId: item.productId,
      quantity: item.quantity,
      unitPriceInCents: item.unitPriceInCents,
      baseFeeInCents: item.baseFeeInCents,
      deliveryFeeInCents: item.deliveryFeeInCents,
      status: item.status,
      wompiTransactionId: item.wompiTransactionId,
      cardLast4: item.cardLast4,
      cardFranchise: item.cardFranchise,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }
}
