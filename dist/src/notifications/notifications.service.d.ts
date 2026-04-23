import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        title: string;
        body: string;
        relatedId: string | null;
        read: boolean;
    }>;
    findAllForUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        title: string;
        body: string;
        relatedId: string | null;
        read: boolean;
    }[]>;
    markRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        title: string;
        body: string;
        relatedId: string | null;
        read: boolean;
    }>;
    markAllRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
