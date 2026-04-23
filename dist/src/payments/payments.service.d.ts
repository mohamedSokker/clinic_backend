import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService implements OnModuleInit {
    private configService;
    private prisma;
    private stripe;
    constructor(configService: ConfigService, prisma: PrismaService);
    onModuleInit(): void;
    createPaymentIntent(amount: number, currency?: string, metadata?: any): Promise<{
        clientSecret: any;
        customerId: any;
        ephemeralKey: any;
    }>;
    handleWebhook(signature: string, payload: Buffer): Promise<{
        received: boolean;
    }>;
}
