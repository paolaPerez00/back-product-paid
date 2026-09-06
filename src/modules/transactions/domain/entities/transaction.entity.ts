import { randomUUID } from 'crypto';
import { TransactionStatus, PAYABLE_STATUSES } from './transaction-status.enum';
import { DomainError } from '../../../../shared/errors/domain.error';

export interface TransactionProps {
  id: string;
  customerId: string;
  productId: string;
  quantity: number;
  unitPriceInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  status: TransactionStatus;
  wompiTransactionId?: string;
  cardLast4?: string;
  cardFranchise?: 'VISA' | 'MASTERCARD' | 'UNKNOWN';
  createdAt: string;
  updatedAt: string;
}

/**
 * Agregado raíz de la transacción de pago.
 * Toda regla sobre "cuándo se puede pagar", "cómo se calcula el total" y
 * "qué transiciones de estado son válidas" vive aquí — no en un controller
 * ni en un adapter. Así, sin importar si mañana cambiamos DynamoDB por Postgres
 * o Wompi por otra pasarela, esta clase no cambia una sola línea.
 */
export class Transaction {
  private constructor(private props: TransactionProps) {}

  static createPending(params: {
    customerId: string;
    productId: string;
    quantity: number;
    unitPriceInCents: number;
    baseFeeInCents: number;
    deliveryFeeInCents: number;
  }): Transaction {
    if (params.quantity <= 0) {
      throw new DomainError('La cantidad debe ser mayor a cero');
    }
    if (params.unitPriceInCents <= 0) {
      throw new DomainError('El precio del producto no es válido');
    }

    const now = new Date().toISOString();
    return new Transaction({
      id: randomUUID(),
      customerId: params.customerId,
      productId: params.productId,
      quantity: params.quantity,
      unitPriceInCents: params.unitPriceInCents,
      baseFeeInCents: params.baseFeeInCents,
      deliveryFeeInCents: params.deliveryFeeInCents,
      status: TransactionStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  /** Monto total que se le cobra al cliente. Única fuente de verdad del cálculo (nunca confiar en el frontend). */
  get totalAmountInCents(): number {
    return (
      this.props.unitPriceInCents * this.props.quantity +
      this.props.baseFeeInCents +
      this.props.deliveryFeeInCents
    );
  }

  get id(): string {
    return this.props.id;
  }

  get status(): TransactionStatus {
    return this.props.status;
  }

  get productId(): string {
    return this.props.productId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  /** Se ejecuta ANTES de llamar a Wompi. Protege contra doble click / doble submit / reintentos. */
  assertCanBePaid(): void {
    if (!PAYABLE_STATUSES.includes(this.props.status)) {
      throw new DomainError(
        `La transacción ${this.props.id} no puede pagarse en estado ${this.props.status}`,
      );
    }
  }

  markApproved(params: { wompiTransactionId: string; cardLast4: string; cardFranchise: 'VISA' | 'MASTERCARD' | 'UNKNOWN' }): void {
    this.props.status = TransactionStatus.APPROVED;
    this.props.wompiTransactionId = params.wompiTransactionId;
    this.props.cardLast4 = params.cardLast4;
    this.props.cardFranchise = params.cardFranchise;
    this.props.updatedAt = new Date().toISOString();
  }

  markDeclined(wompiTransactionId?: string): void {
    this.props.status = TransactionStatus.DECLINED;
    this.props.wompiTransactionId = wompiTransactionId;
    this.props.updatedAt = new Date().toISOString();
  }

  markError(): void {
    this.props.status = TransactionStatus.ERROR;
    this.props.updatedAt = new Date().toISOString();
  }

  toPersistence(): TransactionProps {
    return { ...this.props };
  }
}
