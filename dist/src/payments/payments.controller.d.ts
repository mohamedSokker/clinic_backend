import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createIntent(body: {
        amount: number;
        userId: string;
        role: string;
        email: string;
        name: string;
    }): Promise<{
        clientSecret: any;
        customerId: any;
        ephemeralKey: any;
    }>;
    webhook(signature: string, req: RawBodyRequest<Request>): Promise<{
        received: boolean;
    }>;
}
