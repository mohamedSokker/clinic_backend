import { DiagnosisService } from './diagnosis.service';
export declare class DiagnosisController {
    private readonly diagnosisService;
    constructor(diagnosisService: DiagnosisService);
    create(req: any, createDiagnosisDto: any): Promise<{
        analysisFiles: {
            id: string;
            type: string;
            uploadedAt: Date;
            labId: string | null;
            patientId: string | null;
            diagnosisId: string | null;
            url: string;
            fileName: string;
        }[];
        vaccines: {
            id: string;
            name: string;
            diagnosisId: string;
            date: string;
            dose: string | null;
            nextDueDate: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        doctorId: string;
        patientId: string;
        reservationId: string;
        visitDate: Date;
        notes: string;
        prescriptions: string | null;
        nextVisitDate: Date | null;
    }>;
    findForPatient(req: any, page?: string, perPage?: string): Promise<{
        diagnoses: ({
            analysisFiles: {
                id: string;
                type: string;
                uploadedAt: Date;
                labId: string | null;
                patientId: string | null;
                diagnosisId: string | null;
                url: string;
                fileName: string;
            }[];
            doctor: {
                user: {
                    id: string;
                    name: string;
                    uid: string;
                    email: string;
                    role: import("@prisma/client").$Enums.UserRole;
                    mobile: string;
                    photoURL: string | null;
                    fcmToken: string | null;
                    createdAt: Date;
                    updatedAt: Date;
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
                diagnosisId: string;
                date: string;
                dose: string | null;
                nextDueDate: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            doctorId: string;
            patientId: string;
            reservationId: string;
            visitDate: Date;
            notes: string;
            prescriptions: string | null;
            nextVisitDate: Date | null;
        })[];
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    }>;
    findForSpecificPatient(patientId: string): Promise<({
        analysisFiles: {
            id: string;
            type: string;
            uploadedAt: Date;
            labId: string | null;
            patientId: string | null;
            diagnosisId: string | null;
            url: string;
            fileName: string;
        }[];
        doctor: {
            user: {
                id: string;
                name: string;
                uid: string;
                email: string;
                role: import("@prisma/client").$Enums.UserRole;
                mobile: string;
                photoURL: string | null;
                fcmToken: string | null;
                createdAt: Date;
                updatedAt: Date;
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
            diagnosisId: string;
            date: string;
            dose: string | null;
            nextDueDate: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        doctorId: string;
        patientId: string;
        reservationId: string;
        visitDate: Date;
        notes: string;
        prescriptions: string | null;
        nextVisitDate: Date | null;
    })[]>;
    findForSpecificPatientPaginated(patientId: string, page?: string, perPage?: string): Promise<{
        diagnoses: ({
            analysisFiles: {
                id: string;
                type: string;
                uploadedAt: Date;
                labId: string | null;
                patientId: string | null;
                diagnosisId: string | null;
                url: string;
                fileName: string;
            }[];
            doctor: {
                user: {
                    id: string;
                    name: string;
                    uid: string;
                    email: string;
                    role: import("@prisma/client").$Enums.UserRole;
                    mobile: string;
                    photoURL: string | null;
                    fcmToken: string | null;
                    createdAt: Date;
                    updatedAt: Date;
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
                diagnosisId: string;
                date: string;
                dose: string | null;
                nextDueDate: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            doctorId: string;
            patientId: string;
            reservationId: string;
            visitDate: Date;
            notes: string;
            prescriptions: string | null;
            nextVisitDate: Date | null;
        })[];
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    }>;
    addAnalysisFile(req: any, fileData: any): Promise<{
        id: string;
        type: string;
        uploadedAt: Date;
        labId: string | null;
        patientId: string | null;
        diagnosisId: string | null;
        url: string;
        fileName: string;
    }>;
    findByReservation(reservationId: string): Promise<({
        analysisFiles: {
            id: string;
            type: string;
            uploadedAt: Date;
            labId: string | null;
            patientId: string | null;
            diagnosisId: string | null;
            url: string;
            fileName: string;
        }[];
        vaccines: {
            id: string;
            name: string;
            diagnosisId: string;
            date: string;
            dose: string | null;
            nextDueDate: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        doctorId: string;
        patientId: string;
        reservationId: string;
        visitDate: Date;
        notes: string;
        prescriptions: string | null;
        nextVisitDate: Date | null;
    }) | null>;
}
