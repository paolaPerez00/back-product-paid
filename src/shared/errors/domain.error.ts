export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class InsufficientStockError extends DomainError {
  constructor(productId: string) {
    super(`No hay stock suficiente para el producto ${productId}`);
    this.name = 'InsufficientStockError';
  }
}

export class TransactionNotFoundError extends DomainError {
  constructor(transactionId: string) {
    super(`No existe la transacción ${transactionId}`);
    this.name = 'TransactionNotFoundError';
  }
}

export class TransactionNotPayableError extends DomainError {
  constructor(transactionId: string, currentStatus: string) {
    super(`La transacción ${transactionId} ya está en estado ${currentStatus} y no puede volver a pagarse`);
    this.name = 'TransactionNotPayableError';
  }
}

export class PaymentGatewayError extends DomainError {
  constructor(message: string) {
    super(`Error al comunicarse con la pasarela de pago: ${message}`);
    this.name = 'PaymentGatewayError';
  }
}

export class ProductNotFoundError extends DomainError {
  constructor(productId: string) {
    super(`No existe el producto ${productId}`);
    this.name = 'ProductNotFoundError';
  }
}
