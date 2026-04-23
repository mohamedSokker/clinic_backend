import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private firebase: FirebaseService,
  ) {}

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security reasons, don't reveal if a user exists
      return {
        message: 'If an account with this email exists, an OTP has been sent.',
      };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); // 10 minutes expiry

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

  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.resetPasswordOtp !== otp || !user.resetPasswordExpires) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('OTP has expired');
    }

    return { message: 'OTP verified successfully' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.resetPasswordOtp !== otp || !user.resetPasswordExpires) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('OTP has expired');
    }

    // Update password in Firebase
    try {
      await this.firebase.auth.updateUser(user.uid, {
        password: newPassword,
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to update password in authentication system',
      );
    }

    // Clear OTP
    await this.prisma.user.update({
      where: { email },
      data: {
        resetPasswordOtp: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Password has been reset successfully' };
  }
}
