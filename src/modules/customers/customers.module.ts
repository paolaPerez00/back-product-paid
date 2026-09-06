import { Module } from '@nestjs/common';
import { CUSTOMER_REPOSITORY } from './domain/ports/customer.repository.port';
import { DynamoDbCustomerRepository } from './infrastructure/adapters/dynamodb-customer.repository';
import { CreateOrFindCustomerUseCase } from './application/use-cases/create-or-find-customer.use-case';
import { CustomersController } from './infrastructure/controllers/customers.controller';

@Module({
  controllers: [CustomersController],
  providers: [
    { provide: CUSTOMER_REPOSITORY, useClass: DynamoDbCustomerRepository },
    CreateOrFindCustomerUseCase,
  ],
  exports: [CreateOrFindCustomerUseCase],
})
export class CustomersModule {}
