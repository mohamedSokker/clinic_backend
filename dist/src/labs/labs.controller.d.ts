import { LabsService } from './labs.service';
export declare class LabsController {
    private readonly labsService;
    constructor(labsService: LabsService);
    findAll(type?: string, query?: string, lat?: string, lng?: string, radius?: string): Promise<({
        user: {
            name: string;
            email: string;
            mobile: string;
            photoURL: string | null;
        };
    } & {
        id: string;
        userId: string;
        labName: string;
        location: string;
        type: string;
        licenseNumber: string | null;
        analysisTypes: import("@prisma/client/runtime/library").JsonValue | null;
        partnershipLevel: string;
        latitude: number | null;
        longitude: number | null;
        isAvailable: boolean;
        workingHours: import("@prisma/client/runtime/library").JsonValue | null;
        accuracy: number;
        avgTurnaroundTime: number;
        description: string | null;
        certifications: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    getDashboard(req: any): Promise<{
        stats: {
            todayTests: number;
            totalTests: number;
            syncIntegrity: number;
        };
        recentUploads: {
            id: string;
            fileName: string;
            uploadedAt: Date;
            type: string;
        }[];
        availableAnalysis: {
            id: any;
            name: any;
            cost: any;
            status: string;
            progress: number;
        }[];
        appointments: {
            id: string;
            time: string;
            date: string;
            patientName: string;
            patientPhoto: string | null;
            patientId: string;
            testType: string;
            status: import("@prisma/client").$Enums.ReservationStatus;
        }[];
    }>;
    getQueue(req: any): Promise<{
        labInfo: {
            id: string;
            name: string;
            accuracy: number;
            avgTurnaroundTime: number;
            crew: {
                id: string;
                name: string;
                role: string;
                photoURL: string | null;
                createdAt: Date;
                labId: string;
                status: string;
            }[];
        };
        stats: {
            totalActive: number;
            pending: number;
            inProgress: number;
            completedToday: number;
        };
        queue: {
            id: string;
            patientName: string;
            patientPhoto: string | null;
            patientId: string;
            tags: string[];
            symptoms: string | null;
            time: Date;
            expectedTime: Date | null;
            status: import("@prisma/client").$Enums.ReservationStatus;
            selectedTest: string | null;
        }[];
    }>;
    getSchedule(req: any): Promise<{
        isAvailable: boolean;
        workingHours: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateSchedule(req: any, body: any): Promise<{
        id: string;
        userId: string;
        labName: string;
        location: string;
        type: string;
        licenseNumber: string | null;
        analysisTypes: import("@prisma/client/runtime/library").JsonValue | null;
        partnershipLevel: string;
        latitude: number | null;
        longitude: number | null;
        isAvailable: boolean;
        workingHours: import("@prisma/client/runtime/library").JsonValue | null;
        accuracy: number;
        avgTurnaroundTime: number;
        description: string | null;
        certifications: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getPatientAnalysis(req: any, patientId: string, page?: string, perPage?: string): Promise<{
        patient: {
            user: {
                name: string;
                email: string;
                mobile: string;
                photoURL: string | null;
            };
        } & {
            id: string;
            userId: string;
            location: string | null;
            latitude: number | null;
            longitude: number | null;
            dateOfBirth: string | null;
            bloodType: string | null;
            bloodPressure: string | null;
            heartRate: string | null;
            glucose: string | null;
            spo2: string | null;
            age: string | null;
            gender: string | null;
            weight: number | null;
            height: number | null;
            allergies: string[];
            chronicConditions: string[];
        };
        recentAnalysis: {
            id: string;
            type: string;
            uploadedAt: Date;
            labId: string | null;
            patientId: string | null;
            diagnosisId: string | null;
            url: string;
            fileName: string;
        }[];
        totalAnalysisCount: number;
        page: number;
        perPage: number;
        totalPages: number;
    }>;
    deleteAnalysisFile(req: any, fileId: string): Promise<{
        id: string;
        type: string;
        uploadedAt: Date;
        labId: string | null;
        patientId: string | null;
        diagnosisId: string | null;
        url: string;
        fileName: string;
    }>;
    findOne(id: string): Promise<{
        user: {
            name: string;
            email: string;
            mobile: string;
            photoURL: string | null;
        };
    } & {
        id: string;
        userId: string;
        labName: string;
        location: string;
        type: string;
        licenseNumber: string | null;
        analysisTypes: import("@prisma/client/runtime/library").JsonValue | null;
        partnershipLevel: string;
        latitude: number | null;
        longitude: number | null;
        isAvailable: boolean;
        workingHours: import("@prisma/client/runtime/library").JsonValue | null;
        accuracy: number;
        avgTurnaroundTime: number;
        description: string | null;
        certifications: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
