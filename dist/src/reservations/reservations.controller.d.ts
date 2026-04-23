import { ReservationsService } from './reservations.service';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    create(req: any, createReservationDto: any): Promise<{
        patient: {
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
            dateOfBirth: string | null;
            bloodType: string | null;
        };
        doctor: {
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
    } & {
        id: string;
        createdAt: Date;
        doctorId: string;
        patientId: string;
        dateTime: Date;
        symptoms: string | null;
        isEmergency: boolean;
        status: import("@prisma/client").$Enums.ReservationStatus;
        queuePosition: number;
        entryTime: Date | null;
        exitTime: Date | null;
        transferredFromId: string | null;
        transferredToId: string | null;
        cancelReason: string | null;
        consultationNote: string | null;
    }>;
    findForDoctor(req: any, doctorId?: string, date?: string): Promise<({
        patient: {
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
            dateOfBirth: string | null;
            bloodType: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        doctorId: string;
        patientId: string;
        dateTime: Date;
        symptoms: string | null;
        isEmergency: boolean;
        status: import("@prisma/client").$Enums.ReservationStatus;
        queuePosition: number;
        entryTime: Date | null;
        exitTime: Date | null;
        transferredFromId: string | null;
        transferredToId: string | null;
        cancelReason: string | null;
        consultationNote: string | null;
    })[]>;
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
    } & {
        id: string;
        createdAt: Date;
        doctorId: string;
        patientId: string;
        dateTime: Date;
        symptoms: string | null;
        isEmergency: boolean;
        status: import("@prisma/client").$Enums.ReservationStatus;
        queuePosition: number;
        entryTime: Date | null;
        exitTime: Date | null;
        transferredFromId: string | null;
        transferredToId: string | null;
        cancelReason: string | null;
        consultationNote: string | null;
    })[]>;
    findUpcomingForPatient(req: any): Promise<({
        patient: {
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
            dateOfBirth: string | null;
            bloodType: string | null;
        };
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
    } & {
        id: string;
        createdAt: Date;
        doctorId: string;
        patientId: string;
        dateTime: Date;
        symptoms: string | null;
        isEmergency: boolean;
        status: import("@prisma/client").$Enums.ReservationStatus;
        queuePosition: number;
        entryTime: Date | null;
        exitTime: Date | null;
        transferredFromId: string | null;
        transferredToId: string | null;
        cancelReason: string | null;
        consultationNote: string | null;
    }) | null>;
    updateStatus(id: string, statusData: any): Promise<{
        id: string;
        createdAt: Date;
        doctorId: string;
        patientId: string;
        dateTime: Date;
        symptoms: string | null;
        isEmergency: boolean;
        status: import("@prisma/client").$Enums.ReservationStatus;
        queuePosition: number;
        entryTime: Date | null;
        exitTime: Date | null;
        transferredFromId: string | null;
        transferredToId: string | null;
        cancelReason: string | null;
        consultationNote: string | null;
    }>;
}
