import { Inject, Injectable, Logger } from '@nestjs/common';
import { TRANSACTION_REPOSITORY, TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { PAYMENT_GATEWAY, PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';
import { CreateDeliveryUseCase } from '../../../deliveries/application/use-cases/create-delivery.use-case';
import { TransactionNotFoundError } from '../../../../shared/errors/domain.error';
import { PayTransactionDto } from '../dto/pay-transaction.dto';
import { ReleaseStockUseCase } from 'modules/products/application/release-stock.use-case';

export interface ProcessPaymentResult {
  transactionId: string;
  status: string;
  gatewayTransactionId?: string;
}

@Injectable()
export class ProcessPaymentUseCase {
  private readonly logger = new Logger(ProcessPaymentUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGatewayPort,
    private readonly releaseStockUseCase: ReleaseStockUseCase,
    private readonly createDeliveryUseCase: CreateDeliveryUseCase,
  ) { }

  async execute(transactionId: string, dto: PayTransactionDto, deliveryInfo: { address: string; city: string }): Promise<ProcessPaymentResult> {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new TransactionNotFoundError(transactionId);
    }
    transaction.assertCanBePaid();

    try {
      const result = await this.paymentGateway.chargeCard({
        reference: transaction.id,
        amountInCents: transaction.totalAmountInCents,
        currency: 'COP',
        cardToken: dto.cardToken,
        customerEmail: '',
      });

      if (result.status === 'APPROVED') {
        transaction.markApproved({
          wompiTransactionId: result.gatewayTransactionId,
          cardLast4: dto.cardLast4,
          cardFranchise: dto.cardFranchise,
        });
        await this.transactionRepository.save(transaction);

        await this.createDeliveryUseCase.execute({
          transactionId: transaction.id,
          customerId: transaction.customerId,
          address: deliveryInfo.address,
          city: deliveryInfo.city,
        });
      } else {
        transaction.markDeclined(result.gatewayTransactionId);
        await this.transactionRepository.save(transaction);
        await this.releaseStockUseCase.execute(transaction.productId, transaction.quantity);
      }

      return {
        transactionId: transaction.id,
        status: transaction.status,
        gatewayTransactionId: result.gatewayTransactionId,
      };
    } catch (err) {
      this.logger.error(`Error llamando a la pasarela de pago para tx ${transaction.id}`, err as Error);
      transaction.markError();
      await this.transactionRepository.save(transaction);
      await this.releaseStockUseCase.execute(transaction.productId, transaction.quantity);

      return { transactionId: transaction.id, status: transaction.status };
    }
  }
}
