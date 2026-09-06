import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TRANSACTION_REPOSITORY, TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { CreateOrFindCustomerUseCase } from '../../../customers/application/use-cases/create-or-find-customer.use-case';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { ReserveStockUseCase } from 'modules/products/application/reserve-stock.use-case';

const BASE_FEE_IN_CENTS = 500000;
const DELIVERY_FEE_IN_CENTS = 800000;

@Injectable()
export class CreatePendingTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactionRepository: TransactionRepositoryPort,
    private readonly createOrFindCustomerUseCase: CreateOrFindCustomerUseCase,
    private readonly reserveStockUseCase: ReserveStockUseCase,
  ) { }

  async execute(dto: CreateTransactionDto): Promise<Transaction> {
    const customer = await this.createOrFindCustomerUseCase.execute({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      docType: dto.docType,
      docNumber: dto.docNumber,
    });

    const { unitPriceInCents } = await this.reserveStockUseCase.execute(dto.productId, dto.quantity);

    const transaction = Transaction.createPending({
      customerId: customer.id,
      productId: dto.productId,
      quantity: dto.quantity,
      unitPriceInCents,
      baseFeeInCents: BASE_FEE_IN_CENTS,
      deliveryFeeInCents: DELIVERY_FEE_IN_CENTS,
    });

    await this.transactionRepository.save(transaction);
    return transaction;
  }
}
