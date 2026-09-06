import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CUSTOMER_REPOSITORY, CustomerRepositoryPort } from '../../domain/ports/customer.repository.port';
import { Customer } from '../../domain/entities/customer.entity';

export interface CreateOrFindCustomerCommand {
  fullName: string;
  email: string;
  phone: string;
  docType: 'CC' | 'CE' | 'NIT' | 'PASSPORT';
  docNumber: string;
}

@Injectable()
export class CreateOrFindCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: CustomerRepositoryPort,
  ) { }

  async execute(command: CreateOrFindCustomerCommand): Promise<Customer> {
    const existing = await this.customerRepository.findByEmail(command.email);
    if (existing) return existing;

    const customer = Customer.fromPersistence({ id: randomUUID(), ...command });
    await this.customerRepository.save(customer);
    return customer;
  }
}
