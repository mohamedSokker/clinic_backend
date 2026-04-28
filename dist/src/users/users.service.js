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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        const { uid, email, role, name, mobile, photoURL, ...profileData } = createUserDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            if (existingUser.uid !== uid) {
                return this.prisma.user.update({
                    where: { email },
                    data: { uid, name, mobile, photoURL },
                    include: { patient: true, doctor: true, lab: true },
                });
            }
            return existingUser;
        }
        return this.prisma.user.create({
            data: {
                uid,
                email,
                role,
                name,
                mobile,
                photoURL,
                [role]: {
                    create: profileData,
                },
            },
            include: {
                patient: true,
                doctor: true,
                lab: true,
            },
        });
    }
    async findByUid(uid) {
        const user = await this.prisma.user.findUnique({
            where: { uid },
            include: {
                patient: {
                    include: {
                        analysisFiles: {
                            orderBy: { uploadedAt: 'desc' },
                        },
                    },
                },
                doctor: true,
                lab: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async update(uid, updateUserDto) {
        const user = await this.findByUid(uid);
        const { name, mobile, photoURL, fcmToken, uid: _uid, role: _role, email: _email, ...profileData } = updateUserDto;
        return this.prisma.user.update({
            where: { uid },
            data: {
                name,
                mobile,
                photoURL,
                fcmToken,
                [user.role]: {
                    update: profileData,
                },
            },
            include: {
                patient: true,
                doctor: true,
                lab: true,
            },
        });
    }
    async updateFcmToken(uid, fcmToken) {
        return this.prisma.user.update({
            where: { uid },
            data: { fcmToken },
        });
    }
    async getPatientActivity(uid, page = 1, perPage = 10) {
        const user = await this.prisma.user.findUnique({
            where: { uid },
            include: { patient: true },
        });
        if (!user?.patient)
            return { events: [], total: 0 };
        const patientId = user.patient.id;
        return this.getPatientActivityByPatientId(patientId, page, perPage);
    }
    async getPatientActivityByPatientId(patientId, page = 1, perPage = 10) {
        const [reservations, diagnoses] = await Promise.all([
            this.prisma.reservation.findMany({
                where: { patientId, status: { not: 'cancelled' } },
                include: { doctor: true, lab: true },
            }),
            this.prisma.diagnosis.findMany({
                where: { patientId },
                include: { doctor: true, analysisFiles: true, vaccines: true },
            }),
        ]);
        const events = [
            ...diagnoses.flatMap((d) => {
                const items = [
                    {
                        id: `diag-${d.id}`,
                        date: d.visitDate,
                        title: d.notes?.split('\n')[0] || 'Consultation Completed',
                        sub: `Dr. ${d.doctor?.doctorName || 'Specialist'}`,
                        type: 'consultation',
                    },
                ];
                if (d.analysisFiles) {
                    d.analysisFiles.forEach((f) => {
                        items.push({
                            id: `file-${f.id}`,
                            date: f.uploadedAt,
                            title: 'Lab Results Uploaded',
                            sub: f.fileName,
                            type: 'file',
                        });
                    });
                }
                if (d.vaccines) {
                    d.vaccines.forEach((v) => {
                        items.push({
                            id: `vax-${v.id}`,
                            date: d.visitDate,
                            title: 'Immunization Recorded',
                            sub: v.name,
                            type: 'medication',
                        });
                    });
                }
                return items;
            }),
            ...reservations.map((r) => ({
                id: `res-${r.id}`,
                date: r.dateTime,
                title: r.labId ? 'Lab Reservation' : 'Doctor Appointment',
                sub: `${r.lab?.labName || r.doctor?.doctorName || 'Main Clinic'} • ${r.status.toUpperCase()}`,
                type: 'reservation',
                status: r.status,
            })),
        ];
        events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const total = events.length;
        const paginatedEvents = events.slice((page - 1) * perPage, page * perPage);
        return {
            events: paginatedEvents,
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        };
    }
    async getPaginatedAnalysis(uid, page = 1, perPage = 3) {
        const user = await this.prisma.user.findUnique({
            where: { uid },
            include: { patient: true },
        });
        if (!user?.patient)
            return { files: [], total: 0 };
        const patientId = user.patient.id;
        return this.getPaginatedAnalysisByPatientId(patientId, page, perPage);
    }
    async getPaginatedAnalysisByPatientId(patientId, page = 1, perPage = 3) {
        const [files, total] = await Promise.all([
            this.prisma.analysisFile.findMany({
                where: { patientId },
                include: { lab: true, diagnosis: { include: { doctor: true } } },
                orderBy: { uploadedAt: 'desc' },
                skip: (page - 1) * perPage,
                take: perPage,
            }),
            this.prisma.analysisFile.count({
                where: { patientId },
            }),
        ]);
        return {
            files,
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        };
    }
    async deleteAnalysisFile(uid, fileId) {
        const user = await this.prisma.user.findUnique({
            where: { uid },
            include: { patient: true, lab: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const file = await this.prisma.analysisFile.findUnique({
            where: { id: fileId },
        });
        if (!file)
            throw new common_1.NotFoundException('File not found');
        const isLab = user.lab && file.labId === user.lab.id;
        const isPatient = user.patient && file.patientId === user.patient.id;
        if (!isLab && !isPatient) {
            throw new common_1.ForbiddenException('Unauthorized to delete this file');
        }
        return this.prisma.analysisFile.delete({
            where: { id: fileId },
        });
    }
    async getPatientFullProfile(patientId) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId },
            include: {
                user: true,
                analysisFiles: { orderBy: { uploadedAt: 'desc' }, take: 3 }
            }
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        const [reservations, diagnosesData] = await Promise.all([
            this.prisma.reservation.findMany({
                where: { patientId },
                include: {
                    doctor: { include: { user: true } },
                    lab: { include: { user: true } }
                },
                orderBy: { dateTime: 'desc' }
            }),
            this.prisma.diagnosis.findMany({
                where: { patientId },
                include: {
                    doctor: { include: { user: true } },
                    analysisFiles: { include: { lab: true } },
                    vaccines: true
                },
                orderBy: { visitDate: 'desc' },
                take: 3
            })
        ]);
        return {
            profile: { ...patient.user, patient },
            reservations,
            diagnoses: diagnosesData
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map