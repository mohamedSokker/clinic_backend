import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendOtpEmail(email: string, otp: string) {
    const mailOptions = {
      from: `"Vitreous Precision" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: 'Vitreous Lab - Secure Access Key Recovery',
      html: `
        <div style="font-family: 'Inter', sans-serif; background-color: #070e1a; color: #e5ebfd; padding: 40px; border-radius: 16px; max-width: 600px; margin: auto; border: 1px solid rgba(64, 206, 243, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #40cef3; margin: 0; font-size: 24px; letter-spacing: 2px;">VITREOUS LAB</h1>
            <p style="color: rgba(255,255,255,0.4); font-size: 10px; margin-top: 5px; letter-spacing: 1px;">SECURE PRECISION SYSTEMS</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.03); padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
            <h2 style="font-size: 18px; margin-top: 0;">Access Key Recovery</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #a4abbc;">
              We received a request to reset your clinical access credentials. Use the secure authorization code below to proceed with the recovery protocol.
            </p>
            
            <div style="background: #40cef3; color: #002a34; font-size: 32px; font-weight: 800; text-align: center; padding: 20px; border-radius: 8px; margin: 30px 0; letter-spacing: 10px;">
              ${otp}
            </div>
            
            <p style="font-size: 12px; color: rgba(255,255,255,0.3); text-align: center;">
              This code is valid for 10 minutes. If you did not request this recovery, please ignore this message and ensure your account security.
            </p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; font-size: 11px; color: rgba(255,255,255,0.2);">
            <p>© 2026 Vitreous Precision Health Systems. All rights reserved.</p>
            <p>Encrypted Session • TLS 1.3 Transmission</p>
          </div>
        </div>
      `,
    };

    try {
      console.log(`[MailService] Attempting to send OTP email to: ${email}`);
      await this.transporter.sendMail(mailOptions);
      console.log(`[MailService] OTP email sent successfully to: ${email}`);
    } catch (error) {
      console.error(`[MailService] Failed to send OTP email to: ${email}`, error);
    }
  }
}
