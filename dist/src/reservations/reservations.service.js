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
let ReservationsService = class ReservationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createReservationDto) {
        const { doctorId, dateTime, symptoms, isEmergency } = createReservationDto;
        const patient = await this.prisma.patient.findFirst({
            where: { user: { uid: userId } },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient record not found');
        const date = new Date(dateTime);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        const count = await this.prisma.reservation.count({
            where: {
                doctorId,
                dateTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: { notIn: ['cancelled', 'no_show'] },
            },
        });
        return this.prisma.reservation.create({
            data: {
                doctorId,
                patientId: patient.id,
                dateTime: new Date(dateTime),
                symptoms,
                isEmergency: isEmergency || false,
                queuePosition: count + 1,
                status: 'pending',
            },
            include: {
                doctor: true,
                patient: {
                    include: { user: true },
                },
            },
        });
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
        const where = { doctorId: doctor.id };
        if (date) {
            const d = new Date(date);
            where.dateTime = {
                gte: new Date(d.setHours(0, 0, 0, 0)),
                lte: new Date(d.setHours(23, 59, 59, 999)),
            };
        }
        return this.prisma.reservation.findMany({
            where,
            orderBy: { queuePosition: 'asc' },
            include: {
                patient: { include: { user: true } },
            },
        });
    }
    async findForPatient(userId) {
        const patient = await this.prisma.patient.findFirst({
            where: { user: { uid: userId } },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient record not found');
        return this.prisma.reservation.findMany({
            where: { patientId: patient.id },
            orderBy: { dateTime: 'desc' },
            include: {
                doctor: { include: { user: true } },
            },
        });
    }
    async updateStatus(id, statusData) {
        const { status, consultationNote } = statusData;
        const reservation = await this.prisma.reservation.findUnique({
            where: { id },
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
        return this.prisma.reservation.update({
            where: { id },
            data,
        });
    }
    async findUpcomingForPatient(userId) {
        const patient = await this.prisma.patient.findFirst({
            where: { user: { uid: userId } },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient record not found');
        const now = new Date();
        return this.prisma.reservation.findFirst({
            where: {
                patientId: patient.id,
                status: { in: ['pending', 'confirmed', 'waiting', 'inside'] },
                dateTime: { gte: new Date(now.setHours(0, 0, 0, 0)) },
            },
            orderBy: { dateTime: 'asc' },
            include: {
                doctor: { include: { user: true } },
                patient: { include: { user: true } },
            },
        });
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map