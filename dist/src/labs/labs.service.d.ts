import { PrismaService } from '../prisma/prisma.service';
export declare class LabsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(type?: string, query?: string, lat?: number, lng?: number, radius?: number): Promise<({
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
    getDashboardData(firebaseUid: string): Promise<{
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
            patientName: string;
            patientPhoto: string | null;
            testType: string;
            patient: {
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
            id: string;
            createdAt: Date;
            doctorId: string | null;
            labId: string | null;
            patientId: string;
            dateTime: Date;
            status: import("@prisma/client").$Enums.ReservationStatus;
            queuePosition: number;
            selectedTest: string | null;
            symptoms: string | null;
            entryTime: Date | null;
            exitTime: Date | null;
            isEmergency: boolean;
            transferredFromId: string | null;
            transferredToId: string | null;
            cancelReason: string | null;
            consultationNote: string | null;
            expectedTime: Date | null;
            tags: string[];
        }[];
    }>;
    getQueueData(firebaseUid: string): Promise<{
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
    getSchedule(firebaseUid: string): Promise<{
        isAvailable: boolean;
        workingHours: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateSchedule(firebaseUid: string, data: {
        workingHours: any;
        isAvailable?: boolean;
    }): Promise<{
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
    getPatientAnalysis(labUid: string, patientId: string, page?: number, perPage?: number): Promise<{
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
    deleteAnalysisFile(labUid: string, fileId: string): Promise<{
        id: string;
        type: string;
        uploadedAt: Date;
        labId: string | null;
        patientId: string | null;
        diagnosisId: string | null;
        url: string;
        fileName: string;
    }>;
}
