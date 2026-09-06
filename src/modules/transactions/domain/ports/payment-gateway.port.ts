export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface ChargeCardCommand {
  reference: string;
  amountInCents: number;
  currency: 'COP';
  cardToken: string;
  customerEmail: string;
  installments?: number;
}

export interface ChargeCardResult {
  gatewayTransactionId: string;
  status: 'APPROVED' | 'DECLINED' | 'ERROR' | 'PENDING';
  cardLast4: string;
  cardFranchise: 'VISA' | 'MASTERCARD' | 'UNKNOWN';
  rawResponse: Record<string, unknown>;
}

export interface PaymentGatewayPort {
  chargeCard(command: ChargeCardCommand): Promise<ChargeCardResult>;
  verifyWebhookSignature(payload: Record<string, unknown>, signatureHeader: string): boolean;
}
