"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    configService;
    prisma;
    stripe;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
    }
    onModuleInit() {
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2026-03-25.dahlia',
        });
    }
    async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
        let customerId = metadata.customerId;
        if (!customerId && metadata.userId) {
            const customers = await this.stripe.customers.list({
                email: metadata.email,
                limit: 1,
            });
            if (customers.data.length > 0) {
                customerId = customers.data[0].id;
            }
            else {
                const customer = await this.stripe.customers.create({
                    email: metadata.email,
                    name: metadata.name,
                    metadata: { userId: metadata.userId },
                });
                customerId = customer.id;
            }
        }
        let ephemeralKey;
        if (customerId) {
            ephemeralKey = await this.stripe.ephemeralKeys.create({ customer: customerId }, { apiVersion: '2026-03-25.dahlia' });
        }
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
    async handleWebhook(signature, payload) {
        const webhookSecret = this.configService.get('STRIPE_SECRET_KEY');
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, this.configService.get('STRIPE_WEBHOOK_SECRET'));
        }
        catch (err) {
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map