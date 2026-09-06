import { Module } from '@nestjs/common';
import { DELIVERY_REPOSITORY } from './domain/ports/delivery.repository.port';
import { DynamoDbDeliveryRepository } from './infrastructure/adapters/dynamodb-delivery.repository';
import { CreateDeliveryUseCase } from './application/use-cases/create-delivery.use-case';

@Module({
  providers: [
    { provide: DELIVERY_REPOSITORY, useClass: DynamoDbDeliveryRepository },
    CreateDeliveryUseCase,
  ],
  exports: [CreateDeliveryUseCase],
})
export class DeliveriesModule {}
