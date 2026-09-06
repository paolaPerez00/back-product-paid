import { Inject, Injectable, Logger } from '@nestjs/common';
import { TRANSACTION_REPOSITORY, TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { PAYMENT_GATEWAY, PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';
import { CreateDeliveryUseCase } from '../../../deliveries/application/use-cases/create-delivery.use-case';
import { FINAL_STATUSES } from '../../domain/entities/transaction-status.enum';
import { ReleaseStockUseCase } from 'modules/products/application/release-stock.use-case';

@Injectable()
export class HandlePaymentWebhookUseCase {
  private readonly logger = new Logger(HandlePaymentWebhookUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGatewayPort,
    private readonly releaseStockUseCase: ReleaseStockUseCase,
    private readonly createDeliveryUseCase: CreateDeliveryUseCase,
  ) { }

  async execute(payload: Record<string, any>, signatureHeader: string): Promise<void> {
    if (!this.paymentGateway.verifyWebhookSignature(payload, signatureHeader)) {
      this.logger.warn('Firma de webhook de Wompi inválida — evento descartado');
      return;
    }

    const wompiTransactionId = payload?.data?.transaction?.id;
    const wompiStatus = payload?.data?.transaction?.status;
    if (!wompiTransactionId) return;

    const transaction = await this.transactionRepository.findByWompiTransactionId(wompiTransactionId);
    if (!transaction) {
      this.logger.warn(`Webhook recibido para wompiTransactionId desconocido: ${wompiTransactionId}`);
      return;
    }
    if (FINAL_STATUSES.includes(transaction.status)) return;

    if (wompiStatus === 'APPROVED') {
      transaction.markApproved({
        wompiTransactionId,
        cardLast4: payload?.data?.transaction?.payment_method?.extra?.last_four ?? '0000',
        cardFranchise: 'UNKNOWN',
      });
      await this.transactionRepository.save(transaction);
      await this.createDeliveryUseCase.execute({
        transactionId: transaction.id,
        customerId: transaction.customerId,
        address: '',
        city: '',
      });
    } else if (wompiStatus === 'DECLINED') {
      transaction.markDeclined(wompiTransactionId);
      await this.transactionRepository.save(transaction);
      await this.releaseStockUseCase.execute(transaction.productId, transaction.quantity);
    }
  }
}
