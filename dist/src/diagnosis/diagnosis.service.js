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
exports.DiagnosisService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DiagnosisService = class DiagnosisService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createDiagnosisDto) {
        const { reservationId, notes, prescriptions, nextVisitDate, vaccines, analysisFiles, } = createDiagnosisDto;
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { doctor: true, patient: true },
        });
        if (!reservation)
            throw new common_1.NotFoundException('Reservation not found');
        return this.prisma.diagnosis.create({
            data: {
                reservationId,
                patientId: reservation.patientId,
                doctorId: reservation.doctorId,
                visitDate: reservation.dateTime,
                notes,
                prescriptions,
                nextVisitDate: nextVisitDate ? new Date(nextVisitDate) : null,
                vaccines: {
                    create: vaccines || [],
                },
                analysisFiles: {
                    create: analysisFiles || [],
                },
            },
            include: {
                vaccines: true,
                analysisFiles: true,
            },
        });
    }
    async findForPatient(patientUserId) {
        const patient = await this.prisma.patient.findFirst({
            where: { user: { uid: patientUserId } },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        return this.prisma.diagnosis.findMany({
            where: { patientId: patient.id },
            orderBy: { visitDate: 'desc' },
            include: {
                doctor: { include: { user: true } },
                vaccines: true,
                analysisFiles: true,
            },
        });
    }
    async addAnalysisFile(labUserId, fileData) {
        const lab = await this.prisma.lab.findFirst({
            where: { user: { uid: labUserId } },
        });
        if (!lab)
            throw new common_1.NotFoundException('Lab not found');
        const { diagnosisId, url, type, fileName } = fileData;
        return this.prisma.analysisFile.create({
            data: {
                diagnosisId,
                labId: lab.id,
                url,
                type,
                fileName,
            },
        });
    }
};
exports.DiagnosisService = DiagnosisService;
exports.DiagnosisService = DiagnosisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DiagnosisService);
//# sourceMappingURL=diagnosis.service.js.map