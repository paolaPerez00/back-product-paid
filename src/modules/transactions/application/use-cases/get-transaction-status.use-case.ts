import { Inject, Injectable } from '@nestjs/common';
import { TRANSACTION_REPOSITORY, TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionNotFoundError } from '../../../../shared/errors/domain.error';

@Injectable()
export class GetTransactionStatusUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactionRepository: TransactionRepositoryPort,
  ) { }

  async execute(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new TransactionNotFoundError(transactionId);
    }
    return transaction;
  }
}
