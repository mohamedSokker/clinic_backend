import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: any): Promise<{
        id: string;
        userId: string;
        type: string;
        createdAt: Date;
        title: string;
        body: string;
        relatedId: string | null;
        read: boolean;
    }[]>;
    create(data: {
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
    send(fieldsData: {
        title: string;
        body: string;
        Tokens: string[];
    }): Promise<import("node_modules/firebase-admin/lib/messaging/messaging-api").BatchResponse | undefined>;
    markAllRead(req: any): Promise<import("@prisma/client").Prisma.BatchPayload | undefined>;
}
