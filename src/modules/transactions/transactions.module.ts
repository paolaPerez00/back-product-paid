import { Module } from '@nestjs/common';
import { TRANSACTION_REPOSITORY } from './domain/ports/transaction.repository.port';
import { PAYMENT_GATEWAY } from './domain/ports/payment-gateway.port';
import { DynamoDbTransactionRepository } from './infrastructure/adapters/dynamodb-transaction.repository';
import { WompiPaymentGatewayAdapter } from './infrastructure/adapters/wompi-payment-gateway.adapter';
import { CreatePendingTransactionUseCase } from './application/use-cases/create-pending-transaction.use-case';
import { ProcessPaymentUseCase } from './application/use-cases/process-payment.use-case';
import { GetTransactionStatusUseCase } from './application/use-cases/get-transaction-status.use-case';
import { HandlePaymentWebhookUseCase } from './application/use-cases/handle-payment-webhook.use-case';
import { TransactionsController } from './infrastructure/controllers/transactions.controller';
import { WompiWebhookController } from './infrastructure/controllers/wompi-webhook.controller';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';
import { DeliveriesModule } from '../deliveries/deliveries.module';

@Module({
  imports: [
    ProductsModule,
    CustomersModule,
    DeliveriesModule,
  ],
  controllers: [TransactionsController, WompiWebhookController],
  providers: [
    { provide: TRANSACTION_REPOSITORY, useClass: DynamoDbTransactionRepository },
    { provide: PAYMENT_GATEWAY, useClass: WompiPaymentGatewayAdapter },
    CreatePendingTransactionUseCase,
    ProcessPaymentUseCase,
    GetTransactionStatusUseCase,
    HandlePaymentWebhookUseCase,
  ],
})
export class TransactionsModule { }
