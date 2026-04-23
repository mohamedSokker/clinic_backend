"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let MailService = class MailService {
    configService;
    transporter;
    constructor(configService) {
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
    }
    async sendOtpEmail(email, otp) {
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
        }
        catch (error) {
            console.error(`[MailService] Failed to send OTP email to: ${email}`, error);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map