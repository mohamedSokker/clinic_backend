import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    sendOtpEmail(email: string, otp: string): Promise<void>;
}
