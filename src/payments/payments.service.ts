import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService implements OnModuleInit {
  private stripe: any;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY')!,
      {
        apiVersion: '2026-03-25.dahlia',
      },
    );
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: any = {},
  ) {
    let customerId = metadata.customerId;

    // 1. Find or Create Customer
    if (!customerId && metadata.userId) {
      const customers = await this.stripe.customers.list({
        email: metadata.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await this.stripe.customers.create({
          email: metadata.email,
          name: metadata.name,
          metadata: { userId: metadata.userId },
        });
        customerId = customer.id;
      }
    }

    // 2. Create Ephemeral Key for the customer (for Payment Sheet)
    let ephemeralKey;
    if (customerId) {
      ephemeralKey = await this.stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: '2026-03-25.dahlia' },
      );
    }

    // 3. Create Payment Intent
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      customer: customerId,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: intent.client_secret,
      customerId,
      ephemeralKey: ephemeralKey?.secret,
    };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_SECRET_KEY')!; // Re-using secret as placeholder if webhook secret is missing, but should be STRIPE_WEBHOOK_SECRET
    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET')!,
      );
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { userId, role } = paymentIntent.metadata;

      if (role === 'doctor' && userId) {
        await this.prisma.user.update({
          where: { uid: userId },
          data: {
            doctor: {
              update: {
                subscriptionActive: true,
              },
            },
          },
        });
      }
    }

    return { received: true };
  }
}
