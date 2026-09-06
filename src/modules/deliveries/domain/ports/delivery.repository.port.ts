import { Delivery } from '../entities/delivery.entity';

export const DELIVERY_REPOSITORY = Symbol('DELIVERY_REPOSITORY');

export interface DeliveryRepositoryPort {
  save(delivery: Delivery): Promise<void>;
  findByTransactionId(transactionId: string): Promise<Delivery | null>;
}
