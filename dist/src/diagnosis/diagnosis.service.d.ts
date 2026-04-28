import { PrismaService } from '../prisma/prisma.service';
export declare class DiagnosisService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createDiagnosisDto: any): Promise<{
        vaccines: {
            id: string;
            name: string;
            date: string;
            dose: string | null;
            nextDueDate: string | null;
            diagnosisId: string;
        }[];
        analysisFiles: {
            id: string;
            patientId: string | null;
            labId: string | null;
            url: string;
            type: string;
            fileName: string;
            uploadedAt: Date;
            diagnosisId: string | null;
        }[];
    } & {
        id: string;
        visitDate: Date;
        notes: string;
        prescriptions: string | null;
        nextVisitDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        reservationId: string;
        patientId: string;
        doctorId: string;
    }>;
    findForPatient(patientUserId: string, page?: number, perPage?: number): Promise<{
        diagnoses: ({
            doctor: {
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    uid: string;
                    email: string;
                    role: import("@prisma/client").$Enums.UserRole;
                    mobile: string;
                    photoURL: string | null;
                    fcmToken: string | null;
                    resetPasswordOtp: string | null;
                    resetPasswordExpires: Date | null;
                };
            } & {
                id: string;
                userId: string;
                location: string | null;
                latitude: number | null;
                longitude: number | null;
                clinicName: string | null;
                doctorName: string | null;
                specialization: string | null;
                visitCost: number;
                videoConsultCost: number | null;
                inPersonCost: number | null;
                about: string | null;
                badgeTitle: string | null;
                yearsExperience: number | null;
                patientsCount: number | null;
                successRate: number | null;
                specialties: string[];
                rating: number;
                reviewCount: number;
                subscriptionActive: boolean;
                subscriptionExpiry: Date | null;
                schedule: import("@prisma/client/runtime/library").JsonValue | null;
                workingDays: string[];
                slotDurationMinutes: number;
                maxPatientsPerDay: number | null;
            };
            vaccines: {
                id: string;
                name: string;
                date: string;
                dose: string | null;
                nextDueDate: string | null;
                diagnosisId: string;
            }[];
            analysisFiles: {
                id: string;
                patientId: string | null;
                labId: string | null;
                url: string;
                type: string;
                fileName: string;
                uploadedAt: Date;
                diagnosisId: string | null;
            }[];
        } & {
            id: string;
            visitDate: Date;
            notes: string;
            prescriptions: string | null;
            nextVisitDate: Date | null;
            createdAt: Date;
            updatedAt: Date;
            reservationId: string;
            patientId: string;
            doctorId: string;
        })[];
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    }>;
    findForSpecificPatient(patientId: string): Promise<({
        doctor: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                uid: string;
                email: string;
                role: import("@prisma/client").$Enums.UserRole;
                mobile: string;
                photoURL: string | null;
                fcmToken: string | null;
                resetPasswordOtp: string | null;
                resetPasswordExpires: Date | null;
            };
        } & {
            id: string;
            userId: string;
            location: string | null;
            latitude: number | null;
            longitude: number | null;
            clinicName: string | null;
            doctorName: string | null;
            specialization: string | null;
            visitCost: number;
            videoConsultCost: number | null;
            inPersonCost: number | null;
            about: string | null;
            badgeTitle: string | null;
            yearsExperience: number | null;
            patientsCount: number | null;
            successRate: number | null;
            specialties: string[];
            rating: number;
            reviewCount: number;
            subscriptionActive: boolean;
            subscriptionExpiry: Date | null;
            schedule: import("@prisma/client/runtime/library").JsonValue | null;
            workingDays: string[];
            slotDurationMinutes: number;
            maxPatientsPerDay: number | null;
        };
        vaccines: {
            id: string;
            name: string;
            date: string;
            dose: string | null;
            nextDueDate: string | null;
            diagnosisId: string;
        }[];
        analysisFiles: {
            id: string;
            patientId: string | null;
            labId: string | null;
            url: string;
            type: string;
            fileName: string;
            uploadedAt: Date;
            diagnosisId: string | null;
        }[];
    } & {
        id: string;
        visitDate: Date;
        notes: string;
        prescriptions: string | null;
        nextVisitDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        reservationId: string;
        patientId: string;
        doctorId: string;
    })[]>;
    findForSpecificPatientPaginated(patientId: string, page?: number, perPage?: number): Promise<{
        diagnoses: ({
            doctor: {
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    uid: string;
                    email: string;
                    role: import("@prisma/client").$Enums.UserRole;
                    mobile: string;
                    photoURL: string | null;
                    fcmToken: string | null;
                    resetPasswordOtp: string | null;
                    resetPasswordExpires: Date | null;
                };
            } & {
                id: string;
                userId: string;
                location: string | null;
                latitude: number | null;
                longitude: number | null;
                clinicName: string | null;
                doctorName: string | null;
                specialization: string | null;
                visitCost: number;
                videoConsultCost: number | null;
                inPersonCost: number | null;
                about: string | null;
                badgeTitle: string | null;
                yearsExperience: number | null;
                patientsCount: number | null;
                successRate: number | null;
                specialties: string[];
                rating: number;
                reviewCount: number;
                subscriptionActive: boolean;
                subscriptionExpiry: Date | null;
                schedule: import("@prisma/client/runtime/library").JsonValue | null;
                workingDays: string[];
                slotDurationMinutes: number;
                maxPatientsPerDay: number | null;
            };
            vaccines: {
                id: string;
                name: string;
                date: string;
                dose: string | null;
                nextDueDate: string | null;
                diagnosisId: string;
            }[];
            analysisFiles: {
                id: string;
                patientId: string | null;
                labId: string | null;
                url: string;
                type: string;
                fileName: string;
                uploadedAt: Date;
                diagnosisId: string | null;
            }[];
        } & {
            id: string;
            visitDate: Date;
            notes: string;
            prescriptions: string | null;
            nextVisitDate: Date | null;
            createdAt: Date;
            updatedAt: Date;
            reservationId: string;
            patientId: string;
            doctorId: string;
        })[];
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    }>;
    addAnalysisFile(labUserId: string, fileData: any): Promise<{
        id: string;
        patientId: string | null;
        labId: string | null;
        url: string;
        type: string;
        fileName: string;
        uploadedAt: Date;
        diagnosisId: string | null;
    }>;
    findByReservation(reservationId: string): Promise<({
        vaccines: {
            id: string;
            name: string;
            date: string;
            dose: string | null;
            nextDueDate: string | null;
            diagnosisId: string;
        }[];
        analysisFiles: {
            id: string;
            patientId: string | null;
            labId: string | null;
            url: string;
            type: string;
            fileName: string;
            uploadedAt: Date;
            diagnosisId: string | null;
        }[];
    } & {
        id: string;
        visitDate: Date;
        notes: string;
        prescriptions: string | null;
        nextVisitDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        reservationId: string;
        patientId: string;
        doctorId: string;
    }) | null>;
}
