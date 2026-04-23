import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: any): Promise<{
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
    markAllRead(req: any): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
