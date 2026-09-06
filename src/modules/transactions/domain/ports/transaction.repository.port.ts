import { Transaction } from '../entities/transaction.entity';

/**
 * Puerto de salida (driven port). La capa de aplicación depende SOLO de esta
 * interfaz. El adapter concreto (DynamoDB, Postgres, memoria para tests...)
 * vive en infrastructure/adapters y se inyecta vía este token.
 */
export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export interface TransactionRepositoryPort {
  save(transaction: Transaction): Promise<void>;
  findById(id: string): Promise<Transaction | null>;
  findByWompiTransactionId(wompiTransactionId: string): Promise<Transaction | null>;
}
