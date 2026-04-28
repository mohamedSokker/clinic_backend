import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService implements OnModuleInit {
    private configService;
    private prisma;
    private readonly logger;
    constructor(configService: ConfigService, prisma: PrismaService);
    onModuleInit(): void;
    sendMessage(fieldsData: {
        title: string;
        body: string;
        Tokens: string[];
    }): Promise<import("node_modules/firebase-admin/lib/messaging/messaging-api").BatchResponse | undefined>;
    createNotification(data: {
        userId: string;
        title: string;
        body: string;
        type: string;
        relatedId?: string;
    }): Promise<{
        id: string;
        userId: string;
        type: string;
        createdAt: Date;
        title: string;
        body: string;
        relatedId: string | null;
        read: boolean;
    }>;
    findAllForUser(uid: string): Promise<{
        id: string;
        userId: string;
        type: string;
        createdAt: Date;
        title: string;
        body: string;
        relatedId: string | null;
        read: boolean;
    }[]>;
    markRead(id: string): Promise<{
        id: string;
        userId: string;
        type: string;
        createdAt: Date;
        title: string;
        body: string;
        relatedId: string | null;
        read: boolean;
    }>;
    markAllRead(uid: string): Promise<import("@prisma/client").Prisma.BatchPayload | undefined>;
}
