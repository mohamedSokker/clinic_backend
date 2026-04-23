import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  async createIntent(
    @Body()
    body: {
      amount: number;
      userId: string;
      role: string;
      email: string;
      name: string;
    },
  ) {
    if (!body.amount || !body.userId) {
      throw new BadRequestException('Amount and userId are required');
    }

    const result = await this.paymentsService.createPaymentIntent(
      body.amount,
      'usd',
      {
        userId: body.userId,
        role: body.role,
        email: body.email,
        name: body.name,
      },
    );

    return result;
  }

  @Post('webhook')
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    return this.paymentsService.handleWebhook(signature, rawBody);
  }
}
