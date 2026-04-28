import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ReservationsService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    findOne(id: string): Promise<any>;
    create(userId: string, createReservationDto: any): Promise<any>;
    findForDoctor(identifier: string, date?: string, isInternalId?: boolean): Promise<any>;
    findPaginatedForDoctor(identifier: string, date?: string, page?: number, perPage?: number, nextOnly?: boolean): Promise<{
        reservations: any;
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    }>;
    findForLab(labId: string, date?: string): Promise<any>;
    findForPatient(userId: string): Promise<any>;
    findPaginatedForPatient(userId: string, page?: number, perPage?: number): Promise<{
        reservations: any;
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    }>;
    getLiveQueueForPatient(userId: string, requestedDoctorId?: string): Promise<{
        clinicInfo: null;
        queue: never[];
        myPatientId: string;
    } | {
        clinicInfo: {
            doctorName: string | undefined;
            clinicName: string | null | undefined;
        };
        queue: {
            id: string;
            patientId: string;
            queuePosition: number;
            status: import("@prisma/client").$Enums.ReservationStatus;
            expectedTime: Date | null;
            dateTime: Date;
            entryTime: Date | null;
            exitTime: Date | null;
            isEmergency: boolean;
            durationMinutes: number | null;
        }[];
        myPatientId: string;
    }>;
    updateStatus(id: string, statusData: any): Promise<{
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
    }>;
    private shiftQueue;
    findUpcomingForPatient(userId: string): Promise<any>;
    private formatReservation;
}
