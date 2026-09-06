import { Inject, Injectable } from '@nestjs/common';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { Product } from '../../domain/entities/product.entity';
import { DYNAMO_DOCUMENT_CLIENT } from '../../../../shared/dynamodb/dynamodb.provider';
import { Keys, TABLE_NAME } from '../../../../shared/dynamodb/table.keys';
import { InsufficientStockError } from '../../../../shared/errors/domain.error';

@Injectable()
export class DynamoDbProductRepository implements ProductRepositoryPort {
  constructor(
    @Inject(DYNAMO_DOCUMENT_CLIENT) private readonly client: DynamoDBDocumentClient,
  ) { }

  async findAll(): Promise<Product[]> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: { ':pk': 'PRODUCT_CATALOG' },
      }),
    );

    return (result.Items ?? []).map((item) =>
      Product.fromPersistence({
        id: item.id,
        name: item.name,
        description: item.description,
        priceInCents: item.priceInCents,
        stock: item.stock,
        imageUrl: item.imageUrl,
      }),
    );
  }

  async findById(id: string): Promise<Product | null> {
    const result = await this.client.send(
      new GetCommand({ TableName: TABLE_NAME, Key: Keys.product(id) }),
    );

    if (!result.Item) return null;

    return Product.fromPersistence({
      id: result.Item.id,
      name: result.Item.name,
      description: result.Item.description,
      priceInCents: result.Item.priceInCents,
      stock: result.Item.stock,
      imageUrl: result.Item.imageUrl,
    });
  }

  async reserveStock(productId: string, quantity: number): Promise<void> {
    try {
      await this.client.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: Keys.product(productId),
          UpdateExpression: 'SET stock = stock - :qty',
          ConditionExpression: 'stock >= :qty',
          ExpressionAttributeValues: { ':qty': quantity },
        }),
      );
    } catch (err) {
      if (err instanceof ConditionalCheckFailedException) {
        throw new InsufficientStockError(productId);
      }
      throw err;
    }
  }

  async releaseStock(productId: string, quantity: number): Promise<void> {
    await this.client.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: Keys.product(productId),
        UpdateExpression: 'SET stock = stock + :qty',
        ExpressionAttributeValues: { ':qty': quantity },
      }),
    );
  }
}
