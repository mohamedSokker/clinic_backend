import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { FirebaseService } from '../firebase/firebase.service';
export declare class AuthService {
    private prisma;
    private mailService;
    private firebase;
    constructor(prisma: PrismaService, mailService: MailService, firebase: FirebaseService);
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    verifyOtp(email: string, otp: string): Promise<{
        message: string;
    }>;
    resetPassword(email: string, otp: string, newPassword: string): Promise<{
        message: string;
    }>;
}
