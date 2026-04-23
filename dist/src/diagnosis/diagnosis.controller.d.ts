import { DiagnosisService } from './diagnosis.service';
export declare class DiagnosisController {
    private readonly diagnosisService;
    constructor(diagnosisService: DiagnosisService);
    create(req: any, createDiagnosisDto: any): Promise<{
        analysisFiles: {
            id: string;
            type: string;
            url: string;
            fileName: string;
            uploadedAt: Date;
            labId: string | null;
            diagnosisId: string;
        }[];
        vaccines: {
            name: string;
            id: string;
            date: string;
            dose: string | null;
            nextDueDate: string | null;
            diagnosisId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        doctorId: string;
        patientId: string;
        reservationId: string;
        notes: string;
        prescriptions: string | null;
        nextVisitDate: Date | null;
        visitDate: Date;
    }>;
    findForPatient(req: any): Promise<({
        doctor: {
            user: {
                uid: string;
                email: string;
                role: import("@prisma/client").$Enums.UserRole;
                name: string;
                mobile: string;
                photoURL: string | null;
                id: string;
                fcmToken: string | null;
                createdAt: Date;
                updatedAt: Date;
                resetPasswordOtp: string | null;
                resetPasswordExpires: Date | null;
            };
        } & {
            id: string;
            userId: string;
            clinicName: string | null;
            doctorName: string | null;
            location: string | null;
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
        analysisFiles: {
            id: string;
            type: string;
            url: string;
            fileName: string;
            uploadedAt: Date;
            labId: string | null;
            diagnosisId: string;
        }[];
        vaccines: {
            name: string;
            id: string;
            date: string;
            dose: string | null;
            nextDueDate: string | null;
            diagnosisId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        doctorId: string;
        patientId: string;
        reservationId: string;
        notes: string;
        prescriptions: string | null;
        nextVisitDate: Date | null;
        visitDate: Date;
    })[]>;
    addAnalysisFile(req: any, fileData: any): Promise<{
        id: string;
        type: string;
        url: string;
        fileName: string;
        uploadedAt: Date;
        labId: string | null;
        diagnosisId: string;
    }>;
}
