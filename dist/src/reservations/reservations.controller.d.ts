import { ReservationsService } from './reservations.service';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    create(req: any, createReservationDto: any): Promise<any>;
    findForDoctor(req: any, doctorId?: string, date?: string): Promise<any>;
    findPaginatedForDoctor(req: any, date?: string, page?: string, perPage?: string, nextOnly?: string): Promise<{
        reservations: any;
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    }>;
    findPaginatedForLab(req: any, date?: string, page?: string, perPage?: string, nextOnly?: string): Promise<{
        reservations: any;
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    }>;
    findForPatient(req: any): Promise<any>;
    findUpcomingForPatient(req: any): Promise<any>;
    findPaginatedForPatient(req: any, page?: string, perPage?: string): Promise<{
        reservations: any;
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    }>;
    getLiveQueueForPatient(req: any, doctorId?: string): Promise<{
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
    findOne(id: string): Promise<any>;
    findForLab(labId: string, date?: string): Promise<any>;
    updateStatus(id: string, statusData: any): Promise<{
        id: string;
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
        createdAt: Date;
        expectedTime: Date | null;
        tags: string[];
    }>;
}
