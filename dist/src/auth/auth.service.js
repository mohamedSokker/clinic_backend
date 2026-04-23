"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const firebase_service_1 = require("../firebase/firebase.service");
let AuthService = class AuthService {
    prisma;
    mailService;
    firebase;
    constructor(prisma, mailService, firebase) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.firebase = firebase;
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return {
                message: 'If an account with this email exists, an OTP has been sent.',
            };
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 10);
        await this.prisma.user.update({
            where: { email },
            data: {
                resetPasswordOtp: otp,
                resetPasswordExpires: expiry,
            },
        });
        await this.mailService.sendOtpEmail(email, otp);
        return {
            message: 'If an account with this email exists, an OTP has been sent.',
        };
    }
    async verifyOtp(email, otp) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user || user.resetPasswordOtp !== otp || !user.resetPasswordExpires) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        if (new Date() > user.resetPasswordExpires) {
            throw new common_1.BadRequestException('OTP has expired');
        }
        return { message: 'OTP verified successfully' };
    }
    async resetPassword(email, otp, newPassword) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user || user.resetPasswordOtp !== otp || !user.resetPasswordExpires) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        if (new Date() > user.resetPasswordExpires) {
            throw new common_1.BadRequestException('OTP has expired');
        }
        try {
            await this.firebase.auth.updateUser(user.uid, {
                password: newPassword,
            });
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to update password in authentication system');
        }
        await this.prisma.user.update({
            where: { email },
            data: {
                resetPasswordOtp: null,
                resetPasswordExpires: null,
            },
        });
        return { message: 'Password has been reset successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService,
        firebase_service_1.FirebaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map