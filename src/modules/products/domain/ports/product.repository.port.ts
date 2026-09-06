import { Product } from '../entities/product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductRepositoryPort {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  reserveStock(productId: string, quantity: number): Promise<void>;
  releaseStock(productId: string, quantity: number): Promise<void>;
}
