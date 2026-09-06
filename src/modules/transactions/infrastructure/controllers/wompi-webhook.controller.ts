import { Body, Controller, HttpCode, Headers, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { HandlePaymentWebhookUseCase } from '../../application/use-cases/handle-payment-webhook.use-case';

@ApiExcludeController() // no se expone en Swagger público: es solo para Wompi -> nosotros
@Controller('webhooks/wompi')
export class WompiWebhookController {
  constructor(private readonly handlePaymentWebhookUseCase: HandlePaymentWebhookUseCase) {}

  @Post()
  @HttpCode(200) // siempre 200 para que Wompi no reintente eventos que ya procesamos o descartamos
  async handle(@Body() payload: Record<string, any>, @Headers('x-signature') signature: string) {
    await this.handlePaymentWebhookUseCase.execute(payload, signature);
    return { received: true };
  }
}
