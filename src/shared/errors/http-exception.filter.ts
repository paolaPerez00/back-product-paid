import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import {
  DomainError,
  InsufficientStockError,
  TransactionNotFoundError,
  TransactionNotPayableError,
  ProductNotFoundError,
  PaymentGatewayError,
} from './domain.error';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusMap: Array<[new (...args: any[]) => DomainError, number]> = [
      [InsufficientStockError, HttpStatus.CONFLICT],
      [TransactionNotFoundError, HttpStatus.NOT_FOUND],
      [ProductNotFoundError, HttpStatus.NOT_FOUND],
      [TransactionNotPayableError, HttpStatus.CONFLICT],
      [PaymentGatewayError, HttpStatus.BAD_GATEWAY],
    ];

    const match = statusMap.find(([type]) => exception instanceof type);
    const status = match ? match[1] : HttpStatus.BAD_REQUEST;

    this.logger.warn(`${exception.name}: ${exception.message}`);
    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }
}
