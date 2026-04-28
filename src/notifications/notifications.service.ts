import * as admin from 'firebase-admin';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    if (admin.apps.length > 0) {
      this.logger.log('Firebase Admin already initialized via FirebaseService');
    } else {
      this.logger.error('Firebase Admin not initialized! Check FirebaseModule.');
    }
  }

  /**
   * Sends a multicast message to multiple devices using Firebase Cloud Messaging.
   * @param fieldsData contains title, body, and an array of device tokens.
   */
  async sendMessage(fieldsData: { title: string; body: string; Tokens: string[] }) {
    const cleanTokens = (fieldsData.Tokens || []).filter(t => !!t && t.length > 10);
    
    if (cleanTokens.length === 0) {
      this.logger.warn('No valid tokens provided for multicast message');
      return;
    }

    const message: admin.messaging.MulticastMessage = {
      notification: {
        title: fieldsData.title,
        body: fieldsData.body,
      },
      tokens: cleanTokens,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            contentAvailable: true,
          },
        },
      },
    };

    try {
      this.logger.log(`Sending multicast message to ${fieldsData.Tokens.length} devices`);
      const response = await admin.messaging().sendEachForMulticast(message);
      
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            this.logger.error(`Token Error [${cleanTokens[idx]}]: ${resp.error?.code} - ${resp.error?.message}`);
          }
        });
      }

      return response;
    } catch (error) {
      this.logger.error('Error sending multicast message:', error);
      throw error;
    }
  }

  // Persistent notifications stored in DB
  async createNotification(data: {
    userId: string;
    title: string;
    body: string;
    type: string;
    relatedId?: string;
  }) {
    return this.prisma.notification.create({ data });
  }

  async findAllForUser(uid: string) {
    const user = await this.prisma.user.findUnique({ where: { uid } });
    if (!user) return [];
    return this.prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllRead(uid: string) {
    const user = await this.prisma.user.findUnique({ where: { uid } });
    if (!user) return;
    return this.prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
  }
}
