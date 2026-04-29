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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ReservationsService = class ReservationsService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async findOne(id) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id },
            include: {
                patient: { include: { user: true } },
                doctor: { include: { user: true } },
                lab: { include: { user: true } },
            },
        });
        if (!reservation)
            throw new common_1.NotFoundException('Reservation not found');
        return this.formatReservation(reservation);
    }
    async create(userId, createReservationDto) {
        const { doctorId, labId, dateTime, symptoms, isEmergency, selectedTest } = createReservationDto;
        let targetPatientId;
        const requester = await this.prisma.user.findUnique({
            where: { uid: userId },
            include: { patient: true, doctor: true, lab: true },
        });
        if (!requester)
            throw new common_1.NotFoundException('User not found');
        if (requester.patient) {
            targetPatientId = requester.patient.id;
        }
        else if ((requester.doctor || requester.lab) && isEmergency) {
            const { patientName, patientMobile } = createReservationDto;
            if (!patientName)
                throw new common_1.BadRequestException('Patient name is required for emergency insertion');
            let patientUser = await this.prisma.user.findFirst({
                where: { mobile: patientMobile || undefined, name: patientName },
                include: { patient: true },
            });
            if (!patientUser) {
                patientUser = await this.prisma.user.create({
                    data: {
                        name: patientName,
                        email: `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}@vitreous.clinic`,
                        mobile: patientMobile || null,
                        role: 'patient',
                        uid: `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                    },
                    include: { patient: true },
                });
            }
            if (!patientUser)
                throw new common_1.BadRequestException('Failed to resolve or create patient user');
            if (!patientUser.patient) {
                const newPatient = await this.prisma.patient.create({
                    data: { userId: patientUser.id },
                });
                targetPatientId = newPatient.id;
            }
            else {
                targetPatientId = patientUser.patient.id;
            }
        }
        else {
            throw new common_1.BadRequestException('Only patients can create standard reservations.');
        }
        return this.formatReservation(this.prisma.$transaction(async (tx) => {
            if (doctorId) {
                await tx.$executeRaw `SELECT id FROM "Doctor" WHERE id = ${doctorId} FOR UPDATE`;
            }
            else if (labId) {
                await tx.$executeRaw `SELECT id FROM "Lab" WHERE id = ${labId} FOR UPDATE`;
            }
            if ((doctorId || labId) && dateTime) {
                const existing = await tx.reservation.findFirst({
                    where: {
                        doctorId: doctorId || undefined,
                        labId: labId || undefined,
                        dateTime: new Date(dateTime),
                        status: { notIn: ["cancelled", "no_show"] },
                    },
                });
                if (existing) {
                    throw new common_1.BadRequestException("This time slot is already reserved.");
                }
            }
            const date = new Date(dateTime);
            const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0));
            const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999));
            if (isEmergency) {
                const activeReservations = await tx.reservation.findMany({
                    where: {
                        doctorId: doctorId || undefined,
                        labId: labId || undefined,
                        dateTime: {
                            gte: startOfDay,
                            lte: endOfDay,
                        },
                        status: { in: ['pending', 'confirmed', 'waiting', 'inside'] },
                    },
                    orderBy: { dateTime: 'asc' },
                });
                if (activeReservations.length > 0) {
                    let duration = 30;
                    if (doctorId) {
                        const doctor = await tx.doctor.findUnique({
                            where: { id: doctorId },
                        });
                        duration = doctor?.slotDurationMinutes || 30;
                    }
                    const insideIdx = activeReservations.findIndex((r) => r.status === 'inside');
                    let shiftFromIdx = insideIdx === -1 ? 0 : insideIdx + 1;
                    const reservationsToShift = activeReservations.slice(shiftFromIdx);
                    let insertionTime = reservationsToShift.length > 0
                        ? new Date(reservationsToShift[0].dateTime)
                        : new Date(activeReservations[activeReservations.length - 1].dateTime.getTime() +
                            duration * 60000);
                    for (const res of reservationsToShift) {
                        const newTime = new Date(res.dateTime.getTime() + duration * 60000);
                        await tx.reservation.update({
                            where: { id: res.id },
                            data: {
                                dateTime: newTime,
                                expectedTime: newTime,
                                queuePosition: res.queuePosition + 1,
                            },
                        });
                        const patientUser = await tx.user.findFirst({
                            where: { patient: { id: res.patientId } },
                        });
                        if (patientUser) {
                            const timeStr = newTime.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            });
                            if (patientUser.fcmToken) {
                                try {
                                    await this.notificationsService.sendMessage({
                                        title: '⚠️ Schedule Update',
                                        body: `Due to an emergency, your appointment has been shifted. New time: ${timeStr}. We apologize for the delay.`,
                                        Tokens: [patientUser.fcmToken],
                                    });
                                }
                                catch (e) {
                                    console.error(`Failed to send shift notification to ${patientUser.id}:`, e.message);
                                }
                            }
                            await this.notificationsService.createNotification({
                                userId: patientUser.id,
                                title: 'Appointment Shifted',
                                body: `Emergency insertion has delayed your appointment to ${timeStr}. Sorry for the inconvenience.`,
                                type: 'alert',
                                relatedId: res.id,
                            });
                        }
                    }
                    return tx.reservation.create({
                        data: {
                            doctorId: doctorId || null,
                            labId: labId || null,
                            patientId: targetPatientId,
                            dateTime: insertionTime,
                            symptoms,
                            isEmergency: true,
                            queuePosition: activeReservations[shiftFromIdx]?.queuePosition ||
                                activeReservations.length + 1,
                            status: 'pending',
                            selectedTest,
                        },
                        include: {
                            doctor: { include: { user: true } },
                            lab: { include: { user: true } },
                            patient: { include: { user: true } },
                        },
                    });
                }
            }
            const count = await tx.reservation.count({
                where: {
                    doctorId: doctorId || undefined,
                    labId: labId || undefined,
                    dateTime: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                    status: { notIn: ['cancelled', 'no_show'] },
                },
            });
            return tx.reservation.create({
                data: {
                    doctorId: doctorId || null,
                    labId: labId || null,
                    patientId: targetPatientId,
                    dateTime: new Date(dateTime),
                    symptoms,
                    isEmergency: isEmergency || false,
                    queuePosition: count + 1,
                    status: 'pending',
                    selectedTest,
                },
                include: {
                    doctor: { include: { user: true } },
                    lab: { include: { user: true } },
                    patient: {
                        include: { user: true },
                    },
                },
            });
        }));
    }
    async findForDoctor(identifier, date, isInternalId = false) {
        const whereCondition = isInternalId
            ? { id: identifier }
            : { user: { uid: identifier } };
        const doctor = await this.prisma.doctor.findFirst({
            where: whereCondition,
        });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor record not found');
        const where = {
            doctorId: doctor.id,
            status: { notIn: ['cancelled', 'no_show'] },
        };
        if (date) {
            const d = new Date(date);
            where.dateTime = {
                gte: new Date(d.setHours(0, 0, 0, 0)),
                lte: new Date(d.setHours(23, 59, 59, 999)),
            };
        }
        return this.formatReservation(this.prisma.reservation.findMany({
            where,
            orderBy: { queuePosition: 'asc' },
            include: {
                patient: { include: { user: true } },
            },
        }));
    }
    async findPaginatedForDoctor(identifier, date, page = 1, perPage = 3, nextOnly = false) {
        const doctor = await this.prisma.doctor.findFirst({
            where: { user: { uid: identifier } },
        });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor record not found');
        const statusFilter = { notIn: ['cancelled', 'no_show'] };
        const where = {
            doctorId: doctor.id,
            status: statusFilter,
        };
        if (date) {
            const d = new Date(date);
            where.dateTime = {
                gte: new Date(d.setHours(0, 0, 0, 0)),
                lte: new Date(d.setHours(23, 59, 59, 999)),
            };
        }
        const [reservations, total] = await Promise.all([
            this.prisma.reservation.findMany({
                where,
                orderBy: { queuePosition: 'asc' },
                include: {
                    patient: { include: { user: true } },
                },
                skip: (page - 1) * perPage,
                take: perPage,
            }),
            this.prisma.reservation.count({ where }),
        ]);
        return {
            reservations: this.formatReservation(reservations),
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        };
    }
    async findForLab(labId, date) {
        const where = { labId };
        if (date) {
            const d = new Date(date);
            where.dateTime = {
                gte: new Date(d.setHours(0, 0, 0, 0)),
                lte: new Date(d.setHours(23, 59, 59, 999)),
            };
        }
        return this.formatReservation(this.prisma.reservation.findMany({
            where,
            orderBy: { dateTime: 'asc' },
            include: {
                patient: { include: { user: true } },
            },
        }));
    }
    async findPaginatedForLab(identifier, date, page = 1, perPage = 3, nextOnly = false) {
        const lab = await this.prisma.lab.findFirst({
            where: { user: { uid: identifier } },
        });
        if (!lab)
            throw new common_1.NotFoundException('Lab record not found');
        const statusFilter = nextOnly
            ? { in: ['pending', 'confirmed', 'waiting', 'inside'] }
            : { notIn: ['cancelled', 'no_show'] };
        const where = {
            labId: lab.id,
            status: statusFilter,
        };
        if (date) {
            const d = new Date(date);
            where.dateTime = {
                gte: new Date(d.setHours(0, 0, 0, 0)),
                lte: new Date(d.setHours(23, 59, 59, 999)),
            };
        }
        const [reservations, total] = await Promise.all([
            this.prisma.reservation.findMany({
                where,
                orderBy: { dateTime: 'asc' },
                include: {
                    patient: { include: { user: true } },
                },
                skip: (page - 1) * perPage,
                take: perPage,
            }),
            this.prisma.reservation.count({ where }),
        ]);
        return {
            reservations: this.formatReservation(reservations),
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        };
    }
    async findForPatient(userId) {
        const patient = await this.prisma.patient.findFirst({
            where: { user: { uid: userId } },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient record not found');
        return this.formatReservation(this.prisma.reservation.findMany({
            where: { patientId: patient.id },
            orderBy: { dateTime: 'desc' },
            include: {
                doctor: { include: { user: true } },
                lab: { include: { user: true } },
            },
        }));
    }
    async findPaginatedForPatient(userId, page = 1, perPage = 3) {
        const patient = await this.prisma.patient.findFirst({
            where: { user: { uid: userId } },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient record not found');
        const where = { patientId: patient.id };
        const [reservations, total] = await Promise.all([
            this.prisma.reservation.findMany({
                where,
                orderBy: { dateTime: 'desc' },
                include: {
                    doctor: { include: { user: true } },
                    lab: { include: { user: true } },
                },
                skip: (page - 1) * perPage,
                take: perPage,
            }),
            this.prisma.reservation.count({ where }),
        ]);
        return {
            reservations: this.formatReservation(reservations),
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        };
    }
    async getLiveQueueForPatient(userId, requestedDoctorId) {
        const patient = await this.prisma.patient.findFirst({
            where: { user: { uid: userId } },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient record not found');
        let doctorId = requestedDoctorId;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        if (!doctorId) {
            const activeRes = await this.prisma.reservation.findFirst({
                where: {
                    patientId: patient.id,
                    doctorId: { not: null },
                    dateTime: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                    status: { in: ['pending', 'confirmed', 'waiting', 'inside', 'done'] },
                },
                orderBy: { dateTime: 'asc' },
            });
            if (activeRes) {
                doctorId = activeRes.doctorId ?? undefined;
            }
        }
        if (!doctorId) {
            return { clinicInfo: null, queue: [], myPatientId: patient.id };
        }
        const doctor = await this.prisma.doctor.findUnique({
            where: { id: doctorId },
            include: { user: true },
        });
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const queueReservations = await this.prisma.reservation.findMany({
            where: {
                doctorId,
                dateTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                OR: [
                    { status: { in: ['pending', 'confirmed', 'waiting', 'inside'] } },
                    { status: 'done' },
                ],
            },
            orderBy: { queuePosition: 'asc' },
        });
        const queue = queueReservations.map((r) => ({
            id: r.id,
            patientId: r.patientId,
            queuePosition: r.queuePosition,
            status: r.status,
            expectedTime: r.expectedTime,
            dateTime: r.expectedTime || r.dateTime,
            entryTime: r.entryTime,
            exitTime: r.exitTime,
            isEmergency: r.isEmergency,
            durationMinutes: r.entryTime && r.exitTime
                ? Math.round((r.exitTime.getTime() - r.entryTime.getTime()) / 60000)
                : null,
        }));
        return {
            clinicInfo: {
                doctorName: doctor?.doctorName || doctor?.user?.name,
                clinicName: doctor?.clinicName,
            },
            queue,
            myPatientId: patient.id,
        };
    }
    async updateStatus(id, statusData) {
        const { status, consultationNote } = statusData;
        const reservation = await this.prisma.reservation.findUnique({
            where: { id },
            include: { doctor: true },
        });
        if (!reservation)
            throw new common_1.NotFoundException('Reservation not found');
        const data = { status };
        if (status === 'inside')
            data.entryTime = new Date();
        if (status === 'done') {
            data.exitTime = new Date();
            data.consultationNote = consultationNote;
        }
        const updated = await this.prisma.reservation.update({
            where: { id },
            data,
        });
        if (status === 'done') {
            if (reservation.doctorId) {
                await this.shiftQueue('doctor', reservation.doctorId, data.exitTime, reservation.dateTime);
            }
            else if (reservation.labId) {
                await this.shiftQueue('lab', reservation.labId, data.exitTime, reservation.dateTime);
            }
        }
        return updated;
    }
    async shiftQueue(type, targetId, lastExitTime, lastPlannedTime) {
        let duration = 30;
        if (type === 'doctor') {
            const doctor = await this.prisma.doctor.findUnique({
                where: { id: targetId },
            });
            duration = doctor?.slotDurationMinutes || 30;
        }
        else {
            const lab = await this.prisma.lab.findUnique({
                where: { id: targetId },
            });
            duration = 30;
        }
        const endOfDay = new Date(lastPlannedTime);
        endOfDay.setHours(23, 59, 59, 999);
        const nextReservations = await this.prisma.reservation.findMany({
            where: {
                doctorId: type === 'doctor' ? targetId : undefined,
                labId: type === 'lab' ? targetId : undefined,
                dateTime: {
                    gt: lastPlannedTime,
                    lte: endOfDay,
                },
                status: { in: ['pending', 'confirmed', 'waiting'] },
            },
            orderBy: { dateTime: 'asc' },
        });
        const currentExpected = new Date(lastExitTime);
        for (const res of nextReservations) {
            await this.prisma.reservation.update({
                where: { id: res.id },
                data: { expectedTime: new Date(currentExpected) },
            });
            currentExpected.setMinutes(currentExpected.getMinutes() + duration);
        }
    }
    async findUpcomingForPatient(userId) {
        const patient = await this.prisma.patient.findFirst({
            where: { user: { uid: userId } },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient record not found');
        const now = new Date();
        return this.formatReservation(this.prisma.reservation.findFirst({
            where: {
                patientId: patient.id,
                status: { in: ['pending', 'confirmed', 'waiting', 'inside'] },
                dateTime: { gte: new Date(now.setHours(0, 0, 0, 0)) },
            },
            orderBy: { dateTime: 'asc' },
            include: {
                doctor: { include: { user: true } },
                lab: { include: { user: true } },
                patient: { include: { user: true } },
            },
        }));
    }
    formatReservation(res) {
        if (!res)
            return res;
        if (res && typeof res.then === 'function') {
            return res.then((resolved) => this.formatReservation(resolved));
        }
        if (Array.isArray(res))
            return res.map((r) => this.formatReservation(r));
        return {
            ...res,
            dateTime: res.expectedTime || res.dateTime,
        };
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map