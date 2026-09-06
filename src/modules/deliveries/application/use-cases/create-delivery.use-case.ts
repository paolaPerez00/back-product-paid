import { Inject, Injectable } from '@nestjs/common';
import { DELIVERY_REPOSITORY, DeliveryRepositoryPort } from '../../domain/ports/delivery.repository.port';
import { Delivery } from '../../domain/entities/delivery.entity';

export interface CreateDeliveryCommand {
  transactionId: string;
  customerId: string;
  address: string;
  city: string;
}

@Injectable()
export class CreateDeliveryUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY) private readonly deliveryRepository: DeliveryRepositoryPort,
  ) { }

  async execute(command: CreateDeliveryCommand): Promise<void> {
    const delivery = Delivery.create(command);
    delivery.assign();
    await this.deliveryRepository.save(delivery);
  }
}
