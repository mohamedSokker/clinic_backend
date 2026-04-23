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
exports.DoctorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DoctorsService = class DoctorsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(specialization, query) {
        return this.prisma.doctor.findMany({
            where: {
                AND: [
                    specialization ? { specialization } : {},
                    query
                        ? {
                            OR: [
                                { doctorName: { contains: query, mode: 'insensitive' } },
                                { clinicName: { contains: query, mode: 'insensitive' } },
                            ],
                        }
                        : {},
                    { subscriptionActive: true },
                ],
            },
            include: {
                user: true,
            },
        });
    }
    async findOne(id) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { id },
            include: {
                user: true,
                reviews: true,
            },
        });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor not found');
        return doctor;
    }
    async updateSchedule(uid, scheduleData) {
        const doctor = await this.prisma.doctor.findFirst({
            where: { user: { uid } },
        });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor record not found');
        return this.prisma.doctor.update({
            where: { id: doctor.id },
            data: {
                schedule: scheduleData.schedule,
                workingDays: scheduleData.workingDays,
                slotDurationMinutes: scheduleData.slotDurationMinutes,
            },
        });
    }
    async updateCosts(uid, costs) {
        const doctor = await this.prisma.doctor.findFirst({
            where: { user: { uid } },
        });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor record not found');
        return this.prisma.doctor.update({
            where: { id: doctor.id },
            data: costs,
        });
    }
};
exports.DoctorsService = DoctorsService;
exports.DoctorsService = DoctorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DoctorsService);
//# sourceMappingURL=doctors.service.js.map