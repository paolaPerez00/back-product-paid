import { Inject, Injectable } from '@nestjs/common';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { CustomerRepositoryPort } from '../../domain/ports/customer.repository.port';
import { Customer } from '../../domain/entities/customer.entity';
import { DYNAMO_DOCUMENT_CLIENT } from '../../../../shared/dynamodb/dynamodb.provider';
import { Keys, TABLE_NAME } from '../../../../shared/dynamodb/table.keys';

@Injectable()
export class DynamoDbCustomerRepository implements CustomerRepositoryPort {
  constructor(
    @Inject(DYNAMO_DOCUMENT_CLIENT) private readonly client: DynamoDBDocumentClient,
  ) { }

  async findById(id: string): Promise<Customer | null> {
    const result = await this.client.send(
      new GetCommand({ TableName: TABLE_NAME, Key: Keys.customer(id) }),
    );
    if (!result.Item) return null;
    return Customer.fromPersistence(result.Item as any);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :pk',
        ExpressionAttributeValues: { ':pk': `CUSTOMER_EMAIL#${email}` },
      }),
    );
    const item = result.Items?.[0];
    if (!item) return null;
    return Customer.fromPersistence(item as any);
  }

  async save(customer: Customer): Promise<void> {
    const props = customer.toPersistence();
    await this.client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...Keys.customer(props.id),
          ...props,
          GSI2PK: `CUSTOMER_EMAIL#${props.email}`,
        },
      }),
    );
  }
}
