import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReservationsTasks {
  private readonly logger = new Logger(ReservationsTasks.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleReminders() {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 55 * 60 * 1000);
    const oneHourFiveFromNow = new Date(now.getTime() + 65 * 60 * 1000);

    this.logger.log('Running 1-hour appointment reminder check...');

    try {
      const upcoming = await this.prisma.reservation.findMany({
        where: {
          OR: [
            {
              expectedTime: {
                not: null,
                gte: oneHourFromNow,
                lte: oneHourFiveFromNow,
              },
            },
            {
              expectedTime: null,
              dateTime: {
                gte: oneHourFromNow,
                lte: oneHourFiveFromNow,
              },
            },
          ],
          status: { in: ['pending', 'confirmed', 'waiting'] },
        },
        include: {
          patient: { include: { user: true } },
          doctor: { include: { user: true } },
          lab: { include: { user: true } },
        },
      });

      for (const res of upcoming) {
        const user = res.patient.user;
        
        // Check if we already sent a reminder for this reservation today
        const existingReminder = await this.prisma.notification.findFirst({
          where: {
            userId: user.id,
            type: 'reminder',
            relatedId: res.id,
          },
        });

        if (existingReminder) continue;

        const entityName = res.doctor?.doctorName || res.lab?.labName || 'Clinic';
        
        if (user.fcmToken) {
          try {
            await this.notificationsService.sendMessage({
              title: 'Appointment Reminder',
              body: `Don't forget! Your appointment with ${entityName} is in about 1 hour.`,
              Tokens: [user.fcmToken],
            });
          } catch (e) {
            this.logger.error(`Failed to send 1-hour reminder to ${user.id}: ${e.message}`);
          }
        }

        await this.notificationsService.createNotification({
          userId: user.id,
          title: 'Appointment Reminder',
          body: `Reminder: Your appointment with ${entityName} is in 1 hour.`,
          type: 'reminder',
          relatedId: res.id,
        });

        this.logger.log(`Sent reminder to ${user.name} for reservation ${res.id}`);
      }
    } catch (error) {
      this.logger.error('Error in handleReminders task:', error);
    }
  }
}
