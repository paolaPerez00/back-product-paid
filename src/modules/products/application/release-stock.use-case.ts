import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_REPOSITORY, ProductRepositoryPort } from '../domain/ports/product.repository.port';

@Injectable()
export class ReleaseStockUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepositoryPort,
  ) { }

  async execute(productId: string, quantity: number): Promise<void> {
    await this.productRepository.releaseStock(productId, quantity);
  }
}
