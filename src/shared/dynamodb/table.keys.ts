export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME ?? 'PaymentServiceTable';

export const Keys = {
  product: (id: string) => ({ PK: `PRODUCT#${id}`, SK: 'METADATA' }),
  customer: (id: string) => ({ PK: `CUSTOMER#${id}`, SK: 'METADATA' }),
  transaction: (id: string) => ({ PK: `TRANSACTION#${id}`, SK: 'METADATA' }),
  delivery: (transactionId: string) => ({ PK: `TRANSACTION#${transactionId}`, SK: 'DELIVERY' }),
};
