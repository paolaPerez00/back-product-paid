import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreatePendingTransactionUseCase } from '../../application/use-cases/create-pending-transaction.use-case';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.use-case';
import { GetTransactionStatusUseCase } from '../../application/use-cases/get-transaction-status.use-case';
import { CreateTransactionDto } from '../../application/dto/create-transaction.dto';
import { PayTransactionDto } from '../../application/dto/pay-transaction.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createPendingTransactionUseCase: CreatePendingTransactionUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly getTransactionStatusUseCase: GetTransactionStatusUseCase,
  ) {}

  /** Paso 5.1 del reto: crea la transacción PENDING y reserva stock. */
  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    const transaction = await this.createPendingTransactionUseCase.execute(dto);
    return {
      transactionId: transaction.id,
      status: transaction.status,
      totalAmountInCents: transaction.totalAmountInCents,
    };
  }

  /** Paso 5.2 y 5.3 del reto: llama a Wompi y resuelve el resultado. */
  @Post(':id/pay')
  async pay(
    @Param('id') id: string,
    @Body() body: PayTransactionDto & { address: string; city: string },
  ) {
    return this.processPaymentUseCase.execute(
      id,
      { cardToken: body.cardToken, cardLast4: body.cardLast4, cardFranchise: body.cardFranchise },
      { address: body.address, city: body.city },
    );
  }

  /** Usado por la pantalla de resultado y para recuperar progreso tras un refresh. */
  @Get(':id')
  @ApiOkResponse({ description: 'Estado actual de la transacción' })
  async getStatus(@Param('id') id: string) {
    const transaction = await this.getTransactionStatusUseCase.execute(id);
    return {
      transactionId: transaction.id,
      status: transaction.status,
      totalAmountInCents: transaction.totalAmountInCents,
    };
  }
}
