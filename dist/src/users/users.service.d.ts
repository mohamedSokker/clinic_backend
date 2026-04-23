import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: any): Promise<{
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
    }>;
    findByUid(uid: string): Promise<{
        patient: {
            id: string;
            userId: string;
            dateOfBirth: string | null;
            bloodType: string | null;
        } | null;
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
        } | null;
        lab: {
            id: string;
            userId: string;
            location: string;
            labName: string;
            type: string;
            licenseNumber: string | null;
            analysisTypes: string[];
            partnershipLevel: string;
        } | null;
    } & {
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
    }>;
    update(uid: string, updateUserDto: any): Promise<{
        patient: {
            id: string;
            userId: string;
            dateOfBirth: string | null;
            bloodType: string | null;
        } | null;
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
        } | null;
        lab: {
            id: string;
            userId: string;
            location: string;
            labName: string;
            type: string;
            licenseNumber: string | null;
            analysisTypes: string[];
            partnershipLevel: string;
        } | null;
    } & {
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
    }>;
}
