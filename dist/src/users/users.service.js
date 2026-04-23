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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        const { uid, email, role, name, mobile, photoURL, ...profileData } = createUserDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            if (existingUser.uid !== uid) {
                return this.prisma.user.update({
                    where: { email },
                    data: { uid, name, mobile, photoURL },
                    include: { patient: true, doctor: true, lab: true },
                });
            }
            return existingUser;
        }
        return this.prisma.user.create({
            data: {
                uid,
                email,
                role,
                name,
                mobile,
                photoURL,
                [role]: {
                    create: profileData,
                },
            },
            include: {
                patient: true,
                doctor: true,
                lab: true,
            },
        });
    }
    async findByUid(uid) {
        const user = await this.prisma.user.findUnique({
            where: { uid },
            include: {
                patient: true,
                doctor: true,
                lab: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async update(uid, updateUserDto) {
        const user = await this.findByUid(uid);
        const { name, mobile, photoURL, fcmToken, uid: _uid, role: _role, email: _email, ...profileData } = updateUserDto;
        return this.prisma.user.update({
            where: { uid },
            data: {
                name,
                mobile,
                photoURL,
                fcmToken,
                [user.role]: {
                    update: profileData,
                },
            },
            include: {
                patient: true,
                doctor: true,
                lab: true,
            },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map