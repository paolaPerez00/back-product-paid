import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetProductsUseCase } from 'modules/products/application/get-products.use-case';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly getProductsUseCase: GetProductsUseCase) { }

  @Get()
  @ApiOkResponse({ description: 'Catálogo de productos con stock disponible' })
  async findAll() {
    const products = await this.getProductsUseCase.execute();
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      priceInCents: p.priceInCents,
      stock: p.stock,
      imageUrl: p.imageUrl,
    }));
  }
}
