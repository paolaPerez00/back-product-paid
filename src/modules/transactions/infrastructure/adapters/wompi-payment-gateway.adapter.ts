import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import {
  ChargeCardCommand,
  ChargeCardResult,
  PaymentGatewayPort,
} from '../../domain/ports/payment-gateway.port';
import { PaymentGatewayError } from '../../../../shared/errors/domain.error';

/**
 * Único punto de todo el proyecto que sabe que "Wompi" existe.
 * Implementa el contrato definido en el dominio (PaymentGatewayPort).
 *
 * La llave privada y el secreto de eventos NUNCA se leen de un .env plano
 * en producción: en la Lambda real se inyectan desde AWS Secrets Manager
 * (ver infra/lib/lambda-api-stack.ts). Aquí se leen de process.env porque
 * el runtime ya las recibe resueltas.
 */
@Injectable()
export class WompiPaymentGatewayAdapter implements PaymentGatewayPort {
  private readonly logger = new Logger(WompiPaymentGatewayAdapter.name);
  private readonly baseUrl = process.env.WOMPI_BASE_URL ?? 'https://sandbox.wompi.co/v1';
  private readonly privateKey = process.env.WOMPI_PRIVATE_KEY ?? '';
  private readonly integritySecret = process.env.WOMPI_INTEGRITY_SECRET ?? '';
  private readonly eventsSecret = process.env.WOMPI_EVENTS_SECRET ?? '';

  async chargeCard(command: ChargeCardCommand): Promise<ChargeCardResult> {
    // Wompi exige una firma de integridad por transacción: sha256(reference + amount + currency + integritySecret)
    const signature = createHash('sha256')
      .update(`${command.reference}${command.amountInCents}${command.currency}${this.integritySecret}`)
      .digest('hex');

    const response = await fetch(`${this.baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.privateKey}`,
      },
      body: JSON.stringify({
        amount_in_cents: command.amountInCents,
        currency: command.currency,
        customer_email: command.customerEmail,
        payment_method: {
          type: 'CARD',
          token: command.cardToken,
          installments: command.installments ?? 1,
        },
        reference: command.reference,
        signature,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new PaymentGatewayError(`Wompi respondió ${response.status}: ${body}`);
    }

    const json: any = await response.json();
    const data = json.data;

    return {
      gatewayTransactionId: data.id,
      status: this.mapWompiStatus(data.status),
      cardLast4: data.payment_method?.extra?.last_four ?? '0000',
      cardFranchise: this.mapFranchise(data.payment_method?.extra?.brand),
      rawResponse: json,
    };
  }

  verifyWebhookSignature(payload: Record<string, unknown>, signatureHeader: string): boolean {
    // Wompi firma el evento como sha256(concat(propiedades en orden) + timestamp + eventsSecret).
    // Aquí se simplifica: en la implementación real hay que seguir el orden
    // exacto de `signature.properties` que trae el propio payload del evento.
    const computed = createHash('sha256')
      .update(`${JSON.stringify(payload)}${this.eventsSecret}`)
      .digest('hex');
    return computed === signatureHeader;
  }

  private mapWompiStatus(status: string): ChargeCardResult['status'] {
    switch (status) {
      case 'APPROVED':
        return 'APPROVED';
      case 'DECLINED':
        return 'DECLINED';
      case 'PENDING':
        return 'PENDING';
      default:
        return 'ERROR';
    }
  }

  private mapFranchise(brand: string | undefined): ChargeCardResult['cardFranchise'] {
    if (!brand) return 'UNKNOWN';
    const normalized = brand.toUpperCase();
    if (normalized.includes('VISA')) return 'VISA';
    if (normalized.includes('MASTER')) return 'MASTERCARD';
    return 'UNKNOWN';
  }
}
