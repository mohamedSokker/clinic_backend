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
var ReservationsTasks_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsTasks = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ReservationsTasks = ReservationsTasks_1 = class ReservationsTasks {
    prisma;
    notificationsService;
    logger = new common_1.Logger(ReservationsTasks_1.name);
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
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
                const existingReminder = await this.prisma.notification.findFirst({
                    where: {
                        userId: user.id,
                        type: 'reminder',
                        relatedId: res.id,
                    },
                });
                if (existingReminder)
                    continue;
                const entityName = res.doctor?.doctorName || res.lab?.labName || 'Clinic';
                if (user.fcmToken) {
                    try {
                        await this.notificationsService.sendMessage({
                            title: 'Appointment Reminder',
                            body: `Don't forget! Your appointment with ${entityName} is in about 1 hour.`,
                            Tokens: [user.fcmToken],
                        });
                    }
                    catch (e) {
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
        }
        catch (error) {
            this.logger.error('Error in handleReminders task:', error);
        }
    }
};
exports.ReservationsTasks = ReservationsTasks;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReservationsTasks.prototype, "handleReminders", null);
exports.ReservationsTasks = ReservationsTasks = ReservationsTasks_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ReservationsTasks);
//# sourceMappingURL=reservations.tasks.js.map