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
exports.LabsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LabsService = class LabsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(type, query, lat, lng, radius) {
        const labs = await this.prisma.lab.findMany({
            where: {
                AND: [
                    type ? { type } : {},
                    query
                        ? {
                            OR: [
                                { labName: { contains: query, mode: 'insensitive' } },
                                { location: { contains: query, mode: 'insensitive' } },
                            ],
                        }
                        : {},
                ],
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        mobile: true,
                        photoURL: true,
                    },
                },
            },
        });
        if (lat !== undefined && lng !== undefined && radius !== undefined) {
            const { calculateDistance } = require('../common/utils/geo');
            return labs.filter((lab) => {
                if (lab.latitude && lab.longitude) {
                    const dist = calculateDistance(lat, lng, lab.latitude, lab.longitude);
                    return dist <= radius;
                }
                return false;
            });
        }
        return labs;
    }
    async findOne(id) {
        const lab = await this.prisma.lab.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        mobile: true,
                        photoURL: true,
                    },
                },
            },
        });
        if (!lab) {
            throw new common_1.NotFoundException(`Lab with ID ${id} not found`);
        }
        return lab;
    }
    async getDashboardData(firebaseUid) {
        const lab = await this.prisma.lab.findFirst({
            where: { user: { uid: firebaseUid } },
            include: {
                analysisFiles: {
                    take: 5,
                    orderBy: { uploadedAt: 'desc' },
                },
                reservations: {
                    where: { status: 'pending' },
                    orderBy: { dateTime: 'asc' },
                    take: 5,
                    include: {
                        patient: { include: { user: true } },
                    },
                },
            },
        });
        if (!lab)
            throw new common_1.NotFoundException('Lab record not found');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTestsCount = await this.prisma.analysisFile.count({
            where: {
                labId: lab.id,
                uploadedAt: { gte: today },
            },
        });
        return {
            stats: {
                todayTests: todayTestsCount,
                totalTests: await this.prisma.analysisFile.count({
                    where: { labId: lab.id },
                }),
                syncIntegrity: 98,
            },
            recentUploads: lab.analysisFiles.map((file) => ({
                id: file.id,
                fileName: file.fileName,
                uploadedAt: file.uploadedAt,
                type: file.type,
            })),
            availableAnalysis: (lab.analysisTypes || []).map((type) => ({
                id: type.id,
                name: type.name,
                cost: type.cost,
                status: 'Active',
                progress: 100,
            })),
            appointments: lab.reservations.map((res) => ({
                id: res.id,
                time: res.dateTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                date: res.dateTime.toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                }),
                patientName: res.patient.user.name,
                patientPhoto: res.patient.user.photoURL,
                patientId: res.patient.id,
                testType: res.selectedTest || 'General Analysis',
                status: res.status,
            })),
        };
    }
    async getQueueData(firebaseUid) {
        const lab = await this.prisma.lab.findFirst({
            where: { user: { uid: firebaseUid } },
            include: {
                crew: true,
                reservations: {
                    where: {
                        status: { notIn: ['cancelled', 'no_show'] },
                    },
                    orderBy: { dateTime: 'asc' },
                    include: {
                        patient: { include: { user: true } },
                    },
                },
            },
        });
        if (!lab)
            throw new common_1.NotFoundException('Lab record not found');
        const now = new Date();
        const todayStart = new Date(new Date(now).setHours(0, 0, 0, 0));
        const todayEnd = new Date(new Date(now).setHours(23, 59, 59, 999));
        const stats = {
            totalActive: lab.reservations.filter((r) => r.status !== 'done').length,
            pending: lab.reservations.filter((r) => r.status === 'pending' || r.status === 'waiting').length,
            inProgress: lab.reservations.filter((r) => r.status === 'inside').length,
            completedToday: lab.reservations.filter((r) => r.status === 'done' && r.dateTime >= todayStart && r.dateTime <= todayEnd).length,
        };
        return {
            labInfo: {
                id: lab.id,
                name: lab.labName,
                accuracy: lab.accuracy,
                avgTurnaroundTime: lab.avgTurnaroundTime,
                crew: lab.crew,
            },
            stats,
            queue: lab.reservations.map((res) => ({
                id: res.id,
                patientName: res.patient.user.name,
                patientPhoto: res.patient.user.photoURL,
                patientId: `ETH-${res.id.slice(0, 4).toUpperCase()}`,
                tags: res.tags,
                symptoms: res.symptoms,
                time: res.dateTime,
                expectedTime: res.expectedTime,
                status: res.status,
                selectedTest: res.selectedTest,
            })),
        };
    }
    async getSchedule(firebaseUid) {
        const lab = await this.prisma.lab.findFirst({
            where: { user: { uid: firebaseUid } },
            select: { workingHours: true, isAvailable: true },
        });
        if (!lab)
            throw new Error('Lab not found');
        return lab;
    }
    async updateSchedule(firebaseUid, data) {
        const lab = await this.prisma.lab.findFirst({
            where: { user: { uid: firebaseUid } },
        });
        if (!lab)
            throw new Error('Lab not found');
        return this.prisma.lab.update({
            where: { id: lab.id },
            data: {
                workingHours: data.workingHours,
                isAvailable: data.isAvailable,
            },
        });
    }
    async getPatientAnalysis(labUid, patientId, page = 1, perPage = 3) {
        const lab = await this.prisma.lab.findFirst({
            where: { user: { uid: labUid } },
        });
        if (!lab)
            throw new common_1.NotFoundException('Lab not found');
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId },
            include: {
                user: {
                    select: {
                        name: true,
                        photoURL: true,
                        email: true,
                        mobile: true,
                    },
                },
            },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        const recentAnalysis = await this.prisma.analysisFile.findMany({
            where: { patientId, labId: lab.id },
            orderBy: { uploadedAt: 'desc' },
            skip: (page - 1) * perPage,
            take: perPage,
        });
        const totalAnalysisCount = await this.prisma.analysisFile.count({
            where: { patientId, labId: lab.id },
        });
        return {
            patient,
            recentAnalysis,
            totalAnalysisCount,
            page,
            perPage,
            totalPages: Math.ceil(totalAnalysisCount / perPage),
        };
    }
    async deleteAnalysisFile(labUid, fileId) {
        const lab = await this.prisma.lab.findFirst({
            where: { user: { uid: labUid } },
        });
        if (!lab)
            throw new common_1.NotFoundException('Lab not found');
        const file = await this.prisma.analysisFile.findUnique({
            where: { id: fileId },
        });
        if (!file)
            throw new common_1.NotFoundException('File not found');
        if (file.labId !== lab.id)
            throw new Error('Unauthorized to delete this file');
        return this.prisma.analysisFile.delete({
            where: { id: fileId },
        });
    }
};
exports.LabsService = LabsService;
exports.LabsService = LabsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LabsService);
//# sourceMappingURL=labs.service.js.map