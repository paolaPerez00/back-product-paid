import { Module } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from './domain/ports/product.repository.port';
import { DynamoDbProductRepository } from './infrastructure/adapters/dynamodb-product.repository';
import { ProductsController } from './infrastructure/controllers/products.controller';
import { GetProductsUseCase } from './application/get-products.use-case';
import { ReserveStockUseCase } from './application/reserve-stock.use-case';
import { ReleaseStockUseCase } from './application/release-stock.use-case';

@Module({
  controllers: [ProductsController],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: DynamoDbProductRepository },
    GetProductsUseCase,
    ReserveStockUseCase,
    ReleaseStockUseCase,
  ],
  exports: [ReserveStockUseCase, ReleaseStockUseCase],
})
export class ProductsModule { }
