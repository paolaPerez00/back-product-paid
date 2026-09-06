import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrFindCustomerUseCase } from '../../application/use-cases/create-or-find-customer.use-case';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly createOrFindCustomerUseCase: CreateOrFindCustomerUseCase) {}

  @Post()
  async create(@Body() body: { fullName: string; email: string; phone: string; docType: 'CC' | 'CE' | 'NIT' | 'PASSPORT'; docNumber: string }) {
    const customer = await this.createOrFindCustomerUseCase.execute(body);
    return { id: customer.id, email: customer.email };
  }
}
