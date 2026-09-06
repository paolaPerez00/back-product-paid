import { Inject, Injectable } from '@nestjs/common';
import { ProductNotFoundError } from 'shared/errors/domain.error';
import { PRODUCT_REPOSITORY, ProductRepositoryPort } from '../domain/ports/product.repository.port';

@Injectable()
export class ReserveStockUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepositoryPort,
  ) { }

  async execute(productId: string, quantity: number): Promise<{ unitPriceInCents: number }> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new ProductNotFoundError(productId);
    }
    await this.productRepository.reserveStock(productId, quantity);

    return { unitPriceInCents: product.priceInCents };
  }
}
